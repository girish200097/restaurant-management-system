import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import { useLocation } from "react-router-dom";

function AppContent() {
  const location = useLocation();

  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

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