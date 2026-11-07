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
import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarAulasDaSemana } from '../api/aulasService';
import { COR } from '../data/cores';
import type { Aula, AulasPorDia } from '../data/entities/aula';
// Para reativar a navegação entre semanas, importe também `formatarIntervalo` daqui
import { useAuth } from '../api/authContext';
import NextClassCard from '../components/NextClassCard';
import { DIAS_ABREV, DIAS_COMPLETO, LARGURA_TABLET, MESES_ABREV, QTD_DIAS } from '../data/ensalamento';
import { encontrarProximaAula, formatarIntervaloCurto, inicioDaSemana, paraISO, somarDias } from '../data/formatacao';

/* -------------------------------------------------------------------------- */
/*  TELA PRINCIPAL                                                            */
/* -------------------------------------------------------------------------- */

export default function ProfessorHome() {
    const { width } = useWindowDimensions();
    const ehTablet = width >= LARGURA_TABLET;
    const hojeISO = paraISO(new Date());

    // Navegação entre semanas desativada. Para reativar, troque a linha abaixo por:
    // const [inicioSemana, setInicioSemana] = useState<Date>(() => inicioDaSemana(new Date()));
    const [inicioSemana] = useState<Date>(() => inicioDaSemana(new Date()));
    const [diaSelecionado, setDiaSelecionado] = useState<string>(hojeISO);
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    // Relógio da tela: atualiza a cada 30 s para o card do topo manter o "faltam ..." correto
    const [agora, setAgora] = useState(() => new Date());


    const {professor, encerrarSessao} = useAuth();

    const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
    // Guarda a posição vertical (y) de cada dia para o scroll ao tocar na faixa de dias.
    const posicoesDias = useRef<Record<string, number>>({});

    /** Os dias (Date) da semana exibida. */
    const dias = useMemo(
        () => Array.from({ length: QTD_DIAS }, (_, i) => somarDias(inicioSemana, i)),
        [inicioSemana],
    );

    /** Carrega as aulas sempre que a semana muda (a busca em si está em services/aulasService.ts). */
    const carregar = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            setAulas(await buscarAulasDaSemana(inicioSemana, professor?.id));
        } catch (e) {
            setErro('Não foi possível carregar as aulas desta semana.');
        } finally {
            setCarregando(false);
        }
    }, [inicioSemana]);


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

    useEffect(() => {
        console.log(aulas[0]);
        carregar();
    }, [carregar]);

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

    
    // /** Troca de semana (delta = -1 anterior, +1 próxima) e escolhe um dia selecionado coerente. */
    // const mudarSemana = (delta: number) => {
    //     const novoInicio = somarDias(inicioSemana, delta * 7);
    //     setInicioSemana(novoInicio);
    //     const hojeNaSemana = paraISO(inicioDaSemana(new Date())) === paraISO(novoInicio);
    //     setDiaSelecionado(hojeNaSemana ? hojeISO : paraISO(novoInicio));
    //     posicoesDias.current = {};
    //     scrollRef.current?.scrollTo({ y: 0, animated: false });
    // };
    //
    // const irParaHoje = () => {
    //     const inicio = inicioDaSemana(new Date());
    //     setInicioSemana(inicio);
    //     setDiaSelecionado(hojeISO);
    //     posicoesDias.current = {};
    //     scrollRef.current?.scrollTo({ y: 0, animated: false });
    // };
    //
    // const semanaAtual = paraISO(inicioSemana) === paraISO(inicioDaSemana(new Date()));

    const selecionarDia = (iso: string) => {
        setDiaSelecionado(iso);
        scrollRef.current?.scrollTo({ y: posicoesDias.current[iso] ?? 0, animated: true });
    };

    return (
        <SafeAreaView style={styles.tela}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.cabecalho}>
                {/* Topo: título, professor + semana e avatar com as iniciais */}
                <View style={styles.topo}>
                    <View style={styles.topoTextos}>
                        <Text style={styles.titulo}>Minhas aulas</Text>
                        <Text style={styles.subtitulo} numberOfLines={1}>
                            {nomeProfessor ? `Prof. ${nomeProfessor} · ` : ''}
                            {intervaloCurto}
                        </Text>
                    </View>

                   
                </View>

                {/* Card da aula em andamento / mais próxima (componente Header reaproveitado) */}
                <View style={styles.proximaBox}>
                    <NextClassCard proxima={proxima} />
                </View>

                {/* NAVEGAÇÃO ENTRE SEMANAS (desativada): descomente para reativar
                <View style={styles.cabecalhoTopo}>
                    {!semanaAtual && (
                        <Pressable onPress={irParaHoje} style={styles.botaoHoje} accessibilityRole="button">
                            <Text style={styles.botaoHojeTexto}>Voltar para hoje</Text>
                        </Pressable>
                    )}
                </View>

                <View style={styles.navegacaoSemana}>
                    <Pressable
                        onPress={() => mudarSemana(-1)}
                        style={styles.setaSemana}
                        accessibilityRole="button"
                        accessibilityLabel="Semana anterior"
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
                        style={styles.setaSemana}
                        accessibilityRole="button"
                        accessibilityLabel="Próxima semana"
                        hitSlop={8}
                    >
                        <Text style={styles.setaTexto}>›</Text>
                    </Pressable>
                </View>
                */}
                
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
                >

                    {dias.map((d) => {
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
                    })}
                </ScrollView>
            )}

            {carregando && (
                <View style={styles.carregando}>
                    <ActivityIndicator color={COR.destaque} />
                </View>
            )}
        </SafeAreaView>
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
                params: {aula: JSON.stringify(aula)}
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
    subtitulo: { fontSize: 13, color: COR.tintaSuave, marginTop: 2 },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COR.destaque,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarTexto: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    // Espaço ao redor do card da aula mais próxima
    proximaBox: { marginBottom: 14 },

    // Estilos da navegação entre semanas (usados só pelo bloco comentado no JSX; pode manter)
    cabecalhoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    botaoHoje: {
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
        backgroundColor: COR.tinta,
        marginLeft: 170
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