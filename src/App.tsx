import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import { Toaster } from "@/src/components/ui/sonner";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Redirection from "./pages/Redirection";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import CPMRates from "./pages/CPMRates";
import PaymentProof from "./pages/PaymentProof";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Home />} />
            <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user ? <Admin /> : <Navigate to="/auth" />} />
            <Route path="/cpm" element={<CPMRates />} />
            <Route path="/payment-proof" element={<PaymentProof />} />
            <Route path="/dashboard/analytics/:shortId" element={user ? <Analytics /> : <Navigate to="/auth" />} />
            <Route path="/s/:shortId" element={<Redirection />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}
