import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import { useLocation } from "react-router-dom";
import DineOutNavbar from "./components/DineOutNavbar";

function AppContent() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");
  const isWaiterPage = location.pathname.startsWith("/waiter");
  const isDineOutPage = location.pathname.startsWith("/dineout");

  return (
    <>
    {isDineOutPage ? (
        <DineOutNavbar />
      ) : (
        !isAdminPage && !isWaiterPage && <Navbar />
      )}
      
      {!isAdminPage && !isWaiterPage && <Navbar />}

      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;