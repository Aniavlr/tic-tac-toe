import { useEffect, useState } from "react";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase";

export default function HistoryOfGame() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    // ждём, пока Firebase отдаст пользователя
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        loadHistory(user.uid, user.displayName || "You");
      } else {
        setUid(null);
        setList([]);
        setLoading(false);
      }
    });
    return unsub; // отписка при размонтировании
  }, []);

  const loadHistory = async (userId) => {
    try {
      const q = query(
        collection(db, "gameHistory"),
        where("playerIds", "array-contains", userId),
        limit(50)
      );
      const snap = await getDocs(q);
      const tmp = snap.docs
        .map((d) => {
          const data = d.data();

          const opponent = data.players?.find((p) => p.uid !== userId);
          const opponentName =
            opponent?.nickname || (opponent?.uid === "bot" ? "Bot" : "Unknown");

          let result;
          if (data.winner === "draw") {
            result = "draw";
          } else if (data.winner === userId) {
            result = "win";
          } else {
            result = "loss";
          }

          return {
            id: d.id,
            date: data.endedAt?.toDate() || new Date(data.endedAt),
            opponent: opponentName,
            result,
            isBot: opponent?.uid === "bot",
          };
        })
        .sort((a, b) => b.date - a.date);
      setList(tmp);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="history-wrap">
        <h2>History of games</h2>
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Download game history...</div>
        </div>
      </div>
    );
  }

  if (!uid) {
    return (
      <div className="history-wrap">
        <h2>History of games</h2>
        <p className="auth-message">Log in to account to see history</p>
      </div>
    );
  }

  return (
    <div className="history-wrap">
      <h2>History of games</h2>
      {list.length === 0 ? (
        <p className="empty-message">You haven't played yet</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Date and time</th>
              <th>VS</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {list.map((g) => (
              <tr key={g.id}>
                <td>{g.date.toLocaleString("ru-RU")}</td>
                <td className="history-match">
                  <span className={`opponent-name ${g.isBot ? "bot" : ""}`}>
                    {g.opponent}
                  </span>
                </td>
                <td className={`result ${g.result}`}>
                  {g.result === "win"
                    ? "Win"
                    : g.result === "loss"
                    ? "Loss"
                    : "Draw"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
