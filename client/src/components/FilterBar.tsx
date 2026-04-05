interface FilterItem {
  id: string;
  label: string;
}

interface FilterBarProps {
  filters: FilterItem[];
  activeFilters: string[];
  onToggle: (id: string) => void;
  count?: number;
  separatorAfter?: number[];
}

function FilterChip({
  filter,
  isActive,
  onToggle,
}: {
  filter: FilterItem;
  isActive: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={`px-3.5 py-[5px] text-xs font-medium rounded-full border transition-all duration-200 whitespace-nowrap ${
        isActive
          ? "text-text-primary bg-[rgba(255,255,255,0.05)] border-border-hover"
          : "text-text-muted border-border bg-transparent hover:text-text-secondary hover:border-border-hover"
      }`}
      onClick={() => onToggle(filter.id)}
    >
      {filter.label}
    </button>
  );
}

export default function FilterBar({
  filters,
  activeFilters,
  onToggle,
  count,
  separatorAfter = [],
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {filters.map((filter, index) => (
        <FilterBarItem
          key={filter.id}
          filter={filter}
          isActive={activeFilters.includes(filter.id)}
          onToggle={onToggle}
          showSeparator={separatorAfter.includes(index)}
        />
      ))}
      {count !== undefined && (
        <span className="ml-auto text-xs font-medium text-text-muted whitespace-nowrap">
          {count} courts
        </span>
      )}
    </div>
  );
}

function FilterBarItem({
  filter,
  isActive,
  onToggle,
  showSeparator,
}: {
  filter: FilterItem;
  isActive: boolean;
  onToggle: (id: string) => void;
  showSeparator: boolean;
}) {
  return (
    <>
      <FilterChip filter={filter} isActive={isActive} onToggle={onToggle} />
      {showSeparator && <div className="w-px h-[18px] bg-border mx-1 shrink-0" />}
    </>
  );
}
