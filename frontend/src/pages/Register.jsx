import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    namaDepan: '',
    namaBelakang: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/register', formData);
      
      if (response.data.success) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat pendaftaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F1F5F9]">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: "url('/images/bg2.png')" }}
      ></div>

      {/* Gradient + Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent bg-black/60 z-0"></div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-[448px]">
          <div className="bg-white/95 border border-[#F1F5F9] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] backdrop-blur-sm rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              <h1 className="text-2xl font-bold text-[#1E293B]">Welcome Back</h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Sign in to manage your construction projects
              </p>
            </div>

            {error && (
              <div className="px-8 pb-4">
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
                  {error}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 space-y-5 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#334155]">Nama Depan</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input 
                      type="text" 
                      name="namaDepan" 
                      value={formData.namaDepan}
                      onChange={handleChange}
                      placeholder="Nama Depan" 
                      required
                      className="w-full h-[42px] pl-10 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#334155]">Nama Belakang</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input 
                      type="text" 
                      name="namaBelakang" 
                      value={formData.namaBelakang}
                      onChange={handleChange}
                      placeholder="Nama Belakang" 
                      required
                      className="w-full h-[42px] pl-10 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">Username</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Masukkan Nama Akun Anda" 
                    required
                    className="w-full h-[42px] pl-10 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com" 
                    required
                    className="w-full h-[42px] pl-10 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    required
                    className="w-full h-[42px] pl-10 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#334155]">Confirm Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••" 
                    required
                    className="w-full h-[42px] pl-10 pr-3 text-sm bg-[#F8FAFC] border border-[#CBD5E1] rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className={`w-full h-[38px] bg-[#26C6DA] text-white text-sm font-medium rounded-md hover:bg-[#0DE7F2] transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>

              {/* Divider */}
              <div className="relative py-6">
                <div className="border-t border-[#E2E8F0]"></div>
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-sm text-[#6B7280]">
                  Sudah Punya Akun?
                </span>
              </div>

              {/* Login Button */}
              <Link 
                to="/login"
                className="block w-full h-[38px] text-center leading-[38px] bg-white border border-[#D1D5DB] rounded-md text-sm font-medium text-[#334155] hover:bg-slate-50 transition-colors"
              >
                Login
              </Link>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-white/70 flex justify-center gap-2">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-white/40">•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
