import "../App.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            address: form.address.trim(),
            password: form.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const validationMessages = data.errors
          ?.map((item) => item.message)
          .filter(Boolean);

        throw new Error(
          validationMessages?.join(". ") ||
            data.message ||
            "Registration failed. Please try again."
        );
      }

      setSuccess("Account created successfully. Redirecting to sign in...");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Make sure the backend is running."
          : err.message
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="login-card signup-card">
        <Brand />

        <div className="login-heading">
          <h1>Create account</h1>
          <p>Enter your details to get started.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              name="name"
              value={form.name}
              onChange={updateField}
              minLength={20}
              maxLength={60}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-address">Address</label>
            <textarea
              id="register-address"
              name="address"
              value={form.address}
              onChange={updateField}
              maxLength={400}
              autoComplete="street-address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              minLength={8}
              maxLength={16}
              pattern="(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}"
              title="Use 8–16 characters, including an uppercase letter and a special character."
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="auth-success" role="status">
              {success}
            </p>
          )}

          <button
            className="sign-in-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="signup-prompt">
          Already registered? <Link to="/login">Sign in</Link>
        </div>
      </section>
    </main>
  );
}

export default Register;
