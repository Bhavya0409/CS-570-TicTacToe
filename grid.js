function Grid(boardSize) {
    this.boardSize = boardSize;
}

Grid.prototype.showTable = function() {
    //   ---+---+---
    let table = ' ';
    for (let row = 0; row <= this.boardSize; row++) {
        if (row === 0) {
            for (let column = 1; column <= this.boardSize; column++) {
                table+=`   ${column}`;
            }
        } else {
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

module.exports = Grid;