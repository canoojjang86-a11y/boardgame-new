/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Maximize,
  Gamepad2,
  Trophy,
  RefreshCw,
  Home,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sword,
  Shield,
  RotateCcw,
  Flag,
  Search,
  ChevronUp,
  ChevronDown,
  Circle,
  Activity,
  Share2
} from "lucide-react";

// --- Constants ---
const T_COLS = 10;
const T_ROWS = 20;
const T_SIZE = 25;
const T_COLORS = [
  null,
  '#FF9CEE', // I - 핑크
  '#B28DFF', // J - 보라
  '#6EB5FF', // L - 파랑
  '#85E3FF', // O - 하늘
  '#FFF5BA', // S - 노랑
  '#FFB5E8', // T - 연분홍
  '#AFF8DB'  // Z - 민트
];
const T_SHAPES = [
  [],
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
  [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
  [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
  [[4, 4], [4, 4]], // O
  [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
  [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
  [[7, 7, 0], [0, 7, 7], [0, 0, 0]]  // Z
];

const FREQUENT_NUMBERS = [1, 12, 13, 17, 27, 34, 39, 43, 45, 18, 14, 10, 33, 20, 24, 26, 37, 40];

// --- Janggi Constants ---
type JanggiSide = 'CHO' | 'HAN';
type JanggiPieceType = 'KUNG' | 'CHA' | 'PO' | 'MA' | 'SANG' | 'SA' | 'JOL' | 'BYUNG';

interface JanggiPiece {
  type: JanggiPieceType;
  side: JanggiSide;
}

const J_ROWS = 10;
const J_COLS = 9;

const PIECE_SCORES: Record<JanggiPieceType, number> = {
  'CHA': 13,
  'PO': 7,
  'MA': 5,
  'SANG': 3,
  'SA': 3,
  'JOL': 2,
  'BYUNG': 2,
  'KUNG': 1000
};

const INITIAL_BOARD: (JanggiPiece | null)[][] = [
  [
    { type: 'CHA', side: 'HAN' }, { type: 'MA', side: 'HAN' }, { type: 'SANG', side: 'HAN' },
    { type: 'SA', side: 'HAN' }, null, { type: 'SA', side: 'HAN' },
    { type: 'SANG', side: 'HAN' }, { type: 'MA', side: 'HAN' }, { type: 'CHA', side: 'HAN' }
  ],
  [null, null, null, null, { type: 'KUNG', side: 'HAN' }, null, null, null, null],
  [null, { type: 'PO', side: 'HAN' }, null, null, null, null, null, { type: 'PO', side: 'HAN' }, null],
  [
    { type: 'BYUNG', side: 'HAN' }, null, { type: 'BYUNG', side: 'HAN' },
    null, { type: 'BYUNG', side: 'HAN' }, null,
    { type: 'BYUNG', side: 'HAN' }, null, { type: 'BYUNG', side: 'HAN' }
  ],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [
    { type: 'JOL', side: 'CHO' }, null, { type: 'JOL', side: 'CHO' },
    null, { type: 'JOL', side: 'CHO' }, null,
    { type: 'JOL', side: 'CHO' }, null, { type: 'JOL', side: 'CHO' }
  ],
  [null, { type: 'PO', side: 'CHO' }, null, null, null, null, null, { type: 'PO', side: 'CHO' }, null],
  [null, null, null, null, { type: 'KUNG', side: 'CHO' }, null, null, null, null],
  [
    { type: 'CHA', side: 'CHO' }, { type: 'MA', side: 'CHO' }, { type: 'SANG', side: 'CHO' },
    { type: 'SA', side: 'CHO' }, null, { type: 'SA', side: 'CHO' },
    { type: 'SANG', side: 'CHO' }, { type: 'MA', side: 'CHO' }, { type: 'CHA', side: 'CHO' }
  ]
];

// --- Chess Constants ---
type ChessSide = 'WHITE' | 'BLACK';
type ChessPieceType = 'PAWN' | 'ROOK' | 'KNIGHT' | 'BISHOP' | 'QUEEN' | 'KING';

interface ChessPiece {
  type: ChessPieceType;
  side: ChessSide;
  hasMoved?: boolean;
}

const C_ROWS = 8;
const C_COLS = 8;

const INITIAL_CHESS_BOARD: (ChessPiece | null)[][] = [
  [
    { type: 'ROOK', side: 'BLACK' }, { type: 'KNIGHT', side: 'BLACK' }, { type: 'BISHOP', side: 'BLACK' }, { type: 'QUEEN', side: 'BLACK' },
    { type: 'KING', side: 'BLACK' }, { type: 'BISHOP', side: 'BLACK' }, { type: 'KNIGHT', side: 'BLACK' }, { type: 'ROOK', side: 'BLACK' }
  ],
  [
    { type: 'PAWN', side: 'BLACK' }, { type: 'PAWN', side: 'BLACK' }, { type: 'PAWN', side: 'BLACK' }, { type: 'PAWN', side: 'BLACK' },
    { type: 'PAWN', side: 'BLACK' }, { type: 'PAWN', side: 'BLACK' }, { type: 'PAWN', side: 'BLACK' }, { type: 'PAWN', side: 'BLACK' }
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    { type: 'PAWN', side: 'WHITE' }, { type: 'PAWN', side: 'WHITE' }, { type: 'PAWN', side: 'WHITE' }, { type: 'PAWN', side: 'WHITE' },
    { type: 'PAWN', side: 'WHITE' }, { type: 'PAWN', side: 'WHITE' }, { type: 'PAWN', side: 'WHITE' }, { type: 'PAWN', side: 'WHITE' }
  ],
  [
    { type: 'ROOK', side: 'WHITE' }, { type: 'KNIGHT', side: 'WHITE' }, { type: 'BISHOP', side: 'WHITE' }, { type: 'QUEEN', side: 'WHITE' },
    { type: 'KING', side: 'WHITE' }, { type: 'BISHOP', side: 'WHITE' }, { type: 'KNIGHT', side: 'WHITE' }, { type: 'ROOK', side: 'WHITE' }
  ]
];

const CHESS_PIECE_SCORES: Record<ChessPieceType, number> = {
  'PAWN': 10,
  'KNIGHT': 30,
  'BISHOP': 30,
  'ROOK': 50,
  'QUEEN': 90,
  'KING': 900
};

// --- Othello Constants ---
const O_SIZE = 8;
type OthelloStone = 'BLACK' | 'WHITE';
type OthelloCell = number; // 0: empty, 1: black, 2: white

type GameType = 'MAIN' | '테트리스' | '로또' | '오목' | '오델로' | '장기' | '체스';
type Difficulty = '하' | '중' | '상';
type StoneColor = 'BLACK' | 'WHITE';
type JanggiSetup = 'MA_SANG' | 'SANG_MA';

// --- Security & Utils ---
const ALLOWED_DOMAINS = ['cute-boardgame.web.app', 'localhost', '127.0.0.1'];
const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const lockOrientation = async (type: 'landscape' | 'portrait') => {
  if (isMobile() && screen.orientation && screen.orientation.lock) {
    try {
      await screen.orientation.lock(type);
    } catch (err) {
      console.warn('Orientation lock failed:', err);
    }
  }
};

export default function App() {
  const [view, setView] = useState<GameType>('MAIN');
  const [lottoSets, setLottoSets] = useState<number[][]>([]);
  const [isLottoLoading, setIsLottoLoading] = useState(false);
  const [isDomainValid, setIsDomainValid] = useState(true);

  // --- Navigation & Share Logic ---
  const changeView = (newView: GameType) => {
    setView(newView);
    window.history.pushState({ view: newView }, '', '');
  };

  useEffect(() => {
    // 초기 상태 설정
    window.history.replaceState({ view: 'MAIN' }, '', '');

    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setView(e.state.view);
      } else {
        setView('MAIN');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: '🐰 큐트 게임 월드 🐹',
      text: '귀여운 보드게임들과 다양한 게임들을 즐겨보세요!',
      url: 'https://cute-boardgame.web.app'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.warn('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('게임 주소가 복사되었습니다! 지인들에게 공유해 보세요.');
      } catch (err) {
        console.error('Clipboard failed:', err);
      }
    }
  };

  // Domain Check
  useEffect(() => {
    const hostname = window.location.hostname;
    if (!ALLOWED_DOMAINS.some(domain => hostname.includes(domain))) {
      setIsDomainValid(false);
    }
  }, []);

  // Omok States
  const [omokDifficulty, setOmokDifficulty] = useState<Difficulty>('중');
  const [playerColor, setPlayerColor] = useState<StoneColor>('BLACK');
  const [omokBoard, setOmokBoard] = useState<number[][]>(Array.from({ length: 15 }, () => Array(15).fill(0)));
  const [omokTurn, setOmokTurn] = useState<StoneColor>('BLACK');
  const [omokWinner, setOmokWinner] = useState<StoneColor | 'DRAW' | null>(null);
  const [showOmokSetup, setShowOmokSetup] = useState(false);
  const [isOmokAiThinking, setIsOmokAiThinking] = useState(false);

  // Tetris States
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // Janggi States
  const [janggiBoard, setJanggiBoard] = useState<(JanggiPiece | null)[][]>(INITIAL_BOARD);
  const [janggiTurn, setJanggiTurn] = useState<JanggiSide>('CHO');
  const [janggiWinner, setJanggiWinner] = useState<JanggiSide | null>(null);
  const [selectedPos, setSelectedPos] = useState<{ r: number, c: number } | null>(null);
  const [validMoves, setValidMoves] = useState<{ r: number, c: number }[]>([]);
  const [capturedHan, setCapturedHan] = useState<JanggiPieceType[]>([]);
  const [capturedCho, setCapturedCho] = useState<JanggiPieceType[]>([]);
  const [janggiDifficulty, setJanggiDifficulty] = useState<Difficulty>('상');
  const [playerSide, setPlayerSide] = useState<JanggiSide>('CHO');
  const [janggiSetup, setJanggiSetup] = useState<JanggiSetup>('MA_SANG');
  const [showJanggiSetup, setShowJanggiSetup] = useState(false);
  const [janggiStatus, setJanggiStatus] = useState<'NORMAL' | 'JANGGUN' | 'MEONGGUN'>('NORMAL');
  const [isJanggiAiThinking, setIsJanggiAiThinking] = useState(false);
  const [janggiHistory, setJanggiHistory] = useState<{
    board: (JanggiPiece | null)[][];
    turn: JanggiSide;
    capturedHan: JanggiPieceType[];
    capturedCho: JanggiPieceType[];
  }[]>([]);

  // Chess States
  const [chessBoard, setChessBoard] = useState<(ChessPiece | null)[][]>(INITIAL_CHESS_BOARD);
  const [chessTurn, setChessTurn] = useState<ChessSide>('WHITE');
  const [chessWinner, setChessWinner] = useState<ChessSide | 'DRAW' | null>(null);
  const [chessSelectedPos, setChessSelectedPos] = useState<{ r: number, c: number } | null>(null);
  const [chessValidMoves, setChessValidMoves] = useState<{ r: number, c: number }[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<ChessPieceType[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<ChessPieceType[]>([]);
  const [chessGameResultType, setChessGameResultType] = useState<'CHECKMATE' | 'STALEMATE' | 'RESIGN' | null>(null);
  const [chessDifficulty, setChessDifficulty] = useState<Difficulty>('상');
  const [playerChessSide, setPlayerChessSide] = useState<ChessSide>('WHITE');
  const [showChessSetup, setShowChessSetup] = useState(false);
  const [isChessAiThinking, setIsChessAiThinking] = useState(false);
  const [chessHistory, setChessHistory] = useState<{
    board: (ChessPiece | null)[][];
    turn: ChessSide;
    capturedWhite: ChessPieceType[];
    capturedBlack: ChessPieceType[];
  }[]>([]);
  const [chessCheckStatus, setChessCheckStatus] = useState<{
    WHITE: boolean;
    BLACK: boolean;
  }>({ WHITE: false, BLACK: false });

  // Othello States
  const [othelloBoard, setOthelloBoard] = useState<number[][]>(Array(O_SIZE).fill(0).map(() => Array(O_SIZE).fill(0)));
  const [othelloTurn, setOthelloTurn] = useState<OthelloStone>('BLACK');
  const [othelloWinner, setOthelloWinner] = useState<OthelloStone | 'DRAW' | null>(null);
  const [isOthelloAiThinking, setIsOthelloAiThinking] = useState(false);
  const [othelloDifficulty, setOthelloDifficulty] = useState<Difficulty>('중');
  const [othelloPlayerColor, setOthelloPlayerColor] = useState<OthelloStone>('BLACK');
  const [showOthelloSetup, setShowOthelloSetup] = useState(false);
  const [othelloScores, setOthelloScores] = useState({ BLACK: 2, WHITE: 2 });
  const [othelloHistory, setOthelloHistory] = useState<number[][][]>([]);

  // --- Othello Logic ---

  const evaluateOthelloBoard = (board: number[][], side: OthelloStone): number => {
    const playerVal = side === 'BLACK' ? 1 : 2;
    const opponentVal = side === 'BLACK' ? 2 : 1;

    const weights = [
      [100, -20, 10, 5, 5, 10, -20, 100],
      [-20, -50, -2, -2, -2, -2, -50, -20],
      [10, -2, 5, 1, 1, 5, -2, 10],
      [5, -2, 1, 0, 0, 1, -2, 5],
      [5, -2, 1, 0, 0, 1, -2, 5],
      [10, -2, 5, 1, 1, 5, -2, 10],
      [-20, -50, -2, -2, -2, -2, -50, -20],
      [100, -20, 10, 5, 5, 10, -20, 100]
    ];

    let score = 0;
    let playerPieces = 0;
    let opponentPieces = 0;

    for (let r = 0; r < O_SIZE; r++) {
      for (let c = 0; c < O_SIZE; c++) {
        if (board[r][c] === playerVal) {
          score += weights[r][c];
          playerPieces++;
        } else if (board[r][c] === opponentVal) {
          score -= weights[r][c];
          opponentPieces++;
        }
      }
    }

    // Mobility
    const playerMoves = getValidOthelloMoves(board, side).length;
    const opponentMoves = getValidOthelloMoves(board, side === 'BLACK' ? 'WHITE' : 'BLACK').length;
    score += (playerMoves - opponentMoves) * 10;

    // Piece count (less important early, more important late)
    const totalPieces = playerPieces + opponentPieces;
    if (totalPieces > 50) {
      score += (playerPieces - opponentPieces) * 5;
    }

    return score;
  };

  const simulateOthelloMove = (board: number[][], r: number, c: number, flips: { r: number, c: number }[], turn: OthelloStone): number[][] => {
    const newBoard = board.map(row => [...row]);
    const playerVal = turn === 'BLACK' ? 1 : 2;
    newBoard[r][c] = playerVal;
    flips.forEach(f => {
      newBoard[f.r][f.c] = playerVal;
    });
    return newBoard;
  };

  const minimaxOthello = (board: number[][], depth: number, alpha: number, beta: number, isMaximizing: boolean, side: OthelloStone): number => {
    const currentSide = isMaximizing ? side : (side === 'BLACK' ? 'WHITE' : 'BLACK');
    const validMoves = getValidOthelloMoves(board, currentSide);

    if (depth === 0 || validMoves.length === 0) {
      return evaluateOthelloBoard(board, side);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of validMoves) {
        const nextBoard = simulateOthelloMove(board, move.r, move.c, move.flips, currentSide);
        const evaluation = minimaxOthello(nextBoard, depth - 1, alpha, beta, false, side);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of validMoves) {
        const nextBoard = simulateOthelloMove(board, move.r, move.c, move.flips, currentSide);
        const evaluation = minimaxOthello(nextBoard, depth - 1, alpha, beta, true, side);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const othelloAiMove = (currentBoard: number[][], side: OthelloStone) => {
    setIsOthelloAiThinking(true);
    setTimeout(() => {
      const validMoves = getValidOthelloMoves(currentBoard, side);
      if (validMoves.length === 0) {
        setIsOthelloAiThinking(false);
        return;
      }

      let bestMove = validMoves[0];

      if (othelloDifficulty === '하') {
        // Easy: Random move
        bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      } else if (othelloDifficulty === '중') {
        // Medium: Greedy + Positional
        let maxScore = -Infinity;
        validMoves.forEach(m => {
          const weights = [
            [100, -20, 10, 5, 5, 10, -20, 100],
            [-20, -50, -2, -2, -2, -2, -50, -20],
            [10, -2, 5, 1, 1, 5, -2, 10],
            [5, -2, 1, 0, 0, 1, -2, 5],
            [5, -2, 1, 0, 0, 1, -2, 5],
            [10, -2, 5, 1, 1, 5, -2, 10],
            [-20, -50, -2, -2, -2, -2, -50, -20],
            [100, -20, 10, 5, 5, 10, -20, 100]
          ];
          const score = weights[m.r][m.c] + m.flips.length * 2;
          if (score > maxScore) {
            maxScore = score;
            bestMove = m;
          }
        });
      } else {
        // Hard: Minimax with Alpha-Beta
        let bestScore = -Infinity;
        let depth = 4;
        // Increase depth in late game
        const pieces = currentBoard.flat().filter(p => p !== 0).length;
        if (pieces > 50) depth = 6;

        for (const move of validMoves) {
          const nextBoard = simulateOthelloMove(currentBoard, move.r, move.c, move.flips, side);
          const score = minimaxOthello(nextBoard, depth - 1, -Infinity, Infinity, false, side);
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
      }

      executeOthelloMove(currentBoard, bestMove.r, bestMove.c, bestMove.flips, side);
      // Only set thinking to false if we didn't trigger another AI move
      setIsOthelloAiThinking(false);
    }, 800);
  };

  const initOthello = (diff: Difficulty, color: OthelloStone) => {
    const newBoard = Array(O_SIZE).fill(0).map(() => Array(O_SIZE).fill(0));
    newBoard[3][3] = 2; // White
    newBoard[3][4] = 1; // Black
    newBoard[4][3] = 1; // Black
    newBoard[4][4] = 2; // White

    setOthelloBoard(newBoard);
    setOthelloTurn('BLACK');
    setOthelloWinner(null);
    setOthelloDifficulty(diff);
    setOthelloPlayerColor(color);
    setOthelloScores({ BLACK: 2, WHITE: 2 });
    setOthelloHistory([newBoard.map(row => [...row])]);
    setShowOthelloSetup(false);

    if (color === 'WHITE') {
      othelloAiMove(newBoard, 'BLACK');
    }
  };

  const getValidOthelloMoves = (board: number[][], turn: OthelloStone) => {
    const moves: { r: number, c: number, flips: { r: number, c: number }[] }[] = [];
    const playerVal = turn === 'BLACK' ? 1 : 2;
    const opponentVal = turn === 'BLACK' ? 2 : 1;
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (let r = 0; r < O_SIZE; r++) {
      for (let c = 0; c < O_SIZE; c++) {
        if (board[r][c] !== 0) continue;

        let totalFlips: { r: number, c: number }[] = [];
        for (const [dr, dc] of directions) {
          let nr = r + dr;
          let nc = c + dc;
          let flipsInDir: { r: number, c: number }[] = [];

          while (nr >= 0 && nr < O_SIZE && nc >= 0 && nc < O_SIZE && board[nr][nc] === opponentVal) {
            flipsInDir.push({ r: nr, c: nc });
            nr += dr;
            nc += dc;
          }

          if (nr >= 0 && nr < O_SIZE && nc >= 0 && nc < O_SIZE && board[nr][nc] === playerVal && flipsInDir.length > 0) {
            totalFlips = [...totalFlips, ...flipsInDir];
          }
        }

        if (totalFlips.length > 0) {
          moves.push({ r, c, flips: totalFlips });
        }
      }
    }
    return moves;
  };

  const handleOthelloClick = (r: number, c: number) => {
    if (othelloWinner || isOthelloAiThinking || othelloTurn !== othelloPlayerColor) return;

    const validMoves = getValidOthelloMoves(othelloBoard, othelloTurn);
    const move = validMoves.find(m => m.r === r && m.c === c);

    if (move) {
      executeOthelloMove(othelloBoard, r, c, move.flips, othelloTurn);
    }
  };

  const executeOthelloMove = (board: number[][], r: number, c: number, flips: { r: number, c: number }[], turn: OthelloStone) => {
    const newBoard = board.map(row => [...row]);
    const playerVal = turn === 'BLACK' ? 1 : 2;

    newBoard[r][c] = playerVal;
    flips.forEach(f => {
      newBoard[f.r][f.c] = playerVal;
    });

    const nextTurn = turn === 'BLACK' ? 'WHITE' : 'BLACK';
    const nextMoves = getValidOthelloMoves(newBoard, nextTurn);

    setOthelloBoard(newBoard);
    setOthelloHistory(prev => [...prev, newBoard.map(row => [...row])]);

    let black = 0, white = 0;
    for (let i = 0; i < O_SIZE; i++) {
      for (let j = 0; j < O_SIZE; j++) {
        if (newBoard[i][j] === 1) black++;
        if (newBoard[i][j] === 2) white++;
      }
    }
    setOthelloScores({ BLACK: black, WHITE: white });

    if (nextMoves.length > 0) {
      setOthelloTurn(nextTurn);
      if (nextTurn !== othelloPlayerColor) {
        // Use a small timeout to ensure state updates (like setOthelloTurn) are processed
        setTimeout(() => othelloAiMove(newBoard, nextTurn), 10);
      }
    } else {
      const currentMoves = getValidOthelloMoves(newBoard, turn);
      if (currentMoves.length > 0) {
        setOthelloTurn(turn);
        if (turn !== othelloPlayerColor) {
          setTimeout(() => othelloAiMove(newBoard, turn), 10);
        }
      } else {
        if (black > white) setOthelloWinner('BLACK');
        else if (white > black) setOthelloWinner('WHITE');
        else setOthelloWinner('DRAW');
      }
    }
  };

  // --- Omok Logic ---




  const findKing = (board: (ChessPiece | null)[][], side: ChessSide) => {
    for (let r = 0; r < C_ROWS; r++) {
      for (let c = 0; c < C_COLS; c++) {
        const p = board[r][c];
        if (p && p.type === 'KING' && p.side === side) return { r, c };
      }
    }
    return null;
  };

  const isChessCheck = useCallback((board: (ChessPiece | null)[][], side: ChessSide) => {
    const kingPos = findKing(board, side);
    if (!kingPos) return false;

    const opponent = side === 'WHITE' ? 'BLACK' : 'WHITE';
    for (let r = 0; r < C_ROWS; r++) {
      for (let c = 0; c < C_COLS; c++) {
        const p = board[r][c];
        if (p && p.side === opponent) {
          const moves = getChessBaseMoves(board, r, c, opponent, true);
          if (moves.some(m => m.r === kingPos.r && m.c === kingPos.c)) return true;
        }
      }
    }
    return false;
  }, []);

  const getChessBaseMoves = (board: (ChessPiece | null)[][], r: number, c: number, side: ChessSide, ignoreCheck = false) => {
    const piece = board[r][c];
    if (!piece) return [];
    const { type } = piece;
    const moves: { r: number, c: number }[] = [];

    const addMove = (nr: number, nc: number) => {
      if (nr >= 0 && nr < C_ROWS && nc >= 0 && nc < C_COLS) {
        const target = board[nr][nc];
        if (!target || target.side !== side) {
          moves.push({ r: nr, c: nc });
          return !target; // Continue if empty
        }
      }
      return false;
    };

    if (type === 'PAWN') {
      const dir = side === 'WHITE' ? -1 : 1;
      const startRow = side === 'WHITE' ? 6 : 1;

      // Forward
      if (r + dir >= 0 && r + dir < C_ROWS && !board[r + dir][c]) {
        moves.push({ r: r + dir, c });
        if (r === startRow && !board[r + 2 * dir][c]) {
          moves.push({ r: r + 2 * dir, c });
        }
      }
      // Capture
      for (const dc of [-1, 1]) {
        const nr = r + dir, nc = c + dc;
        if (nr >= 0 && nr < C_ROWS && nc >= 0 && nc < C_COLS) {
          const target = board[nr][nc];
          if (target && target.side !== side) moves.push({ r: nr, c: nc });
          else if (ignoreCheck) moves.push({ r: nr, c: nc }); // For check detection, pawns attack diagonally
        }
      }
    } else if (type === 'ROOK' || type === 'BISHOP' || type === 'QUEEN') {
      const dirs = [];
      if (type !== 'BISHOP') dirs.push([0, 1], [0, -1], [1, 0], [-1, 0]);
      if (type !== 'ROOK') dirs.push([1, 1], [1, -1], [-1, 1], [-1, -1]);

      for (const [dr, dc] of dirs) {
        for (let i = 1; i < 8; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= C_ROWS || nc < 0 || nc >= C_COLS) break;
          const target = board[nr][nc];
          if (!target) {
            moves.push({ r: nr, c: nc });
          } else {
            if (target.side !== side) moves.push({ r: nr, c: nc });
            break;
          }
        }
      }
    } else if (type === 'KNIGHT') {
      const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
      for (const [dr, dc] of knightMoves) {
        addMove(r + dr, c + dc);
      }
    } else if (type === 'KING') {
      const kingMoves = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      for (const [dr, dc] of kingMoves) {
        addMove(r + dr, c + dc);
      }
    }

    return moves;
  };

  const getChessValidMoves = useCallback((board: (ChessPiece | null)[][], r: number, c: number, side: ChessSide) => {
    const baseMoves = getChessBaseMoves(board, r, c, side);
    return baseMoves.filter(m => {
      const nextBoard = board.map(row => [...row]);
      nextBoard[m.r][m.c] = nextBoard[r][c];
      nextBoard[r][c] = null;
      return !isChessCheck(nextBoard, side);
    });
  }, [isChessCheck]);
  const evaluateChessBoard = (board: (ChessPiece | null)[][], side: ChessSide) => {
    let score = 0;
    for (let r = 0; r < C_ROWS; r++) {
      for (let c = 0; c < C_COLS; c++) {
        const p = board[r][c];
        if (p) {
          const val = CHESS_PIECE_SCORES[p.type];
          score += p.side === side ? val : -val;
        }
      }
    }
    return score;
  };

  const minimaxChess = (board: (ChessPiece | null)[][], depth: number, alpha: number, beta: number, isMaximizing: boolean, side: ChessSide): number => {
    const currentSide = isMaximizing ? side : (side === 'WHITE' ? 'BLACK' : 'WHITE');

    if (depth === 0) {
      return evaluateChessBoard(board, side);
    }

    const allMoves: { from: { r: number, c: number }, to: { r: number, c: number } }[] = [];
    for (let r = 0; r < C_ROWS; r++) {
      for (let c = 0; c < C_COLS; c++) {
        const p = board[r][c];
        if (p && p.side === currentSide) {
          const moves = getChessValidMoves(board, r, c, currentSide);
          moves.forEach(m => allMoves.push({ from: { r, c }, to: m }));
        }
      }
    }

    if (allMoves.length === 0) {
      if (isChessCheck(board, currentSide)) {
        return isMaximizing ? -10000 - depth : 10000 + depth;
      }
      return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of allMoves) {
        const nextBoard = board.map(row => [...row]);
        nextBoard[move.to.r][move.to.c] = { ...nextBoard[move.from.r][move.from.c]!, hasMoved: true };
        nextBoard[move.from.r][move.from.c] = null;
        const evaluation = minimaxChess(nextBoard, depth - 1, alpha, beta, false, side);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of allMoves) {
        const nextBoard = board.map(row => [...row]);
        nextBoard[move.to.r][move.to.c] = { ...nextBoard[move.from.r][move.from.c]!, hasMoved: true };
        nextBoard[move.from.r][move.from.c] = null;
        const evaluation = minimaxChess(nextBoard, depth - 1, alpha, beta, true, side);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const chessAiMove = useCallback((board: (ChessPiece | null)[][], side: ChessSide, _diff: Difficulty) => {
    setIsChessAiThinking(true);
    setTimeout(() => {
      const allMoves: { from: { r: number, c: number }, to: { r: number, c: number } }[] = [];
      for (let r = 0; r < C_ROWS; r++) {
        for (let c = 0; c < C_COLS; c++) {
          const p = board[r][c];
          if (p && p.side === side) {
            const moves = getChessValidMoves(board, r, c, side);
            moves.forEach(m => allMoves.push({ from: { r, c }, to: m }));
          }
        }
      }

      if (allMoves.length === 0) {
        setChessWinner(side === 'WHITE' ? 'BLACK' : 'WHITE');
        setIsChessAiThinking(false);
        return;
      }

      let bestMove = null;
      let bestScore = -Infinity;
      const depth = 3;

      for (const move of allMoves) {
        const nextBoard = board.map(row => [...row]);
        nextBoard[move.to.r][move.to.c] = { ...nextBoard[move.from.r][move.from.c]!, hasMoved: true };
        nextBoard[move.from.r][move.from.c] = null;

        const score = minimaxChess(nextBoard, depth - 1, -Infinity, Infinity, false, side);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      if (bestMove) {
        const newBoard = board.map(row => [...row]);
        const target = newBoard[bestMove.to.r][bestMove.to.c];
        if (target) {
          if (target.side === 'WHITE') setCapturedWhite(prev => [...prev, target.type]);
          else setCapturedBlack(prev => [...prev, target.type]);
        }
        newBoard[bestMove.to.r][bestMove.to.c] = { ...newBoard[bestMove.from.r][bestMove.from.c]!, hasMoved: true };
        newBoard[bestMove.from.r][bestMove.from.c] = null;

        setChessBoard(newBoard);
        const nextTurn = side === 'WHITE' ? 'BLACK' : 'WHITE';
        setChessTurn(nextTurn);

        // Checkmate detection for player
        let playerMovesCount = 0;
        for (let r = 0; r < C_ROWS; r++) {
          for (let c = 0; c < C_COLS; c++) {
            const p = newBoard[r][c];
            if (p && p.side === nextTurn) {
              playerMovesCount += getChessValidMoves(newBoard, r, c, nextTurn).length;
            }
          }
        }
        if (playerMovesCount === 0) {
          const isCheck = isChessCheck(newBoard, nextTurn);
          setChessWinner(isCheck ? side : 'DRAW');
          setChessGameResultType(isCheck ? 'CHECKMATE' : 'STALEMATE');
        } else {
          // Check for "Check" status
          if (isChessCheck(newBoard, nextTurn)) {
            setChessCheckStatus({ ...chessCheckStatus, [nextTurn]: true });
            setTimeout(() => setChessCheckStatus({ WHITE: false, BLACK: false }), 2000);
          }
        }
      }
      setIsChessAiThinking(false);
    }, 800);
  }, [getChessValidMoves, isChessCheck, chessCheckStatus]);

  const undoChessMove = () => {
    if (chessHistory.length === 0 || isChessAiThinking) return;
    const lastState = chessHistory[chessHistory.length - 1];
    setChessBoard(lastState.board);
    setChessTurn(lastState.turn);
    setCapturedWhite(lastState.capturedWhite);
    setCapturedBlack(lastState.capturedBlack);
    setChessHistory(prev => prev.slice(0, -1));
    setChessSelectedPos(null);
    setChessValidMoves([]);
    setChessWinner(null);
  };

  const resignChessGame = () => {
    if (chessWinner) return;
    setChessWinner(playerChessSide === 'WHITE' ? 'BLACK' : 'WHITE');
    setChessGameResultType('RESIGN');
  };

  const handleChessClick = (r: number, c: number) => {
    if (isChessAiThinking || chessWinner) return;

    if (chessSelectedPos) {
      const move = chessValidMoves.find(m => m.r === r && m.c === c);
      if (move) {
        setChessHistory(prev => [
          ...prev,
          {
            board: chessBoard.map(row => [...row]),
            turn: chessTurn,
            capturedWhite: [...capturedWhite],
            capturedBlack: [...capturedBlack],
          },
        ]);

        const newBoard = chessBoard.map(row => [...row]);
        const target = newBoard[r][c];
        if (target) {
          if (target.side === 'WHITE') setCapturedWhite(prev => [...prev, target.type]);
          else setCapturedBlack(prev => [...prev, target.type]);
        }
        newBoard[r][c] = { ...newBoard[chessSelectedPos.r][chessSelectedPos.c]!, hasMoved: true };
        newBoard[chessSelectedPos.r][chessSelectedPos.c] = null;

        setChessBoard(newBoard);
        setChessSelectedPos(null);
        setChessValidMoves([]);

        const nextTurn = chessTurn === 'WHITE' ? 'BLACK' : 'WHITE';
        setChessTurn(nextTurn);

        // Checkmate detection for AI
        let aiMovesCount = 0;
        for (let row = 0; row < C_ROWS; row++) {
          for (let col = 0; col < C_COLS; col++) {
            const p = newBoard[row][col];
            if (p && p.side === nextTurn) {
              aiMovesCount += getChessValidMoves(newBoard, row, col, nextTurn).length;
            }
          }
        }
        if (aiMovesCount === 0) {
          const isCheck = isChessCheck(newBoard, nextTurn);
          setChessWinner(isCheck ? chessTurn : 'DRAW');
          setChessGameResultType(isCheck ? 'CHECKMATE' : 'STALEMATE');
          return;
        }

        // Check for "Check" status
        if (isChessCheck(newBoard, nextTurn)) {
          setChessCheckStatus({ ...chessCheckStatus, [nextTurn]: true });
          setTimeout(() => setChessCheckStatus({ WHITE: false, BLACK: false }), 2000);
        }

        chessAiMove(newBoard, nextTurn, chessDifficulty);
      } else {
        setChessSelectedPos(null);
        setChessValidMoves([]);
      }
    } else {
      const piece = chessBoard[r][c];
      if (piece && piece.side === chessTurn && piece.side === playerChessSide) {
        setChessSelectedPos({ r, c });
        setChessValidMoves(getChessValidMoves(chessBoard, r, c, chessTurn));
      }
    }
  };

  const initChess = (diff: Difficulty, side: ChessSide) => {
    setChessDifficulty(diff);
    setPlayerChessSide(side);
    const newBoard = INITIAL_CHESS_BOARD.map(row => [...row]);
    setChessBoard(newBoard);
    setChessTurn('WHITE');
    setChessWinner(null);
    setChessGameResultType(null);
    setChessCheckStatus({ WHITE: false, BLACK: false });
    setChessSelectedPos(null);
    setChessValidMoves([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setShowChessSetup(false);
    setChessHistory([]);

    if (side === 'BLACK') {
      chessAiMove(newBoard, 'WHITE', diff);
    }
  };

  const initOmok = (diff: Difficulty, color: 'BLACK' | 'WHITE') => {
    setOmokDifficulty(diff);
    setPlayerColor(color);
    setOmokBoard(Array.from({ length: 15 }, () => Array(15).fill(0)));
    setOmokTurn('BLACK');
    setOmokWinner(null);
    setShowOmokSetup(false);
    setIsOmokAiThinking(false);

    // 만약 플레이어가 백돌이면 AI(흑돌)가 먼저 시작
    if (color === 'WHITE') {
      setTimeout(() => aiMove(Array.from({ length: 15 }, () => Array(15).fill(0)), 'BLACK', diff), 500);
    }
  };

  const isAiThinking = isOmokAiThinking || isJanggiAiThinking;

  // --- Janggi Logic ---
  const isInPalace = (r: number, c: number, side: JanggiSide) => {
    const cols = c >= 3 && c <= 5;
    if (side === 'HAN') return r >= 0 && r <= 2 && cols;
    return r >= 7 && r <= 9 && cols;
  };

  const getValidMoves = useCallback((board: (JanggiPiece | null)[][], r: number, c: number, side: JanggiSide, checkJanggun = true) => {
    const piece = board[r][c];
    if (!piece || piece.side !== side) return [];

    const moves: { r: number, c: number }[] = [];
    const addMove = (nr: number, nc: number) => {
      if (nr < 0 || nr >= J_ROWS || nc < 0 || nc >= J_COLS) return false;
      const target = board[nr][nc];
      if (!target) {
        moves.push({ r: nr, c: nc });
        return true;
      } else if (target.side !== side) {
        moves.push({ r: nr, c: nc });
        return false;
      }
      return false;
    };

    const { type } = piece;

    if (type === 'KUNG' || type === 'SA') {
      const palaceRows = side === 'HAN' ? [0, 1, 2] : [7, 8, 9];
      const palaceCols = [3, 4, 5];

      // 기본 4방향 이동
      const orthoDirections = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dr, dc] of orthoDirections) {
        const nr = r + dr, nc = c + dc;
        if (palaceRows.includes(nr) && palaceCols.includes(nc)) {
          addMove(nr, nc);
        }
      }

      // 대각선 이동 (특정 위치에서만 가능)
      const isCorner = (r === palaceRows[0] || r === palaceRows[2]) && (c === palaceCols[0] || c === palaceCols[2]);
      const isCenter = r === palaceRows[1] && c === palaceCols[1];

      if (isCorner) {
        const dr = r === palaceRows[0] ? 1 : -1;
        const dc = c === palaceCols[0] ? 1 : -1;
        addMove(r + dr, c + dc);
      } else if (isCenter) {
        const diagDirections = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of diagDirections) {
          addMove(r + dr, c + dc);
        }
      }
    } else if (type === 'CHA') {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 10; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= J_ROWS || nc < 0 || nc >= J_COLS) break;
          const target = board[nr][nc];
          if (!target) moves.push({ r: nr, c: nc });
          else {
            if (target.side !== side) moves.push({ r: nr, c: nc });
            break;
          }
        }
      }
      if (isInPalace(r, c, side)) {
        const palaceRows = side === 'HAN' ? [0, 1, 2] : [7, 8, 9];
        const palaceCols = [3, 4, 5];
        const diagonals = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of diagonals) {
          for (let i = 1; i < 3; i++) {
            const nr = r + dr * i, nc = c + dc * i;
            if (palaceRows.includes(nr) && palaceCols.includes(nc)) {
              // Only allow diagonal move if it's from corner to center or center to corner
              const isStartCorner = (r === palaceRows[0] || r === palaceRows[2]) && (c === palaceCols[0] || c === palaceCols[2]);
              const isStartCenter = r === palaceRows[1] && c === palaceCols[1];
              if (!isStartCorner && !isStartCenter) break;

              const target = board[nr][nc];
              if (!target) moves.push({ r: nr, c: nc });
              else {
                if (target.side !== side) moves.push({ r: nr, c: nc });
                break;
              }
            } else break;
          }
        }
      }
    } else if (type === 'PO') {
      const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
      for (const [dr, dc] of directions) {
        let bridgeFound = false;
        for (let i = 1; i < 10; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= J_ROWS || nc < 0 || nc >= J_COLS) break;
          const target = board[nr][nc];
          if (!bridgeFound) {
            if (target) {
              if (target.type === 'PO') break;
              bridgeFound = true;
            }
          } else {
            if (!target) moves.push({ r: nr, c: nc });
            else {
              if (target.side !== side && target.type !== 'PO') moves.push({ r: nr, c: nc });
              break;
            }
          }
        }
      }
      if (isInPalace(r, c, side)) {
        const palaceRows = side === 'HAN' ? [0, 1, 2] : [7, 8, 9];
        const palaceCols = [3, 4, 5];
        const diagonals = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [dr, dc] of diagonals) {
          let bridgeFound = false;
          for (let i = 1; i < 3; i++) {
            const nr = r + dr * i, nc = c + dc * i;
            if (palaceRows.includes(nr) && palaceCols.includes(nc)) {
              // Only allow diagonal move if it's from corner to center or center to corner
              const isStartCorner = (r === palaceRows[0] || r === palaceRows[2]) && (c === palaceCols[0] || c === palaceCols[2]);
              const isStartCenter = r === palaceRows[1] && c === palaceCols[1];
              if (!isStartCorner && !isStartCenter) break;

              const target = board[nr][nc];
              if (!bridgeFound) {
                if (target) {
                  if (target.type === 'PO') break;
                  bridgeFound = true;
                }
              } else {
                if (!target) moves.push({ r: nr, c: nc });
                else {
                  if (target.side !== side && target.type !== 'PO') moves.push({ r: nr, c: nc });
                  break;
                }
              }
            } else break;
          }
        }
      }
    } else if (type === 'MA') {
      const maMoves = [
        { step: [-1, 0], diags: [[-1, -1], [-1, 1]] },
        { step: [1, 0], diags: [[1, -1], [1, 1]] },
        { step: [0, -1], diags: [[-1, -1], [1, -1]] },
        { step: [0, 1], diags: [[-1, 1], [1, 1]] },
      ];
      maMoves.forEach(({ step, diags }) => {
        const mr = r + step[0], mc = c + step[1];
        // 멱(foot)이 비어있어야 함
        if (mr >= 0 && mr < J_ROWS && mc >= 0 && mc < J_COLS && !board[mr][mc]) {
          diags.forEach(([dr, dc]) => {
            const nr = mr + dr, nc = mc + dc;
            if (nr >= 0 && nr < J_ROWS && nc >= 0 && nc < J_COLS) {
              const target = board[nr][nc];
              if (!target || target.side !== side) moves.push({ r: nr, c: nc });
            }
          });
        }
      });
    } else if (type === 'SANG') {
      const sangMoves = [
        { step: [-1, 0], diags: [[-1, -1], [-1, 1]] },
        { step: [1, 0], diags: [[1, -1], [1, 1]] },
        { step: [0, -1], diags: [[-1, -1], [1, -1]] },
        { step: [0, 1], diags: [[-1, 1], [1, 1]] },
      ];
      sangMoves.forEach(({ step, diags }) => {
        const mr = r + step[0], mc = c + step[1];
        // 첫 번째 멱
        if (mr >= 0 && mr < J_ROWS && mc >= 0 && mc < J_COLS && !board[mr][mc]) {
          diags.forEach(([dr, dc]) => {
            const m2r = mr + dr, m2c = mc + dc;
            // 두 번째 멱
            if (m2r >= 0 && m2r < J_ROWS && m2c >= 0 && m2c < J_COLS && !board[m2r][m2c]) {
              const nr = m2r + dr, nc = m2c + dc;
              if (nr >= 0 && nr < J_ROWS && nc >= 0 && nc < J_COLS) {
                const target = board[nr][nc];
                if (!target || target.side !== side) moves.push({ r: nr, c: nc });
              }
            }
          });
        }
      });
    } else if (type === 'JOL' || type === 'BYUNG') {
      const forward = side === 'CHO' ? -1 : 1;
      addMove(r + forward, c);
      addMove(r, c + 1);
      addMove(r, c - 1);

      // 상대방 궁 안에서의 대각선 이동
      const opponentSide = side === 'CHO' ? 'HAN' : 'CHO';
      if (isInPalace(r, c, opponentSide)) {
        const palaceRows = opponentSide === 'HAN' ? [0, 1, 2] : [7, 8, 9];
        const palaceCols = [3, 4, 5];

        // 대각선 전진 이동
        const diagonals = side === 'CHO' ? [[-1, 1], [-1, -1]] : [[1, 1], [1, -1]];

        diagonals.forEach(([dr, dc]) => {
          const nr = r + dr, nc = c + dc;
          if (palaceRows.includes(nr) && palaceCols.includes(nc)) {
            // 모서리에서 중앙으로, 또는 중앙에서 모서리로 이동 가능
            const isCorner = (r === palaceRows[0] || r === palaceRows[2]) && (c === palaceCols[0] || c === palaceCols[2]);
            const isCenter = r === palaceRows[1] && c === palaceCols[1];
            if (isCorner || isCenter) addMove(nr, nc);
          }
        });
      }
    }

    if (checkJanggun) {
      return moves.filter(m => {
        const nextBoard = board.map(row => [...row]);
        nextBoard[m.r][m.c] = nextBoard[r][c];
        nextBoard[r][c] = null;
        return !isJanggun(nextBoard, side);
      });
    }
    return moves;
  }, []);

  const isJanggun = useCallback((board: (JanggiPiece | null)[][], side: JanggiSide) => {
    let kungPos: { r: number, c: number } | null = null;
    for (let r = 0; r < J_ROWS; r++) {
      for (let c = 0; c < J_COLS; c++) {
        const p = board[r][c];
        if (p && p.type === 'KUNG' && p.side === side) {
          kungPos = { r, c };
          break;
        }
      }
      if (kungPos) break;
    }
    if (!kungPos) return true; // 궁이 없으면 장군 상태로 간주 (패배)

    const opponent = side === 'CHO' ? 'HAN' : 'CHO';
    for (let r = 0; r < J_ROWS; r++) {
      for (let c = 0; c < J_COLS; c++) {
        const p = board[r][c];
        if (p && p.side === opponent) {
          const moves = getValidMoves(board, r, c, opponent, false);
          if (moves.some(m => m.r === kungPos!.r && m.c === kungPos!.c)) return true;
        }
      }
    }
    return false;
  }, [getValidMoves]);

  const evaluateBoard = (board: (JanggiPiece | null)[][], side: JanggiSide) => {
    let score = 0;
    for (let r = 0; r < J_ROWS; r++) {
      for (let c = 0; c < J_COLS; c++) {
        const p = board[r][c];
        if (p) {
          const val = PIECE_SCORES[p.type];
          score += p.side === side ? val : -val;
        }
      }
    }
    return score;
  };

  const minimaxJanggi = (board: (JanggiPiece | null)[][], depth: number, alpha: number, beta: number, isMaximizing: boolean, side: JanggiSide): number => {
    const currentSide = isMaximizing ? side : (side === 'CHO' ? 'HAN' : 'CHO');

    if (depth === 0) {
      return evaluateBoard(board, side);
    }

    const allMoves: { from: { r: number, c: number }, to: { r: number, c: number } }[] = [];
    for (let r = 0; r < J_ROWS; r++) {
      for (let c = 0; c < J_COLS; c++) {
        const p = board[r][c];
        if (p && p.side === currentSide) {
          const moves = getValidMoves(board, r, c, currentSide);
          moves.forEach(m => allMoves.push({ from: { r, c }, to: m }));
        }
      }
    }

    if (allMoves.length === 0) {
      if (isJanggun(board, currentSide)) {
        return isMaximizing ? -10000 - depth : 10000 + depth;
      }
      return 0;
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of allMoves) {
        const nextBoard = board.map(row => [...row]);
        nextBoard[move.to.r][move.to.c] = nextBoard[move.from.r][move.from.c];
        nextBoard[move.from.r][move.from.c] = null;
        const evaluation = minimaxJanggi(nextBoard, depth - 1, alpha, beta, false, side);
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of allMoves) {
        const nextBoard = board.map(row => [...row]);
        nextBoard[move.to.r][move.to.c] = nextBoard[move.from.r][move.from.c];
        nextBoard[move.from.r][move.from.c] = null;
        const evaluation = minimaxJanggi(nextBoard, depth - 1, alpha, beta, true, side);
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  };

  const janggiAiMove = useCallback((board: (JanggiPiece | null)[][], side: JanggiSide, _diff: Difficulty) => {
    setIsJanggiAiThinking(true);
    setTimeout(() => {
      let bestMove: { from: { r: number, c: number }, to: { r: number, c: number } } | null = null;
      let bestScore = -Infinity;

      const allMoves: { from: { r: number, c: number }, to: { r: number, c: number } }[] = [];
      for (let r = 0; r < J_ROWS; r++) {
        for (let c = 0; c < J_COLS; c++) {
          const p = board[r][c];
          if (p && p.side === side) {
            const moves = getValidMoves(board, r, c, side);
            moves.forEach(m => allMoves.push({ from: { r, c }, to: m }));
          }
        }
      }

      if (allMoves.length === 0) {
        setJanggiWinner(side === 'CHO' ? 'HAN' : 'CHO');
        setIsJanggiAiThinking(false);
        return;
      }

      const depth = 3;
      for (const move of allMoves) {
        const nextBoard = board.map(row => [...row]);
        nextBoard[move.to.r][move.to.c] = nextBoard[move.from.r][move.from.c];
        nextBoard[move.from.r][move.from.c] = null;

        const score = minimaxJanggi(nextBoard, depth - 1, -Infinity, Infinity, false, side);
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }

      if (bestMove) {
        const newBoard = board.map(row => [...row]);
        const target = newBoard[bestMove.to.r][bestMove.to.c];
        if (target) {
          if (target.side === 'CHO') setCapturedCho(prev => [...prev, target.type]);
          else setCapturedHan(prev => [...prev, target.type]);
        }
        newBoard[bestMove.to.r][bestMove.to.c] = newBoard[bestMove.from.r][bestMove.from.c];
        newBoard[bestMove.from.r][bestMove.from.c] = null;

        setJanggiBoard(newBoard);
        const nextTurn = side === 'CHO' ? 'HAN' : 'CHO';
        setJanggiTurn(nextTurn);

        if (isJanggun(newBoard, nextTurn)) {
          setJanggiStatus('JANGGUN');
          setTimeout(() => setJanggiStatus('NORMAL'), 2000);
        }

        // 플레이어의 다음 수 확인 (외통수 체크)
        let playerMovesCount = 0;
        for (let r = 0; r < J_ROWS; r++) {
          for (let c = 0; c < J_COLS; c++) {
            const p = newBoard[r][c];
            if (p && p.side === nextTurn) {
              playerMovesCount += getValidMoves(newBoard, r, c, nextTurn).length;
            }
          }
        }
        if (playerMovesCount === 0) {
          setJanggiWinner(side); // AI 승리
        }
      }
      setIsJanggiAiThinking(false);
    }, 800);
  }, [getValidMoves, isJanggun]);

  const undoJanggiMove = () => {
    if (janggiHistory.length === 0 || isJanggiAiThinking) return;
    const lastState = janggiHistory[janggiHistory.length - 1];
    setJanggiBoard(lastState.board);
    setJanggiTurn(lastState.turn);
    setCapturedHan(lastState.capturedHan);
    setCapturedCho(lastState.capturedCho);
    setJanggiHistory(prev => prev.slice(0, -1));
    setSelectedPos(null);
    setValidMoves([]);
    setJanggiWinner(null);
  };

  const resignJanggiGame = () => {
    if (janggiWinner) return;
    setJanggiWinner(playerSide === 'CHO' ? 'HAN' : 'CHO');
  };

  const handleJanggiClick = (r: number, c: number) => {
    if (isJanggiAiThinking || janggiWinner) return;

    if (selectedPos) {
      const move = validMoves.find(m => m.r === r && m.c === c);
      if (move) {
        // 무르기를 위해 현재 상태 저장
        setJanggiHistory(prev => [
          ...prev,
          {
            board: janggiBoard.map(row => [...row]),
            turn: janggiTurn,
            capturedHan: [...capturedHan],
            capturedCho: [...capturedCho],
          },
        ]);

        const newBoard = janggiBoard.map(row => [...row]);
        const target = newBoard[r][c];
        if (target) {
          if (target.side === 'CHO') setCapturedCho(prev => [...prev, target.type]);
          else setCapturedHan(prev => [...prev, target.type]);
        }
        newBoard[r][c] = newBoard[selectedPos.r][selectedPos.c];
        newBoard[selectedPos.r][selectedPos.c] = null;

        setJanggiBoard(newBoard);
        setSelectedPos(null);
        setValidMoves([]);

        const nextTurn = janggiTurn === 'CHO' ? 'HAN' : 'CHO';
        setJanggiTurn(nextTurn);

        if (isJanggun(newBoard, nextTurn)) {
          setJanggiStatus('JANGGUN');
          setTimeout(() => setJanggiStatus('NORMAL'), 2000);
        } else if (janggiStatus === 'JANGGUN') {
          setJanggiStatus('MEONGGUN');
          setTimeout(() => setJanggiStatus('NORMAL'), 2000);
        }

        // AI의 다음 수 확인 (외통수 체크)
        let aiMovesCount = 0;
        for (let row = 0; row < J_ROWS; row++) {
          for (let col = 0; col < J_COLS; col++) {
            const p = newBoard[row][col];
            if (p && p.side === nextTurn) {
              aiMovesCount += getValidMoves(newBoard, row, col, nextTurn).length;
            }
          }
        }
        if (aiMovesCount === 0) {
          setJanggiWinner(janggiTurn); // 플레이어 승리
          return;
        }

        janggiAiMove(newBoard, nextTurn, janggiDifficulty);
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    } else {
      const piece = janggiBoard[r][c];
      if (piece && piece.side === janggiTurn && piece.side === playerSide) {
        setSelectedPos({ r, c });
        setValidMoves(getValidMoves(janggiBoard, r, c, janggiTurn));
      }
    }
  };

  const initJanggi = (diff: Difficulty, side: JanggiSide, setup: JanggiSetup) => {
    setJanggiDifficulty(diff);
    setPlayerSide(side);
    setJanggiSetup(setup);

    // 보드 초기화 (선택한 차림 적용)
    const newBoard: (JanggiPiece | null)[][] = Array.from({ length: J_ROWS }, () => Array(J_COLS).fill(null));

    // 한(HAN) 진영 (상단)
    newBoard[0][0] = { type: 'CHA', side: 'HAN' };
    newBoard[0][8] = { type: 'CHA', side: 'HAN' };
    newBoard[0][3] = { type: 'SA', side: 'HAN' };
    newBoard[0][5] = { type: 'SA', side: 'HAN' };
    newBoard[1][4] = { type: 'KUNG', side: 'HAN' };
    newBoard[2][1] = { type: 'PO', side: 'HAN' };
    newBoard[2][7] = { type: 'PO', side: 'HAN' };
    newBoard[3][0] = { type: 'BYUNG', side: 'HAN' };
    newBoard[3][2] = { type: 'BYUNG', side: 'HAN' };
    newBoard[3][4] = { type: 'BYUNG', side: 'HAN' };
    newBoard[3][6] = { type: 'BYUNG', side: 'HAN' };
    newBoard[3][8] = { type: 'BYUNG', side: 'HAN' };

    // 초(CHO) 진영 (하단)
    newBoard[9][0] = { type: 'CHA', side: 'CHO' };
    newBoard[9][8] = { type: 'CHA', side: 'CHO' };
    newBoard[9][3] = { type: 'SA', side: 'CHO' };
    newBoard[9][5] = { type: 'SA', side: 'CHO' };
    newBoard[8][4] = { type: 'KUNG', side: 'CHO' };
    newBoard[7][1] = { type: 'PO', side: 'CHO' };
    newBoard[7][7] = { type: 'PO', side: 'CHO' };
    newBoard[6][0] = { type: 'JOL', side: 'CHO' };
    newBoard[6][2] = { type: 'JOL', side: 'CHO' };
    newBoard[6][4] = { type: 'JOL', side: 'CHO' };
    newBoard[6][6] = { type: 'JOL', side: 'CHO' };
    newBoard[6][8] = { type: 'JOL', side: 'CHO' };

    // 마상/상마 차림 적용
    if (setup === 'MA_SANG') {
      newBoard[0][1] = { type: 'MA', side: 'HAN' };
      newBoard[0][2] = { type: 'SANG', side: 'HAN' };
      newBoard[0][6] = { type: 'SANG', side: 'HAN' };
      newBoard[0][7] = { type: 'MA', side: 'HAN' };

      newBoard[9][1] = { type: 'MA', side: 'CHO' };
      newBoard[9][2] = { type: 'SANG', side: 'CHO' };
      newBoard[9][6] = { type: 'SANG', side: 'CHO' };
      newBoard[9][7] = { type: 'MA', side: 'CHO' };
    } else {
      newBoard[0][1] = { type: 'SANG', side: 'HAN' };
      newBoard[0][2] = { type: 'MA', side: 'HAN' };
      newBoard[0][6] = { type: 'MA', side: 'HAN' };
      newBoard[0][7] = { type: 'SANG', side: 'HAN' };

      newBoard[9][1] = { type: 'SANG', side: 'CHO' };
      newBoard[9][2] = { type: 'MA', side: 'CHO' };
      newBoard[9][6] = { type: 'MA', side: 'CHO' };
      newBoard[9][7] = { type: 'SANG', side: 'CHO' };
    }

    setJanggiBoard(newBoard);
    setJanggiTurn('CHO');
    setJanggiWinner(null);
    setSelectedPos(null);
    setValidMoves([]);
    setCapturedHan([]);
    setCapturedCho([]);
    setShowJanggiSetup(false);
    setJanggiStatus('NORMAL');
    setJanggiHistory([]);

    if (side === 'HAN') {
      janggiAiMove(newBoard, 'CHO', diff);
    }
  };

  const checkWinner = (board: number[][], r: number, c: number, color: number) => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    for (const [dr, dc] of directions) {
      let count = 1;
      // Positive direction
      for (let i = 1; i < 5; i++) {
        if (board[r + dr * i]?.[c + dc * i] === color) count++;
        else break;
      }
      // Negative direction
      for (let i = 1; i < 5; i++) {
        if (board[r - dr * i]?.[c - dc * i] === color) count++;
        else break;
      }
      if (count >= 5) return true;
    }
    return false;
  };

  const getEmptySpots = (board: number[][]) => {
    const spots = [];
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if (board[r][c] === 0) spots.push({ r, c });
      }
    }
    return spots;
  };

  const aiMove = (currentBoard: number[][], aiColor: StoneColor, diff: Difficulty) => {
    setIsOmokAiThinking(true);
    const aiVal = aiColor === 'BLACK' ? 1 : 2;
    const playerVal = aiColor === 'BLACK' ? 2 : 1;
    const emptySpots = getEmptySpots(currentBoard);

    if (emptySpots.length === 0) return;

    let targetSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];

    if (diff === '하') {
      // 무작위
      targetSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
    } else {
      // 가중치 계산 (중/상 공통)
      let maxScore = -1;

      for (const spot of emptySpots) {
        let spotScore = 0;
        // 공격 점수와 수비 점수 합산
        spotScore += evaluateSpot(currentBoard, spot.r, spot.c, aiVal); // 공격
        spotScore += evaluateSpot(currentBoard, spot.r, spot.c, playerVal) * (diff === '상' ? 1.1 : 0.9); // 수비

        // 중앙 선호
        const distFromCenter = Math.abs(7 - spot.r) + Math.abs(7 - spot.c);
        spotScore += (20 - distFromCenter);

        if (spotScore > maxScore) {
          maxScore = spotScore;
          targetSpot = spot;
        }
      }
    }

    setTimeout(() => {
      const newBoard = currentBoard.map(row => [...row]);
      newBoard[targetSpot.r][targetSpot.c] = aiVal;
      setOmokBoard(newBoard);
      setIsOmokAiThinking(false);

      if (checkWinner(newBoard, targetSpot.r, targetSpot.c, aiVal)) {
        setOmokWinner(aiColor);
      } else {
        setOmokTurn(playerColor);
      }
    }, 600);
  };

  const evaluateSpot = (board: number[][], r: number, c: number, color: number) => {
    let totalScore = 0;
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    for (const [dr, dc] of directions) {
      let count = 1;
      let openEnds = 0;

      // 한쪽 방향
      for (let i = 1; i < 5; i++) {
        const nr = r + dr * i, nc = c + dc * i;
        if (board[nr]?.[nc] === color) count++;
        else {
          if (board[nr]?.[nc] === 0) openEnds++;
          break;
        }
      }
      // 반대 방향
      for (let i = 1; i < 5; i++) {
        const nr = r - dr * i, nc = c - dc * i;
        if (board[nr]?.[nc] === color) count++;
        else {
          if (board[nr]?.[nc] === 0) openEnds++;
          break;
        }
      }

      if (count >= 5) totalScore += 100000;
      else if (count === 4) totalScore += openEnds === 2 ? 10000 : 1000;
      else if (count === 3) totalScore += openEnds === 2 ? 1000 : 100;
      else if (count === 2) totalScore += openEnds === 2 ? 100 : 10;
    }
    return totalScore;
  };

  const handleOmokClick = (r: number, c: number) => {
    if (omokBoard[r][c] !== 0 || omokWinner || omokTurn !== playerColor || isOmokAiThinking) return;

    const playerVal = playerColor === 'BLACK' ? 1 : 2;
    const newBoard = omokBoard.map(row => [...row]);
    newBoard[r][c] = playerVal;
    setOmokBoard(newBoard);

    if (checkWinner(newBoard, r, c, playerVal)) {
      setOmokWinner(playerColor);
    } else {
      const nextTurn = playerColor === 'BLACK' ? 'WHITE' : 'BLACK';
      setOmokTurn(nextTurn);
      aiMove(newBoard, nextTurn, omokDifficulty);
    }
  };

  // Game Logic Refs
  const board = useRef<number[][]>(Array.from({ length: T_ROWS }, () => Array(T_COLS).fill(0)));
  const piece = useRef<{ pos: { x: number, y: number }, shape: number[][], color: number }>({
    pos: { x: 3, y: 0 },
    shape: [],
    color: 0
  });
  const nextPiece = useRef<{ shape: number[][], color: number }>({
    shape: [],
    color: 0
  });
  const dropCounter = useRef(0);
  const dropInterval = useRef(1000);
  const lastTime = useRef(0);
  const clearingRows = useRef<{ y: number, time: number }[]>([]);

  // Tetris Touch Controls Refs
  const touchStartPos = useRef<{ x: number, y: number } | null>(null);
  const currentTouchPos = useRef<{ x: number, y: number } | null>(null);
  const touchStartTime = useRef<number>(0);
  const lastMovePos = useRef<{ x: number, y: number } | null>(null);
  const isDragging = useRef(false);
  const moveThreshold = 30; // 30px 이동 시 한 칸 이동

  const toggleFull = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        // 전체화면 진입 후 현재 뷰에 맞는 방향으로 잠금
        if (view === '테트리스' || view === '로또') {
          lockOrientation('portrait');
        } else {
          lockOrientation('landscape');
        }
      } catch (err: any) {
        console.warn(`Fullscreen request failed: ${err.message}`);
      }
    } else {
      if (document.exitFullscreen) {
        try {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
          await document.exitFullscreen();
        } catch (err: any) {
          console.warn(`Fullscreen exit failed: ${err.message}`);
        }
      }
    }
  };

  // View 변경 시 자동 방향 전환 (항상 적용)
  useEffect(() => {
    if (['오목', '오델로', '장기', '체스', 'MAIN'].includes(view)) {
      lockOrientation('landscape');
    } else if (view === '테트리스' || view === '로또') {
      lockOrientation('portrait');
    }
  }, [view]);

  const startLotto = () => {
    setIsLottoLoading(true);
    setLottoSets([]);
    setTimeout(() => {
      const sets: number[][] = [];
      for (let i = 0; i < 5; i++) {
        const set = [...FREQUENT_NUMBERS]
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)
          .sort((a, b) => a - b);
        sets.push(set);
      }
      setLottoSets(sets);
      setIsLottoLoading(false);
    }, 1500);
  };

  const collide = useCallback((b: number[][], p: { pos: { x: number, y: number }, shape: number[][], color: number }) => {
    const [m, o] = [p.shape, p.pos];
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0 && (b[y + o.y] && b[y + o.y][x + o.x]) !== 0) {
          return true;
        }
      }
    }
    return false;
  }, []);

  const resetPiece = useCallback(() => {
    if (nextPiece.current.color === 0) {
      nextPiece.current = {
        shape: T_SHAPES[Math.floor(Math.random() * (T_SHAPES.length - 1)) + 1],
        color: Math.floor(Math.random() * (T_SHAPES.length - 1)) + 1
      };
    }
    piece.current = {
      pos: { x: 3, y: 0 },
      shape: nextPiece.current.shape,
      color: nextPiece.current.color
    };
    nextPiece.current = {
      shape: T_SHAPES[Math.floor(Math.random() * (T_SHAPES.length - 1)) + 1],
      color: Math.floor(Math.random() * (T_SHAPES.length - 1)) + 1
    };

    if (collide(board.current, piece.current)) {
      setIsGameOver(true);
    }
  }, [collide]);

  const merge = useCallback((b: number[][], p: { pos: { x: number, y: number }, shape: number[][], color: number }) => {
    p.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          b[y + p.pos.y][x + p.pos.x] = value;
        }
      });
    });
  }, []);

  const arenaSweep = useCallback(() => {
    let rowCount = 1;
    const rowsToClear: number[] = [];

    outer: for (let y = board.current.length - 1; y > 0; --y) {
      for (let x = 0; x < board.current[y].length; ++x) {
        if (board.current[y][x] === 0) {
          continue outer;
        }
      }
      rowsToClear.push(y);
    }

    if (rowsToClear.length > 0) {
      rowsToClear.forEach(y => {
        clearingRows.current.push({ y, time: Date.now() });
      });

      setTimeout(() => {
        rowsToClear.sort((a, b) => a - b).forEach(y => {
          const row = board.current.splice(y, 1)[0].fill(0);
          board.current.unshift(row);
          setScore(s => s + rowCount * 100);
          rowCount *= 2;
        });
        clearingRows.current = [];
      }, 200)
    }
  }, []);

  const rotate = useCallback((matrix: number[][], dir: number) => {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
  }, []);

  const playerDrop = useCallback(() => {
    if (clearingRows.current.length > 0) return;
    piece.current.pos.y++;
    if (collide(board.current, piece.current)) {
      piece.current.pos.y--;
      merge(board.current, piece.current);
      resetPiece();
      arenaSweep();
    }
    dropCounter.current = 0;
  }, [collide, merge, resetPiece, arenaSweep]);

  const playerMove = useCallback((dir: number) => {
    if (clearingRows.current.length > 0) return;
    piece.current.pos.x += dir;
    if (collide(board.current, piece.current)) {
      piece.current.pos.x -= dir;
    }
  }, [collide]);

  const playerRotate = useCallback((dir: number) => {
    if (clearingRows.current.length > 0) return;
    const pos = piece.current.pos.x;
    let offset = 1;
    rotate(piece.current.shape, dir);
    while (collide(board.current, piece.current)) {
      piece.current.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > piece.current.shape[0].length) {
        rotate(piece.current.shape, -dir);
        piece.current.pos.x = pos;
        return;
      }
    }
  }, [collide, rotate]);

  const playerHardDrop = useCallback(() => {
    if (clearingRows.current.length > 0) return;
    let count = 0;
    const maxCount = T_ROWS;
    if (collide(board.current, piece.current)) return;
    while (!collide(board.current, piece.current) && count < maxCount) {
      piece.current.pos.y++;
      count++;
    }
    if (count > 0) {
      piece.current.pos.y--;
    }
    merge(board.current, piece.current);
    resetPiece();
    arenaSweep();
  }, [collide, merge, resetPiece, arenaSweep]);

  // 귀여운 블록 그리기 함수
  const drawBlock = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, colorIndex: number, size: number, isClearing: boolean = false) => {
    const color = T_COLORS[colorIndex] || '#000';
    const padding = 1;
    const radius = 6;
    const bx = x * size + padding;
    const by = y * size + padding;
    const bs = size - padding * 2;

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.moveTo(bx + radius, by);
    ctx.lineTo(bx + bs - radius, by);
    ctx.quadraticCurveTo(bx + bs, by, bx + bs, by + radius);
    ctx.lineTo(bx + bs, by + bs - radius);
    ctx.quadraticCurveTo(bx + bs, by + bs, bx + bs - radius, by + bs);
    ctx.lineTo(bx + radius, by + bs);
    ctx.quadraticCurveTo(bx, by + bs, bx, by + bs - radius);
    ctx.lineTo(bx, by + radius);
    ctx.quadraticCurveTo(bx, by, bx + radius, by);
    ctx.closePath();

    if (isClearing) {
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = color;
    }
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (!isClearing) {
      ctx.beginPath();
      ctx.ellipse(bx + bs * 0.3, by + bs * 0.3, bs * 0.15, bs * 0.1, Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    }
    ctx.restore();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#F3E5AB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(230, 210, 181, 0.5)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= T_COLS; i++) {
      ctx.beginPath(); ctx.moveTo(i * T_SIZE, 0); ctx.lineTo(i * T_SIZE, canvas.height); ctx.stroke();
    }
    for (let i = 0; i <= T_ROWS; i++) {
      ctx.beginPath(); ctx.moveTo(0, i * T_SIZE); ctx.lineTo(canvas.width, i * T_SIZE); ctx.stroke();
    }

    board.current.forEach((row, y) => {
      const isRowClearing = clearingRows.current.some(cr => cr.y === y);
      row.forEach((value, x) => {
        if (value !== 0) {
          drawBlock(ctx, x, y, value, T_SIZE, isRowClearing);
        }
      });
    });

    piece.current.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          drawBlock(ctx, x + piece.current.pos.x, y + piece.current.pos.y, piece.current.color, T_SIZE);
        }
      });
    });

    const nextCanvas = nextCanvasRef.current;
    if (nextCanvas) {
      const nCtx = nextCanvas.getContext('2d');
      if (nCtx) {
        nCtx.fillStyle = '#fff';
        nCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

        const shape = nextPiece.current.shape;
        const blockSize = 18; // Slightly smaller to ensure no cutoff
        const offsetX = (nextCanvas.width - shape[0].length * blockSize) / 2 / blockSize;
        const offsetY = (nextCanvas.height - shape.length * blockSize) / 2 / blockSize;

        shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value !== 0) {
              drawBlock(nCtx, x + offsetX, y + offsetY, nextPiece.current.color, blockSize);
            }
          });
        });
      }
    }
  }, [drawBlock]);

  useEffect(() => {
    if (view !== '테트리스') return;

    // 초기화
    if (!isGameOver) {
      board.current = Array.from({ length: T_ROWS }, () => Array(T_COLS).fill(0));
      setScore(0);
      setLevel(1);
      dropInterval.current = 1000;
      lastTime.current = 0;
      dropCounter.current = 0;
      resetPiece();
    }

    let requestId: number;
    const update = (time = 0) => {
      if (isGameOver) {
        draw();
        return;
      }

      const deltaTime = time - lastTime.current;
      lastTime.current = time;
      dropCounter.current += deltaTime;

      if (dropCounter.current > dropInterval.current) {
        playerDrop();
      }

      draw();
      requestId = requestAnimationFrame(update);
    };

    requestId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestId);
  }, [view, isGameOver, draw, playerDrop, resetPiece]);

  useEffect(() => {
    const newLevel = Math.floor(score / 1000) + 1;
    if (newLevel !== level) {
      setLevel(newLevel);
      // 레벨업 시 속도 증가 (기존 1000ms에서 레벨당 15%씩 감소, 최소 50ms)
      dropInterval.current = Math.max(50, Math.floor(1000 * Math.pow(0.85, newLevel - 1)));

      // 레벨업 애니메이션 표시
      if (newLevel > 1) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 2000);
      }
    }
  }, [score, level]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (view !== '테트리스' || isGameOver || clearingRows.current.length > 0) return;

      // 스페이스바 및 방향키의 기본 브라우저 동작(스크롤 등) 방지
      if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
      }

      if (e.keyCode === 37) playerMove(-1);
      else if (e.keyCode === 39) playerMove(1);
      else if (e.keyCode === 40) playerDrop();
      else if (e.keyCode === 38) playerRotate(1);
      else if (e.keyCode === 32) {
        playerHardDrop();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [view, isGameOver, playerMove, playerDrop, playerRotate, playerHardDrop]);

  // Tetris Touch Event Handlers
  const handleTetrisTouchStart = (e: React.TouchEvent) => {
    if (view !== '테트리스' || isGameOver) return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    lastMovePos.current = { x: touch.clientX, y: touch.clientY };
    touchStartTime.current = Date.now();
    isDragging.current = false;
  };

  const handleTetrisTouchMove = (e: React.TouchEvent) => {
    if (view !== '테트리스' || isGameOver || !touchStartPos.current || !lastMovePos.current) return;

    // 기본 터치 동작(스크롤 등) 방지
    if (e.cancelable) e.preventDefault();

    const touch = e.touches[0];
    const dx = touch.clientX - lastMovePos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;

    // 가로 이동 (연속 드래그)
    if (Math.abs(dx) > moveThreshold) {
      const steps = Math.sign(dx) * Math.floor(Math.abs(dx) / moveThreshold);
      if (steps !== 0) {
        playerMove(steps);
        lastMovePos.current = { x: touch.clientX, y: touch.clientY };
        isDragging.current = true;
      }
    }

    // 세로 이동 (아래로 빠르게 스와이프 시 Hard Drop)
    if (dy > 150) { // 150px 이상 아래로 내리면 즉시 낙하
      playerHardDrop();
      touchStartPos.current = null; // 중복 발동 방지
      isDragging.current = true;
    }
  };

  const handleTetrisTouchEnd = (e: React.TouchEvent) => {
    if (view !== '테트리스' || isGameOver || !touchStartPos.current) return;

    const duration = Date.now() - touchStartTime.current;

    // 단순 터치(탭) 시 회전 (충분히 짧고 이동이 적을 때)
    if (!isDragging.current && duration < 250) {
      playerRotate(1);
    }

    touchStartPos.current = null;
    lastMovePos.current = null;
    isDragging.current = false;
  };


  if (!isDomainValid) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-black text-red-500 mb-4">접근 제한됨</h1>
          <p className="text-zinc-500 font-bold">이 웹사이트의 구성 요소를 무단으로 사용할 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-orange-50 to-pink-100 font-sans text-zinc-700 flex flex-col items-center">
      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={(e) => {
            toggleFull();
            (e.currentTarget as HTMLButtonElement).blur();
          }}
          onFocus={(e) => e.currentTarget.blur()}
          tabIndex={-1}
          className="bg-white/90 backdrop-blur border-2 border-[#FFB6C1] rounded-full px-5 py-2 flex items-center gap-2 font-bold text-[#D147A3] hover:bg-[#FFB6C1] hover:text-white transition-all shadow-md focus:outline-none"
        >
          <Maximize className="w-4 h-4" />
          전체화면
        </button>
        <button
          onClick={handleShare}
          className="bg-white/90 backdrop-blur border-2 border-[#FFB6C1] rounded-full p-2.5 flex items-center justify-center text-[#D147A3] hover:bg-[#FFB6C1] hover:text-white transition-all shadow-md focus:outline-none"
          title="공유하기"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main View */}
      <AnimatePresence mode="wait">
        {view === 'MAIN' && (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center text-center mt-10"
          >
            <h1 className="text-4xl font-black text-pink-500 mb-2 drop-shadow-sm">🐰 큐트 게임 월드 🐹</h1>
            <p className="text-zinc-400 font-medium mb-8">귀여운 게임들이 당신을 기다려요!</p>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 w-full max-w-md pb-20">
              {[
                { name: '오목', icon: '⚪', color: 'bg-white' },
                { name: '오델로', icon: '⚫', color: 'bg-zinc-100' },
                { name: '장기', icon: '🐘', color: 'bg-orange-50' },
                { name: '체스', icon: '🐴', color: 'bg-blue-50' },
                { name: '테트리스', icon: '🧱', color: 'bg-pink-50' },
                { name: '로또', icon: '🍀', color: 'bg-green-50' },
              ].map((game) => (
                <button
                  key={game.name}
                  onClick={() => {
                    if (game.name === '로또') {
                      startLotto();
                      changeView('로또');
                    } else if (game.name === '오목') {
                      setShowOmokSetup(true);
                    } else if (game.name === '장기') {
                      setShowJanggiSetup(true);
                    } else if (game.name === '체스') {
                      setShowChessSetup(true);
                    } else if (game.name === '오델로') {
                      setShowOthelloSetup(true);
                    } else {
                      changeView(game.name as GameType);
                    }
                  }}
                  className={`${game.color} flex flex-col items-center justify-center p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-pink-200/20 border-2 border-white hover:scale-105 hover:rotate-2 transition-all group w-full`}
                >
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">{game.icon}</div>
                  <div className="font-black text-pink-500 text-sm sm:text-lg whitespace-nowrap">{game.name === '테트리스' ? '젤리 테트리스' : game.name === '로또' ? '행운의 로또' : game.name}</div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {view === '테트리스' && (
          <motion.div
            key="tetris"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-start w-full min-h-screen relative px-4 py-4"
          >
            <div className="flex items-center gap-4 mb-4 justify-center">
              <button
                onClick={(e) => {
                  changeView('MAIN');
                  (e.currentTarget as HTMLButtonElement).blur();
                }}
                onFocus={(e) => e.currentTarget.blur()}
                tabIndex={-1}
                className="p-2.5 bg-white rounded-2xl text-pink-500 shadow-lg hover:bg-pink-50 transition-all border-2 border-pink-100 flex items-center gap-2 group focus:outline-none"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-black text-xs">홈으로</span>
              </button>
              <h2 className="text-2xl font-black text-pink-500 flex items-center gap-2">
                <span className="text-3xl">🧱</span> 젤리 테트리스
              </h2>
            </div>

            <div className="flex gap-2 mb-2 w-full max-w-[300px] justify-center font-black text-pink-500">
              <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-pink-100 text-[10px]">Lv: {level}</div>
              <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-pink-100 text-[10px]">Score: {score}</div>
              <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-pink-100 text-[10px]">Speed: {Math.floor(1000 / dropInterval.current * 10) / 10}x</div>
            </div>

            <div
              className="relative flex items-start gap-4 pb-24 sm:pb-0 touch-none"
              onTouchStart={handleTetrisTouchStart}
              onTouchMove={handleTetrisTouchMove}
              onTouchEnd={handleTetrisTouchEnd}
            >
              <canvas
                ref={canvasRef}
                width={T_COLS * T_SIZE}
                height={T_ROWS * T_SIZE}
                className="bg-[#F3E5AB] border-4 border-[#E6D2B5] rounded-2xl shadow-2xl"
              />

              <AnimatePresence>
                {showLevelUp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1.2, y: 0 }}
                    exit={{ opacity: 0, scale: 1.5, y: -50 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                  >
                    <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-3xl border-4 border-pink-300 shadow-2xl flex flex-col items-center">
                      <Sparkles className="w-8 h-8 text-yellow-400 mb-1 animate-pulse" />
                      <div className="text-2xl font-black text-pink-500 whitespace-nowrap">LEVEL UP!</div>
                      <div className="text-sm font-bold text-pink-400">Lv.{level}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>



              {/* Next Piece Preview & Controls */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-bold text-pink-400 uppercase tracking-widest">Next</div>
                  <canvas
                    ref={nextCanvasRef}
                    width={80}
                    height={80}
                    className="bg-white border-2 border-pink-100 rounded-xl shadow-md"
                  />
                </div>

                {/* 모바일 터치 조작 안내 (다음 블럭 창 아래) */}
                <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-2xl border-2 border-pink-100 shadow-lg flex flex-col items-start gap-1.5 min-w-[110px]">
                  <div className="flex items-center gap-1.5 text-pink-500 font-black text-[10px]">
                    <span className="bg-pink-100 px-1.5 py-0.5 rounded-md text-[9px]">탭</span>
                    <span>블럭 회전</span>
                  </div>
                  <div className="w-full h-[1px] bg-pink-50" />
                  <div className="flex items-center gap-1.5 text-pink-500 font-black text-[10px]">
                    <span className="bg-pink-100 px-1.5 py-0.5 rounded-md text-[9px]">좌우</span>
                    <span>블럭 이동</span>
                  </div>
                  <div className="w-full h-[1px] bg-pink-50" />
                  <div className="flex items-center gap-1.5 text-pink-500 font-black text-[10px]">
                    <span className="bg-pink-100 px-1.5 py-0.5 rounded-md text-[9px]">↓쓸기</span>
                    <span>즉시 낙하</span>
                  </div>
                  <div className="w-full h-[1px] bg-pink-50 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-1.5 text-pink-500 font-black text-[10px]">
                    <span className="bg-pink-100 px-1.5 py-0.5 rounded-md text-[9px]">방향키</span>
                    <span>이동/회전</span>
                  </div>
                  <div className="w-full h-[1px] bg-pink-50 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-1.5 text-pink-500 font-black text-[10px]">
                    <span className="bg-pink-100 px-1.5 py-0.5 rounded-md text-[9px]">스페이스</span>
                    <span>즉시낙하</span>
                  </div>
                </div>
              </div>

              {isGameOver && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-xl flex flex-col items-center justify-center text-white p-6 text-center z-10 border-4 border-pink-200/30">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                  >
                    <Trophy className="w-20 h-20 text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                  </motion.div>
                  <h3 className="text-3xl font-black mb-1 text-pink-300">GAME OVER</h3>
                  <p className="mb-8 text-xl font-bold text-white/90">최종 점수: {score}</p>

                  <div className="flex flex-col gap-3 w-full max-w-[200px]">
                    <button
                      onClick={(e) => {
                        board.current = Array.from({ length: T_ROWS }, () => Array(T_COLS).fill(0));
                        setScore(0);
                        setIsGameOver(false);
                        resetPiece();
                        (e.currentTarget as HTMLButtonElement).blur();
                      }}
                      onFocus={(e) => e.currentTarget.blur()}
                      tabIndex={-1}
                      className="bg-pink-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-pink-600 transition-all shadow-lg flex items-center justify-center gap-2 focus:outline-none"
                    >
                      <RefreshCw className="w-5 h-5" />
                      다시 하기
                    </button>
                    <button
                      onClick={(e) => {
                        changeView('MAIN');
                        (e.currentTarget as HTMLButtonElement).blur();
                      }}
                      onFocus={(e) => e.currentTarget.blur()}
                      tabIndex={-1}
                      className="bg-white/10 text-white border border-white/30 px-6 py-3 rounded-2xl font-black hover:bg-white/20 transition-all flex items-center justify-center gap-2 focus:outline-none"
                    >
                      <LogOut className="w-5 h-5" />
                      메뉴로 나가기
                    </button>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}

        {view === '장기' && (
          <motion.div
            key="janggi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-start w-full min-h-screen overflow-x-auto relative px-4 py-4"
          >
            <div className="flex items-center gap-4 mb-4 justify-center">
              <button
                onClick={(e) => {
                  changeView('MAIN');
                  (e.currentTarget as HTMLButtonElement).blur();
                }}
                onFocus={(e) => e.currentTarget.blur()}
                tabIndex={-1}
                className="p-2.5 bg-white rounded-2xl text-blue-500 shadow-lg hover:bg-blue-50 transition-all border-2 border-blue-100 flex items-center gap-2 group focus:outline-none"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-black text-xs">홈으로</span>
              </button>
              <h2 className="text-2xl font-black text-blue-500 flex items-center gap-2">
                <span className="text-3xl">🐘</span> 큐트 장기
              </h2>
            </div>

            <div className="flex gap-4 w-full max-w-[800px] justify-center items-start">
              {/* Captured Pieces Left */}
              <div className="hidden lg:flex flex-col gap-2 p-4 bg-white/50 backdrop-blur rounded-3xl border-2 border-blue-100 min-w-[100px]">
                <div className="text-[10px] font-bold text-blue-400 uppercase text-center">Captured (Han)</div>
                <div className="grid grid-cols-2 gap-1">
                  {capturedHan.map((p, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-500 text-xs font-bold">
                      {p === 'CHA' ? '車' : p === 'PO' ? '包' : p === 'MA' ? '馬' : p === 'SANG' ? '象' : p === 'SA' ? '士' : p === 'JOL' ? '卒' : '兵'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Board */}
              <div className="relative">
                <div className="bg-[#E6D2B5] p-6 rounded-2xl shadow-2xl border-[12px] border-[#C19A6B] ring-4 ring-[#8B4513]/10">
                  <div className="relative" style={{ width: '400px', height: '450px' }}>
                    {/* Grid Lines */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Horizontal Lines */}
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={`h-${i}`} className="absolute w-full h-[2px] bg-[#8B4513]/25" style={{ top: `${i * 50}px` }} />
                      ))}
                      {/* Vertical Lines */}
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={`v-${i}`} className="absolute h-full w-[2px] bg-[#8B4513]/25" style={{ left: `${i * 50}px` }} />
                      ))}
                      {/* Palace Diagonals */}
                      <svg className="absolute inset-0 w-full h-full">
                        <line x1="150" y1="0" x2="250" y2="100" stroke="rgba(139,69,19,0.25)" strokeWidth="2" />
                        <line x1="250" y1="0" x2="150" y2="100" stroke="rgba(139,69,19,0.25)" strokeWidth="2" />
                        <line x1="150" y1="350" x2="250" y2="450" stroke="rgba(139,69,19,0.25)" strokeWidth="2" />
                        <line x1="250" y1="350" x2="150" y2="450" stroke="rgba(139,69,19,0.25)" strokeWidth="2" />
                      </svg>
                    </div>

                    {/* Pieces */}
                    {janggiBoard.map((row, r) => row.map((piece, c) => (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => handleJanggiClick(r, c)}
                        className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center z-10"
                        style={{ left: `${c * 50}px`, top: `${r * 50}px` }}
                      >
                        {piece && (
                          <motion.div
                            layoutId={`${piece.side}-${piece.type}-${r}-${c}`}
                            className={`rounded-full border-2 flex items-center justify-center font-black shadow-lg transition-transform ${piece.side === 'CHO'
                              ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-400 text-blue-700'
                              : 'bg-gradient-to-br from-red-50 to-red-100 border-red-400 text-red-700'
                              } ${selectedPos?.r === r && selectedPos?.c === c ? 'ring-4 ring-yellow-400 scale-110 z-20' : ''} ${piece.type === 'KUNG' ? 'w-[52px] h-[52px] text-3xl border-4' :
                                ['CHA', 'PO', 'MA', 'SANG'].includes(piece.type) ? 'w-[46px] h-[46px] text-2xl border-3' :
                                  'w-[38px] h-[38px] text-xl'
                              }`}
                          >
                            <span className="drop-shadow-sm">
                              {piece.type === 'KUNG' ? (piece.side === 'CHO' ? '楚' : '漢') :
                                piece.type === 'CHA' ? '車' :
                                  piece.type === 'PO' ? '包' :
                                    piece.type === 'MA' ? '馬' :
                                      piece.type === 'SANG' ? '象' :
                                        piece.type === 'SA' ? '士' :
                                          piece.side === 'CHO' ? '卒' : '兵'}
                            </span>
                          </motion.div>
                        )}
                        {/* Valid Move Shadow */}
                        {validMoves.some(m => m.r === r && m.c === c) && (
                          <div className="w-10 h-10 rounded-full bg-yellow-400/20 border-2 border-yellow-400/40 flex items-center justify-center opacity-70 animate-pulse">
                            {selectedPos && janggiBoard[selectedPos.r][selectedPos.c] && (
                              <div className={`rounded-full border flex items-center justify-center font-black opacity-30 ${janggiBoard[selectedPos.r][selectedPos.c]?.side === 'CHO' ? 'bg-blue-200 border-blue-400 text-blue-600' : 'bg-red-200 border-red-400 text-red-600'
                                } ${janggiBoard[selectedPos.r][selectedPos.c]?.type === 'KUNG' ? 'w-10 h-10 text-2xl' :
                                  ['CHA', 'PO', 'MA', 'SANG'].includes(janggiBoard[selectedPos.r][selectedPos.c]?.type || '') ? 'w-9 h-9 text-xl' :
                                    'w-7 h-7 text-lg'
                                }`}>
                                {janggiBoard[selectedPos.r][selectedPos.c]?.type === 'KUNG' ? (janggiBoard[selectedPos.r][selectedPos.c]?.side === 'CHO' ? '楚' : '漢') :
                                  janggiBoard[selectedPos.r][selectedPos.c]?.type === 'CHA' ? '車' :
                                    janggiBoard[selectedPos.r][selectedPos.c]?.type === 'PO' ? '包' :
                                      janggiBoard[selectedPos.r][selectedPos.c]?.type === 'MA' ? '馬' :
                                        janggiBoard[selectedPos.r][selectedPos.c]?.type === 'SANG' ? '象' :
                                          janggiBoard[selectedPos.r][selectedPos.c]?.type === 'SA' ? '士' :
                                            janggiBoard[selectedPos.r][selectedPos.c]?.side === 'CHO' ? '卒' : '兵'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )))}
                  </div>
                </div>

                {/* Status Overlays */}
                <AnimatePresence>
                  {janggiStatus !== 'NORMAL' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                    >
                      <div className={`px-8 py-4 rounded-full border-4 shadow-2xl flex items-center gap-3 ${janggiStatus === 'JANGGUN' ? 'bg-red-500 border-red-200 text-white' : 'bg-green-500 border-green-200 text-white'}`}>
                        {janggiStatus === 'JANGGUN' ? <Sword className="w-8 h-8 animate-bounce" /> : <Shield className="w-8 h-8 animate-pulse" />}
                        <span className="text-4xl font-black italic tracking-tighter drop-shadow-lg">
                          {janggiStatus === 'JANGGUN' ? '장군!!!' : '멍군!!!'}
                        </span>
                        <Sparkles className="w-6 h-6 text-yellow-300" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Game Over Overlay */}
                {janggiWinner && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-md rounded-xl flex flex-col items-center justify-center text-white p-6 text-center z-[60] border-4 border-blue-200/30">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      <Trophy className="w-20 h-20 text-yellow-400 mb-4" />
                    </motion.div>
                    <h3 className="text-3xl font-black mb-1 text-blue-300">{janggiWinner === 'CHO' ? '초(Blue)' : '한(Red)'} 승리!</h3>
                    <p className="mb-8 text-xl font-bold text-white/90">축하합니다!</p>
                    <div className="flex flex-col gap-3 w-full max-w-[200px]">
                      <button
                        onClick={() => initJanggi(janggiDifficulty, playerSide, janggiSetup)}
                        className="bg-blue-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" /> 다시 하기
                      </button>
                      <button
                        onClick={() => changeView('MAIN')}
                        className="bg-white/10 text-white border border-white/30 px-6 py-3 rounded-2xl font-black hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-5 h-5" /> 메뉴로 나가기
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Captured Pieces Right */}
              <div className="hidden lg:flex flex-col gap-2 p-4 bg-white/50 backdrop-blur rounded-3xl border-2 border-blue-100 min-w-[100px]">
                <div className="text-[10px] font-bold text-blue-400 uppercase text-center">Captured (Cho)</div>
                <div className="grid grid-cols-2 gap-1">
                  {capturedCho.map((p, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-500 text-xs font-bold">
                      {p === 'CHA' ? '車' : p === 'PO' ? '包' : p === 'MA' ? '馬' : p === 'SANG' ? '象' : p === 'SA' ? '士' : p === 'JOL' ? '卒' : '兵'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="flex gap-4 mt-6 w-full max-w-[400px]">
              <button
                onClick={undoJanggiMove}
                disabled={isJanggiAiThinking || janggiHistory.length === 0 || !!janggiWinner}
                className="flex-1 py-4 rounded-2xl bg-white border-2 border-zinc-200 text-zinc-600 font-black hover:bg-zinc-50 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-5 h-5" /> 무르기
              </button>
              <button
                onClick={resignJanggiGame}
                disabled={isJanggiAiThinking || !!janggiWinner}
                className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-400 font-black hover:bg-zinc-200 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Flag className="w-5 h-5" /> 기권하기
              </button>
            </div>

            {/* Status Bar */}
            <div className="mt-6 flex items-center gap-8 bg-white/80 backdrop-blur px-8 py-3 rounded-full border-2 border-blue-100 shadow-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${janggiTurn === 'CHO' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-200'}`} />
                <span className={`font-black text-sm ${janggiTurn === 'CHO' ? 'text-blue-500' : 'text-zinc-400'}`}>초(Blue) 차례</span>
              </div>
              <div className="w-[2px] h-4 bg-zinc-100" />
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${janggiTurn === 'HAN' ? 'bg-red-500 animate-pulse' : 'bg-zinc-200'}`} />
                <span className={`font-black text-sm ${janggiTurn === 'HAN' ? 'text-red-500' : 'text-zinc-400'}`}>한(Red) 차례</span>
              </div>
              {isJanggiAiThinking && (
                <>
                  <div className="w-[2px] h-4 bg-zinc-100" />
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-xs font-bold text-blue-400">AI 생각 중...</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {view === '체스' && (
          <motion.div
            key="chess"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-start w-full min-h-screen overflow-x-auto relative px-4 py-4"
          >
            <div className="flex items-center gap-4 mb-4 justify-center">
              <button
                onClick={(e) => {
                  changeView('MAIN');
                  (e.currentTarget as HTMLButtonElement).blur();
                }}
                onFocus={(e) => e.currentTarget.blur()}
                tabIndex={-1}
                className="p-2.5 bg-white rounded-2xl text-indigo-500 shadow-lg hover:bg-indigo-50 transition-all border-2 border-indigo-100 flex items-center gap-2 group focus:outline-none"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-black text-xs">홈으로</span>
              </button>
              <h2 className="text-2xl font-black text-indigo-500 flex items-center gap-2">
                <span className="text-3xl">♟️</span> 큐트 체스
              </h2>
            </div>

            <div className="flex gap-4 w-full max-w-[800px] justify-center items-start">
              {/* Captured Pieces Left */}
              <div className="hidden lg:flex flex-col gap-2 p-4 bg-white/50 backdrop-blur rounded-3xl border-2 border-indigo-100 min-w-[100px]">
                <div className="text-[10px] font-bold text-indigo-400 uppercase text-center mb-2">Captured (Black)</div>
                <div className="grid grid-cols-2 gap-2">
                  {capturedBlack.map((p, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {p === 'PAWN' ? '♟' :
                        p === 'ROOK' ? '♜' :
                          p === 'KNIGHT' ? '♞' :
                            p === 'BISHOP' ? '♝' :
                              p === 'QUEEN' ? '♛' : '♚'}
                    </div>
                  ))}
                </div>
              </div>

              {/* Board */}
              <div className="relative">
                <div className="bg-indigo-50 p-4 rounded-2xl shadow-2xl border-[12px] border-indigo-200 ring-4 ring-indigo-500/10">
                  <div className="grid grid-cols-8 border-2 border-indigo-300">
                    {chessBoard.map((row, r) => row.map((piece, c) => {
                      const isDark = (r + c) % 2 === 1;
                      const isValid = chessValidMoves.some(m => m.r === r && m.c === c);
                      const isSelected = chessSelectedPos?.r === r && chessSelectedPos?.c === c;

                      return (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => handleChessClick(r, c)}
                          className={`w-12 h-12 flex items-center justify-center cursor-pointer relative transition-colors ${isDark ? 'bg-indigo-200/50' : 'bg-white'
                            } ${isSelected ? 'bg-yellow-200 ring-4 ring-yellow-400 z-20' : ''} hover:bg-indigo-300/50`}
                        >
                          {piece && (
                            <motion.div
                              layoutId={`chess-${piece.side}-${piece.type}-${r}-${c}`}
                              className={`relative flex items-center justify-center z-10 transition-transform ${isSelected ? 'scale-110' : 'hover:scale-105'
                                }`}
                            >
                              {/* Piece Base Shadow/Glow */}
                              <div className={`absolute inset-0 rounded-full blur-[2px] opacity-20 ${piece.side === 'WHITE' ? 'bg-black' : 'bg-white'
                                }`} />

                              {/* Piece Body */}
                              <div className={`
                                flex items-center justify-center rounded-full shadow-md border-2
                                ${piece.type === 'KING' || piece.type === 'QUEEN' ? 'w-10 h-10 text-3xl' : 'w-9 h-9 text-2xl'}
                                ${piece.side === 'WHITE'
                                  ? 'bg-gradient-to-br from-white via-zinc-50 to-zinc-200 border-white text-zinc-800 shadow-[0_2px_10px_rgba(255,255,255,0.8)]'
                                  : 'bg-gradient-to-br from-[#2D2D2D] via-[#1A1A1A] to-black border-zinc-800 text-white shadow-[0_2px_10px_rgba(0,0,0,0.5)]'
                                }
                                ${piece.type === 'KING' ? 'ring-2 ring-yellow-400/50' : ''}
                              `}>
                                <span className={`drop-shadow-sm select-none ${piece.side === 'BLACK' ? 'text-indigo-200' : 'text-zinc-800'}`}>
                                  {piece.type === 'PAWN' ? '♟' :
                                    piece.type === 'ROOK' ? '♜' :
                                      piece.type === 'KNIGHT' ? '♞' :
                                        piece.type === 'BISHOP' ? '♝' :
                                          piece.type === 'QUEEN' ? '♛' : '♚'}
                                </span>
                              </div>

                              {/* Importance Indicator for King/Queen */}
                              {(piece.type === 'KING' || piece.type === 'QUEEN') && (
                                <div className="absolute -top-1 -right-1">
                                  <Sparkles className={`w-3 h-3 ${piece.side === 'WHITE' ? 'text-yellow-500' : 'text-yellow-300'} animate-pulse`} />
                                </div>
                              )}
                            </motion.div>
                          )}
                          {isValid && (
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                              <div className={`w-4 h-4 rounded-full border-2 ${piece ? 'bg-red-400/40 border-red-500/60' : 'bg-indigo-400/30 border-indigo-500/40'
                                } animate-pulse`} />
                            </div>
                          )}
                        </div>
                      );
                    }))}
                  </div>
                </div>

                {/* Chess Status Overlays */}
                <AnimatePresence>
                  {(chessCheckStatus.WHITE || chessCheckStatus.BLACK) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.5, y: -20 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                    >
                      <div className="px-10 py-5 rounded-full border-4 shadow-2xl flex items-center gap-4 bg-gradient-to-r from-red-600 to-red-500 border-red-200 text-white">
                        <Sword className="w-10 h-10 animate-bounce text-yellow-300" />
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black opacity-80 tracking-widest uppercase">Check</span>
                          <span className="text-5xl font-black italic tracking-tighter drop-shadow-xl">장군!!!</span>
                        </div>
                        <Sparkles className="w-8 h-8 text-yellow-300 animate-spin-slow" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Game Over Overlay */}
                {chessWinner && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-xl flex flex-col items-center justify-center text-white p-6 text-center z-[60] border-4 border-indigo-500/30 overflow-hidden">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: -50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="mb-6 relative"
                    >
                      <Trophy className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 border-2 border-dashed border-yellow-400/30 rounded-full"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">
                        {chessGameResultType === 'CHECKMATE' ? 'CHECKMATE' :
                          chessGameResultType === 'STALEMATE' ? 'STALEMATE' : 'RESIGNED'}
                      </div>
                      <h3 className="text-5xl font-black mb-2 text-white drop-shadow-lg">
                        {chessWinner === 'DRAW' ? '무승부!' : `${chessWinner === 'WHITE' ? '백(White)' : '흑(Black)'} 승리!`}
                      </h3>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mb-10 text-xl font-bold text-indigo-200"
                    >
                      {chessWinner === 'DRAW' ? '치열한 접전이었습니다!' :
                        chessWinner === playerChessSide ? '완벽한 승리입니다! 축하해요!' : '아쉽네요, 다음엔 이길 수 있을 거예요!'}
                    </motion.p>
                    <div className="flex flex-col gap-3 w-full max-w-[200px]">
                      <button
                        onClick={() => initChess(chessDifficulty, playerChessSide)}
                        className="bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-lg flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" /> 다시 하기
                      </button>
                      <button
                        onClick={() => changeView('MAIN')}
                        className="bg-white/10 text-white border border-white/30 px-6 py-3 rounded-2xl font-black hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-5 h-5" /> 메뉴로 나가기
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Captured Pieces Right */}
              <div className="hidden lg:flex flex-col gap-2 p-4 bg-white/50 backdrop-blur rounded-3xl border-2 border-indigo-100 min-w-[100px]">
                <div className="text-[10px] font-bold text-indigo-400 uppercase text-center mb-2">Captured (White)</div>
                <div className="grid grid-cols-2 gap-2">
                  {capturedWhite.map((p, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-800 text-xs font-bold shadow-sm">
                      {p === 'PAWN' ? '♟' :
                        p === 'ROOK' ? '♜' :
                          p === 'KNIGHT' ? '♞' :
                            p === 'BISHOP' ? '♝' :
                              p === 'QUEEN' ? '♛' : '♚'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="flex gap-4 mt-6 w-full max-w-[400px]">
              <button
                onClick={undoChessMove}
                disabled={isChessAiThinking || chessHistory.length === 0 || !!chessWinner}
                className="flex-1 py-4 rounded-2xl bg-white border-2 border-zinc-200 text-zinc-600 font-black hover:bg-zinc-50 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-5 h-5" /> 무르기
              </button>
              <button
                onClick={resignChessGame}
                disabled={isChessAiThinking || !!chessWinner}
                className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-400 font-black hover:bg-zinc-200 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Flag className="w-5 h-5" /> 기권하기
              </button>
            </div>

            {/* Status Bar */}
            <div className="mt-6 flex items-center gap-8 bg-white/80 backdrop-blur px-8 py-3 rounded-full border-2 border-indigo-100 shadow-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${chessTurn === 'WHITE' ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-200'}`} />
                <span className={`font-black text-sm ${chessTurn === 'WHITE' ? 'text-indigo-600' : 'text-zinc-400'}`}>백(White) 차례</span>
              </div>
              <div className="w-[2px] h-4 bg-zinc-100" />
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${chessTurn === 'BLACK' ? 'bg-zinc-900 animate-pulse' : 'bg-zinc-200'}`} />
                <span className={`font-black text-sm ${chessTurn === 'BLACK' ? 'text-zinc-800' : 'text-zinc-400'}`}>흑(Black) 차례</span>
              </div>
              {isChessAiThinking && (
                <>
                  <div className="w-[2px] h-4 bg-zinc-100" />
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="text-xs font-bold text-indigo-400">AI 생각 중...</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {view === '로또' && (
          <motion.div
            key="lotto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
          >
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-300 via-blue-300 to-pink-300" />

              <h3 className="text-2xl font-black text-zinc-800 mb-6 flex items-center justify-center gap-2 px-4 leading-tight break-keep">
                <Sparkles className="w-6 h-6 text-yellow-400 shrink-0" />
                <span>행운의 로또 {isMobile() ? '' : '(5세트)'}</span>
              </h3>

              <div className="min-h-[300px] flex flex-col items-center justify-center gap-4">
                {isLottoLoading ? (
                  <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-12 h-12 text-pink-400 animate-spin" />
                    <p className="text-zinc-400 font-bold animate-pulse">최다 당첨 데이터 분석 중...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 w-full">
                    {lottoSets.map((set, setIdx) => (
                      <motion.div
                        key={setIdx}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: setIdx * 0.1 }}
                        className="flex justify-between items-center bg-zinc-50 p-3 rounded-2xl border border-zinc-100"
                      >
                        <span className="text-xs font-black text-zinc-300 mr-2">{setIdx + 1}</span>
                        <div className="flex gap-1.5 justify-center flex-1">
                          {set.map((num, i) => (
                            <div
                              key={i}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm
                                ${num <= 10 ? 'bg-yellow-400' : num <= 20 ? 'bg-blue-400' : num <= 30 ? 'bg-red-400' : num <= 40 ? 'bg-zinc-400' : 'bg-green-400'}`}
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={startLotto}
                  disabled={isLottoLoading}
                  className="w-full bg-pink-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-pink-600 transition-all shadow-lg shadow-pink-200 disabled:opacity-50"
                >
                  새로운 조합 생성
                </button>
                <button
                  onClick={() => changeView('MAIN')}
                  className="w-full bg-zinc-100 text-zinc-400 py-3 rounded-2xl font-black hover:bg-zinc-200 transition-all"
                >
                  메뉴로 돌아가기
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {view === '오목' && (
          <motion.div
            key="omok"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center w-full min-h-screen overflow-x-auto mx-auto p-4"
          >
            <div className="w-full flex justify-between items-center mb-8 px-2 max-w-md mx-auto">
              <div className="flex items-center gap-2 bg-[#D1D1D1] px-4 py-1.5 rounded-full shadow-inner border border-zinc-300">
                <div className={`w-2.5 h-2.5 rounded-full ${omokTurn === 'BLACK' ? 'bg-black' : 'bg-white border border-zinc-400'} ${!omokWinner ? 'animate-pulse' : ''}`} />
                <span className="font-bold text-xs text-zinc-600">
                  {omokWinner ? '게임 종료' : (omokTurn === playerColor ? '내 차례' : '컴퓨터 생각 중...')}
                </span>
              </div>
              <div className="px-5 py-1.5 bg-gradient-to-r from-[#FF69B4] to-[#FF1493] text-white rounded-full text-xs font-bold shadow-lg shadow-pink-200 border border-white/20">
                난이도: {omokDifficulty}
              </div>
            </div>

            {/* 바둑판 */}
            <div className="relative p-4 bg-[#E3C58A] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[12px] border-[#D4B47A]">
              <div
                className="relative grid bg-transparent"
                style={{
                  width: 'min(90vw, 500px)',
                  height: 'min(90vw, 500px)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(14, 1fr)',
                  gridTemplateRows: 'repeat(14, 1fr)'
                }}
              >
                {/* 배경 격자선 */}
                <div className="absolute inset-0 grid grid-cols-14 grid-rows-14 pointer-events-none p-[3.5%]">
                  {Array.from({ length: 196 }).map((_, i) => (
                    <div key={i} className="border-[0.5px] border-[#8B7355]/60" />
                  ))}
                </div>

                {/* 실제 돌 놓는 위치 (15x15 교차점) */}
                <div
                  className="absolute inset-0 grid grid-cols-15 grid-rows-15"
                  style={{
                    gridTemplateColumns: 'repeat(15, 1fr)',
                    gridTemplateRows: 'repeat(15, 1fr)'
                  }}
                >
                  {omokBoard.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => handleOmokClick(r, c)}
                        className="relative flex items-center justify-center cursor-pointer group"
                      >
                        {/* 바둑돌 */}
                        {cell !== 0 && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`w-[90%] h-[90%] rounded-full shadow-xl ${cell === 1
                              ? 'bg-gradient-to-br from-zinc-700 to-black'
                              : 'bg-gradient-to-br from-white to-zinc-200 border border-zinc-300'
                              }`}
                          />
                        )}

                        {/* 호버 미리보기 */}
                        {cell === 0 && !omokWinner && omokTurn === playerColor && (
                          <div className={`w-[75%] h-[75%] rounded-full opacity-0 group-hover:opacity-30 transition-opacity ${playerColor === 'BLACK' ? 'bg-black' : 'bg-white border border-zinc-400'
                            }`} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 w-full px-4 max-w-md mx-auto">
              <div className="bg-[#D1D1D1] p-2 rounded-[2rem] shadow-inner border border-zinc-300">
                <button
                  onClick={() => setView('MAIN')}
                  className="w-full bg-white text-[#D147A3] py-2.5 rounded-full font-bold hover:bg-pink-50 transition-all shadow-sm"
                >
                  그만하기
                </button>
              </div>
            </div>

            {/* 오목 게임 종료 모달 */}
            <AnimatePresence>
              {omokWinner && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                  <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl text-center border-4 border-pink-100"
                  >
                    <div className="text-7xl mb-6">
                      {omokWinner === playerColor ? '🏆' : '🤖'}
                    </div>
                    <h2 className="text-3xl font-black text-pink-500 mb-2">
                      {omokWinner === playerColor ? '축하합니다!' : '아쉬워요!'}
                    </h2>
                    <p className="text-zinc-400 font-bold mb-10 leading-relaxed">
                      {omokWinner === playerColor
                        ? '당신이 이겼어요! 정말 대단한 수읽기네요!'
                        : '컴퓨터가 이겼습니다. 한 판 더 도전해볼까요?'}
                    </p>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => initOmok(omokDifficulty, playerColor)}
                        className="w-full py-4 bg-pink-500 text-white font-black rounded-2xl hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
                      >
                        다시 하기
                      </button>
                      <button
                        onClick={() => changeView('MAIN')}
                        className="w-full py-4 bg-zinc-100 text-zinc-400 font-black rounded-2xl hover:bg-zinc-200 transition-all"
                      >
                        메인 메뉴로
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {view === '오델로' && (
          <motion.div
            key="othello"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-start w-full min-h-screen overflow-x-auto relative px-4 py-4"
          >
            <div className="flex items-center gap-4 mb-4 justify-center">
              <button
                onClick={(e) => {
                  changeView('MAIN');
                  (e.currentTarget as HTMLButtonElement).blur();
                }}
                onFocus={(e) => e.currentTarget.blur()}
                tabIndex={-1}
                className="p-2.5 bg-white rounded-2xl text-zinc-700 shadow-lg hover:bg-zinc-50 transition-all border-2 border-zinc-200 flex items-center gap-2 group focus:outline-none"
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-black text-xs">홈으로</span>
              </button>
              <h2 className="text-2xl font-black text-zinc-700 flex items-center gap-2">
                <span className="text-3xl">⚫</span> 오델로
              </h2>
            </div>

            <div className="flex gap-4 w-full max-w-[900px] justify-center items-start">
              {/* Stats Left */}
              <div className="hidden lg:flex flex-col gap-4 p-5 bg-white/80 backdrop-blur rounded-[2.5rem] border-2 border-zinc-200 min-w-[140px] shadow-xl">
                <div className="text-center">
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Black Score</div>
                  <div className="text-3xl font-black text-zinc-800">{othelloScores.BLACK}</div>
                </div>
                <div className="h-[2px] bg-zinc-100" />
                <div className="text-center">
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">White Score</div>
                  <div className="text-3xl font-black text-zinc-800">{othelloScores.WHITE}</div>
                </div>
                <div className="h-[2px] bg-zinc-100" />
                <div className="text-center">
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Turn</div>
                  <div className="text-xl font-black text-zinc-800">{othelloTurn === 'BLACK' ? '흑' : '백'}</div>
                </div>
              </div>

              {/* Board Container */}
              <div className="relative flex flex-col items-center gap-4">
                <div className="bg-[#2e7d32] p-4 rounded-xl shadow-2xl border-[8px] border-[#1b5e20] relative">
                  <div
                    className="grid bg-[#1b5e20] gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${O_SIZE}, 1fr)`,
                      gridTemplateRows: `repeat(${O_SIZE}, 1fr)`,
                      width: 'min(70vh, 500px)',
                      height: 'min(70vh, 500px)'
                    }}
                  >
                    {othelloBoard.map((row, r) => row.map((cell, c) => {
                      const validMoves = getValidOthelloMoves(othelloBoard, othelloTurn);
                      const isValid = validMoves.some(m => m.r === r && m.c === c);

                      return (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => handleOthelloClick(r, c)}
                          className="bg-[#2e7d32] relative flex items-center justify-center cursor-pointer hover:bg-[#388e3c] transition-colors"
                        >
                          {cell !== 0 && (
                            <motion.div
                              initial={{ scale: 0, rotateY: 180 }}
                              animate={{ scale: 0.9, rotateY: 0 }}
                              className={`w-full h-full rounded-full shadow-lg border border-black/10`}
                              style={{
                                background: cell === 1
                                  ? 'radial-gradient(circle at 30% 30%, #444 0%, #000 100%)'
                                  : 'radial-gradient(circle at 30% 30%, #fff 0%, #ccc 100%)'
                              }}
                            />
                          )}
                          {cell === 0 && isValid && othelloTurn === othelloPlayerColor && (
                            <div className="w-3 h-3 bg-black/20 rounded-full" />
                          )}
                        </div>
                      );
                    }))}
                  </div>
                </div>

                {isOthelloAiThinking && (
                  <div className="flex items-center gap-3 bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-800 shadow-xl">
                    <div className="relative flex items-center justify-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute opacity-75" />
                      <div className="w-2 h-2 bg-emerald-500 rounded-full relative" />
                    </div>
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">AI Thinking...</span>
                  </div>
                )}
              </div>
            </div>

            {othelloWinner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-[90] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
              >
                <div className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-4 border-zinc-100 text-center">
                  <h3 className="text-3xl font-black text-zinc-800 mb-2">게임 종료!</h3>
                  <p className="text-zinc-500 font-bold mb-6">
                    {othelloWinner === 'DRAW' ? '무승부입니다!' : `${othelloWinner === 'BLACK' ? '흑' : '백'}이 승리했습니다!`}
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => initOthello(othelloDifficulty, othelloPlayerColor)}
                      className="w-full py-4 bg-zinc-800 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl"
                    >
                      다시 하기
                    </button>
                    <button
                      onClick={() => changeView('MAIN')}
                      className="w-full py-4 bg-zinc-50 text-zinc-400 font-black rounded-2xl hover:bg-zinc-100 transition-all"
                    >
                      메인 메뉴로
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 바둑 설정 모달 */}
      <AnimatePresence>
        {showOthelloSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-4 border-zinc-100"
            >
              <h2 className="text-2xl font-black text-zinc-700 mb-8 text-center">오델로 대국 설정 ⚫</h2>

              <div className="space-y-8">
                <div>
                  <p className="text-xs font-black text-zinc-300 mb-3 ml-1 uppercase tracking-widest">나의 돌 색상</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setOthelloPlayerColor('BLACK')}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${othelloPlayerColor === 'BLACK'
                        ? 'bg-zinc-800 border-zinc-800 text-white shadow-xl shadow-zinc-200'
                        : 'bg-white border-zinc-100 text-zinc-300 hover:border-zinc-200'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-full shadow-lg bg-gradient-to-br from-zinc-700 to-black`} />
                      <span className="font-black">흑돌 (선수)</span>
                    </button>
                    <button
                      onClick={() => setOthelloPlayerColor('WHITE')}
                      className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${othelloPlayerColor === 'WHITE'
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-800 shadow-xl'
                        : 'bg-white border-zinc-100 text-zinc-300 hover:border-zinc-200'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-full shadow-lg bg-gradient-to-br from-white to-zinc-200 border border-zinc-300`} />
                      <span className="font-black">백돌 (후수)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black text-zinc-300 mb-3 ml-1 uppercase tracking-widest">난이도</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['하', '중', '상'] as Difficulty[]).map(d => (
                      <button
                        key={d}
                        onClick={() => setOthelloDifficulty(d)}
                        className={`py-2 rounded-xl font-black text-sm transition-all border-2 ${othelloDifficulty === d
                          ? 'bg-zinc-800 text-white border-zinc-800'
                          : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200'
                          }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      initOthello(othelloDifficulty, othelloPlayerColor);
                      changeView('오델로');
                    }}
                    className="w-full py-5 bg-zinc-800 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-5 h-5" /> 대국 시작하기
                  </button>
                  <button
                    onClick={() => setShowOthelloSetup(false)}
                    className="w-full py-4 bg-zinc-50 text-zinc-400 font-black rounded-2xl hover:bg-zinc-100 transition-all"
                  >
                    취소
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 오목 설정 모달 */}
      <AnimatePresence>
        {showOmokSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-4 border-pink-100"
            >
              <h2 className="text-2xl font-black text-pink-500 mb-8 text-center">오목 대전 설정 🌳</h2>

              <div className="space-y-8">
                <div>
                  <p className="text-xs font-black text-zinc-300 mb-3 ml-1 uppercase tracking-widest">난이도 선택</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['하', '중', '상'] as Difficulty[]).map(d => (
                      <button
                        key={d}
                        onClick={() => setOmokDifficulty(d)}
                        className={`py-3 rounded-2xl border-2 font-black transition-all text-sm ${omokDifficulty === d
                          ? 'bg-pink-500 border-pink-500 text-white shadow-lg shadow-pink-100'
                          : 'bg-white border-zinc-100 text-zinc-300 hover:border-pink-200'
                          }`}
                      >
                        {d === '하' ? '🌱 하' : d === '중' ? '🌿 중' : '🌳 상'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black text-zinc-300 mb-3 ml-1 uppercase tracking-widest">나의 돌 색상</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPlayerColor('BLACK')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${playerColor === 'BLACK' ? 'bg-zinc-50 border-black' : 'bg-white border-zinc-100'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-black shadow-xl" />
                      <span className={`font-black text-xs ${playerColor === 'BLACK' ? 'text-black' : 'text-zinc-300'}`}>흑돌 (선공)</span>
                    </button>
                    <button
                      onClick={() => setPlayerColor('WHITE')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${playerColor === 'WHITE' ? 'bg-zinc-50 border-zinc-300' : 'bg-white border-zinc-100'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-zinc-100 border border-zinc-200 shadow-xl" />
                      <span className={`font-black text-xs ${playerColor === 'WHITE' ? 'text-zinc-600' : 'text-zinc-300'}`}>백돌 (후공)</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowOmokSetup(false)}
                    className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-400 font-black hover:bg-zinc-200 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      changeView('오목');
                      initOmok(omokDifficulty, playerColor);
                    }}
                    className="flex-[2] py-4 rounded-2xl bg-pink-500 text-white font-black hover:bg-pink-600 transition-all shadow-lg shadow-pink-200"
                  >
                    시작하기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 장기 설정 모달 */}
      <AnimatePresence>
        {showJanggiSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-4 border-blue-100"
            >
              <h2 className="text-2xl font-black text-blue-500 mb-8 text-center">장기 대전 설정 🐘</h2>

              <div className="space-y-8">
                <div>
                  <p className="text-xs font-black text-zinc-300 mb-3 ml-1 uppercase tracking-widest">나의 진영</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPlayerSide('CHO')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${playerSide === 'CHO' ? 'bg-blue-50 border-blue-500' : 'bg-white border-zinc-100'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl flex items-center justify-center text-white text-2xl font-black">楚</div>
                      <span className={`font-black text-xs ${playerSide === 'CHO' ? 'text-blue-600' : 'text-zinc-300'}`}>초 (Blue)</span>
                    </button>
                    <button
                      onClick={() => setPlayerSide('HAN')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${playerSide === 'HAN' ? 'bg-red-50 border-red-500' : 'bg-white border-zinc-100'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-xl flex items-center justify-center text-white text-2xl font-black">漢</div>
                      <span className={`font-black text-xs ${playerSide === 'HAN' ? 'text-red-600' : 'text-zinc-300'}`}>한 (Red)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black text-zinc-300 mb-3 ml-1 uppercase tracking-widest">기물 차림</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setJanggiSetup('MA_SANG')}
                      className={`py-4 rounded-2xl border-2 font-black transition-all text-sm ${janggiSetup === 'MA_SANG'
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                        : 'bg-white border-zinc-100 text-zinc-400 hover:border-blue-200'
                        }`}
                    >
                      🐴 마상마상
                    </button>
                    <button
                      onClick={() => setJanggiSetup('SANG_MA')}
                      className={`py-4 rounded-2xl border-2 font-black transition-all text-sm ${janggiSetup === 'SANG_MA'
                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                        : 'bg-white border-zinc-100 text-zinc-400 hover:border-blue-200'
                        }`}
                    >
                      🐘 상마상마
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowJanggiSetup(false)}
                    className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-400 font-black hover:bg-zinc-200 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      changeView('장기');
                      initJanggi(janggiDifficulty, playerSide, janggiSetup);
                    }}
                    className="flex-[2] py-4 rounded-2xl bg-blue-500 text-white font-black hover:bg-blue-600 transition-all shadow-lg shadow-blue-200"
                  >
                    시작하기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showChessSetup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border-4 border-indigo-100"
            >
              <h2 className="text-2xl font-black text-indigo-500 mb-8 text-center">체스 대전 설정 ♟️</h2>

              <div className="space-y-8">
                <div>
                  <p className="text-xs font-black text-zinc-300 mb-3 ml-1 uppercase tracking-widest">나의 진영</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPlayerChessSide('WHITE')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${playerChessSide === 'WHITE' ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-zinc-100'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white to-zinc-100 border border-zinc-200 shadow-xl flex items-center justify-center text-zinc-800 text-2xl font-black">W</div>
                      <span className={`font-black text-xs ${playerChessSide === 'WHITE' ? 'text-indigo-600' : 'text-zinc-300'}`}>백 (White)</span>
                    </button>
                    <button
                      onClick={() => setPlayerChessSide('BLACK')}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${playerChessSide === 'BLACK' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
                        }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-black shadow-xl flex items-center justify-center text-white text-2xl font-black">B</div>
                      <span className={`font-black text-xs ${playerChessSide === 'BLACK' ? 'text-zinc-800' : 'text-zinc-300'}`}>흑 (Black)</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowChessSetup(false)}
                    className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-400 font-black hover:bg-zinc-200 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      changeView('체스');
                      initChess(chessDifficulty, playerChessSide);
                    }}
                    className="flex-[2] py-4 rounded-2xl bg-indigo-500 text-white font-black hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200"
                  >
                    시작하기
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
