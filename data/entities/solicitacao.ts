/** Situação de uma solicitação de troca de sala. */
export type StatusSolicitacao = "pendente" | "aceito" | "cancelada";

/**
 * Solicitação de troca de sala feita pelo professor (aparece em "Minhas solicitações").
 * Formato provisório: ajuste quando a tabela de solicitações estiver pronta.
 * - disciplina: nome da disciplina (ex.: "Física Geral")
 * - detalhe: linha de baixo do card (ex.: "Ter 08:00 · 101 para 208")
 */
export type Solicitacao = {
    id: number;
    disciplina: string;
    detalhe: string;
    status: StatusSolicitacao;
};