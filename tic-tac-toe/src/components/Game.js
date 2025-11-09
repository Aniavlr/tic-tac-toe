import { useState, useEffect } from "react";
import Board from "./Board";
import {calculateWinner, updateLeaderboard} from "../helper";

function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const[nickname, setNickname] = useState("");
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

   useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const storedNickname = currentUser.nickname;
    
    if (storedNickname) {
      setNickname(storedNickname);
    } else {
      // Если пользователь не найден, можно показать форму входа
      console.warn("No user found in localStorage");
      setNickname("Guest");
    }
  }, []);

  function handlePlay(nextSquares) {
    const wasXTurn = currentMove % 2 === 0;

    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    const newMove = nextHistory.length - 1;
    setCurrentMove(newMove);

    const winner = calculateWinner(nextSquares);
    const isDraw = !winner && !nextSquares.includes(null);
    
    if (winner === 'X') {
      updateLeaderboard(nickname, "win");
    } else if (isDraw) {
      updateLeaderboard(nickname, "draw");
    }

    if (wasXTurn) {
      const winner = calculateWinner(nextSquares);
      if (!winner && nextSquares.includes(null)) {
        setIsBotThinking(true);
        setTimeout(() => {
          const availableMoves = nextSquares
            .map((square, index) => (square === null ? index : null))
            .filter((index) => index !== null);
          const randomIndex =
            availableMoves[Math.floor(Math.random() * availableMoves.length)];
          const botSquares = [...nextSquares];
          botSquares[randomIndex] = "O";
          const botHistory = [...nextHistory, botSquares];
          setHistory(botHistory);
          setCurrentMove(botHistory.length - 1);
          setIsBotThinking(false);

          const botWinner = calculateWinner(botSquares);
          if (botWinner === 'O') {
            updateLeaderboard(nickname, "loss");
          }
        }, 400);
      }
    }
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    setIsBotThinking(false);
  }

  const moves = history.map((_, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="container">
      <h1>Click! Win! Reign!</h1>
      <div className="game">
        <div className="game-board">
          <Board
            xIsNext={xIsNext}
            squares={currentSquares}
            onPlay={handlePlay}
            isBotThinking={isBotThinking}
            nickname ={nickname}
          />
        </div>
        <div className="game-info">
          <ol>{moves}</ol>
        </div>
      </div>
    </div>
  );
}

export default Game;
