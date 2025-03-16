import React, { useEffect, useState } from "react";
import { Box, Button, Chip, Menu, MenuItem } from "@mui/material";

interface FiltersProps {
  onFilterChange: (filters: any) => void;
  availableVenues: string[]; // Dynamic venues passed from parent
  availableYears?: number[]; // Optional, if you want to pass years dynamically
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange, availableVenues, availableYears }) => {
  const currentYear = new Date().getFullYear();
  const earliestYear = 1990;

  const [filters, setFilters] = useState<{
    yearRange: [number, number] | null;
    venue: string[];
    coreRanking: string | null;
    sort: "asc" | "desc" | null;
  }>({
    yearRange: null,
    venue: [],
    coreRanking: null,
    sort: null,
  });

  const [anchorElVenue, setAnchorElVenue] = useState<null | HTMLElement>(null);
  const [anchorElCoreRanking, setAnchorElCoreRanking] = useState<null | HTMLElement>(null);
  const [anchorElSort, setAnchorElSort] = useState<null | HTMLElement>(null);
  const [anchorElYearFrom, setAnchorElYearFrom] = useState<null | HTMLElement>(null);
  const [anchorElYearTo, setAnchorElYearTo] = useState<null | HTMLElement>(null);

  const years = availableYears || Array.from({ length: currentYear - earliestYear + 1 }, (_, i) => currentYear - i);

  // Notify parent when filters update
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handle adding filters with smart year handling
  const handleSelectFilter = (type: string, value: any) => {
    setFilters((prev) => {
      let updatedYearRange = prev.yearRange;

      if (type === "yearFrom") {
        const toYear = prev.yearRange?.[1] || currentYear;
        updatedYearRange = [value, toYear];
      } else if (type === "yearTo") {
        const fromYear = prev.yearRange?.[0] || earliestYear;
        updatedYearRange = [fromYear, value];
      } else if (type === "venue") {
        return {
          ...prev,
          venue: [...new Set([...prev.venue, value])], // Prevent duplicates
        };
      } else if (type === "sort") {
        return {
          ...prev,
          sort: value === "Newest" ? "desc" : "asc",
        };
      } else if (type === "coreRanking") {
        return {
          ...prev,
          coreRanking: value,
        };
      }

      return { ...prev, yearRange: updatedYearRange };
    });
  };

  // Handle removing filters
  const handleRemoveFilter = (type: string, value?: any) => {
    if (type === "venue") {
      setFilters((prev) => ({
        ...prev,
        venue: prev.venue.filter((v) => v !== value),
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [type]: null,
      }));
    }
  };

  const handleClearAll = () => {
    setFilters({
      yearRange: null,
      venue: [],
      coreRanking: null,
      sort: null,
    });
  };

  return (
    <Box>
      {/* Filter Buttons */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <Button variant="outlined" onClick={(e) => setAnchorElYearFrom(e.currentTarget)}>
          From Year
        </Button>
        <Button variant="outlined" onClick={(e) => setAnchorElYearTo(e.currentTarget)}>
          To Year
        </Button>
        <Button variant="outlined" onClick={(e) => setAnchorElVenue(e.currentTarget)}>
          Venue
        </Button>
        <Button variant="outlined" onClick={(e) => setAnchorElCoreRanking(e.currentTarget)}>
          CORE Ranking
        </Button>
        <Button variant="outlined" onClick={(e) => setAnchorElSort(e.currentTarget)}>
          Sort
        </Button>
      </Box>

      {/* From Year Menu */}
      <Menu
        anchorEl={anchorElYearFrom}
        open={Boolean(anchorElYearFrom)}
        onClose={() => setAnchorElYearFrom(null)}
      >
        {years.map((year) => (
          <MenuItem key={year} onClick={() => { handleSelectFilter("yearFrom", year); setAnchorElYearFrom(null); }}>
            {year}
          </MenuItem>
        ))}
      </Menu>

      {/* To Year Menu */}
      <Menu
        anchorEl={anchorElYearTo}
        open={Boolean(anchorElYearTo)}
        onClose={() => setAnchorElYearTo(null)}
      >
        {years.map((year) => (
          <MenuItem key={year} onClick={() => { handleSelectFilter("yearTo", year); setAnchorElYearTo(null); }}>
            {year}
          </MenuItem>
        ))}
      </Menu>

      {/* Venue Menu */}
      <Menu
        anchorEl={anchorElVenue}
        open={Boolean(anchorElVenue)}
        onClose={() => setAnchorElVenue(null)}
      >
        {availableVenues.map((venue) => (
          <MenuItem key={venue} onClick={() => { handleSelectFilter("venue", venue); setAnchorElVenue(null); }}>
            {venue}
          </MenuItem>
        ))}
      </Menu>

      {/* CORE Ranking Menu */}
      <Menu
        anchorEl={anchorElCoreRanking}
        open={Boolean(anchorElCoreRanking)}
        onClose={() => setAnchorElCoreRanking(null)}
      >
        {["A*", "A", "B", "C"].map((ranking) => (
          <MenuItem key={ranking} onClick={() => { handleSelectFilter("coreRanking", ranking); setAnchorElCoreRanking(null); }}>
            {ranking}
          </MenuItem>
        ))}
      </Menu>

      {/* Sort Menu */}
      <Menu
        anchorEl={anchorElSort}
        open={Boolean(anchorElSort)}
        onClose={() => setAnchorElSort(null)}
      >
        {["Newest", "Oldest"].map((option) => (
          <MenuItem key={option} onClick={() => { handleSelectFilter("sort", option); setAnchorElSort(null); }}>
            {option}
          </MenuItem>
        ))}
      </Menu>

      {/* Active Filters */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", marginBottom: 2 }}>
        {filters.yearRange && (
          <Chip
            label={`Years: ${filters.yearRange[0]} - ${filters.yearRange[1]}`}
            onDelete={() => handleRemoveFilter("yearRange")}
          />
        )}
        {filters.venue.map((v) => (
          <Chip key={v} label={`Venue: ${v}`} onDelete={() => handleRemoveFilter("venue", v)} />
        ))}
        {filters.coreRanking && (
          <Chip label={`CORE: ${filters.coreRanking}`} onDelete={() => handleRemoveFilter("coreRanking")} />
        )}
        {filters.sort && (
          <Chip label={`Sort: ${filters.sort === "desc" ? "Newest" : "Oldest"}`} onDelete={() => handleRemoveFilter("sort")} />
        )}
        {(filters.yearRange || filters.venue.length || filters.coreRanking || filters.sort) && (
          <Button onClick={handleClearAll} color="secondary">Clear All</Button>
        )}
      </Box>
    </Box>
  );
};

export default Filters;
