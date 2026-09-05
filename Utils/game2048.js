/**
 * 2048 순수 연산 로직 (Zero-dependency)
 */
const Game2048Core = {
  // 빈 보드 생성
  createBoard(size = 4) {
    return Array.from({ length: size }, () => Array(size).fill(0));
  },

  // 한 행 왼쪽 밀기 & 합치기
  slideAndCombine(row) {
    let arr = row.filter(val => val !== 0);
    let scoreGained = 0;

    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        scoreGained += arr[i];
        arr[i + 1] = 0;
      }
    }

    arr = arr.filter(val => val !== 0);
    while (arr.length < row.length) {
      arr.push(0);
    }

    return { newRow: arr, scoreGained };
  },

  // 방향별 보드 이동 (left, right, up, down)
  move(board, direction) {
    const size = board.length;
    let newBoard = board.map(r => [...r]);
    let totalScore = 0;

    const rotate = (matrix) => matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());

    let rotations = 0;
    if (direction === 'up') rotations = 3;
    if (direction === 'right') rotations = 2;
    if (direction === 'down') rotations = 1;

    for (let i = 0; i < rotations; i++) newBoard = rotate(newBoard);

    for (let i = 0; i < size; i++) {
      const res = this.slideAndCombine(newBoard[i]);
      newBoard[i] = res.newRow;
      totalScore += res.scoreGained;
    }

    const backRotations = (4 - rotations) % 4;
    for (let i = 0; i < backRotations; i++) newBoard = rotate(newBoard);

    return { newBoard, totalScore };
  }
};