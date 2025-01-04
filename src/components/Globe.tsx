import { ErrorBoundary } from 'react-error-boundary';
import type { UserNode } from '@/types';
import { GlobeContainer } from './globe/GlobeContainer';
import { mapUserNodesToGlobeNodes } from '@/lib/utils';

const FallbackComponent = () => (
  <div className="w-full h-full flex items-center justify-center text-gray-400">
    Loading visualization...
  </div>
);

export const Globe = ({ userNodes = [] }: { userNodes?: UserNode[] }) => {
  const globeNodes = mapUserNodesToGlobeNodes(userNodes);
  
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <GlobeContainer userNodes={globeNodes} width={window.innerWidth} height={window.innerHeight} />
    </ErrorBoundary>
  );
};