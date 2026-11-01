import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Logo from "./components/Logo";
import { COR } from "./data/cores";

export default function Page() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.main}>

                {/* Logo */}
                <View style={styles.logo}>
                    <Logo />
                </View>

                {/* Mensagem */}
                <View style={styles.titleMessage}>
                    {/* Barrinha amarela: mesmo destaque usado no "Hoje" da tela de aulas */}
                    <View style={styles.titleAccent} />
                    <Text style={styles.titleText}>Saiba para qual sala ir. Nunca mais se perca no campus</Text>
                </View>

                {/* Botões */}
                <View style={styles.actions}>

                    <TouchableOpacity
                        style={[styles.button, styles.buttonProfessor]}
                        activeOpacity={0.85}
                        onPress={() => { router.navigate("/pages/ProfessorLogin") }}>
                        <Text style={styles.text}>Entrar como professor</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={[styles.button, styles.buttonAluno]}
                        activeOpacity={0.85}
                        onPress={() => { router.navigate("/pages/AlunoLogin") }}>
                        <Text style={styles.text}>Entrar como aluno</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>

                </View>
            </View>

            {/* Rodapé institucional */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Aplicativo institucional. Uso exclusivo da comunidade acadêmica.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COR.fundo,
        paddingHorizontal: 20,
    },

    main: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 40,
        paddingBottom: 32,
    },

    logo: {
        width: "100%",
        alignItems: "center",
    },

    titleMessage: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 8,
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
        textAlign: "center",
    },

    actions: {
        width: "100%",
        gap: 14,
    },

    // Botões no formato dos cartões das outras telas (cantos arredondados, 14)
    button: {
        width: "100%",
        height: 58,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        borderRadius: 14,
    },
    buttonProfessor: {
        backgroundColor: COR.tinta, // mesma cor da placa de sala
    },
    buttonAluno: {
        backgroundColor: COR.destaque, // mesma cor do dia selecionado
    },

    text: {
        fontSize: 18,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: "bold"
    },
    arrow: {
        fontSize: 28,
        lineHeight: 30,
        fontWeight: "600",
        color: "#FFFFFF",
    },

    // Rodapé
    footer: {
        alignItems: "center",
        paddingVertical: 14,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COR.linha,
    },
    footerText: {
        fontSize: 12,
        color: COR.tintaSuave,
        textAlign: "center",
    },
});