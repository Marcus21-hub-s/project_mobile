import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Aula } from '../data/entities/aula';
import { formatarHora, paraISO } from '../data/formatacao';
import { supabase } from '../src/app/supabase';

/** Chave do cache: uma por professor e por mês (ex.: "aulas:5:2026-11"). */
const chaveCache = (idProfessor: number, mes: string) => `aulas:${idProfessor}:${mes}`;

/** Converte uma linha do Supabase para Aula. Serve para dados novos e para os do cache. */
const mapearAula = (item: any): Aula => ({
  id: String(item.id),
  disciplina: item.disciplina.nome,
  turma: item.turmas,
  sala: item.salas,
  horaInicio: formatarHora(item.horaInicio),
  horaFim: formatarHora(item.horaFim),
  data: item.data,
  cor: "#9b1616ff",
});

/** "2026-11" -> { inicio: "2026-11-01", fim: "2026-11-30" } */
const intervaloDoMes = (mes: string) => {
  const [ano, numeroDoMes] = mes.split("-").map(Number);
  // dia 0 do mês seguinte = último dia deste mês
  return { inicio: `${mes}-01`, fim: paraISO(new Date(ano, numeroDoMes, 0)) };
};

/**
 * >>> PONTO DE INTEGRAÇÃO COM A API <<<
 *
 * Busca no Supabase TODAS as aulas do professor no mês e guarda no cache (AsyncStorage).
 * Sempre vai ao banco: use ao abrir a ProfessorHome e no puxar para atualizar.
 * Se a busca falhar (ex.: sem internet), devolve as últimas aulas guardadas e chama
 * `onOffline` para a tela poder avisar. Sem internet e sem cache, lança o erro.
 *
 * @param mes "AAAA-MM" (ex.: "2026-11")
 */
export async function buscarAulasDoMes(
  idProfessor: number | undefined,
  mes: string,
  onOffline?: () => void,
): Promise<Aula[]> {
  if (idProfessor === undefined) throw new Error("Professor não identificado");

  try {
    const { inicio, fim } = intervaloDoMes(mes);

    const { data, error } = await supabase
      .from("aulas")
      .select("*, turmas(*), disciplina(*), salas(*)")
      .gte("data", inicio)
      .lte("data", fim)
      .eq("professor_id", idProfessor);

    if (error) throw error;

    // Guarda as linhas cruas; a conversão para Aula acontece sempre na leitura
    await AsyncStorage.setItem(chaveCache(idProfessor, mes), JSON.stringify(data));
    return data.map(mapearAula);
  } catch (e) {
    console.log("Erro buscando aulas, tentando o cache:", e);

    const guardado = await AsyncStorage.getItem(chaveCache(idProfessor, mes));
    if (guardado) {
      onOffline?.();
      return JSON.parse(guardado).map(mapearAula);
    }
    throw e; // sem internet e sem cache: a tela mostra o erro
  }
}

/**
 * Lê as aulas do mês priorizando o cache: só vai ao banco se o mês ainda não estiver guardado.
 * Use nas telas que não precisam de dados fresquinhos (ex.: ProfessorRequests), para não
 * repetir a requisição que a ProfessorHome já fez.
 */
export async function lerAulasDoMes(idProfessor: number | undefined, mes: string): Promise<Aula[]> {
  if (idProfessor === undefined) throw new Error("Professor não identificado");

  const guardado = await AsyncStorage.getItem(chaveCache(idProfessor, mes));
  if (guardado) return JSON.parse(guardado).map(mapearAula);

  return buscarAulasDoMes(idProfessor, mes);
}