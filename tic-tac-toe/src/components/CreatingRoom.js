import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import JoinByCode from "./JoinByCode";

export default function CreatingRoom() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null); // ← для красивого показа после создания
  const [error, setError] = useState("");

  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const generateRoomName = () => {
    const prefixes = ["Game", "Battle", "Match", "Party", "Room"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const shortCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix} #${shortCode}`;
  };

  const createRoom = async () => {
    setIsCreating(true);
    setError("");
    setCreatedRoom(null);

    try {
      const user = auth.currentUser;
      const uid = user?.uid || "guest";
      const nickname = user?.displayName || "Guest";

      const roomCode = generateRoomCode();
      const roomName = generateRoomName();

      const roomRef = await addDoc(collection(db, "rooms"), {
        name: roomName,
        code: roomCode,
        createdBy: { uid, nickname },
        players: [{ uid, nickname, symbol: "X" }],
        status: "waiting",
        board: Array(9).fill(null),
        currentTurn: "X",
        winner: null,
        leftPlayer: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setCreatedRoom({ id: roomRef.id, name: roomName, code: roomCode });

      setTimeout(() => {
        navigate(`/room/${roomRef.id}`);
      }, 10000);
    } catch (err) {
      console.error(err);
      setError("Failed to create room. Check your internet connection.");
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = () => {
    if (createdRoom?.code) {
      navigator.clipboard.writeText(createdRoom.code);
    }
  };

  return (
    <div className="main-content">
      <div className="creating-room-page">
        <h1>Network game</h1>

        {/* Успешное создание комнаты */}
        {createdRoom && (
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2>The room is created!</h2>
            <p>
              Name: <strong>{createdRoom.name}</strong>
            </p>
            <div className="created-code">
              <span>Login code:</span>
              <strong className="big-code">{createdRoom.code}</strong>
            </div>
            <button onClick={copyCode} className="copy-btn">
              Copy
            </button>
            <p className="auto-redirect">Entering the room in 10 seconds...</p>
          </div>
        )}

        {!createdRoom && (
          <div className="room-options-grid">
            <div className="option-card create-room-card">
              <div className="card-icon">✨</div>
              <h3>Create a room</h3>
              <p>A room with a unique code is instantly created</p>

              {error && <p className="error-text">{error}</p>}

              <button
                onClick={createRoom}
                disabled={isCreating}
                className="create-room-btn"
              >
                {isCreating ? (
                  <>
                    <span className="loading-spinner small"></span>Create...
                  </>
                ) : (
                  "Create a room"
                )}
              </button>
            </div>

            {/* Присоединиться по коду */}
            <div className="option-card join-room-card">
              <div className="card-icon">→</div>
              <h3>Join a room</h3>
              <p>Enter the code from your friend and start the game</p>
              <JoinByCode />
            </div>
          </div>
        )}

        <button onClick={() => navigate("/game")} className="back-btn-modern">
          ← Back to game
        </button>
      </div>
    </div>
  );
}
