import { Curso } from "./curso";

export type Disciplina = {
    id: number;
    nome: string;
    curso: Curso;
}