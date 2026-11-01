import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { COR } from "../data/cores";
import type { Sala } from "../data/sala";
import ClassCard from "./ClassCard";


type ModalProps = {
    isVisible: boolean;
    onClose: () => void;
    rooms: Sala[];
    onSelectRoom: (room: Sala) => void;
};

export default function ClassSelectionModal({
    isVisible,
    onClose,
    rooms,
    onSelectRoom,
}: ModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.modalView}>

                    {/* Botão de fechar */}
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>

                    {/* Título */}
                    <Text style={styles.title}>
                        Selecione a sala para socilitar a troca
                    </Text>

                    {/* Lista de salas */}
                    <FlatList
                        data={rooms}
                        keyExtractor={(item) => String(item.id)}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={true}
                        renderItem={({ item }) => (
                            <ClassCard
                                room={item}
                                onPress={() => onSelectRoom(item)}
                            />
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                Nenhuma sala encontrada. Por favor, informe a coordenação sobre o problema
                            </Text>
                        }
                    />

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    // Fundo escurecido com o tom da tinta da tela (em vez de preto puro)
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(18, 38, 63, 0.55)",
    },

    // Folha branca com borda fina, igual aos cartões de aula
    modalView: {
        width: "90%",
        height: "75%",
        backgroundColor: COR.superficie,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COR.linha,
        paddingHorizontal: 20,
        paddingTop: 64,
        paddingBottom: 20,
        elevation: 5,
        shadowColor: COR.tinta,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: COR.tinta,
        textAlign: "center",
        marginBottom: 16,
    },

    list: {
        paddingBottom: 10,
        paddingVertical: 12,
    },

    row: {
        justifyContent: "space-evenly",
    },

    emptyText: {
        textAlign: "center",
        color: COR.tintaSuave,
        fontSize: 15,
        marginTop: 30,
    },

    // Botão redondo, no mesmo estilo das setas de semana
    closeButton: {
        position: "absolute",
        top: 12,
        right: 12,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COR.superficie,
        borderWidth: 1,
        borderColor: COR.linha,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },

    closeButtonText: {
        fontSize: 28,
        fontWeight: "600",
        color: COR.tinta,
        lineHeight: 30,
    },
});