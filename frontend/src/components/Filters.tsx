import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";

/** The filter shape */
export interface FilterState {
  startYear: number | null;
  endYear: number | null;
  venues: string[];
  coreRanking: string | null;
  sort: string | null; // "Newest" or "Oldest"
}

/** Props for the Filters component */
interface FiltersProps {
  onFilterChange: (filters: FilterState) => void;
  minYear: number | null;
  maxYear: number | null;
  availableVenues: string[];
}

const Filters: React.FC<FiltersProps> = ({
  onFilterChange,
  minYear,
  maxYear,
  availableVenues,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    startYear: null,
    endYear: null,
    venues: [],
    coreRanking: null,
    sort: null,
  });

  const [anchorElDate, setAnchorElDate] = useState<null | HTMLElement>(null);
  const [anchorElVenue, setAnchorElVenue] = useState<null | HTMLElement>(null);
  const [anchorElSort, setAnchorElSort] = useState<null | HTMLElement>(null);
  const [anchorElCoreRanking, setAnchorElCoreRanking] = useState<null | HTMLElement>(null);

  // Build an array of years from minYear to maxYear
  const yearOptions: number[] = [];
  if (minYear !== null && maxYear !== null) {
    for (let y = minYear; y <= maxYear; y++) {
      yearOptions.push(y);
    }
  }

  // Notify parent whenever filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleStartYearChange = (event: SelectChangeEvent<number>) => {
    const selected = event.target.value as number;
    setFilters((prev) => ({ ...prev, startYear: selected === 0 ? null : selected }));
  };

  const handleEndYearChange = (event: SelectChangeEvent<number>) => {
    const selected = event.target.value as number;
    setFilters((prev) => ({ ...prev, endYear: selected === 0 ? null : selected }));
  };

  const handleVenueSelect = (venue: string) => {
    setFilters((prev) => ({
      ...prev,
      venues: [...new Set([...prev.venues, venue])],
    }));
    setAnchorElVenue(null);
  };

  const handleSortSelect = (sortOption: string) => {
    setFilters((prev) => ({ ...prev, sort: sortOption }));
    setAnchorElSort(null);
  };

  const handleCoreRankingSelect = (ranking: string) => {
    setFilters((prev) => ({ ...prev, coreRanking: ranking }));
    setAnchorElCoreRanking(null);
  };

  const handleRemoveFilter = (filterKey: keyof FilterState, value?: string) => {
    if (filterKey === "venues" && value) {
      setFilters((prev) => ({
        ...prev,
        venues: prev.venues.filter((v) => v !== value),
      }));
    } else {
      setFilters((prev) => ({ ...prev, [filterKey]: filterKey === "venues" ? [] : null }));
    }
  };

  return (
    <Box sx={{ marginTop: 2, marginBottom: 2 }}>
      <Button variant="outlined" onClick={(e) => setAnchorElDate(e.currentTarget)}>
        Date
      </Button>
      <Button variant="outlined" onClick={(e) => setAnchorElVenue(e.currentTarget)}>
        Venue
      </Button>
      <Button variant="outlined" onClick={(e) => setAnchorElSort(e.currentTarget)}>
        Sort
      </Button>
      <Button variant="outlined" onClick={(e) => setAnchorElCoreRanking(e.currentTarget)}>
        Core Ranking
      </Button>

      {/* Date Menu */}
      <Menu anchorEl={anchorElDate} open={Boolean(anchorElDate)} onClose={() => setAnchorElDate(null)}>
        <Box sx={{ padding: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Start Year</InputLabel>
            <Select<number>
              label="Start Year"
              value={filters.startYear === null ? 0 : filters.startYear}
              onChange={handleStartYearChange}
            >
              <MenuItem value={0}>(None)</MenuItem>
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>End Year</InputLabel>
            <Select<number>
              label="End Year"
              value={filters.endYear === null ? 0 : filters.endYear}
              onChange={handleEndYearChange}
            >
              <MenuItem value={0}>(None)</MenuItem>
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Menu>

      {/* Venue Menu */}
      <Menu anchorEl={anchorElVenue} open={Boolean(anchorElVenue)} onClose={() => setAnchorElVenue(null)}>
        {availableVenues.map((venue) => (
          <MenuItem key={venue} onClick={() => handleVenueSelect(venue)}>
            {venue}
          </MenuItem>
        ))}
      </Menu>

      {/* Sort Menu */}
      <Menu anchorEl={anchorElSort} open={Boolean(anchorElSort)} onClose={() => setAnchorElSort(null)}>
        {["Newest", "Oldest"].map((sortOption) => (
          <MenuItem key={sortOption} onClick={() => handleSortSelect(sortOption)}>
            {sortOption}
          </MenuItem>
        ))}
      </Menu>

      {/* Core Ranking Menu */}
      <Menu
        anchorEl={anchorElCoreRanking}
        open={Boolean(anchorElCoreRanking)}
        onClose={() => setAnchorElCoreRanking(null)}
      >
        {["A*", "A", "B", "C"].map((ranking) => (
          <MenuItem key={ranking} onClick={() => handleCoreRankingSelect(ranking)}>
            {ranking}
          </MenuItem>
        ))}
      </Menu>

      {/* Active Filters as Chips */}
      <Box sx={{ marginTop: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
        {filters.startYear !== null && (
          <Chip label={`Start: ${filters.startYear}`} onDelete={() => handleRemoveFilter("startYear")} />
        )}
        {filters.endYear !== null && (
          <Chip label={`End: ${filters.endYear}`} onDelete={() => handleRemoveFilter("endYear")} />
        )}
        {filters.venues.map((venue) => (
          <Chip key={venue} label={`Venue: ${venue}`} onDelete={() => handleRemoveFilter("venues", venue)} />
        ))}
        {filters.coreRanking && (
          <Chip label={`Core Ranking: ${filters.coreRanking}`} onDelete={() => handleRemoveFilter("coreRanking")} />
        )}
        {filters.sort && (
          <Chip label={`Sort: ${filters.sort}`} onDelete={() => handleRemoveFilter("sort")} />
        )}
      </Box>
    </Box>
  );
};

export default Filters;
