import curriculum from "../data/curriculum.js";

const defaultTopics = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Backend",
    "Database",
    "DSA",
];

export default function Curriculum({
    topics = defaultTopics,
    selectedTopic,
    progress = [],
    onSelectTopic,
    onSelectSubtopic,
}) {
    const subtopics = curriculum[selectedTopic?.toUpperCase()] || [];

    return (
        <section className="page-section">

            <span className="eyebrow">
                LEARNING PATH
            </span>

            <h1>
                Curriculum<em>.</em>
            </h1>

            <div className="topic-switcher">

                {topics.map((topic) => (
                    <button
                        className={
                            topic === selectedTopic
                                ? "selected"
                                : ""
                        }
                        key={topic}
                        onClick={() =>
                            onSelectTopic?.(topic)
                        }
                    >
                        {topic}
                    </button>
                ))}

            </div>

            <div className="lesson-list">

                {subtopics.map((item, index) => {

                    const completed =
                        progress.some(
                            (entry) =>
                                entry.topic?.toUpperCase() === selectedTopic?.toUpperCase() &&
                                entry.subtopic === item &&
                                entry.completed === true
                        );

                    return (
                        <button
                            className={`lesson-row ${
                                completed
                                    ? "completed"
                                    : ""
                            }`}
                            key={item}
                            onClick={() =>
                                onSelectSubtopic?.(item)
                            }
                        >

                            <span className="lesson-index">
                                {String(index + 1).padStart(
                                    2,
                                    "0"
                                )}
                            </span>

                            <span className="lesson-name">
                                {item}
                            </span>

                            {completed ? (
                                <span className="lesson-completed">
                                    ✓ Completed
                                </span>
                            ) : (
                                <span className="lesson-chevron">
                                    ↗
                                </span>
                            )}

                        </button>
                    );
                })}

            </div>

        </section>
    );
}