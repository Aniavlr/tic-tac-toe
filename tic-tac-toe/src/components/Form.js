import ButtonSignIn from "./ButtonSignIn";
import ButtonRegister from "./ButtonRegister";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../helper";
import { useState } from "react";

function Form() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ nickname: "", password: "" });
  const [isLoginForm, setIsLoginForm] = useState(true);

  function validateLogin() {
    const newErrors = { nickname: "", password: "" };

    if (nickname.length < 4) {
      newErrors.nickname = "Nickname must be at least 4 characters";
    } else if (nickname.length > 12) {
      newErrors.nickname = "Nickname must be max 12 characters"; // ← ОШИБКА
    }

    if (password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    } else if (password.length > 20) {
      newErrors.password = "Password must be max 20 characters";
    }

    if (!newErrors.nickname && !newErrors.password) {
      const result = loginUser(nickname, password, navigate);
      if (!result.success) {
        if (result.password) newErrors.password = result.password;
        if (result.nickname) newErrors.nickname = result.nickname;
      }
    }

    setErrors(newErrors);
    return newErrors;
  }

  function validateRegister() {
    const newErrors = { nickname: "", password: "" };

    if (nickname.length < 4) {
      newErrors.nickname = "Nickname must be at least 4 characters";
    } else if (nickname.length > 12) {
      newErrors.nickname = "Nickname must be max 12 characters";
    }

    if (password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    } else if (password.length > 20) {
      newErrors.password = "Password must be max 20 characters";
    }

    if (!newErrors.nickname && !newErrors.password) {
      const result = registerUser(nickname, password, navigate);
      if (!result.success) {
        if (result.nickname) newErrors.nickname = result.nickname;
      }
    }

    setErrors(newErrors);
    return newErrors;
  }

  const toggleForm = () => {
    setIsLoginForm(!isLoginForm);
    setErrors({ nickname: "", password: "" }); // Очищаем ошибки при переключении
  };

  return (
    <>
      <div className="form-container">
        <h1 className="headerForm">
          {isLoginForm ? "Enter the Game" : "Create Account"}
        </h1>
        <form className={`signInForm ${isLoginForm ? "active" : "hidden"}`}>
          <div className="input-group">
            <label htmlFor="nick-login">Nickname</label>
            <input
              className="input"
              id="nick-login"
              name="nick"
              type="text"
              minLength={4}
              required
              value={nickname}
              maxLength={12}
              onChange={(e) => setNickname(e.target.value)}
            />
            {errors.nickname ? (
              <span className="error-message">{errors.nickname}</span>
            ) : null}
          </div>
          <div className="input-group">
            <label htmlFor="password-login">Password</label>
            <input
              className="input"
              id="password-login"
              name="password"
              type="password"
              minLength={5}
              required
              value={password}
              maxLength={20}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password ? (
              <span className="error-message">{errors.password}</span>
            ) : null}
          </div>
          <div className="buttonContainer">
            <ButtonSignIn onValidation={validateLogin} />
          </div>
          <div className="form-switch">
            <p>
              Don't have an account?{" "}
              <span className="switch-link" onClick={toggleForm}>
                Create one
              </span>
            </p>
          </div>
        </form>

        <form className={`registerForm ${!isLoginForm ? "active" : "hidden"}`}>
          <div className="input-group">
            <label htmlFor="nick-register">Nickname</label>
            <input
              className="input"
              id="nick-register"
              name="nick"
              type="text"
              minLength={4}
              required
              value={nickname}
              maxLength={12}
              onChange={(e) => setNickname(e.target.value)}
            />
            {errors.nickname ? (
              <span className="error-message">{errors.nickname}</span>
            ) : null}
          </div>
          <div className="input-group">
            <label htmlFor="password-register">Password</label>
            <input
              className="input"
              id="password-register"
              name="password"
              type="password"
              minLength={5}
              required
              value={password}
              maxLength={20}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password ? (
              <span className="error-message">{errors.password}</span>
            ) : null}
          </div>
          <div className="buttonContainer">
            <ButtonRegister onValidation={validateRegister} />
          </div>
        </form>
      </div>
    </>
  );
}

export default Form;
