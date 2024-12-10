import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";

const CoreRankingChart: React.FC = () => {
  // Mock data for researchers and CORE ranking publications
  const dataset = [
    {
      researcher: "Researcher 1",
      AStar: 5,
      A: 3,
      B: 2,
      AustralasianB: 1,
      C: 1,
      AustralasianC: 0,
      Other: 1,
    },
    {
      researcher: "Researcher 2",
      AStar: 4,
      A: 4,
      B: 3,
      AustralasianB: 2,
      C: 2,
      AustralasianC: 1,
      Other: 2,
    },
    {
      researcher: "Researcher 3",
      AStar: 6,
      A: 2,
      B: 4,
      AustralasianB: 3,
      C: 3,
      AustralasianC: 1,
      Other: 3,
    },
  ];

  return (
    <BarChart
      dataset={dataset}
      series={[
        { dataKey: "AStar", stack: "ranking", label: "A*" },
        { dataKey: "A", stack: "ranking", label: "A" },
        { dataKey: "B", stack: "ranking", label: "B" },
        { dataKey: "AustralasianB", stack: "ranking", label: "Australasian B" },
        { dataKey: "C", stack: "ranking", label: "C" },
        { dataKey: "AustralasianC", stack: "ranking", label: "Australasian C" },
        { dataKey: "Other", stack: "ranking", label: "Other" },
      ]}
      xAxis={[
        { scaleType: "band", dataKey: "researcher", title: "Researchers" },
      ]}
      slotProps={{
        legend: {
          sx: { bottom: -10, position: "relative" }, // Adjust legend positioning
          orientation: "horizontal", // Make the legend horizontal
        },
      }}
      width={600}
      height={350}
    />
  );
};

export default CoreRankingChart;
