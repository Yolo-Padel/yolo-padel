import React from "react";
import WelcomeEmail from "@/components/emails/welcome-email";

export default function page() {
  return (
    <div>
      <WelcomeEmail email="johndoe@examples.com" userName="John Doe" />
    </div>
  );
}
