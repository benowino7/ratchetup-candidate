import React from "react";
import Hero from "../components/Heros";

import ProfileProgressSection from "../components/ProfileProgressSection";
import TopCompanies from "../components/TopCompanies";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";

function Home() {
  return (
    <div>
      <Hero />
      <ProfileProgressSection />
      <TopCompanies />
      <Pricing />
      <Testimonials />
    </div>
  );
}

export default Home;
