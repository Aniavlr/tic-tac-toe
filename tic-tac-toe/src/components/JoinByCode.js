// src/components/JoinByCode.jsx — Чистый и красивый стиль
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function JoinByCode() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const joinRoom = async () => {
    if (code.length !== 6) {
      setError("The code must contain 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "rooms"),
        where("code", "==", code.toUpperCase())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("Room not found");
        setLoading(false);
        return;
      }

      const roomDoc = snap.docs[0];
      const room = roomDoc.data();

      if (room.status !== "waiting") {
        setError("The game has already started");
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      const uid = user?.uid || "guest";
      const name = user?.displayName || "Guest";

      await updateDoc(doc(db, "rooms", roomDoc.id), {
        players: [...room.players, { uid, nickname: name, symbol: "O" }],
        status: "playing",
        currentTurn: "X",
        updatedAt: serverTimestamp(),
      });

      navigate(`/room/${roomDoc.id}`);
    } catch (err) {
      setError("Connection error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-by-code-modern">
      <div className="join-container">
        <div className="input-wrapper">
          <input
            type="text"
            maxLength="6"
            value={code}
            onChange={(e) => {
              const value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
              setCode(value);
              setError("");
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && code.length === 6 && joinRoom()
            }
            placeholder="ABC123"
            className={`code-input ${error ? "error" : ""}`}
            autoFocus
          />
          <span className="input-highlight"></span>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          onClick={joinRoom}
          disabled={loading || code.length !== 6}
          className="join-btn"
        >
          {loading ? "Connection..." : "Join"}
        </button>
      </div>
    </div>
  );
}
