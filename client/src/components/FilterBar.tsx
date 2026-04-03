import "./FilterBar.css";

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
  const activeClass = isActive ? " filter-chip-active" : "";
  return (
    <button
      type="button"
      className={`filter-chip${activeClass}`}
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
    <div className="filter-bar">
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
        <span className="filter-count">{count} courts</span>
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
      {showSeparator && <div className="filter-separator" />}
    </>
  );
}
