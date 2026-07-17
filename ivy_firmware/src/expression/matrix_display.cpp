#include "matrix_display.h"

// ─── Bitmaps 8×8 ───────────────────────────────────────────────────────────
// cada byte = 1 coluna (col 0 → reg 1), bit 7 = topo, bit 0 = base

const uint8_t MatrixDisplay::_neutral[8] = {
    0x00, 0x04, 0x24, 0x04, 0x04, 0x24, 0x04, 0x00
};

const uint8_t MatrixDisplay::_happy[8] = {
    //  col0  col1  col2  col3  col4  col5  col6  col7
    0x00, 0x30, 0x28, 0x04, 0x04, 0x28, 0x30, 0x00
};

const uint8_t MatrixDisplay::_sad[8] = {
    0x00, 0x24, 0x28, 0x10, 0x10, 0x28, 0x24, 0x00
};

const uint8_t MatrixDisplay::_angry[8] = {
    0x00, 0x20, 0x44, 0x04, 0x04, 0x44, 0x20, 0x00
};

const uint8_t MatrixDisplay::_surprised[8] = {
    0x00, 0x00, 0x34, 0x06, 0x06, 0x34, 0x00, 0x00
};

const uint8_t MatrixDisplay::_wink[8] = {
    0x00, 0x04, 0x44, 0x04, 0x04, 0x24, 0x04, 0x00
};

const uint8_t MatrixDisplay::_sleep[8] = {
    0x00, 0x00, 0x40, 0x48, 0x48, 0x40, 0x00, 0x00
};

void MatrixDisplay::begin() {
    pinMode(MAX7219_DIN, OUTPUT);
    pinMode(MAX7219_CS,  OUTPUT);
    pinMode(MAX7219_CLK, OUTPUT);

    digitalWrite(MAX7219_CS,  HIGH);
    digitalWrite(MAX7219_CLK, LOW);

    _shutdown(false);
    setBrightness(4);
    _writeReg(0x09, 0x00);  // decode mode: none
    _writeReg(0x0B, 0x07);  // scan limit: 8 digits
    _writeReg(0x0C, 0x01);  // shutdown: normal
    clear();
}

void MatrixDisplay::_sendByte(uint8_t data) {
    for (int i = 7; i >= 0; i--) {
        digitalWrite(MAX7219_CLK, LOW);
        digitalWrite(MAX7219_DIN, (data >> i) & 1);
        digitalWrite(MAX7219_CLK, HIGH);
    }
}

void MatrixDisplay::_writeReg(uint8_t reg, uint8_t data) {
    digitalWrite(MAX7219_CS, LOW);
    _sendByte(reg);
    _sendByte(data);
    digitalWrite(MAX7219_CS, HIGH);
}

void MatrixDisplay::_shutdown(bool off) {
    _writeReg(0x0C, off ? 0x00 : 0x01);
}

void MatrixDisplay::setBrightness(uint8_t level) {
    _writeReg(0x0A, constrain(level, 0, 15));
}

void MatrixDisplay::clear() {
    for (uint8_t i = 1; i <= 8; i++)
        _writeReg(i, 0x00);
}

void MatrixDisplay::show(Face face) {
    const uint8_t* bmp = nullptr;
    switch (face) {
        case Face::NEUTRAL:   bmp = _neutral;   break;
        case Face::HAPPY:     bmp = _happy;     break;
        case Face::SAD:       bmp = _sad;       break;
        case Face::ANGRY:     bmp = _angry;     break;
        case Face::SURPRISED: bmp = _surprised; break;
        case Face::WINK:      bmp = _wink;      break;
        case Face::SLEEP:     bmp = _sleep;     break;
        default: return;
    }
    showCustom(bmp);
}

void MatrixDisplay::showCustom(const uint8_t bitmap[8]) {
    for (uint8_t i = 0; i < 8; i++)
        _writeReg(i + 1, bitmap[i]);
}
