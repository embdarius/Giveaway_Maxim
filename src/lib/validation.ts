import { parsePhoneNumberFromString } from "libphonenumber-js/max";
import { z } from "zod";

const name = z
  .string()
  .trim()
  .min(2, "Introdu cel puțin două caractere.")
  .max(80, "Folosește cel mult 80 de caractere.")
  .regex(
    /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u,
    "Folosește litere, spații, apostrof sau cratimă.",
  );

export function normalizePhone(value: string): string | null {
  const cleaned = value.trim().replace(/^00/, "+");
  if (!/^[+\d\s().-]+$/.test(cleaned) || cleaned.length > 40) return null;
  const phone = parsePhoneNumberFromString(cleaned, "RO");
  return phone?.isValid() && !phone.ext ? phone.number : null;
}

export const entrySchema = z.object({
  lastName: name,
  firstName: name,
  phone: z
    .string()
    .trim()
    .max(40)
    .transform((value, ctx) => {
      const phone = normalizePhone(value);
      if (!phone) {
        ctx.addIssue({
          code: "custom",
          message:
            "Introdu un număr de telefon valid, cu prefix pentru numerele internaționale.",
        });
        return z.NEVER;
      }
      return phone;
    }),
  acceptedRules: z.literal(true, {
    error: "Acceptă regulamentul pentru a participa.",
  }),
  acknowledgedPrivacy: z.literal(true, {
    error: "Confirmă că ai citit informarea privind datele personale.",
  }),
  rulesVersion: z.string().max(40),
  privacyVersion: z.string().max(40),
  website: z.string().max(200).optional().default(""),
});

export type EntryField =
  "lastName" | "firstName" | "phone" | "acceptedRules" | "acknowledgedPrivacy";
export type FieldErrors = Partial<Record<EntryField, string>>;
export type EntryResponse = {
  ok: boolean;
  message: string;
  errors?: FieldErrors;
  closed?: boolean;
};
