import Request from "supertest";
import app from "../config/app";
import { describe, test } from "vitest";

describe("Content Type Middleware", () => {
  test("Should return default content type as json", async () => {
    app.get("/test_content_type", (req, res) => {
      res.send();
    });
    await Request(app).get("/test_content_type").expect("content-type", /json/);
  });

  test("Should return xml content type when forced", async () => {
    app.get("/test_content_type_xml", (req, res) => {
      res.type("xml");
      res.send();
    });
    await Request(app).get("/test_content_type_xml").expect("content-type", /xml/);
  });
});
