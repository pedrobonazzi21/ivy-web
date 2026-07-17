import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import cv2
from src.camera import Camera
from src.gesture_recognizer import GestureRecognizer
from src.visualizer import Visualizer
from src.utils import load_config


def main():
    cfg = load_config()
    cam = Camera(
        device_id=cfg["camera"]["device_id"],
        width=cfg["camera"]["width"],
        height=cfg["camera"]["height"],
    )
    gesture = GestureRecognizer(
        classifier_path=cfg["gesture"]["classifier_path"],
        min_detection_confidence=cfg["gesture"]["min_detection_confidence"],
        history_frames=cfg["gesture"]["history_frames"],
        gesture_hold_frames=cfg["gesture"]["gesture_hold_frames"],
    )
    viz = Visualizer(cfg.get("visualization"))

    import time
    print("Demo Gesture Recognition. Pressione 'q' para sair.")
    print("Tem dataset? Treine com scripts/train_gesture.py")

    with cam:
        prev = time.time()
        while True:
            frame = cam.read()
            if frame is None:
                break

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = gesture.detect(rgb)
            hands = results.multi_hand_landmarks

            gesture_text = None
            if hands:
                for h in hands:
                    feats = gesture.extract_features(h)
                    raw = gesture.classify_ml(feats)
                    stable = gesture.get_stable_gesture(raw)
                    if stable:
                        gesture_text = stable
                    n_fingers = gesture.count_fingers(h)
                    info_text = gesture_text or f"{n_fingers} dedos"
                    cv2.putText(frame, info_text, (10, 60),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                frame = gesture.draw(frame, hands, gesture_text)
            else:
                gesture.gesture_history.clear()
                gesture.stable_counter = 0
                gesture.stable_gesture = None

            now = time.time()
            fps = 1.0 / (now - prev + 1e-6)
            prev = now
            viz.draw_fps(frame, fps)

            cv2.imshow("Gesture Recognition Demo", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    gesture.close()
    cam.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
