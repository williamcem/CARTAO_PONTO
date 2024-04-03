import { describe, expect, test, vi } from "vitest";
import { HorariosModel, AddHorarios, AddHorariosModel } from "../../../presentation/controllers/horarios/horarios-protocols";
import { DbAddHorarios } from "./db-add-horarios";
import { AddHorariosRepository } from "../protocols/add-horarios-repository";

const makeAddHorariosRepository = (): AddHorariosRepository => {
  class AddHorariosRepositoryStub implements AddHorariosRepository {
    async add(horariosData: AddHorariosModel): Promise<HorariosModel> {
      const fakeHorarios = {
        entradaManha: "valid_entradaManha",
        saidaManha: "valid_saidaTarde",
        entradaTarde: "valid_entradaTarde",
        saidaTarde: "valid_saidaTarde",
        dif_min: "valid_difmin",
        tipoUm: "valid_tipoUm",
        tipoDois: "tipoDois",
      };
      return new Promise((resolve) => resolve(fakeHorarios));
    }
  }

  return new AddHorariosRepositoryStub();
};

interface SutTypes {
  sut: DbAddHorarios;
  addHorariosRepositoryStub: AddHorariosRepository;
}

const makeSut = (): SutTypes => {
  const addHorariosRepositoryStub = makeAddHorariosRepository();
  const sut = new DbAddHorarios(addHorariosRepositoryStub);
  return {
    sut,
    addHorariosRepositoryStub,
  };
};

describe("DbaHorarios usecase", () => {
  test("Deve chamar AddHorariosRepository com os valores corretos", async () => {
    const { sut, addHorariosRepositoryStub } = makeSut();
    const addSpy = vi.spyOn(addHorariosRepositoryStub, "add");
    const horariosData = {
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      dif_min: "valid_difmin",
      tipoUm: "valid_tipoUm",
      tipoDois: "tipoDois",
    };
    await sut.add(horariosData);
    expect(addSpy).toHaveBeenCalledWith({
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      dif_min: "valid_difmin",
      tipoUm: "valid_tipoUm",
      tipoDois: "tipoDois",
    });
  });

  test("Deve retornar uma semana de trabalho em caso de sucesso", async () => {
    const { sut } = makeSut();
    const hoarariosData = {
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      dif_min: "valid_difmin",
      tipoUm: "valid_tipoUm",
      tipoDois: "tipoDois",
    };

    const horarios = await sut.add(hoarariosData);
    expect(horarios).toEqual({
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      dif_min: "valid_difmin",
      tipoUm: "valid_tipoUm",
      tipoDois: "tipoDois",
    });
  });
});
