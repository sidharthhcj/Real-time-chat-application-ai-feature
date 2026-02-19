import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/chat");
    } catch (err) {
      alert("Wrong credentials, please signup");
      navigate("/signup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass-panel border border-white/20 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[var(--color-primary-start)] to-[var(--color-primary-end)] rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg transform rotate-3">
            <span className="text-3xl">💬</span>
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-main)] mb-2">Welcome Back</h2>
          <p className="text-[var(--text-muted)]">Sign in to continue chatting</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="email"
                placeholder="Email Address"
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-black/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-start)] transition-all text-[var(--text-main)] placeholder:text-gray-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-black/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-start)] transition-all text-[var(--text-main)] placeholder:text-gray-500"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--color-primary-start)] to-[var(--color-primary-end)] text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Signing in...' : (
              <>
                <span>Login</span>
                <LogIn size={20} />
              </>
            )}
          </button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Don't have an account?{" "}
            <span
              className="text-[var(--color-primary-start)] font-bold cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
