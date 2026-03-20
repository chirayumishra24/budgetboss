import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sounds } from '../utils/sounds';
import styles from './Quiz.module.css';

const QUIZ_BANKS = {
  1: [
    { q: 'What is the 50/30/20 rule?', options: ['50% Needs, 30% Wants, 20% Savings', '50% Savings, 30% Needs, 20% Wants', '50% Wants, 30% Savings, 20% Needs'], answer: 0 },
    { q: 'What happens when you overspend on wants?', options: ['Credit score improves', 'Credit score drops', 'Nothing happens'], answer: 1 },
    { q: 'What is investable surplus?', options: ['Total income', 'Income minus all expenses', 'Income minus needs and wants'], answer: 2 },
  ],
  2: [
    { q: 'What does OMS stand for?', options: ['Order Management System', 'Online Market Service', 'Open Money Standard'], answer: 0 },
    { q: 'What is T+1 settlement?', options: ['Trade settles same day', 'Trade settles next business day', 'Trade settles in one week'], answer: 1 },
    { q: 'Where are your shares stored in India?', options: ['In your bank account', 'CDSL / NSDL Demat account', 'On the stock exchange'], answer: 1 },
  ],
  3: [
    { q: 'What is compound growth?', options: ['Linear increase over time', 'Earning returns on returns', 'Fixed interest rate'], answer: 1 },
    { q: 'What is a dividend?', options: ['A fee you pay to the exchange', 'A share of company profits paid to shareholders', 'The price of one share'], answer: 1 },
    { q: 'Which grows more over 10 years: 5% or 22% CAGR?', options: ['5% CAGR', '22% CAGR', 'Both grow equally'], answer: 1 },
  ],
};

export const Quiz = ({ level, onPass, onFail }) => {
  const questions = QUIZ_BANKS[level] || QUIZ_BANKS[1];
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    const correct = index === questions[currentQ].answer;
    if (correct) {
      sounds.success();
      setScore(s => s + 1);
    } else {
      sounds.alert();
    }
    setShowResult(true);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizDone(true);
        const finalScore = correct ? score + 1 : score;
        if (finalScore >= 2) {
          onPass(finalScore);
        } else {
          onFail(finalScore);
        }
      }
    }, 1500);
  };

  if (quizDone) {
    const passed = score >= 2;
    return (
      <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={styles.resultCard}>
          <h2>{passed ? 'Knowledge Check Passed' : 'Try Again'}</h2>
          <h1 className={passed ? 'success-text' : 'danger-text'}>{score}/{questions.length}</h1>
          <p>{passed ? 'Great job! You understand the fundamentals.' : 'You need at least 2 correct answers to proceed.'}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Knowledge Check — Level {level}</h3>
        <span className={styles.progress}>{currentQ + 1} / {questions.length}</span>
      </div>

      <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className={styles.questionCard}>
        <h2 className={styles.question}>{questions[currentQ].q}</h2>

        <div className={styles.options}>
          {questions[currentQ].options.map((opt, i) => {
            let optClass = styles.option;
            if (showResult) {
              if (i === questions[currentQ].answer) optClass += ` ${styles.correct}`;
              else if (i === selectedAnswer) optClass += ` ${styles.wrong}`;
            }
            return (
              <button
                key={i}
                className={optClass}
                onClick={() => !showResult && handleAnswer(i)}
                disabled={showResult}
              >
                <span className={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
