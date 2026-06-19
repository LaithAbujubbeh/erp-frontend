import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,
});

type RouterType = typeof router;

declare module "@tanstack/react-router" {
  interface Register {
    router: RouterType;
  }
}
