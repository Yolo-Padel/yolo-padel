import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface RoleFormCardProps {
  title: string;
  children: React.ReactNode;
}

export function RoleFormCard({ title, children }: RoleFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
