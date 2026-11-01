/**
 * Uma aula já "ensalada": disciplina + horário + sala, em uma data específica.
 * Este é o formato que o app espera receber. Quando a API existir, basta
 * converter a resposta dela para este tipo (ver `services/aulasService.ts`).
 *
 * `data` usa o formato ISO local "YYYY-MM-DD" (sem horário) para evitar
 * problemas de fuso ao agrupar as aulas por dia.
 */
export type Aula = {
  id: string;
  disciplina: string;
  professor: string;
  sala: string; // ex.: "204"
  bloco: string; // ex.: "Bloco B"
  horaInicio: string; // "HH:MM"
  horaFim: string; // "HH:MM"
  data: string; // "YYYY-MM-DD"
  cor: string; // cor de destaque da disciplina (faixa lateral do cartão)
};

/**
 * Molde de uma aula que se repete toda semana: é a `Aula` sem `id` e `data`.
 * Só existe por causa dos dados mockados (para gerar aulas em qualquer
 * semana). Pode apagar quando a API estiver pronta.
 */
export type AulaModelo = Omit<Aula, 'id' | 'data'>;

/** Aulas agrupadas por dia: { "2026-11-02": [Aula, Aula], ... }. */
export type AulasPorDia = Record<string, Aula[]>;
