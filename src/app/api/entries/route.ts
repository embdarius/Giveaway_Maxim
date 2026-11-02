import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { productionDependencies, registerEntry } from "@/lib/server/entries";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const respond = (body: object, status: number, retryAfter?: number) =>
    NextResponse.json(body, {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
      },
    });
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([request.nextUrl.origin]);
  if (process.env.NEXT_PUBLIC_SITE_URL)
    allowedOrigins.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
  // NextURL normalizes 127.0.0.1 to localhost; retain the browser's actual Host too.
  const host = request.headers.get("host");
  const forwardedProtocol = process.env.VERCEL
    ? request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim()
    : undefined;
  const protocol = forwardedProtocol === "https" || forwardedProtocol === "http"
    ? `${forwardedProtocol}:` : request.nextUrl.protocol;
  if (host) {
    try { allowedOrigins.add(new URL(`${protocol}//${host}`).origin); }
    catch { return respond({ ok: false, message: "Adresa cererii nu este validă." }, 400); }
  }
  if (origin && !allowedOrigins.has(origin))
    return respond(
      {
        ok: false,
        message: "Trimite formularul direct de pe site-ul La MAXIM.",
      },
      403,
    );
  if (!request.headers.get("content-type")?.includes("application/json"))
    return respond(
      { ok: false, message: "Formatul cererii nu este acceptat." },
      415,
    );
  // Stream with a hard cap rather than trusting a forgeable Content-Length.
  const reader = request.body?.getReader();
  if (!reader)
    return respond(
      { ok: false, message: "Completează formularul înainte de trimitere." },
      400,
    );
  let text = "";
  let bytes = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        return respond({ ok: false, message: "Cererea este prea mare." }, 413);
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } catch {
    return respond(
      { ok: false, message: "Cererea nu a putut fi citită. Încearcă din nou." },
      400,
    );
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return respond(
      { ok: false, message: "Cererea nu a putut fi citită. Încearcă din nou." },
      400,
    );
  }
  // Vercel overwrites x-forwarded-for; local development uses a shared local bucket.
  const ip = process.env.VERCEL
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    : "127.0.0.1";
  const result = await registerEntry(body, ip, productionDependencies());
  return respond(result.body, result.status, result.retryAfter);
}
