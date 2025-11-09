import Square from "./Square";
import {calculateWinner} from "../helper";

function Board({ xIsNext, squares, onPlay, isBotThinking }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares) || isBotThinking) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = "X";
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = "🏆 Winner: " + winner;
  } else if (squares.every((square) => square !== null)) {
    status = "🫱🏼‍🫲🏼 Draw";
  } else {
    status = "🕐 Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square
          value={squares[0]}
          onSquareClick={() => handleClick(0)}
          disabled={isBotThinking}
        />
        <Square
          value={squares[1]}
          onSquareClick={() => handleClick(1)}
          disabled={isBotThinking}
        />
        <Square
          value={squares[2]}
          onSquareClick={() => handleClick(2)}
          disabled={isBotThinking}
        />
      </div>
      <div className="board-row">
        <Square
          value={squares[3]}
          onSquareClick={() => handleClick(3)}
          disabled={isBotThinking}
        />
        <Square
          value={squares[4]}
          onSquareClick={() => handleClick(4)}
          disabled={isBotThinking}
        />
        <Square
          value={squares[5]}
          onSquareClick={() => handleClick(5)}
          disabled={isBotThinking}
        />
      </div>
      <div className="board-row">
        <Square
          value={squares[6]}
          onSquareClick={() => handleClick(6)}
          disabled={isBotThinking}
        />
        <Square
          value={squares[7]}
          onSquareClick={() => handleClick(7)}
          disabled={isBotThinking}
        />
        <Square
          value={squares[8]}
          onSquareClick={() => handleClick(8)}
          disabled={isBotThinking}
        />
      </div>
    </>
  );
}

export default Board;
