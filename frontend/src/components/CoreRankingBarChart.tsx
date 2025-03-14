import React, { useState } from "react";
import { BarChart } from "@mui/x-charts";
import { Box, Typography, FormControlLabel, Checkbox } from "@mui/material";

// 🎨 Define colors for each ranking
const rankingCategories = ["A*", "A", "B", "C", "Unknown"];

const colorPalette: Record<string, string> = {
  "A*": "#1C93ED", // Blue
  A: "#F0A31B", // Orange
  B: "#BE87F4", // Purple
  C: "#4CAF50", // Green
  Unknown: "#999999", // Gray for Unknown
};

interface ResearcherData {
  name: string;
  papers: { core_rank?: string }[];
}

interface CoreRankingBarChartProps {
  researchers: ResearcherData[];
}

const CoreRankingBarChart: React.FC<CoreRankingBarChartProps> = ({
  researchers = [],
}) => {
  // ✅ Default state: "Unknown" is unchecked initially
  const [activeRanks, setActiveRanks] = useState(
    new Set(rankingCategories.filter((rank) => rank !== "Unknown"))
  );

  if (!Array.isArray(researchers) || researchers.length === 0) {
    return <Typography>No researcher data available for ranking.</Typography>;
  }
  // ✅ Prepare dataset for chart
  const dataset = researchers.map((researcher) => {
    const rankCounts: Record<string, number> = rankingCategories.reduce(
      (acc, rank) => ({ ...acc, [rank]: 0 }),
      {}
    );

    researcher.papers.forEach((paper) => {
      if (paper.core_rank && rankingCategories.includes(paper.core_rank)) {
        rankCounts[paper.core_rank] += 1;
      }
    });

    return { name: researcher.name || "Unknown", ...rankCounts };
  });

  // ✅ Define the bar chart series based on selected ranks
  const series = rankingCategories
    .filter((rank) => activeRanks.has(rank))
    .map((rank) => ({
      dataKey: rank,
      label: rank,
      stack: "coreRanking",
      color: colorPalette[rank],
    }));

  // ✅ Handle toggling visibility of ranking categories
  const handleToggleRank = (rank: string) => {
    setActiveRanks((prev) => {
      const newSet = new Set(prev);
      newSet.has(rank) ? newSet.delete(rank) : newSet.add(rank);
      return newSet;
    });
  };

  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      {/* 📌 Title */}
      <Typography
        variant="h6"
        sx={{ marginBottom: 2, fontWeight: "bold", textAlign: "center" }}
      >
        Number of Publications by CORE Ranking
      </Typography>

      {/* ✅ Centered Checkboxes */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
          marginBottom: 2,
        }}
      >
        {rankingCategories.map((rank) => (
          <FormControlLabel
            key={rank}
            control={
              <Checkbox
                checked={activeRanks.has(rank)}
                onChange={() => handleToggleRank(rank)}
                sx={{
                  color: colorPalette[rank], // Color of the checkbox
                  "&.Mui-checked": {
                    color: colorPalette[rank], // Keep checkbox tick color
                  },
                }}
              />
            }
            label={rank}
          />
        ))}
      </Box>

      {/* ✅ Render chart only if at least one category is selected */}
      {activeRanks.size > 0 ? (
        <BarChart
          dataset={dataset}
          xAxis={[{ scaleType: "band", dataKey: "name" }]}
          series={series}
          width={700}
          height={400}
          grid={{ vertical: true, horizontal: true }}
          legend={{ hidden: true }} // ✅ Hide extra legend
          barLabel={(item) => item.value.toString()}
        />
      ) : (
        <Typography color="error" sx={{ textAlign: "center" }}>
          Please select at least one ranking to display.
        </Typography>
      )}
    </Box>
  );
};

export default CoreRankingBarChart;
