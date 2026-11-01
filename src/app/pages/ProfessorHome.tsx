import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    LayoutChangeEvent,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarAulasDaSemana } from '../api/aulasService';
import ClassSelectionModal from '../components/ClassSelectionModal';
import type { Aula, AulasPorDia } from '../data/aula';
import { COR } from '../data/cores';
import { formatarIntervalo, inicioDaSemana, paraISO, somarDias } from '../data/datas';
import { DIAS_ABREV, DIAS_COMPLETO, LARGURA_TABLET, MESES_ABREV, QTD_DIAS } from '../data/ensalamento';
import { DADOS_SALAS } from '../mocks/salasMock';

/* -------------------------------------------------------------------------- */
/*  TELA PRINCIPAL                                                            */
/* -------------------------------------------------------------------------- */

export default function EnsalamentoScreen() {
    const { width } = useWindowDimensions();
    const ehTablet = width >= LARGURA_TABLET;

    const hojeISO = paraISO(new Date());

    const [inicioSemana, setInicioSemana] = useState<Date>(() => inicioDaSemana(new Date()));
    const [diaSelecionado, setDiaSelecionado] = useState<string>(hojeISO);
    const [aulas, setAulas] = useState<Aula[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

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
            setAulas(await buscarAulasDaSemana(inicioSemana));
        } catch (e) {
            setErro('Não foi possível carregar as aulas desta semana.');
        } finally {
            setCarregando(false);
        }
    }, [inicioSemana]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    /** Agrupa e ordena as aulas por dia. */
    const aulasPorDia = useMemo<AulasPorDia>(() => {
        const mapa: AulasPorDia = {};
        aulas.forEach((a) => {
            (mapa[a.data] ??= []).push(a);
        });
        Object.values(mapa).forEach((lista) => lista.sort((x, y) => x.horaInicio.localeCompare(y.horaInicio)));
        return mapa;
    }, [aulas]);

    /** Troca de semana (delta = -1 anterior, +1 próxima) e escolhe um dia selecionado coerente. */
    const mudarSemana = (delta: number) => {
        const novoInicio = somarDias(inicioSemana, delta * 7);
        setInicioSemana(novoInicio);
        const hojeNaSemana = paraISO(inicioDaSemana(new Date())) === paraISO(novoInicio);
        setDiaSelecionado(hojeNaSemana ? hojeISO : paraISO(novoInicio));
        posicoesDias.current = {};
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    };

    const irParaHoje = () => {
        const inicio = inicioDaSemana(new Date());
        setInicioSemana(inicio);
        setDiaSelecionado(hojeISO);
        posicoesDias.current = {};
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    };

    const selecionarDia = (iso: string) => {
        setDiaSelecionado(iso);
        scrollRef.current?.scrollTo({ y: posicoesDias.current[iso] ?? 0, animated: true });
    };

    const semanaAtual = paraISO(inicioSemana) === paraISO(inicioDaSemana(new Date()));

    return (
        <SafeAreaView style={styles.tela}>
            <StatusBar barStyle="dark-content" />

            {/* Cabeçalho: título + navegação entre semanas */}
            <View style={styles.cabecalho}>
                <View style={styles.cabecalhoTopo}>
                    <Text style={styles.titulo}>Minhas aulas</Text>
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
                                {/* Pontinho: amarelo = hoje; cinza = há aula; vazio = sem aula */}
                                <View
                                    style={[
                                        styles.chipPonto,
                                        ehHoje
                                            ? { backgroundColor: COR.hoje }
                                            : temAula
                                                ? { backgroundColor: selecionado ? '#FFFFFF' : COR.tintaSuave }
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
                    {carregando && (
                        <View style={styles.carregando}>
                            <ActivityIndicator color={COR.destaque} />
                        </View>
                    )}

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
 * Cartão da aula. A sala é o elemento principal: fica numa "placa" escura à
 * direita, grande, como as placas de porta, para ser lida de relance.
 */
function CartaoAula({ aula }: { aula: Aula }) {

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View
            style={styles.cartao}
            accessible
            accessibilityLabel={`${aula.disciplina}, das ${aula.horaInicio} às ${aula.horaFim}, sala ${aula.sala}, ${aula.bloco}`}
        >
            <View style={[styles.cartaoFaixa, { backgroundColor: aula.cor }]} />

            <View style={styles.cartaoHorario}>
                <Text style={styles.horaInicio}>{aula.horaInicio}</Text>
                <Text style={styles.horaFim}>{aula.horaFim}</Text>
            </View>

            <View style={styles.cartaoInfo}>
                <Text style={styles.disciplina} numberOfLines={2}>
                    {aula.disciplina}
                </Text>
                <Text style={styles.professor} numberOfLines={1}>
                    {aula.professor}
                </Text>
            </View>

            <View style={styles.placa}>
                <TouchableOpacity style={styles.placaToque} onPress={() => { setModalVisible(true) }}>
                    <Text style={styles.placaSala} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                        {aula.sala}
                    </Text>
                    <Text style={styles.placaBloco} numberOfLines={1}>
                        {aula.bloco}
                    </Text>
                </TouchableOpacity>
            </View>
            
            <View>
                <ClassSelectionModal isVisible={modalVisible} onClose={() => { setModalVisible(false) }}
                    rooms={DADOS_SALAS.filter(room => room.ocupada == false)}
                    onSelectRoom={(room) => {
                        Alert.alert("Tem certeza que deseja solicitar troca de sala?", "A solicitação será enviada a coordenação imediatamente",
                            [
                                {
                                    text: 'Cancelar',
                                    style: 'cancel', // Apenas iOS
                                },

                                {
                                    text: 'OK',
                                    onPress: () => {
                                        aula.sala = room.nome;
                                        setModalVisible(false);
                                    },
                                },
                            ],
                            { cancelable: true }
                        );
                    }} />
            </View>

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
    cabecalhoTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    titulo: { fontSize: 24, fontWeight: '700', color: COR.tinta, paddingBottom:30 },
    botaoHoje: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: COR.tinta },
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
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: COR.superficie,
        borderWidth: 1,
        borderColor: COR.linha,
    },
    chipDiaSelecionado: { backgroundColor: COR.destaque, borderColor: COR.destaque },
    chipSemana: { fontSize: 12, color: COR.tintaSuave, fontWeight: '600' },
    chipNumero: { fontSize: 18, color: COR.tinta, fontWeight: '700', marginTop: 2 },
    chipTextoSelecionado: { color: '#FFFFFF' },
    chipPonto: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },

    // Conteúdo
    conteudo: { padding: 16, paddingBottom: 40 },
    conteudoTablet: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    carregando: { position: 'absolute', top: 8, left: 0, right: 0, alignItems: 'center', zIndex: 1 },

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

    // Cartão da aula
    cartao: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COR.superficie,
        borderRadius: 14,
        marginBottom: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COR.linha,
    },
    cartaoFaixa: { width: 5, alignSelf: 'stretch' },
    cartaoHorario: { width: 58, alignItems: 'center', paddingVertical: 12 },
    horaInicio: { fontSize: 16, fontWeight: '700', color: COR.tinta },
    horaFim: { fontSize: 13, color: COR.tintaSuave, marginTop: 2 },
    cartaoInfo: { flex: 1, paddingVertical: 12, paddingRight: 8 },
    disciplina: { fontSize: 16, fontWeight: '600', color: COR.tinta },
    professor: { fontSize: 13, color: COR.tintaSuave, marginTop: 2 },

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

    placaToque: { alignSelf: 'stretch' }, // estilo do touchableopacity fora da placa de sala

    // Erro
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    erroTexto: { fontSize: 16, color: COR.tinta, textAlign: 'center', marginBottom: 12 },
    botaoTentar: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, backgroundColor: COR.destaque },
    botaoTentarTexto: { color: '#FFFFFF', fontWeight: '600' },
});