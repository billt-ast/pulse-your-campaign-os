/** Notification Kernel — unified communications. */
import type { KernelMeta } from "../types";

export type NotificationChannel = "email" | "sms" | "push" | "in_app" | "realtime";
export interface NotificationRequest {
  channel: NotificationChannel;
  template: string;
  to: string[];
  data?: Record<string, unknown>;
  sendAt?: string;
}
export interface NotificationKernelApi {
  send(req: NotificationRequest): Promise<{ id: string; status: "queued" | "sent" | "failed" }>;
  preferences(userId: string): Promise<Record<NotificationChannel, boolean>>;
  subscribe(userId: string, topic: string): Promise<void>;
  digest(userId: string, cadence: "daily" | "weekly"): Promise<void>;
}
export const notificationKernelMeta: KernelMeta = {
  id: "notification",
  name: "Notification Kernel",
  purpose: "Email, SMS, push, in-app and realtime delivery with templates and preferences.",
  dependencies: ["event", "integration", "context"],
  publishes: ["notification.sent", "notification.failed"],
  consumes: ["workflow.escalated", "mission.status_changed"],
  extensionPoints: ["channel.provider", "template.pack"],
};
