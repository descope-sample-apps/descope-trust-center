"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { z } from "zod/v4";

import { cn } from "@descope-trust-center/ui";
import { Button } from "@descope-trust-center/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@descope-trust-center/ui/field";
import { Input } from "@descope-trust-center/ui/input";

import { useTRPC } from "~/trpc/react";

const REQUEST_TYPES = [
  { value: "general", label: "General Inquiry" },
  { value: "compliance", label: "Compliance Question" },
  { value: "security-report", label: "Security Report" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
] as const;

type _RequestType = (typeof REQUEST_TYPES)[number]["value"];

/**
 * Zod schema for contact form validation
 * Matches the tRPC mutation input schema with additional client-side constraints
 */
const ContactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or less"),
  email: z.email("Please enter a valid email address"),
  company: z
    .string()
    .min(1, "Company is required")
    .max(100, "Company must be 100 characters or less"),
  requestType: z.enum(
    ["general", "compliance", "security-report", "partnership", "other"],
    {
      error: "Please select a request type",
    },
  ),
  message: z
    .string()
    .min(10, "Please provide more detail (at least 10 characters)")
    .max(5000, "Message must be 5000 characters or less"),
});

type ContactFormData = z.infer<typeof ContactFormSchema>;

/**
 * Form field errors state type
 */
type FieldErrors = Partial<Record<keyof ContactFormData, string>>;

