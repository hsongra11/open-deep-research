'use client';

import { useDeepResearch } from '@/lib/deep-research-context';
import { useDeepResearchVisible } from '@/lib/use-deep-research-visible';

/**
 * This component is a placeholder that consumes DeepResearch context data
 * but defers actual rendering to our minimizable DeepResearchView component.
 */
export function DeepResearchPlaceholder() {
  const { state } = useDeepResearch();
  const { isVisible } = useDeepResearchVisible();
  
  // This component will never actually render anything
  return null;
} 