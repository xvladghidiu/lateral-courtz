export const courtQuerySchema = {
  querystring: {
    type: "object",
    properties: {
      query: { type: "string" },
      type: { type: "string", enum: ["indoor", "outdoor"] },
      surface: { type: "string", enum: ["hardwood", "asphalt", "rubber"] },
      north: { type: "number" },
      south: { type: "number" },
      east: { type: "number" },
      west: { type: "number" },
    },
  },
};
