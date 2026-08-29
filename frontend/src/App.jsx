import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import PaymentButton from "./components/PaymentButton";

function App() {
  return (
    <div>
      <Navbar />
      <AppRoutes />
       <h1>Restaurant Payment</h1>

            <PaymentButton orderId="6a7b5713a40ccd3de8ff4733"/>
    </div>
  );
}

export default App;