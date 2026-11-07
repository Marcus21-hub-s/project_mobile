import { StyleSheet, Text, View } from "react-native";

import { COR } from "../data/cores";

/** Tom do selo: define a cor do fundo e do texto. */
export type TomSelo = "sucesso" | "aviso" | "erro" | "neutro";

const TONS: Record<TomSelo, { fundo: string; texto: string }> = {
    sucesso: { fundo: "rgba(34, 160, 90, 0.14)", texto: "#157347" },
    aviso: { fundo: "rgba(242, 169, 0, 0.2)", texto: "#8A5A00" },
    erro: { fundo: "rgba(214, 69, 65, 0.14)", texto: "#B02A27" },
    neutro: { fundo: COR.linha, texto: COR.tintaSuave },
};

type SeloProps = {
    texto: string;
    tom?: TomSelo;
};

/** Pílula pequena de status (ex.: "Livre neste horário", "Pendente", "Aprovada"). */
export default function Selo({ texto, tom = "neutro" }: SeloProps) {
    const cores = TONS[tom];

    return (
        <View style={[styles.selo, { backgroundColor: cores.fundo }]}>
            <Text style={[styles.texto, { color: cores.texto }]} numberOfLines={1}>
                {texto}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    selo: {
        alignSelf: "flex-start",
        flexShrink: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    texto: {
        fontSize: 12,
        fontWeight: "700",
    },
});