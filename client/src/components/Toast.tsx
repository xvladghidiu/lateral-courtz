import { useEffect } from "react";
import "./Toast.css";

type ToastType = "error" | "success";

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 4000;

function DismissButton({ onDismiss }: { onDismiss: () => void }) {
  return (
    <button
      type="button"
      className="toast-dismiss"
      onClick={onDismiss}
      aria-label="Dismiss"
    >
      &#10005;
    </button>
  );
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const typeClass = type === "error" ? "toast-error" : "toast-success";

  return (
    <div className="toast-container">
      <div className={`toast ${typeClass}`}>
        {message}
        <DismissButton onDismiss={onDismiss} />
      </div>
    </div>
  );
}
