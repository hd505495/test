/*!
 * simple_chess.js v0.1
 *
 * Date: 9 Nov 2018
 */

// Basically main()
 let id = "0"; // client ID # default is 0
 let chat = "";
 let new_pos = 0;

 let serverURL = "localhost";

// Just to get client ID atm
 serv_call(0);

// Declare board, initialize board
var board1,
	game = new Chess();
	
// do not pick up pieces if the game is over
// only pick up pieces for White
var onDragStart = function(source, piece, position, orientation) {
  if (game.in_checkmate() === true || game.in_draw() === true ||
    piece.search(/^b/) !== -1) {
    return false;
  }
};

var makeRandomMove = function() {
  var possibleMoves = game.moves();

  // game over
  if (possibleMoves.length === 0) {
	  swal("Good job!", "The game has ended", "success");
	  return;
  }
  
  var randomIndex = Math.floor(Math.random() * possibleMoves.length);
  game.move(possibleMoves[randomIndex]);
  board1.position(game.fen());			
};

// When a piece is moved
var onDragMove = function(newLocation, oldLocation, source,
                          piece, position, orientation) {
  console.log("New location: " + newLocation);
  console.log("Old location: " + oldLocation);
  console.log("Source: " + source);
  console.log("Piece: " + piece);
  console.log("Position: " + ChessBoard.objToFen(position));
  console.log("Orientation: " + orientation);
  console.log("--------------------");
  /* This is where we should check if the move is valid and then send the appropriate information
   * to the server along with a client ID which should be assigned by the server
   * when the client first connects, or we could just send the info and check it server-side
   */


};

var onDrop = function(source, target, piece, newPos, oldPos, orientation) {
  console.log("Source: " + source);
  console.log("Target: " + target);
  console.log("Piece: " + piece);
  console.log("New position: " + ChessBoard.objToFen(newPos));
  console.log("Old position: " + ChessBoard.objToFen(oldPos));
  console.log("Orientation: " + orientation);
  console.log("--------------------");
  
    // see if the move is legal
  var move = game.move({							// ---
    from: source,									//   |
    to: target,										//   |
  });												//   |
													//   |		
  // illegal move									//   |-------- implements "random" AI opponent
  if (move === null) return 'snapback';				//	 |
													//   |
  // make random legal move for black				//   |
  window.setTimeout(makeRandomMove, 250);			//	 |
};													// ---
// update the board position after the piece snap
// for castling, en passant, pawn promotion		
var onSnapEnd = function() {
  board1.position(game.fen());
};

var config = {
  position: 'start',
  draggable: true,
  // Should probably use onDrop
  //onDragMove: onDragMove,
  onDrop:     onDrop,
  // Return pieces to their original position when dropped off-board
  //dropOffBoard: 'snapback',
  // Which side is toward the bottom of the screen, white for client 1
  // This can be changed in simple_chess.js by calling orientation('black')
  orientation: 'white',
  onDragStart:   onDragStart,
  onSnapEnd: onSnapEnd
}

board1 = ChessBoard('board1', config);


/*
while (!game.game_over()) {
  var moves = game.moves();
  var move = moves[Math.floor(Math.random() * moves.length)];
  game.move(move);
}
console.log(game.pgn()); */


/* Net functions */

function httpPost(url, payload, callback)  //posts to the server
{
  console.log(url);
  console.log(payload);
	let request = new XMLHttpRequest();
	request.onreadystatechange = function()
	{
		if(request.readyState == 4) // request sent
		{
			if(request.status == 200) // request successful
			callback(request.responseText); // text from server to cb function
			else
			{
				if(request.status == 0 && request.statusText.length == 0)
					alert("Connection failed");
				else
					alert("Server returned status " + request.status + ", " + request.statusText);
			}
		}
	};
	request.open('post', url, true); //begin a request to server
	request.setRequestHeader('Content-Type',
	'application/x-www-form-urlencoded'); //sets request header
	request.send(payload);
}

function cb(response) //response from the server from httpPost updates sprites
{
	// Parse the JSON
	let ob = JSON.parse(response); //turns response to javascript object
  id = ob.your_id;
  new_pos = parseInt(ob.new_pos);
}

function serv_call(pos) //how we interact with the server sent every 10 frames
{
	// Make a JSON blob
	let ob = {};
  //make json fields
  ob.id = id;
  ob.chat = "";
  ob.pos = pos;
	let json_string = JSON.stringify(ob);
	// Send the JSON blob to the server
	httpPost(serverURL, json_string, cb);
}

function post_chat(response) //handles chat updates
{
  let ob = JSON.parse(response);
  let chat_1 = ob.chat_1;
  let chat_2 = ob.chat_2;

  //update chat;

  if(chat_1 != "")
  {
    var window = document.getElementById("chatHistory");
    var option = document.createElement("option");
    option.text = chat_1;
    window.add(option);
  }
  if(chat_2 != "")
  {
    var window = document.getElementById("chatHistory");
    var option = document.createElement("option");
    option.text = chat_2;
    window.add(option);
  }
}

function sendMessage()
{
  let ob = {};
  let msg = document.getElementById("chatInput");
  ob.id = id;
  ob.chat = msg.value;
  console.log(ob.chat);
  ob.pos = 500;
  let json_string = JSON.stringify(ob);
  httpPost(serverURL,json_string,post_chat);
}
