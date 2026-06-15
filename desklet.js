const Desklet = imports.ui.desklet;
const St = imports.gi.St;
const Mainloop = imports.mainloop;
const Settings = imports.ui.settings;
const GLib = imports.gi.GLib;
const Soup = imports.gi.Soup;

function AwesomeTime(metadata, deskletId) {
    this._init(metadata, deskletId);
}

const WEATHER_CODE_MAP = {
    0:  ["☀️", "Clear"],
    1:  ["🌤️", "Mostly Clear"],
    2:  ["🌤️", "Partly Cloudy"],
    3:  ["☁️", "Cloudy"],

    45: ["🌫️", "Fog"],
    48: ["🌫️", "Fog"],

    51: ["🌦️", "Drizzle"],
    53: ["🌦️", "Drizzle"],
    55: ["🌦️", "Drizzle"],

    61: ["🌦️", "Rain"],
    63: ["🌦️", "Rain"],
    65: ["🌦️", "Rain"],

    80: ["🌦️", "Rain Showers"],
    81: ["🌦️", "Rain Showers"],
    82: ["🌦️", "Rain Showers"],

    71: ["❄️", "Snow"],
    73: ["❄️", "Snow"],
    75: ["❄️", "Snow"],
    77: ["❄️", "Snow Grains"],

    85: ["❄️", "Snow Showers"],
    86: ["❄️", "Snow Showers"],

    95: ["⛈️", "Thunderstorm"],
    96: ["⛈️", "Thunderstorm"],
    99: ["⛈️", "Thunderstorm"]
};

