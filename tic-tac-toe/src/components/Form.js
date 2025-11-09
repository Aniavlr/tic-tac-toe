import ButtonSignIn from "./ButtonSignIn";
import { saveUserToStorage } from "../helper";
import { useState } from "react";

function Form() {
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ nickname: "", password: "" });

  function validate() {
    const newErrors = { nickname: "", password: "" };

    if (nickname.length < 4) {
      newErrors.nickname = "Nickname must be at least 4 characters";
    }

    if (password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    }

    setErrors(newErrors);

    if (!newErrors.nickname && !newErrors.password) {
      saveUserToStorage(nickname,password);
    }
    return newErrors;
  }

  return (
    <>
      <div className="form-container">
        <h1 className="headerForm">Enter the Game</h1>

        <div className="input-group">
          <label htmlFor="nick">Nickname</label>
          <input
            className="input"
            id="nick"
            name="nick"
            type="text"
            minLength={5}
            required
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          {errors.nickname ? (
            <span className="error-message">{errors.nickname}</span>
          ) : null}
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            minLength={5}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password ? (
            <span className="error-message">{errors.password}</span>
          ) : null}
        </div>
        <div className="buttonContainer">
          <ButtonSignIn onValidation={validate} />
        </div>
      </div>
    </>
  );
}

export default Form;
