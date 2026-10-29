
import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminStores from "./admin/AdminStores";
import AdminUsers from "./admin/AdminUsers";

import UserDashboard from "./users/UserDashboard";
import StoreOwnerDashboard from "./store-owner/StoreOwnerDashboard";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/signup"
        element={<Navigate to="/register" replace />}
      />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="stores" element={<AdminStores />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route path="/user" element={<UserDashboard />} />
      <Route path="/store-owner" element={<StoreOwnerDashboard />} />

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
