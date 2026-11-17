import { useEffect, useState } from "react";
import { FlatList, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../../api/authContext";
import { buscarAvisos } from "../../../api/avisosService";
import AvisoCard from "../../../components/AvisoCard";
import { COR } from "../../../data/cores";
import type { Aviso } from "../../../data/entities/aviso";
import { iniciais } from "../../../data/formatacao";

export default function ProfessorAvisos() {
    const { professor } = useAuth();
    const [avisos, setAvisos] = useState<Aviso[]>([]);

    // Carrega os avisos do professor logado (a busca em si está em api/avisosService.ts)
    useEffect(() => {
        let ativo = true; // evita atualizar o estado se a tela já foi fechada

        buscarAvisos(professor?.id).then((dados) => {
            if (ativo) setAvisos(dados);
        });

        return () => {
            ativo = false;
        };
    }, [professor?.id]);

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

            <FlatList
                data={avisos}
                keyExtractor={(aviso) => String(aviso.id)}
                renderItem={({ item }) => <AvisoCard aviso={item} />}
                ItemSeparatorComponent={() => <View style={styles.separador} />}
                contentContainerStyle={styles.listaConteudo}
            />
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
    listaConteudo: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 32,
    },
    separador: {
        height: 14,
    },
});
