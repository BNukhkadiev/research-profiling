import React from "react";
import { LineChart as MuiLineChart } from "@mui/x-charts/LineChart";
import { Box, Typography } from "@mui/material";

// 🎨 Define a color palette with enough unique colors
const colorPalette = [
  "#1f77b4", // Blue
  "#ff7f0e", // Orange
  "#2ca02c", // Green
  "#d62728", // Red
  "#9467bd", // Purple
  "#8c564b", // Brown
  "#e377c2", // Pink
  "#7f7f7f", // Gray
  "#bcbd22", // Olive
  "#17becf", // Cyan
];

interface ResearcherData {
  name: string;
  papers: { year: number; title: string }[];
}

interface PublicationsLineChartProps {
  researchers: ResearcherData[];
}

const PublicationsLineChart: React.FC<PublicationsLineChartProps> = ({
  researchers = [],
}) => {
  if (!researchers.length) {
    return (
      <Typography variant="body1" color="textSecondary">
        No researcher data available.
      </Typography>
    );
  }

  const allYears = Array.from(
    new Set(researchers.flatMap((r) => (r?.papers || []).map((p) => p.year)))
  ).sort((a, b) => a - b);

  const series = researchers.map((researcher, index) => {
    const yearCounts = allYears.map(
      (year) => researcher?.papers?.filter((p) => p.year === year).length || 0
    );

    return {
      data: yearCounts,
      label: researcher.name,
      color: colorPalette[index % colorPalette.length], // ✅ Assign unique color
      showMark: true, // Show dots for data points
    };
  });

  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: "bold" }}>
        Number of Publications Per Year
      </Typography>
      <MuiLineChart
        xAxis={[
          {
            data: allYears,
            label: "Year",
            valueFormatter: (value) => value.toString(),
          },
        ]}
        series={series}
        width={700}
        height={400}
        grid={{ vertical: true, horizontal: true }}
      />
    </Box>
  );
};

export default PublicationsLineChart;
