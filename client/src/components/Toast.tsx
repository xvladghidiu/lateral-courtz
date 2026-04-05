import { useEffect } from "react";

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
      className="ml-auto w-5 h-5 rounded-md flex items-center justify-center text-text-muted shrink-0 transition-colors duration-200 hover:text-text-secondary"
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

  const borderColor = type === "error"
    ? "border-[rgba(230,51,40,0.3)]"
    : "border-[rgba(29,185,84,0.3)]";

  return (
    <div className="fixed bottom-6 right-6 z-200 max-sm:bottom-auto max-sm:top-4 max-sm:right-4 max-sm:left-4">
      <div className={`flex items-center gap-2.5 px-4 py-3 bg-[rgba(12,12,14,0.85)] backdrop-blur-[24px] rounded-xl border text-[13px] font-medium text-text-primary min-w-[260px] animate-toast-in ${borderColor}`}>
        {message}
        <DismissButton onDismiss={onDismiss} />
      </div>
    </div>
  );
}
