import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";

const PublicationsPerYearChart: React.FC = () => {
  const data = [2000, 2001, 2002, 2003, 2004, 2005];
  const researcher1 = [1, 2, 3, 4, 5, 6];
  const researcher2 = [2, 3, 4, 5, 6, 7];
  const researcher3 = [1, 3, 2, 5, 4, 6];

  return (
    <LineChart
      xAxis={[
        {
          data,
          scaleType: "band", // Ensure x-axis uses discrete categories for the years
          labelFormat: (value) => `${value}`, // Format x-axis labels as whole numbers
          tickInterval: 1, // Show a tick for each year
          title: "Year",
        },
      ]}
      series={[
        { data: researcher1, label: "Researcher 1" },
        { data: researcher2, label: "Researcher 2" },
        { data: researcher3, label: "Researcher 3" },
      ]}
      width={600}
      height={300}
    />
  );
};

export default PublicationsPerYearChart;
