# La MAXIM — Giveaway

Next.js App Router, React, TypeScript, Supabase/Postgres. Pagina și documentele sunt în română. Fotografiile originale sunt în `public/images`.

## Pornire locală

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Deschide http://127.0.0.1:3000. Formularul este vizibil și poate fi verificat; fără configurarea reală, serverul răspunde cu o eroare de indisponibilitate, fără a inventa o înscriere reușită.

## Configurarea Supabase

1. Creează proiectul Supabase, preferabil într-o regiune apropiată de participanți.
2. Execută `supabase/migrations/202611020001_giveaway.sql` în SQL Editor (o singură dată) sau prin Supabase CLI. Migrarea este tranzacțională. Creează campania dezactivată, tabelul privat de înscrieri și funcția atomică de înregistrare.
3. Completează `SUPABASE_URL` și `SUPABASE_SECRET_KEY` în `.env.local` și apoi în Vercel. Folosește cheia server secretă; cheia legacy `service_role` este de asemenea acceptată de client. Nu folosi prefixul `NEXT_PUBLIC_` pentru secrete.
4. Generează `RATE_LIMIT_SECRET` (cel puțin 32 de caractere):

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Înregistrările sunt vizibile doar organizatorului în Supabase → Table Editor → `giveaway_entries`. De acolo poți exporta datele pentru extragerea gestionată separat. Nu există listă publică sau interfață de administrare în site.

## Finalizarea conținutului și activarea înscrierilor

- Editează `src/lib/campaign.ts`: textul final al premiului, versiunile documentelor și, dacă e nevoie, intervalul. Deadline exclusiv: `2026-12-03T00:00:00+02:00`, adică participare inclusiv pe 2 decembrie până la 23:59, ora României.
- Completează toate valorile `[De completat]` din `src/content/legal.ts`. Verifică textele din `/regulament` și `/confidentialitate`, inclusiv configurația furnizorilor și transferurile de date. Textele inițiale sunt șabloane provizorii, nu documente juridice finalizate.
- Completează `ORGANIZER_NAME`, `ORGANIZER_ADDRESS`, `ORGANIZER_CONTACT_EMAIL`, `DATA_RETENTION_DESCRIPTION`.
- Setează `LEGAL_DOCUMENTS_APPROVED=true` numai după confirmarea documentelor. Acest indicator și câmpurile organizatorului controlează marcarea documentelor ca finale; nu blochează conectarea formularului la baza de date. Înscrierile funcționează când cele trei secrete server sunt configurate și campania este activă în Supabase.
- Activează campania în Supabase numai când ești gata să primești înscrieri:

```sql
update public.giveaway_campaigns
set enabled = true
where id = 'la-maxim-2026';
```

Dacă schimbi intervalul sau versiunile documentelor în cod, actualizează și `giveaway_campaigns` cu aceleași valori. Baza de date verifică independent perioada, activarea și versiunile documentelor. Pentru oprire imediată setează `enabled=false`.

Mesajul „Înscrierile nu sunt disponibile încă” indică lipsa configurării server (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `RATE_LIMIT_SECRET` de minimum 32 de caractere) sau o campanie dezactivată. Pe Vercel, variabilele trebuie adăugate în proiect și urmate de redeploy; `.env.local` nu este trimis în GitHub.

## Publicare pe Vercel

1. Pune proiectul într-un repository Git și importă-l în Vercel. Framework: **Next.js**, Build command: `npm run build`.
2. Adaugă variabilele din `.env.example` în environment-ul Production. Setează `NEXT_PUBLIC_SITE_URL` la URL-ul public real, fără slash final.
3. Fă deploy. După modificarea variabilelor de mediu, fă redeploy. Pentru preview-uri, păstrează înscrierile dezactivate sau folosește un proiect Supabase separat de test.
4. Verifică înscrierea controlată, înregistrarea din Table Editor și respingerea duplicatelor înainte de distribuirea linkului. Participantul primește același mesaj pentru un număr deja înscris, fără modificarea înscrierii inițiale.

Fonturile sunt livrate local prin `@fontsource`; build-ul și vizitatorii nu au nevoie de Google Fonts. Imaginile sunt optimizate de Next.js.

## Protecția înscrierilor

Validare Zod pe client și server, normalizare E.164 cu `libphonenumber-js`, limită de 8 KB pentru corpul cererii, honeypot, verificare Origin, limită persistentă de 5 cereri valide per IP/campanie într-o fereastră fixă de 15 minute. Identificatorii IP sunt HMAC-SHA256 cu secret server, nu IP-uri brute. Pe Vercel se folosește antetul `x-forwarded-for` suprascris de platformă; pe alte platforme adaptează sursa IP la proxy-ul de încredere. În dezvoltare, toate cererile folosesc același bucket local.

Unicitatea `(campaign_id, phone)` este impusă de PostgreSQL, inclusiv pentru cereri simultane. Tabelele au RLS activ și acces revocat pentru rolurile publice; funcția poate fi executată doar de `service_role`. Nu adăuga politici publice de citire sau scriere. Cererile și erorile bazei de date nu sunt logate de aplicație cu datele participantului.

Înregistrările de rate limit expirate sunt curățate la următoarea înscriere procesată. Pentru curățare și în perioadele fără trafic, programează în Supabase Cron, de exemplu o dată la 15 minute:

```sql
delete from public.giveaway_rate_limits
where window_start < to_timestamp(floor(extract(epoch from now()) / 900) * 900);
```

Organizatorul trebuie să aplice ștergerea datelor participanților conform perioadei de păstrare stabilite în documentele finale.

## Verificări

```powershell
npm test
npm run typecheck
npm run build
```

Cu serverul local pornit, `node tests/http-smoke.mjs` verifică rutele și protecțiile HTTP fără să trimită o înscriere validă.

Testele verifică telefoane locale/internaționale, nume cu diacritice, consimțăminte, versiuni de documente, intervalul exact, honeypot, indisponibilitate și rate limiting. `tests/database.integration.sql` verifică suplimentar migrarea, permisiunile și deduplicarea într-o bază de test, nu în producție.

Fotografiile sunt folosite cu proveniența indicată în `public/images/provenance.json`. Extragerea și contactarea câștigătorului rămân în sarcina organizatorului.
