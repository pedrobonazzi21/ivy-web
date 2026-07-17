import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.gesture_recognizer import GestureRecognizer
from src.utils import load_config


def main():
    cfg = load_config()
    gesture_rec = GestureRecognizer(
        classifier_path=cfg["gesture"]["classifier_path"],
    )

    data_dir = os.path.join("data", "gestures")
    if not os.path.exists(data_dir):
        print(f"Diretório {data_dir} não encontrado.")
        print("Primeiro colete dados com scripts/collect_gestures.py")
        return

    success = gesture_rec.train_from_files(data_dir)
    if success:
        print(f"Modelo salvo em: {cfg['gesture']['classifier_path']}")
    else:
        print("Treinamento falhou.")


if __name__ == "__main__":
    main()
