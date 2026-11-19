import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Aula } from '../data/entities/aula';
import { formatarHora, paraISO } from '../data/formatacao';
import { supabase } from '../src/app/supabase';

/**
 * >>> PONTO DE INTEGRAÇÃO COM A API <<<
 *



/** Converte uma linha do Supabase para Aula. Serve para dados novos e para os do cache. */
const cacheKey = (idProfessor: number | undefined) => `aulas:${idProfessor ?? "sem-professor"}`;
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

/**
 * Busca as aulas no Supabase e guarda o resultado no cache (AsyncStorage).
 * Se a busca falhar (ex.: sem internet), devolve as últimas aulas guardadas e chama
 * `onOffline` para a tela poder avisar. Sem internet e sem cache, lança o erro.
 */
export async function buscarAulasDaSemana(
  inicioSemana: Date,
  idProfessor: number | undefined,
  onOffline?: () => void,
): Promise<Aula[]> {
  try {
    const { data, error } = await supabase
      .from("aulas")
      .select("*, turmas(*), disciplina(*), salas(*)")
      .gte("data", paraISO(inicioSemana))
      .eq("professor_id", idProfessor);

    if (error) throw error;

    // Guarda as linhas cruas; a conversão para Aula acontece sempre na leitura
    await AsyncStorage.setItem(cacheKey(idProfessor), JSON.stringify(data));
    return data.map(mapearAula);
  } catch (e) {
    console.log("Erro buscando aulas, tentando o cache:", e);

    const guardado = await AsyncStorage.getItem(cacheKey(idProfessor));
    if (guardado) {
      onOffline?.();
      return JSON.parse(guardado).map(mapearAula);
    }
    throw e; // sem internet e sem cache: a tela mostra o erro
  }
}