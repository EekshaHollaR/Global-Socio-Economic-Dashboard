import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CountryFilterProps {
  countries: string[];
  selectedCountry: string | null;
  onChange: (country: string | null) => void;
}

const CountryFilter = ({ countries, selectedCountry, onChange }: CountryFilterProps) => {
  return (
    <div className="mb-4">
      <Select
        value={selectedCountry || "all"}
        onValueChange={(value) => onChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Countries (Average)</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CountryFilter;

