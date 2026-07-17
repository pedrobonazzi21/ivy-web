#include "system_init.h"

// ─── Botão ─────────────────────────────────────────────────────────────────
void Button::begin() {
    pinMode(BTN_USER, INPUT_PULLUP);
    _last = digitalRead(BTN_USER);
}

bool Button::isPressed() {
    return digitalRead(BTN_USER) == LOW;
}

bool Button::wasPressed() {
    bool ret = _pressed;
    if (_pressed) _pressed = false;
    return ret;
}

void Button::tick() {
    bool current = digitalRead(BTN_USER);
    unsigned long now = millis();

    if (current != _last && now - _lastMs > _debounce) {
        _last = current;
        _lastMs = now;
        if (current == LOW) _pressed = true;
    }
}

// ─── LED de status ─────────────────────────────────────────────────────────
void initStatusLED() {
    pinMode(LED_STATUS, OUTPUT);
    digitalWrite(LED_STATUS, LOW);
}

void statusLED(bool on) {
    digitalWrite(LED_STATUS, on ? HIGH : LOW);
}

void statusLEDBlink(int times, int delayMs) {
    for (int i = 0; i < times; i++) {
        statusLED(true);
        delay(delayMs);
        statusLED(false);
        if (i < times - 1) delay(delayMs);
    }
}
