
import { useState } from "react";

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Logo from "../components/Logo";

export default function ProfessorLogin() {
  const [matricula, setMatricula] = useState("");

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
            <Text style={styles.label}>Matrícula:</Text>

            
            <TextInput
              style={styles.input}
              value={matricula}
              onChangeText={setMatricula}
              placeholder="Digite sua matrícula"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/*Botão de entrar*/}
           <TouchableOpacity
            style={styles.loginButton}
            onPress={() => console.log("Recuperar senha")}
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
    backgroundColor: "#FFFFFF",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 45,
  },

  logoContainer: {
    width: "100%",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  form: {
    width: "100%",
    marginTop: 65,
  },

  inputGroup: {
    width: "100%",
    marginBottom: 22,
  },

  label: {
    fontSize: 20,
    color: "#222222",
    marginBottom: 7,
    fontWeight: "400",
  },

  input: {
    width: "100%",
    height: 55,
    backgroundColor: "#FAFAFA",
    borderWidth: 2,
    borderColor: "#20C9D5",
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 17,
    color: "#222222",
  },

  passwordContainer: {
    width: "100%",
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderWidth: 2,
    borderColor: "#20C9D5",
    borderRadius: 9,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 17,
    color: "#222222",
  },

  showPassword: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  showPasswordText: {
    color: "#20BFCB",
    fontSize: 13,
    fontWeight: "600",
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -10,
    paddingVertical: 5,
  },

  forgotPasswordText: {
    color: "#315CFF",
    fontSize: 14,
    fontStyle: "italic",
  },

  loginButtonText: {
    color: "#fbfbfbff",
    fontSize: 25,
    fontStyle: "italic",
  },

  loginButton:{
    backgroundColor: "#0db7deff",
    borderRadius: 5,
    padding:10,
    alignItems: "center",
    marginTop:20
  }
});
