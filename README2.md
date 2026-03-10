Assignment 3 - Native Functions (CloudNotes)

Implementerte krav

Kamera-integrasjon

* Appen ber om og håndterer tilgang til kamera og bildegalleri.
* Brukeren kan enten:
  * ta et nytt bilde i appen
  * eller åpne bildegalleri / systemets bildevelger
* Valgt bilde vises i en forhåndsvisning før lagring.

Storage og validering

* Bildet valideres på klientsiden før opplasting.
* Appen sjekker at filen er under 15 MB.
* Appen tillater kun bildeformater: JPG, PNG og WebP.
* Bildet lastes opp til Supabase Storage i bucket `note-images`.
* Hvert bilde får et unikt filnavn for å unngå overskriving.
* URL til opplastet bilde lagres i `notes`-tabellen i feltet `image_url`.

UI / UX

* Under lagring/opplasting vises loading state med spinner.
* Lagre-knappen er deaktivert mens opplasting pågår.
* Bilder vises sammen med notatene uten å bli strukket.
* Appen viser tydelige feilmeldinger ved:
  * tom tittel eller tekst
  * ugyldig filtype
  * for stor fil
  * opplastingsfeil

Notifikasjoner

* Appen ber om tillatelse til notifikasjoner.
* Etter at et notat lagres, sendes en lokal notifikasjon til brukeren.
* Notifikasjonen inneholder tittelen på notatet, gitt ved:

  * `Nytt notat: [notattittel]`

Hva videoen viser

Videoen demonstrerer:

* oppretting av nytt notat
* bruk av kamera
* forhåndsvisning av bilde før lagring
* lagring av notat med bilde
* visning av notat med bilde i notatlisten
* notifikasjon etter lagring
* validering / feilmelding ved ugyldig input

Teknologi brukt

* Expo / React Native
* Expo Image Picker
* Expo Notifications
* Supabase (Database + Storage)


Merknad

På Android-emulator brukes systemets bildevelger for galleri. Emulatoren kan være tom for bilder, men funksjonen åpner fortsatt bildegalleriet korrekt. Kamera-funksjonen ble brukt for å demonstrere full bildeopplasting i videoen.
