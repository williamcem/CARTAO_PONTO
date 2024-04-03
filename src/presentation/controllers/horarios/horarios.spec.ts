import { expect, describe, test, vi } from "vitest";
import { MissingParamError, ServerError } from "../../errors";
import { AddHorarios, AddHorariosModel, HorariosModel } from "./horarios-protocols";
import { HorariosController } from "./horarios";

interface SutTypes {
  sut: HorariosController;
  addHorariosStub: AddHorarios;
}

const makeAddHorarios = (): AddHorarios => {
  class addHorariosStub implements AddHorarios {
    async add(horario: AddHorariosModel): Promise<HorariosModel> {
      const fakeHorario = {
        entradaManha: "valid_entradaManha",
        saidaManha: "valid_saidaManha",
        entradaTarde: "valid_entradaTarde",
        saidaTarde: "valid_saidaTarde",
        dif_min: "valid_dif_min",
        tipoUm: "valid_tipoUm",
        tipoDois: "valid_tipoDois",
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
        tipoUm: "any_tipoUm",
        tipoDois: "any_tipoDois",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
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
        tipoUm: "any_tipoUm",
        tipoDois: "any_tipoDois",
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
        tipoUm: "any_tipoUm",
        tipoDois: "any_tipoDois",
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
        tipoUm: "any_tipoUm",
        tipoDois: "any_tipoDois",
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
        tipoUm: "any_tipoUm",
        tipoDois: "any_tipoDois",
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
        dif_min: "any_dif_min",
        tipoDois: "any_tipoDois",
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
        dif_min: "any_dif_min",
        tipoUm: "any_tipoUm",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError("tipoDois"));
  });

  test("Deve chamar AddHorarios com os valores corretos", async () => {
    const { sut, addHorariosStub } = makeSut();
    const addSpy = vi.spyOn(addHorariosStub, "add");
    const httpResquest = {
      body: {
        entradaManha: "any_entradaManha",
        saidaManha: "any_saidaManha",
        entradaTarde: "any_entradaTarde",
        saidaTarde: "any_saidaTarde",
        dif_min: "any_dif_min",
        tipoUm: "any_tipoUm",
        tipoDois: "any_tipoDois",
      },
    };
    await sut.handle(httpResquest);
    expect(addSpy).toHaveBeenCalledWith({
      entradaManha: "any_entradaManha",
      saidaManha: "any_saidaManha",
      entradaTarde: "any_entradaTarde",
      saidaTarde: "any_saidaTarde",
      dif_min: "any_dif_min",
      tipoUm: "any_tipoUm",
      tipoDois: "any_tipoDois",
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
        tipoUm: "any_tipoUm",
        tipoDois: "any_tipoDois",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  test("Deve retornar 200 se dados validos forem fornecidos", async () => {
    const { sut } = makeSut();
    const httpResquest = {
      body: {
        entradaManha: "valid_entradaManha",
        saidaManha: "valid_saidaManha",
        entradaTarde: "valid_entradaTarde",
        saidaTarde: "valid_saidaTarde",
        dif_min: "valid_dif_min",
        tipoUm: "valid_tipoUm",
        tipoDois: "valid_tipoDois",
      },
    };
    const httpResponse = await sut.handle(httpResquest);
    expect(httpResponse.statusCode).toBe(200);

    expect(httpResponse.body).toEqual({
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaManha",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      dif_min: "valid_dif_min",
      tipoUm: "valid_tipoUm",
      tipoDois: "valid_tipoDois",
    });
  });
});

function reject(resolve: (value: HorariosModel | PromiseLike<HorariosModel>) => void, reject: (reason?: any) => void): void {
  throw new Error("Function not implemented.");
}
