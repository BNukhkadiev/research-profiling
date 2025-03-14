import React from "react";
import { PieChart } from "@mui/x-charts";
import {
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

interface ResearcherData {
  name: string;
  papers: { topics: string[] }[];
}

interface ResearchAreasPieChartProps {
  researchers: ResearcherData[];
}

// 🎨 Define color palette for topics
const colorPalette = [
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#FF9800", // Orange
  "#9C27B0", // Purple
  "#E91E63", // Pink
];

// 🔥 Function to find top 5 topics
const getTopTopics = (papers: { topics: string[] }[]) => {
  const topicCounts: Record<string, number> = {};

  papers.forEach((paper) => {
    paper.topics.forEach((topic) => {
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
  });

  return Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a) // Sort by count
    .slice(0, 5) // Get top 5 topics
    .map(([topic, count], index) => ({
      id: index,
      value: count,
      label: topic,
      color: colorPalette[index % colorPalette.length], // Assign colors cyclically
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
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", marginBottom: 2 }}>
        Research Areas
      </Typography>

      <Grid container spacing={4}>
        {researchers.map((researcher, index) => {
          const topicData = getTopTopics(researcher.papers);

          return (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1 }}
              >
                {researcher.name}
              </Typography>

              <Grid container spacing={2} alignItems="center">
                {/* Pie Chart with Highlighting */}
                <Grid item>
                  <PieChart
                    series={[
                      {
                        data: topicData,
                        innerRadius: 30,
                        outerRadius: 80,
                        paddingAngle: 5,
                        cornerRadius: 4,
                        highlightScope: { fade: "global", highlight: "item" }, // 🔥 Highlight Effect
                        faded: {
                          innerRadius: 30,
                          additionalRadius: -30,
                          color: "gray",
                        }, // 🔥 Fading Effect
                      },
                    ]}
                    width={200}
                    height={200}
                  />
                </Grid>

                {/* Custom Legend - Aligned properly */}
                <Grid item>
                  <List dense>
                    {topicData.map((topic) => (
                      <ListItem key={topic.id} sx={{ display: "flex", gap: 1 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: topic.color,
                            borderRadius: "50%",
                          }}
                        />
                        <ListItemText primary={topic.label} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ResearchAreasPieChart;
