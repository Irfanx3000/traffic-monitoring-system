from flask import Flask, jsonify, request, send_from_directory, Response
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId
import os

# 🔹 YOLO STREAM GENERATOR
from vehicle_detect import process_video_stream

# =====================================================
# APP CONFIG
# =====================================================
app = Flask(__name__)
CORS(app, supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
VIDEO_DIR = os.path.join(UPLOAD_DIR, "videos")

os.makedirs(VIDEO_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "overspeeding"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "emergency"), exist_ok=True)

# =====================================================
# DATABASE
# =====================================================
client = MongoClient(os.getenv("MONGO_URI"))
db = client["traffic_monitoring"]

violations_collection = db["violations"]
vehicles_collection = db["vehicles"]
emergency_collection = db["emergency_vehicles"]

print("✅ MongoDB connected")

# =====================================================
# SERVE UPLOADS
# =====================================================
@app.route("/uploads/<path:filename>")
def serve_uploads(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# =====================================================
# VIDEO UPLOAD
# =====================================================
@app.route("/api/upload-video", methods=["POST"])
def upload_video():
    if "video" not in request.files:
        return jsonify({"error": "No video uploaded"}), 400

    video = request.files["video"]
    if video.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(video.filename)
    video_path = os.path.join(VIDEO_DIR, filename)

    video.save(video_path)

    return jsonify({
        "message": "Video uploaded successfully",
        "video": filename
    })

# =====================================================
# LIVE VIDEO STREAM (MJPEG)
# =====================================================
@app.route("/api/video-stream")
def video_stream():
    video_name = request.args.get("video")
    if not video_name:
        return jsonify({"error": "Video name required"}), 400

    video_path = os.path.join(VIDEO_DIR, video_name)

    if not os.path.exists(video_path):
        return jsonify({"error": "Video not found"}), 404

    return Response(
        process_video_stream(video_path),
        mimetype="multipart/x-mixed-replace; boundary=frame",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Pragma": "no-cache"
        }
    )

# =====================================================
# GET VIOLATIONS
# =====================================================
@app.route("/api/violations", methods=["GET"])
def get_violations():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 10))
    skip = (page - 1) * limit

    data = list(
        violations_collection.find()
        .sort("timestamp", -1)
        .skip(skip)
        .limit(limit)
    )

    total = violations_collection.count_documents({})

    for d in data:
        d["_id"] = str(d["_id"])

    return jsonify({
        "violations": data,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    })

# =====================================================
# RECENT VIOLATIONS
# =====================================================
@app.route("/api/violations/recent", methods=["GET"])
def recent_violations():
    data = list(
        violations_collection.find()
        .sort("timestamp", -1)
        .limit(5)
    )

    for d in data:
        d["_id"] = str(d["_id"])

    return jsonify(data)

# =====================================================
# SINGLE VIOLATION
# =====================================================
@app.route("/api/violations/<id>", methods=["GET"])
def violation_detail(id):
    v = violations_collection.find_one({"_id": ObjectId(id)})
    if not v:
        return jsonify({"error": "Not found"}), 404

    v["_id"] = str(v["_id"])
    return jsonify(v)

# =====================================================
# EMERGENCY VEHICLES
# =====================================================
@app.route("/api/emergency-vehicles", methods=["GET"])
def emergency_vehicles():
    data = list(
        emergency_collection.find()
        .sort("timestamp", -1)
        .limit(10)
    )

    for d in data:
        d["_id"] = str(d["_id"])

    return jsonify(data)

# =====================================================
# DASHBOARD STATISTICS
# =====================================================
@app.route("/api/statistics", methods=["GET"])
def statistics():
    total_violations = violations_collection.count_documents({})
    total_vehicles = vehicles_collection.count_documents({})
    emergency_count = emergency_collection.count_documents({})

    yesterday = datetime.now() - timedelta(days=1)
    recent_detections = vehicles_collection.count_documents({
        "timestamp": {"$gte": yesterday}
    })

    avg = list(violations_collection.aggregate([
        {"$group": {"_id": None, "avg": {"$avg": "$speed"}}}
    ]))
    avg_speed = round(avg[0]["avg"], 2) if avg else 0

    violation_percentage = (
        round((total_violations / total_vehicles) * 100, 2)
        if total_vehicles else 0
    )

    return jsonify({
        "total_violations": total_violations,
        "total_vehicles": total_vehicles,
        "emergency_vehicles": emergency_count,
        "recent_detections": recent_detections,
        "average_speed": avg_speed,
        "violation_percentage": violation_percentage
    })

# =====================================================
# DAILY ANALYTICS
# =====================================================
@app.route("/api/analytics/daily", methods=["GET"])
def daily_analytics():
    pipeline = [
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$timestamp"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    return jsonify(list(violations_collection.aggregate(pipeline)))

# =====================================================
# VEHICLE TYPE ANALYTICS
# =====================================================
@app.route("/api/analytics/vehicle-types", methods=["GET"])
def vehicle_types():
    pipeline = [
        {
            "$group": {
                "_id": "$vehicle_type",
                "count": {"$sum": 1}
            }
        }
    ]
    return jsonify(list(vehicles_collection.aggregate(pipeline)))

# =====================================================
# RUN SERVER (IMPORTANT FLAGS)
# =====================================================
if __name__ == "__main__":
    print("🚀 Backend running at http://localhost:5000")
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        threaded=True,
        use_reloader=False  # 🔥 CRITICAL FOR STREAMING
    )
