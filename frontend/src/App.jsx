import { useEffect, useState } from "react";
import "./App.css";

import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";

import AiChat from "./pages/AiChat";
import Curriculum from "./pages/Curriculum";
import Dashboard from "./pages/Dashboard";
import Lesson from "./pages/Lesson";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Quiz from "./pages/Quiz";
import Register from "./pages/Register";

import apiRequest from "./services/api";
import { generateQuiz } from "./services/quiz.api";


const topics = ["HTML","CSS","JavaScript","React","Backend","DataBase","DSA",];


export default function App() {

    const { user, loading: authLoading } = useAuth();


    // ==========================================
    // APP STATE
    // ==========================================
    const [page, setPage] = useState("dashboard");
    const [authPage, setAuthPage] = useState("login");
    const [selectedTopic, setSelectedTopic] = useState("JavaScript");
    const [selectedSubtopic, setSelectedSubtopic] = useState("");
    const [questions, setQuestions] = useState([]);
    const [progress, setProgress] = useState([]);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState("");

    // ID of the currently generated quiz
    const [currentQuizId, setCurrentQuizId] = useState(null);


    // ==========================================
    // LOAD PROGRESS
    // ==========================================

    async function loadProgress() {
      try {
        
        const data = await apiRequest("/progress/");
        setProgress( data.progress || [] );

      } catch (error) {

        console.error("Failed to load progress:", error);

      }
    }

    // ==========================================
    // LOAD USER DATA
    // ==========================================

    useEffect(() => {

        if (!user) {
            return;
        }

        loadProgress();

    }, [user]);

    // ==========================================
    // OPEN TOPIC
    // ==========================================

    function openTopic(topic) {

        setSelectedTopic(topic);
        setSelectedSubtopic("");
        setPage("curriculum");

    }

    // ==========================================
    // RANDOM PRACTICE QUIZ
    // ==========================================

    async function openRandomQuiz() {

        setPage("quiz");
        setQuizLoading(true);
        setQuizError("");
        setQuestions([]);
        setCurrentQuizId(null);

        try {

            console.log("Generating random quiz");


            /*
             * No topic or subtopic is sent.
             *
             * Backend should randomly
             * select a topic.
             */

            const data = await generateQuiz();

            console.log("Random quiz response:", data);

            const quiz = data?.quiz;


            if (!quiz) {

                throw new Error("Quiz was not returned by the server");

            }

            const generatedQuestions = quiz?.questions || quiz?.question || [];
            setCurrentQuizId( quiz?._id || null);
            setQuestions(generatedQuestions);

        } catch (error) {

            console.error("Random quiz generation failed:",error);

            setQuizError(error?.response?.data?.message || error?.message || "Unable to generate random quiz.");

        } finally {

            setQuizLoading(false);

        }
    }


    // ==========================================
    // SUBTOPIC QUIZ
    // ==========================================

    async function openSubtopicQuiz(topic, subtopic) {

        setPage("quiz");
        setQuizLoading(true);
        setQuizError("");
        setQuestions([]);
        setCurrentQuizId(null);

        try {

            console.log("Generating quiz for:",topic,subtopic);

            /*
             * Send both topic and subtopic.
             *
             * Backend should generate
             * questions specifically
             * for this subtopic.
             */

            const data = await generateQuiz(topic,subtopic);

            console.log("Subtopic quiz response:",data);

            const quiz = data?.quiz;


            if (!quiz) {

                throw new Error("Quiz was not returned by the server");

            }


            const generatedQuestions = quiz?.questions || quiz?.question || [];

            setCurrentQuizId( quiz?._id || null );
            setQuestions(generatedQuestions);

        } catch (error) {

            console.error("Subtopic quiz generation failed:",error);

            setQuizError( error?.response?.data?.message || error?.message || "Unable to generate quiz.");

        } finally {

            setQuizLoading(false);

        }
    }

    // ==========================================
    // on quiz completed
    // ==========================================

    async function handleQuizCompleted(score) {
      console.log("Quiz completed with score:", score);
      await loadProgress();
    }

    // ==========================================
    // COMPLETE LESSON
    // ==========================================

    async function completeLesson() {
        console.log("1. completeLesson called");

        try {

            const response =
                await apiRequest(
                    "/progress/complete",
                    {
                        method: "POST",

                        body: JSON.stringify({
                            topic:selectedTopic,
                            subtopic:selectedSubtopic,
                        }),
                    }
                );


            console.log("2. Complete response:",response);
            await loadProgress();
            console.log("3. Progress refreshed");
            setPage("curriculum");

        } catch (error) {

            console.error("Failed to complete lesson:",error);

        }
    }

    // ==========================================
    // NAVIGATION
    // ==========================================

    function navigate(nextPage) {

        /*
         * Sidebar Practice button
         *
         * This creates a RANDOM quiz.
         */

        if (nextPage === "quiz") {

            openRandomQuiz();

            return;
        }


        setPage(nextPage);

    }


    // ==========================================
    // RENDER PAGE
    // ==========================================

    function renderPage() {


        // ======================================
        // CURRICULUM
        // ======================================

        if (page === "curriculum") {
            return (
                <Curriculum
                    topics={topics}
                    selectedTopic={selectedTopic}
                    onSelectTopic={openTopic}
                    progress={progress}
                    onSelectSubtopic={
                        (item) => {
                            setSelectedSubtopic(item);
                            setPage("lesson");
                        }
                    }
                />
            );
        }

        // ======================================
        // LESSON
        // ======================================

        if (page === "lesson") {

            return (
                <Lesson
                    topic={selectedTopic}
                    subtopic={selectedSubtopic}
                    onComplete={completeLesson}
                    /*
                     * Allows the Lesson page
                     * to generate a quiz specifically
                     * for the current subtopic.
                     */
                    onQuiz={openSubtopicQuiz}
                />
            );
        }

        // ======================================
        // QUIZ
        // ======================================

        if (page === "quiz") {

            return (
                <Quiz
                    questions={questions}
                    loading={quizLoading}
                    error={quizError}
                    quizId={currentQuizId}
                    onGenerateQuiz={openRandomQuiz}
                    onQuizCompleted={handleQuizCompleted}
                />
            );
        }

        // ======================================
        // PROGRESS
        // ======================================

        if (page === "progress") {

            return (
                <Progress
                    progress={progress}
                    /*
                     * After deleting a lesson
                     * from Progress.jsx, refresh
                     * App.jsx's progress state.
                     */
                    onProgressChanged={loadProgress}
                />
            );
        }

        // ======================================
        // AI CHAT
        // ======================================

        if (page === "chat") {

            return (
                <AiChat
                    topic={selectedTopic}
                    subtopic={selectedSubtopic}
                    onComplete={completeLesson}
                />
            );
        }

        // ======================================
        // PROFILE
        // ======================================

        if (page === "profile") {

            return <Profile />;

        }

        // ======================================
        // DASHBOARD
        // ======================================

        return (
            <Dashboard
                user={user}
                topics={topics}
                onTopic={openTopic}
                onProgress={() =>setPage("progress")}
            />
        );
    }


    // ==========================================
    // AUTH LOADING
    // ==========================================

    if (authLoading) {

        return (
            <div className="app-loading">
              <div className="spinner">
                <p>
                    Preparing your
                    learning space...
                </p>
              </div>
            </div>
        );
    }


    // ==========================================
    // NOT LOGGED IN
    // ==========================================

    if (!user) {
        return (
            <main className="auth-shell">
                {authPage === "login" ? (
                    <Login
                        onSuccess={() => setPage("dashboard")}
                        onRegister={() => setAuthPage("register")}
                    />
                ) : (
                    <Register
                        onSuccess={() => setPage("dashboard")}
                        onLogin={() => setAuthPage("login")}
                    />
                )}
            </main>
        );
    }


    // ==========================================
    // MAIN APP
    // ==========================================

    return (
        <div className="app-layout">
            <Sidebar
                activePage={page}
                onNavigate={navigate}
                user={user}
                onProfile={() => setPage("profile")}
            />

            <main className="app-main">
                {renderPage()}
            </main>
        </div>
    );
}

