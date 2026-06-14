# Awesome Time

A highly configurable Cinnamon Desklet that displays **time**, **date**, and **current weather** in a clean, customizable layout.

Awesome Time combines a natural-language clock, optional fuzzy time descriptions, flexible date formatting, and live weather powered by Open-Meteo.

---
<img width="1171" height="277" alt="AwesomeTime" src="https://github.com/user-attachments/assets/58848287-0ee0-45da-8603-139d246bb89f" />

## Features

### Time Display

* Natural language time display
* Examples:

  * `Three o'Clock`
  * `Twenty minutes past Four`
  * `A quarter to Nine`
* Optional **Noon** and **Midnight** labels
* Configurable text case:

  * Normal
  * Uppercase
  * Lowercase
  * Title Case
* Custom prefixes

### Fuzzy Time

Provides more human-friendly descriptions of time.

#### Low

* Exactly Three
* Just after Three
* Almost Four

#### Medium

* Around Three
* About half past Three
* Nearly Four

#### High

* Just gone Three
* A little after Three
* Approaching Four

Three configurable fuzziness levels:

* Low
* Medium
* High

---

### Date Display

* Custom date formatting using GLib date format strings
* Configurable position:

  * Above Time
  * Below Time
* Custom prefixes
* Independent font settings
* Independent colour settings
* Independent text case settings

Example formats:

```text
%A %d %B %Y
```

Output:

```text
Sunday 14 June 2026
```

---

### Weather Display

Current weather is retrieved from Open-Meteo.

Features include:

* Current temperature
* Weather condition text
* Weather icons
* Optional location display

Example:

```text
Sydney, Australia ☀️ 21°C Clear
```

---

### Weather Location Modes

#### Automatic

Automatically detects your location using IP geolocation.

Displays weather for your current location without requiring manual configuration.

#### Manual

Specify:

* City
* Optional Country

Examples:

```text
Sydney
Australia
```

```text
London
United Kingdom
```

Country abbreviations are automatically normalised:

| Input | Converted To         |
| ----- | -------------------- |
| UK    | United Kingdom       |
| USA   | United States        |
| UAE   | United Arab Emirates |

If a city + country lookup fails, Awesome Time automatically retries using the city name only.

---

### Weather Display Options

Location display can be configured as:

* None
* City
* Country
* City, Country

Examples:

```text
21°C Clear
```

```text
Sydney 21°C Clear
```

```text
Australia 21°C Clear
```

```text
Sydney, Australia 21°C Clear
```

---

### Styling Options

Independent styling for:

* Time
* Date
* Weather

Supported options:

* Font family
* Font size
* Colour
* Opacity
* Alignment

---

### Text Effects

Optional text shadow support:

* Enable / Disable shadows
* Shadow colour
* Shadow offset
* Shadow blur

---

## Weather Providers

### Geolocation

Automatic location detection uses:

* IP-API

### Geocoding

Manual location lookups use:

* Open-Meteo Geocoding API

### Weather Data

Current weather is provided by:

* Open-Meteo Forecast API

No API key is required.

---

## Refresh Behaviour

### Time

Updates every minute.

### Weather

Refreshes automatically every 30 minutes.

---

## Requirements

* Linux Mint Cinnamon
* Cinnamon 6.x+
* Internet connection for weather functionality

---

## Installation

1. Copy the desklet folder into:

```text
~/.local/share/cinnamon/desklets/
```

2. Restart Cinnamon:

```bash
cinnamon --replace
```

or reload Cinnamon:

```text
Alt + F2
r
```

3. Add **Awesome Time** from the Cinnamon Desklets manager.

---

## License

MIT License

---

## Author

Martyn

Created for Cinnamon Desktop with a focus on readability, customisation, and natural-language time display.
