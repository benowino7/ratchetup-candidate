import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import JobListings from "./components/JobListings";
import JobDetails from "./components/JobDetails";
import AllCompanies from "./components/AllCompanies";
import CompanyDetails from "./components/CompanyDetails";
import About from "./components/About";
import ContactPage from "./components/ContactPage";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./pages/Dashboard";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayouts";
import Pricing from "./components/Pricing";
import ForgotPassword from "./auth/ForgotPassword";
import CookieConsent from "./components/CookieConsent";
import PaymentConfirmation from "./components/PaymentConfirmation";

function App() {
  return (
    <>
      <Routes>
        {/* Public Website */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/joblisting" element={<JobListings />} />
          <Route path="/joblisting/:id" element={<JobDetails />} />
          <Route path="/companies" element={<AllCompanies />} />
          <Route path="/companies/:id" element={<CompanyDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
        </Route>
        {/* Protected Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
      <CookieConsent />
    </>
  );
}

export default App;
