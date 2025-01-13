import { ErrorBoundary } from "react-error-boundary";
import type { UserNode } from "@/types";
import { GlobeContainer } from "./globe/GlobeContainer";

const FallbackComponent = () => (
  <div className="w-full h-full flex items-center justify-center text-gray-400">
    Loading visualization...
  </div>
);

export const Globe = ({
  userNodes = [],
  isRotating,
}: {
  userNodes?: UserNode[];
  isRotating: boolean;
}) => {
  const flattenedUserNodes = userNodes.map((node) => ({
    long: node.coordinates?.longitude,
    lat: node.coordinates?.latitude,
    value: 5,
    type: "user",
    userData: node,
  }));

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <GlobeContainer
        userNodes={flattenedUserNodes}
        width={window.innerWidth}
        height={window.innerHeight}
        isRotating={isRotating}
      />
    </ErrorBoundary>
  );
};
