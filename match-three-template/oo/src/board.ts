export type Generator<T>= { next:() => T } 

export type Position = {
    row: number,
    col: number
}

export type Match<T> = {
    matched: T,
    positions: Position[]
}

type RefillEvent = {
    kind: 'Refill'
}

type MatchEvent<T> = {
    kind: 'Match',
    match: Match<T>
}

export type BoardEvent<T> = RefillEvent | MatchEvent<T>;

export type BoardListener<T> = (event: BoardEvent<T>) => void;

export type Tile<T> = {
    position : Position,
    value : T
}

export class Board<T> {
    private generator: Generator<T>
    readonly width: number
    readonly height: number
    private boardListeners: BoardListener<T>[] = []
    private tiles: Tile<T>[] = []

    constructor(generator: Generator<T>, width: number, height: number) {
        this.generator = generator
        this.width = width
        this.height = height

        this.generateBoard(width, height);
    }

    private generateBoard(width: number, height: number) {

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let position: Position = {row: i, col: j};
                this.tiles.push({position: position, value: this.generator.next()});
            }
        }
    }

    addListener(listener: BoardListener<T>) {
        this.boardListeners.push(listener);
    }

    positions(): Position[] {
        return this.tiles.map(tile => tile.position);
    }

    piece(p: Position): T | undefined {
        let exists = this.tiles.find(tile => tile.position.col === p.col && tile.position.row === p.row);
        if (!exists) return undefined;

        return this.getTileValue(p);
    }

    private checkMatchingTiles(tileValue: T, matchingTiles: T[]) : boolean {

        if (matchingTiles.length === 0){
            matchingTiles.push(tileValue);
            return false;
        }

        if (!(tileValue === matchingTiles[matchingTiles.length - 1])) {
            while (matchingTiles.length > 0){
                matchingTiles.pop();
            }
        }
        matchingTiles.push(tileValue);

        return matchingTiles.length >= 3;
    }

    private isMoveDiagonal(first: Position, second: Position) : boolean {
        if(!(first.col === second.col || first.row === second.row)) return true;
    }

    private isMoveOutOfBound(first: Position, second: Position) {
        return this.isPositionUndefined(first) || this.isPositionUndefined(second);
    }

    private isPositionUndefined(p: Position) {
        return !this.tiles.find(tile => tile.position.col === p.col && tile.position.row === p.row);
    }

    canMove(first: Position, second: Position): boolean {

        if(this.isMoveDiagonal(first, second)) return false;

        if(this.isMoveOutOfBound(first, second)) return false;

        let matchingTiles = [];

        this.swapTiles(first, second);

        //Col
        for (let i = 0; i < this.height; i++){
            let tileValue = this.getTileValue({row : i, col : first.col})

            if (this.checkMatchingTiles(tileValue, matchingTiles)) {
                this.swapTiles(first, second);
                return true;
            }
        }

        matchingTiles = [];
        for (let i = 0; i < this.height; i++){
            let tileValue = this.getTileValue({row : i, col : second.col})

            if (this.checkMatchingTiles(tileValue, matchingTiles)) {
                this.swapTiles(first, second);
                return true;
            }
        }

        //Row
        matchingTiles = [];
        for (let i = 0; i < this.width; i++){
            let tileValue = this.getTileValue({row : first.row, col : i})

            if (this.checkMatchingTiles(tileValue, matchingTiles)) {
                this.swapTiles(first, second);
                return true;
            }
        }

        matchingTiles = [];
        for (let i = 0; i < this.width; i++){
            let tileValue = this.getTileValue({row : second.row, col : i})

            if (this.checkMatchingTiles(tileValue, matchingTiles)) {
                this.swapTiles(first, second);
                return true;
            }
        }

        this.swapTiles(first, second);
        return false;
    }
    
    swapTiles(first: Position, second: Position) {
        let firstValue = this.getTileValue(first);
        let secondValue = this.getTileValue(second);

        this.setTile(first, secondValue);
        this.setTile(second, firstValue);
    }

    move(first: Position, second: Position){
        if (this.canMove(first, second)) {
            this.swapTiles(first, second);

            let matchEvents = this.checkForMatches();

            //remove matches
            this.removeTiles(matchEvents);

            //refill board
            this.refillBoard();

            //check for matches
            //matchEvents = this.checkForMatches();

            // do {
            //     //remove matches
            //     this.removeTiles(matchEvents);
            //
            //     //refill board
            //     this.refillBoard();
            //
            //     //check for matches
            //     matchEvents = this.checkForMatches();
            //
            // } while (matchEvents.length > 0)


        }
    }

    private removeTiles(matchEvents: MatchEvent<T>[]) {
        for (let matchEvent of matchEvents) {
            matchEvent.match.positions.map(pos => {
                this.setTile(pos, "*" as T);
            });
        }
    }

    private checkForMatches() : MatchEvent<T>[] {
        let matchEvents = [];
        this.checkRowOrCol(true, matchEvents);
        this.checkRowOrCol(false, matchEvents);

        return matchEvents;
    }

    private checkRowOrCol(isRow: boolean, matchEvents: MatchEvent<T>[]) {

        let firstLoopIterations: number;
        let secondLoopIterations: number;

        if (!isRow){
            firstLoopIterations = this.width;
            secondLoopIterations = this.height;
        }
        else {
            firstLoopIterations = this.height;
            secondLoopIterations = this.width;
        }

        for (let i = 0; i < firstLoopIterations; i++) {
            let compareArr: Tile<T>[] = [];
            for (let j = 0; j < secondLoopIterations; j++) {
                let tile: Tile<T>;
                isRow ? tile = this.getTile(i, j) : tile = this.getTile(j, i);

                if (compareArr.length === 0) {
                    compareArr.push(tile);
                    continue;
                }

                if (!(tile.value === compareArr[0].value)) {
                    if (compareArr.length >= 3){
                        let matchEvent: MatchEvent<T> = {
                            kind: "Match",
                            match: {matched: compareArr[0].value,
                                    positions: compareArr.map(tile => tile.position)}
                        }
                        matchEvents.push(matchEvent);
                        this.fireEvent(matchEvent);
                    }
                    while (compareArr.length > 0){
                        compareArr.pop();
                    }
                }
                compareArr.push(tile);
            }

            if (compareArr.length >= 3){
                let matchEvent: MatchEvent<T> = {
                    kind: "Match",
                    match: {matched: compareArr[0].value,
                        positions: compareArr.map(tile => tile.position)}
                }
                matchEvents.push(matchEvent);
                this.fireEvent(matchEvent);
            }
        }
    }

    private getTile(row: number, col: number) : Tile<T>{
        return this.tiles.find(tile => tile.position.col === col && tile.position.row === row)
    }

    getTileIndex(p: Position){
        return p.row * this.width + p.col
    }

    getTileValue(p: Position) {
        return this.tiles.find(tile => tile.position.col === p.col && tile.position.row === p.row).value;
    }

    setTile(p: Position, value : T){
        this.tiles.find(tile => tile.position.col === p.col && tile.position.row === p.row).value = value;
    }

    private fireEvent(boardEvent: BoardEvent<T>) {
        for (let listener of this.boardListeners){
            listener(boardEvent);
        }
    }

    private refillBoard() {

    }
}