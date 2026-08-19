import { FunnelIcon } from "@heroicons/react/24/outline";

// Filter dropdown for open-ended, growing entities (junkshops, programs, etc.)
// where a fixed tab/pill list (see StatusChip) doesn't scale.
export const DropdownFilter = ({
  options,
  value,
  onChange,
  id = "dropdownFilter",
  className = "",
}) => {
  return (
    <div className={`flex flex-row items-center gap-2 ${className}`}>
      <div className="flex flex-row text-gray-600 text-sm items-center justify-center gap-1">
        <FunnelIcon className="w-4" />
        <p>Filter:</p>
      </div>
      <div className="bg-surface new-border rounded-xl px-3 py-1.5 text-sm text-gray-600 outline-none hover:cursor-pointer">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="outline-none"
        >
          {options?.map((opt) => (
            <option value={opt.value} key={opt.value}>
              {opt.label}
              {typeof opt.count === "number" ? ` (${opt.count})` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
