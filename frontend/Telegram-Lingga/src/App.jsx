import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import TwoFactor from "./pages/Auth/TwoFactor";

import Dashboard from "./pages/Admin/Dashboard";
import ManageTelegram from "./pages/Admin/ManageTelegram";
import CreateTelegram from "./pages/Admin/CreateTelegram";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageTTE from "./pages/Admin/ManageTTE";

import UserDashboard from "./pages/User/UserDashboard";
import MyTelegram from "./pages/User/MyTelegram";
import ViewTelegramDetails from "./pages/User/ViewTelegramDetails";
import SubmitTTE from "./pages/User/SubmitTTE";
import MyTTEStatus from "./pages/User/MyTTEStatus";
import TTEDetail from "./pages/User/TTEDetail";

import ProfilePage from "./pages/Profile/ProfilePage";

import PrivateRoute from "./routes/PrivateRoute";
import UserProvider, { UserContext } from "./context/userContext";
import { useContext } from "react";

import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/2fa" element={<TwoFactor />} />

            {/* Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/telegram" element={<ManageTelegram />} />
              <Route
                path="/admin/create-telegram"
                element={<CreateTelegram />}
              />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/tte" element={<ManageTTE />} />
            </Route>

            {/* User Routes */}
            <Route element={<PrivateRoute allowedRoles={["opd"]} />}>
              <Route path="/user" element={<UserDashboard />} />
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/telegram" element={<MyTelegram />} />
              <Route
                path="/user/telegram-details/:id"
                element={<ViewTelegramDetails />}
              />
              <Route path="/user/submit-tte" element={<SubmitTTE />} />
              <Route path="/user/tte-status" element={<MyTTEStatus />} />
              <Route path="/user/tte-detail/:id" element={<TTEDetail />} />
            </Route>

            {/* Profile Route - Available for all authenticated users */}
            <Route element={<PrivateRoute allowedRoles={["admin", "opd"]} />}>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Default Routes */}
            <Route path="/" element={<Root />} />
          </Routes>
        </Router>
      </div>

      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </UserProvider>
  );
};

export default App;

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) return <Outlet />;

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === "admin" ? (
    <Navigate to="/admin/dashboard" />
  ) : (
    <Navigate to="/user/dashboard" />
  );
};
