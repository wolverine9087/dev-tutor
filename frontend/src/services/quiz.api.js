import apiRequest from "./api";

export const generateQuiz = ( topic = null, subtopic = null 
  ) =>
    apiRequest("/quizzes/generate", {
        method: "POST",
        body: JSON.stringify({
            topic,
            subtopic,
        }),
    });

export const getQuiz = (id) => apiRequest(`/quizzes/${id}`);

export const submitQuiz = (id, answers) =>
    apiRequest(`/quizzes/${id}/submit`, {
        method: "POST",
        body: JSON.stringify({
            answers,
        }),
    });

export const getQuizHistory = () => apiRequest("/quizzes/history");