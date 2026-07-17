#include <Arduino.h>
#include "camera_utils.h"
#include "aruco_detector.h"
#include "robot_controller.h"

// ─── Mapeamento: ID do ArUco -> Ação do robô ──────────────────────────────
// Ajuste conforme seus marcadores
struct ActionMapping {
    int markerId;
    RobotAction action;
    int durationMs;   // 0 = executa uma vez, >0 = executa por X ms
};

static const ActionMapping ACTIONS[] = {
    { 0, RobotAction::FORWARD,  2000 },   // Marcador 0 → frente por 2s
    { 1, RobotAction::BACKWARD, 2000 },   // Marcador 1 → ré por 2s
    { 2, RobotAction::LEFT,     1000 },   // Marcador 2 → esquerda 1s
    { 3, RobotAction::RIGHT,    1000 },   // Marcador 3 → direita 1s
    { 4, RobotAction::STOP,     0    },   // Marcador 4 → parar
    { 5, RobotAction::FORWARD,  5000 },   // Marcador 5 → frente 5s
};

static const int NUM_ACTIONS = sizeof(ACTIONS) / sizeof(ACTIONS[0]);

// ─── Globais ───────────────────────────────────────────────────────────────
ArUcoDetector detector;
RobotController robot;
uint8_t* frameBuffer = nullptr;
DetectedMarker markers[4];

// ─── Setup ─────────────────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    Serial.println("\n=== ESP32-CAM ArUco Robot Controller ===");

    // Iniciar camera
    if (!initCamera()) {
        Serial.println("ERRO: Falha ao iniciar camera!");
        delay(5000);
        ESP.restart();
    }
    Serial.println("Camera OK");

    // Iniciar controlador do robo
    robot.begin();
    Serial.println("Robot controller OK");

    // Alocar buffer de frame
    size_t frameSize = CAM_W * CAM_H;
    frameBuffer = (uint8_t*)ps_malloc(frameSize);
    if (!frameBuffer) {
        frameBuffer = (uint8_t*)malloc(frameSize);
    }
    if (!frameBuffer) {
        Serial.println("ERRO: Falha ao alocar buffer!");
        delay(5000);
        ESP.restart();
    }

    Serial.println("Pronto! Aguardando marcadores ArUco...");
    Serial.printf("Resolucao: %dx%d\n", CAM_W, CAM_H);
}

// ─── Executar ação mapeada ─────────────────────────────────────────────────
static unsigned long actionEndTime = 0;
static int currentActionIdx = -1;

void executeMappedAction(int markerId) {
    for (int i = 0; i < NUM_ACTIONS; i++) {
        if (ACTIONS[i].markerId == markerId) {
            Serial.printf("Marcador %d detectado! Executando acao #%d\n",
                          markerId, (int)ACTIONS[i].action);
            robot.executeAction(ACTIONS[i].action);
            if (ACTIONS[i].durationMs > 0) {
                actionEndTime = millis() + ACTIONS[i].durationMs;
                currentActionIdx = i;
            } else {
                actionEndTime = 0;
                currentActionIdx = -1;
            }
            return;
        }
    }
    Serial.printf("Marcador %d detectado, mas sem acao mapeada\n", markerId);
}

// ─── Loop principal ────────────────────────────────────────────────────────
void loop() {
    size_t frameLen = 0;

    // Capturar frame
    if (!captureFrame(frameBuffer, frameLen)) {
        delay(10);
        return;
    }

    // Detectar marcadores ArUco
    int found = detector.detect(frameBuffer, CAM_W, CAM_H, markers, 4);

    if (found > 0) {
        // Pega o primeiro marcador encontrado (maior prioridade)
        executeMappedAction(markers[0].id);

        // Debug: info dos marcadores
        for (int i = 0; i < found; i++) {
            Serial.printf("  ID=%d centro=(%.0f,%.0f)\n",
                          markers[i].id, markers[i].cx, markers[i].cy);
        }
    }

    // Verificar se a ação temporizada terminou
    if (actionEndTime > 0 && millis() >= actionEndTime) {
        robot.stop();
        actionEndTime = 0;
        currentActionIdx = -1;
        Serial.println("Acao concluida, robo parado");
    }

    // Pequena pausa para não saturar o processamento
    delay(50);
}
