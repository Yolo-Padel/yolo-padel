"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginWithMagicLinkSchema,
  LoginWithMagicLinkData,
} from "@/lib/validations/auth.validation";
import { useLogin } from "@/hooks/use-auth";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useMagicLinkRequest } from "@/hooks/use-magic-link";
import { useBypassAuth } from "@/hooks/use-bypass-auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const searchParams = useSearchParams();
  const userType = searchParams.get("type"); // Default to admin
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<LoginWithMagicLinkData>({
    resolver: zodResolver(loginWithMagicLinkSchema),
  });

  const bypassAuthMutation = useBypassAuth();

  const loginMutation = useLogin();
  const magicLinkRequestMutation = useMagicLinkRequest();

  const onSubmit = (data: LoginWithMagicLinkData) => {
    setSubmittedEmail(data.email);
    magicLinkRequestMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setEmailSent(true);
        },
      }
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
            className="h-8 w-8 rounded-lg bg-primary"
          >
            <ArrowLeft className="h-4 w-4 text-black" />
          </Button>
          <h1 className="text-2xl font-bold">Confirm your Email</h1>
        </div>

        <div className="flex flex-col gap-8">
          <p className="text-muted-foreground text-sm">
            A secure login link has been sent to{" "}
            <span className="underline font-medium">{submittedEmail}</span>.
            Click the link in your email to access the{" "}
            {userType === "admin" ? "admin dashboard" : "dashboard"}.
          </p>

          <Button
            type="button"
            onClick={handleCheckEmail}
            className="w-full bg-primary flex items-center justify-center gap-2 text-black"
          >
            Check Email
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
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
    <>
      <form
        className={cn("flex flex-col gap-6", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <FieldGroup>
          <div className="flex flex-col gap-1">
            {userType === "admin" ? (
              <>
                <h1 className="text-2xl font-bold">Login to Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  Access your admin account to manage and monitor the system.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">Welcome Back!</h1>
                <p className="text-muted-foreground text-sm">
                  Enter your email, and we will send you a link to log in.
                </p>
              </>
            )}
          </div>
          <Field>
            <FieldLabel htmlFor="email">
              Enter your email address<span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </Field>
          <Field>
            <Button type="submit" disabled={magicLinkRequestMutation.isPending}>
              {magicLinkRequestMutation.isPending
                ? "Sending magic link..."
                : "Send magic link"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      {process.env.NEXT_PUBLIC_APP_URL === "http://localhost:3000" && (
        <Button
          type="button"
          className="w-full mt-1"
          onClick={() => {
            bypassAuthMutation.mutate(form.getValues("email"));
          }}
          disabled={bypassAuthMutation.isPending}
        >
          Bypass Auth
        </Button>
      )}
    </>
  );
}
