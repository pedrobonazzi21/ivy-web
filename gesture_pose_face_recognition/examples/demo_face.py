import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import cv2
from src.camera import Camera
from src.face_recognizer import FaceRecognizer
from src.visualizer import Visualizer
from src.utils import load_config


def main():
    cfg = load_config()
    cam = Camera(
        device_id=cfg["camera"]["device_id"],
        width=cfg["camera"]["width"],
        height=cfg["camera"]["height"],
    )
    face = FaceRecognizer(
        tolerance=cfg["face_recognition"]["tolerance"],
        known_faces_path=cfg["face_recognition"]["known_faces_path"],
    )
    viz = Visualizer(cfg.get("visualization"))

    import time
    print("Demo Face Recognition. Pressione 'q' para sair.")
    print("Pressione 'r' para registrar o rosto na tela.")

    with cam:
        prev = time.time()
        while True:
            frame = cam.read()
            if frame is None:
                break

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            faces = face.detect(rgb)
            names = []
            for f in faces:
                name, dist = face.recognize(rgb, f["bbox"])
                names.append(name)

            frame = face.draw(frame, faces, names)

            now = time.time()
            fps = 1.0 / (now - prev + 1e-6)
            prev = now
            viz.draw_fps(frame, fps)

            cv2.imshow("Face Recognition Demo", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break
            elif key == ord("r"):
                if faces:
                    name = input("Nome: ").strip()
                    if name:
                        face.register_face(name, rgb, faces[0]["bbox"])
                        print(f"{name} registrado!")

    face.close()
    cam.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
