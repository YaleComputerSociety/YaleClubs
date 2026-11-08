import React from "react";

interface SelectFilterProps<T extends string> {
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (value: T) => void;
  /** The "no filter" value; the control is highlighted when something else is chosen. */
  defaultValue: T;
}

/** A single-choice dropdown styled to match the multi-select Filter toggles. */
const SelectFilter = <T extends string>({ label, value, options, onChange, defaultValue }: SelectFilterProps<T>) => {
  const active = value !== defaultValue;
  return (
    <label className="relative flex items-center h-10 md:h-11 rounded hover:bg-gray-200 transition-colors duration-200">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={`appearance-none bg-transparent cursor-pointer pl-2 pr-7 h-full focus:outline-none ${
          active ? "text-blue-500" : "text-gray-600"
        }`}
      >
        {(Object.keys(options) as T[]).map((key) => (
          <option key={key} value={key}>
            {options[key]}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 text-xs">&#x25BC;</span>
    </label>
  );
};

export default SelectFilter;
