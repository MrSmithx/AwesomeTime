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

        this.timeLabel = new St.Label({
            text: ""
        });

        this.dateLabel = new St.Label({
            text: ""
        });

        this.weatherLabel = new St.Label({
            text: ""
        });

        this.box.add_child(this.timeLabel);
        this.box.add_child(this.dateLabel);
        this.box.add_child(this.weatherLabel);

        this.setContent(this.box);

        // SETTINGS
        this.settings = new Settings.DeskletSettings(
            this,
            metadata.uuid,
            deskletId
        );
        // Time Bindings
        this._bind("show-time", "showTime");
        this._bind("font-family", "fontFamily");
        this._bind("font-color", "fontColor");
        this._bind("time-prefix", "timePrefix");
        this._bind("text-case", "textCase");
        // Fuzzy Time Bindings
        this._bind("fuzzy-time", "fuzzyTime");
        this._bind("fuzzy-level", "fuzzyLevel");
        // Date Bindings
        this._bind("show-date", "showDate");
        this._bind("date-font-family", "dateFontFamily");
        this._bind("date-format", "dateFormat");
        this._bind("date-color", "dateColor");
        this._bind("date-prefix", "datePrefix");
        this._bind("date-case", "dateCase");
        this._bind("use-noon-midnight", "useNoonMidnight");
        this._bind("date-align", "dateAlign");
        this._bind("date-position", "datePosition");
        // Other Bindings
        this._bind("line-spacing", "lineSpacing");
        this._bind("font-opacity", "fontOpacity");
        this._bind("text-shadow-enabled", "shadowEnabled");
        this._bind("text-shadow-color", "shadowColor");
        this._bind("text-shadow-offset", "shadowOffset");
        this._bind("text-shadow-blur", "shadowBlur");

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
    },

    numberToWord: function(number) {
        const ones = [
            "Zero","One","Two","Three","Four",
            "Five","Six","Seven","Eight","Nine",
            "Ten","Eleven","Twelve","Thirteen","Fourteen",
            "Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"
        ];

        const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty"];

        if (number < 20)
            return ones[number];

        const t = Math.floor(number / 10);
        const o = number % 10;

        return o === 0
            ? tens[t]
            : `${tens[t]}-${ones[o]}`;
    },

    getTimePhrase: function() {
        const now = new Date();

        let hour = now.getHours();
        const minute = now.getMinutes();

        hour = hour % 12;
        if (hour === 0)
            hour = 12;

        const nextHour = (hour % 12) + 1;

        const hourWord = this.numberToWord(hour);
        const nextHourWord = this.numberToWord(nextHour);

        // FUZZY MODE
        if (this.fuzzyTime) {
            return this._getFuzzyPhrase(
                hourWord,
                nextHourWord,
                minute
            );
        }

        // NORMAL MODE
        if (minute === 0) {

            if (this.useNoonMidnight) {

                // Midnight
                if (now.getHours() === 0)
                    return "Midnight";

                // Noon
                if (now.getHours() === 12)
                    return "Noon";
            }

            return `${hourWord} o'Clock`;
        }

        if (minute === 15)
            return `A quarter past ${hourWord}`;

        if (minute === 30)
            return `Half past ${hourWord}`;

        if (minute === 45)
            return `A quarter to ${nextHourWord}`;

        if (minute < 30) {
            const m = this.numberToWord(minute);
            return (minute === 1)
                ? `${m} minute past ${hourWord}`
                : `${m} minutes past ${hourWord}`;
        }

        const remaining = 60 - minute;
        const m = this.numberToWord(remaining);

        return (remaining === 1)
            ? `${m} minute to ${nextHourWord}`
            : `${m} minutes to ${nextHourWord}`;
    },

    _normalMinutePhrase: function(hourWord, nextHourWord, minute) {

        if (minute < 30) {
            const m = this.numberToWord(minute);

            return (minute === 1)
                ? `${m} minute past ${hourWord}`
                : `${m} minutes past ${hourWord}`;
        }

        const remaining = 60 - minute;
        const m = this.numberToWord(remaining);

        return (remaining === 1)
            ? `${m} minute to ${nextHourWord}`
            : `${m} minutes to ${nextHourWord}`;
    },

    _getFuzzyPhrase: function(hourWord, nextHourWord, minute) {

        let level = this.fuzzyLevel || "medium";

        // ------------------------
        // LOW (Subtle fuzziness)
        // ------------------------
        if (level === "low") {

            if (minute === 0)
                return `Exactly ${hourWord}`;

            if (minute === 15)
                return `Quarter past ${hourWord}`;

            if (minute === 30)
                return `Half past ${hourWord}`;

            if (minute === 45)
                return `Quarter to ${nextHourWord}`;

            // only slight smoothing near exact times
            if (minute <= 2)
                return `Just after ${hourWord}`;

            if (minute >= 58)
                return `Almost ${nextHourWord}`;

            // fallback to exact wording
            return this._normalMinutePhrase(hourWord, nextHourWord, minute);
        }

        // ------------------------
        // MEDIUM (balanced fuzziness)
        // ------------------------
        if (level === "medium") {

            if (minute === 0)
                return `Exactly ${hourWord}`;

            if (minute === 15)
                return `Quarter past ${hourWord}`;

            if (minute === 30)
                return `Half past ${hourWord}`;

            if (minute === 45)
                return `Quarter to ${nextHourWord}`;

            if (minute > 0 && minute < 7)
                return `Just after ${hourWord}`;

            if (minute >= 7 && minute < 23)
                return `Around ${hourWord}`;

            if (minute >= 23 && minute < 37)
                return `About half past ${hourWord}`;

            if (minute >= 37 && minute < 53)
                return `Almost ${nextHourWord}`;

            return `Nearly ${nextHourWord}`;
        }

        // ------------------------
        // HIGH (very fuzzy)
        // ------------------------
        if (level === "high") {

            if (minute < 5)
                return `Just gone ${hourWord}`;

            if (minute < 15)
                return `A little after ${hourWord}`;

            if (minute < 30)
                return `Getting on for half past ${hourWord}`;

            if (minute < 45)
                return `Past half ${hourWord}`;

            if (minute < 55)
                return `Approaching ${nextHourWord}`;

            return `Nearly ${nextHourWord}`;
        }

        return `${hourWord}`;
    },

    _getDateString: function() {
        try {
            let now = GLib.DateTime.new_now_local();
            return now.format(
                this.dateFormat || "%A %d %B %Y"
            );
        } catch (e) {
            return "Invalid Date Format";
        }
    },

    _update: function() {

        if (this.showTime) {
            this.timeLabel.show();
            this.timeLabel.set_text(
                this._applyTextCase(
                    this._applyTimePrefix(
                        this.getTimePhrase()
                    ),
                    this.textCase
                )
            );
        } else {
            this.timeLabel.hide();
        }

        if (this.showDate) {
            this.dateLabel.show();
            this.dateLabel.set_text(
                this._applyTextCase(
                    this._applyDatePrefix(
                        this._getDateString()
                    ),
                    this.dateCase
                )
            );
        } else {
            this.dateLabel.hide();
        }

        const delay = 60 - new Date().getSeconds();

        if (this._timer) {
            Mainloop.source_remove(this._timer);
            this._timer = null;
        }

        this._timer = Mainloop.timeout_add_seconds(
            delay,
            this._update.bind(this)
        );
    },

    _updateStyle: function() {

        let alignment = this.dateAlign || "left";

        let timeFont = this._parseFont(
            this.fontFamily || "Sans 24",
            24
        );

        let dateFont = this._parseFont(
            this.dateFontFamily || "Sans 14",
            14
        );

        this.timeLabel.style = `
            font-family: "${timeFont.family}";
            font-size: ${timeFont.size}px;
            color: ${this.fontColor};
            text-shadow: ${this._buildShadow()};
        `;

        this.dateLabel.style = `
            font-family: "${dateFont.family}";
            font-size: ${dateFont.size}px;
            color: ${this.dateColor};
            text-align: ${alignment};
            text-shadow: ${this._buildShadow()};
            margin-top: ${(this.lineSpacing || 5)}px;
        `;

        this.timeLabel.opacity = Math.round(
            (this.fontOpacity || 100) * 2.55
        );

        this.dateLabel.opacity = Math.round(
            (this.fontOpacity || 100) * 2.55
        );
    },

    _parseFont: function(fontString, fallbackSize) {

        let sizeMatch = fontString.match(/(\d+)$/);

        let size = sizeMatch
            ? parseInt(sizeMatch[1])
            : fallbackSize;

        let family = fontString
            .replace(/\d+$/, "")
            .replace(/bold|italic|regular/gi, "")
            .trim();

        return {
            family: family || "Sans",
            size: size,
        };
    },

    _applyTextCase: function(text, mode) {

        switch (mode) {

            case "upper":
                return text.toUpperCase();

            case "lower":
                return text.toLowerCase();

            case "title":
                return text.replace(
                    /\w\S*/g,
                    function(word) {
                        return word.charAt(0).toUpperCase() +
                               word.substr(1).toLowerCase();
                    }
                );

            case "normal":
            default:
                return text;
        }
    },

    _buildShadow: function() {

        if (!this.shadowEnabled)
            return "none";

        let color = this.shadowColor || "#000000";
        let offset = this.shadowOffset ?? 2;
        let blur = Math.min(this.shadowBlur ?? 3, 12);

        return `${offset}px ${offset}px ${blur}px ${color}`;
    },

    _applyTimePrefix: function(text) {

        let prefix = (this.timePrefix || "").trim();

        if (!prefix)
            return text;

        return `${prefix} ${text}`;
    },

    _applyDatePrefix: function(text) {

        let prefix = (this.datePrefix || "").trim();

        if (!prefix)
            return text;

        return `${prefix} ${text}`;
    },

    _rebuildLayout: function() {

        let children = this.box.get_children();

        for (let i = 0; i < children.length; i++) {
            this.box.remove_child(children[i]);
        }

        if (this.datePosition === "above") {
            this.box.add_child(this.dateLabel);
            this.box.add_child(this.timeLabel);
        } else {
            this.box.add_child(this.timeLabel);
            this.box.add_child(this.dateLabel);
        }
    },

    on_desklet_removed: function() {
        if (this._timer) {
            Mainloop.source_remove(this._timer);
            this._timer = null;
        }
    }
};

function main(metadata, deskletId) {
    return new AwesomeTime(metadata, deskletId);
}