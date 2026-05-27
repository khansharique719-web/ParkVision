import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

model = YOLO("yolov8s.pt")


# ── Label generator ────────────────────────────────────────────────────────────
def generate_labels(count):
    labels = []
    for r in "ABCDEFGHIJ":
        for c in range(1, 21):
            labels.append(f"{r}{c}")
            if len(labels) == count:
                return labels
    return labels


# ── YOLO detection ─────────────────────────────────────────────────────────────
def detect_cars_yolo(image):
    """
    Run YOLOv8 on the original-resolution image.
    Uses a higher confidence threshold (0.25) to reduce false positives.
    Also tries a 2× upscale pass for small aerial-view vehicles.
    """
    vehicle_classes = [2, 3, 5, 7]
    car_boxes = []

    # Pass 1 – original size
    for result in model(image, verbose=False):
        for box in result.boxes:
            if int(box.cls[0]) in vehicle_classes and float(box.conf[0]) > 0.25:
                car_boxes.append(tuple(map(int, box.xyxy[0])))

    # Pass 2 – upscaled (helps with aerial/small vehicles)
    if len(car_boxes) == 0:
        h, w = image.shape[:2]
        up = cv2.resize(image, (w * 2, h * 2))
        for result in model(up, verbose=False):
            for box in result.boxes:
                if int(box.cls[0]) in vehicle_classes and float(box.conf[0]) > 0.20:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    # Scale back to original coordinates
                    car_boxes.append((x1 // 2, y1 // 2, x2 // 2, y2 // 2))

    return car_boxes


# ── OpenCV slot analyser ───────────────────────────────────────────────────────
def is_occupied_opencv(roi_bgr, roi_gray, roi_hsv, threshold):
    if roi_bgr is None or roi_bgr.size == 0:
        return False

    # --- Edge density: cars have strong edges (doors, windshields, bumpers)
    edges = cv2.Canny(roi_gray, 20, 80)
    edge_density = np.sum(edges > 0) / edges.size

    # --- Saturation: coloured cars vs grey asphalt
    sat = roi_hsv[:, :, 1]
    avg_sat = np.mean(sat)
    high_sat_pixels = np.sum(sat > 25) / sat.size   # fraction with real colour

    # --- Texture variance: cars are textured, empty asphalt is uniform
    variance = np.var(roi_gray)

    # --- Gradient magnitude: strong gradients = object present
    gx = cv2.Sobel(roi_gray, cv2.CV_64F, 1, 0, ksize=3)
    gy = cv2.Sobel(roi_gray, cv2.CV_64F, 0, 1, ksize=3)
    grad_mag = np.mean(np.sqrt(gx**2 + gy**2))

    # --- White-line pixels: empty slots show painted bay lines
    bright = roi_hsv[:, :, 2]
    white_pixels = np.sum((sat < 35) & (bright > 190)) / bright.size

    # --- Uniform grey: characteristic of empty asphalt
    mid_grey = np.sum((bright > 90) & (bright < 155) & (sat < 25)) / bright.size

    # Car score — weighted sum of occupancy indicators
    car_score = (
    edge_density  * 180 +
    avg_sat       * 0.5 +
    high_sat_pixels * 40 +
    variance      / 200 +
    grad_mag      * 0.4
)

    # Empty score — white lines and plain asphalt push score down
    empty_score = (white_pixels * 100) + (mid_grey * 60)

    return car_score > empty_score + threshold


# ── YOLO overlap check ─────────────────────────────────────────────────────────
def slot_overlaps_car(slot, car_boxes, overlap_threshold=0.20):
    sx, sy, sw, sh = slot
    slot_area = sw * sh
    if slot_area == 0:
        return False
    for (cx1, cy1, cx2, cy2) in car_boxes:
        ix1, iy1 = max(sx, cx1), max(sy, cy1)
        ix2, iy2 = min(sx + sw, cx2), min(sy + sh, cy2)
        if ix2 > ix1 and iy2 > iy1:
            if (ix2 - ix1) * (iy2 - iy1) / slot_area > overlap_threshold:
                return True
    return False


# ── Auto threshold ─────────────────────────────────────────────────────────────
def auto_threshold(gray):
    v = np.var(gray)
    if v > 2000:   return 45
    if v > 1000:   return 30
    if v > 500:    return 18
    return 10

# ── Main detection ─────────────────────────────────────────────────────────────
def detect_slots(image, rows, cols):
    """
    Key fixes vs previous version:
    - No forced 640×480 resize — preserve aspect ratio
    - Middle-row skip only for rows >= 5 (avoids falsely marking row 1 in a 2-row lot)
    - Improved OpenCV scoring (asphalt feature added, dark_pixels removed)
    - Two-pass YOLO with upscale for aerial images
    """
    h, w = image.shape[:2]

    # Resize preserving aspect ratio, max 800px wide
    max_w = 800
    if w > max_w:
        scale = max_w / w
        image = cv2.resize(image, (max_w, int(h * scale)))
        h, w = image.shape[:2]

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    hsv  = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    car_boxes  = detect_cars_yolo(image)
    yolo_found = len(car_boxes) > 0
    threshold  = auto_threshold(gray)

    margin_x = int(w * 0.01)
    margin_y = int(h * 0.01)
    usable_w = w - 2 * margin_x
    usable_h = h - 2 * margin_y
    slot_w   = usable_w // cols
    slot_h   = usable_h // rows

    labels  = generate_labels(rows * cols)
    results = []

    for r in range(rows):
        for c in range(cols):
            x   = margin_x + c * slot_w
            y   = margin_y + r * slot_h
            sw  = slot_w - 3
            sh  = slot_h - 3
            idx = r * cols + c

            # Only skip middle row for larger grids (driving aisle)
            if rows >= 5 and r == rows // 2:
                results.append({
                    "id": labels[idx], "status": "free",
                    "x": int(x), "y": int(y), "w": int(sw), "h": int(sh),
                })
                continue

            if yolo_found:
                occupied = slot_overlaps_car((x, y, sw, sh), car_boxes)
            else:
                roi_bgr  = image[y:y+sh, x:x+sw]
                roi_gray = gray[y:y+sh, x:x+sw]
                roi_hsv  = hsv[y:y+sh, x:x+sw]
                occupied = is_occupied_opencv(roi_bgr, roi_gray, roi_hsv, threshold)

            results.append({
                "id": labels[idx],
                "status": "occupied" if occupied else "free",
                "x": int(x), "y": int(y), "w": int(sw), "h": int(sh),
            })

    return results, len(car_boxes)


# ── API endpoints ──────────────────────────────────────────────────────────────
@app.route('/detect', methods=['POST'])
def detect():
    try:
        data        = request.json
        image_bytes = base64.b64decode(data['image'].split(',')[1])
        np_arr      = np.frombuffer(image_bytes, np.uint8)
        image       = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({"error": "Invalid image"}), 400

        rows = int(data.get('rows', 2))
        cols = int(data.get('cols', 4))

        results, cars_detected = detect_slots(image, rows, cols)
        occupied = sum(1 for s in results if s["status"] == "occupied")

        return jsonify({
            "success":       True,
            "slots":         results,
            "total":         len(results),
            "cars_detected": cars_detected,
            "occupied":      occupied,
            "free":          len(results) - occupied,
            "method":        "YOLO" if cars_detected > 0 else "OpenCV",
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ParkVision Detection API running"})


if __name__ == '__main__':
    app.run(port=5001, debug=True)
