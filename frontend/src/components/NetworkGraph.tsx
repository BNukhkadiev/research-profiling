import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Box } from "@mui/material";

interface Researcher {
  name: string;
  totalPapers: number;
  totalCitations: number;
  coauthors: { name: string; publicationsTogether: number }[];
}

interface NetworkGraphProps {
  researchers: Researcher[];
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ researchers }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // ✅ Prepare nodes and links
    const nodes: any[] = researchers.map((r) => ({
      id: r.name,
      totalPapers: r.totalPapers,
      totalCitations: r.totalCitations,
    }));

    const links: any[] = [];
    const linkSet = new Set<string>();

    // ✅ Create links only between compared researchers
    researchers.forEach((researcher) => {
      researcher.coauthors.forEach((coauthor) => {
        if (
          researchers.some((r) => r.name === coauthor.name) &&
          researcher.name !== coauthor.name
        ) {
          const linkKey = [researcher.name, coauthor.name].sort().join("-");
          if (!linkSet.has(linkKey)) {
            linkSet.add(linkKey);
            links.push({
              source: researcher.name,
              target: coauthor.name,
              value: coauthor.publicationsTogether,
            });
          }
        }
      });
    });

    // ✅ Set up SVG
    const width = 700,
      height = 500;
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "#ffffff") // White background for consistency
      .style("border-radius", "10px") // Rounded corners
      .style("box-shadow", "0px 2px 6px rgba(0, 0, 0, 0.1)"); // Shadow effect

    svg.selectAll("*").remove(); // Clear existing content

    // ✅ Set up forces for better node distribution
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(120) // Adjust for better spacing
      )
      .force("charge", d3.forceManyBody().strength(-250)) // Push nodes apart
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.05)) // Keep nodes inside
      .force("y", d3.forceY(height / 2).strength(0.05)); // Keep nodes inside

    // ✅ Draw links
    const link = svg
      .append("g")
      .attr("stroke", "#aaa")
      .attr("stroke-opacity", 0.8)
      .attr("stroke-width", 2)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line");

    // ✅ Labels for co-authored papers (number of papers)
    const linkLabels = svg
      .append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-5px")
      .attr("fill", "#333")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text((d) => d.value);

    // ✅ Node size and color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const sizeScale = d3
      .scaleLinear()
      .domain(d3.extent(nodes, (d) => d.totalPapers) as [number, number])
      .range([15, 50]); // Bigger range for node size

    // ✅ Draw nodes (researchers)
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => sizeScale(d.totalPapers))
      .attr("fill", (d, i) => colorScale(i.toString()))
      .call(drag(simulation));

    // ✅ Draw researcher names
    const labels = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "#000")
      .attr("font-size", (d) => `${sizeScale(d.totalPapers) / 3}px`)
      .text((d) => d.id);

    // ✅ Keep everything inside the frame
    simulation.on("tick", () => {
      link
        .attr("x1", (d) =>
          Math.max(50, Math.min(width - 50, (d.source as any).x))
        )
        .attr("y1", (d) =>
          Math.max(50, Math.min(height - 50, (d.source as any).y))
        )
        .attr("x2", (d) =>
          Math.max(50, Math.min(width - 50, (d.target as any).x))
        )
        .attr("y2", (d) =>
          Math.max(50, Math.min(height - 50, (d.target as any).y))
        );

      linkLabels
        .attr("x", (d) => ((d.source as any).x + (d.target as any).x) / 2)
        .attr("y", (d) => ((d.source as any).y + (d.target as any).y) / 2);

      node
        .attr("cx", (d) => Math.max(50, Math.min(width - 50, (d as any).x)))
        .attr("cy", (d) => Math.max(50, Math.min(height - 50, (d as any).y)));

      labels
        .attr("x", (d) => Math.max(50, Math.min(width - 50, (d as any).x)))
        .attr("y", (d) => Math.max(50, Math.min(height - 50, (d as any).y)));
    });

    return () => simulation.stop(); // Cleanup
  }, [researchers]);

  // ✅ Drag function for interactivity
  function drag(simulation: d3.Simulation<any, any>) {
    return d3
      .drag<SVGCircleElement, any>()
      .on(
        "start",
        (event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }
      )
      .on(
        "drag",
        (event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        }
      )
      .on(
        "end",
        (event: d3.D3DragEvent<SVGCircleElement, any, any>, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }
      );
  }

  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <svg ref={svgRef} width="700" height="500"></svg>
    </Box>
  );
};

export default NetworkGraph;