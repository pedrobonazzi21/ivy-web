import cv2
import sys
import time

from .camera import Camera
from .pose_estimator import PoseEstimator
from .face_recognizer import FaceRecognizer
from .gesture_recognizer import GestureRecognizer
from .visualizer import Visualizer
from .utils import load_config


class SignalRecognitionPipeline:
    def __init__(self, config_path=None):
        self.cfg = load_config(config_path)
        self.camera = Camera(
            device_id=self.cfg["camera"]["device_id"],
            width=self.cfg["camera"]["width"],
            height=self.cfg["camera"]["height"],
        )
        self.visualizer = Visualizer(self.cfg.get("visualization"))
        self.pose = None
        self.face = None
        self.gesture = None
        self._init_modules()

    def _init_modules(self):
        pcfg = self.cfg.get("pose", {})
        self.pose = PoseEstimator(
            model_complexity=pcfg.get("model_complexity", 1),
            min_detection_confidence=pcfg.get("min_detection_confidence", 0.5),
            min_tracking_confidence=pcfg.get("min_tracking_confidence", 0.5),
        )
        fcfg = self.cfg.get("face_recognition", {})
        self.face = FaceRecognizer(
            tolerance=fcfg.get("tolerance", 0.5),
            known_faces_path=fcfg.get("known_faces_path", "data/faces/encodings.pkl"),
        )
        gcfg = self.cfg.get("gesture", {})
        self.gesture = GestureRecognizer(
            classifier_path=gcfg.get("classifier_path", "data/gestures/gesture_classifier.pkl"),
            min_detection_confidence=gcfg.get("min_detection_confidence", 0.5),
            history_frames=gcfg.get("history_frames", 5),
            gesture_hold_frames=gcfg.get("gesture_hold_frames", 3),
        )

    def run(self):
        pc = self.cfg["pipeline"]
        pipeline_cfg = pc

        with self.camera as cam:
            prev_time = time.time()
            print("Pipeline iniciado. Pressione 'q' para sair.")
            print("Teclas: 1- Pose | 2- Face | 3- Gesto | r- Registrar face")

            while True:
                frame = cam.read()
                if frame is None:
                    break

                current_time = time.time()
                fps = 1.0 / (current_time - prev_time + 1e-6)
                prev_time = current_time

                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = {}
                faces = []

                if pipeline_cfg.get("enable_pose", True):
                    pose_results = self.pose.detect(rgb)
                    results["pose_landmarks"] = pose_results.pose_landmarks
                    if pose_results.pose_landmarks:
                        frame = self.pose.draw(frame, pose_results.pose_landmarks)
                        kps = self.pose.extract_keypoints(pose_results.pose_landmarks)
                        results["pose_keypoints"] = kps

                if pipeline_cfg.get("enable_face", True):
                    faces = self.face.detect(rgb)
                    results["faces"] = faces
                    names = []
                    for f in faces:
                        name, _ = self.face.recognize(rgb, f["bbox"])
                        names.append(name)
                    results["face_names"] = names
                    frame = self.face.draw(frame, faces, names)

                if pipeline_cfg.get("enable_gesture", True):
                    gesture_results = self.gesture.detect(rgb)
                    hands = gesture_results.multi_hand_landmarks
                    results["hands"] = hands
                    gesture_text = None
                    if hands:
                        for h in hands:
                            feats = self.gesture.extract_features(h)
                            raw = self.gesture.classify_ml(feats)
                            stable = self.gesture.get_stable_gesture(raw)
                            if stable:
                                gesture_text = stable
                            n_fingers = self.gesture.count_fingers(h)
                            if gesture_text is None:
                                gesture_text = f"{n_fingers} dedos"
                        frame = self.gesture.draw(frame, hands, gesture_text)
                    else:
                        self.gesture.gesture_history.clear()
                        self.gesture.stable_counter = 0
                        self.gesture.stable_gesture = None

                self.visualizer.draw_fps(frame, fps)
                info = [
                    f"Pose: {'ON' if pipeline_cfg.get('enable_pose') else 'OFF'}",
                    f"Face: {'ON' if pipeline_cfg.get('enable_face') else 'OFF'}",
                    f"Gesto: {'ON' if pipeline_cfg.get('enable_gesture') else 'OFF'}",
                ]
                frame = self.visualizer.draw_info_panel(frame, info)

                cv2.imshow("Signal Recognition - Pose + Face + Gesture", frame)
                key = cv2.waitKey(1) & 0xFF

                if key == ord("q"):
                    break
                elif key == ord("1"):
                    pipeline_cfg["enable_pose"] = not pipeline_cfg["enable_pose"]
                elif key == ord("2"):
                    pipeline_cfg["enable_face"] = not pipeline_cfg["enable_face"]
                elif key == ord("3"):
                    pipeline_cfg["enable_gesture"] = not pipeline_cfg["enable_gesture"]
                elif key == ord("r"):
                    self._register_face_interactive(frame, rgb, faces)

        self._cleanup()

    def _register_face_interactive(self, frame, rgb, faces):
        if not faces:
            print("Nenhum rosto detectado para registrar.")
            return
        name = input("Digite o nome da pessoa: ").strip()
        if not name:
            return
        success = self.face.register_face(name, rgb, faces[0]["bbox"])
        if success:
            print(f"Rosto registrado como: {name}")
        else:
            print("Falha ao registrar rosto.")

    def _cleanup(self):
        if self.pose:
            self.pose.close()
        if self.face:
            self.face.close()
        if self.gesture:
            self.gesture.close()
        cv2.destroyAllWindows()
        print("Pipeline encerrado.")


def main():
    pipeline = SignalRecognitionPipeline()
    pipeline.run()


if __name__ == "__main__":
    main()
