// src/pages/Contact.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In real app → send to backend / email service
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 transition-colors duration-300">
            {/* Main Contact Form Section */}
      <section className="pb-24 md:pb-32 pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Contact Info / Message */}
            <div>
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Get In Touch
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                  Our support team typically responds within 24 hours on business days.
                  Whether you're a job seeker, employer, or partner - we're here to help.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/30">
                      <Mail size={20} className="text-teal-500 dark:text-teal-400" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">Email Support</div>
                      <a
                        href="mailto:support@ratchetup.ai"
                        className="text-teal-500 dark:text-teal-400 hover:underline"
                      >
                        support@ratchetup.ai
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/30">
                      <Phone size={20} className="text-teal-500 dark:text-teal-400" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">Customer Care</div>
                      <a
                        href="tel:+16477888715"
                        className="text-teal-500 dark:text-teal-400 hover:underline"
                      >
                        647-788-8715
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/30">
                      <Phone size={20} className="text-teal-500 dark:text-teal-400" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">Customer Support</div>
                      <a
                        href="tel:+16479307516"
                        className="text-teal-500 dark:text-teal-400 hover:underline"
                      >
                        647-930-7516
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 flex items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/30">
                      <MapPin size={20} className="text-teal-500 dark:text-teal-400" />
                    </div>
                    <div>
                      <div className="font-medium text-lg">Office Location</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        Suite 502, 55 Commerce Valley,<br />
                        Markham, ON, L3T 7V9
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick CTA button */}
              <a
                href="mailto:support@ratchetup.ai"
                className="inline-flex items-center gap-3 px-8 py-4 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium rounded-xl transition text-lg shadow-sm"
              >
                <Mail size={20} />
                Email Support
              </a>
            </div>

            {/* Right: Contact Form */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-8 md:p-10">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Send size={28} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Thank You!</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your message has been sent successfully.<br />
                    We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-teal-500 dark:text-teal-400 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-500 focus:border-teal-400 dark:focus:border-teal-500 outline-none transition text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-500 focus:border-teal-400 dark:focus:border-teal-500 outline-none transition text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-500 focus:border-teal-400 dark:focus:border-teal-500 outline-none transition text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="e.g. Advertising Inquiry, Job Posting Question..."
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-500 focus:border-teal-400 dark:focus:border-teal-500 outline-none transition resize-none text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder="How can we help you today?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-lg"
                  >
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Final subtle CTA / reassurance */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            We're here for you
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Our team is committed to providing exceptional support and quick responses.<br />
            Your success in Dubai's job market is our priority.
          </p>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;