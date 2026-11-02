"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleCheck,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { campaign, campaignStatus } from "@/lib/campaign";
import {
  entrySchema,
  type EntryResponse,
  type FieldErrors,
  type EntryField,
} from "@/lib/validation";
import { Countdown } from "./countdown";

export function EntryForm({ serverNow }: { serverNow: number }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [closed, setClosed] = useState(campaignStatus(serverNow) === "closed");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const result = useRef<HTMLDivElement>(null);
  const markClosed = useCallback(() => setClosed(true), []);
  const upcoming = campaignStatus(serverNow) === "upcoming";
  useEffect(() => {
    if (status === "success") result.current?.focus();
  }, [status]);

  function focusError(fields: FieldErrors) {
    const first = Object.keys(fields)[0];
    if (first)
      form.current
        ?.querySelector<HTMLInputElement>(`[name="${first}"]`)
        ?.focus();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting" || closed || upcoming) return;
    const data = new FormData(event.currentTarget);
    const payload = {
      lastName: data.get("lastName"),
      firstName: data.get("firstName"),
      phone: data.get("phone"),
      acceptedRules: data.get("acceptedRules") === "on",
      acknowledgedPrivacy: data.get("acknowledgedPrivacy") === "on",
      rulesVersion: campaign.rulesVersion,
      privacyVersion: campaign.privacyVersion,
      website: data.get("website") || "",
    };
    const parsed = entrySchema.safeParse(payload);
    setMessage("");
    if (!parsed.success) {
      const nextErrors: FieldErrors = {};
      for (const issue of parsed.error.issues)
        nextErrors[issue.path[0] as EntryField] ??= issue.message;
      setErrors(nextErrors);
      focusError(nextErrors);
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      const body = (await response.json()) as EntryResponse;
      if (response.ok && body.ok) {
        setStatus("success");
        return;
      }
      if (body.closed) setClosed(true);
      setErrors(body.errors || {});
      setMessage(
        body.message || "Nu am putut confirma înscrierea. Încearcă din nou.",
      );
      if (body.errors) focusError(body.errors);
    } catch {
      setMessage(
        "Nu am putut confirma înscrierea. Verifică conexiunea și încearcă din nou; datele tale au rămas completate.",
      );
    }
    setStatus("idle");
  }

  return (
    <section
      id="inscriere"
      className="registration"
      aria-labelledby="registration-title"
    >
      {status === "success" ? (
        <div ref={result} tabIndex={-1} className="success-state" role="status">
          <span className="success-icon">
            <CircleCheck size={32} strokeWidth={1.4} />
          </span>
          <h2 id="registration-title">Ești înscris!</h2>
          <p>Îți ținem pumnii să sărbătorești la MAXIM.</p>
          <span className="success-note">
            O singură înscriere este suficientă. Mult noroc!
          </span>
        </div>
      ) : closed ? (
        <div className="closed-state" role="status">
          <h2 id="registration-title">Înscrierile s-au încheiat.</h2>
          <p>
            Îți mulțumim că ai fost parte din poveste. Extragerea va fi
            gestionată de organizator.
          </p>
        </div>
      ) : (
        <>
          {!upcoming && (
            <Countdown serverNow={serverNow} onClose={markClosed} />
          )}
          <div className="form-heading">
            <h2 id="registration-title">Povestea începe cu tine.</h2>
            <span>Înscriere gratuită</span>
          </div>
          {upcoming && (
            <p className="form-message">
              Înscrierile se deschid pe 2 noiembrie 2026.
            </p>
          )}
          <form
            method="post"
            action="/api/entries"
            onSubmit={submit}
            ref={form}
            noValidate
            aria-busy={status === "submitting"}
          >
            <fieldset disabled={status === "submitting" || upcoming}>
              <legend className="sr-only">
                Date pentru înscrierea la giveaway
              </legend>
              <div className="name-fields">
                <div className="field">
                  <label htmlFor="lastName">Nume</label>
                  <input
                    id="lastName"
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Numele tău"
                    required
                    maxLength={80}
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={
                      errors.lastName ? "lastName-error" : undefined
                    }
                  />
                  {errors.lastName && (
                    <span className="field-error" id="lastName-error">
                      {errors.lastName}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="firstName">Prenume</label>
                  <input
                    id="firstName"
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="Prenumele tău"
                    required
                    maxLength={80}
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={
                      errors.firstName ? "firstName-error" : undefined
                    }
                  />
                  {errors.firstName && (
                    <span className="field-error" id="firstName-error">
                      {errors.firstName}
                    </span>
                  )}
                </div>
              </div>
              <div className="field phone-field">
                <label htmlFor="phone">Număr de telefon</label>
                <div className="phone-input">
                  <span aria-hidden="true">TEL.</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="07xx xxx xxx"
                    maxLength={40}
                    required
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={
                      errors.phone ? "phone-help phone-error" : "phone-help"
                    }
                  />
                </div>
                <span className="field-help" id="phone-help">
                  Pentru numere din afara României, include prefixul de țară.
                </span>
                {errors.phone && (
                  <span className="field-error" id="phone-error">
                    {errors.phone}
                  </span>
                )}
              </div>
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  maxLength={200}
                />
              </div>
              <div className="consents">
                <label className="check-label">
                  <span className="checkbox">
                    <input
                      name="acceptedRules"
                      type="checkbox"
                      required
                      aria-invalid={Boolean(errors.acceptedRules)}
                      aria-describedby={
                        errors.acceptedRules ? "rules-error" : undefined
                      }
                    />
                    <Check size={12} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span>
                    Am citit și accept{" "}
                    <Link href="/regulament" target="_blank" rel="noopener">
                      regulamentul giveaway-ului
                      <span className="sr-only">
                        {" "}
                        (se deschide într-o filă nouă)
                      </span>
                    </Link>
                    .
                  </span>
                </label>
                {errors.acceptedRules && (
                  <span className="field-error" id="rules-error">
                    {errors.acceptedRules}
                  </span>
                )}
                <label className="check-label">
                  <span className="checkbox">
                    <input
                      name="acknowledgedPrivacy"
                      type="checkbox"
                      required
                      aria-invalid={Boolean(errors.acknowledgedPrivacy)}
                      aria-describedby={
                        errors.acknowledgedPrivacy ? "privacy-error" : undefined
                      }
                    />
                    <Check size={12} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span>
                    Am citit{" "}
                    <Link
                      href="/confidentialitate"
                      target="_blank"
                      rel="noopener"
                    >
                      informarea privind datele personale
                      <span className="sr-only">
                        {" "}
                        (se deschide într-o filă nouă)
                      </span>
                    </Link>
                    .
                  </span>
                </label>
                {errors.acknowledgedPrivacy && (
                  <span className="field-error" id="privacy-error">
                    {errors.acknowledgedPrivacy}
                  </span>
                )}
              </div>
              {message && (
                <p className="form-message" role="alert">
                  {message}
                </p>
              )}
              <button
                className="submit-button"
                type="submit"
                disabled={status === "submitting" || upcoming}
              >
                <span>
                  {status === "submitting"
                    ? "Îți salvăm înscrierea…"
                    : "Înscrie-mă la giveaway"}
                </span>
                {status === "submitting" ? (
                  <LoaderCircle
                    className="spinner"
                    size={19}
                    aria-hidden="true"
                  />
                ) : (
                  <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            </fieldset>
          </form>
          <p className="privacy-note">
            <LockKeyhole size={12} strokeWidth={1.5} aria-hidden="true" />
            Datele tale sunt folosite pentru gestionarea giveaway-ului.
          </p>
        </>
      )}
    </section>
  );
}
