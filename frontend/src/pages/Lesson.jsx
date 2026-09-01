import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
    Bot,
    ChevronDown,
    ChevronUp,
    Mic,
    Send,
    VolumeX,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function Lesson({
    topic,
    subtopic,
    onComplete,
}) {
    // =====================================================
    // LESSON STATE
    // =====================================================

    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // CHAT STATE
    // =====================================================

    const [chatOpen, setChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [listening, setListening] = useState(false);

    // =====================================================
    // REFS
    // =====================================================

    const recognitionRef = useRef(null);
    const slidesRef = useRef([]);
    const currentSlideRef = useRef(0);

    // Keep refs updated
    useEffect(() => {
        slidesRef.current = slides;
    }, [slides]);

    useEffect(() => {
        currentSlideRef.current = currentSlide;
    }, [currentSlide]);

    // =====================================================
    // GENERATE LESSON
    // =====================================================

    async function generate() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/lessons/generate`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        topic,
                        subtopic,
                    }),
                }
            );

            const data = await response.json();

            console.log("LESSON RESPONSE:",data);

            if (!response.ok) 
            {
                throw new Error(data.message || "Failed to generate lesson");
            }

            const generatedLesson = data.lesson;

            if (!generatedLesson || !Array.isArray(generatedLesson.slides)) 
            {
                throw new Error("Invalid lesson format received from server");
            }

            if ( generatedLesson.slides.length === 0 ) 
            {
                throw new Error("No slides received from server");
            }

            setSlides(generatedLesson.slides);

            setCurrentSlide(0);

            setSelectedAnswer(null);
            setShowAnswer(false);

            setChatMessages([]);
            setChatInput("");

            slidesRef.current = generatedLesson.slides;
            currentSlideRef.current = 0;

        } catch (err) {
            console.error("Lesson generation error:",err);

            setError(err.message || "Could not generate lesson");

        } finally {
            setLoading(false);
        }
    }


    // =====================================================
    // NEXT SLIDE
    // =====================================================

    function nextSlide() {
        if ( currentSlide < slides.length - 1) {
            setCurrentSlide((prev) => prev + 1);

            setSelectedAnswer(null);
            setShowAnswer(false);

            return;
        }

        // Final slide
        onComplete?.(subtopic);
    }


    // =====================================================
    // PREVIOUS SLIDE
    // =====================================================

    function previousSlide() {
        if (currentSlide > 0) {
            setCurrentSlide((prev) => prev - 1);

            setSelectedAnswer(null);
            setShowAnswer(false);
        }
    }

    // =====================================================
    // MCQ ANSWER
    // =====================================================

    function selectAnswer(index) {
        if (showAnswer) {
            return;
        }

        setSelectedAnswer(index);
        setShowAnswer(true);
    }

    // =====================================================
    // START VOICE LISTENING
    // =====================================================

    function startListening() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Speech recognition is not supported in this browser.");

            return;
        }

        if (listening) {
            return;
        }

        const recognition = new SpeechRecognition();

        recognition.lang = "en-US";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setListening(true);
            setError("");
        };

        recognition.onresult = (event) => {
            const transcript = event.results?.[0]?.[0]?.transcript;

            if (!transcript) {
                return;
            }

            setChatInput(transcript);

            // Automatically send voice question
            sendChatMessage(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:",event.error);

            setListening(false);

            if (event.error === "not-allowed") {
                setError("Microphone permission was denied.");
            } else if (event.error === "no-speech") {
                setError("No speech detected. Please try again.");
            } else {
                setError("Could not understand your voice.");
            }
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (err) {
            console.error("Could not start microphone:",err);
        }
    }

    // =====================================================
    // STOP LISTENING
    // =====================================================

    function stopListening() {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;}

        setListening(false);
    }


    // =====================================================
    // SEND DOUBT TO AI
    // =====================================================

    async function sendChatMessage(text = chatInput) {
        const message = text.trim();

        const slide = slidesRef.current[currentSlideRef.current];

        if ( !message || chatLoading || !slide) {
            return;
        }

        setChatMessages((previous) => [
            ...previous,
            {
                role: "user",
                content: message,
            },
        ]);

        setChatInput("");
        setChatLoading(true);
        setError("");


        try {
            const response =
                await fetch(
                    `${API_URL}/chat/message`,
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type": "application/json",
                        },

                        body: JSON.stringify({
                            message,
                            topic,
                            subtopic,
                            slideTitle:slide.title,
                            slideContent:slide.content || slide.question || "",
                        }),
                    }
                );


            const data = await response.json();


            console.log("CHAT RESPONSE:",data);


            if (!response.ok) {
                throw new Error(data.message ||"Failed to generate AI response");
            }


            const answer = data.answer || "I couldn't generate an answer.";


            // Add AI answer
            setChatMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: answer,
                },
            ]);


            // Speak AI answer
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();

                const speech = new SpeechSynthesisUtterance(answer);

                speech.lang = "en-US";
                speech.rate = 0.95;
                speech.pitch = 1;

                window.speechSynthesis.speak(speech);
            }

        } catch (err) {
            console.error("Chat error:",err);

            setChatMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content:"Sorry, I couldn't answer your doubt right now.",
                },
            ]);

        } finally {
            setChatLoading(false);
        }
    }


    // =====================================================
    // STOP AI VOICE
    // =====================================================

    function stopSpeaking() {
        if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
        }
    }


    // =====================================================
    // CLEAN UP VOICE
    // =====================================================

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }

            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);


    // =====================================================
    // CURRENT SLIDE
    // =====================================================

    const slide = slides[currentSlide];

    // =====================================================
    // UI
    // =====================================================

    return (
        <article className="slide-card">

            {/* =================================================
                LESSON HEADER
            ================================================= */}

            <span className="eyebrow">
                {topic}
            </span>


            <h1>
                {subtopic}
                <em>.</em>
            </h1>


            {/* =================================================
                GENERATE LESSON
            ================================================= */}

            {slides.length === 0 ? (

                <>
                    <p>
                        Generate a focused AI
                        lesson for this concept.
                    </p>


                    <button
                        className="primary-button"
                        onClick={generate}
                        disabled={loading}
                    >
                        {loading
                            ? "Generating..."
                            : "Generate lesson"}
                    </button>
                </>

            ) : (

                <>

                    {/* =========================================
                        CURRENT SLIDE
                    ========================================= */}

                    <div className="lesson-content">

                        <h2>
                            {slide.title}
                        </h2>


                        {/* CONTENT SLIDE */}

                        {slide.type === "content" && (

                            <div className="slide-text">
                                {slide.content}
                            </div>

                        )}


                        {/* CODE SLIDE */}

                        {slide.type === "code" && (

                            <div className="code-slide">

                                <pre>
                                    <code>
                                        {
                                            slide.content
                                        }
                                    </code>
                                </pre>

                            </div>

                        )}


                        {/* MCQ SLIDE */}

                        {slide.type ===
                            "mcq" && (

                            <div className="mcq-slide">

                                <h3>
                                    {
                                        slide.question
                                    }
                                </h3>


                                <div className="mcq-options">

                                    {slide.options.map((option,index
                                        ) => {
                                            const isCorrect = index === slide.correctAnswer;
                                            const isSelected = index === selectedAnswer;
                                            let className = "mcq-option";

                                            if (showAnswer && isCorrect) {
                                                className += " correct";
                                            }


                                            if ( showAnswer && isSelected && !isCorrect) {
                                                className += " incorrect";
                                            }


                                            return (
                                                <button
                                                    key={index}
                                                    className={className}
                                                    onClick={() =>
                                                        selectAnswer(index)
                                                    }
                                                    disabled={showAnswer}
                                                >

                                                    <span>
                                                        {String.fromCharCode(65 +index)}.
                                                    </span>

                                                    {option}

                                                </button>
                                            );
                                        }
                                    )}

                                </div>


                                {/* MCQ Explanation */}

                                {showAnswer && (

                                    <div className="mcq-explanation">

                                        <strong>
                                            {selectedAnswer ===
                                            slide.correctAnswer
                                                ? "Correct! 🎉"
                                                : "Incorrect"}
                                        </strong>

                                        <p>
                                            {
                                                slide.explanation
                                            }
                                        </p>

                                    </div>

                                )}

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        COLLAPSIBLE AI TUTOR
                    ================================================= */}

                    <div
                        className={`slide-chat ${chatOpen? "open": ""}`}
                    >

                        {/* CHAT HEADER */}

                        <button
                            type="button"
                            className="slide-chat-toggle"
                            onClick={() =>
                                setChatOpen((previous) => !previous)}
                        >

                            <div className="slide-chat-toggle-left">

                                <span className="slide-chat-icon">
                                    <Bot
                                        size={18}
                                        strokeWidth={2}
                                    />
                                </span>


                                <div>

                                    <strong>
                                        Ask AI about this slide
                                    </strong>

                                    <span>
                                        {chatOpen ? "Ask a question about what you're learning" : "Need help? Open the tutor"}
                                    </span>

                                </div>

                            </div>


                            <span className="slide-chat-chevron">

                                {chatOpen ? (
                                    <ChevronUp size={18}/>
                                ) : (
                                    <ChevronDown size={18}/>
                                )}

                            </span>

                        </button>


                        {/* CHAT BODY */}

                        {chatOpen && (

                            <div className="slide-chat-body">

                                {/* MESSAGES */}

                                <div className="slide-chat-messages">

                                    {chatMessages.length === 0 && (

                                        <div className="slide-chat-empty">

                                            <Bot
                                                size={26}
                                                strokeWidth={1.8}
                                            />

                                            <p>
                                                Confused about
                                                this slide?
                                                Ask me and I'll
                                                explain it.
                                            </p>

                                        </div>

                                    )}


                                    {chatMessages.map(
                                        (message,index
                                        ) => (

                                            <div
                                                key={index}
                                                className={ message.role === "user" ? "slide-chat-user" : "slide-chat-ai"}
                                            >

                                                <small>
                                                    {message.role === "user" ? "You" : "AI Tutor"}
                                                </small>


                                                <div className="slide-chat-reply">

                                                    {message.role ===
                                                    "assistant" ? (

                                                        <ReactMarkdown>
                                                            {
                                                                message.content
                                                            }
                                                        </ReactMarkdown>

                                                    ) : (

                                                        <p>
                                                            {
                                                                message.content
                                                            }
                                                        </p>

                                                    )}

                                                </div>

                                            </div>

                                        )
                                    )}


                                    {/* Loading */}

                                    {chatLoading && (

                                        <div className="slide-chat-ai">

                                            <small>
                                                AI Tutor
                                            </small>

                                            <div className="slide-chat-reply">

                                                <p>
                                                    Thinking...
                                                </p>

                                            </div>

                                        </div>

                                    )}

                                </div>


                                {/* INPUT */}

                                <div className="slide-chat-input">

                                    <input
                                        value={chatInput}
                                        onChange={(event
                                        ) =>
                                            setChatInput(event.target.value)
                                        }
                                        onKeyDown={(event
                                        ) => {

                                            if (event.key === "Enter" && !event.shiftKey) {
                                                event.preventDefault();
                                                sendChatMessage();
                                            }

                                        }}
                                        placeholder={listening ? "Listening..." : "Ask your doubt..."}
                                        disabled={chatLoading}
                                    />


                                    {/* Microphone */}

                                    <button
                                        type="button"
                                        className={listening ? "chat-icon-button listening": "chat-icon-button"}
                                        onClick={listening ? stopListening : startListening}
                                        disabled={chatLoading}
                                        title={listening ? "Stop listening" : "Ask by voice"}
                                    >

                                        <Mic
                                            size={18}
                                            strokeWidth={2}
                                        />

                                    </button>


                                    {/* Send */}

                                    <button
                                        type="button"
                                        className="chat-icon-button"
                                        onClick={() =>sendChatMessage()}
                                        disabled={chatLoading || !chatInput.trim()}
                                        title="Send message"
                                    >

                                        <Send
                                            size={17}
                                            strokeWidth={2}
                                        />

                                    </button>

                                </div>


                                {/* STOP AI SPEECH */}

                                <button
                                    type="button"
                                    className="chat-stop-voice"
                                    onClick={stopSpeaking}
                                    title="Stop AI voice"
                                >

                                    <VolumeX size={14}/>

                                    <span>
                                        Stop AI voice
                                    </span>

                                </button>

                            </div>

                        )}

                    </div>


                    {/* =================================================
                        SLIDE NAVIGATION
                    ================================================= */}

                    <div className="slide-navigation">

                        <button
                            className="secondary-button"
                            onClick={previousSlide}
                            disabled= {currentSlide === 0}
                        >
                            ← Previous
                        </button>


                        <span className="slide-counter">

                            Slide{" "}
                            {currentSlide + 1}

                            {" / "}

                            {slides.length}

                        </span>


                        <button
                            className="primary-button"
                            onClick={nextSlide}
                        >

                            {currentSlide === slides.length - 1 ? "Complete Lesson →" : "Next →"}

                        </button>

                    </div>

                </>

            )}


            {/* ERROR */}

            {error && (

                <p className="form-error">
                    {error}
                </p>

            )}

        </article>
    );
}