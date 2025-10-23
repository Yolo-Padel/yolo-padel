import { LoginForm } from "@/app/auth/_components/login-form";
import { Suspense } from "react";

export default function AdminAuthPage() {
  return (
  <Suspense fallback={<div>Loading...</div>}>
    <LoginForm />
  </Suspense>
  )
}
