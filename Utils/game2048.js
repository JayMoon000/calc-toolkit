// game2048.js - 순수 연산 모듈 (Zero Framework Dependency)

export const GRID_SIZE = 4;

// 1. 단일 라인 압축 & 합체 (순수 함수)
export function slideAndMerge(line) {
  let filtered = line.filter(val => val !== 0);
  let score = 0;

  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered[i + 1] = 0;
      i++; // 1턴 1회 병합 원칙
    }
  }

  filtered = filtered.filter(val => val !== 0);
  while (filtered.length < GRID_SIZE) {
    filtered.push(0);
  }

  return { newLine: filtered, score };
}

// 2. 4방향 계산 함수 (행/열 매핑 절대 안 꼬이게 작성)
export function move(board, direction) {
  let newBoard = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  let totalScore = 0;

  if (direction === 'LEFT') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const { newLine, score } = slideAndMerge(board[r]);
      newBoard[r] = newLine;
      totalScore += score;
    }
  } else if (direction === 'RIGHT') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const reversed = [...board[r]].reverse();
      const { newLine, score } = slideAndMerge(reversed);
      newBoard[r] = newLine.reverse();
      totalScore += score;
    }
  } else if (direction === 'UP') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const column = [board[0][c], board[1][c], board[2][c], board[3][c]];
      const { newLine, score } = slideAndMerge(column);
      for (let r = 0; r < GRID_SIZE; r++) newBoard[r][c] = newLine[r];
      totalScore += score;
    }
  } else if (direction === 'DOWN') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const column = [board[3][c], board[2][c], board[1][c], board[0][c]];
      const { newLine, score } = slideAndMerge(column);
      for (let r = 0; r < GRID_SIZE; r++) newBoard[3 - r][c] = newLine[r];
      totalScore += score;
    }
  }

  // 보드 변화 감지
  let moved = false;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] !== newBoard[r][c]) {
        moved = true;
        break;
      }
    }
  }

  return { newBoard, totalScore, moved };
}

// 3. 빈칸 랜덤 타일 생성
export function addRandomTile(board) {
  const emptyCoords = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r][c] === 0) emptyCoords.push({ r, c });
    }
  }
  if (emptyCoords.length === 0) return board;

  const { r, c } = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const nextBoard = board.map(row => [...row]);
  nextBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return nextBoard;
}