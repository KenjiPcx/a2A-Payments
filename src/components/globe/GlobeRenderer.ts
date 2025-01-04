import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { GeoProjection } from 'd3';
import type { Node } from './types';
import { initializeGlobe } from './GlobeInitializer';

export const renderGlobe = async (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.GeoPath,
  projection: GeoProjection,
  nodes: Node[],
  onNodeClick: (node: Node, index: number) => void,
  shouldRotate: boolean = true
) => {
  // Add multiple background spheres with different glow intensities
  g.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "sphere")
    .attr("d", path)
    .style("fill", "#22c55e")
    .style("filter", "url(#glow1)")
    .style("opacity", "0.1");

  g.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "sphere")
    .attr("d", path)
    .style("fill", "#22c55e")
    .style("filter", "url(#glow2)")
    .style("opacity", "0.1");

  g.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "sphere")
    .attr("d", path)
    .style("fill", "#22c55e")
    .style("filter", "url(#glow3)")
    .style("opacity", "0.1");

  // Add the main sphere
  g.append("path")
    .datum({ type: "Sphere" })
    .attr("class", "sphere")
    .attr("d", path)
    .style("fill", "#000")
    .style("stroke", "none");

  const data = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
  const world = feature(data as any, (data as any).objects.countries);

  g.selectAll("path.country")
    .data((world as any).features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path)
    .style("fill", "#1a1a1a")
    .style("stroke", "#333")
    .style("stroke-width", "0.5px");

  // Function to determine if a point is visible
  const isVisible = (d: Node) => {
    const coords = projection([d.long, d.lat]);
    if (!coords) return false;
    
    const rotation = projection.rotate();
    const angle = d3.geoDistance([-rotation[0], -rotation[1]], [d.long, d.lat]);
    return angle <= Math.PI / 2;
  };

  const circles = g.selectAll("circle")
    .data(nodes)
    .enter()
    .append("circle")
    .attr("cx", d => projection([d.long, d.lat])![0])
    .attr("cy", d => projection([d.long, d.lat])![1])
    .attr("r", d => Math.sqrt(d.value) * 3)
    .style("fill", d => d.type === 'user' ? '#22c55e' : '#6b46c1')
    .style("opacity", d => isVisible(d) ? 0.7 : 0)
    .style("cursor", "pointer")
    .attr("class", d => d.isNew ? 'animate-pulse' : '')
    .on("click", (event, d) => {
      const index = nodes.indexOf(d);
      onNodeClick(d, index);
    });

  let rotationTimer: number | null = null;
  let isRotating = shouldRotate;

  const updateGlobePosition = () => {
    const rotation = projection.rotate();
    g.selectAll("path").attr("d", path);
    circles
      .attr("cx", d => projection([d.long, d.lat])![0])
      .attr("cy", d => projection([d.long, d.lat])![1])
      .style("opacity", d => isVisible(d) ? 0.7 : 0);
  };

  const rotate = () => {
    if (!isRotating) return;
    
    const rotation = projection.rotate();
    projection.rotate([
      (rotation[0] + 0.0375) % 360,
      rotation[1],
      rotation[2]
    ]);
    
    updateGlobePosition();
    rotationTimer = requestAnimationFrame(rotate);
  };

  if (shouldRotate) {
    rotate();
  }

  // Add click handler to stop rotation
  g.on("click", () => {
    isRotating = false;
    if (rotationTimer) {
      cancelAnimationFrame(rotationTimer);
      rotationTimer = null;
    }
  });

  return {
    updateNodeVisibility: () => {
      circles.style("opacity", d => isVisible(d) ? 0.7 : 0);
    },
    setDragging: (isDragging: boolean) => {
      if (isDragging) {
        isRotating = false;
        if (rotationTimer) {
          cancelAnimationFrame(rotationTimer);
          rotationTimer = null;
        }
      }
    },
    stopRotation: () => {
      isRotating = false;
      if (rotationTimer) {
        cancelAnimationFrame(rotationTimer);
        rotationTimer = null;
      }
    }
  };
};

export { initializeGlobe };