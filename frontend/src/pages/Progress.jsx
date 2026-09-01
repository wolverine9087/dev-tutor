import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Trash2,
    Trophy,
} from "lucide-react";
import apiRequest from "../services/api";

export default function Progress({
    progress = [],
    quizzes = [],
}) {
    /*
     * =========================================
     * PROGRESS STATE
     * =========================================
     */

    /*
     * Keep a local copy so the UI updates
     * immediately after deleting a lesson.
     */
    const [progressList, setProgressList] = useState(progress);

    /*
     * =========================================
     * QUIZ STATISTICS STATE
     * =========================================
     */

    const [quizStats, setQuizStats] = useState({
        averageScore: 0,
        quizzesCompleted: 0,
    });

    /*
     * =========================================
     * UPDATE PROGRESS WHEN PARENT CHANGES
     * =========================================
     */

    useEffect(() => {
        setProgressList(progress);
    }, [progress]);

    /*
     * =========================================
     * FETCH QUIZ STATISTICS
     * =========================================
     *
     * Use the same API as Dashboard.jsx.
     *
     * This makes the quiz score here match
     * the score shown on the Dashboard.
     */

    useEffect(() => {
        const fetchQuizStats = async () => {
            try {
                const response = await apiRequest(
                    "/progress/quiz-stats",
                    {
                        method: "GET",
                    }
                );

                if (response?.success) {
                    setQuizStats({
                        averageScore: response.averageScore ?? 0,
                        quizzesCompleted: response.quizzesCompleted ?? 0,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch quiz statistics:",error);

                /*
                 * Keep default values if
                 * request fails.
                 */
                setQuizStats({
                    averageScore: 0,
                    quizzesCompleted: 0,
                });
            }
        };

        fetchQuizStats();
    }, [quizzes]);

    /*
     * =========================================
     * COMPLETED LESSONS
     * =========================================
     */

    const completedLessons = progressList.filter((item) => item.completed === true);

    const totalCompleted = completedLessons.length;

    /*
     * =========================================
     * TOTAL LESSONS
     * =========================================
     */

    const totalLessons = 106;

    /*
     * =========================================
     * OVERALL LESSON PERCENTAGE
     * =========================================
     */

    const percentage = totalLessons > 0 ? Math.round((totalCompleted /totalLessons) *100): 0;

    /*
     * =========================================
     * GROUP COMPLETED LESSONS BY TOPIC
     * =========================================
     */

    const groupedProgress =
        completedLessons.reduce(
            (groups, item) => {
                const topic = item.topic || "Other";

                if (!groups[topic]) {
                    groups[topic] = [];
                }
                groups[topic].push(item);

                return groups;
            },
            {}
        );

    /*
     * =========================================
     * DELETE COMPLETED LESSON
     * =========================================
     */

    const handleDeleteProgress =
        async (id) => {
            try {
                await apiRequest(
                    `/progress/${id}`,
                    {
                        method: "DELETE",
                    }
                );

                /*
                 * Remove the deleted lesson
                 * from the UI immediately.
                 */
                setProgressList(
                    (prev) =>
                        prev.filter(
                            (item) =>
                                item._id !== id
                        )
                );
            } catch (error) {
                console.error(
                    "Failed to delete progress:",
                    error
                );

                alert(
                    "Failed to remove completed lesson."
                );
            }
        };

    /*
     * =========================================
     * RENDER
     * =========================================
     */

    return (
        <section className="page-section progress-page">

            {/* =========================================
                HEADER
            ========================================== */}

            <span className="eyebrow">
                YOUR PROGRESS
            </span>

            <h1>
                Keep going<em>.</em>
            </h1>

            <p className="progress-intro">
                Track your learning progress and
                completed lessons.
            </p>

            {/* =========================================
                OVERALL PROGRESS
            ========================================== */}

            <div className="progress-overview">

                <div className="progress-overview-top">

                    <div>

                        <span className="progress-label">
                            Overall progress
                        </span>

                        <strong className="progress-number">
                            {percentage}%
                        </strong>

                    </div>

                    <div className="progress-count">
                        {totalCompleted} /{" "}
                        {totalLessons} lessons
                    </div>

                </div>

                <div className="progress-track">

                    <div
                        className="progress-fill"
                        style={{
                            width:
                                `${percentage}%`,
                        }}
                    />

                </div>

            </div>

            {/* =========================================
                QUIZ STATISTICS
            ========================================== */}

            <div className="progress-stats">

                {/* Average Quiz Score */}

                <div className="progress-stat-card">

                    <div className="progress-stat-icon">
                        <Trophy size={22} />
                    </div>

                    <div className="progress-stat-content">

                        <span className="progress-stat-label">
                            Average Quiz Score
                        </span>

                        <strong className="progress-stat-number">
                            {quizStats.averageScore}%
                        </strong>

                        <span className="progress-stat-subtext">
                            {quizStats.quizzesCompleted}{" "}
                            {quizStats.quizzesCompleted ===
                            1
                                ? "quiz"
                                : "quizzes"}{" "}
                            completed
                        </span>

                    </div>

                </div>

            </div>

            {/* =========================================
                COMPLETED LESSONS
            ========================================== */}

            <div className="completed-section">

                <div className="section-heading">

                    <h2>
                        Completed lessons
                    </h2>

                    <span>
                        {totalCompleted}
                    </span>

                </div>

                {/* =====================================
                    EMPTY STATE
                ====================================== */}

                {completedLessons.length ===
                0 ? (

                    <div className="progress-empty">

                        <div className="progress-empty-icon">

                            <CheckCircle2
                                size={24}
                            />

                        </div>

                        <h3>
                            No completed lessons yet
                        </h3>

                        <p>
                            Complete your first lesson
                            and your progress will
                            appear here.
                        </p>

                    </div>

                ) : (

                    /* =================================
                       COMPLETED TOPICS
                    ================================== */

                    <div className="progress-topics">

                        {Object.entries(
                            groupedProgress
                        ).map(
                            (
                                [
                                    topic,
                                    lessons,
                                ]
                            ) => (

                                <div
                                    className="progress-topic"
                                    key={topic}
                                >

                                    {/* Topic Header */}

                                    <div className="progress-topic-header">

                                        <div>

                                            <span className="progress-topic-name">
                                                {topic}
                                            </span>

                                            <span className="progress-topic-count">
                                                {lessons.length}{" "}
                                                completed
                                            </span>

                                        </div>

                                    </div>

                                    {/* Lessons */}

                                    <div className="progress-lesson-list">

                                        {lessons.map(
                                            (
                                                lesson
                                            ) => (

                                                <div
                                                    className="progress-lesson"
                                                    key={
                                                        lesson._id ||
                                                        `${lesson.topic}-${lesson.subtopic}`
                                                    }
                                                >

                                                    {/* Check icon */}

                                                    <div className="progress-lesson-check">

                                                        <CheckCircle2 size={16}/>

                                                    </div>

                                                    {/* Lesson information */}

                                                    <div className="progress-lesson-info">

                                                        <strong>
                                                            {lesson.subtopic}
                                                        </strong>

                                                        {lesson.completedAt && (

                                                            <span>
                                                                Completed{" "}
                                                                {new Date(
                                                                    lesson.completedAt
                                                                ).toLocaleDateString()}
                                                            </span>

                                                        )}

                                                    </div>

                                                    {/* Delete button */}

                                                    <button
                                                        type="button"
                                                        className="delete-progress-button"
                                                        title="Remove from completed"
                                                        onClick={() =>
                                                            handleDeleteProgress(
                                                                lesson._id
                                                            )
                                                        }
                                                    >

                                                        <Trash2
                                                            size={16}
                                                            strokeWidth={1.8}
                                                        />

                                                        <span>
                                                            Delete
                                                        </span>

                                                    </button>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </section>
    );
}
