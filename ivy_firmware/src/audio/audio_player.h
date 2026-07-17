#pragma once

#include <Arduino.h>
#include <SoftwareSerial.h>
#include <DFRobotDFPlayerMini.h>
#include "../pin_map.h"

// DFPlayer Mini — UART1 (SoftwareSerial)
// MicroSD com arquivos numerados: 0001.mp3, 0002.mp3 ...

class AudioPlayer {
public:
    void begin();
    void playTrack(uint16_t trackNumber);     // 1..N
    void playLoop(uint16_t trackNumber);      // repetir
    void stop();
    void pause();
    void resume();
    void setVolume(uint8_t vol);              // 0..30
    void volumeUp();
    void volumeDown();
    bool isPlaying();

private:
    SoftwareSerial _softSerial = SoftwareSerial(DFPLAYER_RX, DFPLAYER_TX);
    DFRobotDFPlayerMini _player;
    bool _ok = false;
    uint8_t _volume = 20;
};
