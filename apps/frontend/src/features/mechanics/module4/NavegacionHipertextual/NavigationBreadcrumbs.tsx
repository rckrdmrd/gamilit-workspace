import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { HypertextNode } from './navegacionHipertextualTypes';

export const NavigationBreadcrumbs = ({ visitedNodes, nodes }: { visitedNodes: string[]; nodes: HypertextNode[] }) => (
  <div className="flex items-center gap-2 text-sm">
    {visitedNodes.map((nodeId, idx) => {
      const node = nodes.find(n => n.id === nodeId);
      return (
        <Fragment key={nodeId}>
          <span className={idx === visitedNodes.length - 1 ? 'font-bold text-detective-orange' : 'text-detective-text-secondary'}>{node?.title || 'Unknown'}</span>
          {idx < visitedNodes.length - 1 && <ChevronRight className="w-4 h-4 text-detective-text-secondary" />}
        </Fragment>
      );
    })}
  </div>
);
