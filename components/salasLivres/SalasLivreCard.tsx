import { Pressable, StyleSheet, Text, View } from "react-native";

import { COR } from "../../data/cores";
import type { Sala } from "../../data/entities/sala";
import Selo from "../avisos/Selo";

const VERDE = "#22A05A"; // faixa lateral da sala livre (mesmo verde do selo "sucesso")

type SalaLivreCardProps = {
    sala: Sala;
    /** Chamado ao tocar em "Solicitar". */
    onSolicitar: (sala: Sala) => void;
};

/** Card de uma sala na lista de salas livres: nome, bloco e lugares, recursos, selo e botão. */
export default function SalaLivreCard({ sala, onSolicitar }: SalaLivreCardProps) {
    const livre = !sala.ocupada;
    const recursos = sala.recursos ?? [];

    return (
        <View style={styles.card}>
            <View style={[styles.faixa, { backgroundColor: livre ? VERDE : COR.linha }]} />

            <View style={styles.conteudo}>
                <View style={styles.esquerda}>
                    <Text style={styles.nome} numberOfLines={1}>
                        {sala.nome}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                        Bloco {sala.bloco} · {sala.capacidade} lugares
                    </Text>

                    {recursos.length > 0 && (
                        <View style={styles.recursos}>
                            {recursos.map((recurso) => (
                                <Selo key={recurso} texto={recurso} />
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.direita}>
                    <Selo texto={livre ? "Livre" : "Ocupada"} tom={livre ? "sucesso" : "erro"} />

                    <Pressable
                        onPress={() => onSolicitar(sala)}
                        disabled={!livre}
                        style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado, !livre && styles.botaoDesativado]}
                        accessibilityRole="button"
                        accessibilityLabel={`Solicitar a sala ${sala.nome}`}
                    >
                        <Text style={styles.botaoTexto}>Solicitar</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        backgroundColor: COR.superficie,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COR.linha,
        overflow: "hidden",
    },
    faixa: {
        width: 5,
        alignSelf: "stretch",
    },
    conteudo: {
        flex: 1,
        flexDirection: "row",
        gap: 10,
        padding: 14,
    },
    esquerda: {
        flex: 1,
    },
    nome: {
        fontSize: 18,
        fontWeight: "800",
        color: COR.tinta,
    },
    meta: {
        fontSize: 12,
        color: COR.tintaSuave,
        marginTop: 2,
    },
    recursos: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 10,
    },
    direita: {
        alignItems: "flex-end",
        justifyContent: "space-between",
    },
    botao: {
        height: 34,
        paddingHorizontal: 14,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: COR.tinta,
        marginTop: 14,
    },
    botaoPressionado: { opacity: 0.6 },
    botaoDesativado: { opacity: 0.4 },
    botaoTexto: {
        fontSize: 13,
        fontWeight: "700",
        color: COR.tinta,
    },
});