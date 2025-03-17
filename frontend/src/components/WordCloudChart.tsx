import React from "react";
import WordCloud from "react-d3-cloud";
import { Box, Typography } from "@mui/material";

interface WordCloudChartProps {
  topics: string[];
}

const WordCloudChart: React.FC<WordCloudChartProps> = ({ topics }) => {
  if (!topics || topics.length === 0) {
    return <Typography>No topic data available.</Typography>;
  }

  // ✅ Count occurrences of each topic
  const topicCounts: Record<string, number> = {};
  topics.forEach((topic) => {
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });

  // ✅ Convert to word cloud format with better scaling
  const wordData = Object.entries(topicCounts).map(([text, value]) => ({
    text,
    value: Math.log2(value + 1) * 10, // ✅ Smaller word scaling
  }));

  // ✅ Controlled color palette
  const colorPalette = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#E91E63"];
  const getColor = (index: number) => colorPalette[index % colorPalette.length];

  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: 2,
        textAlign: "center",
      }}
    >
      <WordCloud
        data={wordData}
        width={320} // ✅ Smaller word cloud size
        height={250}
        font="Arial"
        fontSize={(word) => word.value}
        rotate={(word) =>
          word.value > 30 ? 0 : Math.random() > 0.5 ? -45 : 45
        } // ✅ Better readability
        padding={2} // ✅ Less overlap
        fill={(word, index) => getColor(index)}
      />
    </Box>
  );
};

export default WordCloudChart;