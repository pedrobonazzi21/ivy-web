#include "audio_player.h"

void AudioPlayer::begin() {
    _softSerial.begin(9600);
    delay(500);

    if (!_player.begin(_softSerial)) {
        Serial.println("[AUDIO] DFPlayer nao encontrado!");
        _ok = false;
        return;
    }

    _ok = true;
    _player.setTimeOut(500);
    _player.reset();
    delay(500);

    setVolume(_volume);
    Serial.println("[AUDIO] DFPlayer OK");
}

void AudioPlayer::playTrack(uint16_t trackNumber) {
    if (!_ok) return;
    _player.play(trackNumber);
}

void AudioPlayer::playLoop(uint16_t trackNumber) {
    if (!_ok) return;
    _player.loop(trackNumber);
}

void AudioPlayer::stop() {
    if (!_ok) return;
    _player.stop();
}

void AudioPlayer::pause() {
    if (!_ok) return;
    _player.pause();
}

void AudioPlayer::resume() {
    if (!_ok) return;
    _player.start();
}

void AudioPlayer::setVolume(uint8_t vol) {
    _volume = constrain(vol, 0, 30);
    if (!_ok) return;
    _player.volume(_volume);
}

void AudioPlayer::volumeUp() {
    setVolume(_volume + 2);
}

void AudioPlayer::volumeDown() {
    if (_volume >= 2) setVolume(_volume - 2);
}

bool AudioPlayer::isPlaying() {
    if (!_ok) return false;
    return !_player.available(); // heuristic
}
