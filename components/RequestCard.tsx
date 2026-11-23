import { StyleSheet, Text, View } from "react-native";

import { COR } from "../data/cores";
import type { Solicitacao, StatusSolicitacao } from "../data/entities/solicitacao";
import Selo, { TomSelo } from "./Selo";

// Texto e cor do selo para cada situação
const STATUS: Record<StatusSolicitacao, { texto: string; tom: TomSelo }> = {
    pendente: { texto: "Pendente", tom: "aviso" },
    aceito: { texto: "Aprovada", tom: "sucesso" },
    cancelada: { texto: "Recusada", tom: "erro" },
};

type SolicitacaoCardProps = {
    // Sem solicitação (null/undefined) o card aparece vazio, só com o layout
    solicitacao?: Solicitacao | null;
};

/** Card de uma solicitação em "Minhas solicitações". */
export default function SolicitacaoCard({ solicitacao }: SolicitacaoCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.info}>
                <Text style={styles.disciplina} numberOfLines={1}>
                    {solicitacao?.disciplina}
                </Text>
                <Text style={styles.detalhe} numberOfLines={1}>
                    {solicitacao?.detalhe}
                </Text>
            </View>

            {solicitacao && (
                <Selo texto={STATUS[solicitacao.status].texto} tom={STATUS[solicitacao.status].tom} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        minHeight: 68, // mantém o tamanho mesmo com o card vazio
        backgroundColor: COR.superficie,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COR.linha,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    info: {
        flex: 1,
    },
    disciplina: {
        fontSize: 15,
        fontWeight: "700",
        color: COR.tinta,
    },
    detalhe: {
        fontSize: 12,
        color: COR.tintaSuave,
        marginTop: 3,
    },
});