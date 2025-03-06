'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { BlockKind } from './block';
import { Suggestion } from '@/lib/db/schema';
import { initialBlockData, useBlock } from '@/hooks/use-block';
import { useUserMessageId } from '@/hooks/use-user-message-id';
import { cx } from 'class-variance-authority';
import { useDeepResearch } from '@/lib/deep-research-context';

type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'spreadsheet-delta'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'user-message-id'
    | 'kind'
    | 'activity-delta'
    | 'source-delta';
  content:
    | string
    | Suggestion
    | {
        type:
          | 'search'
          | 'extract'
          | 'analyze'
          | 'reasoning'
          | 'synthesis'
          | 'thought';
        status: 'pending' | 'complete' | 'error';
        message: string;
        timestamp: string;
      }
    | {
        url: string;
        title: string;
        relevance: number;
      };
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream } = useChat({ id });
  const { setUserMessageIdFromServer } = useUserMessageId();
  const { setBlock } = useBlock();
  const { addActivity, addSource, state } = useDeepResearch();
  const lastProcessedIndex = useRef(-1);

  // Debug: Log the deep research state to see if it's being updated
  useEffect(() => {
    console.log("DataStreamHandler: Deep Research State:", state);
  }, [state]);

  useEffect(() => {
    if (!dataStream?.length) return;

    try {
      const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
      lastProcessedIndex.current = dataStream.length - 1;

      for (const delta of newDeltas) {
        // Validate that delta is properly formed before processing
        if (!delta || typeof delta !== 'object' || !('type' in delta)) {
          console.warn('Received malformed delta:', delta);
          continue;
        }

        const typedDelta = delta as DataStreamDelta;

        if (typedDelta.type === 'user-message-id') {
          setUserMessageIdFromServer(typedDelta.content as string);
          continue;
        }

        setBlock((draftBlock) => {
          if (!draftBlock) {
            return { ...initialBlockData, status: 'streaming' };
          }

          switch (typedDelta.type) {
            case 'id':
              return {
                ...draftBlock,
                documentId: typedDelta.content as string,
                status: 'streaming',
              };

            case 'title':
              return {
                ...draftBlock,
                title: typedDelta.content as string,
                status: 'streaming',
              };

            case 'kind':
              return {
                ...draftBlock,
                kind: typedDelta.content as BlockKind,
                status: 'streaming',
              };

            case 'text-delta':
              return {
                ...draftBlock,
                content: draftBlock.content + (typedDelta.content as string),
                isVisible:
                  draftBlock.status === 'streaming' &&
                  draftBlock.content.length > 400 &&
                  draftBlock.content.length < 450
                    ? true
                    : draftBlock.isVisible,
                status: 'streaming',
              };

            case 'code-delta':
              return {
                ...draftBlock,
                content: typedDelta.content as string,
                isVisible:
                  draftBlock.status === 'streaming' &&
                  draftBlock.content.length > 300 &&
                  draftBlock.content.length < 310
                    ? true
                    : draftBlock.isVisible,
                status: 'streaming',
              };
            case 'spreadsheet-delta':
              return {
                ...draftBlock,
                content: typedDelta.content as string,
                isVisible: true,
                status: 'streaming',
              };

            case 'clear':
              return {
                ...draftBlock,
                content: '',
                status: 'streaming',
              };

            case 'finish':
              return {
                ...draftBlock,
                status: 'idle',
              };

            case 'activity-delta':
              try {
                const activity = typedDelta.content as {
                  type: 'search' | 'extract' | 'analyze' | 'thought' | 'reasoning';
                  status: 'pending' | 'complete' | 'error';
                  message: string;
                  timestamp: string;
                };
                console.log("Adding activity:", activity); // Debug log
                addActivity(activity);
              } catch (err) {
                console.error("Failed to process activity delta:", err);
              }
              return {
                ...draftBlock,
                status: 'streaming',
              };

            case 'source-delta':
              try {
                const source = typedDelta.content as {
                  url: string;
                  title: string;
                  relevance: number;
                };
                console.log("Adding source:", source); // Debug log
                addSource(source);
              } catch (err) {
                console.error("Failed to process source delta:", err);
              }
              return {
                ...draftBlock,
                status: 'streaming',
              };

            default:
              return draftBlock;
          }
        });
      }
    } catch (error) {
      console.error("Error processing data stream:", error);
    }
  }, [
    dataStream,
    setBlock,
    setUserMessageIdFromServer,
    addActivity,
    addSource,
  ]);

  return null;
}
