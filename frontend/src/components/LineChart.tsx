import React from "react";
import { Line } from "react-chartjs-2";

const LineChart: React.FC = () => {
  const data = {
    labels: [2000, 2001, 2002, 2003, 2004],
    datasets: [
      {
        label: "Researcher 1",
        data: [5, 10, 15, 20, 25],
        borderColor: "#1f77b4",
        fill: false,
      },
      {
        label: "Researcher 2",
        data: [10, 15, 20, 25, 30],
        borderColor: "#ff7f0e",
        fill: false,
      },
      {
        label: "Researcher 3",
        data: [15, 20, 25, 30, 35],
        borderColor: "#2ca02c",
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" as const },
    },
    scales: {
      x: { title: { display: true, text: "Year" } },
      y: { title: { display: true, text: "Number of Publications" } },
    },
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
