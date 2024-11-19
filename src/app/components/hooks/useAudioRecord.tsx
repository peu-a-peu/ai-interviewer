import { useEffect, useState, useRef } from "react";
import hark from "hark";

export const useRecordVoice = () => {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const silenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceDuration = 2000; // Duration to wait before stopping recording
  const [recordingStatus, setRecordingStatus] = useState<
    "recording" | "paused" | "inactive"
  >("inactive");
  const harkEventsRef = useRef<hark.Harker | null>(null);
  const harkStoppedRef = useRef<boolean>(false);
  const startMediaRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.start();
      setRecordingStatus("recording");
    }
  };

  const pauseMediaRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
      mediaRecorder.current.pause();
      setRecordingStatus("paused");
    }
  };

  const resumeMediaRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === "paused") {
      mediaRecorder.current.resume();
      setRecordingStatus("recording");
    }
  };

  const stopMediaRecording = () => {
    if (
      mediaRecorder.current &&
      ["recording", "paused"].includes(mediaRecorder.current.state)
    ) {
      mediaRecorder.current.stop();
      setRecordingStatus("inactive");
    }
  };

  const initializeMediaRecorder = (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorder.ondataavailable = (event) => {
      chunks.current.push(event.data);
    };

    recorder.onstop = () => {
      const webmBlob = new Blob(chunks.current, { type: "audio/webm" });
      harkStoppedRef.current === false && setAudioBlob(webmBlob);
      chunks.current = []; // Reset chunks for the next recording
    };

    mediaRecorder.current = recorder;
  };

  const startRecording = () => {
    if (!mediaRecorder.current) return;
    const harkEvents = hark(mediaRecorder.current?.stream);
    harkEventsRef.current = harkEvents;

    harkEvents.on("speaking", () => {
      console.log("User is speaking");
      silenceTimeout.current && clearTimeout(silenceTimeout.current);
      // Prevent starting recording if Hark is active
      if (
        mediaRecorder.current &&
        mediaRecorder.current.state !== "recording" &&
        mediaRecorder.current.state !== "paused"
      ) {
        startMediaRecording();
      }
    });

    harkEvents.on("stopped_speaking", () => {
      console.log("User stopped speaking");
      silenceTimeout.current = setTimeout(() => {
        stopMediaRecording();
      }, silenceDuration); // Stop recording after silence duration
    });

    harkStoppedRef.current = false;
  };

  const stopRecording = () => {
    if (harkEventsRef.current) {
      harkEventsRef.current.stop();
      harkEventsRef.current = null;
      harkStoppedRef.current = true;
    }
    silenceTimeout.current && clearTimeout(silenceTimeout.current); // Clear any existing timeouts
    stopMediaRecording();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        .then(initializeMediaRecorder)
        .catch((err) => console.error("Failed to access microphone", err));
    }

    return () => {
      stopRecording();
    };
  }, []);

  return {
    recordingStatus,
    audioBlob,
    startMediaRecording,
    stopMediaRecording,
    startRecording,
    stopRecording,
    pauseMediaRecording,
    resumeMediaRecording,
  };
};
