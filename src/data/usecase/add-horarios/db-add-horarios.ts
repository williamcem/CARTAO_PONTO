import { AddHorarios, AddHorariosModel } from "../../../domain/usecases/add-horarios";
import { HorariosModel } from "../../../domain/models/horarios";
import { AddHorariosRepository } from "./add-horarios-repository";
import { HorarioData } from "../../../presentation/controllers/horarios/horarios"; // Certifique-se de importar HorarioData

export class DbAddHorarios implements AddHorarios {
  private readonly addHorariosRepository: AddHorariosRepository;

  constructor(addHorariosRepository: AddHorariosRepository) {
    this.addHorariosRepository = addHorariosRepository;
  }

  async add(horariosData: AddHorariosModel): Promise<HorariosModel> {
    const horarios = await this.addHorariosRepository.add(horariosData);
    return horarios;
  }

  async getLastHorario(): Promise<HorarioData | null> {
    const lastHorario = await this.addHorariosRepository.getLastHorario();
    return lastHorario;
  }
}
