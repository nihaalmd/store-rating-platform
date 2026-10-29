import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import "./User.css";

const API_URL = "http://localhost:5000/api";

function UserDashboard() {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [ratings, setRatings] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratingMessage, setRatingMessage] = useState("");
  const [submittingRating, setSubmittingRating] = useState(null);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }, [navigate]);

  const loadStores = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        logout();
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [storesResponse, ratingsResponse] = await Promise.all([
        fetch(`${API_URL}/stores`, { headers }),
        fetch(`${API_URL}/ratings/mine`, { headers }),
      ]);

      const storesData = await storesResponse.json();
      const ratingsData = await ratingsResponse.json();

      if (storesResponse.status === 401 || ratingsResponse.status === 401) {
        logout();
        return;
      }

      if (!storesResponse.ok) {
        throw new Error(
          storesData.message ||
            "Unable to load stores. Check store-list permissions."
        );
      }

      if (!ratingsResponse.ok) {
        throw new Error(
          ratingsData.message || "Unable to load your submitted ratings."
        );
      }

      const storeList = Array.isArray(storesData)
        ? storesData
        : storesData.stores;

      const ratingList = Array.isArray(ratingsData)
        ? ratingsData
        : ratingsData.ratings;

      if (!Array.isArray(storeList) || !Array.isArray(ratingList)) {
        throw new Error("The server returned an unexpected response.");
      }

      const ratingsByStore = {};

      ratingList.forEach((item) => {
        const storeId = item.storeId ?? item.store_id ?? item.store?.id;
        if (storeId != null) {
          ratingsByStore[storeId] = Number(item.rating);
        }
      });

      setStores(
        storeList.map((store) => ({
          ...store,
          overallRating: Number(
            store.overallRating ?? store.overall_rating ?? 0
          ),
          userRating: ratingsByStore[store.id] ?? null,
        }))
      );
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check that the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...stores]
      .filter(
        (store) =>
          String(store.name ?? "").toLowerCase().includes(query) ||
          String(store.address ?? "").toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const result = String(a.name ?? "").localeCompare(
          String(b.name ?? "")
        );
        return sortDirection === "asc" ? result : -result;
      });
  }, [stores, search, sortDirection]);

  function handleRatingChange(storeId, value) {
    setRatings((current) => ({ ...current, [storeId]: value }));
    setRatingMessage("");
  }

  async function handleRatingSubmit(storeId) {
    const selectedRating = Number(ratings[storeId]);

    if (!Number.isInteger(selectedRating) || selectedRating < 1 || selectedRating > 5) {
      setRatingMessage("Please select a rating from 1 to 5.");
      return;
    }

    setSubmittingRating(storeId);
    setRatingMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        logout();
        return;
      }

      const response = await fetch(`${API_URL}/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          storeId: Number(storeId),
          rating: selectedRating,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        logout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit your rating.");
      }

      setRatingMessage(data.message || "Rating saved successfully.");
      setRatings((current) => ({ ...current, [storeId]: "" }));

      // Reload so the overall average and your rating come from the database.
      await loadStores();
    } catch (err) {
      setRatingMessage(
        err instanceof TypeError
          ? "Cannot connect to the server."
          : err.message
      );
    } finally {
      setSubmittingRating(null);
    }
  }

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
        logout();
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
        logout();
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

  function handleLogout() {
    logout();
  }

  return (
    <div className="user-dashboard">
      <header className="user-topbar">
        <Brand />

        <nav className="user-topbar-actions">
          <button
            className="user-nav-button"
            onClick={() => {
              setShowPasswordForm((current) => !current);
              setPasswordMessage("");
              setPasswordError("");
            }}
          >
            Update Password
          </button>

          <button className="user-logout-button" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="user-main">
        <section className="user-welcome">
          <div>
            <p className="user-eyebrow">STORE RATING PLATFORM</p>
            <h1>Explore Stores</h1>
            <p className="user-subtitle">
              Browse registered stores and share your rating.
            </p>
          </div>

          <div className="user-store-count">
            <span>Registered stores</span>
            <strong>{loading ? "…" : stores.length}</strong>
          </div>
        </section>

        {error && (
          <p className="user-form-message" role="alert">{error}</p>
        )}

        {showPasswordForm && (
          <section className="user-password-card">
            <div className="user-section-heading">
              <div>
                <h2>Update Password</h2>
                <p>Choose a new password for your account.</p>
              </div>

              <button
                type="button"
                className="user-close-button"
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

            <form className="user-password-form" onSubmit={handlePasswordSubmit}>
              <label>
                Current Password
                <input
                  type="password"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(event) =>
                    setPasswords({ ...passwords, currentPassword: event.target.value })
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
                    setPasswords({ ...passwords, newPassword: event.target.value })
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
                    setPasswords({ ...passwords, confirmPassword: event.target.value })
                  }
                  minLength={8}
                  maxLength={16}
                  required
                />
              </label>

              <button className="user-primary-button" type="submit">
                Update Password
              </button>

              {passwordError && (
                <p className="user-form-message" role="alert">{passwordError}</p>
              )}
              {passwordMessage && (
                <p className="user-form-message" role="status">{passwordMessage}</p>
              )}
            </form>
          </section>
        )}

        <section className="user-stores-section">
          <div className="user-section-heading">
            <div>
              <h2>All Stores</h2>
              <p>Search by store name or address.</p>
            </div>
          </div>

          <div className="user-store-toolbar">
            <div className="user-search">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search name or address..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search stores by name or address"
              />
            </div>

            <button
              className="user-sort-button"
              onClick={() =>
                setSortDirection((current) => current === "asc" ? "desc" : "asc")
              }
            >
              Name {sortDirection === "asc" ? "↑" : "↓"}
            </button>
          </div>

          <div className="user-table-wrapper">
            <table className="user-store-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Address</th>
                  <th>Overall Rating</th>
                  <th>Your Rating</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr><td colSpan="5">Loading stores...</td></tr>
                ) : filteredStores.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="user-empty-state">
                      {error ? "Unable to load stores." : "No stores match your search."}
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((store) => (
                    <tr key={store.id}>
                      <td>
                        <span className="user-store-name">{store.name}</span>
                      </td>
                      <td>{store.address}</td>
                      <td>
                        <span className="user-rating-value">
                          ★ {store.overallRating.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        {store.userRating != null ? (
                          <span className="user-submitted-rating">
                            ★ {store.userRating}
                          </span>
                        ) : (
                          <span className="user-not-rated">Not rated</span>
                        )}
                      </td>
                      <td>
                        <div className="user-rating-actions">
                          <select
                            value={ratings[store.id] ?? ""}
                            onChange={(event) =>
                              handleRatingChange(store.id, event.target.value)
                            }
                            aria-label={`Select rating for ${store.name}`}
                          >
                            <option value="">Rate 1–5</option>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <option key={rating} value={rating}>
                                {rating} {rating === 1 ? "star" : "stars"}
                              </option>
                            ))}
                          </select>

                          <button
                            className="user-rate-button"
                            disabled={submittingRating === store.id}
                            onClick={() => handleRatingSubmit(store.id)}
                          >
                            {submittingRating === store.id
                              ? "Saving..."
                              : store.userRating != null
                                ? "Modify"
                                : "Submit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {ratingMessage && (
            <p className="user-form-message" role="status">{ratingMessage}</p>
          )}

          <p className="user-table-note">
            Showing {filteredStores.length} of {stores.length} stores
          </p>
        </section>
      </main>
    </div>
  );
}

export default UserDashboard;