/**
 * Contact Form component for security inquiries.
 *
 * Features:
 * - Field validation on blur and submit
 * - Loading state during submission
 * - Success/error feedback messages
 * - Full keyboard and screen reader accessibility
 * - Responsive layout for all device sizes
 *
 * @remarks
 * Uses tRPC mutation for form submission.
 * The mutation currently logs to console; email integration to be added.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const formId = useId();
  const successRef = useRef<HTMLDivElement>(null);

  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    requestType: "general",
    message: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Set<keyof ContactFormData>>(new Set());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const trpc = useTRPC();

  /**
   * Handle successful form submission
   */
  const handleSuccess = useCallback(() => {
    setSubmitSuccess(true);
    setSubmitError(null);
    // Focus the success message for screen readers
    setTimeout(() => successRef.current?.focus(), 100);
  }, []);

  /**
   * Handle form submission error
   */
  const handleError = useCallback((error: { message?: string }) => {
    setSubmitError(
      error.message ??
        "Something went wrong. Please try again or email us at security@descope.com",
    );
    setSubmitSuccess(false);
  }, []);

  const submitMutation = useMutation(
    trpc.trustCenter.submitContactForm.mutationOptions({
      onSuccess: handleSuccess,
      onError: handleError,
    }),
  );

  /**
   * Validates a single field and returns any error message
   */
  const validateField = useCallback(
    (field: keyof ContactFormData, value: string): string | undefined => {
      const fieldSchema = ContactFormSchema.shape[field];
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        return result.error.issues[0]?.message;
      }
      return undefined;
    },
    [],
  );

  /**
   * Validates all fields and returns a map of errors
   */
  const validateForm = useCallback((): FieldErrors => {
    const result = ContactFormSchema.safeParse(formData);
    if (result.success) return {};

    const errors: FieldErrors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof ContactFormData;
      errors[field] ??= issue.message;
    }
    return errors;
  }, [formData]);

  /**
   * Handles input change for text fields
   */
  const handleChange = useCallback(
    (field: keyof ContactFormData) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) => {
        const value = e.target.value;
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error if field is now valid
        if (touched.has(field)) {
          const error = validateField(field, value);
          setFieldErrors((prev) => ({ ...prev, [field]: error }));
        }
      },
    [touched, validateField],
  );

  /**
   * Handles field blur for validation
   */
  const handleBlur = useCallback(
    (field: keyof ContactFormData) => () => {
      setTouched((prev) => new Set(prev).add(field));
      const error = validateField(field, formData[field]);
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField],
  );

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      // Mark all fields as touched
      setTouched(new Set(Object.keys(formData) as (keyof ContactFormData)[]));

      // Validate all fields
      const errors = validateForm();
      setFieldErrors(errors);

      if (Object.keys(errors).length > 0) {
        return;
      }

      // Submit the form
      submitMutation.mutate({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        message: `[${formData.requestType.toUpperCase()}] ${formData.message}`,
      });
    },
    [formData, validateForm, submitMutation],
  );

  /**
   * Resets the form to initial state
   */
  const handleReset = useCallback(() => {
    setFormData({
      name: "",
      email: "",
      company: "",
      requestType: "general",
      message: "",
    });
    setFieldErrors({});
    setTouched(new Set());
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  const isSubmitting = submitMutation.isPending;

  // Generate unique IDs for accessibility
  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const companyId = `${formId}-company`;
  const requestTypeId = `${formId}-request-type`;
  const messageId = `${formId}-message`;

  return (
    <section
      aria-labelledby="contact-heading"
      className="bg-slate-50 px-4 py-16 sm:px-6 md:py-24 lg:px-8 dark:bg-slate-800/50"
    >
      <div className="mx-auto max-w-xl">
        {/* Section Header */}
        <div className="text-center">
          <h2
            id="contact-heading"
            className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
          >
            Contact Our Security Team
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Have a security question or need access to documentation? We&apos;re
            here to help.
          </p>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div
            ref={successRef}
            role="alert"
            aria-live="polite"
            tabIndex={-1}
            className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20"
          >
            <div className="flex">
              <SuccessIcon className="size-5 shrink-0 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                  Thank you for your inquiry!
                </h3>
                <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                  We&apos;ve received your request and will respond within 1
                  business day.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 text-sm font-medium text-green-700 underline underline-offset-4 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                >
                  Send another message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Form */}
        {!submitSuccess && (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 space-y-6"
            aria-describedby={submitError ? `${formId}-error` : undefined}
          >
            {/* Form Error Summary */}
            {submitError && (
              <div
                id={`${formId}-error`}
                role="alert"
                aria-live="assertive"
                className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
              >
                <div className="flex">
                  <ErrorIcon className="size-5 shrink-0 text-red-600 dark:text-red-400" />
                  <p className="ml-3 text-sm text-red-700 dark:text-red-300">
                    {submitError}
                  </p>
                </div>
              </div>
            )}

            <FieldGroup>
              {/* Name Field */}
              <Field data-invalid={!!fieldErrors.name}>
                <FieldLabel htmlFor={nameId}>
                  Name <RequiredIndicator />
                </FieldLabel>
                <Input
                  id={nameId}
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={
                    fieldErrors.name ? `${nameId}-error` : undefined
                  }
                  value={formData.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  placeholder="Jane Doe"
                  disabled={isSubmitting}
                  className="h-11 text-base"
                />
                {fieldErrors.name && (
                  <FieldError id={`${nameId}-error`}>
                    {fieldErrors.name}
                  </FieldError>
                )}
              </Field>

              {/* Email Field */}
              <Field data-invalid={!!fieldErrors.email}>
                <FieldLabel htmlFor={emailId}>
                  Email <RequiredIndicator />
                </FieldLabel>
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={
                    fieldErrors.email ? `${emailId}-error` : undefined
                  }
                  value={formData.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  placeholder="jane@descope-trust-center.com"
                  disabled={isSubmitting}
                  className="h-11 text-base"
                />
                {fieldErrors.email && (
                  <FieldError id={`${emailId}-error`}>
                    {fieldErrors.email}
                  </FieldError>
                )}
              </Field>

              {/* Company Field */}
              <Field data-invalid={!!fieldErrors.company}>
                <FieldLabel htmlFor={companyId}>
                  Company <RequiredIndicator />
                </FieldLabel>
                <Input
                  id={companyId}
                  name="company"
                  type="text"
                  autoComplete="organization"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.company}
                  aria-describedby={
                    fieldErrors.company ? `${companyId}-error` : undefined
                  }
                  value={formData.company}
                  onChange={handleChange("company")}
                  onBlur={handleBlur("company")}
                  placeholder="Acme Corp"
                  disabled={isSubmitting}
                  className="h-11 text-base"
                />
                {fieldErrors.company && (
                  <FieldError id={`${companyId}-error`}>
                    {fieldErrors.company}
                  </FieldError>
                )}
              </Field>

              {/* Request Type Dropdown */}
              <Field data-invalid={!!fieldErrors.requestType}>
                <FieldLabel htmlFor={requestTypeId}>
                  Request Type <RequiredIndicator />
                </FieldLabel>
                <select
                  id={requestTypeId}
                  name="requestType"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.requestType}
                  aria-describedby={
                    fieldErrors.requestType
                      ? `${requestTypeId}-error`
                      : undefined
                  }
                  value={formData.requestType}
                  onChange={handleChange("requestType")}
                  onBlur={handleBlur("requestType")}
                  disabled={isSubmitting}
                  className={cn(
                    "h-11 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none",
                    "border-input dark:bg-input/30",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    fieldErrors.requestType &&
                      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                  )}
                >
                  {REQUEST_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.requestType && (
                  <FieldError id={`${requestTypeId}-error`}>
                    {fieldErrors.requestType}
                  </FieldError>
                )}
              </Field>

              {/* Message Textarea */}
              <Field data-invalid={!!fieldErrors.message}>
                <FieldLabel htmlFor={messageId}>
                  Message <RequiredIndicator />
                </FieldLabel>
                <textarea
                  id={messageId}
                  name="message"
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.message}
                  aria-describedby={
                    fieldErrors.message ? `${messageId}-error` : undefined
                  }
                  value={formData.message}
                  onChange={handleChange("message")}
                  onBlur={handleBlur("message")}
                  placeholder="Please describe your security question or request..."
                  disabled={isSubmitting}
                  rows={5}
                  className={cn(
                    "w-full min-w-0 resize-y rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none",
                    "placeholder:text-muted-foreground",
                    "border-input dark:bg-input/30",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                    fieldErrors.message &&
                      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                  )}
                />
                <FieldDescription>
                  Minimum 10 characters. Maximum 5000 characters.
                </FieldDescription>
                {fieldErrors.message && (
                  <FieldError id={`${messageId}-error`}>
                    {fieldErrors.message}
                  </FieldError>
                )}
              </Field>
            </FieldGroup>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="size-4" />
                    Submitting...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Urgent Contact Info */}
        <div className="mt-10 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            For urgent security matters, please email us directly at{" "}
            <a
              href="mailto:security@descope.com"
              className="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
            >
              security@descope.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Visual indicator for required form fields
 */
function RequiredIndicator() {
  return (
    <span aria-hidden="true" className="text-red-500 dark:text-red-400">
      *
    </span>
  );
}

/**
 * Loading spinner for submit button
 */
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Success checkmark icon
 */
function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Error exclamation icon
 */
function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}
