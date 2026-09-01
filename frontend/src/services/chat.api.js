import apiRequest from "./api";

export const sendMessage = (message) => apiRequest("/chat/message", {
  method: "POST",
  body: JSON.stringify({ message })
});

export const sendVoice = (audioBlob) => {
  const body = new FormData();
  body.append("audio", audioBlob, "question.webm");
  return apiRequest("/chat/voice", { method: "POST", body });
};
