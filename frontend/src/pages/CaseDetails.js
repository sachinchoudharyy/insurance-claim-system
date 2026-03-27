import React, { useEffect, useState } from "react";
import { getInterviewDetails, getVideos } from "../services/api";
import { useLocation } from "react-router-dom";
import "../styles/case.css";

export default function CaseDetails() {

  const { state: caseData } = useLocation();

  const [interview, setInterview] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW (carousel state)
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    if (caseData) loadData();
  }, []);

  const loadData = async () => {
    try {
      const interviewRes = await getInterviewDetails(caseData.id);
      const videoRes = await getVideos(caseData.case_id);

      setInterview(interviewRes);
      setVideos(videoRes || []);
    } catch (e) {
      console.error("Error loading case details", e);
    } finally {
      setLoading(false);
    }
  };

  if (!caseData) return <p>No case selected</p>;
  if (loading) return <p>Loading...</p>;
  if (!interview) return <p>No interview found</p>;

  return (
    <div className="page">
      <div className="container">
        <div className="card">

          <h2>Case Details</h2>

          <p><b>Case ID:</b> {caseData.case_id}</p>
          <p><b>Location:</b> {interview.location_text || "N/A"}</p>

          {/* 🎥 VIDEO SECTION */}
          <h3>Videos</h3>

          {videos.length === 0 && <p>No videos available</p>}

          {videos.length > 0 && (
            <div className="video-carousel">

              {/* ◀ PREVIOUS */}
              <button
                className="nav-btn"
                onClick={() =>
                  setCurrentVideo((prev) =>
                    prev === 0 ? videos.length - 1 : prev - 1
                  )
                }
              >
                ◀
              </button>

              {/* 🎬 VIDEO */}
              <div className="video-wrapper">
                <video key={currentVideo} controls>
                  <source
                    src={videos[currentVideo]?.video_url}
                    type="video/webm"
                  />
                </video>

                {/* 🔢 INDEX */}
                <p style={{ textAlign: "center", marginTop: 8 }}>
                  {currentVideo + 1} / {videos.length}
                </p>
              </div>

              {/* ▶ NEXT */}
              <button
                className="nav-btn"
                onClick={() =>
                  setCurrentVideo((prev) =>
                    prev === videos.length - 1 ? 0 : prev + 1
                  )
                }
              >
                ▶
              </button>

            </div>
          )}

          {/* 🧾 TRANSCRIPT */}
          <h3>Transcript</h3>
          <p>{interview.full_transcript || "No transcript available"}</p>

          {/* ❓ Q&A */}
          <h3>Q&A Script</h3>

          {interview.qa_script ? (
            (() => {
              try {
                const parsed = JSON.parse(interview.qa_script);

                if (Array.isArray(parsed)) {
                  return parsed.map((q, i) => (
                    <div key={i}>
                      <p><b>Q:</b> {q.question}</p>
                      <p><b>A:</b> {q.answer}</p>
                    </div>
                  ));
                }

                return <p>{interview.qa_script}</p>;

              } catch {
                return <p>{interview.qa_script}</p>;
              }
            })()
          ) : (
            <p>No Q&A available</p>
          )}

        </div>
      </div>
    </div>
  );
}