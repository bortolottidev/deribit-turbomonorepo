const mongoCollectionApi = async (fastify, opts) => {
  const getPositionsOptions = {
    schema: {
      querystring: {
        type: "object",
        properties: {
          onlyCurrentOpen: { type: "boolean" },
        },
      },
    },
  };
  fastify.get("/position", getPositionsOptions, async function (req, reply) {
    const { onlyCurrentOpen } = req.query;
    const positionCollection = this.mongo.client
      .db("deribit")
      .collection("position");

    if (onlyCurrentOpen) {
      const aggregators = [
        {
          $bucketAuto: {
            groupBy: "$insertedAt",
            buckets: 1,
            output: {
              lastPositionsReceivedAt: {
                $max: "$insertedAt",
              },
            },
          },
        },
      ];
      const [{ lastPositionsReceivedAt }] = await positionCollection
        .aggregate(aggregators)
        .toArray();

      return positionCollection
        .find({ insertedAt: lastPositionsReceivedAt })
        .toArray();
    }

    try {
      return positionCollection.find({}).toArray();
    } catch (err) {
      return err;
    }
  });

  // map all entities and expose it
  for (const entity of ["account", "future", "account-summary", "trade"]) {
    fastify.get("/" + entity, async function (req, reply) {
      const collection = this.mongo.client.db("deribit").collection(entity);

      try {
        return collection.find({}).toArray();
      } catch (err) {
        return err;
      }
    });
  }
};

export default mongoCollectionApi;
