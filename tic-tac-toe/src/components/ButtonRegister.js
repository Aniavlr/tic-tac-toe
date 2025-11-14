function ButtonRegister({ onValidation }) {
  function onSignInClick() {
    onValidation();
  }

  return (
    <button className="buttonRegister" onClick={onSignInClick}>
      Registration
    </button>
  );
}

export default ButtonRegister;