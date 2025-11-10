function Leaderboard() {
  const savedLeaderboard =
    JSON.parse(localStorage.getItem("TicTacToeLeaderboard")) || [];
  const topPlayers = savedLeaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (topPlayers.length === 0) {
    return (
      <div className="leaderboard">
        <h2>🏆 Leaderboard</h2>
        <p>No games played yet!</p>
        <p>Play some games to see statistics.</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
            <th>Games</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Draws</th>
          </tr>
        </thead>
        <tbody>
          {topPlayers.map((player, index) => (
            <tr key={player.id} className={index < 3 ? `top-${index + 1}` : ""}>
              <td>#{index + 1}</td>
              <td className="player-name">{player.name}</td>
              <td className="score">{player.score}</td>
              <td>{player.totalGames}</td>
              <td className="wins">{player.wins}</td>
              <td className="losses">{player.losses}</td>
              <td className="draws">{player.draws}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
