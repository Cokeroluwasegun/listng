#!/bin/bash
# Download face-api.js model weights into public/models/
# Run this after `npm install` and before `npm run dev`.
# Models are ~5MB total.

set -e

DEST_DIR="public/models"
mkdir -p "$DEST_DIR"

BASE="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

files=(
  "tiny_face_detector_model-weights_manifest.json"
  "tiny_face_detector_model-shard1"
  "face_landmark_68_model-weights_manifest.json"
  "face_landmark_68_model-shard1"
  "face_recognition_model-weights_manifest.json"
  "face_recognition_model-shard1"
  "face_recognition_model-shard2"
  "face_recognition_model-shard3"
  "face_recognition_model-shard4"
)

echo "Downloading face-api.js model weights..."
for file in "${files[@]}"; do
  if [ -f "$DEST_DIR/$file" ]; then
    echo "  [skip] $file already exists"
  else
    echo "  [downloading] $file"
    curl -fsSL "$BASE/$file" -o "$DEST_DIR/$file"
  fi
done

echo "Done. Models are in $DEST_DIR/"
echo "Update FACE_API_MODEL_PATH in your .env if needed (default: /models)"
