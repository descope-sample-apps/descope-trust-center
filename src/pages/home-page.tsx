import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APITester } from "../APITester";

import logo from "../logo.svg";
import reactLogo from "../react.svg";

export function HomePage() {
  return (
    <>
      <div className="flex justify-center items-center gap-8 mb-8">
        <img
          src={logo}
          alt="Bun Logo"
          className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
        />
        <img
          src={reactLogo}
          alt="React Logo"
          className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] [animation:spin_20s_linear_infinite]"
        />
      </div>
      <Card>
        <CardHeader className="gap-4">
          <CardTitle className="text-3xl font-bold">Bun + React</CardTitle>
          <CardDescription>
            Edit <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono">src/pages/home-page.tsx</code> and save to
            test HMR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <APITester />
        </CardContent>
      </Card>
    </>
  );
}