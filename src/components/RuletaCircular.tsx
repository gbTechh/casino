import React, { useEffect, useRef, useState } from 'react';

interface RouletteCircularBoardProps {
  rouletteNumbers: number[];
  max: number;
}

interface Position {
  x: number;
  y: number;
}

interface NumberPosition extends Position {
  number: number;
  angle: number;
}

export const RouletteCircularBoard: React.FC<RouletteCircularBoardProps> = ({ rouletteNumbers, max }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lastPositions, setLastPositions] = useState<NumberPosition[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  
  const europeanOrder: number[] = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  ];

  const getNumberColor = (num: number): string => {
    if (num === 0) return '#00AA00';
    const redNumbers: number[] = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? '#CC0000' : '#000000';
  };

  const getNumberPosition = (number: number, centerX: number, centerY: number, radius: number): NumberPosition => {
    const index = europeanOrder.indexOf(number);
    const angle = (index * 2 * Math.PI) / europeanOrder.length - Math.PI / 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    return { x, y, number, angle };
  };

  const calculateAngleDifference = (prevAngle: number, currentAngle: number): number => {
    let diff = currentAngle - prevAngle;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    return diff * (180 / Math.PI);
  };

  const drawBoard = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius - 40;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#2D5A2D';
    ctx.fillRect(0, 0, width, height);

    europeanOrder.forEach((number, index) => {
      const startAngle = (index * 2 * Math.PI) / europeanOrder.length - Math.PI / 2;
      const endAngle = ((index + 1) * 2 * Math.PI) / europeanOrder.length - Math.PI / 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = getNumberColor(number);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      const textAngle = startAngle + (endAngle - startAngle) / 2;
      const textRadius = outerRadius - 20;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(number.toString(), textX, textY);
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#1A4A1A';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const drawTrace = (ctx: CanvasRenderingContext2D) => {
    if (lastPositions.length < 2) return;

    // Si hay un número seleccionado, solo mostrar sus conexiones
    if (selectedNumber !== null) {
      // Encontrar todas las posiciones donde aparece el número seleccionado
      const selectedIndices: number[] = [];
      lastPositions.forEach((pos, index) => {
        if (pos.number === selectedNumber) {
          selectedIndices.push(index);
        }
      });

      // Dibujar solo las conexiones del número seleccionado
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);

      selectedIndices.forEach(index => {
        // Conexión con el número anterior
        if (index < lastPositions.length - 1) {
          const current = lastPositions[index];
          const prev = lastPositions[index + 1];
          
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(current.x, current.y);
          ctx.stroke();
        }
        
        // Conexión con el número siguiente
        if (index > 0) {
          const current = lastPositions[index];
          const next = lastPositions[index - 1];
          
          ctx.beginPath();
          ctx.moveTo(current.x, current.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      });

      // Dibujar todos los puntos con menor opacidad
      lastPositions.forEach((pos) => {
        const isSelected = pos.number === selectedNumber;
        const opacity = isSelected ? 1 : 0.9;
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? 'rgba(255, 215, 0, 1)' : `rgba(150, 150, 150, ${opacity})`;
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#FF0000' : '#FFFFFF';
        ctx.lineWidth = isSelected ? 3 : 1;
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#000000' : '#FFFFFF';
        ctx.font = isSelected ? 'bold 12px Arial' : 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pos.number.toString(), pos.x, pos.y);
      });

    } else {
      // Mostrar todas las conexiones (comportamiento original)
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);

      for (let i = 1; i < lastPositions.length; i++) {
        const prev = lastPositions[i - 1];
        const current = lastPositions[i];

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(current.x, current.y);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      lastPositions.forEach((pos, index) => {
        const opacity = 1 - (index * 0.04);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 12, 0, 2 * Math.PI);
        ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pos.number.toString(), pos.x, pos.y);
      });

      if (lastPositions.length > 0) {
        const lastPos = lastPositions[0];
        ctx.beginPath();
        ctx.arc(lastPos.x, lastPos.y, 18, 0, 2 * Math.PI);
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 4;
        ctx.stroke();
      }
    }
  };

  const [last20Numbers, setlast20Numbers] = useState<number[]>([]);

  useEffect(() => {
    const last20Numbers = rouletteNumbers.slice(0, max);
    setlast20Numbers(last20Numbers);
  }, [max, rouletteNumbers]);

  useEffect(() => {
    if (rouletteNumbers.length === 0) {
      setLastPositions([]);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 60;
    
    const newPositions = last20Numbers.map(number => 
      getNumberPosition(number, centerX, centerY, radius)
    );

    setLastPositions(newPositions);
  }, [rouletteNumbers, last20Numbers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 600;

    drawBoard(ctx, canvas.width, canvas.height);
    drawTrace(ctx);
  }, [lastPositions, selectedNumber]);

  const getMovementStats = () => {
    if (lastPositions.length < 2) return null;

    const movements = [];
    for (let i = 1; i < lastPositions.length; i++) {
      const angleDiff = calculateAngleDifference(lastPositions[i].angle, lastPositions[i - 1].angle);
      movements.push(Math.abs(angleDiff));
    }

    const avgMovement = movements.reduce((a, b) => a + b, 0) / movements.length;
    const maxMovement = Math.max(...movements);
    const minMovement = Math.min(...movements);

    return { avgMovement, maxMovement, minMovement };
  };

  const stats = getMovementStats();

  const handleNumberClick = (num: number) => {
    if (selectedNumber === num) {
      setSelectedNumber(null);
    } else {
      setSelectedNumber(num);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-green-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">
        🎯 Tablero Circular - Traza de Números
      </h2>
      
      {selectedNumber !== null && (
        <div className="mb-4 p-3 bg-yellow-500 text-black font-bold rounded-lg">
          Mostrando conexiones del número: {selectedNumber}
          <button 
            onClick={() => setSelectedNumber(null)}
            className="ml-3 bg-red-600 text-white px-3 py-1 rounded"
          >
            Limpiar filtro
          </button>
        </div>
      )}
      
      <div className="relative">
        <canvas 
          ref={canvasRef}
          className="border-4 border-yellow-400 rounded-full shadow-2xl"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
        
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        w-4 h-4 bg-white rounded-full border-2 border-red-500"></div>
      </div>

      {stats && (
        <div className="mt-6 grid grid-cols-3 gap-4 text-white">
          <div className="bg-blue-800 p-3 rounded-lg text-center">
            <div className="text-lg font-bold">{stats.avgMovement.toFixed(1)}°</div>
            <div className="text-sm">Movimiento Promedio</div>
          </div>
          <div className="bg-red-800 p-3 rounded-lg text-center">
            <div className="text-lg font-bold">{stats.maxMovement.toFixed(1)}°</div>
            <div className="text-sm">Máximo Salto</div>
          </div>
          <div className="bg-green-800 p-3 rounded-lg text-center">
            <div className="text-lg font-bold">{stats.minMovement.toFixed(1)}°</div>
            <div className="text-sm">Mínimo Salto</div>
          </div>
        </div>
      )}

      <div className="mt-4 w-full max-w-4xl">
        <h3 className="text-lg font-bold text-white mb-2">
          Últimos {max} números (Haz clic para filtrar):
        </h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {rouletteNumbers.slice(0, max).map((num, index) => {
            let angleDifference = 0;
            if (index < rouletteNumbers.slice(0,max).length - 1) {
              const currentNumber = num;
              const nextNumber = rouletteNumbers.slice(0, max)[index + 1];
              
              const currentIndex = europeanOrder.indexOf(currentNumber);
              const nextIndex = europeanOrder.indexOf(nextNumber);
              
              const currentAngle = (currentIndex * 360) / europeanOrder.length;
              const nextAngle = (nextIndex * 360) / europeanOrder.length;
              
              let diff = currentAngle - nextAngle;
              if (diff > 180) diff -= 360;
              if (diff < -180) diff += 360;
              
              angleDifference = Math.abs(diff);
            }

            const isSelected = selectedNumber === num;

            return (
              <div key={index} className="flex flex-col items-center">
                <button
                  onClick={() => handleNumberClick(num)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 transition-all cursor-pointer hover:scale-110 ${
                    isSelected ? 'border-yellow-400 scale-125 ring-4 ring-yellow-300' : 
                    index === 0 ? 'border-yellow-400 scale-110' : 'border-white'
                  } ${
                    num === 0 ? 'bg-green-600' : 
                    [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(num) 
                      ? 'bg-red-600' : 'bg-black'
                  }`}
                >
                  {num}
                </button>
                {index < rouletteNumbers.slice(0, max).length - 1 && (
                  <div className="text-xs text-yellow-300 mt-1 font-mono">
                    {angleDifference.toFixed(0)}°
                  </div>
                )}
                {index === 0 && !isSelected && (
                  <div className="text-xs text-gray-400 mt-1">
                    último
                  </div>
                )}
                {isSelected && (
                  <div className="text-xs text-yellow-300 mt-1 font-bold">
                    FILTRADO
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-white text-sm">
        <div className="flex items-center gap-4 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
            <span>Traza de movimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
            <span>Último número</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-yellow-300 ring-2 ring-yellow-300"></div>
            <span>Número seleccionado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
