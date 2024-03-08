const health = async (fastify, opts) => {
  fastify.get("/health", async function (request, reply) {
    return { health: "OK" };
  });
};

export default health;
