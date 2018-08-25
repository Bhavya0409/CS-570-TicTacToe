const rl = require('readline');
const Grid = require('./grid');
const {SUCCESS_MARKED_CELL, ERROR_OUT_OF_BOUNDS_X, ERROR_OUT_OF_BOUNDS_Y, VICTORY} = require('./constants');

let i = rl.createInterface(process.stdin, process.stdout);

let players = 2;
let boardSize = 3;
let winSequence = 3;

const playerLetters = [];
let playerTurn = 0;

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
            askBoardSize();
        } else if (num > 26) {
            console.log('Sorry, the maximum number of players is 26');
            askPlayers()
        } else if (num < 2) {
            console.log('Sorry, the minimum number of players is 2');
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
    const letters = 'XOABCDEFGHIJKLMNPQRSTUVWYZ';
    for (let i = 0; i < players; i++) {
        playerLetters.push(letters.charAt(i));
    }
    i.question("How big do you want the board to be? Press enter for default of 3\n", (num) => {
        if (num.trim().length === 0) {
            // nothing entered, so use default of 3
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
            startGame();
        } else if (Number.isNaN(num)) {
            console.log('Please enter a valid number');
            askWinSequence()
        } else if (num > boardSize) {
            console.log('Sorry, the win sequence count cannot be greater than the board size');
            askWinSequence()
        } else {
            winSequence = parseInt(num);
            startGame();
        }
    })
};

startGame = () => {
    grid = new Grid(boardSize, winSequence);
    grid.showTable();
    turnPrompt();
};

turnPrompt = () => {
    let player = playerLetters[playerTurn];
    console.log(`TURN: PLAYER ${player}`);
    askTurnQuestionNew(player);

};

askTurnQuestionNew = (player, row) => {
    // console.log('row', row)
    i.question(`Which ${row === undefined ? 'row' : 'column'} would you like?`, (val) => {
        if (Number.isNaN(val) || val.trim().length === 0) {
            console.log('Please enter a valid number');
            askTurnQuestionNew(player, row)
        } else if (parseInt(val) > boardSize || parseInt(val) <= 0) {
            console.log(`Sorry, the ${row === undefined ? 'row' : 'column'} was out of bounds`);
            askTurnQuestionNew(player, row)
        } else {
            // console.log('here', typeof row, parseInt(row), boardSize, boardSize > parseInt(row));
            if (row === undefined) {
                askTurnQuestionNew(player, parseInt(val));
            } else {
                const result = grid.selectCell(row, parseInt(val), player);

                if (result === VICTORY) {
                    grid.showTable();
                    console.log('Congratulations, you won!');
                    end();
                } else if (result === SUCCESS_MARKED_CELL) {
                    if (playerTurn === playerLetters.length - 1) {
                        playerTurn = 0;
                    } else {
                        playerTurn++;
                    }
                    grid.showTable();
                    turnPrompt();
                } else {
                    console.log(`Sorry, that ${
                        result === ERROR_OUT_OF_BOUNDS_X ? 'row was out of bounds' :
                            result === ERROR_OUT_OF_BOUNDS_Y ? 'column was out of bounds' :
                                'row and column was already selected'
                        }`);
                    askTurnQuestionNew(player);
                }
            }
        }
    })
};

end = () => {
    console.log('exiting...');
    i.close();
    process.stdin.destroy();
};

setUpGame();