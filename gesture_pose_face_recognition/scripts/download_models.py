import os
import sys
import urllib.request
import zipfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODELS = {
    "pose_landmarker.task": (
        "https://storage.googleapis.com/mediapipe-models/"
        "pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
    ),
    "face_landmarker.task": (
        "https://storage.googleapis.com/mediapipe-models/"
        "face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
    ),
    "hand_landmarker.task": (
        "https://storage.googleapis.com/mediapipe-models/"
        "hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"
    ),
    "gesture_recognizer.task": (
        "https://storage.googleapis.com/mediapipe-models/"
        "gesture_recognizer/gesture_recognizer/float16/latest/gesture_recognizer.task"
    ),
}


def download_file(url, dest):
    print(f"Baixando {os.path.basename(dest)}...")
    try:
        urllib.request.urlretrieve(url, dest)
        print(f"  OK: {os.path.basename(dest)}")
        return True
    except Exception as e:
        print(f"  ERRO: {e}")
        return False


def main():
    print("Baixando modelos MediaPipe...")
    for filename, url in MODELS.items():
        dest = os.path.join(MODELS_DIR, filename)
        if os.path.exists(dest):
            print(f"  {filename} ja existe, pulando.")
            continue
        download_file(url, dest)

    print(f"\nModelos em: {MODELS_DIR}")
    print("Arquivos:")
    for f in sorted(os.listdir(MODELS_DIR)):
        size = os.path.getsize(os.path.join(MODELS_DIR, f)) / (1024 * 1024)
        print(f"  {f} ({size:.1f} MB)")


if __name__ == "__main__":
    main()
