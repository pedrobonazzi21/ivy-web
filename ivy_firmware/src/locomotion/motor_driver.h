#pragma once

#include <Arduino.h>
#include "../pin_map.h"

// TB6612FNG: controle de 2 motores por chip (usamos 2 chips)
// Driver A → motores do lado ESQUERDO (frente + trás)
// Driver B → motores do lado DIREITO  (frente + trás)

// Os 2 motores de cada lado são ligados em paralelo no mesmo driver.
// Para steering diferencial:
//   forward()  → ambos os lados para frente
//   backward() → ambos os lados para trás
//   left()     → lado direito gira, esquerdo para/trás
//   right()    → lado esquerdo gira, direito para/trás
//   rotate()   → lados opostos (gira no lugar)

class MotorDriver {
public:
    void begin();

    void setLeftSpeed(int speed);   // -255..255
    void setRightSpeed(int speed);  // -255..255

    void forward(int speed = 200);
    void backward(int speed = 200);
    void left(int speed = 200);
    void right(int speed = 200);
    void rotateCW(int speed = 200);
    void rotateCCW(int speed = 200);
    void stop();

    int  getLeftSpeed()  const { return _leftSpeed;  }
    int  getRightSpeed() const { return _rightSpeed; }

private:
    void _writeLeft(int pwm, bool in1, bool in2);
    void _writeRight(int pwm, bool in1, bool in2);

    int _leftSpeed  = 0;
    int _rightSpeed = 0;
};
