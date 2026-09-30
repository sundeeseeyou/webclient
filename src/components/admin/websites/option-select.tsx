"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { value: string; label: string };

type OptionSelectProps = {
  id: string;
  value: string | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Option[];
  placeholder: string;
  invalid?: boolean;
};

export function toOptions<T extends string>(labels: Record<T, string>): Option[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}

export function OptionSelect({ id, value, onChange, onBlur, options, placeholder, invalid }: OptionSelectProps) {
  return (
    <Select value={value ?? ""} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid} onBlur={onBlur}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
