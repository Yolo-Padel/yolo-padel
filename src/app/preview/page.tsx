import WelcomeEmail from "@/components/emails/welcome-email";

export default function EmailPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-200 p-8">
      <WelcomeEmail
        userName="John Doe"
        dashboardUrl="https://yourapp.com/dashboard"
      />
    </div>
  );
}
