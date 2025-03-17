import * as React from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { Box, Typography, Grid } from "@mui/material";

interface ResearcherData {
  name: string;
  papers: { topics: string[] }[];
}

interface ResearchAreasPieChartProps {
  researchers: ResearcherData[];
}

// 🎨 Color palette for topics
const colorPalette = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#E91E63"];

// 🔥 Function to find top 5 topics
const getTopTopics = (papers: { topics: string[] }[]) => {
  const topicCounts: Record<string, number> = {};

  papers.forEach((paper) => {
    paper.topics.forEach((topic) => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  const totalPapers = Object.values(topicCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a) // Sort by frequency
    .slice(0, 5) // Keep top 5
    .map(([topic, count], index) => ({
      id: index,
      value: count,
      label: topic,
      color: colorPalette[index % colorPalette.length], // Assign colors cyclically
      percentage: ((count / totalPapers) * 100).toFixed(1), // Compute percentage
    }));
};

const ResearchAreasPieChart: React.FC<ResearchAreasPieChartProps> = ({
  researchers,
}) => {
  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 2,
        overflowX: "auto",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        Research Areas
      </Typography>

      <Grid container spacing={4}>
        {researchers.map((researcher, index) => {
          const topicData = getTopTopics(researcher.papers);

          return (
            <Grid
              item
              xs={12}
              sm={6}
              md={6}
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* ✅ Researcher Name */}
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "bold",
                  minWidth: "150px",
                  textAlign: "left",
                }}
              >
                {researcher.name}
              </Typography>

              {/* ✅ Pie Chart with Arc Labels */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <PieChart
                  series={[
                    {
                      data: topicData,
                      arcLabel: (item) => `${item.percentage}%`, // ✅ Show percentage
                      arcLabelMinAngle: 35, // ✅ Prevents cluttering
                      arcLabelRadius: "60%", // ✅ Position labels properly
                      innerRadius: 30,
                      outerRadius: 75,
                      paddingAngle: 5,
                      cornerRadius: 4,
                      highlightScope: { fade: "global", highlight: "item" },
                      faded: {
                        innerRadius: 30,
                        additionalRadius: -30,
                        color: "gray",
                      },
                    },
                  ]}
                  sx={{
                    [`& .${pieArcLabelClasses.root}`]: {
                      fontWeight: "bold",
                    },
                    "& .MuiChartsLegend-root": { display: "none" }, // ❌ Hide default PieChart legend
                  }}
                  width={250}
                  height={250}
                />
              </Box>

              {/* ✅ Legend Forced to the Right */}
              <Box
                sx={{
                  minWidth: "200px",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                {topicData.map((topic) => (
                  <Typography
                    key={topic.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "14px",
                    }}
                  >
                    <span
                      style={{
                        width: "12px",
                        height: "12px",
                        backgroundColor: topic.color,
                        display: "inline-block",
                        marginRight: "8px",
                      }}
                    ></span>
                    {topic.label}
                  </Typography>
                ))}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ResearchAreasPieChart;