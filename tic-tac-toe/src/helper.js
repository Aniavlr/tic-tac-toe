import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  serverTimestamp,
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
        score: increment(result === "win" ? 3 : result === "draw" ? 1 : 0),
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
        createdAt: serverTimestamp(), // ← ИСПРАВЛЕНО!
        lastPlayed: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error("Leaderboard update error:", error);
  }
};
