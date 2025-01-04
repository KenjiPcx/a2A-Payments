import * as d3 from 'd3';

export const createGlowFilters = (defs: d3.Selection<SVGDefsElement, unknown, null, undefined>) => {
  // Create multiple filters for layered glow effect
  const filter1 = defs.append("filter")
    .attr("id", "glow1")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  filter1.append("feGaussianBlur")
    .attr("stdDeviation", "10")
    .attr("result", "coloredBlur1");

  const filter2 = defs.append("filter")
    .attr("id", "glow2")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  filter2.append("feGaussianBlur")
    .attr("stdDeviation", "20")
    .attr("result", "coloredBlur2");

  const filter3 = defs.append("filter")
    .attr("id", "glow3")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%");

  filter3.append("feGaussianBlur")
    .attr("stdDeviation", "30")
    .attr("result", "coloredBlur3");
};