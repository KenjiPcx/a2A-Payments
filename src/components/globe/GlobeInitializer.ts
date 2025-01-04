import * as d3 from 'd3';
import { createGlowFilters } from './GlobeFilters';

export const initializeGlobe = (
  width: number,
  height: number,
  svgRef: SVGSVGElement,
  initialScale: number = 350
) => {
  const svg = d3.select(svgRef)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background-color", "transparent");

  // Enhanced glow effect to match h1 style
  const defs = svg.append("defs");
  createGlowFilters(defs);

  const projection = d3.geoOrthographic()
    .scale(initialScale)
    .center([0, 0])
    .rotate([0, -30])
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);
  const g = svg.append("g");

  return { svg, projection, path, g };
};