"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginWithMagicLinkSchema,
  LoginWithMagicLinkData,
} from "@/lib/validations/auth.validation";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useMagicLinkRequest } from "@/hooks/use-magic-link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<LoginWithMagicLinkData>({
    resolver: zodResolver(loginWithMagicLinkSchema),
  });

  const magicLinkRequestMutation = useMagicLinkRequest();

  const onSubmit = (data: LoginWithMagicLinkData) => {
    setSubmittedEmail(data.email);
    magicLinkRequestMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setEmailSent(true);
        },
      },
    );
  };

  const handleGoBack = () => {
    setEmailSent(false);
    setSubmittedEmail("");
  };

  const handleCheckEmail = () => {
    window.open("https://mail.google.com", "_blank");
  };

  const handleResendLink = () => {
    if (submittedEmail) {
      magicLinkRequestMutation.mutate({ email: submittedEmail });
    }
  };

  if (emailSent) {
    return (
      <div className={cn("flex flex-col gap-8", className)}>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="icon"
            onClick={handleGoBack}
            className="h-8 w-8 rounded-lg bg-[#A64224] hover:bg-[#A64224]/90"
          >
            <ArrowLeft className="h-4 w-4 text-background" />
          </Button>
          <h1 className="text-2xl font-bold text-white lg:text-foreground">
            Confirm your Email
          </h1>
        </div>

        <div className="flex flex-col gap-8">
          <p className="text-white lg:text-muted-foreground text-sm">
            A secure login link has been sent to{" "}
            <span className="underline font-medium text-white lg:text-foreground">
              {submittedEmail}
            </span>
            . Click the link in your email to access the dashboard.
          </p>

          <Button
            type="button"
            onClick={handleCheckEmail}
            className="w-full bg-[#A64224] hover:bg-[#A64224]/90 text-background flex items-center justify-center gap-2"
          >
            Check Email
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div>
            <p className="text-white lg:text-muted-foreground text-sm">
              Didn't receive the email?{" "}
              <button
                type="button"
                onClick={handleResendLink}
                disabled={magicLinkRequestMutation.isPending}
                className="text-primary hover:text-primary/90 hover:underline disabled:opacity-50 cursor-pointer"
              >
                {magicLinkRequestMutation.isPending
                  ? "Sending..."
                  : "Resend Link"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-white lg:text-foreground">
            Sign in to Your Account
          </h1>
          <p className="text-white/70 lg:text-muted-foreground text-sm max-w-[258px]">
            Access your dashboard and manage your activities in one place.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email" className="text-white lg:text-foreground">
            Enter your email address<span className="text-red-500">*</span>
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="ava.wright@gmail.com"
            className="bg-white"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-sm">
              {form.formState.errors.email.message}
            </p>
          )}
        </Field>
        <Field>
          <Button
            type="submit"
            disabled={magicLinkRequestMutation.isPending}
            className="bg-[#A64224] hover:bg-[#A64224]/90 text-background"
          >
            {magicLinkRequestMutation.isPending
              ? "Sending magic link..."
              : "Send Magic Link"}
            <Mail className="size-5" />
          </Button>
        </Field>
        <div className="flex flex-col gap-2 text-white lg:text-muted-foreground text-sm">
          <p>Secure & simple sign-in</p>
          <ul>
            <li>• No passwords to remember</li>
            <li>• Fast and seamless access</li>
            <li>• Secure login with magic link</li>
          </ul>
        </div>
        <p className="text-white lg:text-muted-foreground text-sm">
          Didn't receive the email? Check your spam folder or resend the link.
        </p>
      </FieldGroup>
    </form>
  );
}
