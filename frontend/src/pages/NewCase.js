import React, { useState } from "react";
import { createCase } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/case.css";

const motorCategories = [
  "Insured",
  "Driver",
  "Claimant",
  "Accident spot",
  "Hospital",
  "Police station",
  "Eye witnesses",
  "Others"
];

export default function NewCase({ setPage, setCurrentCase }) {

  const [claimType, setClaimType] = useState(null);
  const [caseId, setCaseId] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const startCase = async () => {

    const res = await createCase({
      case_id: caseId,
      claim_type: claimType,
      user_id: user.id,
      category: category
    });

    if (res.error) {
      alert(res.error);
      return;
    }

    const caseData = {
      ...res,
      category,
      language
    };

    if (setCurrentCase) setCurrentCase(caseData);
    if (setPage) setPage("interview");

    navigate("/interview", { state: caseData });
  };

  return (
    <div className="page">
      <div className="card case-box">

        <h2>New Case</h2>

        {!claimType && (
          <div className="case-buttons">
            <button onClick={() => setClaimType("health")}>
              Health Insurance
            </button>
            <button onClick={() => setClaimType("motor")}>
              Motor Insurance
            </button>
          </div>
        )}

        {claimType && (
          <>
            <input
              placeholder="Enter Case ID"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />

            {claimType === "motor" && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Select Category</option>
                {motorCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            )}

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>Select Language</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
            </select>

            <button onClick={startCase}>
              Start Interview
            </button>
          </>
        )}

      </div>
    </div>
  );
}