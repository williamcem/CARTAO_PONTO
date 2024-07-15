import { describe, test, expect, vi } from "vitest";
import { Controller, HttpRequest, HttpResponse } from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";

interface SutTypes {
  sut: LogControllerDecorator;
  controllerStub: Controller;
}

const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
      const httpResponse: HttpResponse = {
        statusCode: 200,
        body: {
          name: "Alex",
        },
      };
      return new Promise((resolve) => resolve(httpResponse));
    }
  }
  return new ControllerStub();
};

const makeSut = (): SutTypes => {
  const controllerStub = makeController();
  const sut = new LogControllerDecorator(controllerStub);
  return {
    sut,
    controllerStub,
  };
};

describe("LogController Decorator", () => {
  test("Deve chamar o identificador do controlador", async () => {
    const { sut, controllerStub } = makeSut();
    const handleSpy = vi.spyOn(controllerStub, "handle");
    const httpRequest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaTarde",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
        dif_min: "any_difmin",
        tipoUm: "any_tipoUm",
        tipoDois: "any_tipoDois",
      },
    };
    await sut.handle(httpRequest);

    expect(handleSpy).toHaveBeenCalledWith(httpRequest);
  });

  test("Deve retornar o mesmo resultado do controlador", async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaTarde",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
        dif_min: "any_difmin",
        tipoUm: "any_tipoUm",
        tipoDois: "any_tipoDois",
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse).toEqual({
      statusCode: 200,
      body: {
        name: "Alex",
      },
    });
  });
});
