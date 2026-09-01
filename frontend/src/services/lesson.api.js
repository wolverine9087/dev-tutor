import apiRequest from "./api";

export const getCurriculum = (topic) => apiRequest(`/lessons/${encodeURIComponent(topic)}`);

export const generateLesson = (topic, subtopic) => apiRequest("/lessons/generate", {
  method: "POST",
  body: JSON.stringify({ topic, subtopic })
});
