'use client';

import dynamic from 'next/dynamic';

// Dynamically import the 3D component with no SSR
const ContainerTheatre = dynamic(
  () => import('./ContainerTheatre'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] md:h-[600px] flex items-center justify-center bg-terminal-black">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-terminal-green border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-terminal-green font-mono text-sm">
            {'>'} loading 3D scene...
          </p>
        </div>
      </div>
    )
  }
);

export default function Scene() {
  return <ContainerTheatre />;
}
