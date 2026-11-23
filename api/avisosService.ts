import type { Aviso } from "../data/entities/aviso";
import { AVISOS_MOCK } from "../mocks/avisosMock";

/**
 * >>> PONTO DE INTEGRAÇÃO COM O BANCO <<<
 *
 * Hoje: devolve os avisos de `AVISOS_MOCK` (ainda não existe tabela de avisos).
 *
 * Quando a tabela existir, troque o corpo desta função mantendo a assinatura,
 * no mesmo estilo do aulasService (os nomes de tabela e colunas abaixo são só um exemplo):
 *
 *   const { data, error } = await supabase
 *     .from("avisos")
 *     .select("*, aulas(*, disciplina(*), turmas(*))")
 *     .eq("professor_id", idProfessor)
 *     .order("criado_em", { ascending: false });
 *
 *   if (error) {
 *     console.log("Erro buscando avisos:", error);
 *     throw new Error("Falha ao buscar os avisos");
 *   }
 *
 *   return data.map((item): Aviso => ({ id: item.id, ... })); // converta para `Aviso` aqui
 *
 * Erros lançados aqui são capturados pela tela, que mostra a mensagem
 * com o botão "Tentar de novo".
 */
export async function buscarAvisos(idProfessor: number | undefined): Promise<Aviso[]> {
    void idProfessor; // será usado na consulta real (apenas os avisos deste professor)

    // Simula a latência de rede para você testar o estado de carregamento.
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Devolve cópias para a tela poder alterar o estado sem mexer no mock original.
    return AVISOS_MOCK.map((aviso) => ({ ...aviso }));
}

/**
 * Avisa o banco que o professor leu um aviso.
 * Hoje não faz nada; quando a tabela existir, atualize a coluna correspondente
 * (ex.: `supabase.from("avisos").update({ lido: true }).eq("id", id)`).
 */
export async function marcarAvisoComoLido(id: number): Promise<void> {
    void id;
}
