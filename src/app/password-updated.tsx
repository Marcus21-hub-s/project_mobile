
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import Logo from "../../components/Logo";
import { COR } from "../../data/cores";

export default function PasswordUpdated() {
  const router = useRouter();

  // Recupera o estado enviado pela tela anterior.
  const { status } = useLocalSearchParams<{
    status?: string | string[];
  }>();

  // Trata possíveis parâmetros recebidos como array.
  const statusValue = Array.isArray(status) ? status[0] : status;

  // Define se a operação apresentou erro.
  const ocorreuErro = statusValue === "error";

  // Retorna para a tela de login.
  function voltarLogin() {
    router.replace("/");
  }

  // Retorna para a tela de redefinição de senha.
  function tentarNovamente() {
    router.replace("/reset-password");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* LOGO INSTITUCIONAL */}
        <View style={styles.logoContainer}>
          <Logo textColor="#FFFFFF" />
        </View>

        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View style={styles.titleAccent} />

          <Text style={styles.title}>
            Redefinição{"\n"}
            <Text style={styles.titleHighlight}>de senha!</Text>
          </Text>

          <Text style={styles.subtitle}>
            Isso redefinirá sua senha!
          </Text>
        </View>

        {/* CARTÃO DE RESULTADO */}
        <View style={styles.card}>

          {/* ESTADO DE SUCESSO */}
          {!ocorreuErro ? (
            <>
              <Text style={styles.cardTitle}>
                Nova senha{"\n"}salva com sucesso!
              </Text>

              {/* Símbolo de confirmação */}
              <View style={styles.iconContainer}>
                <Text style={styles.successIcon}>✓</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={voltarLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  Voltar para o Login
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ESTADO DE ERRO */
            <>
              <Text style={styles.cardTitle}>
                Deu erro com{"\n"}sucesso!
              </Text>

              {/* Símbolo de erro */}
              <View style={styles.iconContainer}>
                <Text style={styles.errorIcon}>×</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={tentarNovamente}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  Tente Novamente
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* RODAPÉ INSTITUCIONAL */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Uso exclusivo da comunidade acadêmica.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR.header,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 24,
  },

  // Área da logo.
  logoContainer: {
    width: "100%",
    height: 62,
    justifyContent: "center",
    marginBottom: 24,
  },

  // Cabeçalho da tela.
  header: {
    minHeight: 210,
    paddingHorizontal: 4,
  },

  titleAccent: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: COR.atencao,
    marginBottom: 14,
  },

  title: {
    fontSize: 34,
    lineHeight: 37,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  titleHighlight: {
    color: COR.hoje,
  },

  subtitle: {
    fontSize: 13,
    color: "#FFFFFF",
    marginTop: 10,
  },

  // Cartão branco de confirmação.
  card: {
    width: "100%",
    flexGrow: 1,
    minHeight: 330,
    backgroundColor: COR.superficie,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COR.linha,
    padding: 20,
    justifyContent: "space-between",
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: COR.tinta,
    textAlign: "center",
    marginTop: 4,
  },

  // Área reservada para o símbolo de resultado.
  iconContainer: {
    flex: 1,
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center",
  },

  // Símbolo de sucesso.
  successIcon: {
    fontSize: 112,
    lineHeight: 125,
    fontWeight: "400",
    color: COR.destaque,
  },

  // Símbolo de erro.
  errorIcon: {
    fontSize: 145,
    lineHeight: 150,
    fontWeight: "300",
    color: COR.atencao,
  },

  // Botão principal.
  primaryButton: {
    backgroundColor: COR.destaque,
    borderRadius: 10,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Rodapé institucional.
  footer: {
    paddingTop: 22,
    alignItems: "center",
  },

  footerText: {
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
