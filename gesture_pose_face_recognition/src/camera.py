import cv2


class Camera:
    def __init__(self, device_id=0, width=640, height=480):
        self.device_id = device_id
        self.width = width
        self.height = height
        self._cap = None

    def start(self):
        self._cap = cv2.VideoCapture(self.device_id)
        self._cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
        self._cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
        if not self._cap.isOpened():
            raise RuntimeError(f"Não foi possível abrir câmera {self.device_id}")
        return self

    def read(self):
        ret, frame = self._cap.read()
        if not ret:
            return None
        return cv2.flip(frame, 1)

    def release(self):
        if self._cap:
            self._cap.release()

    def __enter__(self):
        return self.start()

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()
