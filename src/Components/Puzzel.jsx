import React, { useState, useRef, useEffect } from "react";
import './Puzzel.css';
import CustomKeyBoard from "./CustomKeyBoard";
import { arrowBack, arrowNext } from "../assets/base64";

const crosswordData = {
  grid: [
    ["F", "I", "F", "A", "Y"],
    ["B", "E", "E", "S", "A"],
    ["C", "A", "T", "E", "Z"],
    ["A", "P", "P", "L", "E"],
    [null, "P", "B", "L", null],
  ],
  numbers: {
    "0-0": 1, "1-0": 6, "2-0": 7, "3-0": 8, "4-1": 9,
    "0-1": 2, "0-2": 3, "0-3": 4, "0-4": 5,
  },
  clues: {
    across: {
      1: { clue: "Governing body of world soccer", row: 0, col: 0 },
      2: { clue: "A common pet with whiskers", row: 1, col: 0 },
      3: { clue: "Plural of feline animal", row: 2, col: 0 },
      4: { clue: "A fruit that keeps doctors away", row: 3, col: 0 },
      5: { clue: "A buzzing insect", row: 4, col: 0 },
    },
    down: {
      6: { clue: "Opposite of rough", row: 0, col: 1 },
      7: { clue: "A small, buzzing insect", row: 0, col: 2 },
      8: { clue: "A type of tree or a company", row: 0, col: 3 },
      9: { clue: "A popular search engine", row: 0, col: 4 },
    }
  }
};

const Puzzel = () => {
  const [answers, setAnswers] = useState({});
  const [focusedClue, setFocusedClue] = useState(null);
  const [direction, setDirection] = useState("across");
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const inputRefs = useRef({});

  const allClues = [...Object.entries(crosswordData.clues.across), ...Object.entries(crosswordData.clues.down)];

  useEffect(() => {
    if (focusedClue) {
      const { row, col } = focusedClue;
      const key = `${row}-${col}`;
      if (inputRefs.current[key]) {
        inputRefs.current[key].focus();
      }
    }
  }, [focusedClue]);

  // const handleCellClick = (row, col) => {
  //   if (focusedClue?.row === row && focusedClue?.col === col) {
  //     setDirection(direction === "down" ? "across" : "down");
  //   } else {
  //     setFocusedClue({ row, col });
  //     setDirection("down");
  //   }
  // };

  const handleClueClick = (row, col, dir) => {
    setFocusedClue({ row, col });
    setDirection(dir);
  };

  const handleCellClick = (row, col) => {
    if (crosswordData.grid[row][col] !== null) {
      if (focusedClue?.row === row && focusedClue?.col === col) {
        setDirection(direction === "down" ? "across" : "down");
      } else {
        setFocusedClue({ row, col });
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
    let newIndex = (currentClueIndex + step + allClues.length) % allClues.length;
    setCurrentClueIndex(newIndex);
    const [_, clueData] = allClues[newIndex];
    setFocusedClue({ row: clueData.row, col: clueData.col });
    setDirection(Object.keys(crosswordData.clues.across).includes(String(_)) ? "across" : "down");
  };

  // const handleChange = (row, col, e) => {
  //   const value = e.target.value.toUpperCase();
  //   setAnswers(prev => ({ ...prev, [`${row}-${col}`]: value }));
  // };

  useEffect(() => {
    // Focus on the first available input field when the component mounts
    const firstKey = Object.keys(crosswordData.numbers)[0];
    if (inputRefs.current[firstKey]) {
      inputRefs.current[firstKey].focus();
      setFocusedClue({ 
        row: parseInt(firstKey.split("-")[0]), 
        col: parseInt(firstKey.split("-")[1]) 
      });
    }
  }, []);
  
  const handleChange = (row, col, e) => {
    debugger
    const value = e.target.value.toUpperCase();
    setAnswers(prev => ({ ...prev, [`${row}-${col}`]: value }));
  
    // Move focus to the next cell
    let nextRow = row, nextCol = col;
  
    if (direction === "across") {
      nextCol += 1;
    } else {
      nextRow += 1;
    }
    const nextKey = `${nextRow}-${nextCol}`;
    if (inputRefs.current[nextKey]) {
      inputRefs.current[nextKey].focus();
    }
  };
  

  return (
    <div className="container">
      <h2 className="my-3 text-start">The Mini Crossword Puzzle</h2>
      <div className="row g-5 d-flex justify-content-center">
        <div className="col-auto px-0 puzzel-section">
          <table>
            <tbody>
              {crosswordData.grid.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const key = `${rowIndex}-${colIndex}`;
                    const isFocused = focusedClue &&
                      ((direction === "across" && focusedClue.row === rowIndex) ||
                      (direction === "down" && focusedClue.col === colIndex));

                    return (
                      <td
                        key={colIndex}
                        style={{
                          width: 50, height: 50,
                          background: cell === null ? "black" : isFocused ? "#a4dbfb" : "white",
                          position: "relative"
                        }}
                        onClick={() => handleCellClick(rowIndex, colIndex)}
                      >
                        {crosswordData.numbers[key] && (
                          <span style={{
                            position: "absolute",
                            top: 2, left: 4,
                            fontSize: "10px", fontWeight: "bold"
                          }}>
                            {crosswordData.numbers[key]}
                          </span>
                        )}
                        {typeof cell === "string" && (
                          <input
                          type="text"
                          maxLength="1"
                          value={answers[key] || ""}
                          onChange={(e) => handleChange(rowIndex, colIndex, e)}
                          ref={el => inputRefs.current[key] = el}
                          inputMode="none" // Prevents mobile keyboard
                          className="text-center custom-"
                          style={{
                            width: "65px",
                            height: "55px",
                            fontSize: "1.5rem",
                            textTransform: "uppercase",
                            border: "none",
                            outline: "none",
                            textAlign: "center",
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

        <div className="col-12 px-0 clue-section-sm mt-4 ">
          <div className="d-flex justify-content-between clue-text-bg">
          <button className="transparent-btn" onClick={() => handleClueNavigation(-1)}><img src={arrowBack} alt="back" /></button>
             {allClues[currentClueIndex][1].clue}
          <button className="transparent-btn" onClick={() => handleClueNavigation(1)}><img src={arrowNext} alt="back" /></button>
          </div>
          <CustomKeyBoard onKeyPress={(key) => {
            if (key === "⌫") {
              setAnswers(prev => {
                const newAnswers = { ...prev };
                delete newAnswers[`${focusedClue.row}-${focusedClue.col}`];
                return newAnswers;
              });
            } else {
              setAnswers(prev => ({ ...prev, [`${focusedClue.row}-${focusedClue.col}`]: key }));
            }
          }} />
        </div>

<div className="col clue-section">
          <h4>Clues</h4>
          <h5>Across</h5>
          <ul>
            {Object.entries(crosswordData.clues.across).map(([num, clueData]) => (
              <li
                key={num}
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => handleClueClick(clueData.row, clueData.col, "across")}
              >
                <strong>{num}:</strong> {clueData.clue}
              </li>
            ))}
          </ul>
          <h5>Down</h5>
          <ul>
            {Object.entries(crosswordData.clues.down).map(([num, clueData]) => (
              <li
                key={num}
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => handleClueClick(clueData.row, clueData.col, "down")}
              >
                <strong>{num}:</strong> {clueData.clue}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Puzzel;