const MSG_WEATHER_UNAVAILABLE = "Weather Currently Unavailable";
const MSG_LOCATION_UNAVAILABLE = "Location Currently Unavailable";
const MSG_ENTER_CITY = "Enter a City";
const MSG_LOOKING_UP = "Looking up Location...";
const MSG_DETECTING = "Detecting Location...";
const MSG_NOT_FOUND = "Location Not Found";

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

        this.sunLabel = new St.Label({
            text: ""
        });

        this._current = {
            city: null,
            country: null,
            lat: null,
            lon: null,
            source: null
        };

        this.weatherShowSun = (this.weatherShowSun === undefined)
            ? false
            : this.weatherShowSun;

        this._httpSession = new Soup.Session();

        this.box.add_child(this.timeLabel);
        this.box.add_child(this.dateLabel);
        this.box.add_child(this.weatherLabel);
        this.box.add_child(this.sunLabel);

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
        // Weather Bindings
        this._bind("show-weather", "showWeather");
        this._bind("weather-font-family", "weatherFontFamily");
        this._bind("weather-color", "weatherColor");
        this._bind("weather-case", "weatherCase");
        this._bind("weather-units", "weatherUnits");
        this._bind("weather-show-condition", "weatherShowCondition");
        this._bind("weather-show-icon", "weatherShowIcon");
        this._bind("weather-show-sun", "weatherShowSun");
        this._bind("weather-sun-font-family", "weatherSunFontFamily");
        this._bind("weather-sun-color", "weatherSunColor");
        this._bind("weather-align", "weatherAlign");
        this._bind("weather-city", "weatherCity");
        this._bind("weather-country", "weatherCountry");
        this._bind("weather-location-mode", "weatherLocationMode");
        this._bind("weather-location-display", "weatherLocationDisplay");
        // Other Bindings
        this._bind("line-spacing", "lineSpacing");
        this._bind("font-opacity", "fontOpacity");
        this._bind("text-shadow-enabled", "shadowEnabled");
        this._bind("text-shadow-color", "shadowColor");
        this._bind("text-shadow-offset", "shadowOffset");
        this._bind("text-shadow-blur", "shadowBlur");

        this._refresh();

        this._weatherTimer = Mainloop.timeout_add_seconds(
            1800,
            () => {
                this._updateWeather();
                return true;
            }
        );
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
        this.weatherUnits = (this.weatherUnits || "celsius").toLowerCase();

        let mode = (this.weatherLocationMode || "")
            .toLowerCase()
            .trim();

        if (this._lastMode !== mode) {

            this._current = {
                city: null,
                country: null,
                lat: null,
                lon: null,
                source: null
            };

            this._lastMode = mode;
        }

        this._updateWeather();
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

        if (this._timer) {
            Mainloop.source_remove(this._timer);
            this._timer = null;
        }

        const delay = 60 - new Date().getSeconds();

        Mainloop.timeout_add_seconds(
            delay,
            () => {
                this._update();

                this._timer =
                    Mainloop.timeout_add_seconds(
                        60,
                        () => {
                            this._update();
                            return true;
                        }
                    );

                return false;
            }
        );
    },

    _setLocation: function(city, country, lat, lon, source) {

        this._current.city = city;
        this._current.country = country;
        this._current.lat = lat;
        this._current.lon = lon;
        this._current.source = source;

        this._fetchWeather(lat, lon);
    },

    _detectAutoLocation: function() {

        let message = Soup.Message.new(
            "GET",
            "http://ip-api.com/json/"
        );

        this._httpSession.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session, result) => {

                try {

                    let bytes =
                        session.send_and_read_finish(result);

                    let json =
                        new TextDecoder().decode(bytes.get_data());

                    let data = JSON.parse(json);

                    if (data.status !== "success") {
                        this.weatherLabel.set_text(MSG_LOCATION_UNAVAILABLE);
                        return;
                    }

                    this._setLocation(
                        data.city,
                        data.country,
                        data.lat,
                        data.lon,
                        "auto"
                    );

                } catch (e) {

                    global.logError(e);
                    this.weatherLabel.set_text(MSG_LOCATION_UNAVAILABLE);
                }
            }
        );
    },

    _geocodeLocation: function(city, country) {

        city = (city || "").trim();
        country = (country || "").trim();

        if (!city) {
            this.weatherLabel.set_text(MSG_ENTER_CITY);
            return;
        }

        switch (country.toLowerCase()) {

            case "uk":
                country = "United Kingdom";
                break;

            case "usa":
                country = "United States";
                break;

            case "uae":
                country = "United Arab Emirates";
                break;
        }

        let searchText = city;

        if (country)
            searchText = `${city}, ${country}`;

        let query = encodeURIComponent(searchText);

        let url =
            "https://geocoding-api.open-meteo.com/v1/search" +
            `?name=${query}` +
            "&count=1" +
            "&language=en" +
            "&format=json";

        let message = Soup.Message.new(
            "GET",
            url
        );

        this._httpSession.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session, result) => {

                try {

                    let bytes =
                        session.send_and_read_finish(result);

                    let json =
                        new TextDecoder().decode(
                            bytes.get_data()
                        );

                    let data = JSON.parse(json);

                    // No results returned
                    if (!data.results ||
                        data.results.length === 0) {

                        // Retry city-only even if country was supplied
                        if (country) {

                            this._geocodeLocation(
                                city,
                                ""
                            );

                            return;
                        }

                        this.weatherLabel.set_text(
                            MSG_NOT_FOUND
                        );

                        return;
                    }

                    let loc = data.results[0];

                    this._setLocation(
                        loc.name,
                        loc.country,
                        loc.latitude,
                        loc.longitude,
                        "manual"
                    );

                } catch (e) {

                    global.logError(e);

                    this.weatherLabel.set_text(
                        MSG_LOCATION_UNAVAILABLE
                    );
                }
            }
        );
    },

    _formatLocation: function(city, country) {

        switch (this.weatherLocationDisplay) {

            case "none":
                return "";

            case "city":
                return city || "";

            case "country":
                return country || "";

            case "city-country":
            default:
                if (city && country)
                    return `${city}, ${country}`;

                return city || country || "";
        }
    },

    _updateWeather: function() {

        if (!this.showWeather) {
            this.weatherLabel.hide();
            return;
        }

        this.weatherLabel.show();

        let mode = (this.weatherLocationMode || "")
            .toLowerCase()
            .trim();

        // -----------------------------
        // AUTO MODE
        // -----------------------------
        if (mode === "auto") {

            // Reuse cached auto location if available
            if (this._current.source === "auto" &&
                this._current.lat != null &&
                this._current.lon != null) {

                this._fetchWeather(
                    this._current.lat,
                    this._current.lon
                );

                return;
            }

            this.weatherLabel.set_text(
                MSG_DETECTING
            );

            this._detectAutoLocation();
            return;
        }

        // -----------------------------
        // MANUAL MODE
        // -----------------------------
        let city = (this.weatherCity || "").trim();
        let country = (this.weatherCountry || "").trim();

        if (!city) {
            this.weatherLabel.set_text(
                MSG_ENTER_CITY
            );
            return;
        }

        this.weatherLabel.set_text(
            MSG_LOOKING_UP
        );

        this._geocodeLocation(
            city,
            country
        );
    },

    _fetchWeather: function(lat, lon) {

        if (typeof lat !== "number" ||
            typeof lon !== "number") {

            this.weatherLabel.set_text(MSG_WEATHER_UNAVAILABLE);
            return;
        }

        const unit = (this.weatherUnits || "c").toLowerCase();

        const apiUnit =
            unit === "f"
                ? "fahrenheit"
                : "celsius";

        let url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${lat}` +
            `&longitude=${lon}` +
            `&current=temperature_2m,weather_code` +
            `&temperature_unit=${apiUnit}` +
            `&daily=sunrise,sunset` +
            `&timezone=auto`;

        let message = Soup.Message.new("GET", url);

        this._httpSession.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (session, result) => {

                try {

                    let bytes = session.send_and_read_finish(result);

                    let json = imports.byteArray.toString(bytes.get_data());

                    let data = JSON.parse(json);

                    if (!data.current) {
                        this.weatherLabel.set_text(MSG_WEATHER_UNAVAILABLE);
                        return;
                    }

                    let temp = Math.round(
                        data.current.temperature_2m
                    );

                    let suffix =
                        this.weatherUnits === "f"
                            ? "°F"
                            : "°C";

                    let code = data.current.weather_code;

                    let icon = this._weatherCodeToIcon(code);
                    let condition = this._mapWeatherCode(code);

                    let locationText = this._formatLocation(
                        this._current.city,
                        this._current.country
                    );

                    let sunrise = null;
                    let sunset = null;

                    if (data.daily &&
                        data.daily.sunrise &&
                        data.daily.sunset) {

                        sunrise = data.daily.sunrise[0];
                        sunset = data.daily.sunset[0];
                    }

                    let sunriseText = this._formatTime(sunrise);
                    let sunsetText = this._formatTime(sunset);

                    let sunParts = [];

                    if (sunriseText)
                        sunParts.push(`☀️ ${sunriseText}`);

                    if (sunsetText)
                        sunParts.push(`🌙 ${sunsetText}`);

                    let parts = [
                        locationText,
                        this.weatherShowIcon ? icon : null,
                        `${temp}${suffix}`,
                        this.weatherShowCondition ? condition : null
                    ].filter(Boolean);

                    this.weatherLabel.set_text(
                        this._applyTextCase(parts.join(" "),
                            this.weatherCase
                        )
                    );
                    this.sunLabel.set_text(sunParts.join(" "));

                } catch (e) {

                    global.logError("[Awesome Time] Async error: " + e);

                    this.weatherLabel.set_text(MSG_WEATHER_UNAVAILABLE);
                }
            }
        );
    },

    _weatherCodeToIcon: function(code) {
        return (WEATHER_CODE_MAP[code] && WEATHER_CODE_MAP[code][0]) || "🌡";
    },

    _mapWeatherCode: function(code) {
        return (WEATHER_CODE_MAP[code] && WEATHER_CODE_MAP[code][1]) || "Unknown";
    },

    _formatTime: function(isoString) {
        if (!isoString)
            return null;

        let d = new Date(isoString);

        return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    },

    _updateStyle: function() {

        let dateAlignment = this.dateAlign || "left";
        let weatherAlignment = this.weatherAlign || "left";

        let timeFont = this._parseFont(
            this.fontFamily || "Sans 24",
            24
        );

        let dateFont = this._parseFont(
            this.dateFontFamily || "Sans 14",
            14
        );

        let weatherFont = this._parseFont(
            this.weatherFontFamily || "Sans 14",
            14
        );

        let weatherSunFont = this._parseFont(
            this.weatherSunFontFamily || "Sans 14",
            14
        );

        this.timeLabel.style = `
            font-family: "${timeFont.family}";
            font-size: ${timeFont.size}px;
            color: ${this.fontColor || "#ffffff"};
            text-shadow: ${this._buildShadow()};
        `;

        this.dateLabel.style = `
            font-family: "${dateFont.family}";
            font-size: ${dateFont.size}px;
            color: ${this.dateColor || "#ffffff"};
            text-align: ${dateAlignment};
            text-shadow: ${this._buildShadow()};
            margin-top: ${(this.lineSpacing || 5)}px;
        `;

        this.weatherLabel.style = `
            font-family: "${weatherFont.family}";
            font-size: ${weatherFont.size}px;
            color: ${this.weatherColor || "#ffffff"};
            text-align: ${weatherAlignment};
            text-shadow: ${this._buildShadow()};
            margin-top: ${(this.lineSpacing || 5)}px;
        `;

        this.sunLabel.style = `
            font-family: "${weatherSunFont.family}";
            font-size: ${weatherSunFont.size - 2}px;
            color: ${this.weatherSunColor || "#ffffff"};
            text-align: ${weatherAlignment};
            text-shadow: ${this._buildShadow()};
            margin-top: 3px;
        `;

        this.timeLabel.opacity = Math.round(
            (this.fontOpacity || 100) * 2.55
        );

        this.dateLabel.opacity = Math.round(
            (this.fontOpacity || 100) * 2.55
        );

        this.weatherLabel.opacity = Math.round(
            (this.fontOpacity || 100) * 2.55
        );

        this.sunLabel.opacity = Math.round(
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

            if (this.showDate)
                this.box.add_child(this.dateLabel);

            if (this.showTime)
                this.box.add_child(this.timeLabel);

            if (this.showWeather)
                this.box.add_child(this.weatherLabel);

            if (this.weatherShowSun)
                this.box.add_child(this.sunLabel);

        } else {

            if (this.showTime)
                this.box.add_child(this.timeLabel);

            if (this.showDate)
                this.box.add_child(this.dateLabel);

            if (this.showWeather)
                this.box.add_child(this.weatherLabel);

            if (this.weatherShowSun)
                this.box.add_child(this.sunLabel);
        }
    },

    on_desklet_removed: function() {
        if (this._timer) {
            Mainloop.source_remove(this._timer);
            this._timer = null;
        }

        if (this._weatherTimer) {
            Mainloop.source_remove(this._weatherTimer);
            this._weatherTimer = null;
        }
        Desklet.Desklet.prototype.destroy.call(this);
    }
};

function main(metadata, deskletId) {
    return new AwesomeTime(metadata, deskletId);
}