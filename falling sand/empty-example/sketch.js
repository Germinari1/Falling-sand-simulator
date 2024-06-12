/*-=-=--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=
//* Author: Lucas Germinari
//* Description: Falling sand simulator
//* Notes:
-=-=--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=*/

// Define global constants and variables
const GRID_WIDTH = 600;
const GRID_HEIGHT = 500;
const CELL_SIZE = 5;
const COLS = GRID_WIDTH / CELL_SIZE;
const ROWS = GRID_HEIGHT / CELL_SIZE;
const GRAVITY = 0.1;
const EROSION_RADIUS = 1;
const SAND_PROBABILITY = 0.75;
const MATRIX_SIZE = 5;
const EXTENT = Math.floor(MATRIX_SIZE / 2);

let grid;
let velocityGrid;
let hueValue = 200;
let toolMode = 'sand';

// General event listener for existing buttons
document.addEventListener('DOMContentLoaded', function() {
    const clearButton = document.getElementById('clearButton');
    const eraserButton = document.getElementById('eraserButton');
  
    clearButton.addEventListener('click', clearCanvas);
  
    eraserButton.addEventListener('click', function() {
        toolMode = toolMode === 'sand' ? 'eraser' : 'sand';
        const isEraserMode = toolMode === 'eraser';
        eraserButton.style.backgroundColor = isEraserMode ? '#e53935' : '#5e89a8';
        eraserButton.textContent = isEraserMode ? 'Exit Eraser' : 'Eraser';
        eraserButton.classList.toggle('eraser-mode', isEraserMode);
      });
  });

// Function to create a 2D array
function make2DArray(cols, rows) {
  return Array.from({ length: cols }, () => Array.from({ length: rows }, () => 0));
}

// Check if a row is within the bounds
function withinCols(i) {
  return i >= 0 && i < COLS;
}

// Clear the canva
function clearCanvas() {
    grid = make2DArray(COLS, ROWS);
    velocityGrid = make2DArray(COLS, ROWS);
  }

// Check if a column is within the bounds
function withinRows(j) {
  return j >= 0 && j < ROWS;
}

function setup() {
  createCanvas(GRID_WIDTH, GRID_HEIGHT);
  colorMode(HSB, 360, 255, 255);
  grid = make2DArray(COLS, ROWS);
  velocityGrid = make2DArray(COLS, ROWS);
}

function mouseDragged() {
    const mouseCol = Math.floor(mouseX / CELL_SIZE);
    const mouseRow = Math.floor(mouseY / CELL_SIZE);
  
    if (toolMode === 'sand') {
      // Randomly add an area of sand particles
      for (let i = -EXTENT; i <= EXTENT; i++) {
        for (let j = -EXTENT; j <= EXTENT; j++) {
          if (random(1) < SAND_PROBABILITY) {
            const col = mouseCol + i;
            const row = mouseRow + j;
            if (withinCols(col) && withinRows(row)) {
              grid[col][row] = hueValue;
              velocityGrid[col][row] = 1;
            }
          }
        }
      }
  
      // Change the color of the sand over time
      hueValue = (hueValue + 0.5) % 360;
    } else if (toolMode === 'eraser') {
      // Erode the sand in the surrounding area
      const erosionRadius = EROSION_RADIUS;
      for (let i = -erosionRadius; i <= erosionRadius; i++) {
        for (let j = -erosionRadius; j <= erosionRadius; j++) {
          const col = mouseCol + i;
          const row = mouseRow + j;
          if (withinCols(col) && withinRows(row) && grid[col][row] > 0) {
            const erosionChance = 0.5;
            if (random(1) < erosionChance) {
              grid[col][row] = 0;
              velocityGrid[col][row] = 0;
            }
          }
        }
      }
    }
  }

function draw() {
  background(0);

  // Draw the sand
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      if (grid[i][j] > 0) {
        noStroke();
        fill(grid[i][j], 255, 255);
        const x = i * CELL_SIZE;
        const y = j * CELL_SIZE;
        square(x, y, CELL_SIZE);
      }
    }
  }

  // Create a 2D array for the next frame of animation
  const nextGrid = make2DArray(COLS, ROWS);
  const nextVelocityGrid = make2DArray(COLS, ROWS);

  // Check every cell
  for (let i = 0; i < COLS; i++) {
    for (let j = 0; j < ROWS; j++) {
      const state = grid[i][j];
      const velocity = velocityGrid[i][j];
      let moved = false;

      if (state > 0) {
        let newPos = Math.floor(j + velocity);
        for (let y = newPos; y > j; y--) {
          const below = grid[i][y];
          const dir = random(1) < 0.5 ? -1 : 1;
          const belowA = withinCols(i + dir) ? grid[i + dir][y] : -1;
          const belowB = withinCols(i - dir) ? grid[i - dir][y] : -1;

          if (below === 0) {
            nextGrid[i][y] = state;
            nextVelocityGrid[i][y] = velocity + GRAVITY;
            moved = true;
            break;
          } else if (belowA === 0) {
            nextGrid[i + dir][y] = state;
            nextVelocityGrid[i + dir][y] = velocity + GRAVITY;
            moved = true;
            break;
          } else if (belowB === 0) {
            nextGrid[i - dir][y] = state;
            nextVelocityGrid[i - dir][y] = velocity + GRAVITY;
            moved = true;
            break;
          }
        }
      }

      if (state > 0 && !moved) {
        nextGrid[i][j] = grid[i][j];
        nextVelocityGrid[i][j] = velocityGrid[i][j] + GRAVITY;
      }
    }
  }

  grid = nextGrid;
  velocityGrid = nextVelocityGrid;
}