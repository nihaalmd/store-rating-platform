import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import "./Admin.css";

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitles = {
    "/admin": "Dashboard",
    "/admin/stores": "Stores",
    "/admin/users": "Users",
  };

  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  function handleLogout() {
    navigate("/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <Brand />
        </div>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="admin-navigation">
          <NavLink to="/admin" end className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }>
            <span className="nav-icon">▦</span>
            Dashboard
          </NavLink>

          <NavLink to="/admin/stores" className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }>
            <span className="nav-icon">▤</span>
            Stores
          </NavLink>

          <NavLink to="/admin/users" className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }>
            <span className="nav-icon">♙</span>
            Users
          </NavLink>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="profile-avatar">A</div>
            <div className="profile-info">
              <strong>Administrator</strong>
              <span>System Admin</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <span>↪</span> Log out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="breadcrumb">StoreRate / Admin</span>
            <h1>{pageTitle}</h1>
          </div>
          <div className="topbar-role">Administrator</div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
