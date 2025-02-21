import React, { useState, useRef, useEffect } from "react";
import "./Puzzel.css";
import CustomKeyBoard from "./CustomKeyBoard";
import { arrowBack, arrowNext, MoreIcon, ResetIcon, SettingIcon, stopIcon } from "../assets/base64";
import Overlay from "./Overlay";
import ConfirmationBox from "./ConfirmationBox";
import CongratsPopup from "./CongratsPopup";

const crosswordData = {
  grid: [
    ["F", "I", "F", "A", "Y"],
    ["B", "E", "E", "S", "A"],
    ["C", "A", "T", "E", "Z"],
    ["A", "P", "P", "L", "E"],
    [null, "P", "B", "L", null],
  ],
  numbers: {
    "0-0": 1,
    "1-0": 6,
    "2-0": 7,
    "3-0": 8,
    "4-1": 9,
    "0-1": 2,
    "0-2": 3,
    "0-3": 4,
    "0-4": 5,
  },
  clues: {
    across: {
      1: { clue: "Governing body of world soccer", row: 0, col: 0 },
      6: { clue: "A common pet with whiskers", row: 1, col: 0 },
      7: { clue: "Plural of feline animal", row: 2, col: 0 },
      8: { clue: "A fruit that keeps doctors away", row: 3, col: 0 },
      9: { clue: "A buzzing insect", row: 4, col: 1 },
    },
    down: {
      1: { clue: "use for testing", row: 0, col: 0 },
      2: { clue: "Opposite of rough", row: 0, col: 1 },
      3: { clue: "A small, buzzing insect", row: 0, col: 2 },
      4: { clue: "A type of tree or a company", row: 0, col: 3 },
      5: { clue: "A popular search engine", row: 0, col: 4 },
    },
  },
  solution: {
    "0-0": "F", "0-1": "I", "0-2": "F", "0-3": "A", "0-4": "Y",
    "1-0": "B", "1-1": "E", "1-2": "E", "1-3": "S", "1-4": "A",
    "2-0": "C", "2-1": "A", "2-2": "T", "2-3": "E", "2-4": "Z",
    "3-0": "A", "3-1": "P", "3-2": "P", "3-3": "L", "3-4": "E",
    "4-1": "P", "4-2": "B", "4-3": "L",
  },
};

const Puzzel = () => {
  const inputRefs = useRef({});

  const [answers, setAnswers] = useState({});
  const [focusedClue, setFocusedClue] = useState({
    row:0,
    col:0
  });
  const [direction, setDirection] = useState("across");
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState({});


  const [selectedRow, setSelectedRow] = useState(0);
  const [time, setTime] = useState(0);
  const [finalTime, setFinalTime] = useState(null);

  
  const [isRunning, setIsRunning] = useState(true);
  const [autoCheck, setAutoCheck] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState({});
  const [selectedCol, setSelectedCol] = useState(0);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showRevealConfirmation, setShowRevealConfirmation] = useState(false);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [hasSeenCongrats, setHasSeenCongrats] = useState(false);
  

 // Puzzle solved check
useEffect(() => {
  if (!crosswordData.solution || hasSeenCongrats) return; 

  const requiredKeys = crosswordData.grid
    .flatMap((row, rowIndex) =>
      row.map((cell, colIndex) => (cell !== null ? `${rowIndex}-${colIndex}` : null))
    )
    .filter(Boolean);

  const isSolved = requiredKeys.every((key) => answers[key] === crosswordData.solution[key]);

  if (isSolved) {
    setPuzzleSolved(true);
    setFinalTime(time); 
    setIsRunning(false); 
    setHasSeenCongrats(true); 
  }
}, [answers]);

