import { MESES_ABREV } from '../data/ensalamento';

// Helpers sem biblioteca externa; troque por date-fns/dayjs se preferir.

/** Converte Date -> "YYYY-MM-DD" usando o fuso local (toISOString usaria UTC e erraria o dia). */
export const paraISO = (d: Date): string => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export const somarDias = (d: Date, dias: number): Date => {
  const nova = new Date(d);
  nova.setDate(nova.getDate() + dias);
  return nova;
};

/** Devolve a segunda-feira (00:00) da semana de `d`. */
export const inicioDaSemana = (d: Date): Date => {
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diasDesdeSegunda = (base.getDay() + 6) % 7; // dom=0 -> 6, seg=1 -> 0 ...
  return somarDias(base, -diasDesdeSegunda);
};

/** Ex.: "26 out a 31 out 2026" */
export const formatarIntervalo = (inicio: Date, fim: Date): string => {
  const a = `${inicio.getDate()} ${MESES_ABREV[inicio.getMonth()]}`;
  const b = `${fim.getDate()} ${MESES_ABREV[fim.getMonth()]}`;
  return `${a} a ${b} ${fim.getFullYear()}`;
};
