from ultralytics import YOLO
import cv2, os, time
from datetime import datetime
from pymongo import MongoClient

# ---------------- CONFIG ----------------
VIDEO_PATH = r"videos/vid.mp4"
MODEL_PATH = r"models/Vehicle-detect.pt"

WIDTH, HEIGHT = 1280, 720
CROP_Y_START = 240
MARK1, MARK2 = 150, 400
MARK_GAP_METERS = 15
SPEED_LIMIT_KMPH = 40

VEHICLE_CLASSES = ['car', 'truck', 'bus', 'motorcycle']
EMERGENCY_CLASSES = ['emergency']

os.makedirs('overspeeding/cars', exist_ok=True)
os.makedirs('emergency/vehicles', exist_ok=True)

# ---------------- MONGODB CONNECTION ----------------
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client['traffic_monitoring']
violations_collection = db['violations']
vehicles_collection = db['vehicles']
emergency_vehicles_collection = db['emergency_vehicles']

print("✅ Connected to MongoDB")

# ---------------- LOAD YOLO MODEL ----------------
model = YOLO(MODEL_PATH)

# ---------------- HELPERS ----------------
def save_vehicle_image(image, vehicle_type='violation'):
    """Save vehicle image based on type"""
    folder = 'overspeeding/cars' if vehicle_type == 'violation' else 'emergency/vehicles'
    filename = f'{datetime.now().strftime("%Y%m%d_%H%M%S_%f")}.jpg'
    path = os.path.join(folder, filename)
    cv2.imwrite(path, image)
    return path, filename

def estimate_speed(start_time, end_time):
    duration = end_time - start_time
    if duration <= 0:
        return 0
    return round((MARK_GAP_METERS / duration) * 3.6, 2)

def save_to_mongodb(track_id, speed, vehicle_type, image_filename, is_violation=False, is_emergency=False):
    """Save vehicle data to MongoDB"""
    timestamp = datetime.now()
    
    # Save to vehicles collection (all detections)
    vehicle_data = {
        'vehicle_id': track_id,
        'speed': speed,
        'vehicle_type': vehicle_type,
        'timestamp': timestamp,
        'is_violation': is_violation,
        'is_emergency': is_emergency,
        'image_filename': image_filename if image_filename else None
    }
    vehicles_collection.insert_one(vehicle_data)
    
    # If emergency vehicle, save separately with image
    if is_emergency:
        emergency_data = {
            'vehicle_id': track_id,
            'vehicle_type': vehicle_type,
            'timestamp': timestamp,
            'status': 'Exempted',
            'image_filename': image_filename
        }
        emergency_vehicles_collection.insert_one(emergency_data)
        print(f"✅ Emergency vehicle data and image saved to MongoDB")
    
    # If violation, save to violations collection
    elif is_violation:
        violation_data = {
            'vehicle_id': track_id,
            'speed': speed,
            'speed_limit': SPEED_LIMIT_KMPH,
            'over_speed_by': speed - SPEED_LIMIT_KMPH,
            'vehicle_type': vehicle_type,
            'image_filename': image_filename,
            'timestamp': timestamp,
            'location': 'Main Road',  # You can customize this
        }
        violations_collection.insert_one(violation_data)
        print(f"✅ Violation data and image saved to MongoDB")

# ---------------- MAIN PROCESS ----------------
def process_video(video_path):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("❌ Could not open video")
        return

    cv2.namedWindow("Vehicle Speed Detection", cv2.WINDOW_NORMAL)

    start_times, end_times, vehicle_speeds = {}, {}, {}

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.resize(frame, (WIDTH, HEIGHT))[CROP_Y_START:HEIGHT, 0:WIDTH]
        display = frame.copy()

        results = model.track(frame, persist=True, verbose=False)[0]

        if results.boxes.id is None:
            cv2.imshow("Vehicle Speed Detection", display)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
            continue

        for box, track_id in zip(results.boxes, results.boxes.id.int().cpu().tolist()):
            cls = int(box.cls[0])
            label = model.names[cls]

            if label not in VEHICLE_CLASSES and label not in EMERGENCY_CLASSES:
                continue

            x1, y1, x2, y2 = map(int, box.xyxy[0])
            bottom_y = y2

            # Draw bounding box
            color = (0, 255, 0) if label in EMERGENCY_CLASSES else (255, 255, 0)
            cv2.rectangle(display, (x1, y1), (x2, y2), color, 2)

            # Start tracking
            if track_id not in start_times and MARK2 > bottom_y > MARK1 and y1 < MARK1:
                start_times[track_id] = time.time()

            # End tracking & calculate speed
            elif track_id in start_times and track_id not in end_times and bottom_y > MARK2:
                end_times[track_id] = time.time()
                speed = estimate_speed(start_times[track_id], end_times[track_id])
                vehicle_speeds[track_id] = (speed, label)

                if label not in EMERGENCY_CLASSES:
                    if speed > SPEED_LIMIT_KMPH:
                        cropped_vehicle = frame[y1:y2, x1:x2]
                        image_path, filename = save_vehicle_image(cropped_vehicle, 'violation')
                        
                        # Save violation to MongoDB
                        save_to_mongodb(track_id, speed, label, filename, is_violation=True)
                        
                        print(f"🚨 {label.upper()} ID {track_id} → {speed} km/h (OVERSPEED) - Image saved")
                    else:
                        # Save normal vehicle to MongoDB
                        save_to_mongodb(track_id, speed, label, None, is_violation=False)
                        print(f"{label.upper()} ID {track_id} → {speed} km/h")
                else:
                    # Save emergency vehicle image and data to MongoDB
                    cropped_vehicle = frame[y1:y2, x1:x2]
                    image_path, filename = save_vehicle_image(cropped_vehicle, 'emergency')
                    save_to_mongodb(track_id, 0, label, filename, is_emergency=True)
                    print(f"✅ {label.upper()} ID {track_id} → Exempted - Image saved")

            # Display speed overlay
            if track_id in vehicle_speeds:
                speed, lbl = vehicle_speeds[track_id]
                text = f"{lbl} {speed} km/h" if lbl not in EMERGENCY_CLASSES else f"{lbl} (Exempt)"
                color = (0, 0, 255) if (speed > SPEED_LIMIT_KMPH and lbl not in EMERGENCY_CLASSES) else (0, 255, 0)
                cv2.putText(display, text, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

        cv2.imshow("Vehicle Speed Detection", display)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("✅ Processing complete. Data saved to MongoDB.")

# ---------------- RUN ----------------
if __name__ == "__main__":
    process_video(VIDEO_PATH)