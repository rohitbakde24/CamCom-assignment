import React, { useState, useRef, useEffect } from "react";
import "./Puzzel.css";
import CustomKeyBoard from "./CustomKeyBoard";
import { arrowBack, arrowNext, MoreIcon, SettingIcon, stopIcon } from "../assets/base64";
import Overlay from "./Overlay";

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
};

const Puzzel = () => {
  const [answers, setAnswers] = useState({});
  const [focusedClue, setFocusedClue] = useState({
    row:0,
    col:0
  });
  const [direction, setDirection] = useState("across");
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const inputRefs = useRef({});

  const [selectedRow, setSelectedRow] = useState(null);
  const [time, setTime] = useState(0);

  const resetTimer = () => setTime(0);

  const [isRunning, setIsRunning] = useState(true);
  const [autoCheck, setAutoCheck] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState({});
  const [selectedCol, setSelectedCol] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        // If the same cell is clicked again, toggle direction
        setDirection((prevDirection) => {
          const newDirection = prevDirection === "down" ? "across" : "down";
  
          // Find the clue number for the new direction
          let clueNumber = null;
  
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
  
          if (clueNumber) {
            const newIndex = allClues.findIndex(([clueNum]) => Number(clueNum) === clueNumber);
            if (newIndex !== -1) setCurrentClueIndex(newIndex);
          }
  
          return newDirection;
        });
      } else {
        // If a new cell is clicked, keep the existing direction
        setFocusedClue({ row, col });
  
        let clueNumber = null;
  
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
  
        if (clueNumber) {
          const newIndex = allClues.findIndex(([clueNum]) => Number(clueNum) === clueNumber);
          if (newIndex !== -1) setCurrentClueIndex(newIndex);
        }
      }
    }
  };
  
  

  // Prevent deselecting input when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("td")) {
        return; // Do nothing if clicking outside the table
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleClueNavigation = (step) => {
    let newIndex =
      (currentClueIndex + step + allClues.length) % allClues.length;
    setCurrentClueIndex(newIndex);
    const [_, clueData] = allClues[newIndex];
    setFocusedClue({ row: clueData.row, col: clueData.col });
    setDirection(
      Object.keys(crosswordData.clues.across).includes(String(_))
        ? "across"
        : "down"
    );
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

    // const handleChange = (row, col, e) => {
    //   const value = e.target.value.toUpperCase();
    //   const correctValue = crosswordData.grid[row][col];

    //   setAnswers((prev) => ({ ...prev, [`${row}-${col}`]: value }));

    //   if (autoCheck) {
    //     setWrongAnswers((prev) => ({
    //       ...prev,
    //       [`${row}-${col}`]: value && value !== correctValue ? true : false,
    //     }));
    //   }
    // };

  // const handleKeyDown = (row, col, e) => {
  //   let newRow = row;
  //   let newCol = col;
  //   switch (e.key) {
  //     case "ArrowRight":
  //       newCol += 1;
  //       break;
  //     case "ArrowLeft":
  //       newCol -= 1;
  //       break;
  //     case "ArrowDown":
  //       newRow += 1;
  //       break;
  //     case "ArrowUp":
  //       newRow -= 1;
  //       break;
  //     case "Backspace":
  //       if (!e.target.value) {
  //         if (direction === "across") {
  //           newCol = Math.max(0, col - 1);
  //         } else {
  //           newRow = Math.max(0, row - 1);
  //         }
  //       }
  //       break;
  //     default:
  //       return; // Ignore other keys
  //   }

  //   const newKey = `${newRow}-${newCol}`;
  //   if (inputRefs.current[newKey]) {
  //     inputRefs.current[newKey].focus();
  //   }
  // };

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
          delete updatedAnswers[key];
          delete updatedWrongAnswers[key];
        }
      });
    });

    setAnswers(updatedAnswers);
    setWrongAnswers(updatedWrongAnswers);
  };

  // ✅ Clear Entire Puzzle
  const handleClearPuzzle = () => {
    setAnswers({});
    setWrongAnswers({});
  };

  const handleRestart = () => {
    setAnswers({});
    setWrongAnswers({});
    resetTimer();
  };

  const handleRevealWholePuzzle = () => {
    const updatedAnswers = {};

    crosswordData.grid.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        updatedAnswers[key] = letter; // Fill correct letter
      });
    });

    setAnswers(updatedAnswers);
    setWrongAnswers({});
  };

  const handleRevealSelectedRow = () => {
    if (selectedRow === null || selectedCol === null) return;

    const updatedAnswers = { ...answers };
    const updatedWrongAnswers = { ...wrongAnswers };

    crosswordData.grid.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        if (
          (direction === "across" && rowIndex === selectedRow) ||
          (direction === "down" && colIndex === selectedCol)
        ) {
          updatedAnswers[key] = letter; // Fill correct letter
          delete updatedWrongAnswers[key]; // Remove wrong marking
        }
      });
    });

    setAnswers(updatedAnswers);
    setWrongAnswers(updatedWrongAnswers);
  };


  const handleChange = (row, col, e) => {
    debugger
    const value = e.target.value.toUpperCase();
    
  
    setAnswers((prev) => ({ ...prev, [`${row}-${col}`]: value }));
  
    if (autoCheck) {
      autoCheckOnValueChange(row, col, value);
    }
  
    if (value) {
      moveToNextCell(row, col);
    }
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
    const upperKey = key.toUpperCase();
  
    if (/^[A-Z]$/.test(upperKey)) {
      if (autoCheck) {
        autoCheckOnValueChange(row, col, upperKey);
      }
      setAnswers((prev) => {
        const newAnswers = { ...prev, [`${row}-${col}`]: upperKey };
        moveToNextCell(row, col);
        return newAnswers;
      });
    } else if (key === "Backspace" || key === "⌫") {
      setAnswers((prev) => {
        if (!prev[`${row}-${col}`]) {
          moveToPreviousCell(row, col);
        }
        return { ...prev, [`${row}-${col}`]: "" };
      });
    }
  }

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
  

  return (
    <>
      {!isRunning && <Overlay setIsRunning={setIsRunning} />}
      <nav className="d-flex py-2 px-3 mb-lg-5 mb-3 justify-content-between border-bottom">
        <div className="w-auto">
          <div className="w-auto">
            <button
              className="bg-transparent p-0 me-1"
              onClick={() => setIsRunning(!isRunning)}
            >
              <img src={stopIcon} alt="stop" width={18} />
            </button>
            <span className="fw-bold mt-1">{formatTime(time)}</span>
          </div>
        </div>

        <div className="w-auto title">
          <h5 className=" text-start p-0 m-0">The Mini Crossword Puzzle</h5>
        </div>
        <div className="d-flex">
         <div className="dropdown">
            <button
              className={`btn btn-light p-1 pt-0 border-0`}
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img src={MoreIcon} alt="Settings" width={18} />
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
              <li><button className="dropdown-item" onClick={handleRevealWholePuzzle}>Reveal Puzzel</button></li>
              <li><button className="dropdown-item" onClick={handleClearSelectedRow}>Clear Row</button></li>
              <li><button className="dropdown-item" onClick={handleClearPuzzle}>Clear All</button></li>
              <li><button className="dropdown-item" onClick={handleRestart}>Restart</button></li>
              
            </ul>
          </div>
          <div className="ms-2">
          <button className="  btn btn-light p-1 pt-0 border-0">
            <img src={SettingIcon} alt="stop" width={18} />
          </button>
          </div> 
        </div>
      </nav>
      <div className="d-flex justify-content-center">
        <div className={`container  ${!isRunning && "blur-content"}`}>
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
                                textAlign: "center",
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
