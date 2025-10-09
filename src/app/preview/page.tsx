import React from "react";
import WelcomeEmail from "@/components/emails/welcome-email";

export default function page() {
  return (
    <div>
      <WelcomeEmail email="johndoe@example.com" userName="John Doe" />
    </div>
  );
}
