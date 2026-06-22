import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function RoadmapCard({
  title,
  description,
  href,
  disabled,
  ctaLabel = "Open",
}: {
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
  ctaLabel?: string;
}) {
  return (
    <Card className={cn(disabled && "opacity-60")}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{disabled ? "Coming soon" : "Template available now"}</p>
      </CardContent>
      <CardFooter>
        <Button disabled={disabled} variant={disabled ? "secondary" : "default"} render={<Link href={disabled ? "#" : href} />}>
          {disabled ? "Coming Soon" : ctaLabel}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
}
