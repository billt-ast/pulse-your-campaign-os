/**
 * events contracts — calendar events.
 */
import { z } from "zod";
import { uuid, nonEmptyString, isoTimestamp, paginated, paginationInput } from "@/packages/validators";

export const calendarEvent = z.object({
  id: uuid,
  organizationId: uuid,
  missionId: uuid.nullable(),
  title: nonEmptyString.max(300),
  startsAt: isoTimestamp,
  endsAt: isoTimestamp,
  location: z.string().max(500).optional(),
});
export type CalendarEvent = z.infer<typeof calendarEvent>;

export const createEventRequest = calendarEvent.omit({ id: true });
export const listEventsRequest = paginationInput.extend({
  organizationId: uuid,
  from: isoTimestamp,
  to: isoTimestamp,
});
export const listEventsResponse = paginated(calendarEvent);
