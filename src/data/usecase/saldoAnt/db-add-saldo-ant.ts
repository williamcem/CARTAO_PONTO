import { AddSaldoAnt, AddSaldoAntModel } from "../../../domain/usecases/add-saldo-ant.ts";
import { AddSaldoAntRepository } from "./add-saldo-ant-repository";

export class DbAddSaldoAnt implements AddSaldoAnt {
  private readonly addSaldoAntRepository: AddSaldoAntRepository;

  constructor(addSaldoAntRepository: AddSaldoAntRepository) {
    this.addSaldoAntRepository = addSaldoAntRepository;
  }

  async addSaldoAnt(saldoAntData: AddSaldoAntModel): Promise<void> {
    await this.addSaldoAntRepository.addSaldoAnt(saldoAntData);
  }
}
