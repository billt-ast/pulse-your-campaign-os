/**
 * @pulse/kernel — the Pulse Operating System.
 *
 * Applications consume kernels. Kernels consume adapters. Nothing bypasses
 * the kernel: no route, component or service may call a database or vendor
 * SDK directly when a kernel interface exists.
 */
export * from "./types";
export * from "./events";
export * from "./registry";
export * from "./boot";

export * from "./contracts/security";
export * from "./contracts/data";
export * from "./contracts/identity";
export * from "./contracts/context";
export * from "./contracts/event";
export * from "./contracts/mission";
export * from "./contracts/workflow";
export * from "./contracts/spatial";
export * from "./contracts/knowledge";
export * from "./contracts/analytics";
export * from "./contracts/notification";
export * from "./contracts/integration";
export * from "./contracts/storage";
export * from "./contracts/ai";
export * from "./contracts/design";

export { NotImplementedYet, createMemoryEventBus, createMemoryKernelModules } from "./adapters/memory";
