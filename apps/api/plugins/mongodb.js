import fp from "fastify-plugin";
import mongoDbConnector from "@fastify/mongodb";
export default fp(async (fastify) => {
  fastify.register(mongoDbConnector, {
    forceClose: true,

    url: process.env.MONGO_URL,
  });
});
