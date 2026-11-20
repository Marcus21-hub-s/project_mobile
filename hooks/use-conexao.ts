/*/
 * Hook que diz se o aparelho está SEM conexão com a internet.
 *
 * Usa a biblioteca @react-native-community/netinfo, que escuta as
 * mudanças de rede do sistema e faz o componente re-renderizar automaticamente quando algo muda.
 *
 * Campos que o NetInfo fornece:
 *   - isConnected:         o aparelho está ligado a ALGUMA rede?
 *   - isInternetReachable: essa rede realmente chega à internet?
 *                          (Wi-Fi sem internet => connected=true, reachable=false)
 *   Os dois começam como `null`. Por isso comparamos
 *   com `=== false`: assim NÃO mostra o aviso por engano durante os
 *   primeiros segundos, antes do sistema responder.
 */
import { useNetInfo } from '@react-native-community/netinfo';

export function useConexao(): { offline: boolean } {
  const { isConnected, isInternetReachable } = useNetInfo();

  // Offline = sem rede nenhuma OU rede sem acesso à internet.
  const offline = isConnected === false || isInternetReachable === false;

  return { offline };
}
