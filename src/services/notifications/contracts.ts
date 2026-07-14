/**
 * notifications contracts — in-app / email / sms / push.
 */
import { z } from "zod";
import { uuid, nonEmptyString, isoTimestamp, paginated, paginationInput } from "@/packages/validators";

export const notification = z.object({
  id: uuid,
  recipientId: uuid,
  channel: z.enum(["in_app", "email", "sms", "push"]),
  title: nonEmptyString.max(200),
  body: z.string().max(4000),
  readAt: isoTimestamp.nullable(),
  createdAt: isoTimestamp,
});
export type Notification = z.infer<typeof notification>;

export const sendNotificationRequest = z.object({
  recipientId: uuid,
  channel: notification.shape.channel,
  title: nonEmptyString.max(200),
  body: z.string().max(4000),
});
export const listNotificationsRequest = paginationInput.extend({ recipientId: uuid });
export const listNotificationsResponse = paginated(notification);
