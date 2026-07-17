#pragma once

// ────────────────────────────────────────────────────────────────────────────
// IVY - Mapeamento de GPIOs ESP32-S3
// ────────────────────────────────────────────────────────────────────────────

// ─── Câmera OV2640 ─────────────────────────────────────────────────────────
#define CAM_XCLK         10
#define CAM_SIOD         40
#define CAM_SIOC         39
#define CAM_Y9           48
#define CAM_Y8           11
#define CAM_Y7           12
#define CAM_Y6           13
#define CAM_Y5           14
#define CAM_Y4           16
#define CAM_Y3           15
#define CAM_Y2           17
#define CAM_VSYNC        38
#define CAM_HREF         47
#define CAM_PCLK         21
#define CAM_PWDN         -1
#define CAM_RESET        -1

// ─── Motores TB6612FNG — Driver A (lado esquerdo) ─────────────────────────
#define MOTA_PWM          5
#define MOTA_IN1          6
#define MOTA_IN2          7
#define MOT_STBY          8      // STBY compartilhado entre os 2 drivers

// ─── Motores TB6612FNG — Driver B (lado direito) ──────────────────────────
#define MOTB_PWM          9
#define MOTB_IN1         45
#define MOTB_IN2         46

// ─── Áudio — DFPlayer Mini (UART1) ─────────────────────────────────────────
#define DFPLAYER_TX       1      // ESP TX → DFPlayer RX
#define DFPLAYER_RX       2      // ESP RX ← DFPlayer TX

// ─── I²C — VL53L0X + outros ───────────────────────────────────────────────
#define I2C_SDA           3
#define I2C_SCL           4

// ─── Display MAX7219 (software SPI) ───────────────────────────────────────
#define MAX7219_DIN      33
#define MAX7219_CS       34
#define MAX7219_CLK      35

// ─── Fita WS2812B ──────────────────────────────────────────────────────────
#define WS2812_PIN       36
#define WS2812_NUM_LEDS  12

// ─── Sensores de linha TCRT5000 ────────────────────────────────────────────
#define TCRT_LEFT        37
#define TCRT_RIGHT       41

// ─── Botão de usuário ──────────────────────────────────────────────────────
#define BTN_USER         42

// ─── ADC — monitoramento da bateria ────────────────────────────────────────
#define ADC_BATTERY      20

// ─── LED de status (WS2812 separado, opcional) ─────────────────────────────
#define LED_STATUS       18

// ─── Resolução da câmera ──────────────────────────────────────────────────
#define CAM_W           320
#define CAM_H           240
