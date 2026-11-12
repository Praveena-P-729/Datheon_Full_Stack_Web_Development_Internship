import { useEffect } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Toast.css';

export default function Toast() {
  const { toast, dismissToast } = useCart();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => {
      dismissToast();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`toast-container ${isSuccess ? 'toast-success' : 'toast-info'}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon" aria-hidden="true">
        {isSuccess ? <CheckCircle2 size={18} /> : <Info size={18} />}
      </span>
      <p className="toast-message">{toast.message}</p>
      <button
        type="button"
        className="toast-close"
        onClick={dismissToast}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
