from ultralytics import YOLO
import cv2
import os
import time
from datetime import datetime
from pymongo import MongoClient
import threading

# =====================================================
# BASE PATHS
# =====================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
VIOLATION_DIR = os.path.join(UPLOAD_DIR, "overspeeding")
EMERGENCY_DIR = os.path.join(UPLOAD_DIR, "emergency")
VIDEO_DIR = os.path.join(UPLOAD_DIR, "videos")
MODEL_DIR = os.path.join(BASE_DIR, "models")

os.makedirs(VIOLATION_DIR, exist_ok=True)
os.makedirs(EMERGENCY_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

# =====================================================
# CONFIG
# =====================================================
MODEL_PATH = os.path.join(MODEL_DIR, "Vehicle-detect.pt")

WIDTH, HEIGHT = 1280, 720
CROP_Y_START = 240

MARK1, MARK2 = 150, 400
MARK_GAP_METERS = 15
SPEED_LIMIT_KMPH = 40

VEHICLE_CLASSES = ["car", "truck", "bus", "motorcycle"]
EMERGENCY_CLASSES = ["emergency"]

FPS_LIMIT = 50  # ⛔ prevent CPU overload

# =====================================================
# DATABASE
# =====================================================
client = MongoClient("mongodb://localhost:27017/")
db = client["traffic_monitoring"]

violations_collection = db["violations"]
vehicles_collection = db["vehicles"]
emergency_collection = db["emergency_vehicles"]

print("✅ MongoDB connected")

# =====================================================
# LOAD YOLO
# =====================================================
model = YOLO(MODEL_PATH)
print("✅ YOLO model loaded")

# =====================================================
# THREAD-SAFE SHARED STATE
# =====================================================
frame_lock = threading.Lock()
latest_frame = None

# =====================================================
# HELPERS
# =====================================================
def save_vehicle_image(image, category):
    if image is None or image.size == 0:
        return None

    folder = VIOLATION_DIR if category == "violation" else EMERGENCY_DIR
    db_path = "overspeeding" if category == "violation" else "emergency"

    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}.jpg"
    cv2.imwrite(os.path.join(folder, filename), image)

    return f"{db_path}/{filename}"


def estimate_speed(start, end):
    duration = end - start
    if duration <= 0:
        return 0.0
    return round((MARK_GAP_METERS / duration) * 3.6, 2)


def save_vehicle_data(track_id, speed, label, image, violation, emergency):
    timestamp = datetime.now()

    vehicles_collection.insert_one({
        "vehicle_id": int(track_id),
        "vehicle_type": label,
        "speed": float(speed),
        "timestamp": timestamp,
        "is_violation": violation,
        "is_emergency": emergency,
        "image": image
    })

    if violation:
        violations_collection.insert_one({
            "vehicle_id": int(track_id),
            "vehicle_type": label,
            "speed": float(speed),
            "speed_limit": SPEED_LIMIT_KMPH,
            "over_speed_by": round(speed - SPEED_LIMIT_KMPH, 2),
            "image": image,
            "timestamp": timestamp,
            "location": "Main Road"
        })

    if emergency:
        emergency_collection.insert_one({
            "vehicle_id": int(track_id),
            "vehicle_type": label,
            "status": "Exempted",
            "image": image,
            "timestamp": timestamp
        })

# =====================================================
# STREAMING VIDEO PROCESSOR
# =====================================================
def process_video_stream(video_path):
    global latest_frame

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("❌ Video not found:", video_path)
        return

    start_times = {}
    speeds = {}
    saved_ids = set()

    frame_delay = 1 / FPS_LIMIT

    while True:
        start_loop = time.time()
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (WIDTH, HEIGHT))
        frame = frame[CROP_Y_START:HEIGHT, :]

        results = model.track(frame, persist=True, verbose=False)[0]
        active_ids = set()

        if results.boxes.id is not None:
            for box, track_id in zip(
                results.boxes, results.boxes.id.int().cpu().tolist()
            ):
                active_ids.add(track_id)

                cls = int(box.cls[0])
                label = model.names.get(cls, "unknown")

                if label not in VEHICLE_CLASSES and label not in EMERGENCY_CLASSES:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0])
                bottom_y = y2

                # Timing logic
                if track_id not in start_times and MARK1 < bottom_y < MARK2:
                    start_times[track_id] = time.time()

                if (
                    track_id in start_times
                    and track_id not in speeds
                    and bottom_y > MARK2
                ):
                    speed = estimate_speed(start_times[track_id], time.time())
                    speeds[track_id] = speed

                    if track_id not in saved_ids:
                        cropped = frame[y1:y2, x1:x2]

                        if label in EMERGENCY_CLASSES:
                            img = save_vehicle_image(cropped, "emergency")
                            save_vehicle_data(track_id, 0, label, img, False, True)

                        elif speed > SPEED_LIMIT_KMPH:
                            img = save_vehicle_image(cropped, "violation")
                            save_vehicle_data(track_id, speed, label, img, True, False)

                        else:
                            save_vehicle_data(track_id, speed, label, None, False, False)

                        saved_ids.add(track_id)

                # Draw
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)

                if track_id in speeds:
                    cv2.putText(
                        frame,
                        f"{label} {speeds[track_id]} km/h",
                        (x1, max(y1 - 10, 20)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.6,
                        (0, 255, 0),
                        2
                    )

        # Cleanup exited vehicles
        for tid in list(speeds.keys()):
            if tid not in active_ids:
                speeds.pop(tid, None)
                start_times.pop(tid, None)

        # Encode for browser
        _, buffer = cv2.imencode(".jpg", frame)
        with frame_lock:
            latest_frame = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + latest_frame + b"\r\n"
        )

        sleep_time = frame_delay - (time.time() - start_loop)
        if sleep_time > 0:
            time.sleep(sleep_time)

    cap.release()
    print("✅ Stream finished")
