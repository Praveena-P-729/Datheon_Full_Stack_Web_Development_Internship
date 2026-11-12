import { CheckCircle2, Info, X } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Toast() {
  const { toast, dismissToast } = useCart();

  if (!toast) return null;

  return (
    <div
      className={`toast-banner ${toast.variant === "success" ? "toast-success" : "toast-neutral"}`}
      role="status"
      aria-live="polite"
    >
      {toast.variant === "success" ? (
        <CheckCircle2 size={17} aria-hidden="true" />
      ) : (
        <Info size={17} aria-hidden="true" />
      )}
      <span className="toast-text">{toast.message}</span>
      <button
        type="button"
        className="toast-close"
        onClick={dismissToast}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
