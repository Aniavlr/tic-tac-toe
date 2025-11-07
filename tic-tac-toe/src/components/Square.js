function Square({ value, onSquareClick }) {
const square = `square ${value ? value.toLowerCase() : ''}`;

  return (
    <button className={square} onClick={onSquareClick}>
      {value}
    </button>
  );
}

export default Square;
