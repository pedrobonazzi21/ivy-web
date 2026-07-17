#include <Arduino.h>

// Subsistemas
#include "camera/camera_utils.h"
#include "camera/aruco_detector.h"
#include "locomotion/motor_driver.h"
#include "expression/matrix_display.h"
#include "expression/led_strip.h"
#include "audio/audio_player.h"
#include "sensors/tof_sensor.h"
#include "sensors/line_sensor.h"
#include "sensors/battery_monitor.h"
#include "system/system_init.h"

// ─── Globais ───────────────────────────────────────────────────────────────
MotorDriver     motors;
ArUcoDetector   aruco;
MatrixDisplay   face;
LEDStrip        leds;
AudioPlayer     audio;
ToFSensor       tof;
LineSensor      line;
BatteryMonitor  battery;
Button          btn;

uint8_t*        frameBuf  = nullptr;
DetectedMarker  markers[4];
size_t          frameSize = CAM_W * CAM_H;

// ─── Estados do robô ───────────────────────────────────────────────────────
enum class State : uint8_t {
    BOOT,
    IDLE,
    MOVE_FORWARD,
    MOVE_BACKWARD,
    TURN_LEFT,
    TURN_RIGHT,
    AVOID_OBSTACLE,
    EDGE_STOP,
    LOW_BATTERY
};

State state = State::BOOT;
State prevState = State::BOOT;
unsigned long stateStart = 0;
int lastMarkerId = -1;

// ─── Mapeamento: ID ArUco → ação ──────────────────────────────────────────
struct ActionMap {
    int     markerId;
    State   newState;
    int     durationMs;   // 0 = mantém até novo comando
    uint8_t audioTrack;   // 0 = sem áudio
    Face    expression;
};

static const ActionMap ACTIONS[] = {
    { 0, State::MOVE_FORWARD,  2000, 1, Face::HAPPY    },
    { 1, State::MOVE_BACKWARD, 2000, 2, Face::SAD      },
    { 2, State::TURN_LEFT,     1000, 3, Face::WINK     },
    { 3, State::TURN_RIGHT,    1000, 3, Face::WINK     },
    { 4, State::IDLE,          0,    0,  Face::NEUTRAL  },
    { 5, State::MOVE_FORWARD,  5000, 1, Face::HAPPY    },
};

static const int NUM_ACTIONS = sizeof(ACTIONS) / sizeof(ACTIONS[0]);

void executeAction(int markerId) {
    for (int i = 0; i < NUM_ACTIONS; i++) {
        if (ACTIONS[i].markerId == markerId) {
            state         = ACTIONS[i].newState;
            stateStart    = millis();
            lastMarkerId  = markerId;

            face.show(ACTIONS[i].expression);
            if (ACTIONS[i].audioTrack > 0)
                audio.playTrack(ACTIONS[i].audioTrack);

            Serial.printf("[MAIN] Marker %d → state %d\n", markerId, (int)state);
            return;
        }
    }
    Serial.printf("[MAIN] Marker %d sem acao\n", markerId);
}

// ─── Aplicar direção dos motores conforme estado ───────────────────────────
void applyStateMotion() {
    switch (state) {
        case State::MOVE_FORWARD:  motors.forward(200);  break;
        case State::MOVE_BACKWARD: motors.backward(200); break;
        case State::TURN_LEFT:     motors.rotateCCW(180); break;
        case State::TURN_RIGHT:    motors.rotateCW(180);  break;
        case State::AVOID_OBSTACLE: motors.backward(150);
                                    delay(400);
                                    motors.rotateCW(180);
                                    delay(600);
                                    state = State::IDLE;
                                    stateStart = millis();
                                    face.show(Face::SURPRISED);
                                    break;
        case State::EDGE_STOP:
        case State::LOW_BATTERY:
        case State::IDLE:
        case State::BOOT:
        default:
            motors.stop();
            break;
    }
}

