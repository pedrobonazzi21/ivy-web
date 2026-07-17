#pragma once

#include <Arduino.h>
#include "../pin_map.h"

// TCRT5000 — sensor de linha (borda)
// Saída digital: HIGH = superfície clara, LOW = escura (borda)

class LineSensor {
public:
    void begin();
    bool isLeftOnSurface();   // true = superfície clara
    bool isRightOnSurface();
    bool isLeftOnEdge();      // true = borda (escuro)
    bool isRightOnEdge();
    bool anyEdge();            // true se alguma borda detectada

private:
    int _thresh = 500; // para leitura analógica futura
};
