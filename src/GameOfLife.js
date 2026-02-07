import React, { useState, useCallback, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const numCols = 30;
const numRows = 20;
const cellSize = 20;

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
];

const generateEmptyGrid = () => {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    var cols = []
    for (let j = 0; j < numCols; j++) {
      cols.push(0);
    }
    rows.push(cols)
  }
  return rows;
};

const getCellColor = (age) => {
  if (age === 0) return '#1f2937'; // dead cell
  
  // Interpolate from dark green to bright cyan based on age
  const maxAge = 20; // Cap brightness at age 20
  const normalized = Math.min(age / maxAge, 1);
  
  // Start: #059669 (darker green), End: #10b981 -> #34d399 -> #6ee7b7 (bright cyan)
  const r = Math.floor(5 + normalized * 105); // 5 -> 110
  const g = Math.floor(150 + normalized * 105); // 150 -> 255
  const b = Math.floor(105 + normalized * 78); // 105 -> 183
  
  return `rgb(${r}, ${g}, ${b})`;
};

const GameOfLife = () => {
  const [grid, setGrid] = useState(() => generateEmptyGrid());
  const [running, setRunning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState(null); // 'alive' or 'dead'
  const runningRef = useRef(running);
  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    setGrid(g => {
      const newGrid = g.map((row, i) =>
        row.map((cell, j) => {
          let neighbors = 0;
          operations.forEach(([x, y]) => {
            const newI = i + x;
            const newJ = j + y;
            if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
              neighbors += g[newI][newJ] > 0 ? 1 : 0;
            }
          });

          if (cell > 0) {
            // Cell is alive
            if (neighbors < 2 || neighbors > 3) {
              return 0; // Dies
            } else {
              return cell + 1; // Survives and ages
            }
          } else {
            // Cell is dead
            if (neighbors === 3) {
              return 1; // Becomes alive with age 1
            } else {
              return 0; // Stays dead
            }
          }
        })
      );
      console.log(newGrid)
      return newGrid;
    });

    setTimeout(runSimulation, 100);
  }, []);

  const toggleCell = (i, j) => {
    if (running) return;
    
    const newGrid = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (rowIndex === i && colIndex === j) {
          if (drawMode === null) {
            // First click - determine mode
            return cell > 0 ? 0 : 1;
          } else {
            // Drawing - use the determined mode
            return drawMode === 'alive' ? 1 : 0;
          }
        }
        return cell;
      })
    );
    setGrid(newGrid);
  };

  const handleMouseDown = (i, j) => {
    if (running) return;
    setIsDrawing(true);
    // Set draw mode based on current cell state
    setDrawMode(grid[i][j] > 0 ? 'dead' : 'alive');
    toggleCell(i, j);
  };

  const handleMouseEnter = (i, j) => {
    if (isDrawing && !running) {
      toggleCell(i, j);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setDrawMode(null);
  };

  const randomize = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0)));
    }
    setGrid(rows);
  };

  const clear = () => {
    setGrid(generateEmptyGrid());
    setRunning(false);
  };

  return (
    <div 
      className="container-fluid min-vh-100 d-flex flex-column align-items-center justify-content-center py-5"
      style={{
        backgroundColor: '#1a1a2e',
        userSelect: 'none'
      }}
      onMouseUp={handleMouseUp}
    >
      <h1 className="text-white mb-4">Conway's Game of Life</h1>
      
      <div className="mb-4 d-flex gap-3">
        <button
          onClick={() => {
            setRunning(!running);
            if (!running) {
              runningRef.current = true;
              runSimulation();
            }
          }}
          className={`btn ${running ? 'btn-danger' : 'btn-success'} btn-lg`}
        >
          {running ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={randomize}
          disabled={running}
          className="btn btn-primary btn-lg"
        >
          Randomize
        </button>
        <button
          onClick={clear}
          className="btn btn-danger btn-lg"
        >
          Clear
        </button>
      </div>

      <div
        className="p-1 rounded"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${numCols}, ${cellSize}px`,
          gap: '1px',
          backgroundColor: '#374151'
        }}
      >
        {grid.map((rows, i) =>
          rows.map((col, j) => (
            <div
              key={`${i}-${j}`}
              onMouseDown={() => handleMouseDown(i, j)}
              onMouseEnter={() => handleMouseEnter(i, j)}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: getCellColor(grid[i][j]),
                cursor: running ? 'default' : 'pointer',
                transition: 'background-color 0.1s'
              }}
            />
          ))
        )}
      </div>

      <div className="mt-4 text-center" style={{ color: '#d1d5db', maxWidth: '600px' }}>
        <p className="mb-2">
          Click and drag to draw cells. Press Start to begin the simulation.
        </p>
        <p className="small">
          Rules: A live cell with 2-3 neighbors survives. A dead cell with exactly 3 neighbors becomes alive. All other cells die or stay dead.
        </p>
      </div>
    </div>
  );
};

export default GameOfLife;