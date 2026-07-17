#include "aruco_detector.h"
#include "marker_definitions.h"
#include <string.h>

ArUcoDetector::ArUcoDetector() {}

void ArUcoDetector::ensureBuffers(int w, int h) {
    if (w != _bufW || h != _bufH) {
        if (_binaryBuf) free(_binaryBuf);
        if (_labelBuf) free(_labelBuf);
        _binaryBuf = (uint8_t*)malloc(w * h);
        _labelBuf = (int*)malloc(w * h * sizeof(int));
        _bufW = w;
        _bufH = h;
    }
}

// ─── Threshold adaptativo via integral image ──────────────────────────────
void ArUcoDetector::adaptiveThreshold(const uint8_t* src, uint8_t* dst,
                                       int w, int h, int blockSize, int C) {
    if (blockSize % 2 == 0) blockSize++;
    int half = blockSize / 2;

    // Aloca integral image (32-bit)
    uint32_t* integral = (uint32_t*)malloc((w + 1) * (h + 1) * sizeof(uint32_t));
    if (!integral) {
        // Fallback: threshold fixo
        uint32_t sum = 0;
        for (int i = 0; i < w * h; i++) sum += src[i];
        int mean = sum / (w * h);
        int threshold = (mean > 20) ? mean - 20 : 0;
        for (int i = 0; i < w * h; i++)
            dst[i] = (src[i] > threshold) ? 0 : 255;
        return;
    }

    // Integral image
    memset(integral, 0, (w + 1) * (h + 1) * sizeof(uint32_t));
    for (int y = 0; y < h; y++) {
        uint32_t rowSum = 0;
        for (int x = 0; x < w; x++) {
            rowSum += src[y * w + x];
            integral[(y + 1) * (w + 1) + (x + 1)] = integral[y * (w + 1) + (x + 1)] + rowSum;
        }
    }

    // Aplica threshold
    for (int y = 0; y < h; y++) {
        for (int x = 0; x < w; x++) {
            int x1 = max(0, x - half);
            int x2 = min(w - 1, x + half);
            int y1 = max(0, y - half);
            int y2 = min(h - 1, y + half);
            int count = (x2 - x1 + 1) * (y2 - y1 + 1);

            uint32_t sum = integral[(y2 + 1) * (w + 1) + (x2 + 1)]
                         - integral[(y1) * (w + 1) + (x2 + 1)]
                         - integral[(y2 + 1) * (w + 1) + (x1)]
                         + integral[(y1) * (w + 1) + (x1)];
            int mean = sum / count;

            // Invertido: marcador fica BRANCO (255) no binário
            dst[y * w + x] = (src[y * w + x] < mean - C) ? 255 : 0;
        }
    }

    free(integral);
}

// ─── Componentes conectados (two-pass CCL) ────────────────────────────────
struct CCLRun {
    int x, y, w, label;
};

