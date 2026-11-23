import type { Aviso } from "../data/entities/aviso";

/**
 * Dados mockados da tela de Avisos (ainda não há tabela de avisos no banco).
 * Apague este arquivo quando a consulta real estiver pronta.
 */

// Gera a data ISO de "X minutos atrás", para o tempo relativo ficar sempre coerente.
const haMinutos = (minutos: number): string =>
    new Date(Date.now() - minutos * 60 * 1000).toISOString();
const haHoras = (horas: number): string => haMinutos(horas * 60);
const haDias = (dias: number): string => haHoras(dias * 24);

export const AVISOS_MOCK: Aviso[] = [
    {
        id: 1,
        tipo: "sala_alterada",
        disciplina: "Cálculo II",
        turma: "ADS-3A",
        diaSemana: "Seg",
        horaInicio: "08:00",
        salaOrigem: "204",
        salaDestino: "305",
        motivo: "Projetor com defeito",
        origem: "Coordenação",
        criadoEm: haMinutos(12),
        lido: false,
    },
    {
        id: 2,
        tipo: "solicitacao_aprovada",
        disciplina: "Algoritmos",
        turma: "ADS-2B",
        diaSemana: "Qua",
        horaInicio: "10:00",
        salaOrigem: "Lab 3",
        salaDestino: "Lab 1",
        motivo: "Aula prática com mais máquinas",
        criadoEm: haHoras(1),
        lido: false,
    },
    {
        id: 3,
        tipo: "solicitacao_recusada",
        disciplina: "Física Geral",
        turma: "ENG-1A",
        diaSemana: "Ter",
        horaInicio: "08:00",
        salaOrigem: "101",
        salaDestino: "208",
        motivo: "208 já ocupada neste horário",
        criadoEm: haDias(1),
        lido: true,
    },
    {
        id: 4,
        tipo: "sala_alterada",
        disciplina: "Estatística",
        turma: "ENG-2A",
        diaSemana: "Qui",
        horaInicio: "14:00",
        salaOrigem: "102",
        salaDestino: "101",
        motivo: "Turma maior",
        origem: "Coordenação",
        criadoEm: haDias(2),
        lido: true,
    },
    // Avisos antigos: aparecem na aba "Anteriores".
    {
        id: 5,
        tipo: "sala_alterada",
        disciplina: "Banco de Dados",
        turma: "ADS-2B",
        diaSemana: "Sex",
        horaInicio: "10:00",
        salaOrigem: "Lab 1",
        salaDestino: "Lab 2",
        motivo: "Manutenção dos computadores",
        origem: "Coordenação",
        criadoEm: haDias(9),
        lido: true,
    },
    {
        id: 6,
        tipo: "solicitacao_aprovada",
        disciplina: "Engenharia de Software",
        turma: "ADS-3A",
        diaSemana: "Qua",
        horaInicio: "10:00",
        salaOrigem: "305",
        salaDestino: "204",
        motivo: "Turma menor",
        criadoEm: haDias(15),
        lido: true,
    },
];
