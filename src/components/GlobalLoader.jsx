import { useSelector } from "react-redux";

export default function Loader() {
  const { loading } = useSelector((state) => state.loader);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="w-16 h-16 rounded-full animate-spin"
        style={{ border: "4px solid color-mix(in oklab, var(--foreground) 12%, transparent)", borderTopColor: "var(--primary)" }}
      />
    </div>
  );
}