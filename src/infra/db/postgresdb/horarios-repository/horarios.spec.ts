import { describe, test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { HorariosPostgresRepository } from "./horarios";
import { PrismaClient } from "@prisma/client";
import { AddHorariosModel } from "../../../../domain/usecases/add-horarios";

describe("Horarios Postgres Repository", () => {
  let prisma: PrismaClient;
  let sut: HorariosPostgresRepository;

  beforeAll(() => {
    prisma = new PrismaClient();
    sut = new HorariosPostgresRepository();
  });

  afterEach(async () => {
    await prisma.dia.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Deve retornar uma semana de trabalho em caso de sucesso", async () => {
    const HorariosData: AddHorariosModel = {
      entradaManha: "any_entradaManha",
      saidaManha: "any_saidaManha",
      entradaTarde: "any_entradaTarde",
      saidaTarde: "any_saidaTarde",
      dif_min: "any_difmin",
      tipoUm: "any_tipoUm",
      tipoDois: "any_tipoDois",
    };
    const insertdHorarios = await sut.add(HorariosData);

    expect(insertdHorarios).toBeTruthy();
    expect(insertdHorarios.entradaManha).toBe(HorariosData.entradaManha);
    expect(insertdHorarios.saidaManha).toBe(HorariosData.saidaManha);
    expect(insertdHorarios.entradaTarde).toBe(HorariosData.entradaTarde);
    expect(insertdHorarios.saidaTarde).toBe(HorariosData.saidaTarde);
    expect(insertdHorarios.dif_min).toBe(HorariosData.dif_min);
    expect(insertdHorarios.tipoUm).toBe(HorariosData.tipoUm);
    expect(insertdHorarios.tipoDois).toBe(HorariosData.tipoDois);
  });
});
