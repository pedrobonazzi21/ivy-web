#pragma once

#include <Arduino.h>
#include <Wire.h>
#include <VL53L0X.h>
#include "../pin_map.h"

class ToFSensor {
public:
    void begin();
    uint16_t readDistance();           // mm (0..~2000)
    bool     obstacleDetected(uint16_t threshold = 150); // mm
    uint16_t lastRange() const { return _last; }

private:
    VL53L0X _sensor;
    uint16_t _last = 0;
    bool _ok = false;
};
