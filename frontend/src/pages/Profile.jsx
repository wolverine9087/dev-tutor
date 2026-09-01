import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user, logout, loading } = useAuth();

    if (loading) {
        return (
            <section className="page-section">
                <span className="eyebrow">ACCOUNT</span>

                <h1>
                    Profile<em>.</em>
                </h1>

                <div className="question-card">
                    <h2>Loading...</h2>
                    <p>Loading your profile information.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="page-section">
            <span className="eyebrow">ACCOUNT</span>

            <h1>
                Profile<em>.</em>
            </h1>

            <div className="question-card">
                <h2>{user?.name || "Guest learner"}</h2>

                <p>
                    {user?.email ||
                        "Sign in to sync your learning progress."}
                </p>

                {user && (
                    <button
                        className="secondary-button"
                        onClick={logout}
                    >
                        Sign out
                    </button>
                )}
            </div>
        </section>
    );
}

