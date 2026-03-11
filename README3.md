# FastNotes – Assignment 4

## Repository

GitHub repository:
https://github.com/<brukernavn>/CloudNotes

---

## Om prosjektet

FastNotes er en mobil notatapp laget med **React Native og Expo**.
Appen lar brukere logge inn, opprette notater og lagre dem i skyen via **Supabase**.

Brukere kan:

* Opprette notater
* Laste opp bilde til notater
* Redigere og slette egne notater
* Se notater fra databasen

---

## Testing

Prosjektet bruker **Jest** og **React Native Testing Library**.

Testene dekker:

* Opprettelse og navigasjon
* Loader mens data lastes
* Auth guard (beskyttede sider)

For å kjøre testene:

```bash
npm test
```

Alle tester skal passere før appen bygges.

---

## Optimalisering

Appen inneholder flere optimaliseringer:

* **Pagination**: Kun 5 notater lastes om gangen.
* **Last mer-knapp** henter neste 5 notater fra databasen.
* **Auth guard** hindrer tilgang til appen uten innlogging.
* **Console logs** er fjernet for produksjonsklar kode.

---

## Bygge appen

Appen bygges med **Expo EAS Build**.

For å bygge en APK:

```bash
eas build -p android
```

Når builden er ferdig kan APK lastes ned fra Expo build-siden.

---

## Demo

Se vedlagt video (`video.mp4`) som viser:

* Testene som kjører i terminal
* At appen fungerer
* Pagination med **Last mer**
* Opprettelse av notater

---

## Vedlegg

Zip-filen inneholder:

* `CloudNotes.apk`
* `README.md`
* `video.mp4`
