
interface Props {
  data: number[]
}

export const TableroRuleta = ({data}: Props) => {
  const numerosRuleta = [
    { numero: "3", color: "red" },
    { numero: "6", color: "negro" },
    { numero: "9", color: "red" },
    { numero: "12", color: "red" },
    { numero: "15", color: "negro" },
    { numero: "18", color: "red" },
    { numero: "21", color: "red" },
    { numero: "24", color: "negro" },
    { numero: "27", color: "red" },
    { numero: "30", color: "red" },
    { numero: "33", color: "negro" },
    { numero: "36", color: "red" },
    { numero: "2", color: "negro" },
    { numero: "5", color: "red" },
    { numero: "8", color: "negro" },
    { numero: "11", color: "negro" },
    { numero: "14", color: "red" },
    { numero: "17", color: "negro" },
    { numero: "20", color: "negro" },
    { numero: "23", color: "red" },
    { numero: "26", color: "negro" },
    { numero: "29", color: "negro" },
    { numero: "32", color: "red" },
    { numero: "35", color: "negro" },
    { numero: "1", color: "red" },
    { numero: "4", color: "negro" },
    { numero: "7", color: "red" },
    { numero: "10", color: "negro" },
    { numero: "13", color: "negro" },
    { numero: "16", color: "red" },
    { numero: "19", color: "red" },
    { numero: "22", color: "negro" },
    { numero: "25", color: "red" },
    { numero: "28", color: "negro" },
    { numero: "31", color: "negro" },
    { numero: "34", color: "red" },
  ];
  // Divide los números en tres filas
  const fila1 = numerosRuleta.slice(0, 12);
  const fila2 = numerosRuleta.slice(12, 24);
  const fila3 = numerosRuleta.slice(24, 36);


  

  const renderFila = (fila: any) => (
    <div className="w-full grid grid-cols-12 border-red-100">
      {fila.map((item: any, index: any) => {
        return (
          <span
            className="w-auto py-2 border-[0.4px] flex items-center justify-center"
            key={index}
            style={{ background: `${item.color}` }}
          >
            {data.some((e) => Number(e) === Number(item.numero)) ? (
              <span className="w-2/3 rounded-full bg-green-800">
                {item.numero}
              </span>
            ) : (
             item.numero
            )}
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="w-full">
      <div className="w-full grid-rows-3">
        {renderFila(fila1)}
        {renderFila(fila2)}
        {renderFila(fila3)}
      </div>
    </div>
  );
}


