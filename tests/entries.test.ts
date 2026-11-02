import { afterEach, describe, expect, it, vi } from "vitest";
import { campaign, campaignStatus, countdownParts } from "../src/lib/campaign";
import { entrySchema, normalizePhone } from "../src/lib/validation";
import {
  productionDependencies,
  registerEntry,
  type RegistrationDependencies,
} from "../src/lib/server/entries";

const valid = {
  lastName: "Șerban-Pop",
  firstName: "Ana Maria",
  phone: "0722 123 456",
  acceptedRules: true,
  acknowledgedPrivacy: true,
  rulesVersion: campaign.rulesVersion,
  privacyVersion: campaign.privacyVersion,
  website: "",
};
function dependencies(
  overrides: Partial<RegistrationDependencies> = {},
): RegistrationDependencies {
  return {
    now: () => Date.parse("2026-11-15T12:00:00+02:00"),
    ready: true,
    hashIp: () => "a".repeat(64),
    store: vi.fn(async () => "accepted" as const),
    ...overrides,
  };
}

describe("phone and name validation", () => {
  it.each(["0722 123 456", "+40 722 123 456", "0040 722 123 456"])(
    "normalizes %s to the same number",
    (phone) => {
      expect(normalizePhone(phone)).toBe("+40722123456");
    },
  );
  it("accepts international phone numbers", () =>
    expect(normalizePhone("+44 7911 123456")).toBe("+447911123456"));
  it.each([
    "",
    "1234",
    "072212345678",
    "0722x123456",
    "+40722123456 ext 3",
    "123456789012345678901234567890123456789012345",
  ])("rejects %s", (phone) => expect(normalizePhone(phone)).toBeNull());
  it("preserves diacritics, compound names and apostrophes", () => {
    expect(
      entrySchema.parse({
        ...valid,
        lastName: " O’Connor ",
        firstName: " Ștefan-Mihai ",
      }).firstName,
    ).toBe("Ștefan-Mihai");
  });
  it("rejects script, missing consent, and invalid phone", () => {
    const result = entrySchema.safeParse({
      ...valid,
      lastName: "<script>",
      phone: "bad",
      acceptedRules: false,
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining(["lastName", "phone", "acceptedRules"]),
      );
  });
});

describe("campaign deadline", () => {
  it("allows the whole last Romanian day and closes at the exact instant", () => {
    const close = Date.parse(campaign.closesAt);
    expect(new Date(close).toISOString()).toBe("2026-12-02T22:00:00.000Z");
    expect(campaignStatus(close - 1)).toBe("open");
    expect(campaignStatus(close)).toBe("closed");
    expect(campaignStatus(Date.parse(campaign.opensAt) - 1)).toBe("upcoming");
    expect(countdownParts(close + 1000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
});

describe("registration service", () => {
  it("stores only normalized data, versions and the IP hash", async () => {
    const deps = dependencies();
    const response = await registerEntry(valid, "127.0.0.1", deps);
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(deps.store).toHaveBeenCalledWith({
      campaignId: campaign.id,
      lastName: valid.lastName,
      firstName: valid.firstName,
      phone: "+40722123456",
      rulesVersion: campaign.rulesVersion,
      privacyVersion: campaign.privacyVersion,
      ipHash: "a".repeat(64),
    });
  });
  it("blocks direct malformed requests without reaching the database", async () => {
    const deps = dependencies();
    const response = await registerEntry(
      { ...valid, acknowledgedPrivacy: false },
      "ip",
      deps,
    );
    expect(response.status).toBe(400);
    expect(response.body.errors?.acknowledgedPrivacy).toBeTruthy();
    expect(deps.store).not.toHaveBeenCalled();
  });
  it("does not save a honeypot submission", async () => {
    const deps = dependencies();
    await registerEntry({ ...valid, website: "bot.example" }, "ip", deps);
    expect(deps.store).not.toHaveBeenCalled();
  });
  it("does not claim success without live configuration", async () => {
    const deps = dependencies({ ready: false });
    const result = await registerEntry(valid, "ip", deps);
    expect(result.status).toBe(503);
    expect(result.body.ok).toBe(false);
    expect(deps.store).not.toHaveBeenCalled();
  });
  it("rejects expired and not-yet-open requests", async () => {
    for (const now of [
      Date.parse(campaign.closesAt),
      Date.parse(campaign.opensAt) - 1,
    ]) {
      const deps = dependencies({ now: () => now });
      expect((await registerEntry(valid, "ip", deps)).body.ok).toBe(false);
      expect(deps.store).not.toHaveBeenCalled();
    }
  });
  it("requires the current versions of both documents", async () => {
    const deps = dependencies();
    expect(
      (await registerEntry({ ...valid, rulesVersion: "old" }, "ip", deps))
        .status,
    ).toBe(409);
    expect(deps.store).not.toHaveBeenCalled();
  });
  it("preserves an honest failure when storage is unavailable", async () => {
    const result = await registerEntry(
      valid,
      "ip",
      dependencies({
        store: async () => {
          throw new Error("offline");
        },
      }),
    );
    expect(result.status).toBe(503);
    expect(result.body.ok).toBe(false);
  });
  it("returns a retry interval on persistent rate limiting", async () => {
    const result = await registerEntry(
      valid,
      "ip",
      dependencies({ store: async () => "rate_limited" }),
    );
    expect(result.status).toBe(429);
    expect(result.retryAfter).toBe(900);
  });
  it("handles the deadline passing inside the database transaction", async () => {
    const result = await registerEntry(
      valid,
      "ip",
      dependencies({ store: async () => "closed" }),
    );
    expect(result.status).toBe(410);
    expect(result.body.closed).toBe(true);
  });
  it("treats a disabled database campaign as unavailable, not closed", async () => {
    expect(
      (
        await registerEntry(
          valid,
          "ip",
          dependencies({ store: async () => "unavailable" }),
        )
      ).status,
    ).toBe(503);
  });
});

describe("production configuration", () => {
  afterEach(() => vi.unstubAllEnvs());

  function configureStorage() {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "test-server-key");
    vi.stubEnv("RATE_LIMIT_SECRET", "a".repeat(64));
  }

  it("allows a configured registration while legal documents are still drafts", () => {
    configureStorage();
    vi.stubEnv("LEGAL_DOCUMENTS_APPROVED", "false");
    for (const key of [
      "ORGANIZER_NAME",
      "ORGANIZER_ADDRESS",
      "ORGANIZER_CONTACT_EMAIL",
      "DATA_RETENTION_DESCRIPTION",
    ]) vi.stubEnv(key, "");
    expect(productionDependencies().ready).toBe(true);
  });

  it("requires all server credentials regardless of document status", () => {
    configureStorage();
    vi.stubEnv("LEGAL_DOCUMENTS_APPROVED", "true");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    expect(productionDependencies().ready).toBe(false);
  });

  it("does not enable registration with an unsafe rate-limit secret", () => {
    configureStorage();
    vi.stubEnv("RATE_LIMIT_SECRET", "short");
    expect(productionDependencies().ready).toBe(false);
  });
});
