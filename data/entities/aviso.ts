/** Tipo do aviso: define o selo mostrado no card. */
export type TipoAviso = "sala_alterada" | "solicitacao_aprovada" | "solicitacao_recusada";

/**
 * Aviso de troca de sala que afeta o professor (tela "Avisos").
 * Formato provisório: ajuste quando a tabela de avisos estiver pronta.
 * - sala_alterada: a coordenação trocou a sala da aula
 * - solicitacao_aprovada / solicitacao_recusada: resposta a uma troca pedida pelo professor
 */
export type Aviso = {
    id: number;
    tipo: TipoAviso;
    disciplina: string; // ex.: "Cálculo II"
    turma: string; // ex.: "ADS-3A"
    diaSemana: string; // ex.: "Seg" (mesma grafia de DIAS_ABREV)
    horaInicio: string; // "HH:MM"
    salaOrigem: string; // sala que a aula tinha antes
    salaDestino: string; // sala para onde a aula foi
    motivo: string; // ex.: "Projetor com defeito"
    origem?: string; // quem fez a alteração, ex.: "Coordenação" (opcional)
    criadoEm: string; // data/hora ISO 8601 de quando o aviso foi gerado
    lido: boolean; // false = mostra o ponto de "não lido"
};

/** Avisos com até esse número de dias ficam em "Novos"; os mais antigos vão para "Anteriores". */
export const DIAS_PARA_SER_NOVO = 7;

/** Quantos avisos ainda não foram lidos (contador da aba "Novos"). */
export const contarNaoLidos = (avisos: Aviso[]): number =>
    avisos.filter((aviso) => !aviso.lido).length;
