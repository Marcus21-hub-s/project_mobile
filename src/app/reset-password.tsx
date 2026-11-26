
import { useState } from "react";

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import Logo from "../../components/Logo";
import { COR } from "../../data/cores";

// Estados de validação dos campos.
type PasswordError = "empty" | "short" | "different" | null;

export default function ResetPassword() {
  const router = useRouter();

  // Armazena os valores digitados pelo usuário.
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Controla a visibilidade dos campos de senha.
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    // Controla se o usuário já tentou salvar.
    const [tentouSalvar, setTentouSalvar] = useState(false);

    // Verifica se as duas senhas foram preenchidas, mas são diferentes.
    const senhasDiferentes =
    tentouSalvar &&
    novaSenha.length > 0 &&
    confirmarSenha.length > 0 &&
    novaSenha !== confirmarSenha;

  // Validação da senha principal.
    const erroNovaSenha: PasswordError =
        !tentouSalvar
        ? null
        : !novaSenha
            ? "empty"
            : novaSenha.length < 8
            ? "short"
            : null;

  // Validação da confirmação da senha.
  const erroConfirmarSenha: PasswordError =
    !tentouSalvar
      ? null
      : !confirmarSenha
        ? "empty"
        : novaSenha !== confirmarSenha
          ? "different"
          : null;

  // Verifica se os dois campos estão válidos.
  const formularioValido =
    novaSenha.length >= 8 &&
    confirmarSenha.length > 0 &&
    novaSenha === confirmarSenha;

  // Valida os campos antes de continuar.
  function handleSalvarSenha() {
    setTentouSalvar(true);

    if (!formularioValido) {
      return;
    }

    /*
     * DEMONSTRAÇÃO TEMPORÁRIA:
     * A senha ainda não será atualizada no Supabase.
     * Esta navegação serve apenas para demonstrar o fluxo visual.
     */
    router.push({
      pathname: "/password-updated",
      params: {
        status: "success", // ou "error",
        demo: "true",
      },
    });
  }

  // Atualiza a senha e limpa os erros enquanto o usuário digita.
  function handleNovaSenha(value: string) {
    setNovaSenha(value);
  }

  // Atualiza a confirmação e limpa os erros enquanto o usuário digita.
  function handleConfirmarSenha(value: string) {
    setConfirmarSenha(value);
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

        {/* CABEÇALHO DA TELA */}
        <View style={styles.header}>
          <View style={styles.titleAccent} />

          <Text style={styles.title}>
            Redefinição{"\n"}
            <Text style={styles.titleHighlight}>de senha!</Text>
          </Text>

          <Text style={styles.subtitle}>
            Isso redefinirá sua senha!
          </Text>

          {/* Ilustração reaproveitada da tela anterior. */}
          <Image
            source={require("../../assets/expo.icon/Assets/Mnky.png")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* CARTÃO PRINCIPAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Finalizando essa joça!
          </Text>

          {/* CAMPO: NOVA SENHA */}
          <View style={styles.fieldContainer}>
            <Text style={styles.inputLabel}>Nova Senha:</Text>

            <View
              style={[
                styles.inputWrapper,
                (erroNovaSenha || senhasDiferentes) && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.input}
                value={novaSenha}
                onChangeText={handleNovaSenha}
                placeholder="Digite sua senha."
                placeholderTextColor="#A5B0BF"
                secureTextEntry={!mostrarNovaSenha}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
              />

              <TouchableOpacity
                onPress={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                activeOpacity={0.7}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={mostrarNovaSenha ? "eye-off-outline" : "eye-outline"}
                  size={21}
                  color={COR.tintaSuave}
                />
              </TouchableOpacity>
            </View>

            {erroNovaSenha === "empty" && (
              <Text style={styles.errorText}>
                Digite sua nova senha.
              </Text>
            )}

            {erroNovaSenha === "short" && (
              <Text style={styles.errorText}>
                A senha precisa ter pelo menos 8 caracteres.
              </Text>
            )}
          </View>

          {/* CAMPO: CONFIRMAR SENHA */}
          <View style={styles.fieldContainer}>
            <Text style={styles.inputLabel}>Confirmar Nova Senha:</Text>

            <View
              style={[
                styles.inputWrapper,
                (erroConfirmarSenha || senhasDiferentes) && styles.inputError,
              ]}
            >
              <TextInput
                style={styles.input}
                value={confirmarSenha}
                onChangeText={handleConfirmarSenha}
                placeholder="Digite sua senha."
                placeholderTextColor="#A5B0BF"
                secureTextEntry={!mostrarConfirmarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
              />

              <TouchableOpacity
                onPress={() =>
                  setMostrarConfirmarSenha(!mostrarConfirmarSenha)
                }
                activeOpacity={0.7}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={
                    mostrarConfirmarSenha
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={21}
                  color={COR.tintaSuave}
                />
              </TouchableOpacity>
            </View>

            {erroConfirmarSenha === "empty" && (
              <Text style={styles.errorText}>
                Confirme sua nova senha.
              </Text>
            )}

            {erroConfirmarSenha === "different" && (
              <Text style={styles.errorText}>
                As senhas precisam ser iguais.
              </Text>
            )}
          </View>

          {/* BOTÃO DE ATUALIZAÇÃO */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSalvarSenha}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Salvar nova senha
            </Text>
          </TouchableOpacity>
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

  // Cabeçalho com título e ilustração.
  header: {
    position: "relative",
    minHeight: 280,
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

  // Ilustração posicionada à direita do cabeçalho.
  illustration: {
    width: 210,
    height: 190,
    alignSelf: "flex-end",
    marginTop: -8,
    marginRight: 0,
  },

  // Cartão branco com os campos de senha.
  card: {
    width: "100%",
    backgroundColor: COR.superficie,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COR.linha,
    padding: 18,
    marginTop: 4,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: COR.tinta,
    textAlign: "center",
    marginBottom: 22,
  },

  fieldContainer: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COR.tinta,
    marginBottom: 7,
  },

  // Campo e botão de visualização.
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COR.fundo,
    borderWidth: 1,
    borderColor: COR.fundo,
    borderRadius: 10,
    minHeight: 46,
  },

  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COR.tinta,
  },

  eyeButton: {
    paddingHorizontal: 12,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },

  // Destaque vermelho para campos inválidos.
  inputError: {
    borderColor: COR.atencao,
    backgroundColor: "#FFF3F4",
  },

  errorText: {
    fontSize: 11,
    color: COR.atencao,
    marginTop: 6,
    marginLeft: 2,
  },

  // Botão principal.
  primaryButton: {
    backgroundColor: COR.destaque,
    borderRadius: 10,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Rodapé.
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
