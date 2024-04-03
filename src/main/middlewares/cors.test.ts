import Request from "supertest";
import app from "../config/app";
import { describe, test } from "vitest";

describe("CORS Middleware", () => {
  test("Should enable CORS", async () => {
    app.get("/test_cors", (req, res) => {
      res.send();
    });
    await Request(app)
      .get("/test_cors")
      .expect("access-control-allow-origin", "*")
      .expect("access-control-allow-methods", "*")
      .expect("access-control-allow-headers", "*");
  });
});
