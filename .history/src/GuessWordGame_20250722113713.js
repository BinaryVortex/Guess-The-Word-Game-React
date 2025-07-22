import React, { useState, useEffect, useCallback } from "react";
import "./GuessWordGame.scss";

// --- Word list (copy from your HTML, but can be shortened for demo) ---
const wordList = [
  { word: "apple", hint: "A common fruit" },
  { word: "grape", hint: "A small round fruit" },
  { word: "lemon", hint: "A sour yellow fruit" },
  { word: "peach", hint: "A sweet, juicy fruit" },
  { word: "plum", hint: "A juicy purple fruit" },
  { word: "mango", hint: "A tropical fruit" },
  { word: "carrot", hint: "An orange root vegetable" },
  { word: "pepper", hint: "A spicy vegetable" },
  { word: "onion", hint: "A pungent vegetable" },
  { word: "banana", hint: "A yellow fruit monkeys love" },
  { word: "berry", hint: "A small, juicy fruit" },
  { word: "melon", hint: "A sweet, juicy fruit" }
  // (add the rest from your list as needed!)
];

const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

function getMaxGuesses(word) {
  return word.length >= 5 ? 8 : 6;
}

const getRandomWord = () => wordList[Math.floor(Math.random() * wordList.length)];

export default function GuessWordGame() {
  // Game state
  const [wordObj, setWordObj] = useState(getRandomWord());
  const [revealed, setRevealed] = useState([]); // array of letters or ""
  const [correctLetters, setCorrectLetters] = useState([]);
  const [wrongLetters, setWrongLetters] = useState([]);
  const [maxGuesses, setMaxGuesses] = useState(getMaxGuesses(wordObj.word));
  const [guessesLeft, setGuessesLeft] = useState(getMaxGuesses(wordObj.word));
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState("playing"); // playing, won, lost

  // Start new game
  const startNewGame = useCallback(() => {
    const next = getRandomWord();
    setWordObj(next);
    setRevealed(Array(next.word.length).fill(""));
    setCorrectLetters([]);
    setWrongLetters([]);
    setMaxGuesses(getMaxGuesses(next.word));
    setGuessesLeft(getMaxGuesses(next.word));
    setShowHint(false);
    setGameState("playing");
  }, []);

  // Reveal correct letters
  useEffect(() => {
    setRevealed(wordObj.word.split("").map(l => correctLetters.includes(l) ? l : ""));
  }, [correctLetters, wordObj.word]);

  // Win/Lose check
  useEffect(() => {
    if (gameState === "playing") {
      if (revealed.join("") === wordObj.word) {
        setTimeout(() => setGameState("won"), 300);
      } else if (guessesLeft < 1) {
        setTimeout(() => setGameState("lost"), 300);
      }
    }
  }, [revealed, wordObj.word, guessesLeft, gameState]);

  // Letter guess handler
  function handleGuess(letter) {
    if (gameState !== "playing") return;
    if (
      correctLetters.includes(letter) ||
      wrongLetters.includes(letter)
    )
      return;
    if (wordObj.word.includes(letter)) {
      setCorrectLetters((prev) => [...prev, letter]);
    } else {
      setWrongLetters((prev) => [...prev, letter]);
      setGuessesLeft((g) => g - 1);
    }
  }

  // Keyboard event for physical keys
  useEffect(() => {
    function onKey(e) {
      if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
        handleGuess(e.key.toLowerCase());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line
  }, [correctLetters, wrongLetters, gameState, wordObj]);

  // Reveal all on lose
  const getLetterDisplay = (idx) => {
    if (gameState === "lost") return wordObj.word[idx];
    return revealed[idx];
  };

  // Game over message
  let statusMsg = "";
  if (gameState === "won") statusMsg = `🎉 Congrats! You guessed "${wordObj.word.toUpperCase()}"`;
  else if (gameState === "lost") statusMsg = `Game Over! The word was "${wordObj.word.toUpperCase()}"`;

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="guess-bg-overlay" />
      <div className="guess-container">
        <h1 className="guess-title">Guess Word Game</h1>
        <div className="inputs word">
          {wordObj.word.split("").map((l, idx) => (
            <div className="letter-box" key={idx}>
              {getLetterDisplay(idx)}
            </div>
          ))}
        </div>
        <div className="stats">
          <p>
            Guesses Left: <span className="guess">{guessesLeft}</span>
          </p>
          <p>
            Mistakes: <span className="wrong">{wrongLetters.length}</span>
          </p>
        </div>
        <div>
          <button className="guess-btn" onClick={startNewGame}>
            {gameState === "playing" ? "Reset Game" : "Play Again"}
          </button>
          <button
            className="guess-btn"
            onClick={() => setShowHint((h) => !h)}
            disabled={showHint}
          >
            Show Hint
          </button>
        </div>
        <div
          className={`hint${showHint ? " visible" : ""}`}
          aria-live="polite"
        >
          {showHint ? wordObj.hint : "Hint will appear here"}
        </div>
        <div className="keyboard">
          {alphabet.map((letter) => (
            <button
              key={letter}
              className="keyboard-btn"
              onClick={() => handleGuess(letter)}
              disabled={
                correctLetters.includes(letter) ||
                wrongLetters.includes(letter) ||
                gameState !== "playing"
              }
            >
              {letter}
            </button>
          ))}
        </div>
        {statusMsg && (
          <div
            style={{
              marginTop: 24,
              fontSize: 20,
              fontWeight: 600,
              color: gameState === "won" ? "#19ac3e" : "#b52323",
            }}
            aria-live="polite"
          >
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}