void ArUcoDetector::findComponents(const uint8_t* binary, int w, int h,
                                    std::vector<Component>& comps, int minArea) {
    const int MAX_LABELS = 4096;
    int* labels = _labelBuf;
    memset(labels, 0, w * h * sizeof(int));

    std::vector<int> eq(MAX_LABELS, 0);
    for (int i = 0; i < MAX_LABELS; i++) eq[i] = i;

    int nextLabel = 1;

    // Primeira passagem: atribui labels temporários
    for (int y = 1; y < h; y++) {
        for (int x = 1; x < w; x++) {
            if (binary[y * w + x] == 0) continue;

            int p_idx = y * w + x;
            int t = labels[(y - 1) * w + x];     // top
            int l = labels[y * w + (x - 1)];     // left
            int tl = labels[(y - 1) * w + (x - 1)]; // top-left
            int tr = labels[(y - 1) * w + (x + 1)]; // top-right

            if (t == 0 && l == 0 && tl == 0 && tr == 0) {
                labels[p_idx] = nextLabel++;
                if (nextLabel >= MAX_LABELS) break;
            } else {
                int m = 0;
                if (t > 0) m = (m == 0) ? t : min(m, t);
                if (l > 0) m = (m == 0) ? l : min(m, l);
                if (tl > 0) m = (m == 0) ? tl : min(m, tl);
                if (tr > 0) m = (m == 0) ? tr : min(m, tr);
                labels[p_idx] = m;

                if (t > 0 && t != m) eq[t] = min(eq[t], m);
                if (l > 0 && l != m) eq[l] = min(eq[l], m);
                if (tl > 0 && tl != m) eq[tl] = min(eq[tl], m);
                if (tr > 0 && tr != m) eq[tr] = min(eq[tr], m);
            }
        }
    }

    // Resolve equivalências
    for (int i = 1; i < nextLabel; i++) {
        int r = i;
        while (eq[r] != r) r = eq[r];
        eq[i] = r;
    }

    // Segunda passagem: atualiza labels
    for (int y = 1; y < h; y++)
        for (int x = 1; x < w; x++)
            if (labels[y * w + x] > 0)
                labels[y * w + x] = eq[labels[y * w + x]];

    // Coleta estatísticas dos componentes
    struct CompStat {
        int x1 = w, y1 = h, x2 = 0, y2 = 0, area = 0;
    };
    std::vector<CompStat> stats(nextLabel);

    for (int y = 1; y < h; y++) {
        for (int x = 1; x < w; x++) {
            int lbl = labels[y * w + x];
            if (lbl > 0) {
                CompStat& s = stats[lbl];
                s.x1 = min(s.x1, x);
                s.y1 = min(s.y1, y);
                s.x2 = max(s.x2, x);
                s.y2 = max(s.y2, y);
                s.area++;
            }
        }
    }

    // Filtra componentes
    for (int i = 1; i < nextLabel; i++) {
        CompStat& s = stats[i];
        if (s.area < minArea) continue;

        int bw = s.x2 - s.x1;
        int bh = s.y2 - s.y1;
        if (bw < 3 || bh < 3) continue;

        Component comp;
        comp.x1 = s.x1; comp.y1 = s.y1;
        comp.x2 = s.x2; comp.y2 = s.y2;
        comp.area = s.area;
        comp.label = i;
        comps.push_back(comp);
    }
}

// ─── Extrair grid 7x7 do marcador ─────────────────────────────────────────
bool ArUcoDetector::extractGrid(const uint8_t* gray, int w, int h,
                                 float cx, float cy, float size,
                                 uint8_t grid[7][7]) {
    float halfSize = size / 2.0f;
    float cellW = size / ARUCO_CELL_SIZE;
    float cellH = size / ARUCO_CELL_SIZE;

    for (int row = 0; row < ARUCO_CELL_SIZE; row++) {
        for (int col = 0; col < ARUCO_CELL_SIZE; col++) {
            // Centro da célula
            float px = cx - halfSize + (col + 0.5f) * cellW;
            float py = cy - halfSize + (row + 0.5f) * cellH;

            // Bilinear interpolation
            int xi = (int)px;
            int yi = (int)py;
            if (xi < 0 || xi >= w - 1 || yi < 0 || yi >= h - 1) return false;

            float fx = px - xi;
            float fy = py - yi;

            float v00 = gray[yi * w + xi];
            float v10 = gray[yi * w + xi + 1];
            float v01 = gray[(yi + 1) * w + xi];
            float v11 = gray[(yi + 1) * w + xi + 1];

            float v = (1 - fx) * (1 - fy) * v00
                    + fx * (1 - fy) * v10
                    + (1 - fx) * fy * v01
                    + fx * fy * v11;

            grid[row][col] = (uint8_t)v;
        }
    }
    return true;
}

// ─── Obter ID do marcador a partir do grid 7x7 ────────────────────────────
bool ArUcoDetector::getMarkerID(const uint8_t grid[7][7], int& id) {
    // 1. Verificar borda externa (deve ser escura = preta)
    int borderThreshold = 80;
    for (int row = 0; row < ARUCO_CELL_SIZE; row++) {
        for (int col = 0; col < ARUCO_CELL_SIZE; col++) {
            if (row == 0 || row == ARUCO_CELL_SIZE - 1 ||
                col == 0 || col == ARUCO_CELL_SIZE - 1) {
                if (grid[row][col] > borderThreshold) return false;
            }
        }
    }

    // 2. Extrair bits internos 5x5
    uint8_t bits[ARUCO_DICT_SIZE][ARUCO_DICT_SIZE];
    for (int r = 0; r < ARUCO_DICT_SIZE; r++) {
        for (int c = 0; c < ARUCO_DICT_SIZE; c++) {
            bits[r][c] = (grid[r + 1][c + 1] < 128) ? 1 : 0;
        }
    }

    // 3. Codificar em uint32_t
    uint32_t markerBits = 0;
    for (int r = 0; r < ARUCO_DICT_SIZE; r++) {
        for (int c = 0; c < ARUCO_DICT_SIZE; c++) {
            if (bits[r][c])
                markerBits |= (1u << (r * ARUCO_DICT_SIZE + c));
        }
    }

    // 4. Comparar com marcadores conhecidos (testar 4 rotações)
    auto rotate90 = [](uint32_t bits) -> uint32_t {
        uint32_t result = 0;
        for (int r = 0; r < ARUCO_DICT_SIZE; r++) {
            for (int c = 0; c < ARUCO_DICT_SIZE; c++) {
                int srcBit = (bits >> (r * ARUCO_DICT_SIZE + c)) & 1;
                // Rotação 90° CW: new[r][c] = old[DICT-1-c][r]
                int newR = c;
                int newC = ARUCO_DICT_SIZE - 1 - r;
                if (srcBit)
                    result |= (1u << (newR * ARUCO_DICT_SIZE + newC));
            }
        }
        return result;
    };

    for (int k = 0; k < NUM_KNOWN_MARKERS; k++) {
        uint32_t pat = KNOWN_MARKERS[k].bits;
        uint32_t pat90 = rotate90(pat);
        uint32_t pat180 = rotate90(pat90);
        uint32_t pat270 = rotate90(pat180);

        if (markerBits == pat || markerBits == pat90 ||
            markerBits == pat180 || markerBits == pat270) {
            id = KNOWN_MARKERS[k].id;
            return true;
        }
    }

    return false;
}

