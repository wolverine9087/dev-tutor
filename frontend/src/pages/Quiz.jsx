import { useState } from "react";
import {
    CheckCircle2,
    Trophy,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Loader2,
} from "lucide-react";

function Quiz({
    questions = [],
    loading = false,
    error = "",
    quizId,
    onGenerateQuiz,
    onQuizCompleted,
}) {
    // =========================================
    // STATE
    // =========================================

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // =========================================
    // TOTAL QUESTIONS
    // =========================================

    const totalQuestions = questions.length;

    // =========================================
    // CURRENT QUESTION
    // =========================================

    const question = questions[currentQuestion];

    // =========================================
    // SELECT ANSWER
    // =========================================

    function handleAnswer(answer) {
        if (submitting) {
            return;
        }

        setSelectedAnswer(answer);

        setAnswers((previousAnswers) => ({
            ...previousAnswers,
            [currentQuestion]: answer,
        }));

        setSubmitError("");
    }

    // =========================================
    // PREVIOUS QUESTION
    // =========================================

    function handlePrevious() {
        if (currentQuestion === 0 || submitting) {
            return;
        }

        const previousQuestion = currentQuestion - 1;

        setCurrentQuestion(previousQuestion);

        setSelectedAnswer(
            answers[previousQuestion] !== undefined
                ? answers[previousQuestion]
                : null
        );

        setSubmitError("");
    }

    // =========================================
    // NEXT QUESTION
    // =========================================

    function handleNext() {
        if (selectedAnswer === null || submitting) {
            return;
        }

        // More questions remain
        if (currentQuestion < totalQuestions - 1) {
            const nextQuestion = currentQuestion + 1;

            setCurrentQuestion(nextQuestion);

            setSelectedAnswer(
                answers[nextQuestion] !== undefined
                    ? answers[nextQuestion]
                    : null
            );

            setSubmitError("");

            return;
        }

        // Last question
        submitQuiz();
    }

    // =========================================
    // SUBMIT QUIZ
    // =========================================

    async function submitQuiz() {
        if (!quizId) {
            setSubmitError(
                "Quiz ID is missing. Please generate a new quiz."
            );

            return;
        }

        try {
            setSubmitting(true);
            setSubmitError("");

            // Create answer array
            const answerArray = questions.map(
                (_, index) => answers[index] ?? ""
            );

            console.log("Submitting quiz:", quizId);
            console.log("Answers:", answerArray);

            const response = await fetch(
                `https://dev-tutor-backend.onrender.com/api/quizzes/${quizId}/submit`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        answers: answerArray,
                    }),
                }
            );

            const text = await response.text();

            console.log("Submit status:", response.status);
            console.log("Submit response:", text);

            if (!text) {
                throw new Error(
                    `Server returned an empty response. Status: ${response.status}`
                );
            }

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    `Server returned invalid JSON. Status: ${response.status}`
                );
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        `Failed to submit quiz. Status: ${response.status}`
                );
            }

            console.log("Quiz submitted successfully:", data);

            // Final score
            const finalScore = Number(data.score) || 0;

            const finalTotal =
                Number(data.totalQuestions) || totalQuestions;

            const finalPercentage =
                data.percentage !== undefined &&
                data.percentage !== null
                    ? Number(data.percentage)
                    : Math.round(
                          (finalScore / finalTotal) * 100
                      );

            setScore(finalScore);
            setPercentage(finalPercentage);
            setQuizCompleted(true);

            // Tell App.jsx that quiz is complete
            if (onQuizCompleted) {
                onQuizCompleted({
                    score: finalScore,
                    totalQuestions: finalTotal,
                    percentage: finalPercentage,
                    answers: answerArray,
                    quiz: data.quiz,
                });
            }
        } catch (err) {
            console.error("Submit quiz error:", err);

            if (
                err instanceof TypeError &&
                err.message === "Failed to fetch"
            ) {
                setSubmitError(
                    "Cannot connect to the backend. Make sure your server is running on http://localhost:3000."
                );
            } else {
                setSubmitError(
                    err.message ||
                        "Something went wrong while submitting the quiz."
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    // =========================================
    // GENERATING QUIZ
    // =========================================

    if (loading) {
        return (
            <div className="quiz-container">
                <div className="quiz-card quiz-empty-state">
                    <div className="quiz-empty-icon">
                        <Loader2
                            size={42}
                            className="quiz-spinner"
                        />
                    </div>

                    <h2>Generating Quiz...</h2>

                    <p>
                        Your quiz is being prepared.
                        Please wait a moment.
                    </p>
                </div>
            </div>
        );
    }

    // =========================================
    // NO QUIZ AVAILABLE
    // =========================================

    if (!questions.length) {
        return (
            <div className="quiz-container">
                {/* HEADER */}

                <div className="quiz-header">
                    <div>
                        <span className="quiz-label">
                            PRACTICE
                        </span>

                        <h1>Quiz</h1>

                        <p>
                            Test your understanding and
                            see how much you've learned.
                        </p>
                    </div>
                </div>

                {/* EMPTY STATE */}

                <div className="quiz-card quiz-empty-state">
                    <div className="quiz-empty-icon">
                        <Sparkles size={42} />
                    </div>

                    <h2>No Quiz Available</h2>

                    <p>
                        Generate a quiz to test your
                        knowledge with 20 randomly
                        selected questions.
                    </p>

                    {/* ERROR */}

                    {(error || submitError) && (
                        <div className="quiz-error">
                            {error || submitError}
                        </div>
                    )}

                    {/* GENERATE BUTTON */}

                    <button
                        type="button"
                        className="quiz-generate-btn"
                        onClick={onGenerateQuiz}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={20}
                                    className="quiz-spinner"
                                />

                                Generating Quiz...
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} />

                                Generate Quiz
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // =========================================
    // SAFETY CHECK
    // =========================================

    if (!question) {
        return (
            <div className="quiz-container">
                <div className="quiz-card">
                    <h2>
                        Unable to load question.
                    </h2>

                    <button
                        type="button"
                        className="quiz-generate-btn"
                        onClick={onGenerateQuiz}
                    >
                        <Sparkles size={20} />

                        Generate New Quiz
                    </button>
                </div>
            </div>
        );
    }

    // =========================================
    // QUIZ COMPLETE SCREEN
    // =========================================

    if (quizCompleted) {
        return (
            <div className="quiz-container">
                <div className="quiz-complete">
                    {/* TROPHY */}

                    <div className="quiz-complete-icon">
                        <Trophy size={48} />
                    </div>

                    {/* TITLE */}

                    <h1>QUIZ COMPLETE</h1>

                    <p className="quiz-complete-subtitle">
                        Great job! Here's your final
                        result.
                    </p>

                    {/* SCORE */}

                    <div className="quiz-score">
                        <div className="score-number">
                            {score} / {totalQuestions}
                        </div>

                        <div className="score-percentage">
                            You scored {percentage}%
                        </div>
                    </div>

                    {/* MESSAGE */}

                    <div className="score-message">
                        {percentage >= 80
                            ? "Excellent work!"
                            : percentage >= 60
                            ? "Good job! Keep practicing."
                            : "Keep learning and try again!"}
                    </div>

                    {/* SAVED STATUS */}

                    <div className="quiz-result-status">
                        <CheckCircle2 size={20} />

                        <span>
                            Your score has been saved.
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================
    // PROGRESS
    // =========================================

    const progress =
        ((currentQuestion + 1) / totalQuestions) * 100;

    // =========================================
    // QUIZ SCREEN
    // =========================================

    return (
        <div className="quiz-container">
            {/* HEADER */}

            <div className="quiz-header">
                <div>
                    <span className="quiz-label">
                        PRACTICE
                    </span>

                    <h1>Quiz</h1>

                    <p>
                        Test your understanding and see
                        how much you've learned.
                    </p>
                </div>

                <div className="quiz-progress-text">
                    {currentQuestion + 1} /{" "}
                    {totalQuestions}
                </div>
            </div>

            {/* PROGRESS BAR */}

            <div className="quiz-progress">
                <div
                    className="quiz-progress-fill"
                    style={{
                        width: `${progress}%`,
                    }}
                />
            </div>

            {/* ERROR */}

            {(error || submitError) && (
                <div className="quiz-error">
                    {error || submitError}
                </div>
            )}

            {/* QUESTION CARD */}

            <div className="quiz-card">
                {/* QUESTION HEADER */}

                <div className="question-header">
                    <span className="question-number">
                        QUESTION {currentQuestion + 1}
                    </span>

                    <span className="question-count">
                        {currentQuestion + 1} of{" "}
                        {totalQuestions}
                    </span>
                </div>

                {/* QUESTION */}

                <h2 className="question-text">
                    {question.question}
                </h2>

                {/* OPTIONS */}

                <div className="quiz-options">
                    {Array.isArray(question.options) &&
                        question.options.map(
                            (option, index) => {
                                const isSelected =
                                    selectedAnswer ===
                                    option;

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`quiz-option ${
                                            isSelected
                                                ? "selected"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleAnswer(
                                                option
                                            )
                                        }
                                        disabled={submitting}
                                    >
                                        {/* LETTER */}

                                        <span className="option-letter">
                                            {String.fromCharCode(
                                                65 + index
                                            )}
                                        </span>

                                        {/* TEXT */}

                                        <span className="option-text">
                                            {option}
                                        </span>

                                        {/* SELECTED ICON */}

                                        {isSelected && (
                                            <CheckCircle2
                                                size={22}
                                                className="option-check"
                                            />
                                        )}
                                    </button>
                                );
                            }
                        )}
                </div>

                {/* NAVIGATION */}

                <div className="quiz-navigation">
                    {/* PREVIOUS */}

                    <button
                        type="button"
                        className="quiz-prev-btn"
                        onClick={handlePrevious}
                        disabled={
                            currentQuestion === 0 ||
                            submitting
                        }
                    >
                        <ChevronLeft size={20} />

                        Previous
                    </button>

                    {/* NEXT / FINISH */}

                    <button
                        type="button"
                        className="quiz-next-btn"
                        onClick={handleNext}
                        disabled={
                            selectedAnswer === null ||
                            submitting
                        }
                    >
                        {submitting ? (
                            <>
                                <Loader2
                                    size={20}
                                    className="quiz-spinner"
                                />

                                Submitting...
                            </>
                        ) : currentQuestion ===
                          totalQuestions - 1 ? (
                            <>
                                Finish Quiz

                                <CheckCircle2
                                    size={20}
                                />
                            </>
                        ) : (
                            <>
                                Next

                                <ChevronRight
                                    size={20}
                                />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Quiz;

