#include "motor_driver.h"

void MotorDriver::begin() {
    pinMode(MOTA_PWM, OUTPUT);
    pinMode(MOTA_IN1, OUTPUT);
    pinMode(MOTA_IN2, OUTPUT);

    pinMode(MOTB_PWM, OUTPUT);
    pinMode(MOTB_IN1, OUTPUT);
    pinMode(MOTB_IN2, OUTPUT);

    pinMode(MOT_STBY, OUTPUT);
    digitalWrite(MOT_STBY, HIGH);   // ativa os drivers

    stop();
}

// ─── Motor esquerdo (Driver A) ─────────────────────────────────────────────
void MotorDriver::_writeLeft(int pwm, bool in1, bool in2) {
    pwm = constrain(pwm, 0, 255);
    analogWrite(MOTA_PWM, pwm);
    digitalWrite(MOTA_IN1, in1);
    digitalWrite(MOTA_IN2, in2);
}

// ─── Motor direito (Driver B) ──────────────────────────────────────────────
void MotorDriver::_writeRight(int pwm, bool in1, bool in2) {
    pwm = constrain(pwm, 0, 255);
    analogWrite(MOTB_PWM, pwm);
    digitalWrite(MOTB_IN1, in1);
    digitalWrite(MOTB_IN2, in2);
}

// ─── Set direct (speed = -255..255) ────────────────────────────────────────
void MotorDriver::setLeftSpeed(int speed) {
    _leftSpeed = constrain(speed, -255, 255);
    if (_leftSpeed > 0) {
        _writeLeft(_leftSpeed,  HIGH, LOW);   // forward
    } else if (_leftSpeed < 0) {
        _writeLeft(-_leftSpeed, LOW,  HIGH);  // backward
    } else {
        _writeLeft(0, LOW, LOW);              // brake (coast)
    }
}

void MotorDriver::setRightSpeed(int speed) {
    _rightSpeed = constrain(speed, -255, 255);
    if (_rightSpeed > 0) {
        _writeRight(_rightSpeed, HIGH, LOW);    // forward
    } else if (_rightSpeed < 0) {
        _writeRight(-_rightSpeed, LOW,  HIGH);  // backward
    } else {
        _writeRight(0, LOW, LOW);               // brake (coast)
    }
}

// ─── Ações de alto nível ───────────────────────────────────────────────────
void MotorDriver::forward(int speed) {
    setLeftSpeed(speed);
    setRightSpeed(speed);
}

void MotorDriver::backward(int speed) {
    setLeftSpeed(-speed);
    setRightSpeed(-speed);
}

void MotorDriver::left(int speed) {
    setLeftSpeed(0);
    setRightSpeed(speed);
}

void MotorDriver::right(int speed) {
    setLeftSpeed(speed);
    setRightSpeed(0);
}

void MotorDriver::rotateCW(int speed) {
    setLeftSpeed(speed);
    setRightSpeed(-speed);
}

void MotorDriver::rotateCCW(int speed) {
    setLeftSpeed(-speed);
    setRightSpeed(speed);
}

void MotorDriver::stop() {
    _writeLeft(0,  LOW, LOW);
    _writeRight(0, LOW, LOW);
    _leftSpeed  = 0;
    _rightSpeed = 0;
}
