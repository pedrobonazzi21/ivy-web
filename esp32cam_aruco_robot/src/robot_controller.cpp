#include "robot_controller.h"

void RobotController::begin() {
    pinMode(ENA_PIN, OUTPUT);
    pinMode(IN1_PIN, OUTPUT);
    pinMode(IN2_PIN, OUTPUT);
    pinMode(ENB_PIN, OUTPUT);
    pinMode(IN3_PIN, OUTPUT);
    pinMode(IN4_PIN, OUTPUT);

    stop();
}

void RobotController::executeAction(RobotAction action, int speed) {
    switch (action) {
        case RobotAction::FORWARD:
            setSpeed(speed, speed);
            digitalWrite(IN1_PIN, HIGH);
            digitalWrite(IN2_PIN, LOW);
            digitalWrite(IN3_PIN, HIGH);
            digitalWrite(IN4_PIN, LOW);
            break;

        case RobotAction::BACKWARD:
            setSpeed(speed, speed);
            digitalWrite(IN1_PIN, LOW);
            digitalWrite(IN2_PIN, HIGH);
            digitalWrite(IN3_PIN, LOW);
            digitalWrite(IN4_PIN, HIGH);
            break;

        case RobotAction::LEFT:
            setSpeed(speed, speed);
            digitalWrite(IN1_PIN, LOW);
            digitalWrite(IN2_PIN, HIGH);
            digitalWrite(IN3_PIN, HIGH);
            digitalWrite(IN4_PIN, LOW);
            break;

        case RobotAction::RIGHT:
            setSpeed(speed, speed);
            digitalWrite(IN1_PIN, HIGH);
            digitalWrite(IN2_PIN, LOW);
            digitalWrite(IN3_PIN, LOW);
            digitalWrite(IN4_PIN, HIGH);
            break;

        case RobotAction::STOP:
        default:
            stop();
            break;
    }
}

void RobotController::stop() {
    digitalWrite(IN1_PIN, LOW);
    digitalWrite(IN2_PIN, LOW);
    digitalWrite(IN3_PIN, LOW);
    digitalWrite(IN4_PIN, LOW);
    _currentLeftSpeed = 0;
    _currentRightSpeed = 0;
    analogWrite(ENA_PIN, 0);
    analogWrite(ENB_PIN, 0);
}

void RobotController::setSpeed(int leftSpeed, int rightSpeed) {
    _currentLeftSpeed = constrain(leftSpeed, 0, 255);
    _currentRightSpeed = constrain(rightSpeed, 0, 255);
    analogWrite(ENA_PIN, _currentLeftSpeed);
    analogWrite(ENB_PIN, _currentRightSpeed);
}
