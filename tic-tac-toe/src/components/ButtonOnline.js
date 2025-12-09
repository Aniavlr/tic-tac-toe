import { useNavigate } from "react-router-dom";

function ButtonOnline() {
  const navigate = useNavigate();
  function handleClick() {
    navigate("/create-room");
  }
  return (
    <>
      <button type="button" onClick={handleClick} className="btn-play-online">
        Play Online
      </button>
    </>
  );
}

export default ButtonOnline;
