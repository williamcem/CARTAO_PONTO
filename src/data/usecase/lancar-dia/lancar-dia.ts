type IUpsert = {
  periodoId: number;
  entrada: Date | undefined;
  saida: Date | undefined;
  cartao_dia_id: number;
  statusId: number;
};

export interface LancarDia {
  upsert(input: IUpsert): Promise<boolean>;
}
