function Square({ value, onSquareClick, disabled }) {
const square = `square ${value ? value.toLowerCase() : ''}`;

  return (
    <button className={square} onClick={onSquareClick} disabled={disabled}>
      {value}
    </button>
  );
}

export default Square;
