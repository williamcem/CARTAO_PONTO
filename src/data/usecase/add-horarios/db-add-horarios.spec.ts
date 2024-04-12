import { describe, expect, test, vi } from "vitest";
import { HorariosModel, AddHorarios, AddHorariosModel } from "../../../presentation/controllers/horarios/horarios-protocols";
import { DbAddHorarios } from "./db-add-horarios";
import { AddHorariosRepository } from "./add-horarios-repository";
import { randomUUID } from "crypto";

const makeAddHorariosRepository = (): AddHorariosRepository => {
  class AddHorariosRepositoryStub implements AddHorariosRepository {
    async add(horariosData: AddHorariosModel): Promise<HorariosModel> {
      const fakeHorarios = {
        id: "valid_id",
        data: "valid_data",
        entradaManha: "valid_entradaManha",
        saidaManha: "valid_saidaTarde",
        entradaTarde: "valid_entradaTarde",
        saidaTarde: "valid_saidaTarde",
        saldoAnt: 300,
        dif_min: 1,
        tipoUm: "valid_tipoUm",
        tipoDois: "valid_tipoDois",
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
      id: "valid_id",
      data: "valid_data",
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      saldoAnt: 300,
      dif_min: 1,
      tipoUm: "valid_tipoUm",
      tipoDois: "valid_tipoDois",
    };
    await sut.add(horariosData);

    expect(addSpy).toHaveBeenCalledWith({
      id: "valid_id",
      data: "valid_data",
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      saldoAnt: 300,
      dif_min: 1,
      tipoUm: "valid_tipoUm",
      tipoDois: "valid_tipoDois",
    });
  });

  test("Deve retornar uma semana de trabalho em caso de sucesso", async () => {
    const { sut } = makeSut();
    const hoarariosData = {
      id: "valid_id",
      data: "valid_data",
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      saldoAnt: 300,
      dif_min: 1,
      tipoUm: "valid_tipoUm",
      tipoDois: "valid_tipoDois",
    };

    const horarios = await sut.add(hoarariosData);
    expect(horarios).toEqual({
      id: "valid_id",
      data: "valid_data",
      entradaManha: "valid_entradaManha",
      saidaManha: "valid_saidaTarde",
      entradaTarde: "valid_entradaTarde",
      saidaTarde: "valid_saidaTarde",
      saldoAnt: 300,
      dif_min: 1,
      tipoUm: "valid_tipoUm",
      tipoDois: "valid_tipoDois",
    });
  });
});
