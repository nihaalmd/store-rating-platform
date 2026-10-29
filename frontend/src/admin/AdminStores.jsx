import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000/api";

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });

  const loadStores = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please sign in to manage stores.");
      }

      const response = await fetch(`${API_URL}/stores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load stores.");
      }

      const storeList = Array.isArray(data) ? data : data.stores;

      if (!Array.isArray(storeList)) {
        throw new Error("The server returned an unexpected store list.");
      }

      setStores(storeList);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check that the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const filteredStores = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stores
      .filter((store) =>
        [store.name, store.email, store.address].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        )
      )
      .sort((a, b) => {
        const first = String(a[sortField] ?? "").toLowerCase();
        const second = String(b[sortField] ?? "").toLowerCase();
        const result = first.localeCompare(second);

        return sortDirection === "asc" ? result : -result;
      });
  }, [stores, search, sortField, sortDirection]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }

  function sortLabel(field) {
    if (sortField !== field) return "↕";
    return sortDirection === "asc" ? "↑" : "↓";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please sign in to create a store.");
      }

      const response = await fetch(`${API_URL}/stores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const validationMessages = data.errors
          ?.map((item) => item.message)
          .filter(Boolean);

        throw new Error(
          validationMessages?.join(". ") ||
            data.message ||
            "Failed to create store."
        );
      }

      setForm({ name: "", email: "", address: "" });
      setShowForm(false);
      await loadStores();
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check that the backend is running."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-intro">
        <div>
          <h2>Store management</h2>
          <p>View and manage registered stores.</p>
        </div>

        <button
          className="admin-primary-button"
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Add store"}
        </button>
      </div>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      {showForm && (
        <section className="admin-panel form-panel">
          <h2>Add store</h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Store name
              <input
                required
                minLength={20}
                maxLength={60}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Enter store name"
              />
            </label>

            <label>
              Store email
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="store@example.com"
              />
            </label>

            <label>
              Address
              <textarea
                required
                maxLength={400}
                value={form.address}
                onChange={(event) =>
                  setForm({ ...form, address: event.target.value })
                }
                placeholder="Enter store address"
              />
            </label>

            <button
              className="admin-primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save store"}
            </button>
          </form>
        </section>
      )}

      <section className="admin-panel">
        <div className="table-toolbar">
          <input
            className="table-search"
            placeholder="Search by name, email or address..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button
            className="admin-secondary-button"
            type="button"
            onClick={() => handleSort("name")}
          >
            Name {sortLabel("name")}
          </button>

          <button
            className="admin-secondary-button"
            type="button"
            onClick={() => handleSort("email")}
          >
            Email {sortLabel("email")}
          </button>
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
              {loading ? (
                <tr>
                  <td colSpan="4">Loading stores...</td>
                </tr>
              ) : filteredStores.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">
                    {error ? "Stores could not be loaded." : "No stores found."}
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const rating = Number(
                    store.overallRating ?? store.rating ?? 0
                  );

                  return (
                    <tr key={store.id ?? store.email}>
                      <td className="table-primary-text">{store.name}</td>
                      <td>{store.email}</td>
                      <td>{store.address}</td>
                      <td>
                        <span className="rating-value">
                          ★ {rating.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="panel-footer">
          {loading
            ? "Loading stores..."
            : `${filteredStores.length} stores displayed`}
        </div>
      </section>
    </div>
  );
}

export default AdminStores;