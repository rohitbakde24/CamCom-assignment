import React, { useState, useRef, useEffect } from "react";
import "./Puzzel.css";
import CustomKeyBoard from "../Components/CustomKeyBoard";
import {
  arrowBack,
  arrowNext,
  MoreIcon,
  ResetIcon,
  SettingIcon,
  stopIcon,
} from "../assets/base64";
import Overlay from "../Components/Overlay";
import ConfirmationBox from "../Components/ConfirmationBox";
import CongratsPopup from "../Components/CongratsPopup";
import SettingsPopup from "../Components/SettingPopup";

const crosswordData = {
  grid: [
    ["V", "E", "S", "P", "A"],
    ["I", "X", "N", "A", "Y"],
    ["S", "T", "A", "T", "E"],
    ["A", "R", "I", "E", "S"],
    [null, "A", "L", "L", null],
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
      1: { clue: 'Scooter seen in "Roman Holiday"', row: 0, col: 0 },
      6: { clue: "No, in pig Latin", row: 1, col: 0 },
      7: {
        clue: '"The First____" (pharse on Delaware license Plates)',
        row: 2,
        col: 0,
      },
      8: { clue: "Zodiac ram", row: 3, col: 0 },
      9: { clue: "Each and every one", row: 4, col: 1 },
    },
    down: {
      1: { clue: "Big name in cards", row: 0, col: 0 },
      2: { clue: "When repeated, newsie's cry", row: 0, col: 1 },
      3: { clue: "It moves slow as shell", row: 0, col: 2 },
      4: { clue: 'Dev of 2024\'s "Monkey Man"', row: 0, col: 3 },
      5: { clue: "Affirmative votes", row: 0, col: 4 },
    },
  },
  solution: {
    "0-0": "V",
    "0-1": "E",
    "0-2": "S",
    "0-3": "P",
    "0-4": "A",
    "1-0": "I",
    "1-1": "X",
    "1-2": "N",
    "1-3": "A",
    "1-4": "Y",
    "2-0": "S",
    "2-1": "T",
    "2-2": "A",
    "2-3": "T",
    "2-4": "E",
    "3-0": "A",
    "3-1": "R",
    "3-2": "I",
    "3-3": "E",
    "3-4": "S",
    "4-1": "A",
    "4-2": "L",
    "4-3": "L",
  },
};

