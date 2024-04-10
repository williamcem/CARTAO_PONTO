import { createApp } from '@vitest/vue';
import request from "supertest"; // supertest é uma biblioteca para fazer requisições HTTP em testes
import app from "./main/config/app";
import { expect, describe, it } from "vitest";

const { mount } = createApp({});

describe("Server", () => {
  it("deve iniciar o servidor corretamente e responder com status 200", async () => {
    const server = await mount(app);

    const response = await request(server).get("/");
    expect(response.status).toBe(200);

    await server.unmount();
  });
});
