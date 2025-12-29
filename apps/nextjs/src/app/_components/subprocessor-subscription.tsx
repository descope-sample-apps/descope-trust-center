"use client";

import { useCallback, useId, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod/v4";

import { Button } from "@descope-trust-center/ui/button";
import { Field, FieldError, FieldLabel } from "@descope-trust-center/ui/field";
import { Input } from "@descope-trust-center/ui/input";

import { useTRPC } from "~/trpc/react";

const SubscriptionSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export function SubprocessorSubscription() {
  const formId = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const trpc = useTRPC();

  const submitMutation = useMutation(
    trpc.trustCenter.subscribeToSubprocessorUpdates.mutationOptions({
      onSuccess: () => {
        setSubmitSuccess(true);
        setEmail("");
        setTouched(false);
      },
      onError: (err: { message?: string }) => {
        setError(err.message ?? "Something went wrong. Please try again.");
      },
    }),
  );

  const validate = useCallback((value: string): string | undefined => {
    const result = SubscriptionSchema.shape.email.safeParse(value);
    return result.success ? undefined : result.error.issues[0]?.message;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);
      if (touched) {
        setError(validate(value) ?? null);
      }
    },
    [touched, validate],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    setError(validate(email) ?? null);
  }, [email, validate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setTouched(true);
      const validationError = validate(email);
      if (validationError) {
        setError(validationError);
        return;
      }
      submitMutation.mutate({ email });
    },
    [email, validate, submitMutation],
  );

  const emailId = `${formId}-email`;

  if (submitSuccess) {
    return (
      <div
        role="alert"
        aria-live="polite"
        className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-900/20"
      >
        <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
          ✓ You're subscribed! We'll notify you when our subprocessor list
          changes.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-4 sm:flex-row sm:items-start"
    >
      <Field data-invalid={!!error} className="flex-1">
        <FieldLabel htmlFor={emailId} className="sr-only">
          Email address
        </FieldLabel>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? `${emailId}-error` : undefined}
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="your@email.com"
          disabled={submitMutation.isPending}
          className="h-11"
        />
        {error && <FieldError id={`${emailId}-error`}>{error}</FieldError>}
      </Field>
      <Button
        type="submit"
        disabled={submitMutation.isPending}
        className="shrink-0 bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600"
      >
        {submitMutation.isPending ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}
