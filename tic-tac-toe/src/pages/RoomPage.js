// src/components/RoomPage.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import Board from "../components/Board";
import { calculateWinner, updateLeaderboard } from "../helper";
import { addDoc, collection } from "firebase/firestore";

export default function RoomPage() {
  const unsubRoom = useRef(() => {});
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef(null);

  const user = auth.currentUser;
  const myUid = user?.uid;
  const myName = user?.displayName || "Guest";

  useEffect(() => {
    if (!roomId) return;

    const unsub = onSnapshot(
      doc(db, "rooms", roomId),
      (snap) => {
        if (!snap.exists()) {
          return;
        }
        const newRoom = { id: snap.id, ...snap.data() };
        setRoom(newRoom);
        setLoading(false); // Просто устанавливаем room, больше ничего
      },
      (err) => {
        console.error(err);
        alert("Connection error");
        navigate("/game");
      }
    );
    unsubRoom.current = unsub;

    return () => unsub();
  }, [roomId, navigate]);

  const handleTimeoutLoss = useCallback(async () => {
    if (!room || !myUid) return;

    const opponent = room.players.find((p) => p.uid !== myUid);

    try {
      await updateDoc(doc(db, "rooms", roomId), {
        winner: opponent?.uid || null,
        leftPlayer: myUid,
        leftPlayerName: myName,
        status: "finished",
        reason: "timeout",
        updatedAt: serverTimestamp(),
        leftAt: serverTimestamp(),
      });

      await addDoc(collection(db, "gameHistory"), {
        roomId,
        players: room.players.map((p) => ({
          uid: p.uid,
          nickname: p.name || p.nickname || "Guest",
          symbol: p.symbol,
        })),
        playerIds: room.players.map((p) => p.uid),
        winner: opponent?.uid || null,
        reason: "timeout",
        leftPlayer: myUid,
        leftPlayerName: myName,
        endedAt: serverTimestamp(),
        endedAtMs: Date.now(),
      });

      updateLeaderboard(myName, "loss");
    } catch (err) {
      console.error("Ошибка при таймауте:", err);
    } finally {
      navigate("/game");
    }
  }, [room, myUid, myName, roomId, navigate]);

  useEffect(() => {
    // Очищаем предыдущий интервал
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!room || !myUid || room.status !== "playing" || !room.turnDeadline) {
      setTimeLeft(20);
      return;
    }

    const mySymbol = room.players.find((p) => p.uid === myUid)?.symbol;
    const isMyTurn = room.currentTurn === mySymbol;

    const deadline = room.turnDeadline.toMillis() + 20000;

    const updateTimer = () => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((deadline - now) / 1000));
      setTimeLeft(left);

      if (left <= 0 && isMyTurn && room.status === "playing") {
        handleTimeoutLoss();
      }
    };

    updateTimer();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(updateTimer, 500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [room, myUid, handleTimeoutLoss]);

  const makeMove = async (i) => {
    if (!room || room.status !== "playing") return;
    if (room.board[i] !== null) return;

    const me = room.players.find((p) => p.uid === myUid);
    if (!me || room.currentTurn !== me.symbol) return;

    const newBoard = [...room.board];
    newBoard[i] = me.symbol;

    const winnerInfo = calculateWinner(newBoard);
    const winnerSymbol = winnerInfo?.winner;
    const isDraw = !winnerSymbol && newBoard.every((c) => c !== null);

    const winnerUid = winnerSymbol
      ? room.players.find((p) => p.symbol === winnerSymbol)?.uid
      : isDraw
      ? "draw"
      : null;

    setTimeLeft(20);

    await updateDoc(doc(db, "rooms", roomId), {
      board: newBoard,
      currentTurn: me.symbol === "X" ? "O" : "X",
      winner: winnerUid,
      status: winnerUid ? "finished" : "playing",
      turnDeadline: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (winnerUid) {
      await addDoc(collection(db, "gameHistory"), {
        roomId,
        players: room.players.map((p) => ({
          uid: p.uid,
          nickname: p.name || p.nickname || "Guest",
          symbol: p.symbol,
        })),
        playerIds: room.players.map((p) => p.uid),
        winner: winnerUid,
        endedAt: serverTimestamp(),
        endedAtMs: Date.now(),
        reason: "normal",
      });

      const myResult =
        winnerUid === "draw" ? "draw" : winnerUid === myUid ? "win" : "loss";
      updateLeaderboard(myName, myResult);
    }
  };

  const leaveRoom = async () => {
    if (!room) return;

    if (unsubRoom.current) {
      unsubRoom.current();
      unsubRoom.current = null;
    }

    const opponent = room.players.find((p) => p.uid !== myUid);

    if (room.status === "finished") {
      await deleteDoc(doc(db, "rooms", roomId)).catch(() => {});
      navigate("/game");
      return;
    }

    await updateDoc(doc(db, "rooms", roomId), {
      winner: opponent?.uid || null,
      leftPlayer: myUid,
      status: "finished",
      updatedAt: serverTimestamp(),
      leftAt: serverTimestamp(),
      leftPlayerName: myName,
    });

    await addDoc(collection(db, "gameHistory"), {
      roomId,
      players: room.players.map((p) => ({
        uid: p.uid,
        nickname: p.name || p.nickname || "Guest",
        symbol: p.symbol,
      })),
      playerIds: room.players.map((p) => p.uid),
      winner: opponent?.uid || null,
      endedAt: serverTimestamp(),
      endedAtMs: Date.now(),
      reason: "left",
      leftPlayer: myUid, // Кто вышел
      leftPlayerName: myName,
    });

    updateLeaderboard(myName, "loss");

    navigate("/game");
  };

  if (loading) return <div className="loading-message">Loading room...</div>;
  if (!room) return null;

  const me = room.players.find((p) => p.uid === myUid);
  const opponent = room.players.find((p) => p.uid !== myUid);
  const myTurn = room.currentTurn === me?.symbol;
  const finished = room.status === "finished";
  const isWaiting = room.status === "waiting" && !opponent;

  const playerX = room.players.find((p) => p.symbol === "X");
  const playerO = room.players.find((p) => p.symbol === "O");

  const currentPlayerName =
    room.currentTurn === "X" ? playerX?.nickname : playerO?.nickname;
  const waitingPlayerName =
    room.currentTurn === "X" ? playerO?.nickname : playerX?.nickname;

  return (
    <div className="main-content">
      <div className="game-room-container">
        <div className="room-card">
          <h1>{room.name}</h1>

          <div className="room-code-display">
            <span>Room code</span>
            <strong className="big-code">{room.code}</strong>
            <button
              onClick={() => navigator.clipboard.writeText(room.code)}
              className="copy-code-btn"
            >
              Copy
            </button>
          </div>

          {/* Игроки */}
          <div className="players-grid">
            <div className={`player-card ${myTurn ? "active" : ""}`}>
              <div className="player-symbol">{me?.symbol || "?"}</div>
              <div className="player-info">
                <strong>You</strong>
                <p>{myName}</p>
              </div>
            </div>

            <div className="vs-text">VS</div>

            <div
              className={`player-card ${!myTurn && opponent ? "active" : ""}`}
            >
              {opponent ? (
                <>
                  <div className="player-symbol">{opponent.symbol}</div>
                  <div className="player-info">
                    <strong>{opponent.nickname}</strong>
                    <p>Opponent</p>
                  </div>
                </>
              ) : (
                <div className="waiting-player">
                  <div className="loading-spinner small"></div>
                  <p>Player waiting...</p>
                </div>
              )}
            </div>
          </div>

          {/* ТАЙМЕР НА ХОД */}
          {/* ТАЙМЕР НА ХОД */}
          <div className="turn-timer">
            {room?.status === "playing" && room?.turnDeadline ? (
              <>
                <div className="timer-header">
                  <strong className="timer-text">
                    {myTurn ? "Your move" : `${currentPlayerName}'s move`}
                  </strong>
                  <span
                    className={`time-left ${timeLeft <= 10 ? "danger" : ""}`}
                  >
                    {timeLeft} sec
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${
                      timeLeft <= 10 ? "danger" : ""
                    }`}
                    style={{
                      width: `${(timeLeft / 20) * 100}%`,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="timer-disabled">
                <div className="timer-header">
                  <strong className="timer-text">
                    {room?.status === "waiting"
                      ? "Waiting for the player..."
                      : "Game"}
                  </strong>
                  <span className="time-left disabled">–</span>
                </div>
                <div className="progress-bar disabled">
                  <div
                    className="progress-fill disabled"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Статус ожидания */}
          {isWaiting ? (
            <div className="waiting-section">
              <div className="board-preview">
                <Board
                  squares={room.board}
                  onPlay={() => {}}
                  disabled={true}
                  xIsNext={true}
                  currentPlayerName="Waiting..."
                  opponentName="for player"
                />
              </div>
            </div>
          ) : (
            <div className="game-board-wrapper">
              <Board
                squares={room.board}
                onPlay={makeMove}
                disabled={!myTurn || finished}
                xIsNext={room.currentTurn === "X"}
                currentPlayerName={currentPlayerName}
                opponentName={waitingPlayerName}
                playerSymbol={me?.symbol}
                playerX={playerX}
                playerO={playerO}
                winnerUid={room.winner}
              />
            </div>
          )}

          {/* Результат игры */}
          {(finished || room.leftPlayer) && (
            <div className="game-result-banner">
              <div className="result-content">
                {room.reason === "timeout" && room.winner === myUid ? (
                  <>
                    <span className="win-emoji">Win!</span>
                    <h3>The opponent didn't have time</h3>
                  </>
                ) : room.reason === "timeout" && room.winner !== myUid ? (
                  <>
                    <span className="loss-emoji">Defeat</span>
                    <h3>Time's up</h3>
                  </>
                ) : room.leftPlayer && room.leftPlayer !== myUid ? (
                  <>
                    <span className="win-emoji">The opponent has left</span>
                    <h3>You've won!</h3>
                    <p className="exit-message">
                      {room.leftPlayerName || "Opponent"} left the game
                    </p>
                  </>
                ) : room.leftPlayer === myUid ? (
                  <>
                    <span className="loss-emoji">Exit</span>
                    <h3>You have left the game</h3>
                  </>
                ) : room.winner === "draw" ? (
                  <>
                    <span className="draw-emoji">Draw</span>
                  </>
                ) : room.winner === myUid ? (
                  <>
                    <span className="win-emoji">Win</span>
                  </>
                ) : (
                  <>
                    <span className="loss-emoji">Defeat</span>
                  </>
                )}

                {finished && !room.leftPlayer && room.players.length === 2 && (
                  <button
                    onClick={async () => {
                      // Сбрасываем таймер при начале новой игры
                      setTimeLeft(20);
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                      }

                      await updateDoc(doc(db, "rooms", roomId), {
                        board: Array(9).fill(null),
                        currentTurn: "X",
                        winner: null,
                        status: "playing",
                        turnDeadline: serverTimestamp(), // Важно: устанавливаем новый дедлайн
                        updatedAt: serverTimestamp(),
                      });
                    }}
                    className="new-game-btn"
                  >
                    New game
                  </button>
                )}
              </div>
            </div>
          )}

          <button onClick={leaveRoom} className="leave-room-btn">
            {room.leftPlayer || finished || room.players.length < 2
              ? "Return to menu"
              : "Leave the room"}
          </button>
        </div>
      </div>
    </div>
  );
}
