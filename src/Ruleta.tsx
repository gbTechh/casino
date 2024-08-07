import { useEffect, useState } from "react";
import { BarChart } from "./Graph";
import { TableroRuleta } from "./TableroRuleta";

const NUMBERS = 37;
interface HashTable {
  [key: number]: number;
}


export const Ruleta = () => {
    const [numbers, setNumbers] = useState<number[]>(() => {
      const saved = localStorage.getItem("myState");
      return saved !== null ? JSON.parse(saved) : [];
    });
    const [dataSelected, setDataSelected] = useState<number[]>(numbers);
    const [hashTable, setHashTable] = useState<HashTable>({});
    const [hashTableDigits, setHashTableDigits] = useState<HashTable>({});
    const [orderedHashTable, setOrderedHashTable] = useState<{
      [k: string]: any;
    }>([]);

    useEffect(() => {
      setDataSelected(numbers);
    }, [numbers]);

    const handleNumbers = (number: number) => {
      setNumbers((prev) => [number, ...prev]);
      setDataSelected((prev) => [...prev, number]);
    };

    useEffect(() => {
      let obj: any = {};

      for (const number of dataSelected) {
        if (!(number in obj)) {
          obj[number] = 1;
        } else {
          obj[number] += 1;
        }
      }

      setHashTable(obj);
    }, [dataSelected]);

    const sumDigits = (n: number) => {
      let suma = 0;
      while (n) {
        suma += n % 10;
        n = Math.floor(n / 10);
      }
      if (suma === 10) return 0;
      if (suma === 11) return 1;
      return suma;
    };

    const orderNumbers = (obj: HashTable) => {
      return Object.entries(obj).sort((a, b) => b[1] - a[1]);
    };

    useEffect(() => {
      const ordered = orderNumbers(hashTableDigits);
      setOrderedHashTable(ordered);
    }, [hashTableDigits]);

    useEffect(() => {
      let obj: any = {};
      Object.entries(hashTable).map((e) => {
        if (!(sumDigits(Number(e[0])) in obj)) {
          obj[sumDigits(Number(e[0]))] = e[1];
        } else {
          obj[sumDigits(Number(e[0]))] += e[1];
        }
      });
      setHashTableDigits(obj);
    }, [hashTable]);

    const handleClickDecrease = (number: number) => {
      setHashTable((prevState) => {
        if (!prevState[number]) {
          // Si la clave no existe en la tabla, no hacemos nada
          return prevState;
        } else if (prevState[number] === 1) {
          // Si el valor es 1, eliminamos la clave de la tabla
          const newState = { ...prevState };
          delete newState[number];
          return newState;
        } else {
          // Si el valor es mayor a 1, lo disminuimos en 1
          return { ...prevState, [number]: prevState[number] - 1 };
        }
      });
    };

    const [valorDelInput, setValorDelInput] = useState("");

    const manejarCambio = (evento: React.ChangeEvent<HTMLInputElement>) => {
      setValorDelInput(evento.target.value);
    };

    const manejarKeyPress = (evento: React.KeyboardEvent<HTMLInputElement>) => {
      if (evento.key === "Enter") {
        handleNumbers(Number(valorDelInput));
        setValorDelInput("");
      }
    };

    const [numberSelected, setNumberSelected] = useState<number[]>([]);
    const selectNumbers = (n: number) => {
      let arr = [];
      for (let i = 0; i <= 36; i++) {
        if (sumDigits(i) === n) arr.push(i);
      }
      setNumberSelected((prev) => [...prev, ...arr]);
    };

    const [numberSelecteCount, setNumberSelecteCount] = useState<number[]>([])
    const selectNumbersCount = (n:number) => {
      setNumberSelecteCount((prev) => [...prev, n]);
    }
    const [numberMissingState, setNumberMissingState] = useState<number[]>([]);
    const selectNumbersMissing = (n:number) => {
      setNumberMissingState((prev) => [...prev, n]);
    }

    const [rangeValue, setRangeValue] = useState<number>(0);

    useEffect(() => {
      setDataSelected(numbers.slice(0, rangeValue));
    }, [rangeValue]);
    useEffect(() => {
      setDataSelected(numbers.slice(0, rangeValue));
    }, [numbers]);
    useEffect(() => {
      setRangeValue(rangeValue);
    }, [numbers]);
  
    useEffect(() => {
      // Guardar el estado en localStorage cada vez que cambie
      localStorage.setItem("myState", JSON.stringify(numbers));
    }, [numbers]);

    const orderNumers = () => {
      const entries = Object.entries(hashTable);
      const sortedEntries = entries.sort((a, b) => b[1] - a[1]);
      return sortedEntries;
    }
    
    const missingNumers = () => {
      const entries = Object.entries(hashTable).map(e => Number(e[0]));
      const numSet = new Set(entries);

      let missingNumbers = [];
      for (let i = 0; i <= 36; i++) {
        if (!numSet.has(i)) {
          missingNumbers.push(i);
        }
      }
      return missingNumbers;
    }

    const [arrClickedNumbers, setArrClickedNumbers] = useState<number[]>([])
    const clickSelectNumber = (number: number) => {
      let arr: number[] = []
      let nString = `${number}`
      for (let i = 0; i <= 36; i++) {
        let n = `${i}`
        if(n.at(-1) === nString.at(-1)){
          arr.push(i);
          // setArrClickedNumbers(prev => [...prev, i])
        }
        if(i % number === 0){
          arr.push(i)
        }
        if(sumDigits(i) === sumDigits(number)){
          arr.push(i)
        }
      }
      setArrClickedNumbers(arr);
    }

  return (
    <>
      <BarChart
        labels={Object.keys(hashTable)}
        values={Object.values(hashTable)}
      />
      <button onClick={() => setNumbers([])}>Limpiar datos</button>
      <div className="flex flex-wrap gap-3 justify-center items-center my-10">
        {Object.entries(hashTable).map((e) => (
          <button
            key={e[0]}
            onClick={() => handleClickDecrease(Number(e[0]))}
            className="bg-gray-700 rounded-lg p-2"
          >
            <span className="text-white">{`${e[0]}: `}</span>
            <span className="text-green-200">{e[1]}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-1 flex-wrap mb-10 w-full overflow-hidden">
        {dataSelected.map((e, i) => (
          <span key={i} className="w-10 rounded-sm text-white bg-red-800">
            {e}
          </span>
        ))}
      </div>
      <div>
        <span>{rangeValue}</span>
        <input
          type="range"
          className="w-full"
          min={0}
          max={numbers.length}
          onChange={(event) => setRangeValue(Number(event.target.value))}
        />
        <label>Max: {numbers.length}</label>
      </div>
      <h1>Numbers</h1>
      <label>Numero: </label>
      <input
        type="text"
        value={valorDelInput}
        onChange={(e) => manejarCambio(e)}
        onKeyDown={(e) => manejarKeyPress(e)}
      />
      <div className="card">
        {Array.from({ length: NUMBERS }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              handleNumbers(i);
            }}
          >
            {i}
          </button>
        ))}
      </div>
      <p className="py-2">Tactica suma</p>
      <div className="flex flex-wrap gap-3 justify-center items-center">
        {Object.entries(hashTableDigits).map((e) => (
          <div key={e[0]} className="bg-blue-900 rounded-lg p-2">
            <span className="text-white">{`${e[0]}: `}</span>
            <span className="text-green-300">{e[1]}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 justify-center items-center mb-10">
        {orderedHashTable.map((e: any) => (
          <button
            onClick={(_) => {
              selectNumbers(Number(e[0]));
            }}
            key={e[0]}
            className="bg-blue-900 rounded-lg p-2"
          >
            <span className="text-green-200 px-2">{`${e[0]}`}</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          setNumberSelected([]);
        }}
        className="rounded-md bg-red-700 text-white text-sm float-start mb-2"
      >
        Clear
      </button>
      <TableroRuleta data={numberSelected} />

      <div>
        <p className="py-2">Numeros más repetidos</p>
        <div className="flex flex-wrap gap-3 justify-center items-center mb-10">
          {orderNumers().map((e: any) => (
            <div key={e[0]}>
              <p className="text-red-500 text-sm">{`${e[1]}`}</p>
              <button
                onClick={(_) => {
                  selectNumbersCount(Number(e[0]));
                }}
                className="bg-blue-900 rounded-lg p-2"
              >
                <span className="text-green-200 px-2">{`${e[0]}`}</span>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setNumberSelecteCount([]);
          }}
          className="rounded-md bg-red-700 text-white text-sm float-start mb-2"
        >
          Clear
        </button>
        <TableroRuleta data={numberSelecteCount} />
      </div>

      <div>
        <p className="py-2">Numeros q faltan</p>
        <div className="flex flex-wrap gap-3 justify-center items-center mb-10">
          {missingNumers().map((e: any) => (
            <button
              key={e}
              onClick={(_) => {
                selectNumbersMissing(Number(e));
              }}
              className="bg-blue-900 rounded-lg p-2"
            >
              <span className="text-green-200 px-2">{`${e}`}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            setNumberMissingState([]);
          }}
          className="rounded-md bg-red-700 text-white text-sm float-start mb-2"
        >
          Clear
        </button>
        <button
          onClick={() => {
            setNumberMissingState(missingNumers());
          }}
          className="rounded-md bg-red-700 text-white text-sm float-start mb-2"
        >
          Seleccionar todos
        </button>
        <TableroRuleta data={numberMissingState} />
      </div>
      <div className="card">
        {Array.from({ length: NUMBERS }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              clickSelectNumber(i);
            }}
          >
            {i}
          </button>
        ))}
      </div>
    <button
        onClick={() => {
          setArrClickedNumbers([]);
        }}
        className="rounded-md bg-red-700 text-white text-sm float-start mb-2"
      >
        Clear
      </button>
     
      <TableroRuleta data={arrClickedNumbers} />
    </>
  );
}