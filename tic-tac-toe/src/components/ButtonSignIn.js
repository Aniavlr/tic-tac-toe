

function ButtonSignIn({ onValidation }) {
  function onSignInClick() {
    onValidation();
  }

  return (
    <button className="buttonSignIn" onClick={onSignInClick}>
      Sign in
    </button>
  );
}

export default ButtonSignIn;