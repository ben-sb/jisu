export class SourcePosition {
    line: number;
    column: number;
    position: number;

    /**
     * Creates a new source position.
     * @param line The line number.
     * @param column The column number.
     * @param index The overall position in the input.
     */
    constructor(line: number, column: number, position: number) {
        this.line = line;
        this.column = column;
        this.position = position;
    }
}

export class SourceLocation {
    start: SourcePosition;
    end: SourcePosition;

    /**
     * Creates a new source location.
     * @param start The start position.
     * @param end The end position.
     */
    constructor(start: SourcePosition, end: SourcePosition) {
        this.start = start;
        this.end = end;
    }
}