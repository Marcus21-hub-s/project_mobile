/** Quantos dias mostrar a partir da segunda (6 = seg a sáb; use 7 para incluir domingo). */
export const QTD_DIAS = 6;

/** A partir dessa largura (tablet / paisagem) os dias viram uma grade em colunas. */
export const LARGURA_TABLET = 768;

// Indexados por `Date.getDay()` (0 = domingo).
export const DIAS_ABREV = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const DIAS_COMPLETO = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

// Indexado por `Date.getMonth()` (0 = janeiro).
export const MESES_ABREV = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
