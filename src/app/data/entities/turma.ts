import { Curso } from "./curso";

export type Turma = {
    id: number;
    nome: string;
    qtd_alunos: number;
    curso: Curso;
}