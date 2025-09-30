import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Command, Menu } from "lucide-react";

export type NavigationBarProps = {
  name?: string;
  orientation?: "horizontal" | "vertical";
};

export default function NavigationBar({
  name = "Navigation Bar",
  orientation = "horizontal",
}: NavigationBarProps) {
  const isVertical = orientation === "vertical";

  return (
    <Card className="h-full w-full border-0 bg-transparent shadow-none">
      <CardContent className="h-full p-0">
        <header
          className={cn(
            "flex w-full items-center justify-between border p-2",
            isVertical ? "h-full flex-col" : "flex-row",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-2",
              isVertical ? "w-full flex-col border-b pb-4" : "flex-row",
            )}
          >
            <Command className="h-6 w-6 text-primary" aria-hidden="true" />
            <span className="font-semibold">{name}</span>
          </div>
          <nav
            className={cn(
              "flex items-center gap-2",
              isVertical ? "flex-grow flex-col py-4" : "hidden md:flex",
            )}
          >
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Pricing</Button>
            <Button variant="ghost">Contact</Button>
          </nav>
          <div
            className={cn(
              "flex items-center gap-2",
              isVertical ? "w-full flex-col border-t pt-4" : "flex-row",
            )}
          >
            <Button size={isVertical ? "default" : "sm"}>Sign In</Button>
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>
      </CardContent>
    </Card>
  );
}
