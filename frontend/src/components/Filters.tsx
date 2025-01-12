import React, { useState, useEffect } from "react";
import { Box, Button, Chip, Menu, MenuItem } from "@mui/material";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

interface FiltersProps {
  onFilterChange: (filters: any) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<{
    dateRange: { startDate: Date; endDate: Date } | null;
    venues: string[];
    coreRanking: string | null;
    sort: string | null;
  }>({
    dateRange: null,
    venues: [],
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

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleDateChange = (ranges: any) => {
    setDateRange([ranges.selection]);
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        startDate: new Date(ranges.selection.startDate),
        endDate: new Date(ranges.selection.endDate),
      },
    }));
    setShowDatePicker(false);
  };

  const handleSelectFilter = (type: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [type]: type === "venues" ? [...prev.venues, value] : value,
    }));
  };

  const handleRemoveFilter = (type: string, value?: string) => {
    if (type === "venues") {
      setFilters((prev) => ({
        ...prev,
        venues: prev.venues.filter((v) => v !== value),
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
      dateRange: null,
      venues: [],
      coreRanking: null,
      sort: null,
    });
  };

  return (
    <Box>
      {/* Filter Buttons */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <Button variant="outlined" onClick={() => setShowDatePicker((prev) => !prev)}>
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

      {/* Venue Menu */}
      <Menu
        anchorEl={anchorElVenue}
        open={Boolean(anchorElVenue)}
        onClose={() => setAnchorElVenue(null)}
      >
        {[
          "ACM SIGKDD",
          "IEEE ICMLA",
          "AAAI Conference",
          "NeurIPS",
          "ICML",
          "CHI",
          "SIGGRAPH",
          "Nature",
          "Science",
          "Stat. Comput.",
        ].map((venue) => (
          <MenuItem
            key={venue}
            onClick={() => {
              handleSelectFilter("venues", venue);
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
        {["A*", "A", "B", "C"].map((ranking) => (
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

      {/* Active Filters */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", marginBottom: 2 }}>
        {filters.dateRange && (
          <Chip
            label={`Date: ${filters.dateRange.startDate.toDateString()} - ${filters.dateRange.endDate.toDateString()}`}
            onDelete={() => handleRemoveFilter("dateRange")}
          />
        )}
        {filters.venues.map((v) => (
          <Chip
            key={v}
            label={`Venue: ${v}`}
            onDelete={() => handleRemoveFilter("venues", v)}
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
        {(filters.dateRange || filters.venues.length || filters.coreRanking || filters.sort) && (
          <Button onClick={handleClearAll} color="secondary">
            Clear All
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default Filters;
