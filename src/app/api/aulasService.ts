import type { Aula } from '../data/aula';
import { paraISO, somarDias } from '../data/datas';
import { QTD_DIAS } from '../data/ensalamento';
import { MODELO_SEMANAL } from '../mocks/aulasMock';

/**
 * >>> PONTO DE INTEGRAÇÃO COM A API <<<
 *
 * Hoje: gera aulas a partir de `MODELO_SEMANAL` (as mesmas em toda semana).
 *
 * Quando tiver backend, troque o corpo desta função mantendo a assinatura:
 *
 *   const resp = await fetch(
 *     `${API_URL}/aulas?inicio=${paraISO(inicioSemana)}&fim=${paraISO(somarDias(inicioSemana, QTD_DIAS - 1))}`,
 *     { headers: { Authorization: `Bearer ${token}` } },
 *   );
 *   if (!resp.ok) throw new Error('Falha ao carregar as aulas');
 *   const dados = await resp.json();
 *   // Converta o formato da API para `Aula[]` aqui (renomeie campos, formate horários etc.)
 *   return dados.map((item): Aula => ({ id: String(item.id), ... }));
 *
 * Erros lançados aqui são capturados pela tela, que mostra a mensagem
 * com o botão "Tentar de novo".
 */
export async function buscarAulasDaSemana(inicioSemana: Date): Promise<Aula[]> {
  // Simula a latência de rede para você testar o estado de carregamento.
  await new Promise((resolve) => setTimeout(resolve, 350));

  const aulas: Aula[] = [];
  for (let i = 0; i < QTD_DIAS; i++) {
    const data = paraISO(somarDias(inicioSemana, i));
    (MODELO_SEMANAL[i] ?? []).forEach((modelo, idx) => {
      aulas.push({ ...modelo, id: `${data}-${idx}`, data });
    });
  }
  return aulas;
}
