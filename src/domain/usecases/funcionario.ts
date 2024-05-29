import { FuncionarioUpsertModel } from "../models/funcionario";

export interface AddFuncionarioUpsertModel {
  filial: string;
  identificacao: string;
  nome: string;
  dataNascimento: Date;
  dataAdmissao: Date;
  dataDemissao?: Date;
  turno: {
    nome: string;
  };
  centroCusto: {
    nome: string;
  };
  funcao: {
    nome: string;
  };
  contato?: {
    numero: string;
  };
  endereco: {
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  email?: {
    nome: string;
  };
  localidade: {
    codigo: string;
    nome: string;
  };
  userName: string;
}

export interface AddFuncionarios {
  upset(funcionarioDdata: AddFuncionarioUpsertModel[]): Promise<FuncionarioUpsertModel>;
}
