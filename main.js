const rl = require('readline');
const Grid = require('./grid');
const {SUCCESS_MARKED_CELL, ERROR_OUT_OF_BOUNDS_X, ERROR_OUT_OF_BOUNDS_Y, ERROR_ALREADY_SELECTED} = require('./constants');

let i = rl.createInterface(process.stdin, process.stdout);

let players = 2;
let boardSize = 4;
let winSequence = 3;

let grid;

setUpGame = () => {
    i.question('Would you like to resume a game? Y/N\n', answer => {
        if (answer === 'Y') {
            // TODO implement saved game resume
            console.log('to implement...');
            end();
        } else if (answer === 'N') {
            askPlayers();
        } else {
            console.log('Please enter either \"Y\" or \"N\"');
            setUpGame();
        }
    });
};

askPlayers = () => {
    i.question("How many players are playing? Press enter for default of 2\n", (num) => {
        if (num.trim().length === 0) {
            // nothing entered, so use default of 2
            players = 2;
            askBoardSize();
        } else if (num > 26) {
            console.log('Sorry, the maximum number of players is 26');
            askPlayers()
        } else if (Number.isNaN(num)) {
            console.log('Please enter a valid number');
            askPlayers()
        } else {
            players = parseInt(num);
            askBoardSize();
            end();
        }
    })
};

askBoardSize = () => {
    i.question("How big do you want the board to be? Press enter for default of 3\n", (num) => {
        if (num.trim().length === 0) {
            // nothing entered, so use default of 3
            boardSize = 3;
            askWinSequence();
        } else if (Number.isNaN(num)) {
            console.log('Please enter a valid number');
            askBoardSize()
        } else if (num > 999) {
            console.log('Sorry, the maximum board size is 999');
            askBoardSize()
        } else {
            boardSize = parseInt(num);
            askWinSequence();
        }
    })
};

askWinSequence = () => {
    i.question("What should the win sequence count be? Press enter for default of 3\n", (num) => {
        if (num.trim().length === 0) {
            // nothing entered, so use default of 3
            winSequence = 3;
            setUpGame();
        } else if (Number.isNaN(num)) {
            console.log('Please enter a valid number');
            askWinSequence()
        } else if (num > boardSize) {
            console.log('Sorry, the win sequence count cannot be greater than the board size');
            askWinSequence()
        } else {
            winSequence = parseInt(num);
            setUpGame();
        }
    })
};

startGame = () => {
    grid = new Grid(boardSize);
    grid.showTable();
    turnPrompt();
};

turnPrompt = () => {
    let player = 'X';
    console.log(`TURN: PLAYER ${player}`);
    askTurnQuestionNew(player);

};

askTurnQuestionNew = (player, row) => {
    // console.log('row', row)
    i.question(`Which ${row === undefined ? 'row' : 'column'} would you like?`, (val) => {
        if (Number.isNaN(val) || val.trim().length === 0) {
            console.log('Please enter a valid number');
            askTurnQuestionNew(player)
        } else if (parseInt(val) > boardSize || parseInt(val) <= 0) {
            console.log(`Sorry, the ${row === undefined ? 'row' : 'column'} was out of bounds`);
            askTurnQuestionNew(player)
        } else {
            // console.log('here', typeof row, parseInt(row), boardSize, boardSize > parseInt(row));
            if (row === undefined) {
                askTurnQuestionNew(player, parseInt(val));
            } else {
                const result = grid.selectCell(row, parseInt(val), player);

                if (result === SUCCESS_MARKED_CELL) {
                    // TODO INCREMENT PLAYER COUNTER
                    grid.showTable();
                    turnPrompt();
                } else {
                    console.log(`Sorry, that ${
                        result === ERROR_OUT_OF_BOUNDS_X ? 'row was out of bounds' : 
                            result === ERROR_OUT_OF_BOUNDS_Y ? 'column was out of bounds' : 
                                'row and column was already selected'
                    }`);
                    askTurnQuestionNew();
                }
            }
        }
    })
};

// askTurnQuestion = (rowOrColumn) => {
//     i.question(`Which ${rowOrColumn === 0 ? 'row' : 'column'} would you like?`, (row) => {
//         if (Number.isNaN(row)) {
//             console.log('Please enter a valid number');
//             askTurnQuestion(rowOrColumn)
//         } else if (row > boardSize) {
//             console.log(`Sorry, the ${rowOrColumn === 0 ? 'row' : 'column'} number cannot exceed the board size`);
//             askTurnQuestion(rowOrColumn)
//         } else {
//             return parseInt(row);
//         }
//     })
// };

end = () => {
    console.log('exiting...');
    i.close();
    process.stdin.destroy();
};

startGame();