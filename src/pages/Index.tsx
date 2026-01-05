import { Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';

const GraphVisualization = lazy(() => 
  import('@/components/graph/GraphVisualization').then(mod => ({ default: mod.GraphVisualization }))
);

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Entity Relationship Explorer | Interactive Graph Visualization</title>
        <meta 
          name="description" 
          content="Explore entity relationships with an interactive force-directed graph. Navigate between employees, hospitals, and insurance claims with bidirectional traversal." 
        />
      </Helmet>
      <Suspense fallback={
        <div className="h-screen w-screen bg-background flex items-center justify-center">
          <div className="text-foreground text-lg">Loading graph...</div>
        </div>
      }>
        <GraphVisualization />
      </Suspense>
    </>
  );
};

export default Index;
