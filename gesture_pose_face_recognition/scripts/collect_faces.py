import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import cv2
from src.camera import Camera
from src.face_recognizer import FaceRecognizer
from src.utils import load_config


def main():
    cfg = load_config()
    cam = Camera(
        device_id=cfg["camera"]["device_id"],
        width=cfg["camera"]["width"],
        height=cfg["camera"]["height"],
    )
    face_rec = FaceRecognizer(
        tolerance=cfg["face_recognition"]["tolerance"],
        known_faces_path=cfg["face_recognition"]["known_faces_path"],
    )

    name = input("Nome da pessoa a registrar: ").strip()
    if not name:
        return

    print("Pressione ESPAÇO para capturar, 'q' para sair.")
    with cam:
        while True:
            frame = cam.read()
            if frame is None:
                break

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            faces = face_rec.detect(rgb)
            frame = face_rec.draw(frame, faces)
            cv2.imshow("Coletar Faces", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord(" "):
                if faces:
                    face_rec.register_face(name, rgb, faces[0]["bbox"])
                    print(f"Rosto de '{name}' registrado!")
                else:
                    print("Nenhum rosto detectado.")
            elif key == ord("q"):
                break

    cam.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
