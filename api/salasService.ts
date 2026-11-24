import type { Sala } from "../data/entities/sala";
import { supabase } from "../src/app/supabase";

/**
 * Lê a coluna `recursos` da sala (ex.: Projetor, Ar-cond.). Aceita uma lista (text[] / jsonb)
 * ou um texto separado por vírgulas. Se a coluna não existir, devolve lista vazia.
 */
const lerRecursos = (valor: unknown): string[] => {
    if (Array.isArray(valor)) return valor.map((r) => String(r).trim()).filter(Boolean);
    if (typeof valor === "string") return valor.split(",").map((r) => r.trim()).filter(Boolean);
    return [];
};

/*
 *
 * @param data "YYYY-MM-DD"
 * @param hora "HH:MM"
*/
export async function buscarSalasNoHorario(data: string, hora: string): Promise<Sala[]> {
    const [salasResp, ocupadasResp] = await Promise.all([
        // Todas as salas cadastradas
        supabase.from("salas").select("*"),

        // Aulas do dia que estão acontecendo na hora escolhida
        supabase
            .from("aulas")
            .select("salas(id)")
            .eq("data", data)
            .lte("horaInicio", hora)
            .gt("horaFim", hora),
    ]);

    if (salasResp.error || ocupadasResp.error) {
        console.log("Erro buscando salas:", salasResp.error ?? ocupadasResp.error);
        throw new Error("Falha ao buscar as salas");
    }

    // ids das salas que já têm aula nesse horário
    const idsOcupados = new Set<number>();
    for (const item of ocupadasResp.data as any[]) {
        const id = item.salas?.id;
        if (typeof id === "number") idsOcupados.add(id); // ignora aulas sem sala
    }

    return salasResp.data.map((s: any): Sala => ({
        id: s.id,
        nome: s.nome,
        bloco: s.bloco,
        capacidade: s.capacidade,
        ocupada: idsOcupados.has(s.id),
        recursos: lerRecursos(s.recursos),
    }));
}