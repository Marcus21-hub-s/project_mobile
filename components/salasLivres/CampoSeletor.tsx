import { Pressable, StyleSheet, Text } from "react-native";

import { COR } from "../../data/cores";

type CampoSeletorProps = {
    rotulo: string; // ex.: "Dia"
    valor: string; // ex.: "Qua 28 out"
    onPress: () => void;
};

/** Campo que mostra "Rótulo: valor" com uma seta para baixo; ao tocar, a tela abre o seletor. */
export default function CampoSeletor({ rotulo, valor, onPress }: CampoSeletorProps) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.campo, pressed && styles.pressionado]}
            accessibilityRole="button"
            accessibilityLabel={`${rotulo}: ${valor}. Toque para alterar`}
        >
            <Text style={styles.texto} numberOfLines={1}>
                <Text style={styles.rotulo}>{rotulo}: </Text>
                {valor}
            </Text>
            {/* O mesmo "›" das setas do app, girado para apontar para baixo */}
            <Text style={styles.seta}>›</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    campo: {
        flex: 1,
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        backgroundColor: COR.superficie,
        borderWidth: 1,
        borderColor: COR.linha,
        borderRadius: 14,
    },
    pressionado: { opacity: 0.7 },
    texto: { flex: 1, fontSize: 14, fontWeight: "700", color: COR.tinta },
    rotulo: { fontWeight: "400", color: COR.tintaSuave },
    seta: { fontSize: 22, lineHeight: 24, color: COR.tintaSuave, transform: [{ rotate: "90deg" }] },
});