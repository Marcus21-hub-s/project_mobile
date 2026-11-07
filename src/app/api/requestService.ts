import type { Aula } from "../data/entities/aula";
import type { Sala } from "../data/entities/sala";
import { supabase } from "../supabase";

/**
 * >>> CONSULTA PROVISÓRIA NO SUPABASE <<<
 *
 * Devolve as salas que podem receber a aula (todas, menos a atual), já marcando
 * `ocupada` quando outra aula usa a sala em horário que se sobrepõe ao da aula.
 *
 * Suposições a conferir no banco:
 *  - tabela `salas` com as colunas nome, bloco e capacidade (campos do tipo Sala);
 *  - tabela `aulas` com as colunas data, horaInicio e horaFim e a relação `salas`
 *    (a mesma que o aulasService já usa em `salas(*)`).
 *
 * Quando existir a API oficial, troque o corpo mantendo a assinatura.
 * Erros lançados aqui são tratados pela tela.
 */
export async function buscarSalasParaTroca(aula: Aula): Promise<Sala[]> {
    const [salasResp, ocupadasResp] = await Promise.all([
        // Todas as salas cadastradas
        supabase.from("salas").select("*"),

        // Aulas do mesmo dia cujo horário se sobrepõe ao da aula (início < fim da outra e fim > início da outra)
        supabase
            .from("aulas")
            .select("salas(id)")
            .eq("data", aula.data)
            .lt("horaInicio", aula.horaFim)
            .gt("horaFim", aula.horaInicio),
    ]);

    if (salasResp.error || ocupadasResp.error) {
        console.log("Erro buscando salas:", salasResp.error ?? ocupadasResp.error);
        throw new Error("Falha ao buscar as salas");
    }

    // ids das salas que já têm aula nesse horário
    // ids das salas que já têm aula nesse horário
    const idsOcupados = new Set<number>();
    for (const item of ocupadasResp.data as any[]) {
        const id = item.salas?.id;
        if (typeof id === "number") idsOcupados.add(id); // ignora aulas sem sala (null/undefined)
    }
    return salasResp.data
        .filter((s: any) => s.id !== aula.sala.id) // não oferece a própria sala da aula
        .map((s: any): Sala => ({
            id: s.id,
            nome: s.nome,
            bloco: s.bloco,
            capacidade: s.capacidade,
            ocupada: idsOcupados.has(s.id),
        }));
}