import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import cv2
from src.camera import Camera
from src.gesture_recognizer import GestureRecognizer
from src.utils import load_config


def main():
    cfg = load_config()
    cam = Camera(
        device_id=cfg["camera"]["device_id"],
        width=cfg["camera"]["width"],
        height=cfg["camera"]["height"],
    )
    gesture_rec = GestureRecognizer(
        classifier_path=cfg["gesture"]["classifier_path"],
        min_detection_confidence=cfg["gesture"]["min_detection_confidence"],
    )

    label = input("Nome do gesto (ex: joinha, ok, paz): ").strip()
    if not label:
        return

    filepath = os.path.join("data", "gestures", f"{label}.pkl")
    print(f"Faça o gesto '{label}' e pressione ESPAÇO para capturar.")
    print("Pressione 'q' para sair.")
    count = 0

    with cam:
        while True:
            frame = cam.read()
            if frame is None:
                break

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = gesture_rec.detect(rgb)
            hands = results.multi_hand_landmarks

            if hands:
                for h in hands:
                    n = gesture_rec.count_fingers(h)
                    cv2.putText(frame, f"Dedos: {n}", (10, 60),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                    gesture_rec.draw(frame, [h])

            cv2.putText(frame, f"Gesto: {label} | Capturas: {count}", (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.imshow("Coletar Gestos", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord(" "):
                if hands:
                    success = gesture_rec.collect_landmarks(hands[0], label, filepath)
                    if success:
                        count += 1
                        print(f"Captura {count} salva para '{label}'.")
                else:
                    print("Nenhuma mão detectada.")
            elif key == ord("q"):
                break

    cam.release()
    cv2.destroyAllWindows()
    print(f"Total: {count} amostras para '{label}'.")


if __name__ == "__main__":
    main()
