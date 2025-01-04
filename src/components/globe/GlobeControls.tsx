import * as d3 from 'd3';

export const setupGlobeControls = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  projection: d3.GeoProjection,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.GeoPath<any, d3.GeoPermissibleObjects>,
  sensitivity: number,
  onDragStart: () => void,
  onDragEnd: () => void,
  onRotate: () => void
) => {
  const drag = d3.drag<SVGSVGElement, unknown>()
    .on('start', () => {
      onDragStart();
    })
    .on('drag', (event) => {
      const rotate = projection.rotate();
      projection.rotate([
        rotate[0] + event.dx / sensitivity,
        rotate[1] - event.dy / sensitivity
      ]);
      g.selectAll('path').attr('d', path);
      onRotate();
    })
    .on('end', () => {
      onDragEnd();
    });

  svg.call(drag);
};

export const setupZoom = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  projection: d3.GeoProjection,
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.GeoPath<any, d3.GeoPermissibleObjects>,
  minScale: number,
  maxScale: number,
  onZoom: () => void
) => {
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([minScale, maxScale])
    .on('zoom', (event) => {
      projection.scale(event.transform.k);
      g.selectAll('path').attr('d', path);
      onZoom();
    });

  svg.call(zoom);
};
