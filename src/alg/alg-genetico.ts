/* ------------------------------------------------------------
   Constantes y utilidades (rueda europea)
   ------------------------------------------------------------ */
export const wheel: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];
export const ANGLE_STEP: number = 360.0 / 37.0; // ~9.72972972972973° por slot

export function getAngle(num: number): number {
  const idx = wheel.indexOf(num);
  if (idx === -1) return 0.0;
  return idx * ANGLE_STEP;
}

export function deltaAngle(a1: number, a2: number): number {
  const diff = Math.abs(a1 - a2);
  return Math.min(diff, 360.0 - diff);
}

function normalize(p: number[]): void {
  let sum = 0.0;
  for (let i = 0; i < p.length; i++) {
    sum += p[i];
  }

  if (Math.abs(sum) < 1e-12) {
    const v = 1.0 / p.length;
    for (let i = 0; i < p.length; i++) {
      p[i] = v;
    }
  } else {
    for (let i = 0; i < p.length; i++) {
      p[i] = p[i] / sum;
    }
  }
}

/* ------------------------------------------------------------
   Funciones auxiliares para los nuevos patrones
   ------------------------------------------------------------ */
function computeRepetitionProbability(
  history: number[],
  num: number,
  windowSize: number = 20
): number {
  const recentNumbers = history.slice(-windowSize);
  const hasAppeared = recentNumbers.includes(num);
  // Si NO ha aparecido en los últimos N, mayor probabilidad
  return hasAppeared ? 0.8 : 1.2;
}

function computeIntervalPattern(history: number[], num: number): number {
  const lastAppearance = history.lastIndexOf(num);
  if (lastAppearance === -1) return 1.2;
  const interval = history.length - lastAppearance;
  // Números que no salen hace mucho tienen mayor probabilidad
  return Math.min(1.0 + interval * 0.03, 1.5);
}

function computeHotColdTrend(
  history: number[],
  num: number,
  windowSize: number = 10
): number {
  const recent = history.slice(-windowSize);
  const count = recent.filter((n) => n === num).length;
  // Números "calientes" tienden a mantenerse calientes
  return 1.0 + count * 0.15;
}

function computeParityPattern(history: number[], num: number): number {
  const lastNumbers = history.slice(-5);
  if (lastNumbers.length === 0) return 1.0;

  const lastParity = lastNumbers.map((n) => n % 2); // 0=par, 1=impar
  const currentParity = num % 2;

  const parityCount = lastParity.filter((p) => p === 0).length;
  const parityRatio = parityCount / lastParity.length;

  // Si los últimos 5 fueron mayormente pares, mayor prob para impar
  if (parityRatio > 0.7) {
    return currentParity === 1 ? 1.3 : 0.7;
  }
  // Si los últimos 5 fueron mayormente impares, mayor prob para par
  else if (parityRatio < 0.3) {
    return currentParity === 0 ? 1.3 : 0.7;
  }
  return 1.0;
}

function computeDozenPattern(history: number[], num: number): number {
  const lastNumbers = history.slice(-5);
  if (lastNumbers.length === 0) return 1.0;

  const getDozen = (n: number): number => {
    if (n === 0) return 0;
    return Math.ceil(n / 12);
  };

  const lastDozens = lastNumbers.map(getDozen);
  const currentDozen = getDozen(num);

  const dozenCounts = [0, 0, 0, 0];
  lastDozens.forEach((d) => dozenCounts[d]++);

  const maxDozen = dozenCounts.indexOf(Math.max(...dozenCounts));

  // Si una docena predominó mucho, menor probabilidad para esa docena
  if (dozenCounts[maxDozen] / lastDozens.length > 0.6) {
    return currentDozen === maxDozen ? 0.7 : 1.2;
  }
  return 1.0;
}

/* ------------------------------------------------------------
   Types
   ------------------------------------------------------------ */
export type Individual = {
  probs: number[]; // length 37, suma = 1
  w_trans: number;
  w_cerc: number;
  w_base: number;
  fitness: number;
};

