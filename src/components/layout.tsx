import { Outlet } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Layout() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <Outlet />
    </div>
  );
}