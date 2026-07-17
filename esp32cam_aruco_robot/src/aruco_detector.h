#pragma once

#include <Arduino.h>
#include <vector>

struct DetectedMarker {
    int id;
    float cx;            // centro X (0..1 normalizado)
    float cy;            // centro Y (0..1 normalizado)
    float corners[4][2]; // 4 cantos [x, y] (pixels)
    float area;          // area em pixels
};

class ArUcoDetector {
public:
    ArUcoDetector();
    
    // Processa imagem grayscale e detecta marcadores
    // Retorna número de marcadores encontrados
    int detect(const uint8_t* grayImage, int width, int height,
               DetectedMarker* outMarkers, int maxMarkers);

private:
    // Etapa 1: Binarização adaptativa
    void adaptiveThreshold(const uint8_t* src, uint8_t* dst,
                           int w, int h, int blockSize, int C);

    // Etapa 2: Encontrar componentes conectados (pretos)
    struct Component {
        int x1, y1, x2, y2; // bounding box
        int area;
        int label;
    };
    void findComponents(const uint8_t* binary, int w, int h,
                        std::vector<Component>& comps, int minArea);
    
    // Etapa 3: Decodificar marcador de um componente candidato
    bool decodeMarker(const uint8_t* gray, int w, int h,
                      const Component& comp,
                      DetectedMarker& marker);
    
    // Etapa 4: Extrair grid 7x7 do marcador
    bool extractGrid(const uint8_t* gray, int w, int h,
                     float cx, float cy, float size,
                     uint8_t grid[7][7]);
    
    // Etapa 5: Validar borda e extrair ID
    bool getMarkerID(const uint8_t grid[7][7], int& id);

    // Buffer interno (reusado entre chamadas)
    uint8_t* _binaryBuf = nullptr;
    int* _labelBuf = nullptr;
    int _bufW = 0;
    int _bufH = 0;
    
    void ensureBuffers(int w, int h);
};
