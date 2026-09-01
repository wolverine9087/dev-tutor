import { useEffect, useRef, useState } from "react";
import {Bot, Mic, Send, VolumeX, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function AiChat() { 
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [listening, setListening] = useState(false);
    const [error, setError] = useState("");

    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Speech recognition is not supported in this browser.");
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
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
            sendMessage(transcript);
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

        return () => { recognition.stop() };
    }, []);

    function startListening() {
        if (!recognitionRef.current || listening) {
            return;
        }

        setMessage("");
        setError("");

        try {
            recognitionRef.current.start();
        } catch (error) {
            console.error(error);
        }
    }

    function stopListening() {
        recognitionRef.current?.stop();
        setListening(false);
    }

    async function sendMessage(text = message) {
        const userMessage = text.trim();

        if (!userMessage || loading) {
            return;
        }

        setMessages((previous) => [
            ...previous,
            {
                role: "user",
                content: userMessage,
            },
        ]);

        setMessage("");
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/chat/message`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        message: userMessage,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to generate response"
                );
            }

            const answer =
                data.answer ||
                "I couldn't generate an answer.";

            setMessages((previous) => [
                ...previous,
                {
                    role: "assistant",
                    content: answer,
                },
            ]);

            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();

                const speech =
                    new SpeechSynthesisUtterance(answer);

                speech.lang = "en-US";
                speech.rate = 0.95;

                window.speechSynthesis.speak(
                    speech
                );
            }
        } catch (error) {
            console.error("Chat error:", error);

            setError(error.message ||"Failed to generate response");
        } finally {
            setLoading(false);
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function stopSpeaking() {
        window.speechSynthesis?.cancel();
    }

    return (
        <section className="page-section ai-tutor-page">

            {/* Header */}

            <div className="ai-tutor-hero">

                <div className="ai-tutor-badge">
                    <Sparkles size={14} />
                    <span>AI POWERED LEARNING</span>
                </div>

                <h1>
                    Your AI Tutor<em>.</em>
                </h1>

                <p>
                    Ask questions, clear concepts,
                    debug errors, and understand
                    difficult topics step by step.
                </p>

            </div>


            {/* Main Chat Card */}

            <div className="ai-tutor-card">

                <div className="ai-tutor-card-header">

                    <div className="ai-tutor-identity">

                        <div className="ai-tutor-avatar">
                            <Bot
                                size={21}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div>
                            <strong>
                                AI Tutor
                            </strong>

                            <span>
                                Ready to help
                            </span>
                        </div>

                    </div>


                    <button
                        type="button"
                        className="ai-tutor-stop-button"
                        onClick={stopSpeaking}
                        title="Stop AI voice"
                    >
                        <VolumeX size={17} />
                    </button>

                </div>


                {/* Chat body */}

                <div className="ai-tutor-messages">

                    {messages.length === 0 ? (

                        <div className="ai-tutor-empty">

                            <div className="ai-tutor-empty-icon">
                                <Bot
                                    size={30}
                                    strokeWidth={1.7}
                                />
                            </div>

                            <h2>
                                How can I help?
                            </h2>

                            <p>
                                Ask about a concept,
                                an error, a piece of
                                code, or a project idea.
                            </p>

                        </div>

                    ) : (

                        messages.map(
                            (item, index) => (

                                <div
                                    key={index}
                                    className={
                                        item.role === "user"
                                            ? "ai-chat-message user"
                                            : "ai-chat-message assistant"
                                    }
                                >

                                    <span>
                                        {item.role === "user"
                                            ? "You"
                                            : "AI Tutor"}
                                    </span>

                                    <div className="ai-chat-bubble">
                                        {item.content}
                                    </div>

                                </div>
                            )
                        )
                    )}


                    {loading && (

                        <div className="ai-chat-message assistant">

                            <span>
                                AI Tutor
                            </span>

                            <div className="ai-chat-bubble ai-chat-thinking">
                                Thinking...
                            </div>

                        </div>
                    )}

                </div>


                {/* Error */}

                {error && (
                    <div className="ai-tutor-error">
                        {error}
                    </div>
                )}


                {/* Input */}

                <div className="ai-tutor-input-area">

                    <input
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value
                            )
                        }
                        onKeyDown={handleKeyDown}
                        placeholder={
                            listening
                                ? "Listening..."
                                : "Ask your tutor..."
                        }
                        disabled={loading}
                    />


                    <button
                        type="button"
                        className={
                            listening
                                ? "ai-tutor-icon-button listening"
                                : "ai-tutor-icon-button"
                        }
                        onClick={
                            listening
                                ? stopListening
                                : startListening
                        }
                        disabled={loading}
                        title={
                            listening
                                ? "Stop listening"
                                : "Speak your doubt"
                        }
                    >
                        <Mic size={18} />
                    </button>


                    <button
                        type="button"
                        className="ai-tutor-send-button"
                        onClick={() =>
                            sendMessage()
                        }
                        disabled={
                            loading ||
                            !message.trim()
                        }
                        title="Send message"
                    >
                        <Send size={17} />
                    </button>

                </div>


                <div className="ai-tutor-hint">
                    Press Enter to send
                </div>

            </div>

        </section>
    );
}