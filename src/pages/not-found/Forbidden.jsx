import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div
      className="flex items-center justify-center min-h-screen px-6"
      style={{ background: "var(--background)" }}
    >
      <div
        className="glass-strong p-10 rounded-2xl text-center max-w-md w-full card-enter"
        style={{ boxShadow: "0 8px 40px -12px oklch(0 0 0 / 55%)" }}
      >
        <div className="flex justify-center mb-6">
          <div
            className="p-4 rounded-full"
            style={{
              background: "color-mix(in oklab, var(--destructive) 18%, transparent)",
              border: "1px solid color-mix(in oklab, var(--destructive) 35%, transparent)",
            }}
          >
            <ShieldAlert
              className="w-10 h-10"
              style={{ color: "var(--destructive)" }}
            />
          </div>
        </div>

        <h1
          className="text-3xl font-bold mb-4"
          style={{ color: "var(--foreground)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          403 — Access Denied
        </h1>

        <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          You don't have permission to access this page.
          Please contact your administrator if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
