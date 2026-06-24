import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen px-6"
      style={{ background: "var(--background)" }}>
      <div className="text-center card-enter">
        <div
          className="text-8xl font-extrabold tracking-widest mb-2 text-gradient-primary"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          404
        </div>

        <div
          className="inline-flex items-center px-4 py-1 text-xs font-bold rounded-full mb-6 animate-pulse"
          style={{
            background: "color-mix(in oklab, var(--destructive) 18%, transparent)",
            border: "1px solid color-mix(in oklab, var(--destructive) 40%, transparent)",
            color: "var(--destructive)",
          }}
        >
          PAGE NOT FOUND
        </div>

        <p
          className="max-w-md mx-auto text-sm leading-relaxed mb-8"
          style={{ color: "var(--muted-foreground)" }}
        >
          The page you're looking for doesn't exist or may have been moved.
          Please check the URL or return to the dashboard.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-glow) 100%)",
            color: "var(--primary-foreground)",
            boxShadow: "0 4px 20px -6px color-mix(in oklab, var(--primary) 55%, transparent)",
          }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
