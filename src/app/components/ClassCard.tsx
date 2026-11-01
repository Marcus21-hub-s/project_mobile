import {
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

import { COR } from "../data/cores";
import type { Sala } from "../data/sala";

type ClassCardProps = {
    room: Sala;
    onPress: () => void;
};

export default function ClassCard({
    room,
    onPress,
}: ClassCardProps) {
    return (
        <TouchableOpacity
            style={[
                styles.card,
                room.ocupada && styles.occupiedCard
            ]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            

            {/* numberOfLines + adjustsFontSizeToFit: o card não cresce, a fonte diminui até minimumFontScale */}
            <Text
                style={[styles.cardText, room.ocupada && styles.occupiedCardText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
            >
                {room.nome}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    // Sala livre: cartão branco com borda fina e faixa colorida, como os cartões de aula
    card: {
        width: "37%",
        aspectRatio: 1.25,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COR.superficie,
        borderRadius: 14,
        borderWidth: 3,
        borderColor: COR.tinta,
        overflow: "hidden",
        marginBottom: 14,
    },
    // Sala ocupada: só sobrescreve o que muda (fundo da tela, borda tracejada, faixa e texto suaves)
    occupiedCard: {
        backgroundColor: COR.fundo,
        borderStyle: "dashed",
    },
    occupiedStrip: {
        backgroundColor: COR.linha,
    },

    // flex: 1 dá ao texto uma largura limitada (o que o adjustsFontSizeToFit precisa para encolher)
    cardText: {
        flex: 1,
        paddingHorizontal: 8,
        textAlign: "center",
        color: COR.tinta,
        fontSize: 26,
        fontWeight: "800",
    },
    occupiedCardText: {
        color: COR.tintaSuave,
    },
});