import "../App.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please try again.");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response from server. Please try again.");
      }

      const roleRoutes = {
        ADMIN: "/admin",
        USER: "/user",
        STORE_OWNER: "/store-owner",
      };

      const destination = roleRoutes[data.user.role];

      if (!destination) {
        throw new Error("Your account has an unrecognized role.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate(destination, { replace: true });
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
      <section className="login-card">
        <Brand />

        <div className="login-heading">
          <h1>Sign in</h1>
          <p>Enter your account details to continue.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="password-input">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="auth-error">
              {error}
            </p>
          )}

          <button
            className="sign-in-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="signup-prompt">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </section>

      <footer className="page-footer">StoreRate</footer>
    </main>
  );
}

export default Login;
