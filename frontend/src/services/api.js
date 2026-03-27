const BASE = "http://127.0.0.1:8000";

export async function register(phone, name) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone_number: phone,
      name: name
    })
  });

  return res.json();
}

export async function login(phone) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone_number: phone
    })
  });

  return res.json();
}

export async function createCase(data) {
  const res = await fetch(`${BASE}/cases/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function getCases(userId) {
  const res = await fetch(`${BASE}/cases/${userId}`);
  return res.json();
}

export async function getInterviewDetails(caseId) {
  const res = await fetch(`${BASE}/interview/by-case/${caseId}`);
  return res.json();
}

export async function getVideos(caseId) {
  const res = await fetch(`${BASE}/videos/${caseId}`);
  return res.json();
}

// export async function sendOtp(phone) {
//   const res = await fetch(`${BASE}/auth/send-otp`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ phone_number: phone })
//   });
//   return res.json();
// }

// export async function verifyOtp(phone, otp) {
//   const res = await fetch(`${BASE}/auth/verify-otp`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ phone_number: phone, otp })
//   });
//   return res.json();
// }