import { useState } from "react";

import { router } from "expo-router";
import {
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

import Logo from "../components/Logo";
import { COR } from "../data/cores";

export default function ProfessorLogin() {
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const submitLogin = ()=>{
    if((nome.length==0 || senha.length==0) || 
    (nome.length>1000 || senha.length>1000)){
      Alert.alert("Nome ou senha inválidos");
      return;
    }
    //Depois, os dados do login serão enviados para o backend por meio de um endpoint, antes do direcionamento
    router.navigate("/pages/ProfessorHome");
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        {/* Formulário */}
        <View style={styles.form}>

          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome:</Text>

            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome"
              placeholderTextColor={COR.tintaSuave}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha:</Text>

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
    paddingBottom: 32,
  },

  logoContainer: {
    width: "100%",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  // Formulário dentro de um "cartão" branco, como o modal e os cartões de aula
  form: {
    width: "100%",
    marginTop: 70,
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

  // Botão principal na cor da placa de sala, igual ao "Entrar como professor"
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },

  loginButton:{
    backgroundColor: COR.tinta,
    borderRadius: 14,
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
});