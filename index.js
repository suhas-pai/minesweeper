const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

let rowCount = 0;
let columnCount = 0;

const getRandomPosition = () => {
  return {
    row: getRandomNumber(0, rowCount),
    column: getRandomNumber(0, columnCount),
  };
};

const positionsMatch = (left, right) => {
  return left.row == right.row && left.column == right.column;
};

const getRandomPositionList = (amt, exclude) => {
  const arr = [];
  let position;

  const arrFindFunc = (arrPos) => positionsMatch(position, arrPos);
  for (let i = 0; i !== amt; i++) {
    while (true) {
      position = getRandomPosition();
      if (positionsMatch(position, exclude)) {
        continue;
      }

      if (arr.find(arrFindFunc) != null) {
        continue;
      }

      arr.push(position);
      break;
    }
  }

  return arr;
};

let app = null;
let gameOverText = document.createElement("h2");
let mineList = [];
let restartButton = null;
let isGameOver = false;

const grid = document.createElement("div");
const gridItem = document.createElement("div");

gameOverText.className = "game_over";
grid.className = "grid";
gridItem.className = "grid_item";

const findInMineList = (node) => {
  return mineList.find((e) => positionsMatch(e, node)) != null;
};

const checkRowForMines = (row, column, columnNotAtFront, columnNotAtBack) => {
  let count = 0;
  if (columnNotAtFront) {
    if (findInMineList({ row: row, column: column - 1 })) {
      count += 1;
    }
  }

  if (findInMineList({ row: row, column: column })) {
    count += 1;
  }

  if (columnNotAtBack) {
    if (findInMineList({ row: row, column: column + 1 })) {
      count += 1;
    }
  }

  return count;
};

const getCountOfAdjacentMines = (node) => {
  const rowNotAtFront = node.row != 0;
  const columnNotAtFront = node.column != 0;

  const rowNotAtBack = node.row != rowCount - 1;
  const columnNotAtBack = node.column != columnCount - 1;

  let count = 0;

  // Check row above node.
  if (rowNotAtFront) {
    count += checkRowForMines(
      node.row - 1,
      node.column,
      columnNotAtFront,
      columnNotAtBack
    );
  }

  // Check to the left and right side of node.
  if (columnNotAtFront) {
    if (findInMineList({ row: node.row, column: node.column - 1 })) {
      count += 1;
    }
  }

  if (columnNotAtBack) {
    if (findInMineList({ row: node.row, column: node.column + 1 })) {
      count += 1;
    }
  }

  // check the row below node.
  if (rowNotAtBack) {
    count += checkRowForMines(
      node.row + 1,
      node.column,
      columnNotAtFront,
      columnNotAtBack
    );
  }

  return count;
};

const finishGame = (status) => {
  isGameOver = true;

  console.log("Finishing game");
  gameOverText.innerHTML = `Game Over, You ${status}`;

  app.innerHTML = "";
  app.appendChild(gameOverText);

  restartButton.style.display = "flex";
};

const runGame = () => {
  const MIN_DIMENSION = 4;
  const MAX_DIMENSION = 9;

  rowCount = getRandomNumber(MIN_DIMENSION, MAX_DIMENSION);
  columnCount = getRandomNumber(MIN_DIMENSION, MAX_DIMENSION);

  const totalSize = rowCount * columnCount;

  grid.style.gridTemplateRows = "1fr ".repeat(rowCount);
  grid.style.gridTemplateColumns = "1fr ".repeat(columnCount);

  app.appendChild(grid);
  for (let i = 0; i !== totalSize; i++) {
    grid.appendChild(gridItem.cloneNode());
  }

  const mineCount = Math.floor(totalSize / 5);
  mineList.length = 0;

  let tilesLeft = totalSize;
  const handleClick = (event) => {
    const node = event.target;

    node.removeEventListener("click", handleClick, false);
    node.style.backgroundColor = "#e3e2e2";

    if (mineList.length == 0) {
      mineList = getRandomPositionList(mineCount, {
        row: node.row,
        column: node.column,
      });

      console.log(mineList);
    } else {
      if (findInMineList(node)) {
        console.log(`Lost: (${node.row}, ${node.column})`);
        finishGame("Lost");

        return;
      }
    }

    node.innerHTML = getCountOfAdjacentMines(node);
    tilesLeft -= 1;

    if (tilesLeft == mineCount) {
      finishGame("Won");
    }
  };

  // Necessary here because we can't set innerHTML earlier (for whatever reason)
  for (let i = 0; i !== totalSize; i++) {
    const node = grid.childNodes[i];

    node.innerHTML = "Mine or Nothing";
    node.style.backgroundColor = "white";
    node.addEventListener("click", handleClick, false);

    node.row = Math.floor(i / columnCount);
    node.column = i % columnCount;
  }

  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
      return;
    }

    if (isGameOver) {
      if (event.key.toString() == "Enter") {
        restartButton.click();
      }
    }

    event.preventDefault();
  });
};

document.addEventListener("DOMContentLoaded", () => {
  app = document.getElementById("app");
  restartButton = document.getElementById("restart_button");
  restartButton.onclick = () => {
    isGameOver = false;

    app.innerHTML = "";
    grid.innerHTML = "";
    mineList.length = 0;
    restartButton.style.display = "none";

    runGame();
  };

  runGame();
});
