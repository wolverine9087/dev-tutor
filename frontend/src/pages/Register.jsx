import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register({ onSuccess, onLogin }) {
    const { register } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const submit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            await register(form);
            onSuccess?.();
        } catch (err) {
            setError(
                err.message || "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="auth-page">
            {/* Header */}
            <span className="eyebrow">
                JOIN LUMIO
            </span>

            <h1>
                Create account
                <em>.</em>
            </h1>

            {/* Registration Form */}
            <form
                onSubmit={submit}
                className="auth-form"
            >
                <input
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    minLength={6}
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                {/* Error Message */}
                {error && (
                    <p className="form-error">
                        {error}
                    </p>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    className="primary-button"
                    disabled={loading}
                >
                    {loading
                        ? "Creating..."
                        : "Create account"}
                </button>
            </form>

            {/* Login */}
            <button
                type="button"
                className="switch-auth"
                onClick={onLogin}
            >
                Already have an account?
            </button>
        </section>
    );
}

