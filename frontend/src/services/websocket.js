const WS = "ws://127.0.0.1:8000";

export function connectInterview(interviewId) {
  return new WebSocket(`${WS}/ws/interview/${interviewId}`);
}