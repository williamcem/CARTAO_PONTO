import { AddDifMinRepository } from "./add-dif-min-repository";
import { AddDifMinModel, AddDifMin } from "../../../domain/usecases/add-dif-min";
import { DifMinModel } from "../../../presentation/controllers/dif-min/dif-min-protocols";

export class DbAddDifMin implements AddDifMin {
  private readonly addDifMiRepository: AddDifMinRepository;

  constructor(addDifMiRepository: AddDifMinRepository) {
    this.addDifMiRepository = addDifMiRepository;
  }
  atualizarDiaParaFalta(difData: DifMinModel): Promise<AddDifMinModel> {
    throw new Error("Method not implemented.");
  }
}
