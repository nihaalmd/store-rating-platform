
import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
  name: "",
  email: "",
  address: "",
  role: "USER",
  password: "",
};

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please sign in to manage users.");

      const params = new URLSearchParams({
        name: search.trim(),
        email: search.trim(),
        address: search.trim(),
        sortBy: sortField,
        order: sortDirection,
      });

      if (role !== "ALL") params.set("role", role);

      const response = await fetch(`${API_URL}/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load users.");
      }

      const list = Array.isArray(data) ? data : data.users;
      if (!Array.isArray(list)) {
        throw new Error("The server returned an unexpected user list.");
      }

      setUsers(list);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check that it is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }, [search, role, sortField, sortDirection]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users
      .filter((user) => {
        const matchesSearch = [
          user.name,
          user.email,
          user.address,
        ].some((value) => String(value ?? "").toLowerCase().includes(query));

        return matchesSearch && (role === "ALL" || user.role === role);
      })
      .sort((a, b) => {
        const first = String(a[sortField] ?? "").toLowerCase();
        const second = String(b[sortField] ?? "").toLowerCase();
        const result = first.localeCompare(second);

        return sortDirection === "asc" ? result : -result;
      });
  }, [users, search, role, sortField, sortDirection]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((current) => current === "asc" ? "desc" : "asc");
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
      if (!token) throw new Error("Please sign in to create a user.");

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const messages = data.errors
          ?.map((item) => item.message)
          .filter(Boolean);

        throw new Error(
          messages?.join(". ") || data.message || "Failed to create user."
        );
      }

      setForm(emptyForm);
      setShowForm(false);
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check that it is running."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  async function openUserDetails(user) {
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please sign in again.");

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load user details.");
      }

      setSelectedUser(data.user ?? data);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server."
          : err.message
      );
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-intro">
        <div>
          <h2>User management</h2>
          <p>View and manage platform accounts.</p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => {
            setShowForm((current) => !current);
            setError("");
          }}
        >
          {showForm ? "Cancel" : "+ Add user"}
        </button>
      </div>

      {error && <p className="auth-error" role="alert">{error}</p>}

      {showForm && (
        <section className="admin-panel form-panel">
          <h2>Add user</h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input
                required
                minLength={20}
                maxLength={60}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label>
              Address
              <textarea
                required
                maxLength={400}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </label>

            <label>
              Role
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="USER">Normal user</option>
                <option value="ADMIN">Administrator</option>
                <option value="STORE_OWNER">Store owner</option>
              </select>
            </label>

            <label>
              Initial password
              <input
                required
                type="password"
                minLength={8}
                maxLength={16}
                pattern="(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}"
                title="Use 8–16 characters, including an uppercase letter and a special character."
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>

            <button
              className="admin-primary-button"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save user"}
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
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="table-filter"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="ALL">All roles</option>
            <option value="USER">Normal user</option>
            <option value="ADMIN">Administrator</option>
            <option value="STORE_OWNER">Store owner</option>
          </select>

          <button className="admin-secondary-button" onClick={() => handleSort("name")}>
            Name {sortLabel("name")}
          </button>

          <button className="admin-secondary-button" onClick={() => handleSort("email")}>
            Email {sortLabel("email")}
          </button>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan="5">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    {error ? "Unable to load users." : "No users found."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id ?? user.email}>
                    <td className="table-primary-text">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.address}</td>
                    <td>
                      <span className={`role-badge role-${user.role.toLowerCase()}`}>
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => openUserDetails(user)}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="panel-footer">
          {filteredUsers.length} users displayed
        </div>
      </section>

      {selectedUser && (
        <div className="user-modal-overlay" onClick={() => setSelectedUser(null)}>
          <section
            className="user-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="user-modal-header">
              <div>
                <h2 id="user-details-title">User details</h2>
                <p>Account information and role details</p>
              </div>
              <button
                type="button"
                className="user-modal-close"
                aria-label="Close user details"
                onClick={() => setSelectedUser(null)}
              >
                &times;
              </button>
            </div>

            <div className="user-details-content">
              <div className="user-avatar">
                {selectedUser.name.charAt(0).toUpperCase()}
              </div>
              <h3>{selectedUser.name}</h3>
              <span className={`role-badge role-${selectedUser.role.toLowerCase()}`}>
                {selectedUser.role.replace("_", " ")}
              </span>

              <div className="user-detail-field">
                <span>Full name</span><p>{selectedUser.name}</p>
              </div>
              <div className="user-detail-field">
                <span>Email address</span><p>{selectedUser.email}</p>
              </div>
              <div className="user-detail-field">
                <span>Address</span><p>{selectedUser.address}</p>
              </div>
              <div className="user-detail-field">
                <span>Account role</span><p>{selectedUser.role.replace("_", " ")}</p>
              </div>

              {selectedUser.role === "STORE_OWNER" && (
                <div className="owner-rating-section">
                  <h3>Store and rating information</h3>
                  {Array.isArray(selectedUser.stores) && selectedUser.stores.length > 0 ? (
                    selectedUser.stores.map((store) => (
                      <div key={store.id ?? store.name}>
                        <p><strong>{store.name}</strong></p>
                        <p>Overall rating: {Number(store.overallRating ?? 0).toFixed(1)} / 5</p>
                      </div>
                    ))
                  ) : (
                    <p>No associated store or ratings are available.</p>
                  )}
                </div>
              )}
            </div>

            <div className="user-modal-footer">
              <button
                type="button"
                className="admin-primary-button"
                onClick={() => setSelectedUser(null)}
              >
                Close details
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;