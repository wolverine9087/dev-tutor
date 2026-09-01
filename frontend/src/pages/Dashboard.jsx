import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard({
    user,
    topics = [],
    onTopic,
    onProgress,
}) {
    // ==============================
    // QUIZ STATISTICS STATE
    // ==============================

    const [quizStats, setQuizStats] = useState({
        averageScore: 0,
        quizzesCompleted: 0,
    });

    // ==============================
    // FETCH QUIZ STATISTICS
    // ==============================

    useEffect(() => {
        const fetchQuizStats = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:3000/api/progress/quiz-stats",
                    {
                        withCredentials: true,
                    }
                );

                if (response.data?.success) {
                    setQuizStats({
                        averageScore: response.data.averageScore ?? 0,
                        quizzesCompleted: response.data.quizzesCompleted ?? 0,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch quiz statistics:",error);

                // Keep default values if request fails
                setQuizStats({
                    averageScore: 0,
                    quizzesCompleted: 0,
                });
            }
        };

        fetchQuizStats();
    }, []);

    // ==============================
    // EXPLORE CURRICULUM
    // ==============================

    const handleExploreCurriculum = () => {
        const firstTopic = topics[0] || "JavaScript";

        onTopic?.(firstTopic);
    };

    // ==============================
    // TOPIC CLICK
    // ==============================

    const handleTopicClick = (topic) => {
        onTopic?.(topic);
    };

    // ==============================
    // DASHBOARD
    // ==============================

    return (
        <section className="page-section">

            {/* =========================
                WELCOME
            ========================== */}

            <span className="eyebrow">
                {user
                    ? `WELCOME BACK, ${user.name}`
                    : "YOUR PERSONAL AI TUTOR"}
            </span>


            {/* =========================
                HERO
            ========================== */}

            <h1>
                Make progress
                <br />
                <em>feel effortless.</em>
            </h1>

            <p className="page-intro">
                Build real understanding with focused lessons
                and thoughtful practice.
            </p>


            {/* =========================
                EXPLORE CURRICULUM
            ========================== */}

            <button
                type="button"
                className="primary-button"
                onClick={handleExploreCurriculum}
            >
                Explore curriculum →
            </button>


            {/* =========================
                TOPICS
            ========================== */}

            {topics.length > 0 && (
                <div className="topic-grid page-topics">

                    {topics.map((topic) => (
                        <button
                            type="button"
                            className="topic-card"
                            key={topic}
                            onClick={() =>
                                handleTopicClick(topic)
                            }
                        >
                            <h3>{topic}</h3>

                            <p>
                                Continue learning →
                            </p>
                        </button>
                    ))}

                </div>
            )}


            {/* =========================
                QUIZ STATISTICS
            ========================== */}

            <div className="quiz-stats">

                {/* Average Score */}

                <div className="quiz-stat-card">

                    <span className="quiz-stat-label">
                        Average quiz score
                    </span>

                    <strong className="quiz-stat-value">
                        {quizStats.averageScore}%
                    </strong>

                </div>


                {/* Completed Quizzes */}

                <div className="quiz-stat-card">

                    <span className="quiz-stat-label">
                        Quizzes completed
                    </span>

                    <strong className="quiz-stat-value">
                        {quizStats.quizzesCompleted}
                    </strong>

                </div>

            </div>


            {/* =========================
                PROGRESS
            ========================== */}

            <button
                type="button"
                className="text-button"
                onClick={onProgress}
            >
                View progress →
            </button>

        </section>
    );
}