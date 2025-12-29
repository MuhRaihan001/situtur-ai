import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/login', { username, password });
      
      console.log('[DEBUG] Login response:', response.data);
      
      if (response.data.success) {
        // Redirect to the dashboard specified by the server
        navigate(response.data.redirect);
      } else {
        setError(response.data.message || 'Login gagal');
      }
    } catch (err) {
      console.error('[DEBUG] Login catch error:', err);
      // Ambil pesan dari JSON respon jika ada
      const serverMessage = err.response?.data?.message;
      // Jika data adalah string (bukan JSON), ambil string tersebut
      const serverData = typeof err.response?.data === 'string' ? err.response.data : null;
      
      setError(serverMessage || serverData || 'Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-100">
      {/* Background */}
      <img 
        src="/images/bg2.png" 
        className="absolute inset-0 w-full h-full object-cover" 
        alt="Background" 
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>

      {/* Main */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-[448px] space-y-8">
          {/* Card */}
          <div className="bg-white/95 backdrop-blur border border-slate-100 shadow-2xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center space-y-2">
              <h1 className="text-2xl font-bold text-slate-800">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-500">
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
            <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
              {/* Username */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Makan Bakso"
                    className="w-full h-11 pl-10 pr-3 text-sm rounded-md bg-slate-50 border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required 
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 pl-10 pr-3 text-sm rounded-md bg-slate-50 border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required 
                  />
                </div>
              </div>

              {/* Forgot */}
              <div className="text-right">
                <Link to="/forgot-password" title='Forgot password?' className="text-xs font-medium text-cyan-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button 
                type="submit"
                disabled={loading}
                className={`w-full h-11 bg-cyan-400 hover:bg-cyan-500 text-white text-sm font-medium rounded-md shadow transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="px-2 bg-white text-sm text-slate-500">
                  Baru di SITUTUR AI?
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Register */}
              <Link 
                to="/register"
                className="block w-full h-10 flex items-center justify-center border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Create Account
              </Link>
            </form>
          </div>

          {/* Footer Text */}
          <div className="text-center text-sm text-white/70 flex justify-center gap-3">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-white/40">•</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
