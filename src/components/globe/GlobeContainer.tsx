import { useState, useRef, useEffect } from 'react';
import type { Node } from './types';
import { GlobeScene } from './GlobeScene';

interface GlobeContainerProps {
  userNodes: Node[];
  width?: number;
  height?: number;
}

export const GlobeContainer = ({ 
  userNodes, 
  width = 600, 
  height = 600 
}: GlobeContainerProps) => {
  const [isRotating, setIsRotating] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeSelect = (node: Node, index: number) => {
    window.dispatchEvent(new CustomEvent('nodeSelected', { 
      detail: { index, userData: node.userData }
    }));
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <GlobeScene
        width={width}
        height={height}
        userNodes={userNodes}
        onNodeSelect={handleNodeSelect}
        shouldRotate={isRotating}
      />
    </div>
  );
};