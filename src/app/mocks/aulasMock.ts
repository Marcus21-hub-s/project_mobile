import type { AulaModelo } from '../data/aula';

/**
 * Dados mockados: aulas que se repetem toda semana.
 * Índice 0 = segunda, 1 = terça ... (mesma ordem de exibição).
 * Apague este arquivo quando a API estiver pronta.
 */
export const MODELO_SEMANAL: Record<number, AulaModelo[]> = {
  0: [
    { disciplina: 'Cálculo II', professor: 'Prof. Helena Matos', sala: '204', bloco: 'Bloco B', horaInicio: '08:00', horaFim: '09:40', cor: '#0E7C86' },
    { disciplina: 'Algoritmos', professor: 'Prof. Rui Albuquerque', sala: 'Lab 3', bloco: 'Bloco C', horaInicio: '10:00', horaFim: '11:40', cor: '#7A5AF8' },
  ],
  1: [
    { disciplina: 'Física Geral', professor: 'Prof. Marta Lins', sala: '101', bloco: 'Bloco A', horaInicio: '08:00', horaFim: '09:40', cor: '#E4572E' },
    { disciplina: 'Banco de Dados', professor: 'Prof. Caio Ferraz', sala: 'Lab 1', bloco: 'Bloco C', horaInicio: '14:00', horaFim: '15:40', cor: '#2E86DE' },
  ],
  2: [
    { disciplina: 'Cálculo II', professor: 'Prof. Helena Matos', sala: '204', bloco: 'Bloco B', horaInicio: '08:00', horaFim: '09:40', cor: '#0E7C86' },
    { disciplina: 'Engenharia de Software', professor: 'Prof. Davi Nogueira', sala: '305', bloco: 'Bloco B', horaInicio: '10:00', horaFim: '11:40', cor: '#C2185B' },
    { disciplina: 'Inglês Técnico', professor: 'Prof. Laura Pinto', sala: '12', bloco: 'Bloco D', horaInicio: '16:00', horaFim: '17:40', cor: '#5B8C2A' },
  ],
  3: [
    { disciplina: 'Física Geral', professor: 'Prof. Marta Lins', sala: '101', bloco: 'Bloco A', horaInicio: '08:00', horaFim: '09:40', cor: '#E4572E' },
  ],
  4: [
    { disciplina: 'Algoritmos', professor: 'Prof. Rui Albuquerque', sala: 'Lab 3', bloco: 'Bloco C', horaInicio: '08:00', horaFim: '09:40', cor: '#7A5AF8' },
    { disciplina: 'Banco de Dados', professor: 'Prof. Caio Ferraz', sala: 'Lab 1', bloco: 'Bloco C', horaInicio: '10:00', horaFim: '11:40', cor: '#2E86DE' },
  ],
  5: [], // sábado sem aula (mostra o estado vazio)
};
