import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Shield, Mail, Lock, Loader2, ChevronRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      onLogin({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: firebaseUser.email || '',
        role: 'COLLECTOR'
      });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-12 py-3 rounded-xl border-2 border-brand-100 dark:border-slate-700 bg-brand-50 dark:bg-slate-800 text-brand-900 dark:text-slate-100 outline-none focus:border-brand-500 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 dark:bg-slate-950 p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-brand-100 dark:border-slate-800">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-brand-100 dark:bg-brand-900/30 rounded-2xl mb-4">
            <Shield className="text-brand-600 dark:text-brand-400" size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-brand-900 dark:text-slate-100 tracking-tight">DistriFin</h1>
          <p className="text-brand-500 dark:text-slate-400 mt-2 font-medium">Secure distribution finance management</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center text-sm border border-red-100">
            <AlertCircle size={18} className="mr-2" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" size={20} />
            <input 
              required type="email" placeholder="Email Address" 
              value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" size={20} />
            <input 
              required type={showPassword ? "text" : "password"} 
              placeholder="Password" value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <button 
              type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center">
            <input 
              id="remember" type="checkbox" checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-slate-400">Remember Me</label>
          </div>

          <button
            disabled={isLoading}
            type="submit"
            className="w-full flex items-center justify-center py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 active:scale-95 transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <>Sign In <ChevronRight size={18} className="ml-1" /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;