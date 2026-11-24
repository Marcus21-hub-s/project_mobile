import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity } from "react-native";

import { COR } from "../../data/cores";

/** Uma opção da lista: `valor` é o que a tela guarda, `rotulo` é o que aparece. */
export type OpcaoSeletor = {
    valor: string;
    rotulo: string;
};

type SeletorModalProps = {
    isVisible: boolean;
    titulo: string;
    opcoes: OpcaoSeletor[];
    valorSelecionado: string;
    onSelect: (valor: string) => void;
    onClose: () => void;
};

const ALTURA_ITEM = 52; // fixa, para a lista abrir já rolada até a opção atual

/** Lista de opções em um modal (mesmo visual do modal de escolha de sala). */
export default function SeletorModal({
    isVisible,
    titulo,
    opcoes,
    valorSelecionado,
    onSelect,
    onClose,
}: SeletorModalProps) {
    const indiceAtual = Math.max(0, opcoes.findIndex((o) => o.valor === valorSelecionado));

    return (
        <Modal animationType="fade" transparent visible={isVisible} onRequestClose={onClose}>
            {/* Tocar fora da folha fecha o modal */}
            <Pressable style={styles.fundo} onPress={onClose}>
                {/* Pressable vazio: impede que o toque dentro da folha feche o modal */}
                <Pressable style={styles.folha} onPress={() => { }}>
                    <TouchableOpacity onPress={onClose} style={styles.fechar} activeOpacity={0.6}>
                        <Text style={styles.fecharTexto}>×</Text>
                    </TouchableOpacity>

                    <Text style={styles.titulo}>{titulo}</Text>

                    <FlatList
                        data={opcoes}
                        keyExtractor={(opcao) => opcao.valor}
                        initialScrollIndex={indiceAtual}
                        getItemLayout={(_, index) => ({ length: ALTURA_ITEM, offset: ALTURA_ITEM * index, index })}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const selecionada = item.valor === valorSelecionado;
                            return (
                                <Pressable
                                    onPress={() => onSelect(item.valor)}
                                    style={[styles.opcao, selecionada && styles.opcaoSelecionada]}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: selecionada }}
                                >
                                    <Text style={[styles.opcaoTexto, selecionada && styles.opcaoTextoSelecionada]}>
                                        {item.rotulo}
                                    </Text>
                                    {selecionada && <Text style={styles.check}>✓</Text>}
                                </Pressable>
                            );
                        }}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    fundo: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(18, 38, 63, 0.55)",
    },
    folha: {
        width: "80%",
        maxHeight: "65%",
        backgroundColor: COR.superficie,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COR.linha,
        paddingHorizontal: 12,
        paddingTop: 20,
        paddingBottom: 12,
        elevation: 5,
        shadowColor: COR.tinta,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    titulo: {
        fontSize: 18,
        fontWeight: "700",
        color: COR.tinta,
        marginLeft: 8,
        marginRight: 56, // espaço para o botão de fechar
        marginBottom: 12,
    },
    fechar: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COR.superficie,
        borderWidth: 1,
        borderColor: COR.linha,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    fecharTexto: { fontSize: 26, fontWeight: "600", color: COR.tinta, lineHeight: 28 },

    opcao: {
        height: ALTURA_ITEM,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    opcaoSelecionada: { backgroundColor: "rgba(14, 124, 134, 0.1)" },
    opcaoTexto: { fontSize: 16, color: COR.tinta },
    opcaoTextoSelecionada: { fontWeight: "700", color: COR.destaque },
    check: { fontSize: 18, fontWeight: "700", color: COR.destaque },
});