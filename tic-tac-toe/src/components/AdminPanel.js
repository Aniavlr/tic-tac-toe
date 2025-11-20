import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query } from "firebase/firestore";

function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); //состояние для отслеживания первоначальной загрузки

  // Проверяем, авторизован ли пользователь как админ
  useEffect(() => {
    const checkAdminAuth = () => {
      const currentUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      const isAdmin = currentUser.isAdmin === true;
      setIsAuthenticated(isAdmin);

      if (isAdmin) {
        loadGameHistory();
      } else {
        setInitialLoad(false); // Если не админ, сбрасываем флаг загрузки
      }
    };

    checkAdminAuth();
  }, []);

  const checkIfUserIsAdmin = async (userUid, userEmail) => {
    try {
      console.log("Checking admin status for:", userEmail, userUid);

      // Способ 1: Проверка по email (самый надежный для начала)
      const adminEmails = [
        "admin@mytictactoe.com",
        "test@admin.com",
        "admin@example.com",
      ];

      if (adminEmails.includes(userEmail)) {
        console.log("User is admin by email");
        return true;
      }

      // Способ 2: Проверка через коллекцию uids
      try {
        const adminListRef = collection(db, "admins", "adminList", "uids");
        const adminSnapshot = await getDocs(adminListRef);

        let isAdmin = false;
        adminSnapshot.forEach((doc) => {
          if (doc.id === userUid) {
            isAdmin = true;
          }
        });

        if (isAdmin) {
          console.log("User is admin by UID in collection");
          return true;
        }
      } catch (collectionError) {
        console.log("Collection check failed:", collectionError.message);
      }

      // Способ 3: Проверка через документ с массивом UID
      try {
        const adminListDoc = await getDoc(doc(db, "admins", "adminList"));
        if (adminListDoc.exists()) {
          const data = adminListDoc.data();
          if (data.uids && data.uids.includes(userUid)) {
            console.log("User is admin by UID in array");
            return true;
          }
          if (data.admins && data.admins.includes(userUid)) {
            console.log("User is admin by admins array");
            return true;
          }
        }
      } catch (docError) {
        console.log("Document check failed:", docError.message);
      }

      console.log("User is NOT admin");
      return false;
    } catch (error) {
      console.error("Error in admin check:", error);
      return false;
    }
  };

  const loadGameHistory = async () => {
    try {
      setLoadingHistory(true);
      setError("");
      console.log("🔄 Loading game history...");

      const gameHistoryRef = collection(db, "gameHistory");
      // Добавляем сортировку по убыванию времени окончания
      const q = query(gameHistoryRef);
      const querySnapshot = await getDocs(q);

      console.log("📊 Found documents:", querySnapshot.size);

      const history = [];
      querySnapshot.forEach((doc) => {
        const gameData = doc.data();
        console.log("🎮 Game data:", doc.id, gameData);

        history.push({
          id: doc.id,
          ...gameData,
        });
      });

      history.sort((a, b) => {
        const timeA = a.endedAtMs?.toDate?.() || a.endedAtMs || 0;
        const timeB = b.endedAtMs?.toDate?.() || b.endedAtMs || 0;
        return new Date(timeB) - new Date(timeA);
      });

      console.log(`✅ Loaded ${history.length} games`);
      setGameHistory(history);
      setInitialLoad(false); // Данные загружены, сбрасываем флаг первоначальной загрузки
    } catch (error) {
      console.error("❌ Error loading game history:", error);
      setError(`Failed to load game history: ${error.message}`);
      setInitialLoad(false); // Даже при ошибке сбрасываем флаг
    } finally {
      setLoadingHistory(false);
      setInitialLoad(false);
    }
  };

  // Функция для форматирования данных из вашей структуры
  const getPlayerInfo = (game) => {
    // Ваша структура: players - массив объектов с nickname и uid
    if (
      game.players &&
      Array.isArray(game.players) &&
      game.players.length >= 2
    ) {
      const p1 = game.players[0];
      const p2 = game.players[1];
      const winnerUid = game.winner;

      return {
        playerX: p1?.nickname || "Player X",
        playerO: p2?.nickname || (p2?.uid === "bot" ? "Bot" : "Player O"),
        winner:
          winnerUid === "bot"
            ? "Bot"
            : winnerUid === p1?.uid
            ? p1.nickname
            : winnerUid === p2?.uid
            ? p2.nickname
            : winnerUid || "Draw",
      };
    }

    const playerXUid = game.playerX || game.playerIds?.[0];
    const playerOUid = game.playerO || game.playerIds?.[1] || "bot";

    let playerXName = "Unknown";
    let playerOName = playerOUid === "bot" ? "Bot" : "Unknown";

    // Попробуем найти ники в users (если есть ссылки)
    if (game.playerX && typeof game.playerX === "string") {
      playerXName = game.playerX === "bot" ? "Bot" : "Player";
    }
    if (game.playerO && typeof game.playerO === "string") {
      playerOName = game.playerO === "bot" ? "Bot" : "Player";
    }

    // Если есть поле nickname где-то рядом
    if (game.playerXNickname) playerXName = game.playerXNickname;
    if (game.playerONickname) playerOName = game.playerONickname;

    const winner =
      game.winner === "bot"
        ? "Bot"
        : game.winner === playerXUid
        ? playerXName
        : game.winner === playerOUid
        ? playerOName
        : game.winner || "Draw";

    return {
      playerX: playerXName,
      playerO: playerOName,
      winner,
    };
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";

    try {
      // Если это Firestore timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }

      // Если это число (timestamp в ms)
      if (typeof timestamp === "number") {
        return new Date(timestamp).toLocaleString();
      }

      // Если это строка
      if (typeof timestamp === "string") {
        const parsedTimestamp = parseInt(timestamp);
        if (!isNaN(parsedTimestamp)) {
          return new Date(parsedTimestamp).toLocaleString();
        }
      }

      return "N/A";
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return "N/A";
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Пытаемся войти через Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const isAdmin = await checkIfUserIsAdmin(user.uid, user.email);

      if (!isAdmin) {
        await signOut(auth);
        setError("Access denied. Admin privileges required.");
        return;
      }

      // Сохраняем информацию об админе
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          nickname: user.displayName || "Admin",
          email: user.email,
          isLoggedIn: true,
          isAdmin: true,
          uid: user.uid,
          emailVerified: user.emailVerified,
        })
      );

      setIsAuthenticated(true);
      setInitialLoad(true); // Устанавливаем флаг загрузки при входе
      await loadGameHistory();
    } catch (error) {
      console.error("Admin login error:", error);
      setError(getFirebaseErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("currentUser");
      setIsAuthenticated(false);
      setGameHistory([]);
      setInitialLoad(true); // Сбрасываем при выходе
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getFirebaseErrorMessage = (errorCode) => {
    const errorMessages = {
      "auth/invalid-email": "Invalid email address",
      "auth/user-disabled": "This account has been disabled",
      "auth/user-not-found": "No account found with this email",
      "auth/wrong-password": "Incorrect password",
      "auth/too-many-requests": "Too many attempts, try again later",
      "auth/network-request-failed": "Network error, check your connection",
    };
    return errorMessages[errorCode] || "Authentication failed";
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-form">
          <h2>Admin Login</h2>
          <form onSubmit={handleAdminLogin}>
            <div className="input-group">
              <label htmlFor="admin-email">Admin Email</label>
              <input
                className="input"
                id="admin-email"
                type="email"
                placeholder="admin@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="admin-password">Password</label>
              <input
                className="input"
                id="admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button
              type="submit"
              className="admin-login-btn"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In as Admin"}
            </button>
          </form>
          <div className="admin-back-link">
            <button onClick={() => navigate("/")} className="back-to-game-btn">
              Back to Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Admin Panel - Game History</h2>
        <div className="admin-header-info">
          <span className="games-count">
            Loaded: {gameHistory.length} games
          </span>
          <button onClick={handleLogout} className="admin-logout-btn">
            Log Out
          </button>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Matches</h3>
          {initialLoad || loadingHistory ? (
            <div className="stats-loading">
              <div className="loading-spinner small"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <p>{gameHistory.length}</p>
          )}
        </div>
      </div>

      <div className="game-history-section">
        <div className="section-header">
          <h3>All Matches</h3>
          <div className="section-actions">
            {error && <span className="error-text">{error}</span>}
            <button
              onClick={loadGameHistory}
              className="refresh-btn"
              disabled={loadingHistory}
            >
              {loadingHistory ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div
          className="game-history-content"
          style={{ position: "relative", minHeight: "400px" }}
        >
          {initialLoad || loadingHistory ? (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <div className="loading-text">
                {initialLoad
                  ? "Loading game history..."
                  : "Refreshing game history..."}
              </div>
            </div>
          ) : gameHistory.length === 0 ? (
            <div className="no-data-message">No game history found</div>
          ) : (
            <div className="game-history-table-container">
              <table className="game-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Player 1</th>
                    <th>Player 2</th>
                    <th>Winner</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory.map((game) => {
                    const playerInfo = getPlayerInfo(game);

                    return (
                      <tr key={game.id}>
                        <td>{formatTimestamp(game.endedAtMs)}</td>
                        <td>{playerInfo.playerX}</td>
                        <td>{playerInfo.playerO}</td>
                        <td>
                          <span
                            className={`winner-badge ${
                              playerInfo.winner === "Bot"
                                ? "winner-bot"
                                : playerInfo.winner === playerInfo.playerX
                                ? "winner-x"
                                : "winner-draw"
                            }`}
                          >
                            {playerInfo.winner}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
