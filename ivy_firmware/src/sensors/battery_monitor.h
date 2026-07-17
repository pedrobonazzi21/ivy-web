#pragma once

#include <Arduino.h>
#include "../pin_map.h"

// Monitor de bateria Li-ion 2S (7,4V nominal)
// Leitura analógica via divisor resistivo no GPIO

class BatteryMonitor {
public:
    void begin();
    uint16_t readRaw();            // valor ADC (0..4095 no S3)
    float    readVoltage();        // tensão real da bateria
    uint8_t  readPercent();        // 0..100%
    bool     isLow(float threshold = 6.4f);

private:
    // Ajuste conforme seu divisor resistivo:
    // R1 + R2 = fator de divisão
    static constexpr float _R1 = 100000.0f;  // 100k
    static constexpr float _R2 = 10000.0f;   // 10k
    static constexpr float _DIV = (_R1 + _R2) / _R2; // 11:1
    static constexpr float _ADC_MAX = 4095.0f;
    static constexpr float _VREF = 3.3f;

    float _lastVoltage = 0.0f;
};
