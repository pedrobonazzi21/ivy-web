import os
import pickle
import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.components.containers.landmark import NormalizedLandmark
import numpy as np
from collections import deque, Counter
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline


MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
HAND_MODEL = os.path.join(MODELS_DIR, "hand_landmarker.task")

FINGER_TIPS = [4, 8, 12, 16, 20]
FINGER_PIPS = [3, 6, 10, 14, 18]


class GestureRecognizer:
    def __init__(self, classifier_path="data/gestures/gesture_classifier.pkl",
                 min_detection_confidence=0.5, history_frames=5,
                 gesture_hold_frames=3):
        self.classifier_path = classifier_path
        self.history_frames = history_frames
        self.gesture_hold_frames = gesture_hold_frames
        self._timestamp = 0

        base_options = python.BaseOptions(model_asset_path=HAND_MODEL)
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.LIVE_STREAM,
            min_hand_detection_confidence=min_detection_confidence,
            min_tracking_confidence=0.5,
            num_hands=2,
            result_callback=self._callback,
        )
        self.landmarker = vision.HandLandmarker.create_from_options(options)
        self._hands = []

        self.classifier = None
        self.gesture_history = deque(maxlen=history_frames)
        self.stable_gesture = None
        self.stable_counter = 0
        self.load_classifier()

    def _callback(self, result, output_image, timestamp_ms):
        self._hands = result.hand_landmarks if result.hand_landmarks else []

    def detect(self, rgb_frame):
        self._timestamp += 1
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        self.landmarker.detect_async(mp_image, self._timestamp)
        return type("HandResult", (), {"multi_hand_landmarks": self._hands})()

    def extract_features(self, hand_landmarks):
        if not hand_landmarks:
            return None
        coords = [(lm.x, lm.y, lm.z) for lm in hand_landmarks]
        wrist = np.array(coords[0])
        features = []
        for pt in coords:
            features.extend([pt[0] - wrist[0], pt[1] - wrist[1], pt[2] - wrist[2]])
        for i in range(0, len(coords) - 2, 3):
            a, b, c = np.array(coords[i]), np.array(coords[i+1]), np.array(coords[i+2])
            va, vb = a - b, c - b
            angle = np.arctan2(np.linalg.norm(np.cross(va, vb)), np.dot(va, vb))
            features.append(angle)
        return np.array(features, dtype=np.float32)

    def is_finger_up(self, hand_landmarks, tip_id, pip_id):
        return hand_landmarks[tip_id].y < hand_landmarks[pip_id].y

    def count_fingers(self, hand_landmarks):
        if not hand_landmarks:
            return 0
        count = 0
        for tip, pip in zip(FINGER_TIPS, FINGER_PIPS):
            if self.is_finger_up(hand_landmarks, tip, pip):
                count += 1
        return count

    def classify_ml(self, features):
        if self.classifier is None or features is None:
            return None
        try:
            return self.classifier.predict(features.reshape(1, -1))[0]
        except Exception:
            return None

    def get_stable_gesture(self, raw_gesture):
        self.gesture_history.append(raw_gesture)
        if len(self.gesture_history) < self.gesture_history.maxlen:
            return None
        most_common = Counter(self.gesture_history).most_common(1)[0]
        gesture_name, count = most_common
        if gesture_name is None:
            self.stable_counter = 0
            self.stable_gesture = None
            return None
        if gesture_name == self.stable_gesture:
            self.stable_counter += 1
        else:
            self.stable_counter = 1
            self.stable_gesture = gesture_name
        if self.stable_counter >= self.gesture_hold_frames:
            return self.stable_gesture
        return None

    def collect_landmarks(self, hand_landmarks, label, filepath):
        features = self.extract_features(hand_landmarks)
        if features is not None:
            data = {"features": features, "label": label}
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "ab") as f:
                pickle.dump(data, f)
            return True
        return False

    def train_from_files(self, data_dir="data/gestures"):
        X, y = [], []
        for fname in os.listdir(data_dir):
            if fname.endswith(".pkl") and fname != "gesture_classifier.pkl":
                filepath = os.path.join(data_dir, fname)
                with open(filepath, "rb") as f:
                    label = fname.replace(".pkl", "")
                    while True:
                        try:
                            data = pickle.load(f)
                            X.append(data["features"])
                            y.append(data["label"])
                        except EOFError:
                            break
        if not X:
            print("Nenhum dado de treinamento encontrado.")
            return False
        X = np.array(X)
        self.classifier = Pipeline([
            ("scaler", StandardScaler()),
            ("knn", KNeighborsClassifier(n_neighbors=3, weights="distance")),
        ])
        self.classifier.fit(X, y)
        self.save_classifier()
        print(f"Modelo treinado com {len(X)} amostras, classes: {set(y)}")
        return True

    def save_classifier(self, path=None):
        path = path or self.classifier_path
        if self.classifier:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "wb") as f:
                pickle.dump(self.classifier, f)

    def load_classifier(self, path=None):
        path = path or self.classifier_path
        if os.path.exists(path):
            with open(path, "rb") as f:
                self.classifier = pickle.load(f)

    def draw(self, frame, hand_landmarks_list, gesture_text=None):
        if hand_landmarks_list:
            drawing = mp.tasks.vision.drawing_utils
            connections = vision.HandLandmarksConnections.HAND_CONNECTIONS
            for hand_landmarks in hand_landmarks_list:
                lm_list = [NormalizedLandmark(x=lm.x, y=lm.y, z=lm.z) for lm in hand_landmarks]
                drawing.draw_landmarks(
                    frame, lm_list, connections,
                    drawing.DrawingSpec(color=(255, 0, 0), thickness=2, circle_radius=2),
                    drawing.DrawingSpec(color=(255, 255, 255), thickness=1),
                )
        if gesture_text:
            cv2.putText(frame, f"Gesto: {gesture_text}",
                        (10, 120), cv2.FONT_HERSHEY_SIMPLEX,
                        1, (0, 255, 0), 2)
        return frame

    def close(self):
        self.landmarker.close()
