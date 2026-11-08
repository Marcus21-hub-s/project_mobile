import { DIAS_COMPLETO, MESES_ABREV } from './ensalamento';
import { Aula, ProximaAula } from './entities/aula';


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

export const formatarHora = (hora:string): string =>{
  return hora.substring(0, 5);
}





/**
 * Resultado da busca pela aula mais próxima, já com os textos prontos para o card do topo.
 * - emAndamento: true quando a aula está acontecendo agora
 * - rotulo: "Agora" ou "Próxima aula"
 * - detalhe: linha de baixo do card (ex.: "Até 11:40 · faltam 1h16")
 */

/** Monta um Date local a partir de "YYYY-MM-DD" e "HH:MM" (aceita também "HH:MM:SS"). */
const montarData = (data: string, hora: string): Date => {
    const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number);
    const [h, m] = hora.split(':').map(Number);
    return new Date(ano, mes - 1, dia, h, m);
};

/** 76 -> "1h16"; 120 -> "2h"; 35 -> "35min". */
export const formatarDuracao = (minutos: number): string => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${String(m).padStart(2, '0')}`;
};

/**
 * Procura, entre as aulas carregadas, a que está acontecendo agora; se não houver,
 * a próxima a começar. Devolve null quando não resta nenhuma aula.
 */
export function encontrarProximaAula(aulas: Aula[], agora: Date): ProximaAula | null {
    let proxima: { aula: Aula; inicio: Date } | null = null;

    for (const aula of aulas) {
        const inicio = montarData(aula.data, aula.horaInicio);
        const fim = montarData(aula.data, aula.horaFim);

        // Aula em andamento tem prioridade sobre qualquer outra
        if (agora >= inicio && agora < fim) {
            const minutos = Math.ceil((fim.getTime() - agora.getTime()) / 60000);
            return {
                aula,
                emAndamento: true,
                rotulo: 'Agora',
                detalhe: `Até ${aula.horaFim} · faltam ${formatarDuracao(minutos)}`,
            };
        }

        // Guarda a aula futura que começa primeiro
        if (inicio > agora && (!proxima || inicio < proxima.inicio)) {
            proxima = { aula, inicio };
        }
    }

    if (!proxima) return null;

    const { aula, inicio } = proxima;
    const minutos = Math.ceil((inicio.getTime() - agora.getTime()) / 60000);
    const diaDaAula = aula.data.slice(0, 10);

    let detalhe: string;
    if (diaDaAula === paraISO(agora)) {
        detalhe = `Começa às ${aula.horaInicio} · em ${formatarDuracao(minutos)}`;
    } else if (diaDaAula === paraISO(somarDias(agora, 1))) {
        detalhe = `Amanhã às ${aula.horaInicio}`;
    } else {
        detalhe = `${DIAS_COMPLETO[inicio.getDay()]} às ${aula.horaInicio}`;
    }

    return { aula, emAndamento: false, rotulo: 'Próxima aula', detalhe };
}

/** "26 a 31 out" (mesmo mês) ou "28 out a 2 nov" (meses diferentes). */
export const formatarIntervaloCurto = (inicio: Date, fim: Date): string => {
    if (inicio.getMonth() === fim.getMonth()) {
        return `${inicio.getDate()} a ${fim.getDate()} ${MESES_ABREV[fim.getMonth()]}`;
    }
    return `${inicio.getDate()} ${MESES_ABREV[inicio.getMonth()]} a ${fim.getDate()} ${MESES_ABREV[fim.getMonth()]}`;
};

