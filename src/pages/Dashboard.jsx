import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import DashboardOverview from "../components/DashboardOverview";
import MyApplications from "../components/MyApplications";
import RecommendedJobs from "../components/Recommendations";
import Profile from "../components/Profile";
import CVBuilder from "../components/CvBuilder";
import SavedJobs from "../components/SavedJobs";
import Subscriptions from "../components/Subscriptions";
import Checkout from "../components/Checkout";
import JobRecommandationDetails from "../components/JobRecommandationDetails";
import SubscriptionInvoices from "../components/SubscriptionInvoices";
import Messaging from "../components/Messaging";
import SecuritySettings from "../components/SecuritySettings";
import MyTestimonial from "../components/MyTestimonial";
import { BASE_URL } from "../BaseUrl";

function Dashboard() {
  const token = JSON.parse(sessionStorage.getItem("accessToken") || "{}");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  useEffect(() => {
    if (token !== null) {
      fetchActiveSubscriptions();
    }
  }, [token]);

  const fetchActiveSubscriptions = async () => {
    try {
      const res = await fetch(`${BASE_URL}/job-seeker/subscriptions/latest`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (!res.ok || json.error)
        throw new Error(json?.message || "Failed to load plans");
      const result = json.result;
      setSubscription({
        isActive: result?.isActiveNow || false,
        isTrial: result?.isTrial || false,
        trialDaysLeft: result?.trialDaysLeft || 0,
        planName: result?.subscription?.plan?.name || null,
        planId: result?.subscription?.plan?.id || null,
        expiresAt: result?.subscription?.expiresAt || null,
        features: result?.subscription?.plan?.feature?.features || null,
      });
    } catch (e) {
      console.log(e.message);
      // No subscription or error — mark as inactive so the gate kicks in
      setSubscription({ isActive: false, isTrial: false, planName: null, planId: null, expiresAt: null, features: null });
    }
  };

  // Paid subscription = active + not trial
  const isPaidActive = subscription?.isActive && !subscription?.isTrial;
  const navigate = useNavigate();
  const location = useLocation();

  // Pages exempt from subscription gate
  const isExemptPage = location.pathname.endsWith('/subscriptions')
    || location.pathname.endsWith('/checkout')
    || location.pathname.endsWith('/subscription_invoices');

  // Redirect to subscriptions if no active paid subscription
  useEffect(() => {
    if (subscription === null) return; // still loading
    if (!isPaidActive && !isExemptPage) {
      navigate('/dashboard/subscriptions', { replace: true });
    }
  }, [subscription, isPaidActive, location.pathname]);

  // Subscription gate overlay — block all interaction except subscriptions
  const showGate = subscription !== null && !isPaidActive && !isExemptPage;

  return (
    <div>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <NavBar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <Sidebar
            isOpen={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <main className="flex-1 overflow-x-hidden h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 dark:bg-gray-950 px-4 py-2 relative">
            {showGate && (
              <div className="absolute inset-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Subscription Required</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Subscribe to at least the Silver plan to unlock all features and start using your dashboard.</p>
                  <button onClick={() => navigate('/dashboard/subscriptions')} className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition shadow-lg">
                    View Subscription Plans
                  </button>
                </div>
              </div>
            )}
            <Routes>
              <Route path="/" element={<DashboardOverview subscription={subscription} />} />
              <Route path="/messages" element={<Messaging subscription={{ plan: { name: subscription?.planName }, status: subscription?.isActive ? "ACTIVE" : "INACTIVE" }} />} />
              <Route path="/applications" element={<MyApplications />} />
              <Route path="/saved_jobs" element={<SavedJobs isAiSubscribed2={isPaidActive} subscription={subscription} />} />
              <Route path="/recommendations" element={<RecommendedJobs isAiSubscribed2={isPaidActive} subscription={subscription} />} />
              <Route
                path="/recommendations/:id"
                element={<JobRecommandationDetails isAiSubscribed2={isPaidActive} />}
              />
              <Route path="/cv_builder" element={<CVBuilder subscription={subscription} />} />
              <Route path="/cv-builder" element={<CVBuilder subscription={subscription} />} />
              <Route path="/subscriptions" element={<Subscriptions subscription={subscription} />} />
              <Route
                path="/subscription_invoices"
                element={<SubscriptionInvoices />}
              />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/testimonial" element={<MyTestimonial />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/security" element={<SecuritySettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
