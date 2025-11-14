import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiCountryFilterProps {
  countries: string[];
  selectedCountries: string[];
  onChange: (countries: string[]) => void;
}

const MultiCountryFilter = ({ countries, selectedCountries, onChange }: MultiCountryFilterProps) => {
  const [open, setOpen] = useState(false);

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      onChange(selectedCountries.filter((c) => c !== country));
    } else {
      onChange([...selectedCountries, country]);
    }
  };

  const selectAll = () => {
    onChange([...countries]);
  };

  const clearAll = () => {
    onChange([]);
  };

  const displayText =
    selectedCountries.length === 0
      ? "All Countries (Average)"
      : selectedCountries.length === 1
      ? selectedCountries[0]
      : `${selectedCountries.length} countries selected`;

  return (
    <div className="mb-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[250px] justify-between"
            role="combobox"
            aria-expanded={open}
          >
            <span className="truncate">{displayText}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-medium">Select Countries</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={selectAll}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={clearAll}
              >
                Clear
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-2">
              {countries.map((country) => (
                <div
                  key={country}
                  className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                >
                  <Checkbox
                    id={country}
                    checked={selectedCountries.includes(country)}
                    onCheckedChange={() => toggleCountry(country)}
                  />
                  <label
                    htmlFor={country}
                    className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {country}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
          {selectedCountries.length > 0 && (
            <div className="border-t px-4 py-2">
              <div className="flex flex-wrap gap-1">
                {selectedCountries.map((country) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs"
                  >
                    {country}
                    <button
                      onClick={() => toggleCountry(country)}
                      className="rounded-full hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiCountryFilter;

