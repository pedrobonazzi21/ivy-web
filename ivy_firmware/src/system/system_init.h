#pragma once

#include <Arduino.h>
#include "../pin_map.h"

// Inicialização global e utilitários

class Button {
public:
    void begin();
    bool isPressed();       // momento da leitura
    bool wasPressed();      // borda de descida (edge-trigger)
    void tick();            // chamar no loop

private:
    bool _last = HIGH;
    bool _pressed = false;
    unsigned long _debounce = 50;
    unsigned long _lastMs = 0;
};

// LED na placa (se disponível)
void initStatusLED();
void statusLED(bool on);
void statusLEDBlink(int times = 3, int delayMs = 100);
