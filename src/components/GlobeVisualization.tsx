import React from 'react';
import { Globe } from './Globe';
import { ErrorBoundary } from 'react-error-boundary';
import type { UserNode } from '@/types';

const FallbackComponent = () => (
  <div className="w-full h-full flex items-center justify-center text-gray-400">
    Loading visualization...
  </div>
);

export const GlobeVisualization = ({ userNodes = [] }: { userNodes?: UserNode[] }) => {
  return (
    <div className="w-full h-full relative">
      <div className="absolute inset-0">
        <ErrorBoundary FallbackComponent={FallbackComponent}>
          <Globe userNodes={userNodes} />
        </ErrorBoundary>
      </div>
    </div>
  );
};