"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * One text field with suggestions. Start typing to filter the common choices, pick one, or keep
 * your own wording. The suggestions are part of the page, so they sit exactly under the field.
 */
export function ChoiceWithOther({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  invalid?: boolean;
}) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const query = value.trim().toLowerCase();
  const matches = options.filter((o) => o.toLowerCase().includes(query) && o.toLowerCase() !== query);

  return (
    <div className="relative">
      <Input
        id={id}
        role="combobox"
        aria-expanded={open && matches.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={invalid}
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && matches.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto border border-border bg-elevated py-1 shadow-lg"
        >
          {matches.map((o) => (
            <li
              key={o}
              role="option"
              aria-selected={o === value}
              // Keep focus in the field so the list stays open until a choice is made.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={cn(
                "cursor-pointer px-3 py-2.5 text-sm text-reading/90 transition-colors duration-150 hover:bg-gold/10 hover:text-gold",
                o === value && "text-gold",
              )}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
