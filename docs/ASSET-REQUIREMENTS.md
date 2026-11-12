# DORIS TV: photography asset requirements

The design is image-led. This document lists what photography is in the product today, where it
came from, and exactly what is still needed. **Nothing here is invented**: every credit comes from
the photographer's own Wikimedia Commons record, and anything missing is listed as a requirement,
never filled with an unrelated picture.

## Image principles

- Authentic Nigerian and African film-culture photography: sets, streets and environments,
  screenings and festivals, directors, cinematographers, crew and collaborators.
- Documentary and behind-the-scenes images over staged or generic stock.
- No flags, decorative motifs or stereotypes used as ornament.
- **Photographs are never presented as a specific person or film unless we hold that person's or
  rights-holder's permission.** Captions say what the photograph actually shows.
- Credits are shown only where recorded in `src/data/images.ts`.
- Mock people and films in the product are fictional (the footer says so). Real photographs of
  real people must not be used as portraits of fictional filmmakers.

## In use now (licensed, from Wikimedia Commons)

| Slot | File | Shows | Author | Licence |
|---|---|---|---|---|
| Home hero, 16:9 landscape | `public/images/home/hero-nollywood-set.jpg` | A crew on location with camera operator, tripod and reflector | MediaMOF | CC BY-SA 4.0 |
| Home introduction, 4:5 portrait | `public/images/home/crew-nairobi-railways.jpg` | A film crew shooting at Nairobi Railways, Kenya | Cecimercy Wanza (Ceci) | CC0 |
| Home featured story, Journal cover story and its article header | `public/images/home/fespaco-entrance.jpg` | A camera sculpture at the FESPACO entrance, Ouagadougou | ZIZIEN Rachiratou Nathalie | CC0 |

Pexels stock photographs (Pexels License: free to use, credit given anyway) illustrate five Journal stories in `public/images/journal/`: crew seated between setups, a crew on a street, a Lagos street from above, a camera operator at a monitor (Dar es Salaam) and a Lagos market at sunset. Captions describe only what is shown; the country is stated only where the photographer's title states it. They are editorial illustration, not stills from any film, and are never used as portraits of the fictional filmmakers.

Eleven more Pexels photographs cover the five Journal collection cards (interview filmed in stadium seats, colour-grading suite, camera set-up in Abuja, open-air cinema, camera operator in Kigali), five further stories, and the filmmaker spotlight (a camera operator in Nairobi, shown with the visible note "Illustrative photograph, not a portrait of" the featured filmmaker). A photo that turned out not to be African was removed during review; check any new stock photo's actual location before using it.

Usage: the hero photograph is also cropped differently on the About page; the Nairobi crew
photograph illustrates the featured Community discussion (a craft topic). Mapping of stories to
photographs lives in `src/features/journal/article-image.ts`.

Everything else uses a labelled plate: Journal stories without a photograph show a typographic
cover (`StoryCover`), and filmmakers show an initials plate (`FilmmakerPortrait`).

Source links and the exact credit text live in `src/data/images.ts`. CC BY-SA 4.0 requires
attribution and a licence link, which `PhotoCredit` renders.

Quality note: these are authentic documentary photographs, mostly from Wiki Loves Africa. They are
a good start but not studio-grade. Commissioned or supplied photography should replace them.

## Still needed

Priority 1 (the homepage and Journal depend on these)

| Slot | Ratio | Brief |
|---|---|---|
| Hero (replace or supplement) | 16:9, min 2400px wide | A strong cinematic image from a Nigerian independent production or Lagos environment. Subject in the left or centre third; the lower 40% should tolerate overlaid text. |
| Filmmaker spotlight portrait | 4:5, min 1600px tall | A real portrait of the featured filmmaker, with their written permission. Currently a typographic plate. |
| Journal story covers | 3:2 and 4:5 mix | One image per published story, chosen for that story. Interviews: portrait of the subject. Essays: environment or still. Production notes: on-set. Retrospectives: archival or location. |
| Video conversation stills | 16:9 | A frame from each conversation, supplied by the production. |

Priority 2

| Slot | Ratio | Brief |
|---|---|---|
| Filmmaker directory portraits | 4:5, consistent crop | One portrait per filmmaker with permission. Same framing across the directory. |
| Filmmaker profile hero | 3:2 or 16:9 | A working image: on set, at the monitor, in the edit. |
| About page | 3:2 | Documentary photograph of independent filmmaking in Nigeria. |
| Community / member avatars | 1:1 | Optional; members supply their own. |

## Candidates held in reserve (Wikimedia Commons, not yet downloaded)

Available if you approve them; each needs the same credit handling.

- Dakar "Corona" cinema at night with a crowd (CC BY-SA 3.0, Franck.schneider)
- A film crew around a camera under an umbrella, Awka (CC BY-SA 4.0, Bestvillage)
- A busy street shoot, Nollywood BTS 27 (CC BY-SA 4.0, MediaMOF)

## How to add a photograph

1. Put the file in `public/images/` (web-sized; about 2000px on the long edge, under ~1 MB).
2. Add an entry to `src/data/images.ts` with `alt`, `caption`, `focal` (object-position that keeps
   the subject in the crop) and, if there is a credit, `credit` (author, licence, source link).
3. Render it with `<Photo asset={IMAGES.yourKey} ratio="4/5" />` and, where a credit applies,
   `<PhotoCredit asset={IMAGES.yourKey} />`.
