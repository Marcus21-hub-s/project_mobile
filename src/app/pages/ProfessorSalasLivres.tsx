import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../../api/authContext";
import { buscarSalasNoHorario } from "../../../api/salasService";
import OfflineBanner from "../../../components/OfflineBanner";
import CampoSeletor from "../../../components/salasLivres/CampoSeletor";
import FiltroChip from "../../../components/salasLivres/FiltroChip";
import SalaLivreCard from "../../../components/salasLivres/SalasLivreCard";
import SeletorModal, { OpcaoSeletor } from "../../../components/salasLivres/SeletorModal";
import { COR } from "../../../data/cores";
import { DIAS_ABREV, MESES_ABREV } from "../../../data/ensalamento";
import type { Sala } from "../../../data/entities/sala";
import { iniciais, paraISO, somarDias } from "../../../data/formatacao";

const QTD_DIAS_CONSULTA = 7; // hoje + os 6 dias seguintes

// Horários de 30 em 30 minutos, de 07:00 a 22:00
const HORARIOS: OpcaoSeletor[] = Array.from({ length: 31 }, (_, i) => {
    const minutos = 7 * 60 + i * 30;
    const hora = `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
    return { valor: hora, rotulo: hora };
});

// Hora inicial do campo: a hora atual, limitada ao intervalo da lista acima
const horaInicial = (): string => {
    const h = Math.min(22, Math.max(7, new Date().getHours()));
    return `${String(h).padStart(2, "0")}:00`;
};

export default function ProfessorSalasLivres() {
    const { professor } = useAuth();

    const [data, setData] = useState(() => paraISO(new Date()));
    const [hora, setHora] = useState(horaInicial);
    const [filtros, setFiltros] = useState<string[]>([]);
    const [salas, setSalas] = useState<Sala[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState(false);
    const [modalDia, setModalDia] = useState(false);
    const [modalHora, setModalHora] = useState(false);

    // Os próximos dias que podem ser consultados
    const opcoesDia = useMemo<OpcaoSeletor[]>(() => {
        const hoje = new Date();
        return Array.from({ length: QTD_DIAS_CONSULTA }, (_, i) => {
            const d = somarDias(hoje, i);
            return {
                valor: paraISO(d),
                rotulo: `${DIAS_ABREV[d.getDay()]} ${d.getDate()} ${MESES_ABREV[d.getMonth()]}`,
            };
        });
    }, []);
    const rotuloDia = opcoesDia.find((o) => o.valor === data)?.rotulo ?? data;

    // Número da busca mais recente: respostas de buscas antigas são descartadas
    const requisicao = useRef(0);

    /**
     * Busca as salas no dia e na hora escolhidos (a consulta está em api/salasService.ts).
     * manual = true: puxar para atualizar (mantém a lista na tela); false: mudou dia/hora.
     */
    const buscar = useCallback(async (manual: boolean) => {
        const id = ++requisicao.current;
        if (manual) setAtualizando(true);
        else setCarregando(true);
        setErro(false);
        try {
            const resultado = await buscarSalasNoHorario(data, hora);
            if (id !== requisicao.current) return; // resposta de uma busca antiga
            setSalas(resultado);
        } catch (e) {
            if (id !== requisicao.current) return;
            setErro(true);
        } finally {
            // só a busca mais recente desliga os indicadores
            if (id === requisicao.current) {
                setCarregando(false);
                setAtualizando(false);
            }
        }
    }, [data, hora]);

    // Busca de novo sempre que o dia ou a hora mudam (e na primeira vez que a tela abre)
    useEffect(() => {
        buscar(false);
    }, [buscar]);

    // Filtros possíveis: os recursos que existem nas salas, do mais comum para o menos comum.
    // Usa todas as salas (inclusive ocupadas) para a lista de chips não mudar com o horário.
    const opcoesFiltro = useMemo(() => {
        const contagem = new Map<string, number>();
        salas.forEach((s) =>
            (s.recursos ?? []).forEach((r) => contagem.set(r, (contagem.get(r) ?? 0) + 1)),
        );
        return [...contagem.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .map(([recurso]) => recurso);
    }, [salas]);

    const alternarFiltro = (recurso: string) =>
        setFiltros((atual) =>
            atual.includes(recurso) ? atual.filter((f) => f !== recurso) : [...atual, recurso],
        );

    // Salas livres que têm TODOS os recursos filtrados
    const livres = useMemo(
        () =>
            salas.filter(
                (s) => !s.ocupada && filtros.every((f) => (s.recursos ?? []).includes(f)),
            ),
        [salas, filtros],
    );

    // TODO: solicitar a sala quando a tabela de solicitações estiver pronta.
    // Dados disponíveis aqui: sala (sala.id), data e hora escolhidas e, pelo contexto
    // (useAuth), o professor logado (professor.id).
    const solicitarSala = (_sala: Sala) => { };

    const contagem = carregando
        ? "Buscando salas livres..."
        : erro
            ? ""
            : livres.length === 0
                ? `Nenhuma sala livre às ${hora}`
                : `${livres.length} ${livres.length === 1 ? "sala livre" : "salas livres"} às ${hora}`;

    const cabecalho = (
        <View>
            <OfflineBanner text="Não é possível consultar as salas livres até haver conexão" />

            {/* Topo: título + subtítulo à esquerda, avatar com as iniciais à direita */}
            <View style={styles.topo}>
                <View style={styles.topoTextos}>
                    <Text style={styles.titulo}>Salas livres</Text>
                    <Text style={styles.subtitulo}>Consulte e peça a sala que precisa</Text>
                </View>

                <View style={styles.avatar} accessibilityLabel={`Professor ${professor?.nome ?? ""}`}>
                    <Text style={styles.avatarTexto}>{iniciais(professor?.nome)}</Text>
                </View>
            </View>

            {/* Dia e hora da consulta */}
            <View style={styles.campos}>
                <CampoSeletor rotulo="Dia" valor={rotuloDia} onPress={() => setModalDia(true)} />
                <CampoSeletor rotulo="Hora" valor={hora} onPress={() => setModalHora(true)} />
            </View>

            {/* Filtros por recurso (só aparecem se as salas tiverem recursos cadastrados) */}
            {opcoesFiltro.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.chips}
                    style={styles.chipsBox}
                >
                    {opcoesFiltro.map((recurso) => (
                        <FiltroChip
                            key={recurso}
                            texto={recurso}
                            ativo={filtros.includes(recurso)}
                            onPress={() => alternarFiltro(recurso)}
                        />
                    ))}
                </ScrollView>
            )}

            {contagem !== "" && <Text style={styles.contagem}>{contagem}</Text>}
        </View>
    );

    return (
        <SafeAreaView style={styles.tela} edges={["top"]}>
            <StatusBar barStyle="dark-content" />

            <FlatList
                data={carregando ? [] : livres}
                keyExtractor={(sala) => String(sala.id)}
                renderItem={({ item }) => <SalaLivreCard sala={item} onSolicitar={solicitarSala} />}
                ItemSeparatorComponent={() => <View style={styles.separador} />}
                ListHeaderComponent={cabecalho}
                contentContainerStyle={styles.lista}
                showsVerticalScrollIndicator={false}
                refreshing={atualizando}
                onRefresh={() => buscar(true)}
                ListEmptyComponent={
                    carregando ? (
                        <ActivityIndicator style={styles.espaco} size="large" color={COR.destaque} />
                    ) : erro ? (
                        <View style={styles.espaco}>
                            <Text style={styles.mensagem}>Não foi possível carregar as salas.</Text>
                            <Pressable style={styles.botaoTentar} onPress={() => buscar(false)} accessibilityRole="button">
                                <Text style={styles.botaoTentarTexto}>Tentar de novo</Text>
                            </Pressable>
                        </View>
                    ) : (
                        <Text style={[styles.mensagem, styles.espaco]}>
                            Nenhuma sala livre nesse horário. Tente outro dia ou horário.
                        </Text>
                    )
                }
            />

            <SeletorModal
                isVisible={modalDia}
                titulo="Escolha o dia"
                opcoes={opcoesDia}
                valorSelecionado={data}
                onSelect={(valor) => {
                    setData(valor);
                    setModalDia(false);
                }}
                onClose={() => setModalDia(false)}
            />

            <SeletorModal
                isVisible={modalHora}
                titulo="Escolha a hora"
                opcoes={HORARIOS}
                valorSelecionado={hora}
                onSelect={(valor) => {
                    setHora(valor);
                    setModalHora(false);
                }}
                onClose={() => setModalHora(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: COR.fundo },
    lista: { flexGrow: 1, padding: 16, paddingBottom: 32 },
    separador: { height: 12 },

    // Topo
    topo: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    topoTextos: { flexShrink: 1 },
    titulo: { fontSize: 26, fontWeight: "700", color: COR.tinta },
    subtitulo: { fontSize: 13, color: COR.tintaSuave, marginTop: 2 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COR.destaque,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarTexto: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },

    // Dia e hora
    campos: { flexDirection: "row", gap: 10, marginTop: 16 },

    // Filtros
    chipsBox: { marginTop: 14, marginHorizontal: -16 }, // vai até as bordas da tela
    chips: { gap: 8, paddingHorizontal: 16 },

    contagem: { fontSize: 13, color: COR.tintaSuave, marginTop: 16, marginBottom: 12 },

    // Lista vazia / carregando / erro
    espaco: { marginTop: 40, alignItems: "center" },
    mensagem: { fontSize: 15, color: COR.tintaSuave, textAlign: "center" },
    botaoTentar: {
        marginTop: 16,
        backgroundColor: COR.tinta,
        borderRadius: 14,
        paddingHorizontal: 22,
        paddingVertical: 12,
    },
    botaoTentarTexto: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
});