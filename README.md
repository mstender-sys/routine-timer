# Routine Timer Card

A visual countdown for daily routines in Home Assistant (school mornings, after school, bedtime), made for wall tablets and Google Nest Hub displays.

- **Several routines per day** (morning, bedtime…) that switch automatically, each with its own days
- A big **shrinking pie** per step ("5 minutes left: brush teeth"), plus a timeline of the whole routine
- **Check-off per person** with their own picture, colour or **photo** — shared between all screens
- **Rewards**: confetti and a fanfare when someone has done everything, and a **star count per week**
- People who are there **every other week**; steps only on **certain days** (gym bag on Wednesday) or for **certain people**
- **Side steps** for one person that run alongside the main steps
- A **full-screen countdown** for the last minutes of a step, with beeps at 1 minute, 30 seconds and the end
- A **sound or a spoken sentence per step** at start and/or end, with its own volume
- **Pause** and **next step** buttons
- **Scripts or scenes per step** (lights on when it is time to get up, radio off when leaving)
- **Phone reminder** when a step was not checked off
- A **status helper** for your own automations (`morning:teeth`, `morning:teeth:ready`, `morning:done`, `idle`)
- **Skip holidays** using a calendar
- **Leave time that follows the traffic** (arrive by 08:30 minus the travel time from e.g. Waze)
- **Clothing advice** for the moment you leave, from your weather forecast
- Everything configurable in the **visual card editor**; English and Dutch

