import { Pressable, StyleSheet, Text, View } from "react-native";

import Selo, { TomSelo } from "../components/avisos/Selo";
import { COR } from "../data/cores";
import type { Aviso, TipoAviso } from "../data/entities/aviso";
import { tempoRelativo } from "../data/formatacao";

// Texto e cor do selo para cada tipo de aviso
const TIPO: Record<TipoAviso, { texto: string; tom: TomSelo }> = {
    sala_alterada: { texto: "Sala alterada", tom: "aviso" },
    solicitacao_aprovada: { texto: "Solicitação aprovada", tom: "sucesso" },
    solicitacao_recusada: { texto: "Solicitação recusada", tom: "erro" },
};

type AvisoCardProps = {
    aviso: Aviso;
    /** Chamado ao tocar no card (a tela usa para marcar como lido). */
    onPress?: (aviso: Aviso) => void;
};

/** Card de um aviso de troca de sala: selo, aula, sala antiga → sala nova e motivo. */
export default function AvisoCard({ aviso, onPress }: AvisoCardProps) {
    const tipo = TIPO[aviso.tipo];

    // Linha de rodapé: "Projetor com defeito · Coordenação · há 12 min" (origem é opcional)
    const rodape = [aviso.motivo, aviso.origem, tempoRelativo(aviso.criadoEm)]
        .filter(Boolean)
        .join(" · ");

    return (
        <Pressable
            style={styles.card}
            onPress={() => onPress?.(aviso)}
            accessibilityRole="button"
            accessibilityLabel={
                `${tipo.texto}. ${aviso.disciplina}, turma ${aviso.turma}, ${aviso.diaSemana} ${aviso.horaInicio}. ` +
                `Da sala ${aviso.salaOrigem} para a sala ${aviso.salaDestino}. ${rodape}.` +
                (aviso.lido ? "" : " Não lido.")
            }
        >
            <View style={styles.topo}>
                <Selo texto={tipo.texto} tom={tipo.tom} />
                {!aviso.lido && <View style={styles.pontoNaoLido} />}
            </View>

            <Text style={styles.titulo}>
                {aviso.disciplina} · {aviso.turma} · {aviso.diaSemana} {aviso.horaInicio}
            </Text>

            <View style={styles.salas}>
                <View style={[styles.sala, styles.salaOrigem]}>
                    <Text style={styles.salaTexto}>{aviso.salaOrigem}</Text>
                </View>

                <Text style={styles.seta}>→</Text>

                <View style={[styles.sala, styles.salaDestino]}>
                    <Text style={styles.salaTexto}>{aviso.salaDestino}</Text>
                </View>
            </View>

            <Text style={styles.rodape}>{rodape}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COR.superficie,
        borderRadius: 16,
        padding: 16,
    },
    topo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pontoNaoLido: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COR.destaque,
    },
    titulo: {
        marginTop: 10,
        fontSize: 15,
        fontWeight: "700",
        color: COR.tinta,
    },
    salas: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginTop: 10,
    },
    sala: {
        minWidth: 64,
        height: 32,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    salaOrigem: {
        backgroundColor: COR.tinta,
    },
    salaDestino: {
        backgroundColor: COR.destaque,
    },
    salaTexto: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    seta: {
        fontSize: 16,
        fontWeight: "700",
        color: COR.destaque,
    },
    rodape: {
        marginTop: 10,
        fontSize: 12,
        color: COR.tintaSuave,
    },
});
