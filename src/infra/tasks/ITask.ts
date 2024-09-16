import { HttpRequest } from "../../presentation/protocols";

export type addTaskInput = { interval: string; task: (httRequest?: HttpRequest) => Promise<any>; name: string; path?: string };

export interface ITask {
  add(input: addTaskInput): Promise<void>;
}

