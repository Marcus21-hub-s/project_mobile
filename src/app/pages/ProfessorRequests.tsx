import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { buscarAulasDaSemana } from "../api/aulasService";
import { buscarSalasParaTroca } from "../api/requestService";
import AulaResumoCard from "../components/AulaResumoCard";
import ClassSelectionModal from "../components/ClassSelectionModal";
import SolicitacaoCard from "../components/RequestCard";
import Selo from "../components/Selo";
import { COR } from "../data/cores";
import type { Aula } from "../data/entities/aula";
import type { Sala } from "../data/entities/sala";
import type { Solicitacao } from "../data/entities/solicitacao";
import { encontrarProximaAula, inicioDaSemana } from "../data/formatacao";

import { useAuth } from '../api/authContext';

/**
 * A aula chega pela navegação como texto JSON no parâmetro `aula`, por exemplo:
 *   router.push({ pathname: "/pages/ProfessorRequests", params: { aula: JSON.stringify(aula) } })
 * Devolve null se o parâmetro não existir ou estiver inválido.
 */
const lerAula = (param?: string): Aula | null => {
    if (!param) return null;
    try {
        return JSON.parse(param) as Aula;
    } catch (e) {
        return null;
    }
};

export default function ProfessorRequests() {
    const { aula: aulaParam } = useLocalSearchParams<{ aula?: string }>();

    // Aula recebida pela navegação; se não vier nenhuma (ex.: abrir pela aba "Trocas"),
    // usa a aula em andamento / mais próxima da semana
    const aulaDoParam = useMemo(() => lerAula(aulaParam), [aulaParam]);
    const [aulaProxima, setAulaProxima] = useState<Aula | null>(null);
    const aula = aulaDoParam ?? aulaProxima;

    const [salas, setSalas] = useState<Sala[]>([]);
    const [sala, setSala] = useState<Sala | null>(null);
    const [erroSalas, setErroSalas] = useState(false);
    const [motivo, setMotivo] = useState("");
    const [modalVisivel, setModalVisivel] = useState(false);

    const {professor} = useAuth();

    // Sem aula no parâmetro: busca a mais próxima
    useEffect(() => {
        if (aulaDoParam) return;
        let cancelado = false;

        (async () => {
            try {
                const aulas = await buscarAulasDaSemana(inicioDaSemana(new Date()), professor?.id);
                if (!cancelado) setAulaProxima(encontrarProximaAula(aulas, new Date())?.aula ?? null);
            } catch (e) {
                console.log("Erro buscando a aula mais próxima", e);
            }
        })();

        return () => {
            cancelado = true;
        };
    }, [aulaDoParam]);

    // Carrega as salas possíveis sempre que a aula muda (e limpa a sala escolhida antes)
    useEffect(() => {
        if (!aula) return;
        let cancelado = false;
        setSala(null);
        setErroSalas(false);

        buscarSalasParaTroca(aula)
            .then((resultado) => {
                if (!cancelado) setSalas(resultado);
            })
            .catch(() => {
                if (!cancelado) setErroSalas(true);
            });

        return () => {
            cancelado = true;
        };
    }, [aula]);

    // Alunos da turma (se a aula trouxer a turma) para comparar com a capacidade da sala
    const alunos = aula?.turma?.qtd_alunos;
    const cabe = sala && alunos !== undefined ? sala.capacidade >= alunos : true;

    // TODO: enviar a solicitação quando a tabela de solicitações estiver pronta.
    // Dados disponíveis aqui: aula (aula.id), sala (sala.id, a sala desejada), motivo
    // e, pelo contexto (useAuth), o professor logado (professor.id).
    const enviarSolicitacao = () => { };

    // TODO: carregar da tabela de solicitações do professor. Por enquanto são dois
    // cards vazios (null), só para mostrar o layout.
    const solicitacoes: (Solicitacao | null)[] = [null, null];

    return (
        <SafeAreaView style={styles.tela}>
            <StatusBar barStyle="dark-content" />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.conteudo}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Topo */}
                    <View style={styles.topo}>
                        <Text style={styles.titulo}>Solicitar troca</Text>
                        <Text style={styles.subtitulo}>A coordenação analisa e responde</Text>
                    </View>

                    {/* Aula para a qual a troca será pedida */}
                    {aula ? (
                        <AulaResumoCard aula={aula} />
                    ) : (
                        <View style={styles.semAula}>
                            <Text style={styles.semAulaTexto}>
                                Nenhuma aula selecionada. Escolha uma aula em "Minhas aulas" para pedir a troca.
                            </Text>
                        </View>
                    )}

                    {/* Sala desejada */}
                    <Text style={styles.rotulo}>Sala desejada</Text>
                    <Pressable
                        onPress={() => setModalVisivel(true)}
                        disabled={!aula}
                        style={({ pressed }) => [styles.select, pressed && styles.selectPressionado]}
                        accessibilityRole="button"
                        accessibilityLabel="Selecionar a sala desejada"
                    >
                        <Text style={[styles.selectTexto, !sala && styles.selectPlaceholder]} numberOfLines={1}>
                            {sala ? `${sala.nome} · Bloco ${sala.bloco}` : "Selecione a sala"}
                        </Text>
                        <Text style={styles.chevron}>›</Text>
                    </Pressable>

                    {erroSalas && (
                        <Text style={styles.erroTexto}>Não foi possível carregar as salas.</Text>
                    )}

                    {/* Situação da sala escolhida: disponibilidade e capacidade */}
                    {sala && (
                        <View style={styles.selos}>
                            <Selo
                                texto={sala.ocupada ? "Ocupada neste horário" : "Livre neste horário"}
                                tom={sala.ocupada ? "erro" : "sucesso"}
                            />
                            {alunos !== undefined ? (
                                <Selo
                                    texto={
                                        cabe
                                            ? `Capacidade ${sala.capacidade} para ${alunos} alunos`
                                            : `Capacidade ${sala.capacidade} para ${alunos} alunos (aviso)`
                                    }
                                    tom={cabe ? "sucesso" : "aviso"}
                                />
                            ) : (
                                <Selo texto={`Capacidade ${sala.capacidade}`} />
                            )}
                        </View>
                    )}

                    {/* Motivo */}
                    <Text style={styles.rotulo}>Motivo</Text>
                    <TextInput
                        style={styles.motivo}
                        value={motivo}
                        onChangeText={setMotivo}
                        placeholder="Descreva o motivo da troca"
                        placeholderTextColor={COR.tintaSuave}
                        multiline
                        textAlignVertical="top"
                        maxLength={500}
                    />

                    {/* Aviso */}
                    <View style={styles.aviso}>
                        <Text style={styles.avisoTitulo}>Só a coordenação altera o ensalamento.</Text>
                        <Text style={styles.avisoTexto}>Você será avisado da resposta.</Text>
                    </View>

                    {/* Envio (sem funcionalidade por enquanto) */}
                    <Pressable
                        onPress={enviarSolicitacao}
                        style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
                        accessibilityRole="button"
                    >
                        <Text style={styles.botaoTexto}>Enviar solicitação</Text>
                    </Pressable>

                    {/* Minhas solicitações */}
                    <Text style={styles.secao}>Minhas solicitações</Text>
                    <View style={styles.lista}>
                        {solicitacoes.map((solicitacao, i) => (
                            <SolicitacaoCard key={solicitacao?.id ?? `vazio-${i}`} solicitacao={solicitacao} />
                        ))}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Escolha da sala: reaproveita o modal que já existia */}
            <ClassSelectionModal
                isVisible={modalVisivel}
                onClose={() => setModalVisivel(false)}
                rooms={salas}
                onSelectRoom={(escolhida) => {
                    setSala(escolhida);
                    setModalVisivel(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: COR.fundo },
    flex: { flex: 1 },
    conteudo: { padding: 16, paddingBottom: 40 },

    // Topo
    topo: { marginBottom: 16 },
    titulo: { fontSize: 26, fontWeight: "700", color: COR.tinta },
    subtitulo: { fontSize: 13, color: COR.tintaSuave, marginTop: 2 },

    // Sem aula selecionada
    semAula: {
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: COR.linha,
    },
    semAulaTexto: { fontSize: 14, color: COR.tintaSuave },

    // Rótulos dos campos
    rotulo: { fontSize: 14, fontWeight: "700", color: COR.tinta, marginTop: 18, marginBottom: 8 },

    // Campo "Sala desejada" (abre o modal)
    select: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        backgroundColor: COR.superficie,
        borderWidth: 1,
        borderColor: COR.linha,
        borderRadius: 14,
    },
    selectPressionado: { opacity: 0.7 },
    selectTexto: { flex: 1, fontSize: 15, fontWeight: "600", color: COR.tinta },
    selectPlaceholder: { fontWeight: "400", color: COR.tintaSuave },
    // O mesmo "›" das setas do app, girado para apontar para baixo
    chevron: { fontSize: 24, lineHeight: 26, color: COR.tintaSuave, transform: [{ rotate: "90deg" }] },
    erroTexto: { fontSize: 12, color: "#B02A27", marginTop: 6 },

    // Selos de disponibilidade e capacidade
    selos: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },

    // Campo "Motivo"
    motivo: {
        minHeight: 110,
        padding: 14,
        backgroundColor: COR.superficie,
        borderWidth: 1,
        borderColor: COR.linha,
        borderRadius: 14,
        fontSize: 15,
        color: COR.tinta,
    },

    // Aviso em azul claro
    aviso: {
        marginTop: 16,
        padding: 14,
        backgroundColor: "#E3EFFA",
        borderWidth: 1,
        borderColor: "#CFE2F5",
        borderRadius: 14,
    },
    avisoTitulo: { fontSize: 13, fontWeight: "700", color: COR.tinta },
    avisoTexto: { fontSize: 13, color: COR.tintaSuave, marginTop: 2 },

    // Botão de envio
    botao: {
        height: 54,
        marginTop: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COR.destaque,
        borderRadius: 14,
    },
    botaoPressionado: { opacity: 0.85 },
    botaoTexto: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },

    // Minhas solicitações
    secao: { fontSize: 18, fontWeight: "700", color: COR.tinta, marginTop: 28, marginBottom: 12 },
    lista: { gap: 10 },
});