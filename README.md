⏰ Awesome Time Desklet

A highly customizable Cinnamon Desklet that displays time and date in both classic and “fuzzy” conversational formats, with styling options like shadows, prefixes, fonts, and layout control.

✨ Features
🕒 Time display modes
Standard digital → word-based time (e.g. “Quarter past Three”)
Fuzzy time mode:
Low / Medium / High intensity
Phrases like:
“Just after Three”
“Around Three”
“Nearly Four”
“Getting on for half past Three”
📅 Date display
Custom date format using GLib patterns
Optional prefix (e.g. “Today is…”)
Independent formatting options
🎨 Styling
Custom font family + size parsing
Font color control
Adjustable opacity
Optional text shadow:
Color
Offset
Blur
Line spacing control
Date alignment (left / center / right)
⚙️ Layout options
Date above or below time
Show/hide time or date independently
🧠 Smart time features
Optional:
“Midnight” / “Noon” labels
Singular/plural grammar handling
Word-based number conversion (One → Sixty)
⚙️ Settings Overview
Time
Show Time
Font Family
Font Color
Time Prefix
Text Case (normal / UPPER / lower / Title)
Fuzzy Time Mode
Fuzzy Level (low / medium / high)
Date
Show Date
Date Font Family
Date Color
Date Prefix
Date Format (strftime / GLib format)
Date Case
Date Alignment
Date Position (above / below time)
Effects
Text Shadow Enable
Shadow Color
Shadow Offset
Shadow Blur
Font Opacity
Line Spacing
🧠 Fuzzy Time Examples

Depending on intensity:

Time	Output
3:00	Exactly Three
3:02	Just after Three
3:15	Quarter past Three
3:30	Half past Three
3:40	Almost Four
3:50	Nearly Four

High intensity examples:

“Just gone Three”
“Getting on for half past Three”
“Approaching Four”
📦 Installation

Download or clone this repository into:

~/.local/share/cinnamon/desklets/

Restart Cinnamon:

cinnamon --replace

or log out and back in.

Enable the desklet via:
Right-click desktop → Add Desklets
Select Awesome Time
🧩 Compatibility
Cinnamon Desktop Environment (Linux Mint / compatible distros)
Uses:
St (Clutter UI)
GLib
Cinnamon Desklet API
🛠 Technical Notes
Built using Cinnamon Desklet prototype system
Central refresh pipeline via _refresh()
Timer-based updates aligned to minute boundaries
Font parsing supports embedded sizes (e.g. "Sans 24 bold")
💡 Design Philosophy

This desklet is designed to be:

Lightweight
Highly customizable without complexity explosion
Readable both in code and in user configuration
Expressive (especially fuzzy time mode)
🚀 Future Ideas
Weather integration
Background blur / glass panel mode
Animations between minute transitions
Preset themes (minimal / neon / classic)
12/24h toggle for hybrid display modes
