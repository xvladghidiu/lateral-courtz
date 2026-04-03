export const createReviewSchema = {
  body: {
    type: "object",
    required: ["rating", "comment"],
    properties: {
      rating: { type: "number", minimum: 1, maximum: 5 },
      comment: { type: "string", minLength: 1, maxLength: 1000 },
    },
  },
};
