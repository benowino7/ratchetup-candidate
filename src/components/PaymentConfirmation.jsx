import { useEffect, useState, useRef } from 'react';
import { CheckCircle, XCircle, Loader2, Briefcase, Building2, Clock } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';
import logodark from '../assets/logodark.png';

const PaymentConfirmation = () => {
  const [status, setStatus] = useState('processing'); // processing | success | failed | timeout
  const pollRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Extract externalId from URL params (gateway appends it on redirect)
    const params = new URLSearchParams(window.location.search);
    const externalId = params.get('externalId') || params.get('external_id') || params.get('reference');

    if (!externalId) {
      // No reference — wait 3s then show timeout with nav buttons
      timeoutRef.current = setTimeout(() => setStatus('timeout'), 3000);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10; // 10 polls x 2.5s = 25s total

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch(`${BASE_URL}/public/payment-status/${encodeURIComponent(externalId)}`);
        const data = await res.json();

        if (data.status === 'PAID') {
          setStatus('success');
          return; // stop polling
        } else if (data.status === 'VOID' || data.status === 'FAILED') {
          setStatus('failed');
          return; // stop polling
        }
      } catch {
        // network error — keep polling
      }

      if (attempts >= maxAttempts) {
        setStatus('timeout');
        return;
      }

      // Poll again in 2.5s
      pollRef.current = setTimeout(poll, 2500);
    };

    // Start first poll after 2s (give callback time to arrive)
    pollRef.current = setTimeout(poll, 2000);

    return () => {
      clearTimeout(pollRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const navButtons = (
    <div className="space-y-3 mt-8">
      <a
        href="https://candidate.ratchetup.ai/dashboard"
        className="flex items-center justify-center gap-2 w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition shadow-lg"
      >
        <Briefcase size={18} />
        Go to Job Seeker Dashboard
      </a>
      <a
        href="https://recruiter.ratchetup.ai/dashboard"
        className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition border border-white/20"
      >
        <Building2 size={18} />
        Go to Recruiter Dashboard
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <a href="https://candidate.ratchetup.ai" className="inline-block mb-10">
          <img src={logodark} alt="RatchetUp" className="w-[180px] sm:w-[200px] h-auto" />
        </a>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          {status === 'processing' && (
            <>
              <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Loader2 size={32} className="text-teal-500 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Processing Payment</h1>
              <p className="text-gray-400 text-sm">Please wait while we confirm your transaction...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Payment Confirmed</h1>
              <p className="text-gray-400 text-sm">
                Your subscription has been activated. You now have full access to all premium features.
              </p>
              {navButtons}
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle size={32} className="text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Payment Failed</h1>
              <p className="text-gray-400 text-sm">
                Your payment could not be processed. Please try again or contact support.
              </p>
              {navButtons}
            </>
          )}

          {status === 'timeout' && (
            <>
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <Clock size={32} className="text-yellow-500" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Confirming Payment</h1>
              <p className="text-gray-400 text-sm">
                Your payment is being processed. It may take a few minutes to reflect in your account.
              </p>
              {navButtons}
            </>
          )}
        </div>

        <p className="text-gray-600 text-xs mt-6">
          If you experience any issues, please contact support.
        </p>
      </div>
    </div>
  );
};

export default PaymentConfirmation;