const resetGame = () => {
  setAnswers({});
  setWrongAnswers({});
  setPuzzleSolved(false);
  setTime(0);
  setFinalTime(null);
  setIsRunning(true);
  setHasSeenCongrats(false); 
};

  const resetTimer = () => setTime(0);
  
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    } else {
      return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
        2,
        "0"
      )}`;
    }
  };

  const allClues = [
    ...Object.entries(crosswordData.clues.across),
    ...Object.entries(crosswordData.clues.down),
  ];

  useEffect(() => {
    if (focusedClue) {
      const { row, col } = focusedClue;
      const key = `${row}-${col}`;
      if (inputRefs.current[key]) {
        inputRefs.current[key].focus();
      }
    }
  }, [focusedClue]);

  const handleClueClick = (row, col, dir) => {
    setFocusedClue({ row, col });
    setDirection(dir);
  };
  const handleCellClick = (row, col) => {
    setSelectedRow(row);
    setSelectedCol(col);

    if (!isRunning) return;

    if (crosswordData.grid[row][col] !== null) {
        if (focusedClue?.row === row && focusedClue?.col === col) {
            // Toggle direction when clicking the same cell
            setDirection((prevDirection) => {
                const newDirection = prevDirection === "down" ? "across" : "down";

                let clueNumber = null;

                if (row === 0 && col === 0) {
                    clueNumber = crosswordData.numbers["0-0"];
                } else {
                    if (newDirection === "across") {
                        for (let c = 0; c < crosswordData.grid[row].length; c++) {
                            if (crosswordData.numbers[`${row}-${c}`]) {
                                clueNumber = crosswordData.numbers[`${row}-${c}`];
                                break;
                            }
                        }
                    } else {
                        for (let r = 0; r < crosswordData.grid.length; r++) {
                            if (crosswordData.numbers[`${r}-${col}`]) {
                                clueNumber = crosswordData.numbers[`${r}-${col}`];
                                break;
                            }
                        }
                    }
                }

                if (clueNumber) {
                    const newIndex = allClues.findIndex(([clueNum]) => Number(clueNum) === clueNumber);
                    if (newIndex !== -1) setCurrentClueIndex(newIndex);
                }

                return newDirection;
            });
        } else {
            // Keep the same direction when selecting a new cell
            setFocusedClue({ row, col });

            let clueNumber = null;

            if (row === 0 && col === 0) {
                clueNumber = crosswordData.numbers["0-0"];
            } else {
                if (direction === "across") {
                    for (let c = 0; c < crosswordData.grid[row].length; c++) {
                        if (crosswordData.numbers[`${row}-${c}`]) {
                            clueNumber = crosswordData.numbers[`${row}-${c}`];
                            break;
                        }
                    }
                } else {
                    for (let r = 0; r < crosswordData.grid.length; r++) {
                        if (crosswordData.numbers[`${r}-${col}`]) {
                            clueNumber = crosswordData.numbers[`${r}-${col}`];
                            break;
                        }
                    }
                }
            }

            if (clueNumber) {
                const newIndex = allClues.findIndex(([clueNum]) => Number(clueNum) === clueNumber);
                if (newIndex !== -1) setCurrentClueIndex(newIndex);
            }
        }
    }
};

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("td")) {
        return; 
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleClueNavigation = (step) => {
    let newIndex =
      (currentClueIndex + step + allClues.length) % allClues.length;
    
    const [clueNumber, clueData] = allClues[newIndex];
  
    setCurrentClueIndex(newIndex);
    setFocusedClue({ row: clueData.row, col: clueData.col });
  
    if (crosswordData.clues.across[clueNumber] && crosswordData.clues.down[clueNumber]) {
      setDirection((prevDirection) => (prevDirection === "across" ? "down" : "across"));
    } else {
      setDirection(crosswordData.clues.across[clueNumber] ? "across" : "down");
    }
  };
  
  useEffect(() => {
    // Focus on the first available input field when the component mounts
    const firstKey = Object.keys(crosswordData.numbers)[0];
    if (inputRefs.current[firstKey]) {
      inputRefs.current[firstKey].focus();
      setFocusedClue({
        row: parseInt(firstKey.split("-")[0]),
        col: parseInt(firstKey.split("-")[1]),
      });
    }
  }, []);

  // ✅ Check Only Selected Row (Supports Across & Down)
  const handleCheckSelectedRow = () => {
    if (selectedRow === null || selectedCol === null) return;

    const updatedWrongAnswers = { ...wrongAnswers };

    crosswordData.grid.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        if (
          (direction === "across" && rowIndex === selectedRow) ||
          (direction === "down" && colIndex === selectedCol)
        ) {
          if (answers[key] !== letter) {
            updatedWrongAnswers[key] = true;
          } else {
            delete updatedWrongAnswers[key];
          }
        }
      });
    });

    setWrongAnswers(updatedWrongAnswers);
  };

  // ✅ Check Whole Puzzle
  const handleCheckPuzzle = () => {
    const updatedWrongAnswers = {};

    crosswordData.grid.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        if (answers[key] !== letter) {
          updatedWrongAnswers[key] = true;
        }
      });
    });

    setWrongAnswers(updatedWrongAnswers);
  };

  // ✅ Clear Only Selected Row (Supports Across & Down)
  const handleClearSelectedRow = () => {
    if (selectedRow === null || selectedCol === null) return;
  
    const updatedAnswers = { ...answers };
    const updatedWrongAnswers = { ...wrongAnswers };
  
    crosswordData.grid.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
  
        if (
          (direction === "across" && rowIndex === selectedRow) ||
          (direction === "down" && colIndex === selectedCol)
        ) {
          if (!revealedAnswers[key]) { // Skip revealed values
            delete updatedAnswers[key];
            delete updatedWrongAnswers[key];
          }
        }
      });
    });
  
    setAnswers(updatedAnswers);
    setWrongAnswers(updatedWrongAnswers);
  };
  

  // ✅ Clear Entire Puzzle
  const handleClearPuzzle = () => {
    setAnswers((prev) => {
      const updatedAnswers = {};
  
      // Preserve revealed answers
      Object.keys(prev).forEach((key) => {
        if (revealedAnswers[key]) {
          updatedAnswers[key] = prev[key]; // Keep revealed letters
        }
      });
  
      return updatedAnswers;
    });
  
    setWrongAnswers({}); // Clear wrong answers
  };

  const handleRestart = () => {
    setAnswers({});
    setWrongAnswers({});
    resetTimer();
    setShowResetConfirmation(false)
    setFocusedClue({
      row:0,
      col:0
    })
    setCurrentClueIndex(0)
  };

  const handleRevealWholePuzzle = () => {
    const updatedAnswers = {};
    const updatedRevealed = {};
  
    crosswordData.grid.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        updatedAnswers[key] = letter; // Fill correct letter
        updatedRevealed[key] = true; // Mark as revealed
      });
    });
  
    setAnswers(updatedAnswers);
    setWrongAnswers({});
    setRevealedAnswers(updatedRevealed);
    setShowRevealConfirmation(false)
  };
  

  const handleRevealSelectedRow = () => {
    if (selectedRow === null || selectedCol === null) return;
  
    const updatedAnswers = { ...answers };
    const updatedWrongAnswers = { ...wrongAnswers };
    const updatedRevealed = { ...revealedAnswers };
  
    crosswordData.grid.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        if (
          (direction === "across" && rowIndex === selectedRow) ||
          (direction === "down" && colIndex === selectedCol)
        ) {
          updatedAnswers[key] = letter; // Fill correct letter
          updatedRevealed[key] = true; // Mark as revealed
          delete updatedWrongAnswers[key]; // Remove wrong marking
        }
      });
    });
  
    setAnswers(updatedAnswers);
    setWrongAnswers(updatedWrongAnswers);
    setRevealedAnswers(updatedRevealed);
  };
  

  const autoCheckOnValueChange = (row, col, value) =>{
    const correctValue = crosswordData.grid[row][col];
    setWrongAnswers((prev) => ({
      ...prev,
      [`${row}-${col}`]: value && value !== correctValue ? true : false,
    }));
  }
  
  const handleKeyInput = (key) => {
    if (!focusedClue) return; // No cell selected
  
    const { row, col } = focusedClue;
    const keyPosition = `${row}-${col}`;
    const upperKey = key.toUpperCase();
  
    // Check if the cell is revealed or already has a value
    const isRevealed = revealedAnswers[keyPosition];
    const alreadyFilled = answers[keyPosition];
  
    if (/^[A-Z]$/.test(upperKey)) {
      if (isRevealed || alreadyFilled) {
        moveToNextCell(row, col); // Move forward but do not change value
        return;
      }
  
      if (autoCheck) {
        autoCheckOnValueChange(row, col, upperKey);
      }
      setAnswers((prev) => {
        const newAnswers = { ...prev, [keyPosition]: upperKey };
        moveToNextCell(row, col);
        return newAnswers;
      });
    } else if (key === "Backspace" || key === "⌫") {
      setAnswers((prev) => {
        moveToPreviousCell(row, col);
        return isRevealed ? prev : { ...prev, [keyPosition]: "" }; // Only clear if not revealed
      });
    }
  };
    

  useEffect(() => {
    const handleKeyPress = (e) => handleKeyInput(e.key);
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [focusedClue,answers, direction]); // Removed `answers` dependency
  

  const moveToNextCell = (row, col) => {
    let nextRow = row;
    let nextCol = col;
  
    if (direction === "across") {
      nextCol++; // Move right
    } else if (direction === "down") {
      nextRow++; // Move down
    }
  
    while (nextRow < crosswordData.grid.length && nextCol < crosswordData.grid[nextRow].length) {
      if (crosswordData.grid[nextRow][nextCol] !== null) {
        setFocusedClue({ row: nextRow, col: nextCol });
        return;
      }
  
      // Skip black cells
      if (direction === "across") {
        nextCol++;
        if (nextCol >= crosswordData.grid[row].length) {
          nextRow++;
          nextCol = 0;
        }
      } else if (direction === "down") {
        nextRow++;
        if (nextRow >= crosswordData.grid.length) return;
      }
    }
  };
  
  const moveToPreviousCell = (row, col) => {
    let prevRow = row;
    let prevCol = col;
  
    if (direction === "across") {
      prevCol--; // Move left
    } else if (direction === "down") {
      prevRow--; // Move up
    }
  
    while (prevRow >= 0 && prevCol >= 0) {
      if (crosswordData.grid[prevRow][prevCol] !== null) {
        setFocusedClue({ row: prevRow, col: prevCol });
        return;
      }
  
      // Skip black cells
      if (direction === "across") {
        prevCol--;
        if (prevCol < 0) {
          prevRow--;
          prevCol = crosswordData.grid[prevRow]?.length - 1 || 0;
        }
      } else if (direction === "down") {
        prevRow--;
        if (prevRow < 0) return;
      }
    }
  };

  const onResetButtonClick = () =>{
    setShowResetConfirmation(!showResetConfirmation)
  }
  const onRevealButtonClick = () =>{
    setShowRevealConfirmation(!showRevealConfirmation)
  }
  const BackToPuzzel = () =>{
    setPuzzleSolved(false)
  }

  return (
    <>
      {!isRunning && !hasSeenCongrats && <Overlay setIsRunning={setIsRunning} />}
      {showResetConfirmation && <ConfirmationBox handleCancel={onResetButtonClick} handleSubmission={handleRestart} title={'Are you sure you want to start over?'} btnText={'Start Over'}/>}
      {showRevealConfirmation && <ConfirmationBox handleCancel={onRevealButtonClick} handleSubmission={handleRevealWholePuzzle} title={'Are you sure you want to reveal the puzzel?'} btnText={'Reveal'}/>}
      {puzzleSolved && <CongratsPopup handleCancel={BackToPuzzel} time={formatTime(finalTime)}/>}
      <nav className="d-flex py-2 px-3 mb-lg-5 mb-3 justify-content-between border-bottom">
        <div className="w-auto">
          <div className="w-auto">
            <button
              className="bg-transparent p-0 me-1"
              onClick={() => setIsRunning(!isRunning)}
            >
              <img src={stopIcon} alt="stop" width={22} />
            </button>
            <span className="fw-bold mt-1">{formatTime(time)}</span>
          </div>
        </div>

        <div className="w-auto title">
          <h5 className="text-start p-0 m-0">The Mini Crossword Puzzle</h5>
        </div>
        <div className="d-flex">
           {
             hasSeenCongrats &&
            <div className="me-2 pe-1">
            <button
              className={`btn btn-light p-1 pt-0 border-0`}
              type="button"
              onClick={resetGame}
            >
              <img src={ResetIcon} alt="Reset" width={18} />
            </button>
            </div>
           }
         <div className="dropdown">
            <button
              className={`btn btn-light p-1 pt-0 border-0`}
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img src={MoreIcon} alt="More" width={18} />
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            <li>
                <button className="dropdown-item" onClick={() => setAutoCheck(!autoCheck)}>
                  {autoCheck && "✅"} Autocheck 
                </button>
              </li>
              <li><button className="dropdown-item" onClick={handleCheckSelectedRow}>Check Word</button></li>
              <li><button className="dropdown-item" onClick={handleCheckPuzzle}>Check Puzzel</button></li>
              <li><button className="dropdown-item" onClick={handleRevealSelectedRow}>Reveal Word</button></li>
              <li><button className="dropdown-item" onClick={onRevealButtonClick}>Reveal Puzzel</button></li>
              <li><button className="dropdown-item" onClick={handleClearSelectedRow}>Clear Word</button></li>
              <li><button className="dropdown-item" onClick={handleClearPuzzle}>Clear Puzzel</button></li>
              <li><button className="dropdown-item" onClick={onResetButtonClick}>Reset Puzzel</button></li>
              
            </ul>
          </div>
          <div className="ms-2 ps-1">
          <button className="  btn btn-light p-1 pt-0 border-0">
            <img src={SettingIcon} alt="stop" width={22} />
          </button>
          </div> 
        </div>
      </nav>
      <div className="d-flex justify-content-center">
        <div className={`container  ${((!isRunning && !hasSeenCongrats) || showResetConfirmation) && "blur-content"}`}>
          <div className="row  d-flex justify-content-center">
            <div className="col-auto px-0 ">
              <div className="puzzel-section">
                <table>
                  <tbody>
                    {crosswordData.grid.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => {
                          const key = `${rowIndex}-${colIndex}`;

                          return (
                            <td
                              key={colIndex}
                              style={{
                                width: "67px",
                                height: "65px",
                                background:
                                  cell === null
                                    ? "black"
                                    : focusedClue?.row === rowIndex &&
                                      focusedClue?.col === colIndex
                                    ? "#ffda00" // Selected cell (Yellow)
                                    : (direction === "across" &&
                                        focusedClue?.row === rowIndex) ||
                                      (direction === "down" &&
                                        focusedClue?.col === colIndex)
                                    ? "#a4dbfb" // Row/Column Highlight (Blue)
                                    : "white",
                                position: "relative",
                                border:
                                  focusedClue?.row === rowIndex &&
                                  focusedClue?.col === colIndex
                                    ? "2px solid #ffda00" // Border highlight for selected box
                                    : "1px solid black",
                              }}
                              onClick={() =>
                                handleCellClick(rowIndex, colIndex)
                              }
                            >
                              {crosswordData.numbers[key] && (
                                <span
                                  style={{
                                    position: "absolute",
                                    top: 2,
                                    left: 4,
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {crosswordData.numbers[key]}
                                </span>
                              )}
                              {typeof cell === "string" && (
                              <input
                              type="text"
                              maxLength="1"
                              value={answers[key] || ""}
                              readOnly // Make it non-focusable
                              className={`text-center custom-input ${
                                wrongAnswers[key] && answers[key] ? "wrong-char" : ""
                              }`}
                              style={{
                                width: "65px",
                                height: "55px",
                                fontSize: "1.5rem",
                                textTransform: "uppercase",
                                border: "none",
                                outline: "none",
                                fontWeight:'bold',
                                textAlign: "center",
                                color: revealedAnswers[key] ? "#0D92F4" : "black",
                                // backgroundColor: focusedClue?.row === rowIndex && focusedClue?.col === colIndex ? "#ffda00" : "white",
                              }}
                            />
                              
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-12 px-0 clue-section-sm mt-4 ">
              <div className="d-flex justify-content-between clue-text-bg">
                <button
                  className="transparent-btn"
                  onClick={() => handleClueNavigation(-1)}
                >
                  <img src={arrowBack} alt="back" />
                </button>
                {allClues[currentClueIndex][1].clue}
                <button
                  className="transparent-btn"
                  onClick={() => handleClueNavigation(1)}
                >
                  <img src={arrowNext} alt="back" />
                </button>
              </div>
              <CustomKeyBoard onKeyPress={handleKeyInput} />
            </div>

            <div className="col clue-section">
  <h6 className="ps-3">Across</h6>
  <ul>
    {Object.entries(crosswordData.clues?.across).map(([num, clueData]) => {
      const isSelected =
        focusedClue?.row === clueData.row && focusedClue?.col === clueData.col && direction === "across";

      return (
        <li
          key={num}
          style={{
            cursor: "pointer",
            listStyle: "none",
            background: isSelected ? "#a4dbfb" : "transparent", // Highlight selected clue
            // fontWeight: isSelected ? "bold" : "normal", // Make it bold when selected
            padding: "2px 5px",
            borderRadius: "4px",
          }}
          onClick={() => handleClueClick(clueData.row, clueData.col, "across")}
        >
          <strong>{num}:</strong> {clueData.clue}
        </li>
      );
    })}
  </ul>

  <h6 className="ps-3">Down</h6>
  <ul>
    {Object.entries(crosswordData.clues?.down).map(([num, clueData]) => {
      const isSelected =
        focusedClue?.row === clueData.row && focusedClue?.col === clueData.col && direction === "down";

      return (
        <li
          key={num}
          style={{
            cursor: "pointer",
            listStyle: "none",
            background: isSelected ? "#a4dbfb" : "transparent", // Highlight selected clue
            // fontWeight: isSelected ? "bold" : "normal",
            padding: "2px 5px",
            borderRadius: "4px",
          }}
          onClick={() => handleClueClick(clueData.row, clueData.col, "down")}
        >
          <strong>{num}:</strong> {clueData.clue}
        </li>
      );
    })}
  </ul>
</div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Puzzel;
