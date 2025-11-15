// =====================
// Ruleta europea
// =====================
export const wheel: number[] = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

// =====================
// Calcular distancia circular
// =====================
function wheelDistance(a: number, b: number): number {
  const ia = wheel.indexOf(a);
  const ib = wheel.indexOf(b);

  if (ia === -1 || ib === -1) return Infinity;

  const diff = Math.abs(ia - ib);
  return Math.min(diff, wheel.length - diff);
}

// =====================
// 1. Matriz de transición
// =====================
function computeTransitionMatrix(history: number[]): number[][] {
  const N = 37;
  const matrix: number[][] = Array.from(
    { length: N },
    () => Array(N).fill(1) // suavizado
  );

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1];
    const curr = history[i];

    if (prev >= 0 && prev < N && curr >= 0 && curr < N) {
      matrix[prev][curr] += 1;
    }
  }

  // Normalizar filas
  for (let i = 0; i < N; i++) {
    const sum = matrix[i].reduce((a, b) => a + b, 0);
    for (let j = 0; j < N; j++) {
      matrix[i][j] /= sum;
    }
  }

  return matrix;
}

// =====================
// 2. Ponderación por vecinos
// =====================
function neighborScores(target: number): number[] {
  const scores: number[] = Array(37).fill(0);

  for (let n = 0; n < 37; n++) {
    const d = wheelDistance(target, n);
    scores[n] = 1 / (1 + d);
  }

  return scores;
}

// =====================
// 3. Scoring híbrido
// =====================
export function hybridPredictor(history: number[]): number[] {
  const N = 37;

  if (history.length < 2) return Array(N).fill(1 / N);

  const last = history[history.length - 1];

  // Componentes
  const transition = computeTransitionMatrix(history)[last];
  const neighborLast = neighborScores(last);

  // Buscar los números más probables por transición
  const bestNexts = transition
    .map((p, i) => ({ num: i, p }))
    .sort((a, b) => b.p - a.p)
    .slice(0, 3)
    .map((t) => t.num);

  // Sumar vecinos de esos números
  const neighborPredicted: number[] = Array(N).fill(0);

  for (const n of bestNexts) {
    const neigh = neighborScores(n);
    for (let i = 0; i < N; i++) {
      neighborPredicted[i] += neigh[i];
    }
  }

  // =====================
  // COMBINACIÓN FINAL
  // =====================
  const finalScore: number[] = Array(N).fill(0);

  for (let i = 0; i < N; i++) {
    finalScore[i] =
      0.5 * transition[i] + // patrón histórico
      0.25 * neighborLast[i] + // cerca del último número
      0.25 * neighborPredicted[i]; // cerca de los números que suelen venir
  }

  // Normalizar
  const sum = finalScore.reduce((a, b) => a + b, 0);
  return finalScore.map((s) => s / sum);
}
