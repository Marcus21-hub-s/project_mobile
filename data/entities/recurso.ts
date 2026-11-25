
export type StatusRecurso = "DISPONIVEL" | "INDISPONIVEL" | "MANUTENÇÃO";

export type Recurso = {
    id: number;
    nome: string;
    status: StatusRecurso;
}