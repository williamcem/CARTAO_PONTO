import { AddMemoryHorarios, AddHorariosMemoryModel } from "../../../domain/usecases/add-horarios-memory";
import { HorariosMemoryModel } from "../../../domain/models/horariosMemory";
import { AddHorariosMemoryRepository } from "./add-horarios-memory-repository";

export class DbAddHorariosMemory implements AddMemoryHorarios {
  private readonly addHorariosMemoryRepository: AddHorariosMemoryRepository;

  constructor(addHorariosMemoryRepository: AddHorariosMemoryRepository) {
    this.addHorariosMemoryRepository = addHorariosMemoryRepository;
  }

  async adicionarHorarioMemoria(memoryData: AddHorariosMemoryModel): Promise<HorariosMemoryModel> {
    const memory = await this.addHorariosMemoryRepository.adicionarHorarioMemoria(memoryData);
    return memory;
  }
}
