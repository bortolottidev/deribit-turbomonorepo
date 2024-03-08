"use strict";
import build from "./app.js";

const server = build({
  logger: {
    level: "info",
    transport: {
      target: "pino-pretty",
    },
  },
});

server.listen({ port: process.env.PORT || 3000 }, (err, _address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
