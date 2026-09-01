import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onSuccess, onRegister }) {
    const { login } = useAuth();

    const [form, setForm] = useState({
      email: "",
      password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(event) {
      event.preventDefault();

      setError("");
      setLoading(true);

      try {
        await login(form);
        onSuccess?.();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    return (
      <section className="auth-page">
        <span className="eyebrow">WELCOME BACK</span>

        <h1>
          Sign in<em>.</em>
        </h1>

          <form onSubmit={submit} className="auth-form">
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              required
            />

            {error && (
              <p className="form-error">
                {error}
              </p>
            )}

            <button
              className="primary-button"
                disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <button
            className="switch-auth"
            onClick={onRegister}
          >
            Create an account
          </button>
          
      </section>
    );
}

