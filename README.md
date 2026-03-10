# IKT205-G 26V - Assignment 2: Cloud Notes

Dette prosjektet er videreutvikling av Cloud Notes for Blodroed Consulting.
Appen bruker Supabase for autentisering og database.


## Krav (avkrysning)

### Autentisering
- [x] **(10%) Sign-up:** Bruker kan opprette konto med e-post og passord (Supabase Auth).
- [x] **(10%) Email template:** Sign-up e-posttemplate er endret i Supabase (Emails → Confirm sign up).
- [x] **(10%) Login/Logout:** Bruker må være logget inn for å få tilgang til appens funksjonalitet (Jobb Notater er låst bak login).
- [x] **(5%) Credentials:** Bruker forblir innlogget etter å lukke/åpne appen igjen (session lagres lokalt av Supabase-klienten).

### Database
- [x] **(5%) Auth-kobling:** Kun innloggede brukere har tilgang til database via RLS policies (applied to: authenticated).
- [x] **(10%) Create:** Bruker kan opprette notat med feltene:
  - `title` (tittel)
  - `content` (tekst)
  - `user_id` (brukeren som opprettet notatet)
  - `updated_at` (tidspunkt sist endret)
- [x] **(10%) Read:** Alle notater fra alle brukere vises i skjermen **"Jobb Notater"** (SELECT for authenticated).
- [x] **(10%) Update:** Bruker kan oppdatere egne notater (RLS: `auth.uid() = user_id`).
- [x] **(10%) Delete:** Bruker kan slette egne notater med bekreftelse før sletting (RLS: `auth.uid() = user_id`).

### Validering
- [x] **(5%) Ingen tomme felter i notater:** Appen hindrer lagring hvis tittel eller tekst er tom, og viser tydelig feilmelding i UI.
- [x] **(5%) Ingen tomme felter i brukernavn og passord:** Appen hindrer login/signup hvis e-post eller passord er tomt, med tydelig feilmelding.
- [x] **(5%) Success:** Appen viser tydelig bekreftelse når notat er lagret/oppdatert/slettet.

### Visualisering
- [x] **(5%) ER-diagram:** `ER-Diagram.png` viser relasjonen mellom Supabase Auth (users) og notes-tabellen.
- [x] **(5%) Sekvensdiagram:** `Sekvens-Diagram.png` viser flyt for å lage et notat (app ↔ auth ↔ database).

## Database sikkerhet (RLS)
Tabellen `public.notes` har Row Level Security aktivert.

Policies:
- SELECT: alle innloggede kan lese alle notater
- INSERT: kun egne notater (`auth.uid() = user_id`)
- UPDATE: kun egne notater (`auth.uid() = user_id`)
- DELETE: kun egne notater (`auth.uid() = user_id`)

## Video
Se `video.mp4` (3–5 min) for demo av:
- Signup/Login/Logout
- CRUD (create/read/update/delete) med oppdatering i database
- Validering og suksessmeldinger
- Bekreftelse før sletting
- RLS-effekt (kun eier kan endre/slette)

