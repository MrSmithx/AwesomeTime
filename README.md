# Awesome Time

A modern, highly customizable Cinnamon Desklet that displays the current time in natural language, along with optional date, weather, sunrise/sunset information, and animated text transitions.

<img width="1171" height="277" alt="AwesomeTime" src="https://github.com/user-attachments/assets/a8473929-4904-499b-83e9-84a5500f10b8" />

## Features

### Time Display

* Natural language time formatting

  * *Three o'Clock*
  * *Twenty Minutes Past Four*
  * *A Quarter To Five*
  * *Half Past Seven*
* Optional custom prefix
* Multiple text case modes

  * Normal
  * Uppercase
  * Lowercase
  * Title Case
* Adjustable fonts, colors, opacity, and shadows

### Fuzzy Time

Display approximate human-friendly time descriptions.

#### Low

* Exactly Three
* Just After Three
* Almost Four

#### Medium

* Around Three
* About Half Past Three
* Nearly Four

#### High

* Just Gone Three
* Getting On For Half Past Three
* Approaching Four

### Date Display

* Fully customizable date format
* Optional date prefix
* Date above or below time
* Independent font and color settings
* Alignment controls

### Weather Integration

Powered by Open-Meteo.

#### Automatic Location

* Detects location automatically using IP geolocation

#### Manual Location

* Search by city
* Optional country specification

#### Weather Information

* Current temperature
* Weather condition text
* Weather icons
* City and country display options

#### Sunrise & Sunset

* Optional sunrise time
* Optional sunset time
* Separate font and color settings

### Animated Time Transitions

When the displayed time changes, Awesome Time can animate between values using dual-label transitions for smooth rendering.

#### Available Transitions

##### Fade

Subtle fade with slight vertical motion.

<img width="400" height="225" alt="Fade" src="https://github.com/user-attachments/assets/25e464db-0c13-4cd1-9a8b-887fbcb84219" />

##### Crossfade

Outgoing text fades out while incoming text fades in simultaneously.

<img width="400" height="225" alt="Crossfade" src="https://github.com/user-attachments/assets/3e5e9cf9-a086-4888-bc1f-52744eaecb6c" />

##### Slide

Text slides vertically between updates.

<img width="400" height="225" alt="Slide" src="https://github.com/user-attachments/assets/11d4df88-235e-472e-8794-c97c7237b2a5" />

##### Flip X

Card-style flip animation along the X axis.

<img width="400" height="225" alt="Flip X" src="https://github.com/user-attachments/assets/1b0ab479-c31a-4fff-b61e-e6b80ee57843" />

##### Flip Y

Horizontal flip animation along the Y axis.

<img width="400" height="225" alt="Flip Y" src="https://github.com/user-attachments/assets/adf21997-8175-44ce-bfac-a0a3381406e7" />

##### Zoom

Gentle zoom-in transition with easing.

<img width="400" height="225" alt="Zoom" src="https://github.com/user-attachments/assets/56d561c4-1145-44a3-8e5a-5510d482e33d" />

##### None

Instant text update.

### Appearance Controls

* Custom fonts
* Custom colors
* Adjustable opacity
* Background color
* Background opacity
* Rounded corners
* Line spacing control
* Text shadow support
* Shadow blur
* Shadow offset

## Weather Provider

Awesome Time uses:

* Open-Meteo Weather API
* Open-Meteo Geocoding API

No API key is required.

## Installation

1. Download or clone this repository.
2. Copy the folder into:

```
~/.local/share/cinnamon/desklets/
```

3. Restart Cinnamon:

```
Alt + F2
r
```

or log out and back in.

4. Add **Awesome Time** from the Cinnamon Desklet manager.

## Configuration

All settings can be configured directly through the Cinnamon Desklet settings dialog.

### Time

* Show/Hide time
* Time prefix
* Font selection
* Color selection
* Opacity
* Transition effects

### Date

* Show/Hide date
* Custom format string
* Position above/below time
* Alignment

### Weather

* Auto location
* Manual location
* Temperature units
* Weather condition text
* Weather icons
* Sunrise/Sunset display

## Credits

### Weather Data

Open-Meteo

### Location Detection

IP-API

### Built For

Linux Mint Cinnamon Desktop

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files to deal in the Software without restriction.
