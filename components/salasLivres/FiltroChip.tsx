import { Pressable, StyleSheet, Text } from "react-native";

import { COR } from "../../data/cores";

type FiltroChipProps = {
    texto: string;
    ativo: boolean;
    onPress: () => void;
};

/** Pílula de filtro: escura quando ativa, branca com borda quando inativa. */
export default function FiltroChip({ texto, ativo, onPress }: FiltroChipProps) {
    return (
        <Pressable
            onPress={onPress}
            style={[styles.chip, ativo && styles.chipAtivo]}
            accessibilityRole="button"
            accessibilityState={{ selected: ativo }}
            accessibilityLabel={`Filtro ${texto}`}
        >
            <Text style={[styles.texto, ativo && styles.textoAtivo]}>{texto}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 18,
        backgroundColor: COR.superficie,
        borderWidth: 1,
        borderColor: COR.linha,
    },
    chipAtivo: {
        backgroundColor: COR.tinta,
        borderColor: COR.tinta,
    },
    texto: { fontSize: 13, fontWeight: "600", color: COR.tinta },
    textoAtivo: { color: "#FFFFFF" },
});