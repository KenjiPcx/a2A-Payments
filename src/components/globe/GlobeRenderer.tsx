import * as d3 from 'd3';
import type { Node } from './types';

export const initializeGlobe = (width: number, height: number, svgElement: SVGSVGElement) => {
  const svg = d3.select(svgElement)
    .attr('width', width)
    .attr('height', height);

  const projection = d3.geoOrthographic()
    .scale(550)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);
  const g = svg.append('g');

  return { svg, projection, path, g };
};

export const renderGlobe = async (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  path: d3.GeoPath<any, d3.GeoPermissibleObjects>,
  projection: d3.GeoProjection,
  userNodes: Node[],
  onNodeSelect: (node: Node, index: number) => void,
  shouldRotate: boolean
) => {
  // Load world map data
  const response = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
  const worldData = await response.json();

  // Draw the globe
  g.append('path')
    .datum({ type: 'Sphere' })
    .attr('class', 'sphere')
    .attr('d', path)
    .attr('fill', '#1a1a1a')
    .attr('stroke', '#333')
    .attr('stroke-width', '0.5');

  // Draw countries
  g.append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(d3.geoFeature(worldData, worldData.objects.countries).features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', '#2a2a2a')
    .attr('stroke', '#333')
    .attr('stroke-width', '0.5');

  // Add nodes
  const nodes = g.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(userNodes)
    .enter()
    .append('circle')
    .attr('r', 4)
    .attr('fill', '#FFD700')
    .attr('stroke', '#fff')
    .attr('stroke-width', '1')
    .style('cursor', 'pointer')
    .on('click', (event, d) => {
      const index = userNodes.indexOf(d);
      onNodeSelect(d, index);
    });

  const updateNodePositions = () => {
    nodes.attr('transform', d => {
      const [x, y] = projection([d.long, d.lat])!;
      return `translate(${x},${y})`;
    });
  };

  updateNodePositions();

  let rotation = 0;
  let dragging = false;

  if (shouldRotate) {
    d3.timer(() => {
      if (dragging) return;
      rotation += 0.5;
      projection.rotate([rotation, 0]);
      g.selectAll('path').attr('d', path);
      updateNodePositions();
    });
  }

  return {
    setDragging: (value: boolean) => {
      dragging = value;
    },
    updateNodeVisibility: () => {
      updateNodePositions();
    }
  };
};
