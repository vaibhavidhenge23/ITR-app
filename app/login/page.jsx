"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ emailOrPhone: "", password: "" });
  const [regForm, setRegForm] = useState({
    name: "", email: "", phone: "", pan: "", dob: "", password: "", confirm: ""
  });

  useEffect(() => {
    const u = localStorage.getItem("itr_user");
    if (u) router.push("/dashboard");
  }, [router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true); setMsg({ text: "", type: "" });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("itr_user", JSON.stringify(data));
        setMsg({ text: "✅ Login successful! Redirecting...", type: "success" });
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setMsg({ text: `❌ ${data.error}`, type: "error" });
      }
    } catch { setMsg({ text: "❌ Server error", type: "error" }); }
    setLoading(false);
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (regForm.password !== regForm.confirm) {
      setMsg({ text: "❌ Passwords do not match", type: "error" }); return;
    }
    if (regForm.pan.length !== 10) {
      setMsg({ text: "❌ PAN must be 10 characters", type: "error" }); return;
    }
    setLoading(true); setMsg({ text: "", type: "" });
    try {
      const { confirm, ...payload } = regForm;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: "✅ Account created! Please log in.", type: "success" });
        setTimeout(() => setIsRegister(false), 1200);
      } else {
        setMsg({ text: `❌ ${data.error}`, type: "error" });
      }
    } catch { setMsg({ text: "❌ Server error", type: "error" }); }
    setLoading(false);
  }

  const inputCls = "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition";
  const labelCls = "block text-sm text-gray-400 mb-1";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">📋</div>
          <h1 className="text-2xl font-bold text-white">ITR Auto</h1>
          <p className="text-gray-500 text-sm mt-1">India's simplest ITR filing assistant</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Tab toggle */}
          <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
            <button onClick={() => { setIsRegister(false); setMsg({ text: "", type: "" }); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${!isRegister ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"}`}>
              Login
            </button>
            <button onClick={() => { setIsRegister(true); setMsg({ text: "", type: "" }); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${isRegister ? "bg-blue-500 text-white" : "text-gray-400 hover:text-white"}`}>
              Register
            </button>
          </div>

          {/* Login Form */}
          {!isRegister && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelCls}>Email or Phone Number</label>
                <input type="text" placeholder="abc@gmail.com or 9876543210" required
                  value={loginForm.emailOrPhone}
                  onChange={e => setLoginForm({ ...loginForm, emailOrPhone: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input type="password" placeholder="Your password" required
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                  className={inputCls} />
              </div>
              {msg.text && (
                <p className={`text-sm text-center ${msg.type === "success" ? "text-green-400" : "text-red-400"}`}>
                  {msg.text}
                </p>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2.5 rounded-xl transition disabled:opacity-50">
                {loading ? "Logging in..." : "Login →"}
              </button>
            </form>
          )}

          {/* Register Form */}
          {isRegister && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input type="text" placeholder="Vaibhavi Sharma" required
                    value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <input type="date" required
                    value={regForm.dob} onChange={e => setRegForm({ ...regForm, dob: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" placeholder="abc@gmail.com" required
                  value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                  className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input type="tel" placeholder="9876543210" required
                    value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>PAN Number</label>
                  <input type="text" placeholder="ABCDE1234F" maxLength={10} required
                    value={regForm.pan} onChange={e => setRegForm({ ...regForm, pan: e.target.value.toUpperCase() })}
                    className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Password</label>
                  <input type="password" placeholder="Create password" required
                    value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Confirm Password</label>
                  <input type="password" placeholder="Repeat password" required
                    value={regForm.confirm} onChange={e => setRegForm({ ...regForm, confirm: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              {msg.text && (
                <p className={`text-sm text-center ${msg.type === "success" ? "text-green-400" : "text-red-400"}`}>
                  {msg.text}
                </p>
              )}
              <button type="submit" disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-2.5 rounded-xl transition disabled:opacity-50">
                {loading ? "Creating account..." : "Create Account →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
