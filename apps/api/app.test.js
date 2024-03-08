"use strict";
import { describe, it } from "node:test";
import build from "./app.js";
import assert from "node:assert";
import { isArray } from "node:util";

describe("app", () => {
  it("should run /health", async (t) => {
    const app = build();
    t.after(() => app.close());

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    assert.equal(response.statusCode, 200);
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
    );
    assert.deepEqual(response.json(), { health: "OK" });
  });

  it("should return /future collection", async (t) => {
    const app = build();
    t.after(() => app.close());

    const response = await app.inject({
      method: "GET",
      url: "/future",
    });

    assert.equal(response.statusCode, 200);
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
    );
    assert.equal(isArray(response.json()), true);
  });

  it("should return /position collection", async (t) => {
    const app = build();
    t.after(() => app.close());

    const response = await app.inject({
      method: "GET",
      url: "/position",
    });

    assert.equal(response.statusCode, 200);
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
    );
    assert.equal(isArray(response.json()), true);
  });

  it("should return persisted accounts when /account is called", async (t) => {
    const app = build();
    t.after(() => app.close());
    await app.ready();
    const collection = app.mongo.client.db("deribit").collection("account");
    await collection.insertMany([
      { insertedAt: 10, username: "123" },
      { insertedAt: 100, username: "123" },
      { _id: 3, insertedAt: 1000, username: "123" },
      { _id: 4, insertedAt: 1000, username: "456" },
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/account",
    });

    assert.equal(response.statusCode, 200);
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
    );
    assert.equal(response.json().length, 4);
  });

  it("should return only current positions when onlyCurrentOpen flag is passed to /position", async (t) => {
    const app = build();
    t.after(() => app.close());
    await app.ready();
    const collection = app.mongo.client.db("deribit").collection("position");
    await collection.insertMany([
      { insertedAt: 10 },
      { insertedAt: 100 },
      { _id: 3, insertedAt: 1000 },
      { _id: 4, insertedAt: 1000 },
    ]);

    const response = await app.inject({
      method: "GET",
      url: "/position",
      query: { onlyCurrentOpen: true },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(
      response.headers["content-type"],
      "application/json; charset=utf-8",
    );
    assert.deepStrictEqual(response.json(), [
      { _id: 3, insertedAt: 1000 },
      { _id: 4, insertedAt: 1000 },
    ]);
  });
});
