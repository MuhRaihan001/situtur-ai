import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md">
        <div className="mx-auto max-w-[1728px] h-[98px] px-12 py-6 flex items-center justify-between">
          {/* Logo */}
          <img src="/images/logo.png" alt="Situtur Logo" className="w-[209px] h-[50px] object-cover" />

          {/* Right Menu */}
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-white hover:text-[#0BBDC7] text-[16px] leading-[24px] font-medium">Login</Link>
            <Link to="/register" className="text-white hover:text-[#0BBDC7] text-[16px] leading-[24px] font-medium">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        className="relative min-h-[1200px] flex items-center justify-center pt-[98px] bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg.png')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#0F172A]/40 mix-blend-multiply z-0"></div>

        {/* Gradient bottom */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-10"></div>

        {/* Content */}
        <div className="relative z-20 max-w-[1024px] px-4 flex flex-col items-center gap-6 text-center">
          <h1 className="text-[72px] leading-[72px] tracking-[-1.8px] font-bold text-white">
            Constructing <span className="text-[#0BBDC7] italic">Precision</span>
          </h1>
          <p className="max-w-[672px] text-[24px] leading-[32px] font-light text-[#E2E8F0]">
            The AI-powered command center for modern infrastructure projects.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center w-[155px] h-[48px] rounded-full
                     bg-[#00CED1] text-[#0F172A] font-bold text-[16px] leading-[24px]
                     shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]
                     hover:bg-[#0DE7F2] transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 relative pb-4">
            ABOUT US
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-blue-600"></span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group flex flex-col">
              <div className="pb-6">
                <div className="relative overflow-hidden w-full h-[296px] bg-[#F1F5F9] border border-[#F1F5F9] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-shadow duration-300 group-hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
                  <img src="/images/plan.png" alt="Real-time Tracking" className="w-full h-full object-cover opacity-80 grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-[1.03]" />
                </div>
              </div>
              <div className="flex flex-col gap-3 px-2">
                <h3 className="font-inter font-bold text-[20px] leading-[28px] text-[#0F172A] transition-colors duration-300 group-hover:text-[#0BBDC7]">
                  Real-time Tracking
                </h3>
                <p className="text-[#4B5563] text-[16px] leading-[24px]">
                  Monitor every aspect of your construction site in real-time. From worker
                  safety to material inventory.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group flex flex-col">
              <div className="pb-6">
                <div className="relative overflow-hidden w-full h-[296px] bg-[#F1F5F9] border border-[#F1F5F9] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
                  <img src="/images/org.png" alt="Real-time Tracking" className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-[1.05]" />
                </div>
              </div>
              <div className="flex flex-col gap-3 px-2">
                <h3 className="font-inter font-bold text-[20px] leading-[28px] text-[#0F172A] transition-colors duration-300 group-hover:text-[#0BBDC7]">
                  Real-time Tracking
                </h3>
                <p className="font-inter text-[16px] leading-[24px] text-[#4B5563]">
                  Monitor every aspect of your construction site in real-time. From worker
                  safety to material inventory.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group flex flex-col">
              <div className="pb-6">
                <div className="relative overflow-hidden w-full h-[295.98px] bg-[#F1F5F9] border border-[#F1F5F9] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]">
                  <img src="/images/st.png" alt="Automated Reporting" className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-[1.05]" />
                </div>
              </div>
              <div className="flex flex-col gap-3 px-2">
                <h3 className="font-inter font-bold text-[20px] leading-[28px] text-[#0F172A] transition-colors duration-300 group-hover:text-[#0BBDC7]">
                  Automated Reporting
                </h3>
                <p className="font-inter text-[16px] leading-[24px] text-[#4B5563]">
                  Generate comprehensive progress reports instantly, keep stakeholders
                  informed with data-driven insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#F8FAFC] border-t border-[#E2E8F0] py-12">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1088px] mx-auto px-4">
          <div className="text-2xl font-bold text-slate-900 mb-4 md:mb-0">
            SITUTUR <span className="text-emerald-500">[AI]</span>
          </div>
          <div className="text-slate-500 text-sm">
            ©2026 SITUTUR AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
