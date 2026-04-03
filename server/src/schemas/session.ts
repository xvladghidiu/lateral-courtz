export const createSessionSchema = {
  body: {
    type: "object",
    required: ["courtId", "date", "startTime", "durationMinutes", "format", "mode"],
    properties: {
      courtId: { type: "string" },
      date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
      startTime: { type: "string", pattern: "^\\d{2}:\\d{2}$" },
      durationMinutes: { type: "number", enum: [30, 60, 90, 120] },
      format: { type: "string", enum: ["5v5", "3v3"] },
      mode: { type: "string", enum: ["open", "private"] },
    },
  },
};
