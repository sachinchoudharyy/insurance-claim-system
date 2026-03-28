import React, { useRef, useState } from "react";
import { connectInterview } from "../services/websocket";
import { useLocation } from "react-router-dom";
import "../styles/interview.css";

const BASE = "https://claim-backend-4xum.onrender.com";

export default function Interview(props) {

  const location = useLocation();
  const caseData = location.state || props.caseData;

  const [transcript, setTranscript] = useState([]);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [started, setStarted] = useState(false); // ✅ NEW

  const videoRef = useRef(null);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const stopRecordingRef = useRef(false);
  const pcmBufferRef = useRef([]);

  const wsRef = useRef(null);
  const interviewIdRef = useRef(null);

  const audioContextRef = useRef(null);
  const processorRef = useRef(null);

  /* ---------------- LOCATION ---------------- */

  const getLocation = () =>
    new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
          setGpsLocation(loc);
          resolve(loc);
        },
        () => resolve(null)
      );
    });

  /* ---------------- VIDEO ---------------- */

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      recordSegment(stream);

    } catch (err) {
      alert("Camera/Microphone permission required");
      console.error(err);
      throw err;
    }
  };

  const recordSegment = (stream) => {
    let mimeType = "video/webm";

    if (!MediaRecorder.isTypeSupported("video/webm")) {
      mimeType = "";
    }

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    let chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = async () => {
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: mimeType || "video/webm" });

        const form = new FormData();
        form.append("file", blob);
        form.append("interview_id", interviewIdRef.current);
        form.append("case_id", caseData.case_id);

        fetch(`${BASE}/upload-video`, {
          method: "POST",
          body: form
        });
      }

      chunks = [];

      if (!stopRecordingRef.current) {
        recordSegment(stream);
      }
    };

    recorder.start();
    recorderRef.current = recorder;

    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    }, 30000);
  };

  /* ---------------- AUDIO ---------------- */

  const startAudio = async () => {
    const stream = streamRef.current;

    const audioContext = new AudioContext({ sampleRate: 48000 });
    audioContextRef.current = audioContext;

    // ✅ FIX FOR MOBILE
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processorRef.current = processor;

    source.connect(processor);
    processor.connect(audioContext.destination);

    pcmBufferRef.current = [];

    processor.onaudioprocess = (e) => {
      const floatData = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(floatData.length);

      for (let i = 0; i < floatData.length; i++) {
        let s = Math.max(-1, Math.min(1, floatData[i]));
        pcm16[i] = s * 32767;
      }

      pcmBufferRef.current.push(...pcm16);

      if (pcmBufferRef.current.length >= 48000 * 2) {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const chunk = new Int16Array(pcmBufferRef.current);
          wsRef.current.send(chunk.buffer);
        }
        pcmBufferRef.current = [];
      }
    };
  };

  /* ---------------- START ---------------- */

  const startInterview = async () => {
    try {
      stopRecordingRef.current = false;

      const loc = await getLocation();

      const res = await fetch(`${BASE}/interview/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          case_id: caseData.id,
          category: caseData.category,
          language: caseData.language,
          location: loc
        })
      });

      const data = await res.json();

      interviewIdRef.current = data.id;
      setAddress(data.location_text);

      wsRef.current = connectInterview(data.id);

      wsRef.current.onmessage = (e) => {
        const msg = JSON.parse(e.data);

        if (msg.type === "transcript") {
          setTranscript((prev) => [...prev, msg.text]);
        }

        if (msg.type === "completed") {
          console.log("Interview complete", msg.qa);
        }
      };

      await startVideo();
      await startAudio();

    } catch (err) {
      console.error("Start failed:", err);
      setStarted(false);
    }
  };

  /* ---------------- END ---------------- */

  const endInterview = async () => {
    stopRecordingRef.current = true;

    if (
      pcmBufferRef.current.length > 0 &&
      wsRef.current?.readyState === WebSocket.OPEN
    ) {
      const finalChunk = new Int16Array(pcmBufferRef.current);
      wsRef.current.send(finalChunk.buffer);
      pcmBufferRef.current = [];
    }

    await new Promise((r) => setTimeout(r, 800));

    await fetch(`${BASE}/interview/end/${interviewIdRef.current}`, {
      method: "POST"
    });

    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    alert("Interview Completed");
    setStarted(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="page">
      <div className="container">
        <div className="card interview-box">

          <h2>Interview Recording</h2>

          <div className="video-box">
            <video ref={videoRef} autoPlay muted playsInline />
          </div>

          {address && (
            <p className="location-text">
              📍 {address}
            </p>
          )}

          {!started ? (
            <button
              onClick={async () => {
                setStarted(true);
                await startInterview();
              }}
            >
              Start Interview
            </button>
          ) : (
            <button onClick={endInterview}>
              End Interview
            </button>
          )}

          <div className="transcript-box">
            <h3>Transcript</h3>

            {transcript.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}