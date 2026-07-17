import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import cv2
from src.camera import Camera
from src.pose_estimator import PoseEstimator
from src.visualizer import Visualizer
from src.utils import load_config


def main():
    cfg = load_config()
    cam = Camera(
        device_id=cfg["camera"]["device_id"],
        width=cfg["camera"]["width"],
        height=cfg["camera"]["height"],
    )
    pose = PoseEstimator(
        model_complexity=cfg["pose"]["model_complexity"],
        min_detection_confidence=cfg["pose"]["min_detection_confidence"],
        min_tracking_confidence=cfg["pose"]["min_tracking_confidence"],
    )
    viz = Visualizer(cfg.get("visualization"))

    import time
    print("Demo Pose Estimation. Pressione 'q' para sair.")

    with cam:
        prev = time.time()
        while True:
            frame = cam.read()
            if frame is None:
                break

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.detect(rgb)

            if results.pose_landmarks:
                frame = pose.draw(frame, results.pose_landmarks)
                kps = pose.extract_keypoints(results.pose_landmarks)
                if kps is not None:
                    viz.draw_info_panel(frame, [
                        f"Keypoints: {len(kps)}",
                        f"Visible: {(kps[:, 3] > 0.5).sum()}",
                    ])

            now = time.time()
            fps = 1.0 / (now - prev + 1e-6)
            prev = now
            viz.draw_fps(frame, fps)

            cv2.imshow("Pose Estimation Demo", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    pose.close()
    cam.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
