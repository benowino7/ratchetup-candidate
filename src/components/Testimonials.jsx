import React, { useEffect, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';

const TestimonialCard = ({ testimonial }) => {
  const fallbackImg = "/favicon.ico";
  return (
    <div className="
      bg-white dark:bg-gray-800/70
      backdrop-blur-sm
      border border-gray-200 dark:border-gray-700/50
      rounded-2xl
      p-6 md:p-8
      shadow-lg shadow-black/5 dark:shadow-black/30
      hover:shadow-xl hover:-translate-y-1
      transition-all duration-300
      flex flex-col h-full
    ">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <img
            src={testimonial.user?.profilePicture || fallbackImg}
            alt={testimonial.user?.fullName || "User"}
            className="w-14 h-14 rounded-full object-cover border-2 border-theme_color/30"
            onError={(e) => { e.target.src = fallbackImg; }}
          />
          <Quote className="absolute -bottom-1 -right-1 w-6 h-6 text-theme_color/70 bg-white dark:bg-gray-900 rounded-full p-1" />
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {testimonial.user?.fullName || "Anonymous"}
          </h4>
          {(testimonial.role || testimonial.company) && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {testimonial.role}{testimonial.role && testimonial.company ? " • " : ""}{testimonial.company}
            </p>
          )}
        </div>
      </div>

      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < testimonial.rating
                ? 'fill-theme_color text-theme_color'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic flex-grow">
        "{testimonial.text}"
      </p>
    </div>
  );
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const perPage = 4;

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch(`${BASE_URL}/public/testimonials?type=JOB_SEEKER`);
      const data = await res.json();
      if (res.ok && !data.error) {
        setTestimonials(data.result || []);
      }
    } catch (err) {
      console.log("Failed to fetch testimonials:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(testimonials.length / perPage);
  const currentTestimonials = testimonials.slice(currentPage * perPage, (currentPage + 1) * perPage);

  const nextPage = () => setCurrentPage((p) => (p + 1) % totalPages);
  const prevPage = () => setCurrentPage((p) => (p - 1 + totalPages) % totalPages);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-[#FAFBFC] dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <div className="animate-pulse text-gray-400">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const avgRating = (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1);

  return (
    <section className="py-16 md:py-24 bg-[#FAFBFC] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-14 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-5">
            What Job Seekers Are Saying
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Real stories from professionals who found their next career move through RatchetUp
          </p>

          <div className="flex justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-theme_color">{avgRating}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-theme_color">{testimonials.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reviews</div>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {currentTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Slider Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={prevPage}
              className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i === currentPage
                      ? 'bg-theme_color'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextPage}
              className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 md:mt-20 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Join thousands of professionals who found their next opportunity with us
          </p>
          <a
            href="/signup"
            className="
              inline-flex items-center gap-2
              bg-theme_color hover:bg-theme_color/90
              text-white font-medium
              px-8 py-4 rounded-xl
              transition-all duration-300
              shadow-lg shadow-theme_color/20
              hover:shadow-xl hover:shadow-theme_color/30
              hover:scale-105
            "
          >
            Start Your Job Search Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;