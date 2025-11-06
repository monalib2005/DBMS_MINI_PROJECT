import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import History from "./pages/History";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import MenuManagement from "./pages/MenuManagement";
import OrderProgress from "./pages/orderProgress";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />

          {/* User Routes */}
          <Route
            path="/home"
            element={
              <>
                <Navbar /> {/* normal user navbar */}
                <Home />
              </>
            }
          />
          <Route
            path="/cart"
            element={
              <>
                <Navbar />
                <Cart />
              </>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <>
                <Navbar />
                <OrderConfirmation />
              </>
            }
          />
          <Route
            path="/orders"
            element={
              <>
                <Navbar />
                <Orders />
              </>
            }
          />
          <Route
            path="/history"
            element={
              <>
                <Navbar />
                <History />
              </>
            }
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <>
                <Navbar isAdmin /> {/* pass isAdmin prop */}
                <AdminDashboard />
              </>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <>
                <Navbar isAdmin />
                <MenuManagement />
              </>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <>
                <Navbar isAdmin />
                <OrderProgress />
              </>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
