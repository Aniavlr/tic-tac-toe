import { useState, useEffect } from "react";

function AccountInfa() {
  const [currentUser, setCurrentUser] = useState({ nickname: "Гость" });
  const [stats, setStats] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    setCurrentUser(user);

    const leaderboard = JSON.parse(localStorage.getItem("TicTacToeLeaderboard") || "[]");
    const playerStats = leaderboard.find(p => p.name === user.nickname) || {};
    setStats(playerStats);
  }, []);

  return (
    <>
      <div className="container">
        <div className="account-header">
          <h1>My Account</h1>
          <p>Statistics and achievements</p>
        </div>

        <div className="profile-section">
          <div className="profile-details">
            <h2>{currentUser.nickname || "Гость"}</h2>
            <p>
              В системе с:{" "}
              {currentUser.registeredAt
                ? new Date(currentUser.registeredAt).toLocaleDateString()
                : "Недавно"}
            </p>
          </div>
        </div>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalGames || 0}</div>
            <div className="stat-label">Всего игр</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.wins || 0}</div>
            <div className="stat-label">Побед</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.losses || 0}</div>
            <div className="stat-label">Поражений</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.draws || 0}</div>
            <div className="stat-label">Ничьих</div>
          </div>
        </div>

        <div className="achievements">
          <div className="achievements-list">
            {stats.wins >= 1 ? (
              <div className="achievement">🥇 Первая победа</div>
            ) : null}
            {stats.wins >= 5 ? (
              <div className="achievement">⭐ 5 побед</div>
            ) : null}
            {stats.wins >= 10 ? (
              <div className="achievement">⭐ 🏆 10 побед</div>
            ) : null}
            {stats.totalGames >= 20 ? (
              <div className="achievement">🎮 20 игр</div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountInfa;
