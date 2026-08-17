"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";
import { Loader2, CheckCircle2, AlertCircle, Camera } from "lucide-react";

interface FaceCaptureProps {
  onCapture: (descriptor: Float32Array | null) => void;
  onSkip?: () => void;
}

export function FaceCapture({ onCapture, onSkip }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [confidence, setConfidence] = useState<number>(0);
  const [captured, setCaptured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDescriptor, setCurrentDescriptor] = useState<Float32Array | null>(null);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error loading models:", err);
        setError("Failed to load face detection models.");
      }
    };
    loadModels();
  }, []);

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err) {
      console.error("Error accessing webcam:", err);
      setError("Webcam access denied or unavailable. Please enable permissions.");
    }
  }, []);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setStreamActive(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopWebcam();
  }, [stopWebcam]);

  // Start detection when stream is active
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (streamActive && modelsLoaded && !captured) {
      intervalId = setInterval(async () => {
        if (videoRef.current && videoRef.current.readyState === 4) {
          const detection = await faceapi
            .detectSingleFace(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            setFaceDetected(true);
            setConfidence(Math.round(detection.detection.score * 100));
            setCurrentDescriptor(detection.descriptor);
          } else {
            setFaceDetected(false);
            setConfidence(0);
            setCurrentDescriptor(null);
          }
        }
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [streamActive, modelsLoaded, captured]);

  const handleCapture = () => {
    if (currentDescriptor) {
      setCaptured(true);
      stopWebcam();
      onCapture(currentDescriptor);
    }
  };

  const ringColor = captured
    ? "border-[hsl(var(--color-secondary))]"
    : faceDetected
    ? "border-[hsl(var(--color-secondary))] animate-pulse"
    : "border-amber-400";

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-display font-semibold text-[hsl(var(--foreground))]">Face Verification</h3>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          {error
            ? "Camera error"
            : captured
            ? "Verification complete"
            : "Please position your face in the circle"}
        </p>
      </div>

      <div className="relative flex items-center justify-center w-[300px] h-[300px]">
        {/* Outline Ring */}
        <div
          className={`absolute inset-0 rounded-full border-4 transition-colors duration-300 ${ringColor} face-ring z-10 pointer-events-none`}
        ></div>

        {/* Video or Status Indicator */}
        <div className="w-full h-full rounded-full overflow-hidden bg-[hsl(var(--muted))] relative flex items-center justify-center shadow-inner">
          {error ? (
            <div className="flex flex-col items-center text-red-500">
              <AlertCircle className="w-12 h-12 mb-2" />
              <span className="text-sm px-4 text-center">{error}</span>
            </div>
          ) : !modelsLoaded ? (
            <div className="flex flex-col items-center text-[hsl(var(--color-primary))]">
              <Loader2 className="w-10 h-10 animate-spin mb-2" />
              <span className="text-sm font-medium">Loading models...</span>
            </div>
          ) : captured ? (
            <div className="flex flex-col items-center text-[hsl(var(--color-secondary))] bg-[hsl(var(--color-secondary))/0.1] w-full h-full justify-center">
              <CheckCircle2 className="w-20 h-20 mb-4" />
              <span className="font-semibold text-lg">Captured</span>
            </div>
          ) : !streamActive ? (
            <button
              onClick={startWebcam}
              className="flex flex-col items-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--color-primary))] transition-colors"
            >
              <Camera className="w-12 h-12 mb-2" />
              <span className="font-medium">Start Camera</span>
            </button>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          )}
        </div>
      </div>

      {/* Status Messages & Actions */}
      <div className="flex flex-col items-center w-full max-w-xs space-y-4">
        <div className="h-6">
          {streamActive && !captured && (
            <p
              className={`text-sm font-medium transition-colors ${
                faceDetected ? "text-[hsl(var(--color-secondary))]" : "text-amber-500"
              }`}
            >
              {faceDetected ? `✓ Face Detected! (${confidence}%)` : "Position your face in the circle"}
            </p>
          )}
          {captured && (
            <p className="text-sm font-medium text-[hsl(var(--color-secondary))]">
              Face captured successfully
            </p>
          )}
        </div>

        {!captured && (
          <button
            onClick={handleCapture}
            disabled={!faceDetected || !streamActive}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              faceDetected && streamActive
                ? "bg-[hsl(var(--color-primary))] text-white hover:opacity-90 shadow-md"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
            }`}
          >
            Capture Face
          </button>
        )}

        {onSkip && !captured && (
          <button
            onClick={onSkip}
            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] underline underline-offset-4"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
