import { connect, createServer } from 'net';
import find from 'local-devices';
import isPortReachable from 'is-port-reachable';

var gameBoard = [[' ', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']];

if (process.argv[2] == 'host') {
  var peer = false;
  createServer(async function(socket) {
    if ((await waitForOpponent()).toString() == 'hai') {
      peer = true;
      await wait(2000);
      console.log('Connected to peer! ');
      while (true) {
        console.log('Your turn');
        printGameBoard();
        if (didIWin('X')) {
          console.log('X wins!');
          process.exit();
        }
        if (didIWin('O')) {
          console.log('O wins!');
          process.exit();
        }
        if (isCatsGame()) {
          console.log('Cats game!');
          process.exit();
        }
        var collum = 0;
        while (true) {
        while (true) {
          process.stdout.write('What collum? ');
          collum = parseInt(await prompt());
          if ((collum == 1) || (collum == 2) || (collum == 3)) {
            break;
          }
          else {
            console.log('Enter a number 1-3');
          }
        }
        var row = 0
        while (true) {
          process.stdout.write('What row? ');
          row = parseInt(await prompt());
          if ((row == 1) || (row == 2) || (row == 3)) {
            break;
          }
          else {
            console.log('Enter a number 1-3');
          }
        }
        if (gameBoard[row - 1][collum - 1] == ' ') {
          break;
        }
        else {
          console.log('There is already a mark there!');
        }
        }
        gameBoard[row - 1][collum - 1] = 'X';
        printGameBoard();
        socket.write(JSON.stringify(gameBoard));
        if (didIWin('X')) {
          console.log('X wins!');
          process.exit();
        }
        if (didIWin('O')) {
          console.log('O wins!');
          process.exit();
        }
        if (isCatsGame()) {
          console.log('Cats game!');
          process.exit();
        }
        console.log('Waiting for opponent...');
        gameBoard = JSON.parse(await waitForOpponent());
      }
    }
    function waitForOpponent() {
      return new Promise(function(resolve, reject) {
        socket.once('data', resolve);
      });
    }
  }).listen(25501);
  while (!peer) {
    process.stdout.write('                   \r');
    process.stdout.write('Waiting for peer\r');
    await wait(500);
    process.stdout.write('Waiting for peer.\r');
    await wait(500);
    process.stdout.write('Waiting for peer..\r');
    await wait(500);
    process.stdout.write('Waiting for peer...\r');
    await wait(500);
  }
}
else if (process.argv[2] == 'join') {
  console.log('Locating games...');
  var addresses = await find();
  var games = [];
  for (var i = 0; i < addresses.length; i++) {
    if (await isPortReachable(25501, { host: addresses[i].ip })) {
      games.push(addresses[i].ip);
    }
  }
  var gameToJoin = '';
  if (games.length == 0) {
    console.log('No games found!');
    process.exit();
  }
  if (games.length == 1) {
    gameToJoin = games[0];
  }
  if (games.length > 1) {
    console.log('Multiple games found!');
    for (var i = 0; i < games.length; i++) {
      console.log(i + ': ' + games[i]);
    }
    while (true) {
      process.stdout.write('Choose one: ');
      var gameNumber = parseInt(await prompt());
      if (gameNumber > games.length - 1) {
        console.log('Choose a game in the list!');
      }
      else {
        gameToJoin = games[gameNumber];
        break;
      }
    }
  }
  console.log('Connecting to ' + gameToJoin + '...');
  var socket = connect(25501, gameToJoin);
  socket.on('connect', async function() {
    socket.write('hai');
    console.log('Connected to game!');
    while (true) {
      console.log('Waiting for opponent...');
      gameBoard = JSON.parse(await waitForOpponent());
      console.log('Your turn');
      printGameBoard();
      if (didIWin('X')) {
        console.log('X wins!');
        process.exit();
      }
      if (didIWin('O')) {
        console.log('O wins!');
        process.exit();
      }
      if (isCatsGame()) {
        console.log('Cats game!');
        process.exit();
      }
      var collum = 0;
      while (true) {
      while (true) {
        process.stdout.write('What collum? ');
        collum = parseInt(await prompt());
        if ((collum == 1) || (collum == 2) || (collum == 3)) {
          break;
        }
        else {
          console.log('Enter a number 1-3');
        }
      }
      var row = 0
      while (true) {
        process.stdout.write('What row? ');
        row = parseInt(await prompt());
        if ((row == 1) || (row == 2) || (row == 3)) {
          break;
        }
        else {
          console.log('Enter a number 1-3');
        }
      }
      if (gameBoard[row - 1][collum - 1] == ' ') {
        break;
      }
      else {
        console.log('There is already a mark there!');
      }
      }
      gameBoard[row - 1][collum - 1] = 'O';
      printGameBoard();
      socket.write(JSON.stringify(gameBoard));
      if (didIWin('X')) {
        console.log('X wins!');
        process.exit();
      }
      if (didIWin('O')) {
        console.log('O wins!');
        process.exit();
      }
      if (isCatsGame()) {
        console.log('Cats game!');
        process.exit();
      }
    }
  });
  function waitForOpponent() {
    return new Promise(function(resolve, reject) {
      socket.once('data', resolve);
    });
  }
}
else {
  console.log('Usage:');
  console.log('tictactoe host: Host a game of Tic Tac Toe');
  console.log('tictactoe join: Join a LAN game of Tic Tac Toe');
}

function wait(delay) {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, delay);
  });
}

function prompt() {
  return new Promise(function(resolve, reject) {
    process.stdin.once('data', resolve);
  });
}

function printGameBoard() {
  console.log(gameBoard[0][0] + ' | ' + gameBoard[0][1] + ' | ' + gameBoard[0][2]);
  console.log('---------');
  console.log(gameBoard[1][0] + ' | ' + gameBoard[1][1] + ' | ' + gameBoard[1][2]);
  console.log('---------');
  console.log(gameBoard[2][0] + ' | ' + gameBoard[2][1] + ' | ' + gameBoard[2][2]);
}

function didIWin(letter) {
  if ((gameBoard[0][0] == letter) && (gameBoard[0][1] == letter) && (gameBoard[0][2] == letter)) {
    return true;
  }
  if ((gameBoard[1][0] == letter) && (gameBoard[1][1] == letter) && (gameBoard[1][2] == letter)) {
    return true;
  }
  if ((gameBoard[2][0] == letter) && (gameBoard[2][1] == letter) && (gameBoard[2][2] == letter)) {
    return true;
  }
  if ((gameBoard[0][0] == letter) && (gameBoard[1][0] == letter) && (gameBoard[2][0] == letter)) {
    return true;
  }
  if ((gameBoard[0][1] == letter) && (gameBoard[1][1] == letter) && (gameBoard[2][1] == letter)) {
    return true;
  }
  if ((gameBoard[0][2] == letter) && (gameBoard[1][2] == letter) && (gameBoard[2][2] == letter)) {
    return true;
  }
  if ((gameBoard[0][0] == letter) && (gameBoard[1][1] == letter) && (gameBoard[2][2] == letter)) {
    return true;
  }
  if ((gameBoard[0][2] == letter) && (gameBoard[1][1] == letter) && (gameBoard[2][0] == letter)) {
    return true;
  }
  return false;
}
function isCatsGame() {
  var count = 0;
  for (var i = 0; i < gameBoard.length; i++) {
    for (var j = 0; j < gameBoard[i].length; j++) {
      if (gameBoard[i][j] != ' ') {
        count++;
      }
    }
  }
  if (count == 9) {
    return true;
  }
  return false;
}
