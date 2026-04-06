interface MobileBookingBarProps {
  pricePerPlayerPerHour: number;
  onBook: () => void;
  disabled: boolean;
}

export default function MobileBookingBar({ pricePerPlayerPerHour, onBook, disabled }: MobileBookingBarProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgba(10,10,12,0.85)] backdrop-blur-[24px] border-t border-[rgba(255,255,255,0.1)] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-1">
          <span className="font-['DSEG',monospace] text-[20px] text-[rgba(255,255,255,0.9)]">
            ${pricePerPlayerPerHour}
          </span>
          <span className="font-['Space_Grotesk',sans-serif] text-[10px] text-[rgba(255,255,255,0.4)] tracking-[1px]">
            /player/hr
          </span>
        </div>
        <button
          type="button"
          onClick={onBook}
          disabled={disabled}
          className="text-white rounded-xl px-6 py-3 font-['Lixdu',sans-serif] text-[12px] uppercase tracking-[2px] hover:shadow-[0_4px_20px_rgba(232,120,23,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundImage: "url(/assets/basketball-leather.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          Book Full Court
        </button>
      </div>
    </div>
  );
}
