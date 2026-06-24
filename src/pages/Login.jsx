import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setStore } from "../features/auth/authSlice";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const LOGO_IMG = "/ilw-logo-icon.png";
const HERO_IMG = "/ilw-hero.png";

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { line1: "Good Morning!", line2: "Hope you have a wonderful day!" };
  if (h >= 12 && h < 17) return { line1: "Good Afternoon!", line2: "Keep up the great work!" };
  if (h >= 17 && h < 21) return { line1: "Good Evening!", line2: "Hope you had a wonderful day!" };
  return { line1: "Working Late?", line2: "We are here with you!" };
}

export default function Login() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const greeting                        = getGreeting();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && user) navigate(user.role === "SUPER_ADMIN" ? "/stores/create" : "/");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!email || !password) { setError("Email and password are required"); return; }
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        dispatch(setUser(res.data.user));
        dispatch(setStore(res.data.store));
        navigate(res.data.user.role === "SUPER_ADMIN" ? "/stores/create" : "/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="dark min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* ── Backdrop orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div
          className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full animate-pulse-glow"
          style={{ background: "color-mix(in oklab, var(--primary-glow) 18%, transparent)", filter: "blur(140px)" }}
        />
        <div
          className="absolute bottom-[-20%] left-[-10%] h-[360px] w-[360px] rounded-full animate-float-slow"
          style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)", filter: "blur(140px)" }}
        />
      </div>

      {/* ── Grid backdrop ── */}
      <div className="pointer-events-none absolute inset-0 grid-bg -z-10 opacity-40" />

      {/* ── Fixed top-right logo ── */}
      <div className="fixed top-5 right-7 z-50 flex items-center gap-2">
        <img src={LOGO_IMG} alt="Indian Lens Wholesale" className="h-8 w-8 object-contain" />
        <span
          className="hidden sm:block text-xs font-semibold tracking-wide"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--muted-foreground)" }}
        >
          Indian Lens Wholesale
        </span>
      </div>

      {/* ── Main card ── */}
      <div className="card-enter relative z-10 w-full max-w-[880px] flex flex-col items-center">

        <div
          className="w-full rounded-3xl flex items-stretch overflow-hidden"
          style={{
            background: "color-mix(in oklab, var(--card) 65%, transparent)",
            backdropFilter: "blur(28px) saturate(180%)",
            border: "1px solid color-mix(in oklab, var(--foreground) 10%, transparent)",
            boxShadow: "0 0 0 1px color-mix(in oklab, var(--primary) 20%, transparent), 0 30px 80px -30px color-mix(in oklab, var(--primary) 40%, transparent)",
            minHeight: 380,
          }}
        >
          {/* ── LEFT: hero illustration panel ── */}
          <div
            className="hidden sm:flex flex-1 flex-col items-center justify-between px-6 py-8 relative overflow-hidden"
            style={{
              background: "linear-gradient(160deg, color-mix(in oklab, var(--primary) 18%, transparent) 0%, color-mix(in oklab, var(--primary-glow) 10%, transparent) 100%)",
            }}
          >
            {/* decorative rings */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full"
              style={{ border: "1px solid color-mix(in oklab, var(--primary-glow) 20%, transparent)" }}
            />
            <div
              className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full"
              style={{ border: "1px solid color-mix(in oklab, var(--primary) 20%, transparent)" }}
            />

            {/* greeting badge */}
            <div
              className="w-full rounded-2xl px-4 py-3 flex flex-col gap-0.5"
              style={{
                background: "color-mix(in oklab, var(--card) 35%, transparent)",
                border: "1px solid color-mix(in oklab, var(--primary-glow) 25%, transparent)",
              }}
            >
              <p
                className="text-sm font-bold leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--primary-glow)" }}
              >
                {greeting.line1}
              </p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                {greeting.line2}
              </p>
            </div>

            {/* hero illustration */}
            <div className="flex-1 flex items-center justify-center w-full px-2 py-4">
              <img
                src={HERO_IMG}
                alt="Indian Lens Wholesale optical products"
                className="w-full max-w-[280px] object-contain drop-shadow-2xl mascot-float"
              />
            </div>

            {/* brand tagline */}
            <div className="text-center">
              <p
                className="text-[10px] uppercase tracking-[0.18em] font-semibold"
                style={{ color: "color-mix(in oklab, var(--primary-glow) 70%, transparent)" }}
              >
                Premium Optical Wholesale
              </p>
            </div>
          </div>

          {/* vertical separator */}
          <div
            className="hidden sm:block w-px flex-shrink-0 my-6"
            style={{ background: "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--foreground) 12%, transparent) 30%, color-mix(in oklab, var(--foreground) 12%, transparent) 70%, transparent)" }}
          />

          {/* ── RIGHT: form panel ── */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 min-w-0">

            {/* mobile greeting strip */}
            <div
              className="sm:hidden flex items-center gap-3 w-full rounded-2xl px-4 py-3 mb-5"
              style={{
                background: "color-mix(in oklab, var(--primary) 12%, transparent)",
                border: "1px solid color-mix(in oklab, var(--primary) 20%, transparent)",
              }}
            >
              <img src={LOGO_IMG} alt="Indian Lens Wholesale" className="w-10 h-10 object-contain flex-shrink-0" />
              <div>
                <p
                  className="text-[12px] font-black leading-tight"
                  style={{ color: "var(--primary-glow)", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {greeting.line1}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  {greeting.line2}
                </p>
              </div>
            </div>

            {/* Logo + brand name */}
            <div className="mb-5 flex flex-col items-center gap-3">
              <img src={LOGO_IMG} alt="Indian Lens Wholesale" className="h-16 w-16 object-contain" />
              <div className="text-center">
                <h1
                  className="text-lg font-bold leading-tight text-gradient"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Indian Lens Wholesale
                </h1>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  Optical Management Platform
                </p>
              </div>
            </div>

            {/* Separator */}
            <div
              className="w-full h-px mb-5"
              style={{ background: "linear-gradient(to right, transparent, color-mix(in oklab, var(--foreground) 12%, transparent), transparent)" }}
            />

            {/* Error */}
            {error && (
              <div
                className="err-shake flex items-start gap-2 w-full rounded-xl px-3.5 py-2.5 mb-4 text-[12.5px] font-bold"
                style={{
                  background: "color-mix(in oklab, var(--destructive) 12%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--destructive) 30%, transparent)",
                  color: "var(--destructive)",
                }}
              >
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <div className="flex flex-col gap-3 w-full">

              <div className="field-1">
                <input
                  type="email"
                  placeholder="Username / Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit(e)}
                  autoComplete="email"
                  className="login-input w-full rounded-xl px-5 py-3 text-[13.5px] font-semibold transition-all"
                  style={{
                    background: "color-mix(in oklab, var(--foreground) 6%, transparent)",
                    border: "1px solid color-mix(in oklab, var(--foreground) 12%, transparent)",
                    color: "var(--foreground)",
                  }}
                />
              </div>

              <div className="field-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit(e)}
                  autoComplete="current-password"
                  className="login-input w-full rounded-xl px-5 py-3 pr-12 text-[13.5px] font-semibold transition-all"
                  style={{
                    background: "color-mix(in oklab, var(--foreground) 6%, transparent)",
                    border: "1px solid color-mix(in oklab, var(--foreground) 12%, transparent)",
                    color: "var(--foreground)",
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors cursor-pointer p-1"
                  style={{ color: "var(--muted-foreground)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--primary-glow)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--muted-foreground)"; }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="field-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-black text-[15px] rounded-xl py-3 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)",
                    color: "var(--primary-foreground)",
                    boxShadow: "0 0 0 1px color-mix(in oklab, var(--primary) 30%, transparent), 0 20px 40px -16px color-mix(in oklab, var(--primary) 50%, transparent)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: "0.3px",
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  {loading ? <><div className="btn-spin" /> Signing in...</> : "Sign In"}
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p
                className="text-[11px]"
                style={{ color: "color-mix(in oklab, var(--muted-foreground) 60%, transparent)" }}
              >
                © {new Date().getFullYear()} Indian Lens Wholesale. All rights reserved.
              </p>
            </div>

          </div>
        </div>

        {/* Tagline */}
        <p
          className="mt-6 text-center text-[15px] tracking-tight"
          style={{ color: "var(--muted-foreground)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          India's First{" "}
          <span className="font-extrabold text-gradient-primary">AI-Integrated</span>{" "}
          Optical Store Software
        </p>

      </div>
    </div>
  );
}