[Nederlandse uitleg staat onderaan.](#nederlands)

## Installation

### HACS (recommended)

1. HACS → ⋮ → **Custom repositories** → add `https://github.com/mstender-sys/routine-timer-card`, category **Dashboard**.
2. Search for **Routine Timer Card**, download it, and reload your browser.

### Manual

Copy `dist/routine-timer-card.js` to `/config/www/` and add it as a dashboard resource:
`/local/routine-timer-card.js` (type: JavaScript module).

## Setup

1. *(recommended)* Create a text helper to share check-offs between screens:
   **Settings → Devices & services → Helpers → Create helper → Text**, name e.g. `Routine check-offs`, **maximum length 255**.
   Without it, check-offs are kept per browser.
2. Add a view of type **Panel (single card)** and add the **Routine Timer Card**. Configure everything in the editor.

## Options

General:

| Option | Default | Description |
| --- | --- | --- |
| `store_entity` | – | `input_text` (max length 255) that stores check-offs, pause/skip and stars, shared by all screens. Without it: per browser |
| `state_entity` | – | `input_text` the card writes its status to: `routine:step`, `routine:step:ready`, `routine:waiting`, `routine:done` or `idle` |
| `notify_service` | – | e.g. `notify.mobile_app_phone`, used by steps with `notify_unchecked` |
| `weather_entity` | – | `weather` entity for clothing advice |
| `tts_engine` | – | `tts.*` entity for spoken texts; without it the browser voice is used |
| `skip_calendar` | – | Calendar; routines are skipped on days with an all-day event (or an event matching `skip_keywords`) |
| `skip_keywords` | – | Comma separated, e.g. `holiday, day off` |
| `sound` | `cast` | `cast` (only Google cast displays), `always` or `off` |
| `volume` | `70` | Default volume (0–100) |
| `warn_minutes` | `5` | Warning beep before a step ends (0 = off) |
| `show_controls` | `true` | Pause and next-step buttons |
| `rewards` | `true` | Confetti and weekly stars |
| `full_height` | `true` | Fill the screen (panel view); `false` = 16:10 card |
| `side_padding` | `24` | Space left and right (px on a 1280 px wide screen), e.g. for navigation arrows |
| `title` | – | Small title in the top right |
| `people` | – | `id`, `name`, `icon`, `color`, `picture` (URL or `person.x`), `alternate_weeks`, `week_start` |
| `routines` | – | See below |

Routine: `id`, `name`, `days`, `end_time`, `end_label`, `done_message`, `arrive_by` + `travel_time_entity` + `travel_margin`
(end time = arrive by − travel time − margin), `skip_on_calendar` (default true), `steps`.

Step: `id`, `name`, `short`, `start`, `icon`, `color`, `checkable`, `big_timer`, `duration` (side step), `people`, `days`,
`sound_start` / `sound_end` (`none`, `chime`, `bell`, `beep`, `double`, `triple`, `fanfare`, `gong`, `voice`), `say_start` / `say_end`,
`volume`, `script_start` / `script_end` (script or scene; scripts get `routine`, `step` and `event` as variables), `notify_unchecked`.

A normal step lasts until the next one starts; the last step lasts until the end time. Older configs with `steps` at the top level still work.

Scripts, notifications and the status are handled by **one** screen: with a `state_entity` the screen that updates the status does it; without one, only cast displays do.
Spoken texts are fetched from Home Assistant and played by the screen itself, so a Nest Hub showing the dashboard is not interrupted.

Extra pictures: `rtc:lion`, `rtc:comb`, `rtc:hairbrush`.

### Example

```yaml
type: custom:routine-timer-card
store_entity: input_text.routine_storage
people:
  - { id: a, name: Alex, icon: mdi:rocket-launch, color: "#3d8fe0" }
  - { id: b, name: Bo, icon: rtc:lion, color: "#43a047", alternate_weeks: true, week_start: "2026-11-23" }
routines:
  - id: morning
    name: Morning
    days: [mon, tue, wed, thu, fri]
    end_time: "08:05"
    end_label: school
    steps:
      - { id: up, name: Get up and dressed, short: get dressed, start: "06:45", icon: mdi:tshirt-crew, big_timer: 3 }
      - { id: eat, name: Breakfast, short: breakfast, start: "07:10", icon: mdi:food-croissant }
      - { id: teeth, name: Brush teeth, short: brush teeth, start: "07:35", icon: mdi:toothbrush, sound_start: voice, say_start: "Time to brush your teeth!" }
      - { id: shoes, name: Shoes and coat on, short: shoes on, start: "08:00", icon: mdi:shoe-sneaker }
```

See [`examples/ochtend-nl.yaml`](examples/ochtend-nl.yaml) for a school morning plus bedtime.

### Tips

- Casting to a Nest Hub: `cast.show_lovelace_view` with the dashboard and view path. Sounds play on the cast display by default.
- Browsers only play sound after the page has been touched once; cast displays play it straight away.
- The theme colour of the background can be changed with the CSS variable `--rtc-background` (e.g. via card-mod).

---

## Nederlands

Een visuele aftelklok voor dagelijkse routines (schoolochtend, na school, bedtijd), gemaakt voor wandtablets en Google Nest Hub-schermen.

- **Meerdere routines per dag** die vanzelf wisselen, elk met eigen dagen
- Een grote **krimpende taart** per stap en een tijdlijn van de hele routine
- **Afvinken per persoon** met eigen plaatje, kleur of **foto**, gedeeld tussen alle schermen
- **Beloning**: confetti en fanfare als iemand alles af heeft, en **sterren per week**
- Personen **om de week**; stappen alleen op **bepaalde dagen** (gymtas op woensdag) of voor **bepaalde personen**
- **Zijstappen** die naast de rest lopen, een **schermvullende aftelklok** met piepjes
- Per stap een **geluid of een stem** bij start en/of eind, met eigen volume
- **Pauze**- en **volgende stap**-knop
- **Scripts of scènes per stap** (lampen aan bij opstaan, radio uit bij vertrek)
- **Melding op je telefoon** als iets niet is afgevinkt
- Een **status-helper** voor je eigen automatiseringen
- **Vakanties overslaan** via een agenda
- **Vertrektijd die het verkeer volgt** (aankomen om 08:30 min de reistijd uit bijvoorbeeld Waze)
- **Kledingadvies** voor het moment van vertrek
- Alles in te stellen in de **kaart-editor**

**Installeren:** HACS → ⋮ → *Aangepaste repositories* → `https://github.com/mstender-sys/routine-timer-card`, categorie *Dashboard* → downloaden → browser herladen.

**Instellen:**
1. Maak een tekst-helper aan (Instellingen → Apparaten & diensten → Helpers → Tekst) met **maximale lengte 255** voor het afvinken en de sterren. Wil je eigen automatiseringen op de routine, maak dan nog een tweede tekst-helper voor de status.
2. Maak een weergave van het type **Paneel (één kaart)** en voeg de **Routine Timer Card** toe. De rest stel je in de editor in.

Een volledig voorbeeld (ochtend en bedtijd) staat in [`examples/ochtend-nl.yaml`](examples/ochtend-nl.yaml).