/* ------------------------------------------------------------
   Inicialización población
   ------------------------------------------------------------ */
export function initPop(size: number): Individual[] {
  const pop: Individual[] = [];

  for (let k = 0; k < size; k++) {
    const probs: number[] = [];
    for (let i = 0; i < 37; i++) {
      probs.push(Math.random());
    }
    normalize(probs);

    let w_trans = Math.random() * 0.4;
    let w_cerc = Math.random() * 0.3;
    let w_base = 1.0 - w_trans - w_cerc;

    if (w_base < 0) {
      w_trans *= 0.5;
      w_cerc *= 0.5;
      w_base = 1.0 - w_trans - w_cerc;
    }

    pop.push({
      probs,
      w_trans,
      w_cerc,
      w_base,
      fitness: 0.0,
    });
  }

  return pop;
}

/* ------------------------------------------------------------
   Construir matriz de transiciones desde historial
   ------------------------------------------------------------ */
export function buildTransitions(history: number[]): number[][] {
  const trans: number[][] = [];
  for (let i = 0; i < 37; i++) {
    trans.push(new Array(37).fill(0.0));
  }

  for (let i = 0; i < history.length - 1; i++) {
    const x = history[i];
    const y = history[i + 1];
    if (x >= 0 && x < 37 && y >= 0 && y < 37) {
      trans[x][y] += 1.0; // forward
      trans[y][x] += 0.5; // backward
    }
  }

  return trans;
}

/* ------------------------------------------------------------
   Compute fitness (traducción del C++)
   ------------------------------------------------------------ */
export function computeFitness(ind: Individual, history: number[]): number {
  if (history.length < 2) return 0.0;

  let lik_freq = 0.0;
  let lik_delta = 0.0;
  let lik_trans = 0.0;
  let lik_cerc = 0.0;
  const EPS = 1e-12;

  // 1) Lik frecuencias
  const counts: number[] = new Array(37).fill(0);
  for (const n of history) {
    if (n >= 0 && n < 37) counts[n]++;
  }

  for (let i = 0; i < 37; i++) {
    if (counts[i] > 0) {
      lik_freq += counts[i] * Math.log(Math.max(ind.probs[i], EPS));
    }
  }

  // 2) Lik de deltas (simplificado: bins de 18 grados)
  for (let i = 0; i < history.length - 1; i++) {
    const a1 = getAngle(history[i]);
    const a2 = getAngle(history[i + 1]);
    const d = deltaAngle(a1, a2);
    const bin = Math.floor(d / 18.0);
    const p_bin = ind.probs[bin % 37];
    lik_delta += Math.log(Math.max(p_bin, EPS));
  }

  // 3) Lik transiciones (forward + backward con suavizado)
  const trans = buildTransitions(history);
  for (let x = 0; x < 37; x++) {
    let rowSum = 0.0;
    for (let y = 0; y < 37; y++) {
      rowSum += trans[x][y];
    }

    if (rowSum > 0) {
      for (let y = 0; y < 37; y++) {
        if (trans[x][y] > 0) {
          const p_y_x = (trans[x][y] + EPS) / (rowSum + 37 * EPS);
          const combinedProb = Math.max(
            p_y_x * ind.w_trans + ind.probs[y] * (1.0 - ind.w_trans),
            EPS
          );
          lik_trans += trans[x][y] * Math.log(combinedProb);
        }
      }
    }
  }

  // 4) Lik cercanía
  for (let i = 0; i < history.length - 1; i++) {
    const curr = history[i];
    const next = history[i + 1];
    const aCurr = getAngle(curr);
    const aNext = getAngle(next);
    const d = deltaAngle(aCurr, aNext);
    if (d < 20.0) {
      lik_cerc += Math.log(Math.max(ind.w_cerc, EPS));
    }
  }

  // Fitness total (manteniendo coeficientes del original)
  return (
    ind.w_base * lik_freq +
    0.2 * lik_delta +
    0.4 * ind.w_trans * lik_trans +
    0.4 * ind.w_cerc * lik_cerc
  );
}

