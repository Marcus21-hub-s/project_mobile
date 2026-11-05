import {
    StyleSheet,
    Text,
    View
} from "react-native";

import { COR } from "../data/cores";
import type { ProximaAula } from "../data/formatacao";

// Tom de verde-azulado mais claro, para ter contraste sobre o fundo escuro do card
const DESTAQUE_CLARO = "#5CD6D0";

type HeaderProps = {
    // Aula em andamento ou a mais próxima (calculada na ProfessorHome); null quando não resta aula
    proxima: ProximaAula | null;
};

/**
 * Card do topo da ProfessorHome: mostra a aula que está acontecendo agora
 * ou, se não houver, a próxima. (Componente reaproveitado do antigo Header.)
 */
export default function NextClassCard({ proxima }: HeaderProps) {
    if (!proxima) {
        return (
            <View style={[styles.card, styles.cardVazio]}>
                <Text style={styles.vazioTexto}>Sem mais aulas nesta semana</Text>
            </View>
        );
    }

    const { aula, emAndamento, rotulo, detalhe } = proxima;

    return (
        <View style={styles.card}>
            <View style={styles.info}>
                {/* Rótulo: "Agora" (verde-azulado) ou "Próxima aula" (amarelo) */}
                <View style={styles.rotuloLinha}>
                    <View style={[styles.rotuloPonto, !emAndamento && styles.rotuloPontoProxima]} />
                    <Text style={[styles.rotulo, !emAndamento && styles.rotuloProxima]}>{rotulo}</Text>
                </View>

                <Text style={styles.disciplina} numberOfLines={2}>
                    {aula.disciplina.nome}
                </Text>
                <Text style={styles.horario} numberOfLines={1}>
                    {aula.horaInicio} – {aula.horaFim} · {aula.disciplina.curso.nome}
                </Text>
                <Text style={styles.detalhe} numberOfLines={1}>
                    {detalhe}
                </Text>
            </View>

            {/* Placa da sala: largura fixa; o nome encolhe para caber (mesma lógica da placa dos cartões) */}
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
        gap: 12,
        backgroundColor: COR.tinta,
        borderRadius: 20,
        padding: 16,
    },
    cardVazio: {
        justifyContent: "center",
        paddingVertical: 24,
    },
    vazioTexto: {
        color: "#B8C4D4",
        fontSize: 15,
        fontWeight: "600",
    },

    info: {
        flex: 1,
    },

    rotuloLinha: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 6,
    },
    rotuloPonto: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: DESTAQUE_CLARO,
    },
    rotuloPontoProxima: {
        backgroundColor: COR.hoje,
    },
    rotulo: {
        fontSize: 12,
        fontWeight: "700",
        color: DESTAQUE_CLARO,
    },
    rotuloProxima: {
        color: COR.hoje,
    },

    disciplina: {
        fontSize: 22,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    horario: {
        fontSize: 13,
        color: "#B8C4D4",
        marginTop: 4,
    },
    detalhe: {
        fontSize: 12,
        color: "#8FA0B8",
        marginTop: 8,
    },

    // Placa da sala em verde-azulado, como na imagem de referência
    placa: {
        width: 88,
        height: 76,
        borderRadius: 14,
        backgroundColor: COR.destaque,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    placaSala: {
        alignSelf: "stretch",
        textAlign: "center",
        fontSize: 22,
        fontWeight: "800",
        color: "#FFFFFF",
    },
    placaBloco: {
        alignSelf: "stretch",
        textAlign: "center",
        fontSize: 11,
        color: "#D6F0F2",
        marginTop: 2,
    },
});