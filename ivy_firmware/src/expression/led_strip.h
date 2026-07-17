#pragma once

#include <Arduino.h>
#include <Adafruit_NeoPixel.h>
#include "../pin_map.h"

// Fita WS2812B — usada para:
//   - Status da bateria (cor → nível)
//   - Efeitos visuais (animação, respiração)
//   - Sinalização de estado do robô

enum class StripMode : uint8_t {
    OFF,
    SOLID,
    BREATHE,
    RAINBOW,
    BLINK,
    METER          // barra de progresso (bateria)
};

class LEDStrip {
public:
    void begin();
    void setMode(StripMode mode);
    void setColor(uint8_t r, uint8_t g, uint8_t b);
    void setBrightness(uint8_t brightness); // 0..255
    void showBatteryLevel(uint8_t percent); // 0..100
    void tick(); // chamar no loop para animações

private:
    Adafruit_NeoPixel _strip = Adafruit_NeoPixel(WS2812_NUM_LEDS, WS2812_PIN, NEO_GRB + NEO_KHZ800);
    StripMode _mode = StripMode::OFF;
    uint8_t _r = 0, _g = 0, _b = 0;
    uint8_t _brightness = 128;
    unsigned long _lastTick = 0;
    uint8_t _phase = 0;

    void _fill(uint8_t r, uint8_t g, uint8_t b);
    void _meter(uint8_t count, uint8_t r, uint8_t g, uint8_t b);
    uint32_t _wheel(uint8_t pos);
};
