export const config = {
  port: Number(process.env.PORT ?? 3001),
  jwtSecret: process.env.JWT_SECRET ?? "lateral-courts-dev-secret-change-me",
  autoCancelOffsetHours: Number(process.env.AUTO_CANCEL_OFFSET_HOURS ?? 2),
};
