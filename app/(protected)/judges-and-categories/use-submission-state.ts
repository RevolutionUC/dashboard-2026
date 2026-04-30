"use client";

import { useState } from "react";

interface MutationResult {
  success: boolean;
  error?: string;
}

export function useSubmissionState(onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const start = () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
  };

  const finish = (result: MutationResult, successMessage: string, fallbackErrorMessage: string) => {
    setIsLoading(false);

    if (result.success) {
      setSuccess(successMessage);
      setTimeout(() => {
        onSuccess?.();
        setSuccess(null);
      }, 1500);
    } else {
      setError(result.error || fallbackErrorMessage);
    }
  };

  const finishWithReset = (
    result: MutationResult,
    successMessage: string,
    fallbackErrorMessage: string,
    reset: () => void,
  ) => {
    if (result.success) {
      reset();
    }
    finish(result, successMessage, fallbackErrorMessage);
  };

  return {
    isLoading,
    error,
    success,
    setError,
    start,
    finish,
    finishWithReset,
  };
}
