import Square from "./Square";
import { calculateWinner } from "../helper";

function Board({
  xIsNext,
  squares,
  onPlay,
  isBotThinking,
  nickname,
  isLoadingNickname,
}) {
  function handleClick(i) {
    if (
      squares[i] ||
      calculateWinner(squares) ||
      isBotThinking ||
      isLoadingNickname
    ) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = "X";
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;

  if (isLoadingNickname) {
    status = (
      <div className="status-loading">
        <div className="loading-spinner small"></div>
        <span>Loading player info...</span>
      </div>
    );
  } else if (winner) {
    status = "🏆 Winner: " + (winner === "X" ? nickname : "Bot");
  } else if (squares.every((square) => square !== null)) {
    status = "🫱🏼‍🫲🏼 Draw";
  } else {
    status = "🕐 Next player: " + (xIsNext ? nickname : "Bot");
  }

  const isBoardDisabled = isBotThinking || isLoadingNickname;

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square
          value={squares[0]}
          onSquareClick={() => handleClick(0)}
          disabled={isBoardDisabled}
        />
        <Square
          value={squares[1]}
          onSquareClick={() => handleClick(1)}
          disabled={isBoardDisabled}
        />
        <Square
          value={squares[2]}
          onSquareClick={() => handleClick(2)}
          disabled={isBoardDisabled}
        />
      </div>
      <div className="board-row">
        <Square
          value={squares[3]}
          onSquareClick={() => handleClick(3)}
          disabled={isBoardDisabled}
        />
        <Square
          value={squares[4]}
          onSquareClick={() => handleClick(4)}
          disabled={isBoardDisabled}
        />
        <Square
          value={squares[5]}
          onSquareClick={() => handleClick(5)}
          disabled={isBoardDisabled}
        />
      </div>
      <div className="board-row">
        <Square
          value={squares[6]}
          onSquareClick={() => handleClick(6)}
          disabled={isBoardDisabled}
        />
        <Square
          value={squares[7]}
          onSquareClick={() => handleClick(7)}
          disabled={isBoardDisabled}
        />
        <Square
          value={squares[8]}
          onSquareClick={() => handleClick(8)}
          disabled={isBoardDisabled}
        />
      </div>
    </>
  );
}

export default Board;
