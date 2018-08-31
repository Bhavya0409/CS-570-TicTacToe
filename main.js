const rl = require('readline');
const fs = require('fs');

const Grid = require('./grid');
const {SUCCESS_MARKED_CELL, ERROR_OUT_OF_BOUNDS_X, ERROR_OUT_OF_BOUNDS_Y, VICTORY, TIE} = require('./constants');

let i = rl.createInterface(process.stdin, process.stdout);

let players = 2;
let boardSize = 3;
let winSequence = 3;

const playerLetters = [];
let playerTurn = 0;

let grid;

/**
 * TODO:
 * 1. Change Offset width of 2 and 3 digit numbers
 */

setUpGame = () => {
    i.question('Would you like to resume a game? Y/N\n', answer => {
        if (answer.trim() === 'Y' || answer.trim() === 'y') {
            if (fs.existsSync("pausedGame.txt")) {
                getSavedGame().then((data) => {
                    const parseData = JSON.parse(data);
                    players = parseData.players;
                    boardSize = parseData.boardSize;
                    winSequence = parseData.winSequence;
                    playerTurn = parseData.playerTurn;
                    const letters = 'XOABCDEFGHIJKLMNPQRSTUVWYZ';
                    for (let i = 0; i < players; i++) {
                        playerLetters.push(letters.charAt(i));
                    }

                    let cellCount = 0;
                    Object.keys(parseData.cells).forEach((key) => {
                        cellCount += parseData.cells[key].length
                    });
                    grid = new Grid(boardSize, winSequence, parseData.cells, cellCount);
                    grid.showTable();
                    turnPrompt();
                }, (error) => {
                    console.log(error);
                    askPlayers();
                })
            } else {
                console.log('No saved game. Starting new game...');
                askPlayers();
            }
        } else if (answer.trim() === 'N' || answer.trim() === 'n') {
            // If the user wants to start a new game, remove any old game
            deleteSavedGame().then(() => {
                askPlayers();
            })
        } else {
            console.log('Please enter either \"Y\" or \"N\"');
            setUpGame();
        }
    });
};

askPlayers = () => {
    i.question("How many players are playing? Maximum of 26. Press enter for default of 2\n", (num) => {
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
            checkWinCondition();
        } else if (Number.isNaN(num)) {
            console.log('Please enter a valid number');
            askWinSequence()
        } else if (num > boardSize) {
            console.log('Sorry, the win sequence count cannot be greater than the board size');
            askWinSequence()
        } else {
            winSequence = parseInt(num);
            checkWinCondition();
        }
    })
};

checkWinCondition = () => {
    if (Math.ceil(Math.pow(boardSize, 2) / players) < winSequence) {
        console.log('Winning is not possible with this combination of players, board size, and win sequence');
        askPlayers();
    } else {
        startGame();
    }
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

askTurnQuestionNew = (player) => {
    i.question('Please enter the row and column you would like to select, separated by spaces. Press q to quit.\n', val => {
        if (val.trim() === 'q') {
            i.question("Are you sure? Press q again to confirm, or anything else to resume.\n", val => {
                if (val.trim() === 'q') {
                    savePrompt();
                } else {
                    askTurnQuestionNew(player);
                }
            })
        } else {
            const values = val.split(' ');
            if (values.length !== 2) {
                console.log('Please enter 2 values.');
                askTurnQuestionNew(player);
            } else {
                if (Number.isNaN(values[0]) || Number.isNaN(values[1])) {
                    console.log('One or more values specified were not numbers.');
                    askTurnQuestionNew(player)
                } else {
                    const result = grid.selectCell(parseInt(values[0]), parseInt(values[1]), player);

                    if (result === VICTORY) {
                        grid.showTable();
                        console.log('Congratulations, you won!');
                        deleteSavedGame().then(() => {
                            end();
                        })
                    } else if (result === TIE) {
                        grid.showTable();
                        console.log('Tie Game');
                        deleteSavedGame().then(() => {
                            end();
                        })
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
        }
    });
};

savePrompt = () => {
    i.question("Would you like to save? Y/N\n", val => {
        if (val.trim() === 'Y' || val.trim() === 'y') {
            console.log('Saving Game...');
            // If the user wants to start a new game, remove any old game
            deleteSavedGame().then(() => {
                saveGame().then((message) => {
                    console.log(message);
                    end();
                }, (error) => {
                    console.log(error);
                    end();
                });
            })
        } else if (val.trim() === 'N' || val.trim() === 'n') {
            console.log('Thank you for playing!');
            end();
        } else {
            console.log('Please enter either \"Y\" or \"N\"');
            savePrompt();
        }
    });
};

saveGame = () => {
    const data = {
        players: players,
        boardSize: boardSize,
        winSequence: winSequence,
        playerTurn: playerTurn,
        cells: grid.selectedCells
    };

    return new Promise((resolve, reject) => {
        fs.writeFile("pausedGame.txt", JSON.stringify(data), 'utf-8', (err) => {
            if (err) reject('Failed to save game.');
            else resolve('Successfully saved game!');
        })
    });
};

deleteSavedGame = () => {
    return new Promise((resolve) => {
        fs.unlink('pausedGame.txt', function(err) {
            resolve()
        });
    })
};

getSavedGame = () => {
    return new Promise((resolve, reject) => {
        fs.readFile("pausedGame.txt", "utf-8", (err, data) => {
            if (err) reject('Error getting saved game. Starting new one...');
            else resolve(data);
        })
    })
};

end = () => {
    console.log('exiting...');
    i.close();
    process.stdin.destroy();
};

setUpGame();