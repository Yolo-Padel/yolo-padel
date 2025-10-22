"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginWithMagicLinkSchema,
  LoginWithMagicLinkData,
} from "@/lib/validations/auth.validation";
import { useLogin } from "@/hooks/use-auth";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useMagicLinkRequest } from "@/hooks/use-magic-link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm<LoginWithMagicLinkData>({
    resolver: zodResolver(loginWithMagicLinkSchema),
  });

  const loginMutation = useLogin();
  const magicLinkRequestMutation = useMagicLinkRequest();

  const onSubmit = (data: LoginWithMagicLinkData) => {
    magicLinkRequestMutation.mutate({ email: data.email });
  };

  return (
    <form 
      className={cn("flex flex-col gap-6", className)} 
      onSubmit={form.handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Login to Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Access your admin account to manage and monitor the system.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email <span className="text-red-500">*</span></FieldLabel>
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
          <Button 
            type="submit" 
            disabled={magicLinkRequestMutation.isPending}
          >
            {magicLinkRequestMutation.isPending ? "Sending magic link..." : "Send magic link"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
