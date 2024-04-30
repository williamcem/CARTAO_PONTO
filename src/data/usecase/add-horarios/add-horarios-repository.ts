import { HorariosModel, AddHorariosModel } from "../../../presentation/controllers/horarios/horarios-protocols";

export interface AddHorariosRepository {
  add(horariosData: AddHorariosModel): Promise<HorariosModel>;
}
