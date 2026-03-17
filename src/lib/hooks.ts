'use client';

import { useState, useCallback } from 'react';

export interface FormErrors {
  [key: string]: string;
}

export interface UseFormOptions<T extends object = Record<string, unknown>> {
  onSubmit: (formData: T) => Promise<void>;
  validate?: (formData: T) => FormErrors;
}

export function useForm<T extends object = Record<string, unknown>>(options: UseFormOptions<T>) {
  const [formData, setFormData] = useState<T>({} as T);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...(prev as Record<string, unknown>), [name]: newValue } as T));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      setSubmitSuccess(false);

      // Validate
      if (options.validate) {
        const newErrors = options.validate(formData as T);
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
      }

      setIsSubmitting(true);
      try {
        await options.onSubmit(formData as T);
        setSubmitSuccess(true);
        setFormData({} as T);
        setErrors({});
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, options]
  );

  const reset = useCallback(() => {
    setFormData({} as T);
    setErrors({});
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setFormData((prev) => ({ ...(prev as Record<string, unknown>), [name]: value } as T));
  }, []);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    submitError,
    submitSuccess,
    handleChange,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
  };
}

export interface UseAsyncActionOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export function useAsyncAction(options?: UseAsyncActionOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fn();
        options?.onSuccess?.();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options?.onError?.(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return { isLoading, error, execute, reset };
}
