#include "tof_sensor.h"

void ToFSensor::begin() {
    Wire.begin(I2C_SDA, I2C_SCL);

    if (!_sensor.init()) {
        Serial.println("[TOF] VL53L0X nao encontrado!");
        _ok = false;
        return;
    }

    _sensor.setTimeout(100);
    _sensor.startContinuous(50); // 50ms entre leituras
    _ok = true;
    Serial.println("[TOF] VL53L0X OK");
}

uint16_t ToFSensor::readDistance() {
    if (!_ok) return 0xFFFF;
    _last = _sensor.readRangeContinuousMillimeters();
    if (_sensor.timeoutOccurred()) {
        Serial.println("[TOF] Timeout");
        return 0xFFFF;
    }
    return _last;
}

bool ToFSensor::obstacleDetected(uint16_t threshold) {
    return readDistance() < threshold;
}