/* ------------------------------------------------------------
   Evolución: selección por torneo, cruce y mutación
   ------------------------------------------------------------ */
export function evolve(
  pop: Individual[],
  history: number[],
  generations: number
): Individual[] {
  let currentPop = [...pop];

  for (let g = 0; g < generations; g++) {
    // evaluar fitness
    for (const ind of currentPop) {
      ind.fitness = computeFitness(ind, history);
    }

    // selección por torneo (tamaño torneo = 2)
    const newPop: Individual[] = [];
    while (newPop.length < currentPop.length) {
      const i1 = Math.floor(Math.random() * currentPop.length);
      const i2 = Math.floor(Math.random() * currentPop.length);

      let winner = currentPop[i1];
      let loser = currentPop[i2];

      if (winner.fitness < loser.fitness) {
        [winner, loser] = [loser, winner];
      }

      // Clonar el ganador
      newPop.push({
        probs: [...winner.probs],
        w_trans: winner.w_trans,
        w_cerc: winner.w_cerc,
        w_base: winner.w_base,
        fitness: winner.fitness,
      });
    }

    // cruce & mutación
    const elite = newPop[0]; // referencia para cruces

    for (let i = 1; i < newPop.length; i++) {
      const individual = newPop[i];

      // cruce: intercambio por gen con prob 0.5 respecto a elite
      for (let j = 0; j < 37; j++) {
        if (Math.random() > 0.5) {
          const tmp = individual.probs[j];
          individual.probs[j] = elite.probs[j];
          elite.probs[j] = tmp;
        }
      }

      normalize(individual.probs);

      // mutación: 5% chance por gen
      for (let j = 0; j < individual.probs.length; j++) {
        if (Math.random() < 0.05) {
          individual.probs[j] = Math.max(
            1e-6,
            individual.probs[j] + (Math.random() - 0.5) * 0.05
          );
        }
      }
      normalize(individual.probs);

      // mutar pesos (mantener limites)
      individual.w_trans = Math.max(
        0.0,
        Math.min(0.4, individual.w_trans + (Math.random() - 0.5) * 0.02)
      );
      individual.w_cerc = Math.max(
        0.0,
        Math.min(0.3, individual.w_cerc + (Math.random() - 0.5) * 0.02)
      );
      individual.w_base = Math.max(
        0.0,
        1.0 - individual.w_trans - individual.w_cerc
      );
    }

    currentPop = newPop;
  }

  // última evaluación y orden descendente por fitness
  for (const ind of currentPop) {
    ind.fitness = computeFitness(ind, history);
  }

  currentPop.sort((a, b) => b.fitness - a.fitness);
  return currentPop;
}

/* ------------------------------------------------------------
   Predict top N con todas las variables adicionales
   ------------------------------------------------------------ */
