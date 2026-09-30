import {Routes, Route} from "react-router-dom";
import Home from "../pages/user/Home";
import Menu from "../pages/user/Menu";
import Login from "../pages/user/Login";
import RoomBooking from "../pages/user/RoomBooking";
import TableReservation from "../pages/user/TableReservation";
import CallWaiter from "../pages/user/CallWaiter";
import VerifyLogin from "../pages/user/VerifyLogin";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import AdminMenu from "../pages/admin/AdminMenu";
import WaiterDashboard from "../pages/waiter/WaiterDashboard";
import ManageTables from "../pages/admin/ManageTables";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
          path="/menu"
          element={
              <ProtectedRoute>
                  <Menu />
              </ProtectedRoute>
          }
      />

      <Route
        path="/home"
        element={
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        }
        />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/verify" element={<VerifyLogin />} />
      <Route path="/room-booking" element={<RoomBooking />} />
      <Route path="/table-reservation" element={<TableReservation />} />
      <Route path="/call-waiter" element={<CallWaiter />} />
      <Route
            path="tables"
            element={
                <AdminProtectedRoute>
                    <ManageTables />
                </AdminProtectedRoute>
            }
        />

      <Route
        path="/waiter-dashboard"
        element={
            <ProtectedRoute>
            <WaiterDashboard />
            </ProtectedRoute>
        }
        />
      <Route path="/admin" element={<AdminLayout />}>
        <Route
                path="login"
                element={<AdminLogin />}
            />

            <Route
                path="dashboard"
                element={
                    <AdminProtectedRoute>
                        <AdminDashboard />
                    </AdminProtectedRoute>
                }
            />
            <Route
                path="menu"
                element={
                    <AdminProtectedRoute>
                        <AdminMenu />
                    </AdminProtectedRoute>
                }
            />
            <Route path="tables" element={
                <AdminProtectedRoute>
                    <ManageTables />
                </AdminProtectedRoute>
            } />
        </Route>
    </Routes>
  );
}

export default AppRoutes;