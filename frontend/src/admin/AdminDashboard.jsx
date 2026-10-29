import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const summaryCards = [
  {
    label: "Total users",
    key: "totalUsers",
    note: "Registered accounts",
    icon: "♙",
  },
  {
    label: "Total stores",
    key: "totalStores",
    note: "Registered stores",
    icon: "▤",
  },
  {
    label: "Submitted ratings",
    key: "totalRatings",
    note: "Ratings across stores",
    icon: "☆",
  },
];

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please sign in to view the admin dashboard.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [statsResponse, storesResponse] = await Promise.all([
          fetch("http://localhost:5000/api/admin/dashboard", { headers }),
          fetch("http://localhost:5000/api/stores", { headers }),
        ]);

        const statsData = await statsResponse.json();
        const storesData = await storesResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message || "Failed to load dashboard statistics."
          );
        }

        if (!storesResponse.ok) {
          throw new Error(
            storesData.message || "Failed to load registered stores."
          );
        }

        setStats({
          totalUsers: Number(statsData.totalUsers ?? 0),
          totalStores: Number(statsData.totalStores ?? 0),
          totalRatings: Number(statsData.totalRatings ?? 0),
        });

        const storeList = Array.isArray(storesData)
          ? storesData
          : storesData.stores;

        setStores(Array.isArray(storeList) ? storeList.slice(0, 4) : []);
      } catch (err) {
        setError(
          err instanceof TypeError
            ? "Cannot connect to the server. Check that the backend is running."
            : err.message
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-intro">
        <div>
          <h2>Overview</h2>
          <p>Here's a summary of your platform.</p>
        </div>
        <Link className="admin-primary-button" to="/admin/stores">
          View stores
        </Link>
      </div>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <section className="summary-grid">
        {summaryCards.map((card) => (
          <article className="summary-card" key={card.label}>
            <div className="summary-card-top">
              <span>{card.label}</span>
              <span className="summary-icon">{card.icon}</span>
            </div>
            <strong className="summary-value">
              {loading ? "…" : stats[card.key].toLocaleString()}
            </strong>
            <span className="summary-note">{card.note}</span>
          </article>
        ))}
      </section>

      <section className="admin-panel">
        <div className="panel-heading">
          <div>
            <h2>Stores</h2>
            <p>Overview of registered stores</p>
          </div>
          <Link className="text-link" to="/admin/stores">
            View all
          </Link>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Store name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {!loading && stores.length === 0 ? (
                <tr>
                  <td colSpan="4">
                    {error ? "Unable to load stores." : "No stores registered yet."}
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id ?? store.email}>
                    <td className="table-primary-text">{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address}</td>
                    <td>
                      <span className="rating-value">
                        <span>★</span>{" "}
                        {Number(store.overallRating ?? store.rating ?? 0).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {loading && (
                <tr>
                  <td colSpan="4">Loading stores…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
