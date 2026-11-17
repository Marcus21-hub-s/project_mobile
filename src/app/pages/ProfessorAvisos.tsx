import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../../api/authContext";
import { buscarAvisos } from "../../../api/avisosService";
import AvisoCard from "../../../components/AvisoCard";
import { COR } from "../../../data/cores";
import { DIAS_PARA_SER_NOVO, contarNaoLidos } from "../../../data/entities/aviso";
import type { Aviso } from "../../../data/entities/aviso";
import { ehRecente, iniciais } from "../../../data/formatacao";

type Aba = "novos" | "anteriores";

const MENSAGEM_ERRO = "Não foi possível carregar os avisos.";

export default function ProfessorAvisos() {
    const { professor } = useAuth();
    const idProfessor = professor?.id;
    const [avisos, setAvisos] = useState<Aviso[]>([]);
    const [aba, setAba] = useState<Aba>("novos");
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    // Primeira carga da tela (a busca em si está em api/avisosService.ts)
    useEffect(() => {
        let ativo = true; // evita atualizar o estado se a tela já foi fechada

        buscarAvisos(idProfessor)
            .then((dados) => {
                if (ativo) setAvisos(dados);
            })
            .catch(() => {
                if (ativo) setErro(MENSAGEM_ERRO);
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });

        return () => {
            ativo = false;
        };
    }, [idProfessor]);

    // Busca de novo (puxar para atualizar ou "Tentar de novo")
    const recarregar = useCallback(async () => {
        setErro(null);
        try {
            setAvisos(await buscarAvisos(idProfessor));
        } catch {
            setErro(MENSAGEM_ERRO);
        } finally {
            setAtualizando(false);
            setCarregando(false);
        }
    }, [idProfessor]);

    const puxarParaAtualizar = () => {
        setAtualizando(true);
        recarregar();
    };

    const tentarDeNovo = () => {
        setCarregando(true);
        recarregar();
    };

    // Mais recentes primeiro; "Novos" = últimos dias, "Anteriores" = o resto
    const ordenados = [...avisos].sort(
        (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime(),
    );
    const novos = ordenados.filter((a) => ehRecente(a.criadoEm, DIAS_PARA_SER_NOVO));
    const anteriores = ordenados.filter((a) => !ehRecente(a.criadoEm, DIAS_PARA_SER_NOVO));
    const naoLidos = contarNaoLidos(avisos);

    return (
        <SafeAreaView style={styles.tela} edges={["top"]}>
            <StatusBar barStyle="dark-content" />

            {/* Topo: título + subtítulo à esquerda, avatar com as iniciais à direita */}
            <View style={styles.topo}>
                <View style={styles.topoTextos}>
                    <Text style={styles.titulo}>Avisos</Text>
                    <Text style={styles.subtitulo}>Trocas de sala que afetam você</Text>
                </View>

                <View style={styles.avatar} accessibilityLabel={`Professor ${professor?.nome ?? ""}`}>
                    <Text style={styles.avatarTexto}>{iniciais(professor?.nome)}</Text>
                </View>
            </View>

            {/* Abas: "Novos" (com o número de avisos não lidos) e "Anteriores" */}
            <View style={styles.abas} accessibilityRole="tablist">
                <Pressable
                    style={[styles.aba, aba === "novos" && styles.abaAtiva]}
                    onPress={() => setAba("novos")}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: aba === "novos" }}
                >
                    <Text style={[styles.abaTexto, aba === "novos" && styles.abaTextoAtivo]}>
                        {naoLidos > 0 ? `Novos ${naoLidos}` : "Novos"}
                    </Text>
                </Pressable>

                <Pressable
                    style={[styles.aba, aba === "anteriores" && styles.abaAtiva]}
                    onPress={() => setAba("anteriores")}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: aba === "anteriores" }}
                >
                    <Text style={[styles.abaTexto, aba === "anteriores" && styles.abaTextoAtivo]}>
                        Anteriores
                    </Text>
                </Pressable>
            </View>

            {carregando ? (
                <View style={styles.centro}>
                    <ActivityIndicator size="large" color={COR.destaque} />
                </View>
            ) : erro ? (
                <View style={styles.centro}>
                    <Text style={styles.mensagem}>{erro}</Text>
                    <Pressable style={styles.botaoTentar} onPress={tentarDeNovo} accessibilityRole="button">
                        <Text style={styles.botaoTentarTexto}>Tentar de novo</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={aba === "novos" ? novos : anteriores}
                    keyExtractor={(aviso) => String(aviso.id)}
                    renderItem={({ item }) => <AvisoCard aviso={item} />}
                    ItemSeparatorComponent={() => <View style={styles.separador} />}
                    contentContainerStyle={styles.listaConteudo}
                    refreshing={atualizando}
                    onRefresh={puxarParaAtualizar}
                    ListEmptyComponent={
                        <Text style={[styles.mensagem, styles.vazio]}>
                            {aba === "novos" ? "Nenhum aviso recente." : "Nenhum aviso anterior."}
                        </Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: {
        flex: 1,
        backgroundColor: COR.fundo,
    },
    topo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    topoTextos: {
        flexShrink: 1,
    },
    titulo: {
        fontSize: 28,
        fontWeight: "800",
        color: COR.tinta,
    },
    subtitulo: {
        marginTop: 2,
        fontSize: 14,
        color: COR.tintaSuave,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COR.destaque,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarTexto: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
    },
    // Linha cinza embaixo das abas; a aba ativa a cobre com o sublinhado
    abas: {
        flexDirection: "row",
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: COR.linha,
    },
    aba: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: -1,
        borderBottomWidth: 3,
        borderBottomColor: "transparent",
    },
    abaAtiva: {
        borderBottomColor: COR.destaque,
    },
    abaTexto: {
        fontSize: 15,
        fontWeight: "600",
        color: COR.tintaSuave,
    },
    abaTextoAtivo: {
        fontWeight: "700",
        color: COR.tinta,
    },
    listaConteudo: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 32,
    },
    separador: {
        height: 14,
    },
    centro: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    mensagem: {
        fontSize: 15,
        color: COR.tintaSuave,
        textAlign: "center",
    },
    vazio: {
        marginTop: 48,
    },
    botaoTentar: {
        marginTop: 16,
        backgroundColor: COR.tinta,
        borderRadius: 14,
        paddingHorizontal: 22,
        paddingVertical: 12,
    },
    botaoTentarTexto: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "600",
    },
});
