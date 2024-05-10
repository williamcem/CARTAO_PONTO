import { HorariosMemoryModel, AddHorariosMemoryModel } from "../../../presentation/controllers/horarios-memory/horarios-memory-protocols";

export interface AddHorariosMemoryRepository {
  adicionarHorarioMemoria(horariosData: AddHorariosMemoryModel): Promise<HorariosMemoryModel>;
}
