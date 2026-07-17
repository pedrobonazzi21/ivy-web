import cv2
import numpy as np


class Visualizer:
    def __init__(self, config=None):
        self.cfg = config or {}

    def draw_info_panel(self, frame, info_lines, position=(10, 30),
                        font_scale=0.6, color=(255, 255, 255),
                        bg_color=(0, 0, 0)):
        overlay = frame.copy()
        y_offset = position[1]
        for line in info_lines:
            cv2.putText(overlay, line, (position[0], y_offset),
                        cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, 2)
            y_offset += 25
        return cv2.addWeighted(overlay, 0.8, frame, 0.2, 0)

    def draw_fps(self, frame, fps, position=None):
        if position is None:
            position = (10, frame.shape[0] - 10)
        cv2.putText(frame, f"FPS: {fps:.1f}", position,
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    def draw_status(self, frame, enabled_modules):
        status_y = 30
        for name, enabled in enabled_modules.items():
            color = (0, 255, 0) if enabled else (0, 0, 255)
            icon = "ON" if enabled else "OFF"
            cv2.putText(frame, f"{name}: {icon}",
                        (10, status_y), cv2.FONT_HERSHEY_SIMPLEX,
                        0.5, color, 1)
            status_y += 20
