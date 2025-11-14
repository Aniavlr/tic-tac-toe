import SignInForm from "../components/SignInForm";

function LoginPage() {
  return (
    <>
      <div className="login-page-container">
        <div className="login-header">
          <h1>Let's Play Tic-Tac-Toe</h1>
        </div>
        <SignInForm/>
      </div>
    </>
  );
}

export default LoginPage;
