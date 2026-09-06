// utils/game2048.js - 순수 연산 모듈 (1차원 배열 압축 & 합체)
function slideAndMergeRow(row) {
  // 1. 0 제거 (밀착)
  let filtered = row.filter(val => val !== 0);
  let scoreGained = 0;

  // 2. 왼쪽 기준 인접 타일 병합
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      scoreGained += filtered[i];
      filtered[i + 1] = 0;
      i++; // 한 번 합쳐진 타일은 중복 병합 불가
    }
  }

  // 3. 다시 0 제거 후 4칸 채우기
  filtered = filtered.filter(val => val !== 0);
  while (filtered.length < 4) {
    filtered.push(0);
  }

  return { newRow: filtered, scoreGained };
}

// 오른쪽 이동: 행을 반전(reverse) -> 왼쪽 슬라이드 -> 다시 반전
export function moveRight(board) {
  let newBoard = [];
  let totalScore = 0;

  for (let r = 0; r < 4; r++) {
    const reversed = [...board[r]].reverse();
    const { newRow, scoreGained } = slideAndMergeRow(reversed);
    newBoard.push(newRow.reverse());
    totalScore += scoreGained;
  }

  return { newBoard, totalScore };
}