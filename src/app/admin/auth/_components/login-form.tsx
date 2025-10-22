"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginFormSchema,
  LoginFormData,
} from "@/lib/validations/auth.validation";
import { useLogin } from "@/hooks/use-auth";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
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
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password <span className="text-red-500">*</span></FieldLabel>
          </div>
          <Input 
            id="password" 
            type="password" 
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-destructive text-sm">
              {form.formState.errors.password.message}
            </p>
          )}
          <a
              href="/admin/auth/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline text-right"
            >
              Forgot your password?
            </a>
        </Field>
        <Field>
          <Button 
            type="submit" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
