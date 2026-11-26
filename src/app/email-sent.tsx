
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";
import Logo from "../../components/Logo";
import { COR } from "../../data/cores";
import { supabase } from "./supabase";

export default function EmailSent() {
  // Recupera o e-mail enviado pela tela anterior, caso tenha sido informado.
  const { email } = useLocalSearchParams<{ email?: string }>();

  // Garante que teremos apenas um endereço de e-mail.
  const emailAddress = Array.isArray(email) ? email[0] : email;

  // Controla o estado visual do botão de reenvio.
  const [reenviando, setReenviando] = useState(false);

  // Controla a mensagem exibida após uma ação.
  const [mensagem, setMensagem] = useState("");

/*
 * INTEGRAÇÃO COM SUPABASE
 *
 * A integração com o Supabase foi pausada temporariamente para priorizar
 * a resenha marota.
 *
 * Neste momento, as validações dos campos, mensagens de erro,
 * estados de carregamento e feedbacks serão implementados localmente,
 * estão funcionando pra k777taaa poxa vambora 
 *
 * FUTURAS IMPLEMENTAÇÕES:
 * - Configurar o envio de e-mails de recuperação.
 * - Configurar o redirecionamento por Deep Linking.
 * - Validar a sessão de recuperação do usuário.
 * - Conectar a atualização da nova senha ao Supabase.
 * - Testar o fluxo completo de recuperação.
 *
 * IMPORTANTE: As simulações locais não representam uma alteração
 * real de senha. A integração deverá ser concluída antes da entrega final.
 */

  // Abre o app :P de e-mail padrão do dispositivo.
  async function abrirEmail() {
    try {
      // Na versão Web, abre a caixa de entrada do Outlook.
      if (Platform.OS === "web") {
        await Linking.openURL("https://outlook.office.com/mail/");
        return;
      }

      // No celular, tenta abrir o aplicativo de e-mail padrão.
      await Linking.openURL("mailto:");
    } catch {
      Alert.alert(
        "Não foi possível abrir o e-mail",
        "Acesse o Outlook manualmente para verificar a mensagem de recuperação."
    );
  }
}

// Solicita o reenvio do link de recuperação.
async function reenviarEmail() {
  // Verifica se o endereço foi recebido pela tela anterior.
  if (!emailAddress) {
    setMensagem("Não foi possível identificar o e-mail informado.");
    return;
  }

  setReenviando(true);
  setMensagem("");

  try {
    // Solicita ao Supabase um novo e-mail de recuperação.
    const { error } = await supabase.auth.resetPasswordForEmail(
      emailAddress
    );

    if (error) {
      setMensagem("Não foi possível solicitar o reenvio. Tente novamente.");
      return;
    }

    setMensagem(
      "Se o endereço estiver cadastrado, um novo link será enviado."
    );
  } catch {
    setMensagem("Ocorreu um erro de conexão. Tente novamente.");
  } finally {
    // Libera o botão novamente, mesmo se ocorrer algum erro.
    setReenviando(false);
  }
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
        {/* Logo institucional */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        {/* Título e destaque visual */}
        <View style={styles.titleContainer}>
          <View style={styles.titleAccent} />

          <Text style={styles.title}>
            Confira seu e-mail!
          </Text>

          <Text style={styles.subtitle}>
            Estamos quase lá. Siga as instruções para recuperar sua senha.
          </Text>
        </View>

        {/* Cartão principal */}
        <View style={styles.card}>

          {/* Ilustração representada por um ícone textual nesta primeira versão
          <View style={styles.illustration}>
            <Text style={styles.illustrationIcon}>✉</Text>
            <View style={styles.illustrationBadge}>
              <Text style={styles.illustrationBadgeText}>✓</Text>
            </View>
          </View> */}
            {/* Envelope mascote tchola */}
            <Image
              source={require("../../assets/expo.icon/Assets/Tchola.png")}
              style={styles.illustration}
              resizeMode="contain"
            />

          {/* Mensagem de confirmação */}
          <Text style={styles.cardTitle}>
            Verifique sua caixa de entrada
          </Text>

          <Text style={styles.description}>
            Se o endereço informado estiver cadastrado, você receberá um
            link com as instruções para redefinir sua senha.
          </Text>

          {/* Exibe o endereço recebido pela tela anterior */}
          {email ? (
            <View style={styles.emailBox}>
              <Text style={styles.emailLabel}>
                E-mail informado
              </Text>

              <Text style={styles.emailText}>
                {email}
              </Text>
            </View>
          ) : null}

          {/* Botão para abrir o aplicativo de e-mail */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={abrirEmail}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              Abrir aplicativo de e-mail
            </Text>
          </TouchableOpacity>

          {/* Orientações adicionais */}
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>
              Não encontrou a mensagem?
            </Text>

            <Text style={styles.tipText}>
              Confira também as pastas de spam, lixo eletrônico ou promoções.
            </Text>
          </View>

          {/* Reenvio do e-mail */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Ainda não recebeu?
            </Text>

            <TouchableOpacity
              onPress={reenviarEmail}
              disabled={reenviando}
              activeOpacity={0.7}
            >
              {reenviando ? (
                <ActivityIndicator color={COR.destaque} />
              ) : (
                <Text style={styles.resendButtonText}>
                  Reenviar link de recuperação
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Mensagem temporária da funcionalidade de reenvio */}
          {mensagem ? (
            <Text style={styles.messageText}>
              {mensagem}
            </Text>
          ) : null}

          {/* ATALHO TEMPORÁRIO PARA DEMONSTRAÇÃO */}
          <TouchableOpacity
            onPress={() => router.push("/reset-password")}
            activeOpacity={0.7}
          >
            <Text style={styles.demoLink}>
              Ir para a próxima tela (DEMO)
            </Text>
          </TouchableOpacity>
          </View>  

          {/* Voltar para o login
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/")}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>
              Voltar para o login
            </Text>
          </TouchableOpacity>**/}

        {/* Rodapé institucional */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Aplicativo institucional.{"\n"}
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
    backgroundColor: COR.fundo,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 24,
  },

  // Área da logo institucional.
  logoContainer: {
    width: "100%",
    height: 62,
    justifyContent: "center",
    marginBottom: 24,
  },

  // Cabeçalho da tela.
  titleContainer: {
    alignItems: "flex-start",
    paddingHorizontal: 4,
  },

  // Barrinha amarela usada como destaque.
  titleAccent: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: COR.hoje,
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "700",
    color: COR.tinta,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: COR.tintaSuave,
    marginTop: 10,
  },

  // Cartão principal da confirmação.
  card: {
    width: "100%",
    flexGrow: 1,
    marginTop: 24,
    backgroundColor: COR.superficie,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COR.linha,
    padding: 20,
  },

  // Tchola
  illustration: {
    alignSelf: "center",
    width: 250,
    height: 250,
    borderRadius: 250,
    backgroundColor: "#a4d8db",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  demoLink: {
  fontSize: 12,
  color: COR.destaque,
  textDecorationLine: "underline",
  textAlign: "center",
  marginTop: 12,
},

  // illustrationIcon: {
  //   fontSize: 54,
  //   color: COR.destaque,
  // },

  // illustrationBadge: {
  //   position: "relative",
  //   right: 0,
  //   bottom: 2,
  //   width: 10,
  //   height: 10,
  //   borderRadius: 100,
  //   backgroundColor: COR.hoje,
  //   alignItems: "center",
  //   justifyContent: "center",
  // },

  // illustrationBadgeText: {
  //   color: COR.tinta,
  //   fontSize: 18,
  //   fontWeight: "800",
  // },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COR.tinta,
    textAlign: "center",
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COR.tintaSuave,
    textAlign: "center",
  },

  // Área que apresenta o e-mail informado.
  emailBox: {
    backgroundColor: COR.fundo,
    borderWidth: 1,
    borderColor: COR.linha,
    borderRadius: 12,
    padding: 14,
    marginTop: 22,
    alignItems: "center",
  },

  emailLabel: {
    fontSize: 12,
    color: COR.tintaSuave,
    marginBottom: 5,
  },

  emailText: {
    fontSize: 14,
    fontWeight: "700",
    color: COR.tinta,
    textAlign: "center",
  },

  // Botão principal.
  primaryButton: {
    backgroundColor: COR.tinta,
    borderRadius: 14,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Caixa com orientações para o usuário.
  tipBox: {
    backgroundColor: "rgba(26, 160, 168, 0.45)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgb(15, 127, 134)",
    padding: 14,
    marginTop: 22,
  },

  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COR.atencao,
    marginBottom: 6,
  },

  tipText: {
    fontSize: 13,
    lineHeight: 20,
    color: COR.tinta,
  },

  // Área de reenvio.
  resendContainer: {
    alignItems: "center",
    marginTop: 24,
    gap: 8,
  },

  resendText: {
    fontSize: 13,
    color: COR.tintaSuave,
  },

  resendButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: COR.destaque,
  },

  messageText: {
    fontSize: 12,
    color: COR.tintaSuave,
    textAlign: "center",
    marginTop: 12,
  },

  // // Navegação de volta.
  // backButton: {
  //   alignItems: "center",
  //   paddingVertical: 16,
  //   marginTop: 12,
  // },

  // backButtonText: {
  //   fontSize: 14,
  //   fontWeight: "600",
  //   color: COR.destaque,
  // },

  // bosta seca
  footer: {
    paddingTop: 24,
    alignItems: "center",
  },

  footerText: {
    fontSize: 11,
    lineHeight: 16,
    color: COR.tintaSuave,
    textAlign: "center",
  },
});
