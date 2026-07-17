#include "battery_monitor.h"

void BatteryMonitor::begin() {
    pinMode(ADC_BATTERY, INPUT);
    analogReadResolution(12); // 12 bits (0..4095)
}

uint16_t BatteryMonitor::readRaw() {
    return analogRead(ADC_BATTERY);
}

float BatteryMonitor::readVoltage() {
    uint16_t raw = readRaw();
    float v = (raw / _ADC_MAX) * _VREF * _DIV;
    _lastVoltage = v;
    return v;
}

uint8_t BatteryMonitor::readPercent() {
    float v = readVoltage();
    // Li-ion 2S: 6.0V (0%) a 8.4V (100%)
    float pct = (v - 6.0f) / (8.4f - 6.0f) * 100.0f;
    if (pct < 0.0f) pct = 0.0f;
    if (pct > 100.0f) pct = 100.0f;
    return (uint8_t)pct;
}

bool BatteryMonitor::isLow(float threshold) {
    return readVoltage() < threshold;
}
