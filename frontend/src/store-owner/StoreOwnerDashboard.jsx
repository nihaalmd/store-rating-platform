import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import "./StoreOwner.css";

const API_URL = "http://localhost:5000/api";

function StoreOwnerDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    store: null,
    totalRatings: 0,
    averageRating: 0,
    raters: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(`${API_URL}/store-owner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to load your store dashboard.");
      }

      setDashboard({
        store: data.store ?? null,
        totalRatings: Number(data.totalRatings ?? 0),
        averageRating: Number(data.averageRating ?? 0),
        raters: Array.isArray(data.raters) ? data.raters : [],
      });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check that the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(passwords.newPassword)) {
      setPasswordError(
        "Password must be 8–16 characters and include an uppercase letter and a special character."
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(`${API_URL}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to update password.");
      }

      setPasswordMessage(data.message || "Password updated successfully.");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordError(
        err instanceof TypeError
          ? "Cannot connect to the server."
          : err.message
      );
    }
  }

  const ratings = dashboard.raters;

  return (
    <div className="owner-dashboard">
      <header className="owner-topbar">
        <Brand />

        <nav className="owner-topbar-actions">
          <button
            className="owner-password-button"
            onClick={() => {
              setShowPasswordForm((current) => !current);
              setPasswordMessage("");
              setPasswordError("");
            }}
          >
            Update Password
          </button>

          <button className="owner-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="owner-main">
        <section className="owner-welcome">
          <div>
            <p className="owner-eyebrow">STORE OWNER PORTAL</p>
            <h1>Store Dashboard</h1>
            <p className="owner-subtitle">
              {dashboard.store
                ? dashboard.store.name
                : "Review the ratings submitted by users for your store."}
            </p>
          </div>

          <div className="owner-average-card">
            <span>Average Rating</span>
            <div className="owner-average-value">
              <strong>
                {loading ? "…" : dashboard.averageRating.toFixed(1)}
              </strong>
              <span className="owner-star">★</span>
              <span className="owner-out-of">/ 5</span>
            </div>
            <p>
              Based on {loading ? "…" : dashboard.totalRatings} submitted ratings
            </p>
          </div>
        </section>

        {error && (
          <p className="owner-form-message" role="alert">{error}</p>
        )}

        {showPasswordForm && (
          <section className="owner-password-card">
            <div className="owner-section-heading">
              <div>
                <h2>Update Password</h2>
                <p>Change your account password.</p>
              </div>

              <button
                type="button"
                className="owner-close-button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordMessage("");
                  setPasswordError("");
                }}
                aria-label="Close update password form"
              >
                ×
              </button>
            </div>

            <form className="owner-password-form" onSubmit={handlePasswordSubmit}>
              <label>
                Current Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(event) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                New Password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwords.newPassword}
                  onChange={(event) =>
                    setPasswords({
                      ...passwords,
                      newPassword: event.target.value,
                    })
                  }
                  minLength={8}
                  maxLength={16}
                  required
                />
              </label>

              <label>
                Confirm New Password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwords.confirmPassword}
                  onChange={(event) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: event.target.value,
                    })
                  }
                  minLength={8}
                  maxLength={16}
                  required
                />
              </label>

              <button className="owner-primary-button" type="submit">
                Update Password
              </button>

              {passwordError && (
                <p className="owner-form-message" role="alert">
                  {passwordError}
                </p>
              )}

              {passwordMessage && (
                <p className="owner-form-message" role="status">
                  {passwordMessage}
                </p>
              )}
            </form>
          </section>
        )}

        <section className="owner-ratings-section">
          <div className="owner-section-heading">
            <div>
              <h2>Users Who Rated Your Store</h2>
              <p>View the ratings submitted by registered users.</p>
            </div>

            <span className="owner-rating-count">
              {loading ? "…" : ratings.length} ratings
            </span>
          </div>

          <div className="owner-table-wrapper">
            <table className="owner-ratings-table">
              <thead>
                <tr>
                  <th>User Name</th>
                  <th>Submitted Rating</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="2">Loading ratings...</td>
                  </tr>
                ) : ratings.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="owner-empty-state">
                      {error
                        ? "Unable to load ratings."
                        : "No users have rated your store yet."}
                    </td>
                  </tr>
                ) : (
                  ratings.map((item) => (
                    <tr key={item.userId ?? item.id ?? item.email}>
                      <td>
                        <span className="owner-user-name">{item.name}</span>
                      </td>
                      <td>
                        <span className="owner-user-rating">
                          <span>★</span> {item.rating} / 5
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StoreOwnerDashboard;