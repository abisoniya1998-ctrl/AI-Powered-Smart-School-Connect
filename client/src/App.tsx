import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser } from './services/authService';
import type { User, UserRole } from './types';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [grade, setGrade] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const data = isRegister
        ? await registerUser({ name, email, password, role, grade: role === 'student' ? grade : undefined })
        : await loginUser({ email, password });

      setUser(data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 text-2xl">
          🎓
        </div>
        <h1 className="text-3xl font-bold text-blue-600 mb-6">schoolconnect</h1>

        <h2 className="text-2xl font-bold text-gray-900">
          {isRegister ? 'Create an account' : 'Welcome back'}
        </h2>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          {isRegister ? 'Register for your school portal' : 'Sign in to your school account'}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5 text-center">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5 text-center">
                  Select Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5 text-center">
                    Grade / Class
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 10th Grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5 text-center">
              Email address
            </label>
            <input
              type="email"
              placeholder="name@school.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5 text-center">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-500 text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign in'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError('');
          }}
          style={{ background: 'none', border: 'none', color: '#2563eb', marginTop: '20px', cursor: 'pointer', fontWeight: '600' }}
        >
          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
        </button>

        <p className="text-gray-500 text-sm mt-6">
          Student | Teacher | Parent
        </p>
      </div>
    </div>
  );
}

export default App;
