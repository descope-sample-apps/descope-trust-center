import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "../components/layout";
import { HomePage } from "../pages/home-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}