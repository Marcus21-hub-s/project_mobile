import { useState } from "react";

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

// bagulho substituivel
// import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Logo from "../../components/Logo";
import { COR } from "../../data/cores";
import { supabase } from "./supabase";

type EmailError = "empty" | "invalid" | null;


export default function ForgotPassword() {
  const router = useRouter();
  //ensinando ladrão a roubar :D vambora poxa
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<EmailError>(null);
    // Valida o e-mail e solicita o envio do link de recuperação.
async function handleSubmit() {
  const normalizedEmail = email.trim();

  // Verifica se o campo está vazio.
  if (!normalizedEmail) {
    setEmailError("empty");
    return;
  }

  // Verifica se o formato do e-mail é válido.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalizedEmail)) {
    setEmailError("invalid");
    return;
  }

  setEmailError(null);

  try {
    // Solicita ao Supabase o envio do e-mail de recuperação.
    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail
    );

    if (error) {
      Alert.alert(
        "Não foi possível solicitar a recuperação",
        "Ocorreu um erro ao processar sua solicitação. Tente novamente."
      );
      return;
    }

    // Envia o endereço para a próxima tela.
    router.push({
      pathname: "/email-sent",
      params: {
        email: normalizedEmail,
      },
    });
  } catch {
    Alert.alert(
      "Erro inesperado",
      "Não foi possível conectar ao serviço. Tente novamente."
    );
  }
}
  //FUNÇÃO DE ALTERAÇÃO DO E-MAIL

  function handleEmailChange(value: string) {
    setEmail(value);
    // isso é bom e não é ruim se pa
    if (emailError) {
      setEmailError(null);
    }
  }

