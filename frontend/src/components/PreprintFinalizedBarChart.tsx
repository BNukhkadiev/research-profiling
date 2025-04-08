import React, { useState } from "react";
import { BarChart } from "@mui/x-charts";
import { Box, Typography, FormControlLabel, Checkbox } from "@mui/material";

//  Define categories for finalized and preprint papers
const publicationCategories = ["Finalized", "Preprint"];

const colorPalette: Record<string, string> = {
  Finalized: "#EE6C4D", // Green for finalized papers
  Preprint: "#3D5A80", // Orange for preprints
};

interface ResearcherData {
  name: string;
  papers: { is_preprint: boolean }[];
}

interface PreprintFinalizedBarChartProps {
  researchers: ResearcherData[];
}

const PreprintFinalizedBarChart: React.FC<PreprintFinalizedBarChartProps> = ({
  researchers = [],
}) => {
  //  Default state: Show both categories
  const [activeCategories, setActiveCategories] = useState(
    new Set(publicationCategories)
  );

  if (!Array.isArray(researchers) || researchers.length === 0) {
    return (
      <Typography>No researcher data available for publications.</Typography>
    );
  }

  //  Prepare dataset for the chart
  const dataset = researchers.map((researcher) => {
    const publicationCounts = { Finalized: 0, Preprint: 0 };

    researcher.papers.forEach((paper) => {
      if (paper.is_preprint) {
        publicationCounts.Preprint += 1;
      } else {
        publicationCounts.Finalized += 1;
      }
    });

    return { name: researcher.name || "Unknown", ...publicationCounts };
  });

  //  Define the bar chart series based on selected categories
  const series = publicationCategories
    .filter((category) => activeCategories.has(category))
    .map((category) => ({
      dataKey: category,
      label: category,
      stack: "publicationType",
      color: colorPalette[category],
    }));

  //  Handle toggling visibility of categories
  const handleToggleCategory = (category: string) => {
    setActiveCategories((prev) => {
      const newSet = new Set(prev);
      newSet.has(category) ? newSet.delete(category) : newSet.add(category);
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
      {/*  Title */}
      <Typography
        variant="h6"
        sx={{ marginBottom: 2, fontWeight: "bold", textAlign: "center" }}
      >
        Number of Preprints vs. Finalized/Published Papers
      </Typography>

      {/*  Centered Checkboxes */}
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
        {publicationCategories.map((category) => (
          <FormControlLabel
            key={category}
            control={
              <Checkbox
                checked={activeCategories.has(category)}
                onChange={() => handleToggleCategory(category)}
                sx={{
                  color: colorPalette[category], // Color of the checkbox
                  "&.Mui-checked": {
                    color: colorPalette[category], // Keep checkbox tick color
                  },
                }}
              />
            }
            label={category}
          />
        ))}
      </Box>

      {/*  Render chart only if at least one category is selected */}
      {activeCategories.size > 0 ? (
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
          Please select at least one category to display.
        </Typography>
      )}
    </Box>
  );
};

export default PreprintFinalizedBarChart;