function ButtonSignIn({ onValidation }) {
  function onSignInClick(e) {
    onValidation(e);
  }

  return (
    <button className="buttonSignIn" onClick={onSignInClick} type="button">
      Sign in
    </button>
  );
}

export default ButtonSignIn;
