import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { auth } from "./firebase";

export function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export const updateLeaderboard = async (nickname, result) => {
  if (!nickname || nickname === "Guest" || !auth.currentUser) return;

  const userRef = doc(db, "users", auth.currentUser.uid);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Пользователь есть — обновляем счётчики
      await updateDoc(userRef, {
        totalGames: increment(1),
        wins: result === "win" ? increment(1) : increment(0),
        losses: result === "loss" ? increment(1) : increment(0),
        draws: result === "draw" ? increment(1) : increment(0),
        score: increment(result === "win" ? 10 : result === "draw" ? 5 : -5),
        nickname: nickname,
        lastPlayed: serverTimestamp(),
      });
    } else {
      // Первый раз — создаём профиль
      await setDoc(userRef, {
        nickname: nickname,
        totalGames: 1,
        wins: result === "win" ? 1 : 0,
        losses: result === "loss" ? 1 : 0,
        draws: result === "draw" ? 1 : 0,
        score: result === "win" ? 3 : result === "draw" ? 1 : 0,
        createdAt: serverTimestamp(),
        lastPlayed: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Leaderboard update error:", error);
  }
};

export const saveGameToHistory = async (player1, player2, winnerUid) => {
  try {
    await addDoc(collection(db, "gameHistory"), {
      players: [
        { uid: player1.uid, nickname: player1.nickname },
        { uid: player2.uid, nickname: player2.nickname },
      ],
      playerIds: [player1.uid, player2.uid],
      winner: winnerUid === "bot" ? "bot" : winnerUid,
      endedAt: serverTimestamp(),
      endedAtMs: Date.now(),
    });
  } catch (e) {
    console.error("Ошибка сохранения игры:", e);
  }
};
