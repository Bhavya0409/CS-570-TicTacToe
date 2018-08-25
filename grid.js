const Cell = require('./cell');
const {ERROR_OUT_OF_BOUNDS_X, ERROR_OUT_OF_BOUNDS_Y, ERROR_ALREADY_SELECTED, SUCCESS_MARKED_CELL} = require('./constants');

function Grid(boardSize) {
    this.boardSize = boardSize;
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
            table += `${row}  `;
            for (let column = 1; column < this.boardSize; column++) {
                table+=`   |`;
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
        return SUCCESS_MARKED_CELL;
    } else {
        // if the row exists, check if the array value has the column the user specified

        const cellFound = this.selectedCells[row].find((cell) => {
            return cell.column === column
        });

        if (cellFound === undefined) {
            this.selectedCells[row].push(new Cell(row, column, player));
            return SUCCESS_MARKED_CELL;
        } else {
            return ERROR_ALREADY_SELECTED;
        }
    }
};

module.exports = Grid;