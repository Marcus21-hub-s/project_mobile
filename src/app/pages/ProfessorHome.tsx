import { useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import {
    ActivityIndicator,
    Alert,
    BackHandler,
    LayoutChangeEvent,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
    useWindowDimensions
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarAulasDoMes } from '../../../api/aulasService';
import { useAuth } from '../../../api/authContext';
import NextClassCard from '../../../components/home/NextClassCard';
import OfflineBanner from '../../../components/OfflineBanner';
import { COR } from '../../../data/cores';
import { DIAS_ABREV, DIAS_COMPLETO, LARGURA_TABLET, MESES_ABREV, QTD_DIAS } from '../../../data/ensalamento';
import type { Aula, AulasPorDia } from '../../../data/entities/aula';
import { deISO, diaDeReferencia, encontrarProximaAula, formatarIntervalo, formatarIntervaloCurto, inicioDaSemana, mesISO, paraISO, somarDias } from '../../../data/formatacao';
/* -------------------------------------------------------------------------- */
/*  TELA PRINCIPAL                                                            */
/* -------------------------------------------------------------------------- */

export default function ProfessorHome() {
    const { width } = useWindowDimensions();
    const ehTablet = width >= LARGURA_TABLET;
    // Relógio da tela: atualiza a cada 30 s (card do topo, "Hoje" e virada de dia/semana/mês)
    const [agora, setAgora] = useState(() => new Date());
    const hojeISO = paraISO(agora);

    // Dia que define o mês e a semana exibidos: hoje; no domingo (sem aulas), já é a segunda seguinte.
    // Depende só do dia (hojeISO), então não muda a cada tique do relógio.
    const referencia = useMemo(() => diaDeReferencia(deISO(hojeISO)), [hojeISO]);
    const mesExibido = mesISO(referencia); // "AAAA-MM": o único mês que a tela mostra
    const inicioBase = useMemo(() => inicioDaSemana(referencia), [referencia]); // primeira semana (a atual)

    // Semana exibida: começa na atual e só pode avançar até o fim do mês (ver mudarSemana)
    const [inicioSemana, setInicioSemana] = useState<Date>(inicioBase);
    const [diaSelecionado, setDiaSelecionado] = useState<string>(hojeISO);
    const [aulas, setAulas] = useState<Aula[]>([]); // aulas do MÊS inteiro
    const [carregando, setCarregando] = useState(false);
    const [atualizando, setAtualizando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const { professor, encerrarSessao } = useAuth();
    const professorId = professor?.id;

    const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
    // Guarda a posição vertical (y) de cada dia para o scroll ao tocar na faixa de dias.
    const posicoesDias = useRef<Record<string, number>>({});

    /** Os dias (Date) da semana exibida, só os que pertencem ao mês exibido. */
    const dias = useMemo(
        () => Array.from({ length: QTD_DIAS }, (_, i) => somarDias(inicioSemana, i))
            .filter((d) => mesISO(d) === mesExibido),
        [inicioSemana, mesExibido],
    );

    /**
     * Busca as aulas do MÊS inteiro (uma requisição) e guarda no cache; ver api/aulasService.ts.
     * Trocar de semana NÃO chama isto: as semanas são só recortes das aulas do mês já em memória.
     */
    const buscar = useCallback(async (comOverlay: boolean) => {
        if (comOverlay) setCarregando(true);
        else setAtualizando(true);
        setErro(null);
        try {
            setAulas(await buscarAulasDoMes(professorId, mesExibido));
        } catch (e) {
            setErro('Não foi possível carregar as aulas deste mês.');
        } finally {
            if (comOverlay) setCarregando(false);
            else setAtualizando(false);
        }
    }, [professorId, mesExibido]);

    // Carga inicial e "Tentar de novo". Continua sem ligação com o foco da tela
    const carregar = useCallback(() => buscar(true), [buscar]);

    const puxarParaAtualizar = useCallback(() => {
        setAgora(new Date());
        buscar(false);
    }, [buscar]);


    // Pedido de confirmação pra sair
    useFocusEffect(
        useCallback(() => {
            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                () => {
                    Alert.alert("Tem certeza que deseja sair?", null,
                        [
                            {
                                text: 'Cancelar',
                                onPress: () => null,
                                style: 'cancel',
                            },
                            {
                                text: 'Sim',
                                onPress: async () => {
                                    await encerrarSessao();
                                    router.replace("/");
                                },
                            }
                        ]

                    )
                    return true;
                }
            );
            return () => backHandler.remove();
        }, [encerrarSessao]));

    // Carrega o mês quando a tela é criada (e se o mês virar). Sem professor logado não pede nada
    useEffect(() => {
        if (professorId === undefined) return;
        carregar();
    }, [carregar, professorId]);

    // Se o dia virou e a semana-base mudou (ex.: domingo), volta para ela
    useEffect(() => {
        setInicioSemana(inicioBase);
    }, [inicioBase]);

    // Ao trocar de semana: volta ao topo e descarta as posições medidas da semana anterior
    useEffect(() => {
        posicoesDias.current = {};
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [inicioSemana]);

    // Seleciona hoje, se estiver na semana exibida; senão, o primeiro dia dela
    useEffect(() => {
        setDiaSelecionado(dias.some((d) => paraISO(d) === hojeISO) ? hojeISO : paraISO(dias[0]));
    }, [dias, hojeISO]);

    // Atualiza o relógio a cada 30 s (e limpa o intervalo ao sair da tela)
    useEffect(() => {
        const id = setInterval(() => setAgora(new Date()), 30000);
        return () => clearInterval(id);
    }, []);

    /** Agrupa e ordena as aulas por dia. */
    const aulasPorDia = useMemo<AulasPorDia>(() => {
        const mapa: AulasPorDia = {};
        aulas.forEach((a) => {
            (mapa[a.data] ??= []).push(a);
        });
        Object.values(mapa).forEach((lista) => lista.sort((x, y) => x.horaInicio.localeCompare(y.horaInicio)));
        return mapa;
    }, [aulas]);

    /** Aula em andamento ou a mais próxima, para o card do topo. */
    const proxima = useMemo(() => encontrarProximaAula(aulas, agora), [aulas, agora]);

    const nomeProfessor = professor?.nome;
    const intervaloCurto = formatarIntervaloCurto(dias[0], dias[dias.length - 1]);


    // Navegação entre semanas: só para frente e só dentro do mês exibido
    const semanaAtual = paraISO(inicioSemana) === paraISO(inicioBase);
    const podeVoltar = !semanaAtual; // a semana atual é a mais antiga permitida (o histórico fica em outra página)
    const podeAvancar = mesISO(somarDias(inicioSemana, 7)) === mesExibido; // a próxima segunda ainda é do mês?

    /** Troca de semana (delta = -1 anterior, +1 próxima); os limites acima valem aqui também. */
    const mudarSemana = (delta: 1 | -1) => {
        if (delta < 0 ? !podeVoltar : !podeAvancar) return;
        setInicioSemana(somarDias(inicioSemana, delta * 7));
    };

    /** Volta para a semana atual (a seleção do dia de hoje é refeita pelo efeito acima). */
    const irParaHoje = () => setInicioSemana(inicioBase);

    const selecionarDia = (iso: string) => {
        setDiaSelecionado(iso);
        scrollRef.current?.scrollTo({ y: posicoesDias.current[iso] ?? 0, animated: true });
    };

    return (
        <SafeAreaView style={styles.tela}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.cabecalho}>
                {/* Topo: título, professor + semana e avatar com as iniciais */}

                <OfflineBanner text="Você está vendo os últimos dados carregados"/> 

                <View style={styles.topo}>
                    <View style={styles.topoTextos}>
                        <Text style={styles.titulo}>Minhas aulas</Text>
                        <Text style={styles.subtitulo} numberOfLines={1}>
                            {nomeProfessor ? `Prof. ${nomeProfessor} · ` : ''}
                            {intervaloCurto}
                        </Text>
                    </View>

                    {/* Volta para a semana atual (só aparece em outras semanas) */}
                    {!semanaAtual && (
                        <Pressable onPress={irParaHoje} style={styles.botaoHoje} accessibilityRole="button">
                            <Text style={styles.botaoHojeTexto}>Voltar para hoje</Text>
                        </Pressable>
                    )}
                </View>

                {/* Card da aula em andamento / mais próxima (componente Header reaproveitado) */}
                <View style={styles.proximaBox}>
                    <NextClassCard proxima={proxima} />
                </View>

                {/* Navegação entre semanas: só para frente e só dentro do mês exibido */}
                <View style={styles.navegacaoSemana}>
                    <Pressable
                        onPress={() => mudarSemana(-1)}
                        disabled={!podeVoltar}
                        style={[styles.setaSemana, !podeVoltar && styles.setaDesativada]}
                        accessibilityRole="button"
                        accessibilityLabel="Semana anterior"
                        accessibilityState={{ disabled: !podeVoltar }}
                        hitSlop={8}
                    >
                        <Text style={styles.setaTexto}>‹</Text>
                    </Pressable>

                    <View style={styles.intervaloBox}>
                        <Text style={styles.intervalo}>{formatarIntervalo(dias[0], dias[dias.length - 1])}</Text>
                        <Text style={styles.intervaloLegenda}>{semanaAtual ? 'Esta semana' : 'Outra semana'}</Text>
                    </View>

                    <Pressable
                        onPress={() => mudarSemana(1)}
                        disabled={!podeAvancar}
                        style={[styles.setaSemana, !podeAvancar && styles.setaDesativada]}
                        accessibilityRole="button"
                        accessibilityLabel="Próxima semana"
                        accessibilityState={{ disabled: !podeAvancar }}
                        hitSlop={8}
                    >
                        <Text style={styles.setaTexto}>›</Text>
                    </Pressable>
                </View>

                {/* Faixa de dias: atalho para pular até o dia no scroll */}
                <View style={styles.faixaDias}>
                    {dias.map((d) => {
                        const iso = paraISO(d);
                        const selecionado = iso === diaSelecionado;
                        const ehHoje = iso === hojeISO;
                        const temAula = (aulasPorDia[iso]?.length ?? 0) > 0;
                        return (
                            <Pressable
                                key={iso}
                                onPress={() => selecionarDia(iso)}
                                style={[styles.chipDia, selecionado && styles.chipDiaSelecionado]}
                                accessibilityRole="button"
                                accessibilityLabel={`${DIAS_COMPLETO[d.getDay()]}, dia ${d.getDate()}`}
                            >
                                <Text style={[styles.chipSemana, selecionado && styles.chipTextoSelecionado]}>
                                    {DIAS_ABREV[d.getDay()]}
                                </Text>
                                <Text style={[styles.chipNumero, selecionado && styles.chipTextoSelecionado]}>{d.getDate()}</Text>
                                {/* Pontinho: amarelo = hoje; verde-azulado = há aula; vazio = sem aula */}
                                <View
                                    style={[
                                        styles.chipPonto,
                                        ehHoje
                                            ? { backgroundColor: COR.hoje }
                                            : temAula
                                                ? { backgroundColor: selecionado ? '#FFFFFF' : COR.destaque }
                                                : { backgroundColor: 'transparent' },
                                    ]}
                                />
                            </Pressable>
                        );
                    })}
                </View>
            </View>

            {/* Corpo: todos os dias da semana, um abaixo do outro (ou em grade no tablet) */}
            {erro ? (
                <View style={styles.centro}>
                    <Text style={styles.erroTexto}>{erro}</Text>
                    <Pressable onPress={carregar} style={styles.botaoTentar} accessibilityRole="button">
                        <Text style={styles.botaoTentarTexto}>Tentar de novo</Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={[styles.conteudo, ehTablet && styles.conteudoTablet]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={atualizando}
                            onRefresh={puxarParaAtualizar}
                            colors={[COR.destaque]}  // cor do indicador no Android
                            tintColor={COR.destaque} // cor do indicador no iOS
                        />}
                        >

                        {
                            dias.map((d) => {
                                const iso = paraISO(d);
                                return (
                                    <SecaoDia
                                        key={iso}
                                        data={d}
                                        ehHoje={iso === hojeISO}
                                        aulas={aulasPorDia[iso] ?? []}
                                        larguraTablet={ehTablet}
                                        aoMedir={(e: LayoutChangeEvent) => {
                                            posicoesDias.current[iso] = e.nativeEvent.layout.y;
                                        }}
                                    />
                                );
                            })
                        }
                </ScrollView>
    )
}

{
    carregando && (
        <View style={styles.carregando}>
            <ActivityIndicator color={COR.destaque} />
        </View>
    )
}
        </SafeAreaView >
    );
}

/* -------------------------------------------------------------------------- */
/*  COMPONENTES AUXILIARES                                                    */
/* -------------------------------------------------------------------------- */

type SecaoDiaProps = {
    data: Date;
    ehHoje: boolean;
    aulas: Aula[];
    larguraTablet: boolean;
    aoMedir: (e: LayoutChangeEvent) => void;
};

/** Um dia da semana: título + lista de aulas (ou aviso de dia livre). */
function SecaoDia({ data, ehHoje, aulas, larguraTablet, aoMedir }: SecaoDiaProps) {
    return (
        <View onLayout={aoMedir} style={[styles.secao, larguraTablet && styles.secaoTablet]}>
            <View style={styles.secaoTitulo}>
                <Text style={styles.secaoDia}>{DIAS_COMPLETO[data.getDay()]}</Text>
                <Text style={styles.secaoData}>
                    {data.getDate()} {MESES_ABREV[data.getMonth()]}
                </Text>
                {ehHoje && (
                    <View style={styles.selo}>
                        <Text style={styles.seloTexto}>Hoje</Text>
                    </View>
                )}
            </View>

            {aulas.length === 0 ? (
                <View style={styles.vazio}>
                    <Text style={styles.vazioTexto}>Sem aulas neste dia</Text>
                </View>
            ) : (
                aulas.map((aula) => <CartaoAula key={aula.id} aula={aula} />)
            )}
        </View>
    );
}

/**
 * Aula na lista do dia: rótulo com o horário em cima e o cartão embaixo.
 * A sala é o elemento principal do cartão: fica numa "placa" escura à direita,
 * como as placas de porta, para ser lida de relance.
 */

function CartaoAula({ aula }: { aula: Aula }) {
    const [modalVisible, setModalVisible] = useState(false);
    // Mostra o selo "Sala alterada" depois que o professor troca a sala por aqui.
    // Quando a API informar a troca (ex.: um campo no registro da aula), use esse dado no lugar.
    const [salaAlterada, setSalaAlterada] = useState(false);

    return (
        <View style={styles.aulaBloco}>
            {/* Rótulo do horário: início em destaque, fim mais suave */}
            <View style={styles.rotuloHora}>
                <Text style={styles.rotuloHoraInicio}>{aula.horaInicio}</Text>
                <Text style={styles.rotuloHoraFim}>{aula.horaFim}</Text>
            </View>

            <Pressable onPress={() => router.push({
                pathname: "/pages/ProfessorRequests",
                params: { aula: JSON.stringify(aula) }
            })}>
                {({ pressed }) => (
                    <View
                        style={[
                            styles.cartao,
                            pressed && styles.cartaoPressionado
                        ]}
                        accessible
                        accessibilityLabel={`${aula.disciplina}, das ${aula.horaInicio} às ${aula.horaFim}, sala ${aula.sala.nome}, bloco ${aula.sala.bloco}`}
                    >
                        <View
                            style={[
                                styles.cartaoFaixa,
                                { backgroundColor: aula.cor }
                            ]}
                        />

                        <View style={styles.cartaoInfo}>
                            <View style={styles.tituloLinha}>
                                <Text style={styles.disciplina} numberOfLines={2}>
                                    {aula.disciplina}
                                </Text>
                                {salaAlterada && (
                                    <View style={styles.seloAlterada}>
                                        <Text style={styles.seloAlteradaTexto}>Sala alterada</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.detalheAula} numberOfLines={1}>
                                {aula.horaInicio} – {aula.horaFim} · {aula.turma.nome}
                            </Text>
                        </View>

                        <View style={styles.placa}>
                            <Text
                                style={styles.placaSala}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                                minimumFontScale={0.6}
                            >
                                {aula.sala.nome}
                            </Text>

                            <Text style={styles.placaBloco} numberOfLines={1}>
                                Bloco {aula.sala.bloco}
                            </Text>
                        </View>
                    </View>
                )}
            </Pressable>

            {/*
            <ClassSelectionModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                rooms=
                onSelectRoom={(room) => {
                    Alert.alert(
                        "Tem certeza que deseja solicitar troca de sala?",
                        "A solicitação será enviada a coordenação imediatamente",
                        [
                            {
                                text: "Cancelar",
                                style: "cancel",
                            },
                            {
                                text: "OK",
                                onPress: () => {
                                    setSalaAlterada(true);
                                    setModalVisible(false);
                                },
                            },
                        ],
                        { cancelable: true }
                    );
                }}
            />*/}
        </View>
    );
}


/* -------------------------------------------------------------------------- */
/*  ESTILOS                                                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: COR.fundo },

    // Cabeçalho
    cabecalho: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        backgroundColor: COR.fundo,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COR.linha,
    },

    // Topo: título + subtítulo à esquerda, avatar à direita
    topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    topoTextos: { flex: 1, paddingRight: 12 },
    titulo: { fontSize: 26, fontWeight: '700', color: COR.tinta },
    subtitulo: { fontSize: 10, color: COR.tintaSuave, marginTop: 2 },



    // Espaço ao redor do card da aula mais próxima
    proximaBox: { marginBottom: 14 },

    // Botão "Voltar para hoje" (no topo, à direita do título)
    botaoHoje: {
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
        backgroundColor: COR.tinta,
    },
    botaoHojeTexto: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

    navegacaoSemana: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    setaSemana: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COR.superficie,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COR.linha,
    },
    setaDesativada: { opacity: 0.35 }, // seta bloqueada (início/fim do intervalo permitido)
    setaTexto: { fontSize: 28, lineHeight: 30, color: COR.tinta, fontWeight: '600' },
    intervaloBox: { alignItems: 'center' },
    intervalo: { fontSize: 17, fontWeight: '700', color: COR.tinta },
    intervaloLegenda: { fontSize: 13, color: COR.tintaSuave, marginTop: 2 },

    // Faixa de dias (flex: 1 em cada chip => se adapta a qualquer largura de tela)
    faixaDias: { flexDirection: 'row', gap: 6 },
    chipDia: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: COR.superficie,
        borderWidth: 1,
        borderColor: COR.linha,
    },
    chipDiaSelecionado: { backgroundColor: COR.tinta, borderColor: COR.tinta },
    chipSemana: { fontSize: 12, color: COR.tintaSuave, fontWeight: '600' },
    chipNumero: { fontSize: 20, color: COR.tinta, fontWeight: '700', marginTop: 2 },
    chipTextoSelecionado: { color: '#FFFFFF' },
    chipPonto: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },

    // Conteúdo
    conteudo: { padding: 16, paddingBottom: 40 },
    conteudoTablet: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    carregando: {
        ...StyleSheet.absoluteFill, // cobre a tela toda (topo, laterais e base)
        alignItems: 'center',
        justifyContent: 'center', // centraliza o spinner
        backgroundColor: 'rgba(18, 38, 63, 0.75)', // tom da COR.tinta, igual ao fundo do modal
        zIndex: 10,
    },

    secao: { marginBottom: 20 },
    secaoTablet: { width: '31.5%', marginBottom: 0 }, // 3 colunas
    secaoTitulo: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8, gap: 8 },
    secaoDia: { fontSize: 18, fontWeight: '700', color: COR.tinta },
    secaoData: { fontSize: 14, color: COR.tintaSuave },
    selo: { backgroundColor: COR.hoje, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'center' },
    seloTexto: { fontSize: 12, fontWeight: '700', color: COR.tinta },

    vazio: {
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COR.linha,
    },
    vazioTexto: { color: COR.tintaSuave, fontSize: 14 },

    // Aula: bloco com o rótulo de horário em cima e o cartão embaixo
    aulaBloco: { marginBottom: 10 },
    rotuloHora: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 6, marginTop: 2 },
    rotuloHoraInicio: { fontSize: 12, fontWeight: '700', color: COR.tinta },
    rotuloHoraFim: { fontSize: 12, color: COR.tintaSuave },

    // Cartão da aula
    cartao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COR.superficie,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COR.linha,
    },
    cartaoFaixa: { width: 5, alignSelf: 'stretch' },
    cartaoInfo: { flex: 1, paddingVertical: 12, paddingLeft: 14, paddingRight: 8 },
    tituloLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    disciplina: { flex: 1, fontSize: 16, fontWeight: '700', color: COR.tinta },
    detalheAula: { fontSize: 12, color: COR.tintaSuave, marginTop: 4 },

    // Selo "Sala alterada"
    seloAlterada: {
        marginLeft: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        backgroundColor: 'rgba(242, 169, 0, 0.2)',
    },
    seloAlteradaTexto: { fontSize: 11, fontWeight: '700', color: '#8A5A00' },

    // Placa da sala (elemento de destaque)
    placa: {
        width: 72,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        backgroundColor: COR.tinta,
    },
    placaSala: { fontSize: 19, fontWeight: '800', color: '#FFFFFF', textAlign: 'center' },
    placaBloco: { fontSize: 8, color: '#B8C4D4', marginTop: 2, textAlign: 'center' },

    //Desfoque ao tocar no card
    cartaoPressionado: {
        opacity: 0.65,
        transform: [{ scale: 0.98 }],
    },

    // Erro
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    erroTexto: { fontSize: 16, color: COR.tinta, textAlign: 'center', marginBottom: 12 },
    botaoTentar: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: COR.destaque },
    botaoTentarTexto: { color: '#FFFFFF', fontWeight: '600' },

});