'use client';

import { useState, useEffect } from 'react';
import { useDeepResearch } from '@/lib/deep-research-context';
import { DeepResearch } from '@/components/deep-research';
import { Minus as MinusIcon, Plus as PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useDeepResearchVisible } from '@/lib/use-deep-research-visible';

export function DeepResearchView() {
  const { state, toggleActive } = useDeepResearch();
  const [isMinimized, setIsMinimized] = useState(false);
  const { isVisible } = useDeepResearchVisible();
  
  // Debug: Log the state to check if activity data is coming through
  useEffect(() => {
    console.log("DeepResearch state:", state);
  }, [state]);

  // If there's no activity or sources, or this instance shouldn't be visible, don't render anything
  if (!isVisible || (state.activity.length === 0 && state.sources.length === 0)) {
    return null;
  }

  return (
    <>
      {isMinimized ? (
        <Button
          size="sm"
          variant="outline"
          className="fixed right-4 top-20 z-50 rounded-full shadow-md"
          onClick={() => setIsMinimized(false)}
          aria-label="Expand research panel"
        >
          <PlusIcon size={16} className="mr-1" />
          <span className="text-xs">Activity{state.activity.length > 0 ? ` (${state.activity.length})` : ''}</span>
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed right-4 top-20 z-50 deep-research-panel"
        >
          <div className="relative">
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1 z-50 rounded-full h-6 w-6 p-0"
              onClick={() => setIsMinimized(true)}
              aria-label="Minimize research panel"
            >
              <MinusIcon size={14} />
            </Button>
            
            <DeepResearch
              isActive={state.isActive}
              onToggle={toggleActive}
              activity={state.activity}
              sources={state.sources}
            />
          </div>
        </motion.div>
      )}
    </>
  );
} 