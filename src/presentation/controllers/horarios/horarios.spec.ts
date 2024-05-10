import { expect, describe, test, vi } from "vitest";
import { MissingParamError, ServerError } from "../../errors";
import { AddHorarios, AddHorariosModel, HorariosModel } from "./horarios-protocols";
import { HorariosController } from "./horarios";
import { randomUUID } from "crypto";
import { HorariosPostgresRepository } from "@infra/db/postgresdb/horarios-repository/horarios";

interface SutTypes {
  sut: HorariosController;
  addHorariosStub: AddHorarios;
}

const makeAddHorarios = (): AddHorarios => {
  class addHorariosStub implements AddHorarios {
    async add(horario: AddHorariosModel): Promise<HorariosModel> {
      const id = randomUUID();
      const fakeHorario = {
        id,
        data: "05/04/2024",
        entradaManha: "valid_entradaManha",
        saidaManha: "valid_saidaManha",
        entradaTarde: "valid_entradaTarde",
        saidaTarde: "valid_saidaTarde",
        saldoAtual: 300,
        dif_min: 1,
      };
      return new Promise((resolve) => resolve(fakeHorario));
    }
  }
  return new addHorariosStub();
};

const makeSut = (): SutTypes => {
  const addHorariosStub = makeAddHorarios();
  const sut = new HorariosController(addHorariosStub);
  return {
    sut,
    addHorariosStub,
  };
};

describe("Horarios Controller", () => {
  test("Deve retornar 400 se nenhum horario de entrada manhã for fornecido", async () => {
    const { sut } = makeSut();
    const httpResquest = {
      body: {
        saidaManha: "any_saidaManha",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
        dif_min: "any_dif_min",
      },
    };
    const addHorariosStub = makeAddHorarios();
    const horariosController = new HorariosController(addHorariosStub);

    const httpResponse = await horariosController.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("entradaManha"));
  });

  test("Deve retornar 400 se nenhum horario de saida manhã for fornecido", async () => {
    const { sut } = makeSut();
    const httpResquest = {
      body: {
        entradaManha: "any_entradaManha",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
        dif_min: "any_dif_min",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("saidaManha"));
  });

  test("Deve retornar 400 se nenhum horario de entrada tarde for fornecido", async () => {
    const { sut } = makeSut();
    const httpResquest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaManha",
        saidaTarde: "any_saidaTarde",
        dif_min: "any_dif_min",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("entradaTarde"));
  });

  test("Deve retornar 400 se nenhum horario de saida tarde for fornecido", async () => {
    const { sut } = makeSut();
    const httpResquest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaManha",
        entradaTarde: "any_entradaTarde",
        dif_min: "any_dif_min",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("saidaTarde"));
  });

  test("Deve retornar 400 se nenhum visto for fornecido", async () => {
    const { sut } = makeSut();
    const httpResquest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaManha",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("difmin"));
  });

  test("Deve retornar 400 se nenhum tipo Um não for fornecido", async () => {
    const { sut } = makeSut();
    const httpResquest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaManha",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tipoUm"));
  });

  test("Deve retornar 400 se nenhum tipo Dois não for fornecido", async () => {
    const { sut } = makeSut();
    const httpResquest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaManha",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tipoDois"));
  });

  test("Deve chamar AddHorarios com os valores corretos", async () => {
    const httpResquest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaManha",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
        dif_min: "any_dif_min",
      },
    };
    const horariosPostgresRepository = new HorariosPostgresRepository();

    const horariosController = new HorariosController(horariosPostgresRepository);

    const result = await horariosController.handle(httpResquest);

    console.log("result.body", result.body);

    expect({
      entradaManha: "any_entradaManha",
      saidaManha: "any_saidaManha",
      entradaTarde: "any_entradaTarde",
      saidaTarde: "any_saidaTarde",
      dif_min: "any_dif_min",
    }).toStrictEqual({
      entradaManha: "any_entradaManha",
      saidaManha: "any_saidaManha",
      entradaTarde: "any_entradaTarde",
      saidaTarde: "any_saidaTarde",
      dif_min: "any_dif_min",
    });
  });

  test("Deve retornar 500 se AddHorarios voltar uma excessão ", async () => {
    const { sut, addHorariosStub } = makeSut();
    vi.spyOn(addHorariosStub, "add").mockImplementationOnce(async () => {
      return new Promise((resolve, reject) => reject(new Error()));
    });
    const httpResquest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaManha",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
        dif_min: "any_dif_min",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Deve retornar 200 se dados validos forem fornecidos", async () => {
    const httpResquest = {
      body: {
        entradaManha: "valid_entradaManha",
        saidaManha: "valid_saidaManha",
        entradaTarde: "valid_entradaTarde",
        saidaTarde: "valid_saidaTarde",
      },
    };

    const horariosPostgresRepository = new HorariosPostgresRepository();
    const horariosController = new HorariosController(horariosPostgresRepository);
    const httpResponse = await horariosController.handle(httpResquest);

    expect(httpResponse.statusCode).toBe(200);

    expect({
      entradaManha: httpResponse.body.entradaManha,
      saidaManha: httpResponse.body.saidaManha,
      entradaTarde: httpResponse.body.entradaTarde,
      saidaTarde: httpResponse.body.saidaTarde,
      dif_min: httpResponse.body.dif_min,
    }).toEqual({
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaManha",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",

      dif_min: "valid_dif_min",
    });
  });
});

function reject(resolve: (value: HorariosModel | PromiseLike<HorariosModel>) => void, reject: (reason?: any) => void): void {
  throw new Error("Function not implemented.");
}
