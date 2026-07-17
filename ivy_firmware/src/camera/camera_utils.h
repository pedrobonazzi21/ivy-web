#pragma once

#include <Arduino.h>
#include "esp_camera.h"
#include "../pin_map.h"

bool initCamera();
bool captureGrayscale(uint8_t* buf, size_t& len);
