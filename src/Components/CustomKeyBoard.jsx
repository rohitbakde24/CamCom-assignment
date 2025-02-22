const CustomKeyBoard = ({ onKeyPress }) => {
    const keys = [
      "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
      "A", "S", "D", "F", "G", "H", "J", "K", "L",
      "Z", "X", "C", "V", "B", "N", "M", "⌫"
    ];
  
    return (
      <div className="keyboard">
        {keys.map((key) => (
          <button
            key={key}
            className={key === "⌫" ? "back-key key":"key"}
            onClick={() => onKeyPress(key)}
          >
            {key}
          </button>
        ))}
      </div>
    );
  };

  export default CustomKeyBoard;