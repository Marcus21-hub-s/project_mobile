import { StyleSheet, Text, View } from "react-native";

import { COR } from "../data/cores";
import { DIAS_ABREV, MESES_ABREV } from "../data/ensalamento";
import type { Aula } from "../data/entities/aula";

/** "2026-10-28" -> "Qua 28 out" */
const dataCurta = (iso: string): string => {
    const [ano, mes, dia] = iso.slice(0, 10).split("-").map(Number);
    const data = new Date(ano, mes - 1, dia);
    return `${DIAS_ABREV[data.getDay()]} ${dia} ${MESES_ABREV[mes - 1]}`;
};

type AulaResumoCardProps = {
    aula: Aula;
};

export default function AulaResumoCard({ aula }: AulaResumoCardProps) {
    // Se a aula trouxer a turma, mostra "turma · N alunos"; senão, cai no nome do curso
    const detalheTurma =  `${aula.turma.nome} · ${aula.turma.qtd_alunos} alunos`;

    return (
        <View
            style={styles.card}
            accessible
            accessibilityLabel={`${aula.disciplina}, ${dataCurta(aula.data)}, das ${aula.horaInicio} às ${aula.horaFim}, sala ${aula.sala.nome}, bloco ${aula.sala.bloco}`}
        >
            <View style={[styles.faixa, { backgroundColor: aula.cor }]} />

            <View style={styles.info}>
                <Text style={styles.disciplina} numberOfLines={2}>
                    {aula.disciplina}
                </Text>
                <Text style={styles.linha} numberOfLines={1}>
                    {dataCurta(aula.data)} · {aula.horaInicio} – {aula.horaFim}
                </Text>
                <Text style={styles.linha} numberOfLines={1}>
                    {detalheTurma}
                </Text>
            </View>

            {/* Placa da sala atual: largura fixa; o nome encolhe para caber */}
            <View style={styles.placa}>
                <Text style={styles.placaSala} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                    {aula.sala.nome}
                </Text>
                <Text style={styles.placaBloco} numberOfLines={1}>
                    Bloco {aula.sala.bloco}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COR.superficie,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COR.linha,
        overflow: "hidden",
        paddingRight: 12,
    },
    faixa: {
        width: 5,
        alignSelf: "stretch",
    },
    info: {
        flex: 1,
        paddingVertical: 14,
        paddingLeft: 14,
        paddingRight: 8,
    },
    disciplina: {
        fontSize: 16,
        fontWeight: "700",
        color: COR.tinta,
    },
    linha: {
        fontSize: 12,
        color: COR.tintaSuave,
        marginTop: 3,
    },

    placa: {
        width: 76,
        height: 56,
        borderRadius: 10,
        backgroundColor: COR.tinta,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
    },
    placaSala: {
        alignSelf: "stretch",
        textAlign: "center",
        fontSize: 19,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    placaBloco: {
        alignSelf: "stretch",
        textAlign: "center",
        fontSize: 9,
        color: "#B8C4D4",
        marginTop: 2,
    },
});