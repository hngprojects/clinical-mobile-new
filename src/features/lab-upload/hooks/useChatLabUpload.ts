import { useCallback, useEffect, useRef, useState } from 'react';

import type { AiReviewResult } from '../api/ai-review.types';
import type { UploadFile } from '../api/upload.types';

import { useAiReview } from './useAiReview';
import { useUploadChatLabResult } from './useUploadChatLabResult';

const INTERPRET_MESSAGES = [
  'Reading your lab values...',
  'Checking reference ranges...',
  'Looking up what the numbers mean...',
  'Preparing your summary...',
];

const LAB_UPLOAD_INTERPRETATION_TIMEOUT_MS = 120_000;
const CHAT_UPLOAD_FAILED_MESSAGE =
  'Upload could not be completed. If this chat already has 3 lab results uploaded, start a new chat or try again later.';
const LAB_INTERPRETATION_FAILED_MESSAGE =
  'We could not interpret the uploaded lab result. Please try a clearer file.';
const LAB_INTERPRETATION_TIMEOUT_MESSAGE =
  'Interpreting the uploaded lab result is taking longer than expected. You can keep chatting or try again later.';

interface UseChatLabUploadOptions {
  caseId: string;
  enabled?: boolean;
  guestSessionId?: string | null;
}

export function useChatLabUpload({
  caseId,
  enabled = true,
  guestSessionId,
}: UseChatLabUploadOptions) {
  const uploadStartedAtRef = useRef<number | null>(null);
  const baselineReviewRef = useRef<string | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(null);
  const [isInterpretingUpload, setIsInterpretingUpload] = useState(false);
  const [interpretMsgIndex, setInterpretMsgIndex] = useState(0);
  const uploadMutation = useUploadChatLabResult();

  const reviewQuery = useAiReview(caseId, guestSessionId, {
    keepStreamOpen: enabled && isInterpretingUpload,
    onInterpretationEvent: (status) => {
      uploadStartedAtRef.current = null;
      baselineReviewRef.current = null;
      setIsInterpretingUpload(false);
      setUploadErrorMessage(status === 'failed' ? LAB_INTERPRETATION_FAILED_MESSAGE : null);
    },
  });
  const { data: review, refetch: refetchReview } = reviewQuery;

  useEffect(() => {
    if (!enabled || !isInterpretingUpload) return undefined;

    const timeout = setTimeout(() => {
      uploadStartedAtRef.current = null;
      baselineReviewRef.current = null;
      setIsInterpretingUpload(false);
      setUploadErrorMessage(LAB_INTERPRETATION_TIMEOUT_MESSAGE);
      refetchReview();
    }, LAB_UPLOAD_INTERPRETATION_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [enabled, isInterpretingUpload, refetchReview]);

  useEffect(() => {
    if (!enabled || !isInterpretingUpload || !review) return;
    if (review.status !== 'complete' && review.status !== 'failed') return;

    const uploadStartedAt = uploadStartedAtRef.current;
    const reviewIdentity = getReviewIdentity(review);
    if (reviewIdentity && reviewIdentity === baselineReviewRef.current) return;

    const generatedAt = review.generatedAt ? Date.parse(review.generatedAt) : NaN;
    const isOlderThanUpload =
      review.status === 'complete' &&
      uploadStartedAt !== null &&
      !Number.isNaN(generatedAt) &&
      generatedAt < uploadStartedAt - 5_000;

    if (isOlderThanUpload) return;

    uploadStartedAtRef.current = null;
    baselineReviewRef.current = null;
    setIsInterpretingUpload(false);
    setUploadErrorMessage(review.status === 'failed' ? LAB_INTERPRETATION_FAILED_MESSAGE : null);
  }, [enabled, isInterpretingUpload, review]);

  const clearUploadError = useCallback(() => {
    if (uploadMutation.isError) uploadMutation.reset();
    setUploadErrorMessage(null);
  }, [uploadMutation]);

  const showUploadError = useCallback(
    (message: string) => {
      clearUploadError();
      setUploadErrorMessage(message);
    },
    [clearUploadError],
  );

  const uploadLabResult = useCallback(
    async (file: UploadFile, note?: string | null) => {
      clearUploadError();
      baselineReviewRef.current = getReviewIdentity(review);
      uploadStartedAtRef.current = Date.now();
      setIsInterpretingUpload(true);

      try {
        return await uploadMutation.mutateAsync({ caseId, file, note });
      } catch (error) {
        uploadStartedAtRef.current = null;
        baselineReviewRef.current = null;
        setIsInterpretingUpload(false);
        setUploadErrorMessage(CHAT_UPLOAD_FAILED_MESSAGE);
        throw error;
      }
    },
    [caseId, clearUploadError, review, uploadMutation],
  );

  useEffect(() => {
    if (!isInterpretingUpload) {
      setInterpretMsgIndex(0);
      return;
    }

    const timer = setInterval(() => {
      setInterpretMsgIndex((i) => (i + 1) % INTERPRET_MESSAGES.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [isInterpretingUpload]);

  const labUploadStatusMessage = uploadMutation.isPending
    ? 'Uploading lab result...'
    : isInterpretingUpload
      ? INTERPRET_MESSAGES[interpretMsgIndex]
      : null;

  return {
    clearUploadError,
    isLabUploading: uploadMutation.isPending,
    isLabUploadProcessing: uploadMutation.isPending || isInterpretingUpload,
    isUploadError: uploadMutation.isError,
    labUploadStatusMessage,
    review,
    reviewQuery,
    showUploadError,
    uploadErrorMessage,
    uploadLabResult,
  };
}

function getReviewIdentity(review?: AiReviewResult | null) {
  if (!review) return null;
  return `${review.status}:${review.id ?? ''}:${review.generatedAt ?? ''}`;
}
