import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterToggle: () => void;
}

const SearchBar = ({ onSearch, onFilterToggle }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="relative flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="रोग खोजें... | Search diseases, symptoms, या हिंदी नाम..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-3 text-lg border-2 border-primary/20 focus:border-primary shadow-card"
          />
        </div>
        <Button
          onClick={onFilterToggle}
          variant="outline"
          size="lg"
          className="px-6 border-2 border-primary/20 hover:border-primary"
        >
          <Filter className="h-5 w-5 mr-2" />
          फ़िल्टर | Filters
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Search by disease name, symptoms, category, or Hindi names • केवल शैक्षिक संदर्भ के लिए
      </p>
    </div>
  );
};

export default SearchBar;