"""
Gerador de padrões de marcadores ArUco para ESP32-CAM.

Uso:
    pip install opencv-python numpy
    python generate_marker_patterns.py --dict DICT_5X5_50 --ids 0 1 2 3 4 5

Saída: gera arquivo marker_definitions.h com os padrões binários.
"""

import cv2
import numpy as np
import argparse
import os

# Dicionários ArUco suportados
DICTS = {
    "DICT_4X4_50": cv2.aruco.DICT_4X4_50,
    "DICT_4X4_100": cv2.aruco.DICT_4X4_100,
    "DICT_4X4_250": cv2.aruco.DICT_4X4_250,
    "DICT_4X4_1000": cv2.aruco.DICT_4X4_1000,
    "DICT_5X5_50": cv2.aruco.DICT_5X5_50,
    "DICT_5X5_100": cv2.aruco.DICT_5X5_100,
    "DICT_5X5_250": cv2.aruco.DICT_5X5_250,
    "DICT_5X5_1000": cv2.aruco.DICT_5X5_1000,
    "DICT_6X6_50": cv2.aruco.DICT_6X6_50,
    "DICT_6X6_100": cv2.aruco.DICT_6X6_100,
    "DICT_6X6_250": cv2.aruco.DICT_6X6_250,
    "DICT_6X6_1000": cv2.aruco.DICT_6X6_1000,
    "DICT_7X7_50": cv2.aruco.DICT_7X7_50,
    "DICT_7X7_100": cv2.aruco.DICT_7X7_100,
    "DICT_7X7_250": cv2.aruco.DICT_7X7_250,
    "DICT_7X7_1000": cv2.aruco.DICT_7X7_1000,
}

def get_dict_size(dict_name):
    """Extrai tamanho do dicionário do nome (ex: DICT_5X5 -> 5)"""
    parts = dict_name.split("_")
    size_part = parts[1]
    sizes = size_part.split("X")
    return int(sizes[0])


def generate_patterns(dict_name, marker_ids):
    """Gera padrões binários para os IDs de marcadores especificados."""
    if dict_name not in DICTS:
        raise ValueError(f"Dicionário não suportado. Use um de: {list(DICTS.keys())}")

    dict_size = get_dict_size(dict_name)
    aruco_dict = cv2.aruco.getPredefinedDictionary(DICTS[dict_name])

    patterns = []
    for marker_id in marker_ids:
        # Gerar imagem do marcador (bits = 0 para branco, 1 para preto)
        marker_size = dict_size + 2  # +2 para borda preta
        img = np.zeros((marker_size, marker_size), dtype=np.uint8)
        img = cv2.aruco.generateImageMarker(aruco_dict, marker_id, marker_size, img, 1)

        # Extrair bits internos (dict_size x dict_size)
        inner = img[1:-1, 1:-1]

        # Codificar como uint32 (linha a linha)
        bits = 0
        for r in range(dict_size):
            for c in range(dict_size):
                if inner[r, c] == 0:  # preto = 1 binário
                    bit_pos = r * dict_size + c
                    bits |= (1 << bit_pos)

        patterns.append({
            "id": marker_id,
            "dict_size": dict_size,
            "bits": bits,
            "hex": f"0x{bits:08X}",
            "grid": inner.tolist(),
        })

    return patterns


def generate_header(patterns, dict_name, output_path):
    """Gera arquivo C++ header com os padrões dos marcadores."""
    dict_size = patterns[0]["dict_size"] if patterns else 5
    border = 1
    cell_size = dict_size + 2 * border

    lines = []
    lines.append("#pragma once")
    lines.append("")
    lines.append('#include <Arduino.h>')
    lines.append("")
    lines.append(f"// Marcadores ArUco {dict_name}")
    lines.append(f"// Tamanho: {dict_size}x{dict_size} bits, borda: {border}, total: {cell_size}x{cell_size}")
    lines.append("")
    lines.append(f"#define ARUCO_DICT_SIZE  {dict_size}")
    lines.append(f"#define ARUCO_BITS       {dict_size * dict_size}")
    lines.append(f"#define ARUCO_BORDER     {border}")
    lines.append(f"#define ARUCO_CELL_SIZE  {cell_size}")
    lines.append("")
    lines.append("struct MarkerPattern {")
    lines.append("    int id;")
    lines.append("    uint32_t bits;")
    lines.append("};")
    lines.append("")

    lines.append(f"// Marcadores {dict_name}")
    lines.append("static const MarkerPattern KNOWN_MARKERS[] = {")

    for p in patterns:
        lines.append(f"    {{ {p['id']}, {p['hex']} }},")

    lines.append("};")
    lines.append("")
    lines.append(f"static const int NUM_KNOWN_MARKERS = sizeof(KNOWN_MARKERS) / sizeof(KNOWN_MARKERS[0]);")
    lines.append("")

    content = "\n".join(lines)

    if output_path:
        with open(output_path, "w") as f:
            f.write(content)
        print(f"Arquivo gerado: {output_path}")
    else:
        print(content)

    return content


def main():
    parser = argparse.ArgumentParser(description="Gera padrões ArUco para ESP32-CAM")
    parser.add_argument("--dict", default="DICT_5X5_50",
                        help="Dicionário ArUco (ex: DICT_5X5_50)")
    parser.add_argument("--ids", nargs="+", type=int,
                        default=[0, 1, 2, 3, 4, 5],
                        help="IDs dos marcadores (ex: 0 1 2 3)")
    parser.add_argument("--output", default=None,
                        help="Caminho do arquivo de saída (opcional)")

    args = parser.parse_args()

    print(f"Gerando padrões para {args.dict}, IDs: {args.ids}")
    patterns = generate_patterns(args.dict, args.ids)

    if args.output is None:
        output_path = os.path.join(
            os.path.dirname(__file__), "..", "src", "marker_definitions.h"
        )
        args.output = output_path

    generate_header(patterns, args.dict, args.output)

    print(f"\nPadrões gerados ({len(patterns)} marcadores):")
    for p in patterns:
        print(f"  ID {p['id']}: {p['hex']}")
        for r in range(p['dict_size']):
            row_str = "".join("█" if c == 0 else " " for c in p['grid'][r])
            print(f"    {row_str}")


if __name__ == "__main__":
    main()
