import os
import pickle
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np


MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
FACE_MODEL = os.path.join(MODELS_DIR, "face_landmarker.task")


class FaceRecognizer:
    def __init__(self, tolerance=0.5, known_faces_path="data/faces/encodings.pkl"):
        self.tolerance = tolerance
        self.known_faces_path = known_faces_path
        self.known_encodings = {}
        self.known_names = []
        self._timestamp = 0

        base_options = python.BaseOptions(model_asset_path=FACE_MODEL)
        options = vision.FaceLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.LIVE_STREAM,
            min_face_detection_confidence=0.5,
            result_callback=self._callback,
        )
        self.landmarker = vision.FaceLandmarker.create_from_options(options)
        self._face_landmarks = []
        self._face_blendshapes = []

    def _callback(self, result, output_image, timestamp_ms):
        self._face_landmarks = result.face_landmarks if result.face_landmarks else []
        self._face_blendshapes = result.face_blendshapes if result.face_blendshapes else []

    def detect(self, rgb_frame):
        self._timestamp += 1
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        self.landmarker.detect_async(mp_image, self._timestamp)
        faces = []
        for lm in self._face_landmarks:
            xs = [p.x for p in lm]
            ys = [p.y for p in lm]
            x = int(min(xs) * rgb_frame.shape[1])
            y = int(min(ys) * rgb_frame.shape[0])
            w = int((max(xs) - min(xs)) * rgb_frame.shape[1])
            h = int((max(ys) - min(ys)) * rgb_frame.shape[0])
            faces.append({"bbox": (x, y, w, h), "score": 1.0})
        return faces

    def get_face_encoding(self, rgb_frame, bbox):
        x, y, w, h = bbox
        x, y = max(0, x), max(0, y)
        face_roi = rgb_frame[y:y+h, x:x+w]
        if face_roi.size == 0:
            return None
        face_rgb = cv2.resize(face_roi, (160, 160))
        return face_rgb.flatten().astype(np.float32)

    def recognize(self, rgb_frame, bbox):
        encoding = self.get_face_encoding(rgb_frame, bbox)
        if encoding is None or not self.known_names:
            return "Desconhecido", None

        best_name = "Desconhecido"
        best_dist = float("inf")
        for name, enc in self.known_encodings.items():
            dist = np.linalg.norm(encoding - enc)
            if dist < best_dist:
                best_dist = dist
                best_name = name if dist < self.tolerance else "Desconhecido"
        return best_name, best_dist

    def register_face(self, name, rgb_frame, bbox):
        encoding = self.get_face_encoding(rgb_frame, bbox)
        if encoding is not None:
            self.known_encodings[name] = encoding
            if name not in self.known_names:
                self.known_names.append(name)
            self.save_known_faces()
            return True
        return False

    def save_known_faces(self, path=None):
        path = path or self.known_faces_path
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump({"encodings": self.known_encodings,
                         "names": self.known_names}, f)

    def load_known_faces(self, path=None):
        path = path or self.known_faces_path
        if not os.path.exists(path):
            return
        with open(path, "rb") as f:
            data = pickle.load(f)
            self.known_encodings = data.get("encodings", {})
            self.known_names = data.get("names", [])

    def draw(self, frame, faces, names=None):
        for i, face in enumerate(faces):
            x, y, w, h = face["bbox"]
            name = names[i] if names else ""
            color = (0, 255, 0) if name != "Desconhecido" else (0, 165, 255)
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            label = f"{name}" if name else ""
            cv2.putText(frame, label, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        return frame

    def close(self):
        self.landmarker.close()
