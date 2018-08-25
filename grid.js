const _ = require('lodash');

const Cell = require('./cell');
const {ERROR_OUT_OF_BOUNDS_X, ERROR_OUT_OF_BOUNDS_Y, ERROR_ALREADY_SELECTED, SUCCESS_MARKED_CELL, VICTORY} = require('./constants');

function Grid(boardSize, winSequence) {
    this.boardSize = boardSize;
    this.winSequence = winSequence;
    /* structure:
    {
        row1: [Cell, Cell]
    }
     */
    this.selectedCells = {};
}

Grid.prototype.showTable = function() {
    let table = ' ';
    // console.log('selected', this.selectedCells);
    for (let row = 0; row <= this.boardSize; row++) {
        if (row === 0) {
            // Header Row
            for (let column = 1; column <= this.boardSize; column++) {
                table+=`   ${column}`;
            }
        } else {
            // Content Rows
            //1     |   |
            table += `${row}  `;
            for (let column = 1; column <= this.boardSize; column++) {
                const cell = this.findCell(row, column);
                table+=` ${cell ? cell.player : ' '} ${column === this.boardSize ? '' : '|'}`;
            }

            if (row !== this.boardSize) {
                table+='\n';
                table+='   ---';
                for (let column = 1; column < this.boardSize; column++) {
                    table+=`+---`;
                }
            }
        }
        table+='\n'
    }

    console.log(table);
};

Grid.prototype.findCell = function(row, column) {
    const result = Object.keys(this.selectedCells).find((rowAlreadySelected) => {
        return parseInt(rowAlreadySelected) === row;
    });

    if (result === undefined) {
        return
    }

   return this.selectedCells[row].find((cell) => {
        return cell.column === column
    });
};

Grid.prototype.selectCell = function(row, column, player) {

    if (row <= 0 || row > this.boardSize ) return ERROR_OUT_OF_BOUNDS_X;

    if (column <= 0 || column > this.boardSize) return  ERROR_OUT_OF_BOUNDS_Y;

    // find row in this.selectedCells
    const key = Object.keys(this.selectedCells).find((key) => {
        return parseInt(key) === row;
    });

    // if row doesnt exist, add a new entry, with the value of an array with one element, the column number and mark the cell
    if (key === undefined) {
        this.selectedCells[row] = [new Cell(row, column, player)];
        if (this.isVictory(player)) {
            return VICTORY;
        } else {
            return SUCCESS_MARKED_CELL;
        }
    } else {
        // if the row exists, check if the array value has the column the user specified

        const cellFound = this.selectedCells[row].find((cell) => {
            return cell.column === column
        });

        if (cellFound === undefined) {
            this.selectedCells[row].push(new Cell(row, column, player));
            if (this.isVictory(player)) {
                return VICTORY;
            } else {
                return SUCCESS_MARKED_CELL;
            }
        } else {
            return ERROR_ALREADY_SELECTED;
        }
    }
};

Grid.prototype.isVictory = function(player) {
    const allCells = _.flattenDeep(Object.values(this.selectedCells)).filter((cell) => {
        return cell.player === player;
    });

    console.log('all cells', allCells);

    // check vertically

    // Create a list of visited cells to improve performance
    const verticalVisited = [];

    // Loop through all cells that have not been visited
    for (let outerIndex = 0; outerIndex < allCells.length; outerIndex++) {
        const outerCell = allCells[outerIndex];
        if (!verticalVisited.includes(outerCell)) {
            // This cell has not been visited so create a new set of possible outcomes
            verticalVisited.push(outerCell);
            let count = 1;

            // Loop through rest of cells that also have not been visited
            for (let innerIndex = outerIndex+1; innerIndex < allCells.length; innerIndex++) {
                const innerCell = allCells[innerIndex];
                if (!verticalVisited.includes(innerCell)) {
                    // If the inner cell has also not been visited, time to compare
                    if (outerCell.column === innerCell.column && Math.abs(outerCell.row - innerCell.row) <= count) {
                        // If both cells are part of the same column and the difference in the rows is less than or equal to the count,
                        // then it is part of the same set and should be counted

                        // Increase count and check if this is a victory move.
                        // If not, add the cell to visited and continue looping through inner cells
                        count++;
                        if (count === this.winSequence) {
                            return VICTORY;
                        } else {
                            verticalVisited.push(innerCell);
                        }
                    }
                }
            }
        }
    }

    // check horizontally

    // check diagonally

    return false;
};

module.exports = Grid;