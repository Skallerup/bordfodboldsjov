# Bordfodbold SJOV ⚽

Kontorets vildeste **statistik-univers** for bordfodbold — et legende, tegneserie-agtigt søster-site
til [Bordfodbold Gazette](https://bordfodbold.bypanduro.dk). Det scraper Gazetten løbende og
forvandler tallene til **animerede spilleransigter**, **sjove grafer** og **badges** baseret på
performance.

![Next.js](https://img.shields.io/badge/Next.js-15-black) ![Vercel](https://img.shields.io/badge/deploy-Vercel-black)

## Hvad er der på siden

| Rute | Indhold |
|------|---------|
| `/` | Forside med stilling, live-ticker, vilde tal, badges & rivaliseringer |
| `/spillere` | Hele truppen som animerede karakterkort |
| `/spillere/[navn]` | Fuld spillerprofil: formkurve, badges, head-to-head, seneste kampe |
| `/badges` | Hædersgalleriet — 12 emblemer (nogle vil man helst undgå) |
| `/statistik` | Aktivitet, spilformer, toplister og rekordtavle |
| `/head-to-head` | Sammenlign to spillere direkte |
| `/kampe` | Kamparkiv med filtre på spilform og spiller |

## Sådan virker det

- **Scraping** (`lib/scrape/`): Gazetten har intet JSON-API, så vi henter de server-renderede
  HTML-sider `/players` og `/matches` og parser dem med Cheerio. Kamparkivet er vores
  primære kilde — næsten alt andet genberegnes fra kampene.
- **Friske data uden database**: Siderne bruger Next.js ISR og re-genereres automatisk hver
  **30. minut** (`REVALIDATE_SECONDS` i `lib/scrape/source.ts`). Historik (formkurver, streaks,
  head-to-head) rekonstrueres ved at genspille kampene.
- **Statistik** (`lib/stats/`): rene funktioner for aggregater, streaks, head-to-head, ELO-genspil
  og en **badge-motor** (`badges.ts`).
- **Ansigter** (`lib/face/` + `components/PlayerFace.tsx`): procedur-genererede SVG-ansigter seedet
  fra spillernavnet, animeret med Framer Motion. Humøret styres af spillerens aktuelle form.

## Kør lokalt

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # produktionsbuild (det Vercel kører)
npm run dump       # sanity-tjek: printer scrapede spillere + kampe
```

## Deploy til Vercel (via GitHub)

Projektet er bygget til at blive hostet på Vercel med automatisk deploy fra git.

1. **Opret GitHub-repo og push** (du er allerede logget ind som `Skallerup`):

   ```bash
   git remote add origin https://github.com/Skallerup/bordfodboldsjov.git
   # ELER lav repoet direkte:
   gh repo create bordfodboldsjov --public --source . --remote origin --push
   ```

2. **Forbind Vercel**: Gå til <https://vercel.com/new>, importér `bordfodboldsjov`, og tryk Deploy.
   Ingen miljøvariabler er nødvendige. Hvert push til `main` deployer automatisk.

   Alternativt via CLI:

   ```bash
   vercel          # første gang: link projektet
   vercel --prod   # deploy til produktion
   ```

## Noter

- Dette er et **uofficielt, kærligt** fan-site. Alle rekorder og data tilhører spillerne og Gazetten.
- Hvis Gazetten ændrer sit HTML-markup, skal kun `lib/scrape/parse.ts` justeres (isoleret parser).
