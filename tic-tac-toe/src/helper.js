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

export function updateLeaderboard(playerName, result) {
  const leaderboard =
    JSON.parse(localStorage.getItem("TicTacToeLeaderboard")) || [];

  let playerIndex = leaderboard.findIndex((p) => p.name === playerName);
  if (playerIndex === -1) {
    playerIndex = leaderboard.length;
    leaderboard.push({
      id: Date.now(),
      name: playerName,
      score: 0,
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    });
  }
  const player = leaderboard[playerIndex];

  player.totalGames++;

  switch (result) {
    case "win":
      player.wins++;
      player.score += 30;
      break;
    case "loss":
      player.losses++;
      player.score -= 10;
      break;
    case "draw":
      player.draws++;
      player.score += 5;
      break;
    default:
    //
  }

  localStorage.setItem("TicTacToeLeaderboard", JSON.stringify(leaderboard));
}

export function saveUserToStorage(nickname, password) {
  const existingUsers = JSON.parse(
    localStorage.getItem("registeredUsers") || "[]"
  );

  const userExists = existingUsers.find((user) => user.nickname === nickname);
  if (userExists) {
       if (userExists.password === password) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          nickname: nickname,
          isLoggedIn: true,
        })
      );
      window.location.href = "/game";
    } else {
      alert("Wrong password!");
    }
    return;
  }
  const newUser = {
    id: Date.now(),
    nickname: nickname,
    password: password,
    registeredAt: new Date().toISOString(),
  };

  existingUsers.push(newUser);

  localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));

  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: newUser.id,
      nickname: nickname,
      isLoggedIn: true,
    })
  );

  window.location.href = "/game";
}