// ─── Inicialização ─────────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    delay(500);
    Serial.println("\n===== IVY v1.0 =====");

    // 1. LED de status
    initStatusLED();
    statusLEDBlink(2);

    // 2. Botão
    btn.begin();

    // 3. Display e LEDs
    face.begin();
    leds.begin();
    face.show(Face::NEUTRAL);
    leds.setMode(StripMode::BREATHE);
    leds.setColor(0, 100, 255);
    leds.setBrightness(64);

    // 4. Motor
    motors.begin();
    Serial.println("[MAIN] Motores OK");

    // 5. Câmera
    if (!initCamera()) {
        face.show(Face::SAD);
        while (1) { statusLEDBlink(1, 200); delay(1000); }
    }

    // 6. ArUco detector — buffer
    frameBuf = (uint8_t*)ps_malloc(frameSize);
    if (!frameBuf) frameBuf = (uint8_t*)malloc(frameSize);
    if (!frameBuf) {
        Serial.println("[MAIN] Sem memoria para frame!");
        face.show(Face::SAD);
        while (1) delay(1000);
    }

    // 7. Sensores
    tof.begin();
    line.begin();
    battery.begin();

    // 8. Áudio
    audio.begin();
    audio.playTrack(1); // som de boot

    // Pronto!
    delay(500);
    state = State::IDLE;
    stateStart = millis();
    face.show(Face::HAPPY);
    leds.setMode(StripMode::RAINBOW);

    Serial.println("===== IVY pronta! =====");
}

// ─── Loop principal ────────────────────────────────────────────────────────
void loop() {
    unsigned long now = millis();

    // ── Inputs ──────────────────────────────────────────────────────────
    btn.tick();
    if (btn.wasPressed()) {
        audio.playTrack(4);
        face.show(Face::SURPRISED);
        delay(500);
        state = State::IDLE;
        face.show(Face::HAPPY);
    }

    // ── Bateria ─────────────────────────────────────────────────────────
    uint8_t batPct = battery.readPercent();
    leds.showBatteryLevel(batPct);   // mostra na fita WS2812B
    if (battery.isLow()) {
        state = State::LOW_BATTERY;
        face.show(Face::SAD);
        motors.stop();
        leds.setMode(StripMode::BLINK);
        leds.setColor(255, 0, 0);
        audio.playLoop(5); // alerta
        delay(1000);
        return;
    }

    // ── Sensores de borda ───────────────────────────────────────────────
    if (state != State::LOW_BATTERY && state != State::EDGE_STOP) {
        if (line.anyEdge()) {
            state = State::EDGE_STOP;
            face.show(Face::SURPRISED);
            audio.playTrack(6);
            leds.setMode(StripMode::BLINK);
            leds.setColor(255, 100, 0);
            motors.stop();
            Serial.println("[MAIN] Borda detectada!");
        }
    }

    // ── TOF obstáculo ───────────────────────────────────────────────────
    if (state == State::MOVE_FORWARD || state == State::IDLE) {
        if (tof.obstacleDetected(200)) {
            state = State::AVOID_OBSTACLE;
            face.show(Face::ANGRY);
            audio.playTrack(7);
            Serial.println("[MAIN] Obstaculo!");
        }
    }

    // ── Timeout de ação ─────────────────────────────────────────────────
    if (state != State::IDLE && state != State::BOOT &&
        state != State::LOW_BATTERY && state != State::EDGE_STOP) {
        for (int i = 0; i < NUM_ACTIONS; i++) {
            if (ACTIONS[i].markerId == lastMarkerId && ACTIONS[i].durationMs > 0) {
                if (now - stateStart >= (unsigned long)ACTIONS[i].durationMs) {
                    state = State::IDLE;
                    face.show(Face::NEUTRAL);
                    motors.stop();
                    Serial.println("[MAIN] Acao concluida, voltando a IDLE");
                }
                break;
            }
        }
    }

    // ── Aplicar movimento ───────────────────────────────────────────────
    applyStateMotion();

    // ── Câmera + ArUco (a cada ~100ms) ──────────────────────────────────
    static unsigned long lastCam = 0;
    if (now - lastCam > 100 && state == State::IDLE) {
        lastCam = now;

        size_t len = 0;
        if (captureGrayscale(frameBuf, len)) {
            int found = aruco.detect(frameBuf, CAM_W, CAM_H, markers, 4);
            if (found > 0) {
                executeAction(markers[0].id);
            }
        }
    }

    // ── Expressões (LED strip animação) ─────────────────────────────────
    leds.tick();

    // ── Log periódico ───────────────────────────────────────────────────
    static unsigned long lastLog = 0;
    if (now - lastLog > 5000) {
        lastLog = now;
        Serial.printf("[MAIN] Bat: %.2fV (%d%%)  TOF: %dmm  Estado: %d\n",
                      battery.readVoltage(), batPct,
                      tof.lastRange(), (int)state);
    }

    delay(10);
}
