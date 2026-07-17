#pragma once

#include <Arduino.h>
#include <SPI.h>
#include "../pin_map.h"

// MAX7219 conectado via software SPI (pinos genéricos)
// Matriz 8x8 → 64 LEDs → controla expressões faciais

// Expressões pré-definidas
enum class Face : uint8_t {
    NEUTRAL,
    HAPPY,
    SAD,
    ANGRY,
    SURPRISED,
    WINK,
    SLEEP,
    NONE
};

class MatrixDisplay {
public:
    void begin();
    void setBrightness(uint8_t level); // 0..15
    void show(Face face);
    void showCustom(const uint8_t bitmap[8]); // 8 bytes, MSB = col 0
    void clear();

private:
    void _sendByte(uint8_t data);
    void _writeReg(uint8_t reg, uint8_t data);
    void _shutdown(bool off);

    // 8 bitmaps de expressão (cada byte = 1 coluna, MSB = topo)
    static const uint8_t _neutral[8];
    static const uint8_t _happy[8];
    static const uint8_t _sad[8];
    static const uint8_t _angry[8];
    static const uint8_t _surprised[8];
    static const uint8_t _wink[8];
    static const uint8_t _sleep[8];
};
