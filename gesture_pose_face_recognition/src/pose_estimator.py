import os
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from mediapipe.tasks.python.components.containers.landmark import NormalizedLandmark
import numpy as np


MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
POSE_MODEL = os.path.join(MODELS_DIR, "pose_landmarker.task")


class PoseEstimator:
    def __init__(self, model_complexity=1, min_detection_confidence=0.5,
                 min_tracking_confidence=0.5, enable_segmentation=False):
        base_options = python.BaseOptions(model_asset_path=POSE_MODEL)
        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.LIVE_STREAM,
            min_pose_detection_confidence=min_detection_confidence,
            min_pose_presence_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
            result_callback=self._callback,
        )
        self.landmarker = vision.PoseLandmarker.create_from_options(options)
        self._landmarks = None
        self._timestamp = 0

    def _callback(self, result, output_image, timestamp_ms):
        self._landmarks = result.pose_landmarks[0] if result.pose_landmarks else None

    def detect(self, rgb_frame):
        self._timestamp += 1
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        self.landmarker.detect_async(mp_image, self._timestamp)
        return type("PoseResult", (), {"pose_landmarks": self._landmarks})()

    def extract_keypoints(self, landmarks):
        if not landmarks:
            return None
        return np.array([[lm.x, lm.y, lm.z, getattr(lm, 'visibility', 1.0)]
                         for lm in landmarks])

    def get_landmark_coords(self, landmarks, image_shape):
        h, w = image_shape[:2]
        coords = {}
        if not landmarks:
            return coords
        for idx, lm in enumerate(landmarks):
            cx, cy = int(lm.x * w), int(lm.y * h)
            coords[idx] = (cx, cy, getattr(lm, 'visibility', 1.0))
        return coords

    def draw(self, frame, landmarks):
        if landmarks:
            drawing = mp.tasks.vision.drawing_utils
            connections = vision.PoseLandmarksConnections.POSE_LANDMARKS
            lm_list = [NormalizedLandmark(x=lm.x, y=lm.y, z=lm.z) for lm in landmarks]
            drawing.draw_landmarks(
                frame, lm_list, connections,
                drawing.DrawingSpec(color=(0, 255, 0), thickness=3, circle_radius=3),
                drawing.DrawingSpec(color=(255, 255, 255), thickness=1),
            )
        return frame

    def close(self):
        self.landmarker.close()
