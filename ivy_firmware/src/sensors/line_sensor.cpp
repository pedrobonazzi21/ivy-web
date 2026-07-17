#include "line_sensor.h"

void LineSensor::begin() {
    pinMode(TCRT_LEFT,  INPUT);
    pinMode(TCRT_RIGHT, INPUT);
}

bool LineSensor::isLeftOnSurface() {
    return digitalRead(TCRT_LEFT) == HIGH;
}

bool LineSensor::isRightOnSurface() {
    return digitalRead(TCRT_RIGHT) == HIGH;
}

bool LineSensor::isLeftOnEdge() {
    return digitalRead(TCRT_LEFT) == LOW;
}

bool LineSensor::isRightOnEdge() {
    return digitalRead(TCRT_RIGHT) == LOW;
}

bool LineSensor::anyEdge() {
    return isLeftOnEdge() || isRightOnEdge();
}
