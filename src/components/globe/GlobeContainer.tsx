import { useState, useRef, useEffect } from "react";
import type { Node as GlobeNode } from "./types";
import { GlobeScene } from "./GlobeScene";

interface GlobeContainerProps {
  userNodes: GlobeNode[];
  width?: number;
  height?: number;
  isRotating: boolean;
}

export const GlobeContainer = ({
  userNodes,
  width = 600,
  height = 600,
  isRotating,
}: GlobeContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNodeSelect = (node: GlobeNode, index: number) => {
    window.dispatchEvent(
      new CustomEvent("nodeSelected", {
        detail: { index, userData: node.userData },
      })
    );
  };

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      className="test globe-container outline outline-10 outline-gray-300"
    >
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
