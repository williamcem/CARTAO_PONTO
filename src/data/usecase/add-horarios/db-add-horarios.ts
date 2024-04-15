import { AddHorarios, AddHorariosModel } from "../../../domain/usecases/add-horarios";
import { HorariosModel } from "../../../domain/models/horarios";
import { AddHorariosRepository } from "./add-horarios-repository";

export class DbAddHorarios implements AddHorarios {
  private readonly addHorariosRepository: AddHorariosRepository;

  constructor(addHorariosRepository: AddHorariosRepository) {
    this.addHorariosRepository = addHorariosRepository;
  }

  async add(horariosData: AddHorariosModel): Promise<HorariosModel> {
    const horarios = await this.addHorariosRepository.add(Object.assign({}, horariosData));
    return horarios;
  }
}
