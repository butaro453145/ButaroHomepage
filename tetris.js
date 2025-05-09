const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20, 20); // 1マス20px
let PieceBag = [];
let lastKickOffset = 0;

// テトリミノの形
function createPiece(type) {
  if (type === 'T') {
    return [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ];
  }else if (type === 'O') {
    return [
      [2, 2],
      [2, 2],
    ];
  } else if (type === 'L') {
    return [
      [0, 0, 3],
      [3, 3, 3],
      [0, 0, 0],
    ];
  } else if (type === 'J') {
    return [
      [4, 0, 0],
      [4, 4, 4],
      [0, 0, 0],
    ];
  } else if (type === 'I') {
    return [
      [0, 0, 0, 0],
      [5, 5, 5, 5],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ];
  }
}
//一巡七種
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function refillBag() {
  PieceBag = shuffle(['T', 'J', 'L', 'O', 'S', 'Z', 'I']);
}

function playerReset() {
  if (PieceBag.length === 0) {
    refillBag(); // バッグが空なら補充
  }
  const type = PieceBag.pop(); // バッグから1個取り出す

  player.matrix = createPiece(type);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - 
                 (player.matrix[0].length / 2 | 0);

  if (collide(arena, player)) {
    alert("Game Over!");
    arena.forEach(row => row.fill(0));
      player.score = 0;
      updateScore();

  }
  console.log("Next piece:", type);

}




// フィールド作成
function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

const colors = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // O
    '#0DFF72', // L
    '#F538FF', // J
    '#FF8E0D', // I
    '#FFE138', // S
    '#3877FF', // Z
  ];
  
  function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          context.fillStyle = colors[value];
          context.fillRect(x + offset.x, y + offset.y, 1, 1);
        }
      });
    });
  }
  

function merge(matrix, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        matrix[y + piece.pos.y][x + piece.pos.x] = value;
      }
    });
  });
}

function collide(matrix, piece) {
  const m = piece.matrix;
  const o = piece.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (matrix[y + o.y] &&
           matrix[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}


  
function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir = 1) {
  const m = player.matrix;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
    }
  }
  m.forEach(row => row.reverse());
  const pos = palayer.pos.x;
  let offset = 1;
  lastKickOffset=0;
  while (collide(arena, player)) {
    player.pos.x += offset;
    lastKickOffset = offset; // ←★ ズレを記録！
    offset = -(offset + (offset > 0 ? 1 : -1));

    if (Math.abs(offset) > m[0].length) {
      // 元に戻す
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
      }
      m.forEach(row => row.reverse());
      player.pos.x = pos;
      lastKickOffset = 0;
      return;
    }
  }
    
  
  const rightLimit = arena[0].length - player.matrix[0].length;
  if (player.pos.x > rightLimit) {
    player.pos.x = rightLimit;
  }
  if (player.pos.x < 0) {
    player.pos.x = 0;
  }
  // ←★ ここまで
}


document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") playerMove(-1);
  else if (event.key === "ArrowRight") playerMove(1);
  else if (event.key === "ArrowDown") playerDrop();
  else if (event.key === " ") playerRotate();
});

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x:0, y:0});
  drawMatrix(player.matrix, player.pos);
}

function arenaSweep() {
    let rowCount = 1;
    let score = 0;
  
    outer: for (let y = arena.length - 1; y >= 0; --y) {
      for (let x = 0; x < arena[y].length; ++x) {
        if (arena[y][x] === 0) {
          continue outer;
        }
      }
  
      // ラインを1行消す
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row); // 上に空行を追加
      ++y;
  
      score += rowCount * 10;
      rowCount *= 2;
    }
  
    player.score += score;
  }
  function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
      player.pos.y--;
      merge(arena, player);
      arenaSweep(); // ← 追加ここ！
      playerReset();
    }
    dropCounter = 0;
  }

  function isTPiece(matrix) {
    return matrix.length === 3 &&
           matrix[0][1] && matrix[1][0] && matrix[1][1] && matrix[1][2];
  }
  

  function updateScore() {
    document.getElementById('score').innerText = player.score;
  }   
  
  function handleInput(command) {
  if (command === 'left') {
    playerMove(-1);
  } else if (command === 'right') {
    playerMove(1);
  } else if (command === 'down') {
    playerDrop();
  } else if (command === 'rotate') {
    playerRotate(1); // ←回転方向（右回転）
  }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  updateScore();
  requestAnimationFrame(update);
}

// 初期化
const arena = createMatrix(10, 20);
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score:0
};

playerReset();
update();
