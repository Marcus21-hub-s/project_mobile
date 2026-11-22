/**
 * Faixa de aviso "Sem conexão com a internet".
 *
 * - Fica INVISÍVEL (retorna null) quando há conexão então não ocupa espaço nenhum na tela.
 * - Aparece sozinha quando a conexão cai e some quando ela volta,
 *   porque o hook useConexao re-renderiza o componente a cada mudança.
 *
 */
import { StyleSheet, Text, View } from 'react-native';

import { useConexao } from '../hooks/use-conexao';

const colors = { warnBg: 'FEF3C7', warnText: '#92400E' };
const radius = { md: 12};

type OfflineBannerProps={
  text: string;
}

export default function OfflineBanner(text: OfflineBannerProps) {
  // Hooks sempre vêm ANTES de qualquer "return" condicional (regra do React).
  const { offline } = useConexao();

  // Online (ou ainda desconhecido): não desenha nada.
  if (!offline) return null;

  return (
    <View
      // Leitores de tela (TalkBack/VoiceOver) anunciam o aviso ao aparecer.
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.container}
    >
      {/* Ícone simples de "!" desenhado com View/Text (sem depender de bibliotecas de ícones) */}
      <View style={styles.icone}>
        <Text style={styles.iconeTexto}>!</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.titulo}>Sem conexão com a internet</Text>
        <Text style={styles.detalhe}>{text.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.warnBg,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8, // o espaço mora aqui dentro: se o banner some, o espaço some junto
  },
  icone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.warnText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeTexto: { color: '#fff', fontWeight: '800', fontSize: 14 },
  titulo: { color: colors.warnText, fontSize: 14, fontWeight: '800' },
  detalhe: { color: colors.warnText, fontSize: 12, marginTop: 2 },
});
