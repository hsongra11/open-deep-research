'use client';

import { useState, useEffect } from 'react';

// Setup a module-wide registry to track which instance is currently visible
let visibleInstanceId: string | null = null;
let instanceCounter = 0;

/**
 * A hook that helps manage visibility of DeepResearch panels
 * to prevent multiple panels being rendered simultaneously
 */
export function useDeepResearchVisible() {
  // Generate a unique ID for this instance
  const [id] = useState(() => `deep-research-${instanceCounter++}`);
  const [isVisible, setIsVisible] = useState(false);

  // Register this instance and determine if it should be visible
  useEffect(() => {
    // If no instance is visible yet, this one becomes visible
    if (visibleInstanceId === null) {
      visibleInstanceId = id;
      setIsVisible(true);
    } else if (visibleInstanceId === id) {
      // This is already the visible instance
      setIsVisible(true);
    } else {
      // Another instance is visible
      setIsVisible(false);
    }

    // Cleanup
    return () => {
      // If this instance was visible, clear the registry
      if (visibleInstanceId === id) {
        visibleInstanceId = null;
      }
    };
  }, [id]);

  return {
    isVisible,
    makeVisible: () => {
      visibleInstanceId = id;
      setIsVisible(true);
    }
  };
} 