"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  requestType: "contact" | "demo" | "support" | "other";
}

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
  className?: string;
}

export function ContactForm({ onSubmit, className }: ContactFormProps) {
  const [formData, setFormData] = React.useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
    requestType: "contact",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [formStatus, setFormStatus] = React.useState<"idle" | "success" | "error">("idle");
  const errorSummaryRef = React.useRef<HTMLDivElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    
    // Focus error summary if there are errors
    if (Object.keys(newErrors).length > 0 && errorSummaryRef.current) {
      errorSummaryRef.current.focus();
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    field: keyof ContactFormData,
    value: string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      setFormStatus("error");
      return;
    }

    setIsSubmitting(true);
    setFormStatus("idle");
    
    try {
      await onSubmit?.(formData);
      // Reset form on successful submission
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
        requestType: "contact",
      });
      setFormStatus("success");
      setErrors({});
    } catch (error) {
      console.error("Form submission error:", error);
      setFormStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className} role="article">
      <CardHeader>
        <CardTitle as="h2">Contact Us</CardTitle>
        <CardDescription>
          Send us a message and we'll get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {Object.keys(errors).length > 0 && (
          <div
            ref={errorSummaryRef}
            className="mb-4 p-4 border border-destructive rounded-md bg-destructive/5"
            role="alert"
            aria-live="polite"
            tabIndex={-1}
          >
            <h3 className="font-semibold text-destructive mb-2">Please correct the following errors:</h3>
            <ul className="list-disc list-inside text-sm text-destructive">
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>
                  <a href={`#${field}`} className="underline hover:no-underline">
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {formStatus === "success" && (
          <div
            className="mb-4 p-4 border border-green-600 rounded-md bg-green-50 dark:bg-green-950/20"
            role="status"
            aria-live="polite"
          >
            <p className="text-green-800 dark:text-green-200 font-medium">
              Thank you! Your message has been sent successfully.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={errors.name ? "border-destructive" : ""}
                disabled={isSubmitting}
                required
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-destructive" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
            
<div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className={errors.name ? "border-destructive" : ""}
                disabled={isSubmitting}
                required
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-destructive" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              type="text"
              placeholder="How can we help you?"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
              className={errors.subject ? "border-destructive" : ""}
              disabled={isSubmitting}
              required
            />
            {errors.subject && (
              <p id="subject-error" className="text-sm text-destructive" role="alert">
                {errors.subject}
              </p>
            )}
          </div>
            
            <div className="space-y-2">
              <Label htmlFor="requestType">Request Type</Label>
              <select
                id="requestType"
                value={formData.requestType}
                onChange={(e) => handleInputChange("requestType", e.target.value as ContactFormData["requestType"])}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                aria-describedby="requestType-description"
              >
                <option value="contact">General Contact</option>
                <option value="demo">Request Demo</option>
                <option value="support">Technical Support</option>
                <option value="other">Other</option>
              </select>
              <p id="requestType-description" className="text-xs text-muted-foreground">
                Select the type of request you're making
              </p>
            </div>
          </div>

<div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={errors.email ? "border-destructive" : ""}
                disabled={isSubmitting}
                required
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Please provide details about your request..."
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : "message-help"}
              className={errors.message ? "border-destructive" : ""}
              rows={5}
              disabled={isSubmitting}
              required
            />
            <p id="message-help" className="text-xs text-muted-foreground">
              Please provide at least 10 characters to help us understand your request
            </p>
            {errors.message && (
              <p id="message-error" className="text-sm text-destructive" role="alert">
                {errors.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
            aria-describedby="form-status"
            loading={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}