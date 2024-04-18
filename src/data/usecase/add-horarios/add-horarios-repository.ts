import { HorariosModel, AddHorariosModel } from "../../../presentation/controllers/horarios/horarios-protocols";

export interface AddHorariosRepository {
  getLastHorario: any;
  add(horariosData: AddHorariosModel): Promise<HorariosModel>;
}
