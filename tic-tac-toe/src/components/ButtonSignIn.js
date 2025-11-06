import { useNavigate } from "react-router-dom";

function ButtonSignIn({ onValidation }) {
  const navigate = useNavigate();

  function onSignInClick() {
    const errors = onValidation();
    if (errors.nickname === "" && errors.password === "") {
      navigate("/game");
    }
  }

  return (
    <button className="buttonSignIn" onClick={onSignInClick}>
      Sign in
    </button>
  );
}

export default ButtonSignIn;