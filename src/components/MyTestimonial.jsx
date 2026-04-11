import { useState, useEffect } from 'react';
import { Star, MessageSquareQuote, Loader, CheckCircle, Clock } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';

const MyTestimonial = () => {
  const token = JSON.parse(sessionStorage.getItem('accessToken') || '""');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);
  const [form, setForm] = useState({ rating: 5, text: '', role: '', company: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchTestimonial = async () => {
      try {
        const res = await fetch(`${BASE_URL}/job-seeker/testimonial`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status === 'SUCCESS' && data.data) {
          setExisting(data.data);
          setForm({
            rating: data.data.rating,
            text: data.data.text,
            role: data.data.role || '',
            company: data.data.company || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonial();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) return setMessage({ type: 'error', text: 'Please write your testimonial' });
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${BASE_URL}/job-seeker/testimonial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setExisting(data.data);
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save testimonial' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="animate-spin text-theme_color" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquareQuote size={28} className="text-theme_color" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Testimonial</h1>
      </div>

      {existing && (
        <div className={`flex items-center gap-2 mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          existing.isApproved
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
        }`}>
          {existing.isApproved ? <CheckCircle size={18} /> : <Clock size={18} />}
          {existing.isApproved ? 'Your testimonial is live on the landing page' : 'Your testimonial is pending admin approval'}
        </div>
      )}

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Rating</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm({ ...form, rating: star })}
                className="p-1"
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    star <= form.rating ? 'fill-theme_color text-theme_color' : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Your Role / Job Title</label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="e.g. Software Engineer"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-theme_color"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Company</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            placeholder="e.g. Emirates Group"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-theme_color"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">Your Testimonial *</label>
          <textarea
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            placeholder="Share your experience with RatchetUp..."
            rows={5}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-theme_color resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-theme_color hover:bg-teal-600 text-white font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader className="animate-spin" size={18} /> : null}
          {existing ? 'Update Testimonial' : 'Submit Testimonial'}
        </button>
      </form>
    </div>
  );
};

export default MyTestimonial;
