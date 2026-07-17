#include "led_strip.h"

void LEDStrip::begin() {
    _strip.begin();
    _strip.setBrightness(_brightness);
    _strip.show();
}

void LEDStrip::setBrightness(uint8_t brightness) {
    _brightness = brightness;
    _strip.setBrightness(_brightness);
}

void LEDStrip::setColor(uint8_t r, uint8_t g, uint8_t b) {
    _r = r; _g = g; _b = b;
}

void LEDStrip::setMode(StripMode mode) {
    _mode = mode;
    _phase = 0;
}

void LEDStrip::_fill(uint8_t r, uint8_t g, uint8_t b) {
    for (int i = 0; i < WS2812_NUM_LEDS; i++)
        _strip.setPixelColor(i, _strip.Color(r, g, b));
    _strip.show();
}

void LEDStrip::_meter(uint8_t count, uint8_t r, uint8_t g, uint8_t b) {
    count = constrain(count, 0, WS2812_NUM_LEDS);
    for (int i = 0; i < WS2812_NUM_LEDS; i++) {
        if (i < count)
            _strip.setPixelColor(i, _strip.Color(r, g, b));
        else
            _strip.setPixelColor(i, 0);
    }
    _strip.show();
}

// ─── Barra de bateria ──────────────────────────────────────────────────────
void LEDStrip::showBatteryLevel(uint8_t percent) {
    uint8_t n = map(percent, 0, 100, 0, WS2812_NUM_LEDS);
    uint8_t r, g, b;
    if (percent > 60)      { r =   0; g = 255; b =   0; }
    else if (percent > 30) { r = 255; g = 200; b =   0; }
    else                   { r = 255; g =   0; b =   0; }
    _meter(n, r, g, b);
}

// ─── Rainbow wheel ─────────────────────────────────────────────────────────
uint32_t LEDStrip::_wheel(uint8_t pos) {
    pos = 255 - pos;
    if (pos < 85)
        return _strip.Color(255 - pos * 3, 0, pos * 3);
    if (pos < 170) {
        pos -= 85;
        return _strip.Color(0, pos * 3, 255 - pos * 3);
    }
    pos -= 170;
    return _strip.Color(pos * 3, 255 - pos * 3, 0);
}

// ─── Tick → chamar no loop ─────────────────────────────────────────────────
void LEDStrip::tick() {
    unsigned long now = millis();
    if (now - _lastTick < 40) return; // ~25 fps
    _lastTick = now;

    switch (_mode) {
        case StripMode::OFF:
            _fill(0, 0, 0);
            break;

        case StripMode::SOLID:
            _fill(_r, _g, _b);
            break;

        case StripMode::BREATHE: {
            float v = sin(_phase * 0.1f) * 0.5f + 0.5f;
            _fill(_r * v, _g * v, _b * v);
            _phase++;
            break;
        }

        case StripMode::RAINBOW: {
            for (int i = 0; i < WS2812_NUM_LEDS; i++)
                _strip.setPixelColor(i, _wheel((i * 256 / WS2812_NUM_LEDS + _phase) & 255));
            _strip.show();
            _phase++;
            break;
        }

        case StripMode::BLINK: {
            bool on = (_phase / 5) % 2 == 0;
            _fill(on ? _r : 0, on ? _g : 0, on ? _b : 0);
            _phase++;
            break;
        }

        case StripMode::METER:
            // já controlado externamente via showBatteryLevel
            break;
    }
}
