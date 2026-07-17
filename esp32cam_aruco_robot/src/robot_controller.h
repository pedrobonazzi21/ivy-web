#pragma once

#include <Arduino.h>

// Configuração dos pinos do L298N (Ponte H)
// Ajuste conforme sua montagem
#define ENA_PIN     13   // PWM - Velocidade motor esquerdo
#define IN1_PIN     14   // Direção motor esquerdo
#define IN2_PIN     15   // Direção motor esquerdo

#define ENB_PIN     12   // PWM - Velocidade motor direito
#define IN3_PIN     2    // Direção motor direito
#define IN4_PIN     4    // Direção motor direito

// Velocidade padrão (0-255)
#define DEFAULT_SPEED  180

enum class RobotAction {
    STOP,
    FORWARD,
    BACKWARD,
    LEFT,
    RIGHT
};

class RobotController {
public:
    void begin();
    void executeAction(RobotAction action, int speed = DEFAULT_SPEED);
    void setSpeed(int leftSpeed, int rightSpeed);
    void stop();
    
private:
    int _currentLeftSpeed = 0;
    int _currentRightSpeed = 0;
};
