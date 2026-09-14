import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;