// Mock data for Balkan Duel — realistic Balkan-flavored content

export interface Player {
  id: number;
  username: string;
  wins: number;
  losses: number;
  streak: number;
  avatar?: string;
}

export interface Question {
  id: number;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export interface RoundResult {
  round: number;
  question: Question;
  player1Answer: number;
  player2Answer: number;
  player1Time: number;
  player2Time: number;
  player1Correct: boolean;
  player2Correct: boolean;
}

export interface DuelState {
  id: string;
  player1: Player;
  player2: Player;
  currentRound: number;
  totalRounds: number;
  player1Score: number;
  player2Score: number;
  rounds: RoundResult[];
  status: "waiting" | "in_progress" | "finished";
}

export const mockPlayers: Player[] = [
  { id: 1, username: "BalkanBoss77", wins: 142, losses: 38, streak: 12 },
  { id: 2, username: "ČevapiKing", wins: 128, losses: 41, streak: 8 },
  { id: 3, username: "RakijaMaster", wins: 115, losses: 55, streak: 5 },
  { id: 4, username: "TurbofolkFan", wins: 98, losses: 62, streak: 3 },
  { id: 5, username: "YugoNostalgia", wins: 91, losses: 49, streak: 7 },
  { id: 6, username: "SarmaQueen", wins: 87, losses: 73, streak: 2 },
  { id: 7, username: "AjmoBrate", wins: 82, losses: 58, streak: 4 },
  { id: 8, username: "PljeskavicaPro", wins: 76, losses: 64, streak: 1 },
  { id: 9, username: "KafaDžezva", wins: 71, losses: 69, streak: 6 },
  { id: 10, username: "BurekDebate", wins: 65, losses: 75, streak: 0 },
];

export const mockQuestions: Question[] = [
  {
    id: 1,
    text: "What is the traditional Bosnian dish made of minced meat served in somun bread?",
    options: ["Burek", "Čevapi", "Pljeskavica", "Sarma"],
    correctIndex: 1,
  },
  {
    id: 2,
    text: "Which river flows through Belgrade where the Sava meets it?",
    options: ["Drina", "Danube", "Neretva", "Morava"],
    correctIndex: 1,
  },
  {
    id: 3,
    text: 'Who sang the famous turbofolk hit "Mile Voli Disko"?',
    options: ["Lepa Brena", "Ceca", "Dragana Mirković", "Seka Aleksić"],
    correctIndex: 0,
  },
  {
    id: 4,
    text: "What is rakija traditionally made from in Serbia?",
    options: ["Grapes", "Plums", "Apples", "Cherries"],
    correctIndex: 1,
  },
  {
    id: 5,
    text: "Which city was the host of the 1984 Winter Olympics in Yugoslavia?",
    options: ["Zagreb", "Belgrade", "Sarajevo", "Ljubljana"],
    correctIndex: 2,
  },
];

export const mockCurrentUser: Player = {
  id: 99,
  username: "TestDuelist",
  wins: 24,
  losses: 11,
  streak: 3,
};

export const mockDuelState: DuelState = {
  id: "duel-abc123",
  player1: mockCurrentUser,
  player2: mockPlayers[1],
  currentRound: 3,
  totalRounds: 5,
  player1Score: 2,
  player2Score: 1,
  rounds: [
    {
      round: 1,
      question: mockQuestions[0],
      player1Answer: 1,
      player2Answer: 2,
      player1Time: 2.3,
      player2Time: 3.1,
      player1Correct: true,
      player2Correct: false,
    },
    {
      round: 2,
      question: mockQuestions[1],
      player1Answer: 0,
      player2Answer: 1,
      player1Time: 4.1,
      player2Time: 2.8,
      player1Correct: false,
      player2Correct: true,
    },
    {
      round: 3,
      question: mockQuestions[2],
      player1Answer: 0,
      player2Answer: 1,
      player1Time: 1.8,
      player2Time: 3.5,
      player1Correct: true,
      player2Correct: false,
    },
  ],
  status: "in_progress",
};

export const mockFinishedDuel: DuelState = {
  id: "duel-xyz789",
  player1: mockCurrentUser,
  player2: mockPlayers[1],
  currentRound: 5,
  totalRounds: 5,
  player1Score: 4,
  player2Score: 1,
  rounds: [
    { round: 1, question: mockQuestions[0], player1Answer: 1, player2Answer: 2, player1Time: 2.3, player2Time: 3.1, player1Correct: true, player2Correct: false },
    { round: 2, question: mockQuestions[1], player1Answer: 1, player2Answer: 1, player1Time: 4.1, player2Time: 2.8, player1Correct: true, player2Correct: true },
    { round: 3, question: mockQuestions[2], player1Answer: 0, player2Answer: 1, player1Time: 1.8, player2Time: 3.5, player1Correct: true, player2Correct: false },
    { round: 4, question: mockQuestions[3], player1Answer: 0, player2Answer: 1, player1Time: 3.2, player2Time: 2.1, player1Correct: false, player2Correct: true },
    { round: 5, question: mockQuestions[4], player1Answer: 2, player2Answer: 0, player1Time: 1.5, player2Time: 4.2, player1Correct: true, player2Correct: false },
  ],
  status: "finished",
};

export const mockActiveDuels = [
  { player1: "Miro", player2: "Stefan", round: 3 },
  { player1: "ČevapiKing", player2: "RakijaMaster", round: 1 },
  { player1: "SarmaQueen", player2: "AjmoBrate", round: 5 },
  { player1: "TurbofolkFan", player2: "KafaDžezva", round: 2 },
];

export const balkanEmotes = [
  { emoji: "🥩", label: "Čevapi" },
  { emoji: "🥃", label: "Rakija" },
  { emoji: "👆", label: "Finger Wag" },
  { emoji: "💪", label: "Ajde brate!" },
  { emoji: "🔥", label: "Vatra!" },
  { emoji: "😤", label: "Ma daj!" },
  { emoji: "🏆", label: "Pobednik!" },
  { emoji: "☕", label: "Kafa time" },
];
