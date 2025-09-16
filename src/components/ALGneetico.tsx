import { useEffect, useState } from 'react'
import { runGeneticAlgorithm } from '../alg/alg-genetico';
import { TableroRuleta } from '../TableroRuleta';

interface Props {
  history: number[]
}

export function RoulettePredictor({history}:Props) {
  // ejemplo del history (puedes sustituir con tu propio array)

  const [result, setResult] = useState<{ num: number; prob: number }[] | null>(null);
  const [running, setRunning] = useState(false);

  const [poblacion, setPoblacion] = useState(50);
  const [generacion, setGeneracion] = useState(200);
  const [topN, setTopN] = useState(15);

  async function run() {
    setRunning(true);
    // Ligeramente asíncrono solo para no bloquear UI si la población/generaciones son grandes
    await new Promise((r) => setTimeout(r, 10));
    const { top } = runGeneticAlgorithm(history, { popSize: poblacion, generations: generacion, topN: topN });
    setResult(top.map((t) => ({ num: t.num, prob: t.prob })));
    setRunning(false);
  }

  useEffect(() => {
    // Ejecutar una vez al montar (opcional)
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", padding: 12 }}>
        <h3>Predicción ruleta (Genetic GA → Top 15)</h3>
        <p>Último número: {history[history.length - 1]}</p>
        <button onClick={run} disabled={running}>
          {running ? "Ejecutando..." : "Ejecutar algoritmo"}
        </button>
        <div>
          <input
            type="number"
            placeholder='poblacion'
            className="w-full"
            onChange={(event) => setPoblacion(Number(event.target.value))}
          />
          <input
            type="number"
            placeholder='generacion'
            className="w-full"
            onChange={(event) => setGeneracion(Number(event.target.value))}
          />
          <input
            type="number"
            placeholder='topN'
            className="w-full"
            onChange={(event) => setTopN(Number(event.target.value))}
          />
        </div>
        {result ? (
          <table style={{ marginTop: 12, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: 6, borderBottom: "1px solid #ddd" }}>#</th>
                <th style={{ padding: 6, borderBottom: "1px solid #ddd" }}>Número</th>
                <th style={{ padding: 6, borderBottom: "1px solid #ddd" }}>Probabilidad</th>
              </tr>
            </thead>
            <tbody>
              {result.map((r, i) => (
                <tr key={r.num}>
                  <td style={{ padding: 6 }}>{i + 1}</td>
                  <td style={{ padding: 6 }}>{r.num}</td>
                  <td style={{ padding: 6 }}>{(r.prob * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Sin resultados aún.</p>
        )}
      </div>
      <div>
        <TableroRuleta data={result?.map(e => e.num) || []} />
      </div>

    </div>
  );
}