#pragma once

#include <Arduino.h>

// Marcadores ArUco DICT_5X5_50
// Tamanho: 5x5 bits, borda: 1, total: 7x7

#define ARUCO_DICT_SIZE  5
#define ARUCO_BITS       25
#define ARUCO_BORDER     1
#define ARUCO_CELL_SIZE  7

struct MarkerPattern {
    int id;
    uint32_t bits;
};

// Marcadores DICT_5X5_50
static const MarkerPattern KNOWN_MARKERS[] = {
    { 0, 0x018564BA },
    { 1, 0x01313F8F },
    { 2, 0x00891E14 },
    { 3, 0x0020AC7E },
    { 4, 0x01B6A514 },
    { 5, 0x0097DFA8 },
};

static const int NUM_KNOWN_MARKERS = sizeof(KNOWN_MARKERS) / sizeof(KNOWN_MARKERS[0]);
