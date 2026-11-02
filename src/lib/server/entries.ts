import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { campaign, campaignStatus } from "../campaign";
import {
  entrySchema,
  type EntryResponse,
  type FieldErrors,
  type EntryField,
} from "../validation";
import { legalDocumentsReady } from "../../content/legal";

type Result = { status: number; body: EntryResponse; retryAfter?: number };
export type RegistrationInput = {
  campaignId: string;
  lastName: string;
  firstName: string;
  phone: string;
  rulesVersion: string;
  privacyVersion: string;
  ipHash: string;
};
export type RegistrationStore = (
  input: RegistrationInput,
) => Promise<"accepted" | "rate_limited" | "closed" | "unavailable">;
export type RegistrationDependencies = {
  now: () => number;
  ready: boolean;
  hashIp: (ip: string) => string;
  store: RegistrationStore;
};

const success = {
  ok: true,
  message: "Ești înscris! Îți ținem pumnii să sărbătorești la MAXIM.",
};

export async function registerEntry(
  body: unknown,
  ip: string,
  deps: RegistrationDependencies,
): Promise<Result> {
  const status = campaignStatus(deps.now());
  if (status === "closed")
    return {
      status: 410,
      body: {
        ok: false,
        closed: true,
        message: "Înscrierile s-au încheiat. Îți mulțumim pentru interes!",
      },
    };
  if (status === "upcoming")
    return {
      status: 409,
      body: {
        ok: false,
        message: "Înscrierile nu au început încă. Revino în curând.",
      },
    };
  if (!deps.ready)
    return {
      status: 503,
      body: {
        ok: false,
        message:
          "Înscrierile nu sunt disponibile încă. Te rugăm să revii în curând.",
      },
    };
  // A bot gets no indication that the trap was triggered; no record is created.
  if (body && typeof body === "object" && "website" in body && body.website)
    return { status: 200, body: success };
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    const errors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as EntryField;
      if (
        [
          "lastName",
          "firstName",
          "phone",
          "acceptedRules",
          "acknowledgedPrivacy",
        ].includes(field)
      )
        errors[field] ??= issue.message;
    }
    return {
      status: 400,
      body: {
        ok: false,
        message: "Verifică datele marcate și încearcă din nou.",
        errors,
      },
    };
  }
  const data = parsed.data;
  if (
    data.rulesVersion !== campaign.rulesVersion ||
    data.privacyVersion !== campaign.privacyVersion
  ) {
    return {
      status: 409,
      body: {
        ok: false,
        message:
          "Documentele concursului au fost actualizate. Reîncarcă pagina și citește versiunile noi înainte de înscriere.",
      },
    };
  }
  try {
    const result = await deps.store({
      campaignId: campaign.id,
      lastName: data.lastName,
      firstName: data.firstName,
      phone: data.phone,
      rulesVersion: data.rulesVersion,
      privacyVersion: data.privacyVersion,
      ipHash: deps.hashIp(ip),
    });
    if (result === "rate_limited")
      return {
        status: 429,
        retryAfter: 900,
        body: {
          ok: false,
          message:
            "Au fost trimise prea multe cereri. Încearcă din nou peste 15 minute.",
        },
      };
    if (result === "closed")
      return {
        status: 410,
        body: {
          ok: false,
          closed: true,
          message: "Înscrierile s-au încheiat. Îți mulțumim pentru interes!",
        },
      };
    if (result === "unavailable")
      return {
        status: 503,
        body: {
          ok: false,
          message:
            "Înscrierile nu sunt disponibile încă. Te rugăm să revii în curând.",
        },
      };
    // Duplicates receive the same response to avoid exposing a phone's participation.
    return { status: 200, body: success };
  } catch {
    return {
      status: 503,
      body: {
        ok: false,
        message:
          "Nu am putut confirma înscrierea. Datele au rămas în formular; încearcă din nou în câteva momente.",
      },
    };
  }
}

export function productionDependencies(): RegistrationDependencies {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  const secret = process.env.RATE_LIMIT_SECRET;
  const ready = Boolean(
    url && key && secret && secret.length >= 32 && legalDocumentsReady(),
  );
  return {
    now: Date.now,
    ready,
    hashIp: (ip) =>
      createHmac("sha256", secret!)
        .update(`${campaign.id}:${ip}`)
        .digest("hex"),
    store: async (input) => {
      const supabase = createClient(url!, key!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await supabase.rpc("register_giveaway_entry", {
        p_campaign_id: input.campaignId,
        p_last_name: input.lastName,
        p_first_name: input.firstName,
        p_phone: input.phone,
        p_rules_version: input.rulesVersion,
        p_privacy_version: input.privacyVersion,
        p_ip_hash: input.ipHash,
      });
      if (
        error ||
        !["accepted", "rate_limited", "closed", "unavailable"].includes(data)
      )
        throw new Error("Registration storage unavailable");
      return data as "accepted" | "rate_limited" | "closed" | "unavailable";
    },
  };
}
