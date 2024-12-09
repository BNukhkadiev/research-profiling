import React, { useState } from "react";
import { Box, Button, Chip, Menu, MenuItem } from "@mui/material";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file

interface FiltersProps {
  onFilterChange: (filters: any) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<{
    date: string | null;
    venue: string[];
    coreRanking: string | null;
    sort: string | null;
  }>({
    date: null,
    venue: [],
    coreRanking: null,
    sort: null,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [anchorElVenue, setAnchorElVenue] = useState<null | HTMLElement>(null);
  const [anchorElCoreRanking, setAnchorElCoreRanking] =
    useState<null | HTMLElement>(null);
  const [anchorElSort, setAnchorElSort] = useState<null | HTMLElement>(null);

  const toggleDatePicker = () => {
    setShowDatePicker((prev) => !prev);
  };

  const handleDateChange = (ranges: any) => {
    setDateRange([ranges.selection]);
    setFilters((prev) => ({
      ...prev,
      date: `${ranges.selection.startDate.toLocaleDateString()} - ${ranges.selection.endDate.toLocaleDateString()}`,
    }));
    setShowDatePicker(false);
    onFilterChange(filters);
  };

  const handleSelectFilter = (type: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: type === "venue" ? [...prev.venue, value] : value,
    }));
    onFilterChange(filters);
  };

  const handleRemoveFilter = (type: string, value?: string) => {
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
    onFilterChange(filters);
  };

  const handleClearAll = () => {
    setFilters({ date: null, venue: [], coreRanking: null, sort: null });
    onFilterChange(filters);
  };

  return (
    <Box>
      {/* Filter Buttons */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <Button variant="outlined" onClick={toggleDatePicker}>
          Date
        </Button>
        <Button
          variant="outlined"
          onClick={(e) => setAnchorElVenue(e.currentTarget)}
        >
          Venue
        </Button>
        <Button
          variant="outlined"
          onClick={(e) => setAnchorElCoreRanking(e.currentTarget)}
        >
          CORE Ranking
        </Button>
        <Button
          variant="outlined"
          onClick={(e) => setAnchorElSort(e.currentTarget)}
        >
          Sort
        </Button>
      </Box>

      {/* Venue Menu */}
      <Menu
        anchorEl={anchorElVenue}
        open={Boolean(anchorElVenue)}
        onClose={() => setAnchorElVenue(null)}
      >
        {["ICML 2024", "SIGGRAPH", "CHI", "Nature"].map((venue) => (
          <MenuItem
            key={venue}
            onClick={() => {
              handleSelectFilter("venue", venue);
              setAnchorElVenue(null);
            }}
          >
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
        {["A*", "A", "B", "C", "Australasian B"].map((ranking) => (
          <MenuItem
            key={ranking}
            onClick={() => {
              handleSelectFilter("coreRanking", ranking);
              setAnchorElCoreRanking(null);
            }}
          >
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
        {["Newest", "Oldest"].map((sortOption) => (
          <MenuItem
            key={sortOption}
            onClick={() => {
              handleSelectFilter("sort", sortOption);
              setAnchorElSort(null);
            }}
          >
            {sortOption}
          </MenuItem>
        ))}
      </Menu>

      {/* Date Picker */}
      {showDatePicker && (
        <Box sx={{ marginBottom: 2 }}>
          <DateRangePicker
            ranges={dateRange}
            onChange={handleDateChange}
            moveRangeOnFirstSelection={false}
          />
        </Box>
      )}

      {/* Active Filters */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", marginBottom: 2 }}>
        {filters.date && (
          <Chip
            label={`Date: ${filters.date}`}
            onDelete={() => handleRemoveFilter("date")}
          />
        )}
        {filters.venue.map((v) => (
          <Chip
            key={v}
            label={`Venue: ${v}`}
            onDelete={() => handleRemoveFilter("venue", v)}
          />
        ))}
        {filters.coreRanking && (
          <Chip
            label={`CORE Ranking: ${filters.coreRanking}`}
            onDelete={() => handleRemoveFilter("coreRanking")}
          />
        )}
        {filters.sort && (
          <Chip
            label={`Sort: ${filters.sort}`}
            onDelete={() => handleRemoveFilter("sort")}
          />
        )}
        {(filters.date ||
          filters.venue.length ||
          filters.coreRanking ||
          filters.sort) && (
          <Button onClick={handleClearAll} color="secondary">
            Clear All
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Filters;
