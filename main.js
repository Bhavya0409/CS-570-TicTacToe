const rl = require('readline');
const Grid = require('./grid');

let i = rl.createInterface(process.stdin, process.stdout);

let players = 2;
let boardSize = 3;
let winSequence = 3;

startGame = () => {
    i.question('Would you like to resume a game? Y/N\n', answer => {
        if (answer === 'Y') {
            // TODO implement saved game resume
            console.log('to implement...');
            end();
        } else if (answer === 'N') {
            askPlayers();
        } else {
            console.log('Please enter either \"Y\" or \"N\"');
            startGame();
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

setUpGame = () => {
    let grid = new Grid(boardSize);
    grid.showTable();
    end();
};

end = () => {
    console.log('Have a nice day!');
    i.close();
    process.stdin.destroy();
};

setUpGame();