import { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { initializeGlobe, renderGlobe } from './GlobeRenderer';
import { setupGlobeControls, setupZoom } from './GlobeControls';
import type { Node } from './types';

interface GlobeSceneProps {
  width: number;
  height: number;
  userNodes: Node[];
  onNodeSelect: (node: Node, index: number) => void;
  shouldRotate: boolean;
}

export const GlobeScene = ({ 
  width, 
  height, 
  userNodes, 
  onNodeSelect,
  shouldRotate 
}: GlobeSceneProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const globeControlsRef = useRef<any>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const minScale = 450;
    const maxScale = 2000;

    const { svg, projection, path, g } = initializeGlobe(width, height, svgRef.current);

    // Adjust scale and position based on screen size
    const isMobile = width < 640;
    const scale = isMobile 
      ? Math.min(width, height) * 0.5  // Larger scale for mobile
      : Math.min(width, height) * 0.4;  // Original scale for desktop
    
    projection.scale(scale);
    
    // Adjust vertical position for mobile
    const yOffset = isMobile ? height * 0.4 : height / 2;  // Move up on mobile
    projection.translate([width / 2, yOffset]);

    renderGlobe(g, path, projection, userNodes, onNodeSelect, shouldRotate).then((controls) => {
      globeControlsRef.current = controls;
      
      setupGlobeControls(
        svg,
        projection,
        g,
        path,
        75,
        () => {
          controls.setDragging(true);
        },
        () => {
          controls.setDragging(false);
        },
        controls.updateNodeVisibility
      );

      setupZoom(
        svg, 
        projection, 
        g, 
        path, 
        minScale, 
        maxScale, 
        controls.updateNodeVisibility
      );
    });

    return () => {
      if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
      }
    };
  }, [width, height, userNodes, onNodeSelect, shouldRotate]);

  return (
    <svg 
      ref={svgRef}
      width={width}
      height={height}
      style={{ 
        maxWidth: '100%',
        height: 'auto',
        display: 'block'
      }}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    />
  );
};