import { useState } from "react";

import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { useAuth } from "./api/authContext";
import { handleLogin } from "./api/login";
import Logo from "./components/Logo";
import { COR } from "./data/cores";

export default function Page() {
  const [matricula, setMatricula] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const { iniciarSessao } = useAuth();

  const submitLogin = async () => {
    if ((matricula.length == 0 || senha.length == 0) ||
      (matricula.length > 1000 || senha.length > 1000)) {
      Alert.alert("Nome ou senha inválidos");
      return;
    }

    setCarregando(true);
    await handleLogin({
      email: matricula,
      password: senha,
      onError: () => Alert.alert("Nome ou senha inválidos"),
      onSuccess: (sessao) => {
        iniciarSessao(sessao);
        router.replace("/pages/ProfessorHome")
      }
    });
    setCarregando(false);

  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {carregando && (
          <View style={styles.carregando}>
            <ActivityIndicator color={COR.destaque} />
          </View>
        )}
        {/* Logos no topo */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        {/* Mensagem de boas-vindas, alinhada à esquerda */}
        <View style={styles.titleMessage}>
          {/* Barrinha amarela: mesmo destaque usado no "Hoje" da tela de aulas */}
          <View style={styles.titleAccent} />
          <Text style={styles.titleText}>Saiba para qual sala ir. Nunca mais se perca no campus</Text>

          {/* Selo que indica o tipo de acesso desta tela */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Acesso do professor</Text>
          </View>
        </View>

        {/* Formulário */}
        <View style={styles.form}>

          {/* Matrícula / e-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Matrícula ou e-mail institucional</Text>

            <TextInput
              style={styles.input}
              value={matricula}
              onChangeText={setMatricula}
              placeholder="Digite sua matrícula"
              placeholderTextColor={COR.tintaSuave}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={senha}
                onChangeText={setSenha}
                placeholder="Digite sua senha"
                placeholderTextColor={COR.tintaSuave}
                secureTextEntry={!mostrarSenha}
                returnKeyType="done"
              />

              <TouchableOpacity
                onPress={() => setMostrarSenha(!mostrarSenha)}
                style={styles.showPassword}
              >
                <Text style={styles.showPasswordText}>
                  {mostrarSenha ? "Ocultar" : "Mostrar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recuperação de senha */}
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => console.log("Recuperar senha")}
          >
            <Text style={styles.forgotPasswordText}>
              Esqueci minha senha
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={submitLogin}
          >
            <Text style={styles.loginButtonText}>
              Entrar
            </Text>
          </TouchableOpacity>

          {/* Rodapé institucional, dentro do cartão */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Aplicativo institucional.{"\n"}Uso exclusivo da comunidade acadêmica.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR.fundo,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 24,
  },

  // Logos: o container ocupa a largura toda para o componente Logo se distribuir no topo
  logoContainer: {
    width: "100%",
    height: 64,
    justifyContent: "center",
    marginBottom: 24,
  },

  // Bloco do título, alinhado à esquerda
  titleMessage: {
    alignItems: "flex-start",
    paddingHorizontal: 4,
  },
  titleAccent: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: COR.hoje,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "700",
    color: COR.tinta,
    textAlign: "left",
  },

  // Selo "Acesso do professor": verde-azulado translúcido (tom de COR.destaque)
  badge: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(14, 124, 134, 0.12)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COR.destaque,
  },

  // Formulário dentro de um "cartão" branco; flexGrow estica o cartão até o fim da tela
  form: {
    width: "100%",
    flexGrow: 1,
    marginTop: 24,
    backgroundColor: COR.superficie,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COR.linha,
    padding: 20,
  },

  inputGroup: {
    width: "100%",
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    color: COR.tinta,
    marginBottom: 8,
    fontWeight: "600",
  },

  input: {
    width: "100%",
    height: 56,
    backgroundColor: COR.fundo,
    borderWidth: 1,
    borderColor: COR.linha,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COR.tinta,
  },

  passwordContainer: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COR.fundo,
    borderWidth: 1,
    borderColor: COR.linha,
    borderRadius: 14,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 16,
    fontSize: 16,
    color: COR.tinta,
  },

  showPassword: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  showPasswordText: {
    color: COR.destaque,
    fontSize: 13,
    fontWeight: "700",
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -6,
    paddingVertical: 5,
  },

  forgotPasswordText: {
    color: COR.destaque,
    fontSize: 14,
    fontWeight: "600",
  },

  // Botão principal na cor da placa de sala
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  loginButton: {
    backgroundColor: COR.tinta,
    borderRadius: 14,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },

  // Rodapé: marginTop "auto" empurra o texto para o fim do cartão
  footer: {
    marginTop: "auto",
    paddingTop: 28,
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    lineHeight: 16,
    color: COR.tintaSuave,
    textAlign: "center",
  },

  carregando: {
    ...StyleSheet.absoluteFill, // cobre a tela toda (topo, laterais e base)
    alignItems: 'center',
    justifyContent: 'center', // centraliza o spinner
    backgroundColor: 'rgba(18, 38, 63, 0.75)', // tom da COR.tinta, igual ao fundo do modal
    zIndex: 10,
  },
});