// ─── Decodificar marcador de um componente ─────────────────────────────────
bool ArUcoDetector::decodeMarker(const uint8_t* gray, int w, int h,
                                  const Component& comp,
                                  DetectedMarker& marker) {
    int bw = comp.x2 - comp.x1;
    int bh = comp.y2 - comp.y1;
    if (bw < 10 || bh < 10) return false;

    // Verificar aspect ratio (deve ser próximo de quadrado)
    float aspect = (float)bw / bh;
    if (aspect < 0.6f || aspect > 1.7f) return false;

    // Centro
    float cx = (comp.x1 + comp.x2) / 2.0f;
    float cy = (comp.y1 + comp.y2) / 2.0f;
    float size = max(bw, bh);

    // Extrair grid 7x7
    uint8_t grid[ARUCO_CELL_SIZE][ARUCO_CELL_SIZE];
    if (!extractGrid(gray, w, h, cx, cy, size, grid)) return false;

    // Obter ID
    int id;
    if (!getMarkerID(grid, id)) return false;

    // Preencher resultado
    marker.id = id;
    marker.cx = cx;
    marker.cy = cy;
    marker.area = comp.area;

    float half = size / 2.0f;
    marker.corners[0][0] = cx - half; marker.corners[0][1] = cy - half;
    marker.corners[1][0] = cx + half; marker.corners[1][1] = cy - half;
    marker.corners[2][0] = cx + half; marker.corners[2][1] = cy + half;
    marker.corners[3][0] = cx - half; marker.corners[3][1] = cy + half;

    return true;
}

// ─── Detect principal ──────────────────────────────────────────────────────
int ArUcoDetector::detect(const uint8_t* grayImage, int width, int height,
                           DetectedMarker* outMarkers, int maxMarkers) {
    if (!grayImage || !outMarkers || maxMarkers <= 0) return 0;

    ensureBuffers(width, height);

    // 1. Threshold adaptativo
    int blockSize = max(width, height) / 8;
    if (blockSize % 2 == 0) blockSize++;
    if (blockSize < 3) blockSize = 3;
    adaptiveThreshold(grayImage, _binaryBuf, width, height, blockSize, 10);

    // 2. Encontrar componentes conectados
    std::vector<Component> components;
    int minArea = (width * height) / 2000;  // ~0.05% da imagem
    if (minArea < 20) minArea = 20;
    findComponents(_binaryBuf, width, height, components, minArea);

    // 3. Processar candidatos
    int found = 0;
    for (const auto& comp : components) {
        if (found >= maxMarkers) break;

        // Filtro adicional: bounding box não deve ser muito grande
        int bw = comp.x2 - comp.x1;
        int bh = comp.y2 - comp.y1;
        int maxDim = min(width, height) / 2;
        if (bw > maxDim || bh > maxDim) continue;

        // Razão de área (area preenchida / area bounding box)
        float areaRatio = (float)comp.area / (bw * bh);
        // Para ArUco (borda fina + interior) a razão deve estar entre ~0.3 e ~0.85
        if (areaRatio < 0.15f || areaRatio > 0.92f) continue;

        if (decodeMarker(grayImage, width, height, comp, outMarkers[found])) {
            found++;
        }
    }

    return found;
}
