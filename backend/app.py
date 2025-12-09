from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
import base64
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# ---------------- MongoDB Configuration ----------------
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client['traffic_monitoring']

violations_collection = db['violations']
vehicles_collection = db['vehicles']
emergency_vehicles_collection = db['emergency_vehicles']

# ---------------- Upload Directory ----------------
UPLOAD_FOLDER = "uploads/videos"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ============================================================
# 📌 NEW ENDPOINT → Upload Video & Run Detection
# ============================================================

@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    """Upload video, run detection script, save results to MongoDB"""
    
    # Check if video file exists
    if 'video' not in request.files:
        return jsonify({"error": "No video file uploaded"}), 400

    video = request.files['video']
    filename = secure_filename(video.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    # Save video to server
    video.save(filepath)
    print(f"📥 Video saved at: {filepath}")

    # -------------------------
    # TODO: RUN YOUR DETECTION SCRIPT HERE
    # -------------------------
    # Example:
    # from detection_script import analyze_video
    # detection_result = analyze_video(filepath)
    #
    # Expected result format:
    # {
    #   "vehicle_no": "MH12AB1234",
    #   "speed": 75,
    #   "vehicle_type": "car",
    #   "image": "car_123.jpg"
    # }
    # -------------------------

    # TEMPORARY MOCK RESULT (Replace with detection output)
    detection_result = {
        "vehicle_no": "MH12AB1234",
        "speed": 75,
        "vehicle_type": "car",
        "timestamp": datetime.now(),
        "image": "sample.jpg"  # Replace with extracted frame
    }

    # Save detection result to MongoDB
    violations_collection.insert_one(detection_result)

    return jsonify({
        "message": "Video uploaded and processed successfully",
        "video_saved": filename,
        "data_saved": detection_result
    }), 200


# ============================================================
# EXISTING ENDPOINTS BELOW (UNCHANGED)
# ============================================================

@app.route('/api/violations', methods=['GET'])
def get_violations():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    skip = (page - 1) * limit
    
    violations = list(violations_collection.find().sort('timestamp', -1).skip(skip).limit(limit))
    total = violations_collection.count_documents({})
    
    for v in violations:
        v['_id'] = str(v['_id'])
    
    return jsonify({
        'violations': violations,
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit
    })


@app.route('/api/violations/recent', methods=['GET'])
def get_recent_violations():
    limit = int(request.args.get('limit', 5))
    violations = list(violations_collection.find().sort('timestamp', -1).limit(limit))
    
    for v in violations:
        v['_id'] = str(v['_id'])
    
    return jsonify(violations)


@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    total_violations = violations_collection.count_documents({})
    total_vehicles = vehicles_collection.count_documents({})
    
    yesterday = datetime.now() - timedelta(days=1)
    recent_detections = vehicles_collection.count_documents({'timestamp': {'$gte': yesterday}})
    
    week_ago = datetime.now() - timedelta(days=7)
    emergency_count = emergency_vehicles_collection.count_documents({'timestamp': {'$gte': week_ago}})
    
    pipeline = [
        {'$group': {'_id': None, 'avg_speed': {'$avg': '$speed'}}}
    ]
    avg_result = list(violations_collection.aggregate(pipeline))
    avg_speed = round(avg_result[0]['avg_speed'], 2) if avg_result else 0
    
    violation_percentage = round((total_violations / total_vehicles * 100), 2) if total_vehicles > 0 else 0
    
    return jsonify({
        'total_violations': total_violations,
        'total_vehicles': total_vehicles,
        'recent_detections': recent_detections,
        'emergency_vehicles': emergency_count,
        'average_speed': avg_speed,
        'violation_percentage': violation_percentage
    })


@app.route('/api/analytics/daily', methods=['GET'])
def get_daily_analytics():
    days = int(request.args.get('days', 7))
    
    pipeline = [
        {
            '$group': {
                '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$timestamp'}},
                'count': {'$sum': 1},
                'avg_speed': {'$avg': '$speed'}
            }
        },
        {'$sort': {'_id': 1}},
        {'$limit': days}
    ]
    
    results = list(violations_collection.aggregate(pipeline))
    
    return jsonify(results)


@app.route('/api/analytics/hourly', methods=['GET'])
def get_hourly_analytics():
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    pipeline = [
        {'$match': {'timestamp': {'$gte': today}}},
        {
            '$group': {
                '_id': {'$hour': '$timestamp'},
                'count': {'$sum': 1}
            }
        },
        {'$sort': {'_id': 1}}
    ]
    
    results = list(violations_collection.aggregate(pipeline))
    
    return jsonify(results)


@app.route('/api/analytics/vehicle-types', methods=['GET'])
def get_vehicle_type_analytics():
    pipeline = [
        {
            '$group': {
                '_id': '$vehicle_type',
                'count': {'$sum': 1},
                'avg_speed': {'$avg': '$speed'}
            }
        }
    ]
    
    results = list(violations_collection.aggregate(pipeline))
    
    return jsonify(results)


@app.route('/api/emergency-vehicles', methods=['GET'])
def get_emergency_vehicles():
    limit = int(request.args.get('limit', 10))
    emergency = list(emergency_vehicles_collection.find().sort('timestamp', -1).limit(limit))
    
    for e in emergency:
        e['_id'] = str(e['_id'])
    
    return jsonify(emergency)


@app.route('/api/images/<filename>', methods=['GET'])
def get_image(filename):
    return send_from_directory('overspeeding/cars', filename)


@app.route('/api/emergency-images/<filename>', methods=['GET'])
def get_emergency_image(filename):
    return send_from_directory('emergency/vehicles', filename)


@app.route('/api/violations/<violation_id>', methods=['GET'])
def get_violation_detail(violation_id):
    from bson.objectid import ObjectId
    violation = violations_collection.find_one({'_id': ObjectId(violation_id)})
    
    if violation:
        violation['_id'] = str(violation['_id'])
        return jsonify(violation)
    return jsonify({'error': 'Violation not found'}), 404


# ---------------- RUN SERVER ----------------
if __name__ == '__main__':
    print("🚀 Starting Traffic Monitoring Backend API...")
    print("📊 MongoDB Connection:", MONGO_URI)
    app.run(debug=True, port=5000)
