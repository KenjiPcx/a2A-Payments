import * as d3 from 'd3';
import type { GeoProjection } from 'd3';

export const setupGlobeControls = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  projection: GeoProjection,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.GeoPath,
  sensitivity: number = 75,
  onDragStart: () => void,
  onDragEnd: () => void,
  updateNodeVisibility?: () => void
) => {
  const drag = d3.drag<SVGSVGElement, unknown>()
    .on("start", () => {
      onDragStart();
    })
    .on("drag", (event) => {
      const rotate = projection.rotate();
      const k = sensitivity / projection.scale();
      
      projection.rotate([
        rotate[0] + event.dx * k,
        rotate[1] - event.dy * k,
        rotate[2]
      ]);
      
      g.selectAll("path").attr("d", path);
      g.selectAll("circle")
        .attr("cx", d => projection([d.long, d.lat])![0])
        .attr("cy", d => projection([d.long, d.lat])![1]);

      if (updateNodeVisibility) {
        updateNodeVisibility();
      }
    })
    .on("end", onDragEnd);

  svg.call(drag as any);
};

export const setupZoom = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  projection: GeoProjection,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.GeoPath,
  minScale: number = 350,
  maxScale: number = 1000
) => {
  const zoom = d3.zoom()
    .scaleExtent([1, 2.5])
    .on('zoom', (event) => {
      const newScale = minScale * event.transform.k;
      if (newScale >= minScale && newScale <= maxScale) {
        projection.scale(newScale);
        g.selectAll("path").attr("d", path);
        g.selectAll("circle")
          .attr("cx", d => projection([d.long, d.lat])![0])
          .attr("cy", d => projection([d.long, d.lat])![1])
          .attr("r", d => Math.sqrt(d.value) * 3);
      }
    });

  svg.call(zoom as any);
};