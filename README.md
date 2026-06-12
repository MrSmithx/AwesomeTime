# Awesome Time Desklet

A Cinnamon Desklet that displays a highly customizable time and date widget with support for fuzzy time expressions, prefixes, styling options, and flexible formatting.

---
<img width="1275" height="177" alt="AwesomeTime" src="https://github.com/user-attachments/assets/0b589921-cc15-40e5-b69a-58ec1a5c44b1" />


## Features

- Standard and fuzzy time display ("quarter past", "nearly", etc.)
- Optional time and date prefixes
- Independent styling for time and date
- Multiple text case options (normal, UPPERCASE, lowercase, Title Case)
- Custom date format support via GLib
- Shadow effects (color, blur, offset)
- Adjustable opacity
- Configurable layout (date above or below time)
- Automatic refresh every minute

---

## Installation

1. Clone or download this repository
2. Copy the folder to your Cinnamon desklets directory:

```
~/.local/share/cinnamon/desklets/
```

3. Restart Cinnamon:
   - Press `Alt + F2`, type `r`, press Enter (X11 only)
   - Or log out and back in

4. Enable the desklet via:
   **System Settings → Desklets**

---

## Configuration Options

### Time Settings
- Show Time
- Time Prefix
- Font Family
- Font Color
- Text Case (normal / upper / lower / title)

### Date Settings
- Show Date
- Date Prefix
- Date Format (`%A %d %B %Y` etc.)
- Date Font Family
- Date Color
- Date Case
- Date Position (above / below time)
- Date Alignment (left / center / right)

### Fuzzy Time
- Enable fuzzy time mode
- Select fuzziness level:
  - Low
  - Medium
  - High

### Styling
- Text Shadow (enabled/disabled)
- Shadow color
- Shadow offset
- Shadow blur
- Font opacity
- Line spacing

---

## Code

<details>
<summary>Show full source code</summary>

```javascript
const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;
const GLib = imports.gi.GLib;

function AwesomeTime(metadata, deskletId) {
    this._init(metadata, deskletId);
}

AwesomeTime.prototype = {
    __proto__: Desklet.Desklet.prototype,

    _init: function(metadata, deskletId) {
        Desklet.Desklet.prototype._init.call(this, metadata, deskletId);

        this.metadata = metadata;

        this.setHeader("Awesome Time");

        this.box = new St.BoxLayout({
            vertical: true
        });

        this.timeLabel = new St.Label({ text: "" });
        this.dateLabel = new St.Label({ text: "" });

        this.box.add_child(this.timeLabel);
        this.box.add_child(this.dateLabel);

        this.setContent(this.box);

        this.settings = new Settings.DeskletSettings(
            this,
            metadata.uuid,
            deskletId
        );

        this._bind("show-time", "showTime");
        this._bind("font-family", "fontFamily");
        this._bind("font-color", "fontColor");
        this._bind("time-prefix", "timePrefix");

        this._bind("text-shadow-enabled", "shadowEnabled");
        this._bind("text-shadow-color", "shadowColor");
        this._bind("text-shadow-offset", "shadowOffset");
        this._bind("text-shadow-blur", "shadowBlur");

        this._bind("fuzzy-time", "fuzzyTime");
        this._bind("fuzzy-level", "fuzzyLevel");
        this._bind("text-case", "textCase");

        this._bind("show-date", "showDate");
        this._bind("date-font-family", "dateFontFamily");
        this._bind("date-color", "dateColor");
        this._bind("date-prefix", "datePrefix");
        this._bind("date-case", "dateCase");
        this._bind("date-format", "dateFormat");

        this._bind("use-noon-midnight", "useNoonMidnight");
        this._bind("date-position", "datePosition");
        this._bind("date-align", "dateAlign");
        this._bind("line-spacing", "lineSpacing");
        this._bind("font-opacity", "fontOpacity");

        this._refresh();
    },

    _bind: function(key, prop) {
        this.settings.bindProperty(
            Settings.BindingDirection.IN,
            key,
            prop,
            this._refresh.bind(this),
            null
        );
    },

    _refresh: function() {
        this._updateStyle();
        this._rebuildLayout();
        this._update();
    }
};
```

</details>

---

## Notes

- Designed for Cinnamon Desklet API
- Uses GLib for date formatting
- Fully reactive settings system
- Modular update pipeline: `_update → _updateStyle → _rebuildLayout`

---

## License

MIT
