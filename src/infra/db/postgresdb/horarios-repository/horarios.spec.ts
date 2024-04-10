import { describe, test, expect, beforeAll, afterAll, afterEach } from "vitest";
import { HorariosPostgresRepository } from "./horarios";
import { PrismaClient } from "@prisma/client";
import { AddHorariosModel } from "../../../../domain/usecases/add-horarios";
import { randomUUID } from "crypto";

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
      id: randomUUID(),
      data: "05/04/2024",
      entradaManha: "07:12",
      saidaManha: "09:00",
      entradaTarde: "10:00",
      saidaTarde: "11:00",
      entradaExtra: "12:00",
      saidaExtra: "17:00",
      saldoAnt: 300,
      dif_min: 1,
    };
    const insertdHorarios = await sut.add(HorariosData);

    expect(insertdHorarios).toBeTruthy();
    expect(insertdHorarios.id).toBe(HorariosData.id);
    expect(insertdHorarios.entradaManha).toBe(HorariosData.entradaManha);
    expect(insertdHorarios.saidaManha).toBe(HorariosData.saidaManha);
    expect(insertdHorarios.entradaTarde).toBe(HorariosData.entradaTarde);
    expect(insertdHorarios.saidaTarde).toBe(HorariosData.saidaTarde);
    expect(insertdHorarios.entradaExtra).toBe(HorariosData.entradaExtra);
    expect(insertdHorarios.saidaExtra).toBe(HorariosData.saidaExtra);
    expect(insertdHorarios.saldoAnt).toBe(HorariosData.saldoAnt);
    expect(insertdHorarios.dif_min).toBe(HorariosData.dif_min);
  });
});
