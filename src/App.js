import { useState } from "react";

// Square组件，用于表示棋盘上的一个格子
// 接收格子的值（value）和点击格子时的回调函数（onSquareClick）作为props
function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

// Board组件，用于渲染整个棋盘
function Board({ xIsNext, squares, onPlay }) {
  // 处理格子点击事件的函数
  // 如果格子已被占用或者已经有获胜者了，则不做处理直接返回
  // 否则根据当前轮到的玩家（xIsNext）在对应位置放置相应符号（"X"或"O"），并调用onPlay将新的棋盘状态传递出去
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  // 创建一个函数用于渲染单个格子，将点击格子的事件绑定到handleClick函数上
  const renderSquare = (i) => (
    <Square value={squares[i]} onSquareClick={() => handleClick(i)} />
  );

  // 用于渲染整个棋盘的函数，通过两层循环来创建15 * 15的棋盘布局
  const renderBoard = () => {
    let board = [];

    for (let i = 0; i < 15; i++) {
      let row = [];
      for (let j = 0; j < 15; j++) {
        row.push(renderSquare(i * 15 + j));
      }
      board.push(
        <div key={i} className="board-row">
          {row}
        </div>
      );
    }

    return board;
  };

  // 计算当前棋盘状态下是否有获胜者
  const winner = calculateWinner(squares);
  let status;
  // 根据是否有获胜者来设置游戏状态信息
  if (winner) {
    status = "Winner: " + winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  return (
    <>
      <div className="status">{status}</div>
      {renderBoard()}
    </>
  );
}

// Game组件，作为游戏的主组件，管理游戏的整体状态和交互逻辑
export default function Game() {
  // 使用useState来管理游戏的历史记录，初始化为一个长度为225且元素都为null的数组
  const [history, setHistory] = useState([Array(225).fill(null)]);
  // 使用useState来记录当前所处的步数，初始化为0
  const [currentMove, setCurrentMove] = useState(0);
  // 根据当前步数判断当前轮到的玩家（偶数步为"X"，奇数步为"O"）
  const xIsNext = currentMove % 2 === 0;
  // 获取当前步数对应的棋盘状态
  const currentSquares = history[currentMove];

  // 处理游戏进行一步后的逻辑，更新游戏历史记录和当前步数
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // 用于跳转到指定步数的函数，更新当前步数
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // 生成历史步数的列表，每个元素都是一个可点击的按钮，点击可跳转到对应步数
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = "Go to move #" + move;
    } else {
      description = "Go to game start";
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// 计算给定棋盘状态下是否有玩家获胜的函数
function calculateWinner(squares) {
  const size = 15; // 棋盘大小为15 * 15
  const winCondition = 5; // 五子连线为胜利条件

  // 用于存储所有可能形成五子连线的索引组合，先初始化空数组
  const lines = [];

  // 生成行方向的五子连线索引组合
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size - winCondition + 1; col++) {
      const line = [];
      for (let i = 0; i < winCondition; i++) {
        line.push(row * size + col + i);
      }
      lines.push(line);
    }
  }

  // 生成列方向的五子连线索引组合
  for (let col = 0; col < size; col++) {
    for (let row = 0; row < size - winCondition + 1; row++) {
      const line = [];
      for (let i = 0; i < winCondition; i++) {
        line.push((row + i) * size + col);
      }
      lines.push(line);
    }
  }

  // 生成斜向下方向（从左上到右下）的五子连线索引组合
  for (let row = 0; row < size - winCondition + 1; row++) {
    for (let col = 0; col < size - winCondition + 1; col++) {
      const line = [];
      for (let i = 0; i < winCondition; i++) {
        line.push((row + i) * size + col + i);
      }
      lines.push(line);
    }
  }

  // 生成斜向上方向（从右上到左下）的五子连线索引组合
  for (let row = winCondition - 1; row < size; row++) {
    for (let col = 0; col < size - winCondition + 1; col++) {
      const line = [];
      for (let i = 0; i < winCondition; i++) {
        line.push((row - i) * size + col + i);
      }
      lines.push(line);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d, e] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c] &&
      squares[a] === squares[d] &&
      squares[a] === squares[e]
    ) {
      return squares[a];
    }
  }
  return null;
}
