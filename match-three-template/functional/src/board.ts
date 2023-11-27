export type Generator<T> = { next: () => T };

export type Position = {
  row: number;
  col: number;
};

export type Match<T> = {
  matched: T;
  positions: Position[];
};

export type Board<T> = {
  width: number;
  height: number;
  tiles: T[][];
  matchListener?: (matches: Match<T>[]) => void; // Listener for matches
};

export type Effect<T> = {
  kind: 'Match' | 'Refill';
  match?: Match<T>;
  board?: Board<T>;
};

export type MoveResult<T> = {
  board: Board<T>;
  effects: Effect<T>[];
};

export function create<T>(generator: Generator<T>, width: number, height: number): Board<T> {
  const tiles: T[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => generator.next())
  );

  return { width, height, tiles };
}

export function positions<T>(board: Board<T>): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < board.height; row++) {
    for (let col = 0; col < board.width; col++) {
      positions.push({ row, col });
    }
  }
  return positions;
}

export function piece<T>(board: Board<T>, p: Position): T | undefined {
  return board.tiles[p.row]?.[p.col];
}

export function canMove<T>(board: Board<T>, first: Position, second: Position): boolean {
  const validRow = first.row === second.row;
  const validCol = first.col === second.col;

  if (!validRow && !validCol) {
    return false;
  }

  const tileAtFirst = piece(board, first);
  const tileAtSecond = piece(board, second);

  return (
    tileAtFirst !== undefined &&
    tileAtSecond !== undefined &&
    tileAtFirst !== tileAtSecond &&
    // Ensure the moved piece is not counted
    piece(board, first) === tileAtFirst
  );
}

export function move<T>(
  generator: Generator<T>,
  board: Board<T>,
  first: Position,
  second: Position
): MoveResult<T> {
  const newBoard = { ...board };
  const effects: Effect<T>[] = [];

  // Check for matches before the swap
  checkMatches(newBoard, effects);

  // Check if the move is valid
  if (!canMove(board, first, second)) {
    // If the move is not valid, return the current state with no effects
    return { board: newBoard, effects };
  }

  // Swap tiles only on valid moves
  const tempTile = newBoard.tiles[first.row][first.col];
  newBoard.tiles[first.row][first.col] = newBoard.tiles[second.row][second.col];
  newBoard.tiles[second.row][second.col] = tempTile;

  // Check for matches after the swap
  checkMatches(newBoard, effects);

  // Refill the board
  refillBoard(generator, newBoard);

  // Update effects based on the final state of the board
  effects.push({ kind: 'Refill', board: { ...newBoard } });

  return { board: newBoard, effects };
}

function checkMatches<T>(board: Board<T>, effects: Effect<T>[]): void {
  const matches: Match<T>[] = [];

  // Check horizontal matches
  for (let rowIndex = 0; rowIndex < board.height; rowIndex++) {
    checkMatchesInRow(rowIndex, board, matches);
  }

  // Check vertical matches
  for (let colIndex = 0; colIndex < board.width; colIndex++) {
    checkMatchesInCol(colIndex, board, matches);
  }

  // Remove and handle matches
  matches.forEach((match) => {
    effects.push({ kind: 'Match', match });
    removeMatchedTiles(match, board);
  });

  // Notify the listener
  if (board.matchListener && matches.length > 0) {
    board.matchListener(matches);
  }
}

function checkMatchesInRow<T>(index: number, board: Board<T>, matches: Match<T>[]): void {
  let currentTile = piece(board, { row: index, col: 0 });
  let currentMatch: Match<T> | null = { matched: currentTile, positions: [{ row: index, col: 0 }] };

  for (let colIndex = 1; colIndex < board.width; colIndex++) {
    const tile = piece(board, { row: index, col: colIndex });

    if (tile === currentTile) {
      currentMatch?.positions.push({ row: index, col: colIndex });
    } else {
      if (currentMatch && currentMatch.positions.length >= 3) {
        matches.push(currentMatch);
      }

      currentTile = tile;
      currentMatch = { matched: currentTile, positions: [{ row: index, col: colIndex }] };
    }
  }

  if (currentMatch && currentMatch.positions.length >= 3) {
    matches.push(currentMatch);
  }
}


function checkMatchesInCol<T>(index: number, board: Board<T>, matches: Match<T>[]): void {
  let currentTile = piece(board, { row: 0, col: index });
  let currentMatch: Match<T> | null = { matched: currentTile, positions: [{ row: 0, col: index }] };

  for (let rowIndex = 1; rowIndex < board.height; rowIndex++) {
    const tile = piece(board, { row: rowIndex, col: index });

    if (tile === currentTile) {
      currentMatch?.positions.push({ row: rowIndex, col: index });
    } else {
      if (currentMatch && currentMatch.positions.length >= 3) {
        matches.push(currentMatch);
      }

      currentTile = tile;
      currentMatch= { matched: currentTile, positions: [{ row: rowIndex, col: index }] };
    }
  }

  if (currentMatch && currentMatch.positions.length >= 3) {
    matches.push(currentMatch);
  }
}

function removeMatchedTiles<T>(match: Match<T>, board: Board<T>): void {
  match.positions.forEach((position) => {
    board.tiles[position.row][position.col] = null!;
  });
}

function refillBoard<T>(generator: Generator<T>, board: Board<T>): void {
  const removedMatches: Match<T>[] = []; // Store removed matches during refill

  for (let col = 0; col < board.width; col++) {
    let emptyCount = 0;

    for (let row = board.height - 1; row >= 0; row--) {
      if (board.tiles[row][col] === null) {
        emptyCount++;
      } else if (emptyCount > 0) {
        // Shift non-empty tiles down
        const newRow = row + emptyCount;
        board.tiles[newRow][col] = board.tiles[row][col];
        board.tiles[row][col] = null!;
      }
    }

    // Refill from the top
    for (let i = 0; i < emptyCount; i++) {
      const newRow = i;
      board.tiles[newRow][col] = generator.next();
    }

    // Check for matches in the refilled column
    checkMatchesInCol(col, board, removedMatches);
  }

  // Notify the listener if matches were removed during refill
  if (board.matchListener && removedMatches.length > 0) {
    board.matchListener(removedMatches);
  }
}

export function setMatchListener<T>(board: Board<T>, listener: (matches: Match<T>[]) => void): void {
  board.matchListener = listener;
}

export function removeMatchListener<T>(board: Board<T>): void {
  board.matchListener = undefined;
}