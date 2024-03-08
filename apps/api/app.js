"use strict";

import * as path from "path";
import AutoLoad from "@fastify/autoload";
import { fileURLToPath } from "url";
import Fastify from "fastify";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function build(opts = {}) {
  const fastify = Fastify(opts);

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: opts,
    forceESM: true,
  });

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: opts,
    forceESM: true,
  });

  return fastify;
}
