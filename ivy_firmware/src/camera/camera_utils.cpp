#include "camera_utils.h"

bool initCamera() {
    camera_config_t config = {};
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer   = LEDC_TIMER_0;

    config.pin_d0       = CAM_Y2;
    config.pin_d1       = CAM_Y3;
    config.pin_d2       = CAM_Y4;
    config.pin_d3       = CAM_Y5;
    config.pin_d4       = CAM_Y6;
    config.pin_d5       = CAM_Y7;
    config.pin_d6       = CAM_Y8;
    config.pin_d7       = CAM_Y9;
    config.pin_xclk     = CAM_XCLK;
    config.pin_pclk     = CAM_PCLK;
    config.pin_vsync    = CAM_VSYNC;
    config.pin_href     = CAM_HREF;
    config.pin_sscb_sda = CAM_SIOD;
    config.pin_sscb_scl = CAM_SIOC;
    config.pin_pwdn     = CAM_PWDN;
    config.pin_reset    = CAM_RESET;

    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_GRAYSCALE;
    config.frame_size   = FRAMESIZE_QVGA;
    config.jpeg_quality = 12;
    config.fb_count     = 1;
    config.fb_location  = CAMERA_FB_IN_PSRAM;
    config.grab_mode    = CAMERA_GRAB_WHEN_EMPTY;

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("[CAM] Falha na inicializacao: 0x%x\n", err);
        return false;
    }

    sensor_t* s = esp_camera_sensor_get();
    if (s) {
        s->set_brightness(s, 0);
        s->set_contrast(s, 0);
        s->set_saturation(s, 0);
        s->set_gainceiling(s, GAINCEILING_2X);
        s->set_whitebal(s, 1);
        s->set_awb_gain(s, 1);
        s->set_exposure_ctrl(s, 1);
        s->set_gain_ctrl(s, 1);
        s->set_agc_gain(s, 0);
        s->set_ae_level(s, 0);
        s->set_aec_value(s, 300);
    }

    Serial.println("[CAM] Inicializada (QVGA 320x240)");
    return true;
}

bool captureGrayscale(uint8_t* buf, size_t& len) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("[CAM] Erro ao capturar frame");
        return false;
    }

    if (fb->format == PIXFORMAT_GRAYSCALE) {
        memcpy(buf, fb->buf, fb->len);
        len = fb->len;
        esp_camera_fb_return(fb);
        return true;
    }

    esp_camera_fb_return(fb);
    return false;
}