const Puzzel = () => {
  const inputRefs = useRef({});
  const storedSetting = JSON.parse(localStorage.getItem("puzzelSetting"));
  const [answers, setAnswers] = useState({});
  const [focusedClue, setFocusedClue] = useState({
    row: 0,
    col: 0,
  });
  const [direction, setDirection] = useState("across");
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedCol, setSelectedCol] = useState(0);
  const [time, setTime] = useState(0);
  const [finalTime, setFinalTime] = useState(null);

  const [isRunning, setIsRunning] = useState(true);
  const [autoCheck, setAutoCheck] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState({});
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showRevealConfirmation, setShowRevealConfirmation] = useState(false);
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [hasSeenCongrats, setHasSeenCongrats] = useState(false);
  const [isEndCellUpdated, setIsEndCellUpdated] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(
    storedSetting
      ? storedSetting
      : {
          startOfWord: { backspaceIntoPreviousWord: true },
          withinWord: { skipFilledSquares: true, skipPenciledSquares: true },
          endOfWord: { jumpBackToFirstBlank: true, jumpToNextClue: false },
          interactions: { playSoundOnSolve: true, showTimer: true },
        }
  );
  const handleSaveSettings = () => {
    setShowSettings(false);
  };

  const handleRestoreDefaults = () => {
    setSettings({
      startOfWord: { backspaceIntoPreviousWord: true },
      withinWord: { skipFilledSquares: true, skipPenciledSquares: true },
      endOfWord: { jumpBackToFirstBlank: true, jumpToNextClue: false },
      interactions: { playSoundOnSolve: true, showTimer: true },
    });
    setShowSettings(false);
    localStorage.removeItem("puzzelSetting");
  };

  // Puzzle solved check
  useEffect(() => {
    if (!crosswordData.solution || hasSeenCongrats) return;

    const requiredKeys = crosswordData.grid
      .flatMap((row, rowIndex) =>
        row.map((cell, colIndex) =>
          cell !== null ? `${rowIndex}-${colIndex}` : null
        )
      )
      .filter(Boolean);

    const isSolved = requiredKeys.every(
      (key) => answers[key] === crosswordData.solution[key]
    );

    if (isSolved) {
      setPuzzleSolved(true);
      setFinalTime(time);
      setIsRunning(false);
      setHasSeenCongrats(true);
      if (settings.interactions.playSoundOnSolve) {
        const audio = new Audio("/winning.mp3");
        audio.play();
      }
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
    setFocusedClue({
      row:0,
      col:0
    })
    setShowResetConfirmation(false);
    setRevealedAnswers({})
    setSelectedRow(0);
    setSelectedCol(0);
    setCurrentClueIndex(0);
    setDirection("across");
  };

  const resetTimer = () => setTime(0);

  useEffect(() => {
    let interval;
    if (
      isRunning &&
      !showSettings &&
      !puzzleSolved &&
      !showRevealConfirmation &&
      !hasSeenCongrats &&
      settings.interactions?.showTimer
    ) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [
    isRunning,
    showSettings,
    puzzleSolved,
    showRevealConfirmation,
    hasSeenCongrats,
    settings.interactions?.showTimer,
  ]);

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
    ...Object.entries(crosswordData.clues.across).map(([num, clueData]) => [
      num,
      clueData,
      "across",
    ]),
    ...Object.entries(crosswordData.clues.down).map(([num, clueData]) => [
      num,
      clueData,
      "down",
    ]),
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
    const newIndex = allClues.findIndex(
      ([, clueObj, clueDirection]) =>
        clueObj.row === row && clueObj.col === col && clueDirection === dir
    );
  
    if (newIndex !== -1) {
      setCurrentClueIndex(newIndex);
    }
  };

  const handleCellClick = (row, col) => {
    setSelectedRow(row);
    setSelectedCol(col);
    

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
            const newIndex = allClues.findIndex(
              ([clueNum, clueData, clueDir]) =>
                Number(clueNum) === clueNumber && clueDir === newDirection
            );
            if (newIndex !== -1) setCurrentClueIndex(newIndex);
          }

          return newDirection;
        });
      } else {
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
          const newIndex = allClues.findIndex(
            ([clueNum, clueData, clueDir]) =>
              Number(clueNum) === clueNumber && clueDir === direction
          );
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

    const [clueNumber, clueData, clueDir] = allClues[newIndex];

    setCurrentClueIndex(newIndex);
    setFocusedClue({ row: clueData.row, col: clueData.col });
    setDirection(clueDir);
  };
  useEffect(() => {
    const firstKey = Object.keys(crosswordData.numbers)[0];
    if (inputRefs.current[firstKey]) {
      inputRefs.current[firstKey].focus();
      setFocusedClue({
        row: parseInt(firstKey.split("-")[0]),
        col: parseInt(firstKey.split("-")[1]),
      });
    }
  }, []);

  const handleCheckSelectedRow = () => {
    if (selectedRow === null || selectedCol === null) return;

    const updatedWrongAnswers = { ...wrongAnswers };

    crosswordData.grid?.forEach((row, rowIndex) => {
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

  const handleClearSelectedRow = () => {
    if (focusedClue === null) return;
  
    const { row: focusedRow, col: focusedCol } = focusedClue;
    const updatedAnswers = { ...answers };
    const updatedWrongAnswers = { ...wrongAnswers };
  
    if (direction === "across") {
      let startCol = focusedCol;
      while (startCol >= 0 && crosswordData.grid[focusedRow][startCol] !== null) {
        startCol--;
      }
      startCol++;
  
      let currentCol = startCol;
      while (
        currentCol < crosswordData.grid[focusedRow].length &&
        crosswordData.grid[focusedRow][currentCol] !== null
      ) {
        const key = `${focusedRow}-${currentCol}`;
        if (!revealedAnswers[key]) {
          delete updatedAnswers[key];
          delete updatedWrongAnswers[key];
        }
        currentCol++;
      }
    } else if (direction === "down") {
      let startRow = focusedRow;
      while (startRow >= 0 && crosswordData.grid[startRow][focusedCol] !== null) {
        startRow--;
      }
      startRow++;
  
      let currentRow = startRow;
      while (
        currentRow < crosswordData.grid.length &&
        crosswordData.grid[currentRow][focusedCol] !== null
      ) {
        const key = `${currentRow}-${focusedCol}`;
        if (!revealedAnswers[key]) {
          delete updatedAnswers[key];
          delete updatedWrongAnswers[key];
        }
        currentRow++;
      }
    }
    setAnswers(updatedAnswers);
    setWrongAnswers(updatedWrongAnswers);
  };

  const handleClearPuzzle = () => {
    setAnswers((prev) => {
      const updatedAnswers = {};

      Object.keys(prev).forEach((key) => {
        if (revealedAnswers[key]) {
          updatedAnswers[key] = prev[key];
        }
      });

      return updatedAnswers;
    });

    setWrongAnswers({});
  };

  const handleRestart = () => {
    setAnswers({});
    setWrongAnswers({});
    resetTimer();
    setShowResetConfirmation(false);
    setFocusedClue({
      row: 0,
      col: 0,
    });
    setSelectedRow(0);
    setSelectedCol(0);
    setCurrentClueIndex(0);
    setFinalTime(null);
    setPuzzleSolved(false);
    setHasSeenCongrats(false);
    setDirection("across");
    setRevealedAnswers({})
  };

  const handleRevealWholePuzzle = () => {
    const updatedAnswers = {};
    const updatedRevealed = {};

    crosswordData.grid.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const key = `${rowIndex}-${colIndex}`;
        updatedAnswers[key] = letter; 
        updatedRevealed[key] = true;
      });
    });

    setAnswers(updatedAnswers);
    setWrongAnswers({});
    setRevealedAnswers(updatedRevealed);
    setShowRevealConfirmation(false);
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
          updatedAnswers[key] = letter;
          updatedRevealed[key] = true; // Mark as revealed
          delete updatedWrongAnswers[key]; // Remove wrong marking
        }
      });
    });

    setAnswers(updatedAnswers);
        setWrongAnswers(updatedWrongAnswers);
    setRevealedAnswers(updatedRevealed);
  };

  const autoCheckOnValueChange = (row, col, value) => {
    const correctValue = crosswordData.grid[row][col];
    setWrongAnswers((prev) => ({
      ...prev,
      [`${row}-${col}`]: value && value !== correctValue ? true : false,
    }));
  };

  const handleKeyInput = (key) => {
    if (!focusedClue) return;
  
    const { row, col } = focusedClue;
    const keyPosition = `${row}-${col}`;
    const upperKey = key.toUpperCase();
    const updatedWrongAnswers = { ...wrongAnswers };
  
    const isRevealed = revealedAnswers[keyPosition];
    const alreadyFilled = answers[keyPosition];
  
    if (/^[A-Z]$/.test(upperKey)) {
      if (isRevealed) {
        moveToNextCell(row, col);
        return;
      }
  
      if (autoCheck) {
        autoCheckOnValueChange(row, col, upperKey);
      }
      setAnswers((prev) => {
        const newAnswers = { ...prev, [keyPosition]: upperKey };
  
        if (crosswordData.grid[row][col] === upperKey) {
          delete updatedWrongAnswers[keyPosition];
          setWrongAnswers(updatedWrongAnswers);
        }
  
        moveToNextCell(row, col);
        return newAnswers;
      });
    } else if (key === "Backspace" || key === "⌫") {
      setAnswers((prev) => {
        moveToPreviousCell(row, col);
        return isRevealed ? prev : { ...prev, [keyPosition]: "" };
      });
    }
  };
  useEffect(() => {
    const handleKeyPress = (e) => handleKeyInput(e.key);
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [focusedClue, answers, direction]);

  const moveToNextCell = (row, col) => {
    if (direction === "across") {
      let isWordComplete = true;
      for (let c = 0; c < crosswordData.grid[row].length; c++) {
        if (crosswordData.grid[row][c] !== null && !answers[`${row}-${c}`]) {
          isWordComplete = false;
          break;
        }
      }
  
      if (isWordComplete) {
        setIsEndCellUpdated(true);
        return;
      }
  
      let nextCol = col + 1;
      if (
        nextCol >= crosswordData.grid[row].length ||
        crosswordData.grid[row][nextCol] === null
      ) {
        setIsEndCellUpdated(true);
        return;
      }
  
      if (settings.withinWord.skipFilledSquares) {
        while (
          nextCol < crosswordData.grid[row].length &&
          crosswordData.grid[row][nextCol] !== null &&
          answers[`${row}-${nextCol}`]
        ) {
          nextCol++;
        }
  
        if (
          nextCol >= crosswordData.grid[row].length ||
          crosswordData.grid[row][nextCol] === null
        ) {
          setIsEndCellUpdated(true);
          return;
        }
      }
  
      if (crosswordData.grid[row][nextCol] !== null) {
        setFocusedClue({ row: row, col: nextCol });
        return;
      }
    } else if (direction === "down") {
      let isWordComplete = true;
      for (let r = 0; r < crosswordData.grid.length; r++) {
        if (crosswordData.grid[r][col] !== null && !answers[`${r}-${col}`]) {
          isWordComplete = false;
          break;
        }
      }
  
      if (isWordComplete) {
        setIsEndCellUpdated(true);
        return;
      }
  
      let nextRow = row + 1;
      if (
        nextRow >= crosswordData.grid.length ||
        crosswordData.grid[nextRow][col] === null
      ) {
        setIsEndCellUpdated(true);
        return;
      }
  
      if (settings.withinWord.skipFilledSquares) {
        while (
          nextRow < crosswordData.grid.length &&
          crosswordData.grid[nextRow][col] !== null &&
          answers[`${nextRow}-${col}`]
        ) {
          nextRow++;
        }
  
        if (
          nextRow >= crosswordData.grid.length ||
          crosswordData.grid[nextRow][col] === null
        ) {
          setIsEndCellUpdated(true);
          return;
        }
      }
  
      if (crosswordData.grid[nextRow][col] !== null) {
        setFocusedClue({ row: nextRow, col: col });
        return;
      }
    }
  };
  useEffect(() => {
    if (isEndCellUpdated) {
      handleEndOfWord();
      setIsEndCellUpdated(false);
    }
  }, [isEndCellUpdated]);
  
  const handleEndOfWord = () => {
    const { row, col } = focusedClue;
    if (direction === "across") {
      let hasBlanks = false;
      let isWordComplete = true;

      for (let c = 0; c < crosswordData.grid[row].length; c++) {
        if (crosswordData.grid[row][c] !== null) {
          if (!answers[`${row}-${c}`]) {
            hasBlanks = true;
            isWordComplete = false;
          }
        }
      }
      if (hasBlanks && settings.endOfWord.jumpBackToFirstBlank) {
        for (let c = 0; c < crosswordData.grid[row].length; c++) {
          if (crosswordData.grid[row][c] !== null && !answers[`${row}-${c}`]) {
            setFocusedClue({ row: row, col: c });
            return;
          }
        }
      }

      if (isWordComplete && settings.endOfWord.jumpToNextClue) {
        handleClueNavigation(1);
        return;
      } else if (
        isWordComplete === false &&
        settings.endOfWord.jumpToNextClue
      ) {
        for (let c = 0; c < crosswordData.grid[row].length; c++) {
          if (crosswordData.grid[row][c] !== null && !answers[`${row}-${c}`]) {
            setFocusedClue({ row: row, col: c });
            return;
          }
        }
      }else{
        let nextCol = col + 1;
        if (nextCol < crosswordData.grid[row].length && crosswordData.grid[row][nextCol] !== null) {
          setFocusedClue({ row: row, col: nextCol });
        } else {
          // Find the first cell of the current word
          let firstCol = 0;
          while (firstCol < crosswordData.grid[row].length && crosswordData.grid[row][firstCol] === null) {
            firstCol++;
          }
          setFocusedClue({ row: row, col: firstCol });
        }
      }
    } else if (direction === "down") {
      let hasBlanks = false;
      let isWordComplete = true;

      for (let r = 0; r < crosswordData.grid.length; r++) {
        if (crosswordData.grid[r][col] !== null) {
          if (!answers[`${r}-${col}`]) {
            hasBlanks = true;
            isWordComplete = false;
          }
        }
      }

      if (hasBlanks && settings.endOfWord.jumpBackToFirstBlank) {
        for (let r = 0; r < crosswordData.grid.length; r++) {
          if (crosswordData.grid[r][col] !== null && !answers[`${r}-${col}`]) {
            setFocusedClue({ row: r, col: col });
            return;
          }
        }
      }

      if (isWordComplete && settings.endOfWord.jumpToNextClue) {
        handleClueNavigation(1);
        return;
      } else if (
        isWordComplete === false &&
        settings.endOfWord.jumpToNextClue
      ) {
        for (let r = 0; r < crosswordData.grid.length; r++) {
          if (crosswordData.grid[r][col] !== null && !answers[`${r}-${col}`]) {
            setFocusedClue({ row: r, col: col });
            return;
          }
        }
      }else{
        // Move to the next cell or the first cell of the word.
      let nextRow = row + 1;
      if (nextRow < crosswordData.grid.length && crosswordData.grid[nextRow][col] !== null) {
        setFocusedClue({ row: nextRow, col: col });
      } else {
        // Find the first cell of the current word
        let firstRow = 0;
        while (firstRow < crosswordData.grid.length && crosswordData.grid[firstRow][col] === null) {
          firstRow++;
        }
        setFocusedClue({ row: firstRow, col: col });
      }
      }
    }
  };

  const moveToPreviousCell = (row, col) => {
    let prevRow = row;
    let prevCol = col;

    if (direction === "across") {
      prevCol--;
    } else if (direction === "down") {
      prevRow--;
    }

    while (true) {
      if (prevRow < 0 || prevCol < 0) {
        if (direction === "across") {
          if (settings.startOfWord.backspaceIntoPreviousWord && row > 0) {
            prevRow--;
            prevCol = crosswordData.grid[prevRow]?.length - 1 || 0;
          } else {
            break;
          }
        } else if (direction === "down") {
          if (settings.startOfWord.backspaceIntoPreviousWord && col > 0) {
            prevCol--;
            prevRow = crosswordData.grid[prevCol]?.length - 1 || 0;
          } else {
            break;
          }
        }
      }

      if (
        prevRow >= 0 &&
        prevCol >= 0 &&
        crosswordData.grid[prevRow][prevCol] !== null
      ) {
        setFocusedClue({ row: prevRow, col: prevCol });
        break;
      }

      if (direction === "across") {
        prevCol--;
      } else if (direction === "down") {
        prevRow--;
      }
    }
  };

  const onResetButtonClick = () => {
    setShowResetConfirmation(!showResetConfirmation);
    localStorage.removeItem("puzzelSetting");
  };
  const onRevealButtonClick = () => {
    setShowRevealConfirmation(!showRevealConfirmation);
  };
  const BackToPuzzel = () => {
    setPuzzleSolved(false);
  };

  return (
    <>
      {!isRunning && !hasSeenCongrats && (
        <Overlay setIsRunning={setIsRunning} />
      )}
      {showResetConfirmation && (
        <ConfirmationBox
          handleCancel={onResetButtonClick}
          handleSubmission={handleRestart}
          title={"Are you sure you want to start over?"}
          btnText={"Start Over"}
        />
      )}
      {showRevealConfirmation && (
        <ConfirmationBox
          handleCancel={onRevealButtonClick}
          handleSubmission={handleRevealWholePuzzle}
          title={"Are you sure you want to reveal the puzzel?"}
          btnText={"Reveal"}
        />
      )}
      {puzzleSolved && (
        <CongratsPopup
          handleCancel={BackToPuzzel}
          time={formatTime(finalTime)}
        />
      )}
      {showSettings && (
        <SettingsPopup
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          onRestoreDefaults={handleRestoreDefaults}
          settings={settings}
          setSettings={setSettings}
        />
      )}
      <div
        className={`${
          ((!isRunning && !hasSeenCongrats) ||
            showSettings ||
            showResetConfirmation ||
            showRevealConfirmation) &&
          "blur-content"
        }`}
      >
        <nav className="d-flex py-2 px-3 mb-lg-5 mb-3 justify-content-between border-bottom">
          <div className="w-auto">
            {settings?.interactions?.showTimer && (
              <>
                <button
                  className="bg-transparent p-0 me-1"
                  onClick={() => setIsRunning(!isRunning)}
                >
                  <img src={stopIcon} alt="stop" width={18} className="stop-icon-pad"/>
                </button>
                <span className="fw-bold mt-1">{formatTime(time)}</span>
              </>
            )}
          </div>

          <div className="w-auto title">
            <h5 className="text-start p-0 m-0">The Mini Crossword Puzzle</h5>
          </div>
          <div className="d-flex">
            {hasSeenCongrats && (
              <div className="me-2 pe-1">
                <button
                  className={`btn btn-transparant p-1 pt-0 border-0`}
                  type="button"
                  onClick={resetGame}
                >
                  <img src={ResetIcon} alt="Reset" width={24} />
                </button>
              </div>
            )}
            <div className="dropdown">
              <button
                className={`btn btn-transparant p-1 pt-0 border-0`}
                type="button"
                id={"dropdownMenuButton"}
                data-bs-toggle={"dropdown"}
                aria-expanded="false"
              >
                <img src={MoreIcon} alt="More" width={24} />
              </button>
              <ul
                className="dropdown-menu py-1"
                aria-labelledby="dropdownMenuButton"
              >
                <li>
                  <button
                    className="dropdown-item "
                    onClick={() => setAutoCheck(!autoCheck)}
                  >
                    {autoCheck && "✅"} Autocheck
                  </button>
                </li>
                <li>
                  <button
                    className="border-top dropdown-item"
                    onClick={handleCheckSelectedRow}
                  >
                    Check Word
                  </button>
                </li>
                <li>
                  <button
                    className="border-top dropdown-item"
                    onClick={handleCheckPuzzle}
                  >
                    Check Puzzel
                  </button>
                </li>
                <li>
                  <button
                    className="border-top dropdown-item"
                    onClick={handleRevealSelectedRow}
                  >
                    Reveal Word
                  </button>
                </li>
                <li>
                  <button
                    className="border-top dropdown-item"
                    onClick={onRevealButtonClick}
                  >
                    Reveal Puzzel
                  </button>
                </li>
                <li>
                  <button
                    className="border-top dropdown-item"
                    onClick={handleClearSelectedRow}
                  >
                    Clear Word
                  </button>
                </li>
                <li>
                  <button
                    className="border-top dropdown-item"
                    onClick={handleClearPuzzle}
                  >
                    Clear Puzzel
                  </button>
                </li>
                <li>
                  <button
                    className="border-top dropdown-item"
                    onClick={onResetButtonClick}
                  >
                    Reset Puzzel
                  </button>
                </li>
              </ul>
            </div>
            <div className="ms-2 ps-1">
              <button className="btn btn-transparant p-1 pt-0 border-0">
                <img
                  src={SettingIcon}
                  alt="setting"
                  width={24}
                  onClick={() => setShowSettings(true)}
                />
              </button>
            </div>
          </div>
        </nav>
        <div className="d-flex justify-content-center">
          <div className={`container puzzel-container`}>
            <div className="row  d-flex justify-content-center">
              <div className="col-auto px-0 ">
                <div className="puzzel-section overflow-auto">
                  <table>
                    <tbody>
                      {crosswordData.grid.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, colIndex) => {
                            const key = `${rowIndex}-${colIndex}`;

                            return (
                              <td
                                key={colIndex}
                                className="td-size"
                                style={{
                                  
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
                                    readOnly 
                                    className={`text-center boxes  ${
                                      wrongAnswers[key] && answers[key]
                                        ? "wrong-char"
                                        : ""
                                    }`}
                                    style={{
                                      color: revealedAnswers[key]
                                        ? "#0D92F4"
                                        : "black", }}
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
                  {Object.entries(crosswordData.clues?.across).map(
                    ([num, clueData]) => {
                      const isSelected =
                        focusedClue?.row === clueData.row &&
                        focusedClue?.col === clueData.col &&
                        direction === "across";

                      return (
                        <li
                          key={num}
                          style={{
                            listStyle: "none",
                            padding: "2px 5px",
                            }}
                          onClick={() =>
                            handleClueClick(
                              clueData.row,
                              clueData.col,
                              "across"
                            )
                          }
                        >
                          <span style={{
                             padding: "2px 5px",
                             borderRadius: "4px",
                             cursor: "pointer",
                             background: clueData.clue === allClues[currentClueIndex][1].clue ? "#a4dbfb":"none"}}>
                          <strong>{num}:</strong> {clueData.clue}
                          </span>
                        </li>
                      );
                    }
                  )}
                </ul>

                <h6 className="ps-3">Down</h6>
                <ul>
                  {Object.entries(crosswordData.clues?.down).map(
                    ([num, clueData]) => {
                      const isSelected =
                        focusedClue?.row === clueData.row &&
                        focusedClue?.col === clueData.col &&
                        direction === "down";

                      return (
                        <li
                          key={num}
                          style={{
                            listStyle: "none",
                            padding: "2px 5px",
                          }}
                          onClick={() =>
                            handleClueClick(clueData.row, clueData.col, "down")
                          }
                        >
                         <span style={{
                             padding: "2px 5px",
                             borderRadius: "4px",
                             cursor: "pointer",
                             background: clueData.clue === allClues[currentClueIndex][1].clue ? "#a4dbfb":"none"}}>
                          <strong>{num}:</strong> {clueData.clue}
                          </span>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Puzzel;
