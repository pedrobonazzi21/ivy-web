#include "camera_utils.h"

bool initCamera() {
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO_NUM;
    config.pin_d1 = Y3_GPIO_NUM;
    config.pin_d2 = Y4_GPIO_NUM;
    config.pin_d3 = Y5_GPIO_NUM;
    config.pin_d4 = Y6_GPIO_NUM;
    config.pin_d5 = Y7_GPIO_NUM;
    config.pin_d6 = Y8_GPIO_NUM;
    config.pin_d7 = Y9_GPIO_NUM;
    config.pin_xclk = XCLK_GPIO_NUM;
    config.pin_pclk = PCLK_GPIO_NUM;
    config.pin_vsync = VSYNC_GPIO_NUM;
    config.pin_href = HREF_GPIO_NUM;
    config.pin_sscb_sda = SIOD_GPIO_NUM;
    config.pin_sscb_scl = SIOC_GPIO_NUM;
    config.pin_pwdn = PWDN_GPIO_NUM;
    config.pin_reset = RESET_GPIO_NUM;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_GRAYSCALE;  // JPG ou GRAYSCALE
    config.frame_size = FRAMESIZE_QVGA;         // 320x240
    config.jpeg_quality = 12;
    config.fb_count = 1;
    config.fb_location = CAMERA_FB_IN_PSRAM;
    config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;

    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Falha ao iniciar camera: 0x%x\n", err);
        return false;
    }

    // Ajustes automáticos
    sensor_t* s = esp_camera_sensor_get();
    if (s) {
        s->set_brightness(s, 0);
        s->set_contrast(s, 0);
        s->set_saturation(s, 0);
        s->set_gainceiling(s, GAINCEILING_2X);
        s->set_whitebal(s, 1);
        s->set_awb_gain(s, 1);
        s->set_wb_mode(s, 0);
        s->set_exposure_ctrl(s, 1);
        s->set_aec2(s, 0);
        s->set_ae_level(s, 0);
        s->set_aec_value(s, 300);
        s->set_gain_ctrl(s, 1);
        s->set_agc_gain(s, 0);
        s->set_hmirror(s, 0);
        s->set_vflip(s, 0);
    }

    return true;
}

bool captureFrame(uint8_t* grayBuf, size_t& len) {
    camera_fb_t* fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Falha ao capturar frame");
        return false;
    }

    if (fb->format == PIXFORMAT_GRAYSCALE) {
        memcpy(grayBuf, fb->buf, fb->len);
        len = fb->len;
    } else if (fb->format == PIXFORMAT_JPEG) {
        // Converte JPEG para grayscale (simplificado: descodifica com tjpgd)
        // Nota: para JPEG, precisamos de um decoder
        // Por simplicidade, use PIXFORMAT_GRAYSCALE no config acima
        len = 0;
        esp_camera_fb_return(fb);
        return false;
    } else {
        len = 0;
        esp_camera_fb_return(fb);
        return false;
    }

    esp_camera_fb_return(fb);
    return true;
}