export function predictTopN(
  best: Individual,
  lastNum: number,
  trans: number[][],
  history: number[],
  topN = 15
): Array<{ num: number; prob: number }> {
  const candidates: Array<{ num: number; prob: number }> = [];
  const EPS = 1e-12;

  let rowSum = 0.0;
  for (let i = 0; i < 37; i++) {
    rowSum += trans[lastNum][i];
  }

  for (let next = 0; next < 37; next++) {
    const p_trans_fwd =
      rowSum > 0
        ? (trans[lastNum][next] + EPS) / (rowSum + 37 * EPS)
        : 1.0 / 37.0;

    let colSum = 0.0;
    for (let i = 0; i < 37; i++) {
      colSum += trans[next][i];
    }

    const p_trans_bwd = colSum > 0 ? trans[next][lastNum] / colSum : 0.0;
    const p_trans = 0.7 * p_trans_fwd + 0.3 * p_trans_bwd;

    const isClose = deltaAngle(getAngle(lastNum), getAngle(next)) < 20.0;
    const p_cerc = isClose ? best.w_cerc * 2.0 + 1e-6 : 1.0;

    // APLICAR TODAS LAS NUEVAS VARIABLES
    const repetitionProb = computeRepetitionProbability(history, next, 20);
    const intervalProb = computeIntervalPattern(history, next);
    const hotColdProb = computeHotColdTrend(history, next, 10);
    const parityProb = computeParityPattern(history, next);
    const dozenProb = computeDozenPattern(history, next);

    const prob =
      best.probs[next] *
      p_trans *
      p_cerc *
      repetitionProb *
      intervalProb *
      hotColdProb *
      parityProb *
      dozenProb;

    candidates.push({ num: next, prob });
  }

  // normalizar
  let sum = 0.0;
  for (const candidate of candidates) {
    sum += candidate.prob;
  }

  if (sum > 0) {
    for (const candidate of candidates) {
      candidate.prob = candidate.prob / sum;
    }
  } else {
    const uniformProb = 1.0 / 37;
    for (const candidate of candidates) {
      candidate.prob = uniformProb;
    }
  }

  // ordenar descendente
  candidates.sort((a, b) => b.prob - a.prob);

  return candidates.slice(0, Math.min(topN, candidates.length));
}

/* ------------------------------------------------------------
   Función de alto nivel que corre todo y retorna topN
   ------------------------------------------------------------ */
export function runGeneticAlgorithm(
  history: number[],
  {
    popSize = 50,
    generations = 200,
    topN = 15,
  }: { popSize?: number; generations?: number; topN?: number } = {}
) {
  const trans = buildTransitions(history);
  let pop = initPop(popSize);
  pop = evolve(pop, history, generations);
  const best = pop[0];
  const lastNum = history[history.length - 1];
  const top = predictTopN(best, lastNum, trans, history, topN);

  return {
    best,
    top,
    pop,
    trans,
  };
}

/* ------------------------------------------------------------
   Ejemplo de uso
   ------------------------------------------------------------ */
export function exampleUsage() {
  const history = [
    14, 27, 36, 6, 3, 24, 9, 0, 2, 2, 22, 34, 29, 13, 33, 33, 26, 12, 23, 25, 9,
    6, 23, 10, 36, 7, 20, 26, 19, 1, 1, 34, 23, 6, 6, 11, 14, 36, 27, 6, 26, 13,
    24, 31, 25, 14, 7, 24, 1, 1, 2, 6, 11, 17, 34, 31, 28, 36, 9, 7, 4, 23, 15,
    17, 33, 29, 28, 36, 25, 17, 34, 32, 2, 6, 13, 16, 25, 36, 27, 20, 7, 27, 14,
    17, 17, 12, 33, 33, 14, 6, 20, 28, 36, 26, 4, 22, 22, 28, 17, 34, 32, 13,
    10, 6, 9, 25, 2, 5, 8, 27, 5, 26, 36, 24, 0, 0, 1, 3, 6, 36, 28, 7, 5, 1,
    19, 21, 22, 24, 12, 14, 16, 17, 17, 33, 28, 28, 33, 33, 16, 15, 10, 27, 36,
    29, 27, 23, 8, 10, 10, 27, 25, 7, 3, 5, 23, 19, 0, 2, 21, 4, 24, 26, 27, 27,
    11, 11, 18, 35, 14, 15, 15, 29, 32, 16, 13, 8, 26, 24, 0, 20, 2, 21, 23, 36,
    28, 30, 7, 25, 5, 2, 11, 12, 26, 7, 25, 8, 12, 27, 7, 3,
  ];

  console.log("SIZE:", history.length);

  const result = runGeneticAlgorithm(history, {
    popSize: 50,
    generations: 200,
    topN: 15,
  });

  console.log("Mejor fitness:", result.best.fitness);
  console.log("Top 15 favoritos (desde " + history[history.length - 1] + "):");

  for (const item of result.top) {
    console.log(item.num + ": " + (item.prob * 100.0).toFixed(6) + "%");
  }

  return result;
}
