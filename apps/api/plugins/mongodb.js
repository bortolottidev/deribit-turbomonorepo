import fp from "fastify-plugin";
import mongoDbConnector from "@fastify/mongodb";

export const DB_NAME = "deribit";

export const collections = {
  FUNDING_HISTORY: "funding-rate",
  SETTLEMENT_LOG: "settlement",
};

export default fp(async (fastify) => {
  fastify.register(mongoDbConnector, {
    forceClose: true,

    url: process.env.MONGO_URL,
  });
});