// Sem julieta por aqui só erro meu xd xd piada bosta tmj 

  const hasError = emailError !== null;

  const errorMessage =
    emailError === "empty"
      ? "Digite seu email"
      : emailError === "invalid"
        ? "Insira um email válido [exemplo:matricula@sempreuninassau.com.br]"
        : "";


  //INTERFACE DA TELA: deixa tudo do balacobaco de bom

  return (

    // Evita estresse com o teclado :D 
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >

      {/* CONFIGURAÇÃO DA BARRA SUPERIOR DO CELULAR */}
      <StatusBar barStyle="light-content" />
      {/* 
        Permite rolar a tela caso o conteúdo não caiba
        completamente na altura disponível.
        
        keyboardShouldPersistTaps mantém os toques nos componentes
        funcionando mesmo com o teclado aberto.
      */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* ==========================================
            CABEÇALHO ZIKA
            ========================================== */}

        <View style={styles.header}>

          {/* IDENTIDADE VISUAL / LOGOTIPO */}
          <View style={styles.brand}>
            <Logo textColor="#FFFFFF" />
            {/* <Text style={styles.brandTitle}>UNINASSAU</Text>
            <Text style={styles.brandSubtitle}>
              Fazendo parte da sua história
            </Text> */}
          </View>


          {/* TÍTULO E ELEMENTOS DECORATIVOS */}
          <View style={styles.headerContent}>

            {/* Pequena linha vermelha aviadada */}
            <View style={styles.redLine} />

            {/* Título principal*/}
            <Text style={styles.title}>
              Esqueceu{"\n"}
              <Text style={styles.yellowText}>sua senha?</Text>
            </Text>

            {/* Texto de apoio emotivo */}
            <Text style={styles.subtitle}>
              Pode ficar tranquilo(a)!
            </Text>

            {/* Envelope mascote tchola assets\expo.icon\Assets\Mnky.png*/}
            <Image
              source={require("../../assets/expo.icon/Assets/Mnky.png")}
              style={styles.illustration}
              resizeMode="contain"
            />

          </View>
        </View>


        {/* ==========================================
            CARD PRINCIPAL 
            ========================================== */}

        <View style={styles.card}>

          {/* Título do formulário */}
          <Text style={styles.cardTitle}>
            Redefina sua senha aqui.
          </Text>

          {/* Instruções para o usuário */}
          <Text style={styles.description}>
            Insira seu e-mail cadastrado abaixo para{"\n"}
            receber as instruções de redefinição de senha.
          </Text>


          {/* ========================================
              CAMPO DE PREENCHER E-MAIL :o
              ======================================== */}

          <View style={styles.inputContainer}>

            {/* Identificação do campo */}
            <Text style={styles.label}>Email:</Text>

            <TextInput
              style={[
                styles.input,
                hasError && styles.inputError,
              ]}
              //Altera o texto de orientação conforme o estado
              placeholder="Digite seu email"
              
              // Altera a cor do placeholder conforme o estado.
              placeholderTextColor={
                hasError ? "#D00036" : "#A1AEC0"
              }
              value={email}
              // texto é alterado? executa função :P
              onChangeText={handleEmailChange}
              // teclado apropriado para endereços de e-mail
              keyboardType="email-address"
              // Impede burrice do usuario :D
              autoCapitalize="none"
              // Impede burrice do teclado :D
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
              />

              {/* Exibe a mensagem abaixo somente para e-mail inválido */}
              {emailError === "invalid" && (
                <Text style={styles.errorMessage}>
                  {errorMessage}
                </Text>
              )}

          </View>


          {/* ========================================
              BOTÃO DE ENVIAR
              ======================================== */}

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleSubmit}
          >
            <Text style={styles.buttonText}>Enviar</Text>
          </TouchableOpacity>


          {/* ========================================
              VOLTAR PARA LOGIN/TELA ANTERIOR
              ======================================== */}

          <View style={styles.backContainer}>

            <Text style={styles.backText}>
              Lembrou a Senha?
            </Text>

            {/* Retorna para a tela anterior da navegação. */}
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.backLink}>
                Clique aqui para voltar.
              </Text>
            </TouchableOpacity>
          </View>

          {/* RODAPÉ DO CARD */}
          <Text style={styles.footer}>
            Uso exclusivo da comunidade acadêmica.
          </Text> 
          {/*frecurinha master aqui :D yyupi*/}  
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  // CONTAINER GERAL.
  container: {
    flex: 1,
    backgroundColor: COR.header,
  },

  // ÁREA ROLÁVEL.
  scrollContent: {
    flexGrow: 1,
  },

  // CABEÇALHO.
  header: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 25,
  },

  // IDENTIDADE VISUAL.
  brand: {
    marginBottom: 35,
  },

  brandTitle: {
    color: COR.superficie,
    fontSize: 19,
    fontWeight: "bold",
  },

  brandSubtitle: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 10,
  },

  // CONTEÚDO DO CABEÇALHO.

  headerContent: {
    position: "relative",
    minHeight: 300,
  },

  headerText: {
    zIndex: 1,
  },

  // ÁREA RESERVADA PARA O TCHOLINHA
  illustration: {
    width: 240,
    height: 280,
    alignSelf: "flex-end",
    marginTop: -35,
    marginRight: -5,
    marginBottom: -20,
  },


  // Linha de destaque vermelha.
  redLine: {
    width: 207,
    height: 5,
    backgroundColor: COR.atencao,
    marginBottom: 12,
  },

  // TÍTULO PRINCIPAL.
  title: {
    color: COR.superficie,
    fontSize: 45,
    fontWeight: "bold",
    lineHeight: 45,
  },

  // DESTAQUE AMARELO.
  yellowText: {
    color: COR.hoje,
  },

  // TEXTO ABAIXO DO TÍTULO.
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 17,
    marginTop: 8,
  },

  // illustration: {
  //   width: 300,
  //   height: 400,
  //   alignSelf: "flex-end",
  //   marginTop: 10,
  //   marginBottom: -20,
  // },

  // CARD BRANCO PRINCIPAL.
  card: {
    flex: 1,
    backgroundColor: COR.superficie,

    // Arredonda somente os cantos superiores.
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    paddingHorizontal: 17,
    paddingTop: 32,
    paddingBottom: 25,

    minHeight: 330,
  },

  // TÍTULO DO CARD.
  cardTitle: {
    color: COR.tinta,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },

  // DESCRIÇÃO DO FORMULÁRIO.
  description: {
    color: COR.tintaSuave,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 14,
    marginBottom: 25,
  },

  // CAMPO DE E-MAIL.
  inputContainer: {
    marginBottom: 17,
  },

  // TEXTO "E-MAIL".
  label: {
    color: COR.tinta,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 7,
  },

  // APARÊNCIA PADRÃO DO CAMPO.
  input: {
    height: 43,
    backgroundColor: COR.fundo,
    borderWidth: 1,
    borderColor: COR.linha,
    borderRadius: 9,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COR.tinta,
  },

  // APARÊNCIA DO CAMPO QUANDO EXISTE UM ERRO.
  inputError: {
    borderColor: COR.atencao,
    backgroundColor: "rgba(194, 1, 46, 0.06)",
  },

  // MENSAGEM DE ERRO ABAIXO DO CAMPO.
  errorMessage: {
    color: COR.atencao,
    fontSize: 11,
    marginTop: 6,
    marginLeft: 3,
  },

  // BOTÃO ENVIAR.
  button: {
    height: 46,
    backgroundColor: COR.destaque,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: COR.superficie,
    fontSize: 16,
    fontWeight: "bold",
  },

  // ÁREA DE RETORNO AO LOGIN.
  backContainer: {
    alignItems: "center",
    marginTop: 18,
  },

  backText: {
    color: COR.tinta,
    fontSize: 14,
    fontWeight: "bold",
  },

  backLink: {
    color: COR.destaque,
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 0,
  },

  // RODAPÉ.
  footer: {
    color: COR.tintaSuave,
    fontSize: 9,
    textAlign: "center",
    marginTop: 25,
  },

});
