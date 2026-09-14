import {Routes, Route} from "react-router-dom";
import Home from "../pages/user/Home";
import Menu from "../pages/user/Menu";
import Login from "../pages/user/Login";
import RoomBooking from "../pages/user/RoomBooking";
import TableReservation from "../pages/user/TableReservation";
import CallWaiter from "../pages/user/CallWaiter";
import VerifyLogin from "../pages/user/VerifyLogin";
import ProtectedRoute from "../components/ProtectedRoute";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
          path="/menu"
          element={
              <ProtectedRoute>
                  <Menu />
              </ProtectedRoute>
          }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/auth/verify" element={<VerifyLogin />} />
      <Route path="/room-booking" element={<RoomBooking />} />
      <Route path="/table-reservation" element={<TableReservation />} />
      <Route path="/call-waiter" element={<CallWaiter />} />
    </Routes>
  );
}

export default AppRoutes;