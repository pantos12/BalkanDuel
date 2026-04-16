// ============================================================
// Balkan Duel — Question Bank
// 60+ real Balkan-flavored trivia questions
// ============================================================

export interface Question {
  id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // seconds
  funFact?: string;
}

export const CATEGORIES = {
  HISTORY_GEO: 'History & Geography',
  FOOD_DRINK: 'Food & Drink',
  CULTURE_MUSIC: 'Culture & Music',
  SPORTS: 'Sports',
  LANGUAGE_SLANG: 'Language & Slang',
  YUGOSLAV_NOSTALGIA: 'Yugoslav Nostalgia',
  MEMES_HUMOR: 'Memes & Humor',
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];

export const questions: Question[] = [
  // ─────────────────────────────────────────────
  // HISTORY & GEOGRAPHY (10 questions)
  // ─────────────────────────────────────────────
  {
    id: 'hg-001',
    text: 'What is the capital of Bosnia and Herzegovina?',
    options: ['Banja Luka', 'Mostar', 'Sarajevo', 'Tuzla'],
    correctIndex: 2,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'easy',
    timeLimit: 8,
    funFact: 'Sarajevo hosted the 1984 Winter Olympics and was the site of the assassination that triggered WWI.',
  },
  {
    id: 'hg-002',
    text: 'Which river runs through Belgrade, Serbia?',
    options: ['Drava', 'Sava', 'Vardar', 'Neretva'],
    correctIndex: 1,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'easy',
    timeLimit: 8,
    funFact: 'Belgrade sits at the confluence of the Sava and Danube rivers — two of Europe\'s greatest waterways.',
  },
  {
    id: 'hg-003',
    text: 'In which year did Yugoslavia officially dissolve?',
    options: ['1989', '1991', '1995', '2003'],
    correctIndex: 1,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Slovenia and Croatia declared independence on June 25, 1991 — starting the final chapter of Yugoslavia.',
  },
  {
    id: 'hg-004',
    text: 'Which Ottoman sultan conquered Constantinople in 1453?',
    options: ['Suleiman the Magnificent', 'Mehmed II', 'Selim I', 'Murad II'],
    correctIndex: 1,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Mehmed II was only 21 years old when he conquered Constantinople, earning the title "el-Fâtih" (the Conqueror).',
  },
  {
    id: 'hg-005',
    text: 'The Battle of Kosovo in 1389 was fought between Serbs and which empire?',
    options: ['Byzantine Empire', 'Austro-Hungarian Empire', 'Ottoman Empire', 'Venetian Republic'],
    correctIndex: 2,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'The Battle of Kosovo remains one of the most mythologized events in Serbian history, celebrated in epic poetry.',
  },
  {
    id: 'hg-006',
    text: 'Which country is home to the Pirin, Rila, and Rhodope mountain ranges?',
    options: ['Serbia', 'Greece', 'North Macedonia', 'Bulgaria'],
    correctIndex: 3,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Musala in the Rila Mountains is the highest peak in Bulgaria and the entire Balkans at 2,925 metres.',
  },
  {
    id: 'hg-007',
    text: 'What was the former name of North Macedonia before its 2019 name change?',
    options: ['Former Yugoslav Republic of Macedonia', 'Socialist Republic of Macedonia', 'Republic of Skopje', 'Greater Macedonia'],
    correctIndex: 0,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'hard',
    timeLimit: 10,
    funFact: 'The Prespa Agreement (2018) resolved the decades-long naming dispute with Greece, paving the way for NATO membership.',
  },
  {
    id: 'hg-008',
    text: 'Archduke Franz Ferdinand was assassinated in Sarajevo in 1914 by which group?',
    options: ['The Black Hand', 'Young Bosnia', 'Ustasha', 'Chetniks'],
    correctIndex: 1,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'hard',
    timeLimit: 10,
    funFact: 'Gavrilo Princip, the 19-year-old who fired the fatal shots, became one of the most consequential figures in history.',
  },
  {
    id: 'hg-009',
    text: 'Which Balkan country has the largest population?',
    options: ['Bulgaria', 'Romania', 'Serbia', 'Croatia'],
    correctIndex: 1,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Romania has around 19 million people, making it the most populous country generally considered part of the Balkans.',
  },
  {
    id: 'hg-010',
    text: 'The city of Dubrovnik, famous for its old town walls, is located in which country?',
    options: ['Montenegro', 'Bosnia', 'Croatia', 'Albania'],
    correctIndex: 2,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'easy',
    timeLimit: 6,
    funFact: 'Dubrovnik\'s old city walls are 1,940 metres long. The city is also famously used as "King\'s Landing" in Game of Thrones.',
  },

  // ─────────────────────────────────────────────
  // FOOD & DRINK (10 questions)
  // ─────────────────────────────────────────────
  {
    id: 'fd-001',
    text: 'Which Balkan country is considered the biggest producer and exporter of rakija?',
    options: ['Bosnia', 'Croatia', 'Serbia', 'Bulgaria'],
    correctIndex: 2,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Serbia produces so much šljivovica (plum brandy) that it\'s basically a national currency — every grandpa has a barrel.',
  },
  {
    id: 'fd-002',
    text: 'Čevapi (ćevapčići) are traditionally served with which bread?',
    options: ['Pita', 'Somun', 'Pogača', 'Burek'],
    correctIndex: 1,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Somun is a soft flatbread baked in Sarajevo\'s traditional bakeries. Without it, čevapi just isn\'t the same.',
  },
  {
    id: 'fd-003',
    text: 'Burek is a pastry made with which dough?',
    options: ['Shortcrust', 'Puff pastry', 'Yufka/filo', 'Choux'],
    correctIndex: 2,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'In Bosnia, "burek" refers only to the meat version. Calling cheese burek just "burek" will get you corrected by a Bosnian immediately.',
  },
  {
    id: 'fd-004',
    text: 'Ajvar is a condiment made primarily from which vegetable?',
    options: ['Tomatoes', 'Eggplant/aubergine', 'Red peppers', 'Zucchini'],
    correctIndex: 2,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Ajvar season in autumn is a serious family event in Serbia and North Macedonia — entire weekends are devoted to roasting and jarring peppers.',
  },
  {
    id: 'fd-005',
    text: 'Palinka is a fruit brandy traditional to which Balkan country?',
    options: ['Bulgaria', 'Romania/Hungary region', 'Albania', 'Greece'],
    correctIndex: 1,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Palinka has EU Protected Designation of Origin status. It must be made from 100% fruit grown in the Carpathian Basin.',
  },
  {
    id: 'fd-006',
    text: 'What is turshija?',
    options: ['A type of soup', 'A pickled vegetable mix', 'A dessert with honey', 'A smoked meat platter'],
    correctIndex: 1,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Turshija jars are a staple of Balkan winter. The fermentation process starts every September and the smell fills entire apartment blocks.',
  },
  {
    id: 'fd-007',
    text: 'Baklava originates from which culinary tradition?',
    options: ['Greek', 'Ottoman/Turkish', 'Persian', 'Arab'],
    correctIndex: 1,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'hard',
    timeLimit: 9,
    funFact: 'The debate over who "owns" baklava is genuinely diplomatic. Greek, Turkish, Lebanese, and Arab nations all claim it. The Ottomans spread it wide.',
  },
  {
    id: 'fd-008',
    text: 'Sarma is a dish of minced meat wrapped in what?',
    options: ['Vine leaves or cabbage leaves', 'Corn husks', 'Rice paper', 'Spinach leaves'],
    correctIndex: 0,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Sarma is the unofficial dish of every Balkan Christmas, New Year, and family gathering. There are never enough of them.',
  },
  {
    id: 'fd-009',
    text: 'Which Balkan country is most famous for its sheep cheese called "kashkaval"?',
    options: ['Albania', 'Bulgaria', 'Serbia', 'All of the above'],
    correctIndex: 3,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'hard',
    timeLimit: 9,
    funFact: 'Kashkaval is beloved across the Balkans. Bulgaria\'s version is perhaps most exported internationally.',
  },
  {
    id: 'fd-010',
    text: 'What is a "meze" in Balkan dining culture?',
    options: ['A main course meat dish', 'A selection of small appetizers/snacks', 'A dessert tray', 'A type of stew'],
    correctIndex: 1,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'A proper Balkan meze session can last three hours before the actual food arrives. The rakija keeps flowing the whole time.',
  },

  // ─────────────────────────────────────────────
  // CULTURE & MUSIC (10 questions)
  // ─────────────────────────────────────────────
  {
    id: 'cm-001',
    text: 'Who is known as the "Queen of Turbofolk"?',
    options: ['Lepa Brena', 'Ceca', 'Indira Radić', 'Vesna Zmijanac'],
    correctIndex: 1,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Svetlana "Ceca" Ražnatović remains one of the best-selling musicians in Balkan history. Her concerts still sell out stadiums.',
  },
  {
    id: 'cm-002',
    text: 'Which folk dance is performed in a circle chain, common across Balkan countries?',
    options: ['Polka', 'Kolo', 'Hora', 'Čoček'],
    correctIndex: 1,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Kolo (meaning "wheel" or "circle") is a UNESCO-listed intangible cultural heritage of Serbia.',
  },
  {
    id: 'cm-003',
    text: 'The gusle is a traditional single-string instrument most associated with which Balkan culture?',
    options: ['Bulgarian', 'Albanian/Serbian epic tradition', 'Greek', 'Romanian'],
    correctIndex: 1,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Gusle players (guslari) recite epic poems while playing. These oral epics were collected by Vuk Stefanović Karadžić in the 19th century.',
  },
  {
    id: 'cm-004',
    text: 'Dino Merlin is a famous singer from which country?',
    options: ['Croatia', 'Serbia', 'Bosnia and Herzegovina', 'Montenegro'],
    correctIndex: 2,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Dino Merlin represented Bosnia and Herzegovina at Eurovision 2011 with "Love in Rewind", finishing 6th.',
  },
  {
    id: 'cm-005',
    text: 'Lepa Brena is a pop-folk icon originally from which country?',
    options: ['Bosnia', 'Serbia', 'Croatia', 'North Macedonia'],
    correctIndex: 0,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Born Fahreta Jahić in Tešanj, Bosnia, Lepa Brena was probably the biggest star of Yugoslavia — beloved by all ethnicities.',
  },
  {
    id: 'cm-006',
    text: 'The tambura is a long-necked lute instrument most popular in which region?',
    options: ['Bulgaria', 'Albania', 'Slavonia/Croatia', 'Greece'],
    correctIndex: 2,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'hard',
    timeLimit: 9,
    funFact: 'Tambura orchestras (tamburaškaši) are the sound of Slavonia. The instrument was introduced during Ottoman rule.',
  },
  {
    id: 'cm-007',
    text: 'Which Balkan country gave the world the film director Emir Kusturica?',
    options: ['Croatia', 'Serbia/Bosnia', 'Romania', 'North Macedonia'],
    correctIndex: 1,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'hard',
    timeLimit: 9,
    funFact: 'Kusturica won the Palme d\'Or twice at Cannes — for "When Father Was Away on Business" (1985) and "Underground" (1995).',
  },
  {
    id: 'cm-008',
    text: 'What style of music is turbofolk?',
    options: ['Folk-electronic fusion from the 1990s', 'Traditional mountain ballads', 'Ottoman classical music revival', 'Romani jazz'],
    correctIndex: 0,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Turbofolk blended Serbian folk melodies with synthesizers, drum machines, and very short skirts. Love it or hate it, you know every word.',
  },
  {
    id: 'cm-009',
    text: 'The Sarajevo Film Festival was first held in which year?',
    options: ['1988', '1995', '2000', '2002'],
    correctIndex: 1,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'hard',
    timeLimit: 10,
    funFact: 'The festival was founded during the siege of Sarajevo as an act of cultural defiance. It\'s now one of Europe\'s most respected film festivals.',
  },
  {
    id: 'cm-010',
    text: 'Đorđe Balašević was a legendary singer-songwriter from which city?',
    options: ['Sarajevo', 'Zagreb', 'Novi Sad', 'Belgrade'],
    correctIndex: 2,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'hard',
    timeLimit: 10,
    funFact: '"Đole" was the poet of the former Yugoslavia. Tens of thousands attended his memorial concerts after his death in 2021.',
  },

  // ─────────────────────────────────────────────
  // SPORTS (9 questions)
  // ─────────────────────────────────────────────
  {
    id: 'sp-001',
    text: 'Nikola Jokić plays for which NBA team?',
    options: ['Los Angeles Lakers', 'Golden State Warriors', 'Denver Nuggets', 'Miami Heat'],
    correctIndex: 2,
    category: CATEGORIES.SPORTS,
    difficulty: 'easy',
    timeLimit: 6,
    funFact: 'Jokić, nicknamed "The Joker", was drafted 41st overall in 2014. He became the most dominant center in NBA history and a 3x MVP.',
  },
  {
    id: 'sp-002',
    text: 'Novak Djokovic is from which city in Serbia?',
    options: ['Niš', 'Novi Sad', 'Belgrade', 'Kopaonik'],
    correctIndex: 2,
    category: CATEGORIES.SPORTS,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Djokovic was born in Belgrade and trained from age 6 at the Kopaonik mountain resort, served by a local coach who spotted him early.',
  },
  {
    id: 'sp-003',
    text: 'Dražen Petrović, the legendary Croatian basketball player, played most of his NBA career for which team?',
    options: ['Portland Trail Blazers', 'New Jersey Nets', 'Chicago Bulls', 'Los Angeles Clippers'],
    correctIndex: 1,
    category: CATEGORIES.SPORTS,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Petrović averaged 22.3 points per game in his final NBA season (1992-93). He died tragically in a car accident at age 28 in 1993.',
  },
  {
    id: 'sp-004',
    text: 'Which Yugoslav footballer is considered one of the greatest strikers of all time, nicknamed "El Fenomeno de los Balkanes"?',
    options: ['Dragan Džajić', 'Predrag Mijatović', 'Stjepan Bobek', 'Robert Prosinečki'],
    correctIndex: 0,
    category: CATEGORIES.SPORTS,
    difficulty: 'hard',
    timeLimit: 10,
    funFact: 'Dragan Džajić was voted the best Yugoslav player ever. Pelé named him one of the top 100 greatest living footballers in 2004.',
  },
  {
    id: 'sp-005',
    text: 'Yugoslavia won the Basketball World Championship in 1998. Which country\'s team was that tournament\'s runner-up?',
    options: ['USA', 'Russia', 'Spain', 'Lithuania'],
    correctIndex: 0,
    category: CATEGORIES.SPORTS,
    difficulty: 'hard',
    timeLimit: 10,
    funFact: 'Yugoslavia dominated world basketball for decades — beating the Dream Team in key tournaments was their greatest achievement.',
  },
  {
    id: 'sp-006',
    text: 'Which Balkan country won the FIFA World Cup in 1930?',
    options: ['Yugoslavia (reached the semi-final)', 'Romania', 'None — no Balkan country has won', 'Bulgaria'],
    correctIndex: 0,
    category: CATEGORIES.SPORTS,
    difficulty: 'hard',
    timeLimit: 10,
    funFact: 'Yugoslavia was actually one of the four semi-finalists at the very first World Cup in Uruguay 1930, losing to Uruguay 6–1.',
  },
  {
    id: 'sp-007',
    text: 'Novak Djokovic has won the most Grand Slam titles in tennis history. How many had he won by 2024?',
    options: ['21', '22', '23', '24'],
    correctIndex: 3,
    category: CATEGORIES.SPORTS,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Djokovic won his 24th Grand Slam title at the 2023 US Open, surpassing Federer and Nadal to stand alone at the top of history.',
  },
  {
    id: 'sp-008',
    text: 'Red Star Belgrade (Crvena Zvezda) won the UEFA Champions League in which year?',
    options: ['1985', '1991', '1997', '2003'],
    correctIndex: 1,
    category: CATEGORIES.SPORTS,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Red Star beat Marseille on penalties in the 1991 final in Bari, Italy. It remains the only Champions League win for a Balkan club.',
  },
  {
    id: 'sp-009',
    text: 'Goran Ivanišević, who won Wimbledon in 2001, is from which country?',
    options: ['Serbia', 'Bosnia', 'Croatia', 'Montenegro'],
    correctIndex: 2,
    category: CATEGORIES.SPORTS,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Ivanišević entered Wimbledon 2001 as a wildcard — the only wildcard in the Open Era to win the tournament. Croatia celebrated for days.',
  },

  // ─────────────────────────────────────────────
  // LANGUAGE & SLANG (8 questions)
  // ─────────────────────────────────────────────
  {
    id: 'ls-001',
    text: 'What does "brate" mean in Serbian/Croatian?',
    options: ['Brother/dude', 'Beer', 'Food', 'Enemy'],
    correctIndex: 0,
    category: CATEGORIES.LANGUAGE_SLANG,
    difficulty: 'easy',
    timeLimit: 6,
    funFact: '"Brate" literally means "brother" but is used like "dude" or "mate" in casual speech. You can say it 5 times per sentence.',
  },
  {
    id: 'ls-002',
    text: 'What does "mori" mean in Greek slang?',
    options: ['Hello', 'An exclamation of surprise or address (like "hey you")', 'Goodbye', 'I don\'t know'],
    correctIndex: 1,
    category: CATEGORIES.LANGUAGE_SLANG,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: '"Mori" is an informal address term in Greek, often used between women ("re" is the masculine version). Both are common in everyday speech.',
  },
  {
    id: 'ls-003',
    text: 'What does "komšija" mean in Bosnian/Serbian/Croatian?',
    options: ['Enemy', 'Neighbour', 'Relative', 'Friend'],
    correctIndex: 1,
    category: CATEGORIES.LANGUAGE_SLANG,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'In the Balkans, komšija (neighbour) culture is sacred. You borrow sugar, share rakija, and sometimes tell them your problems before family.',
  },
  {
    id: 'ls-004',
    text: 'What does "jebiga" roughly translate to in Serbian?',
    options: ['Good luck', 'What can you do / screw it (expression of resigned acceptance)', 'Hello stranger', 'Come here quickly'],
    correctIndex: 1,
    category: CATEGORIES.LANGUAGE_SLANG,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: '"Jebiga" is the Balkan philosophy in one word — a shrug of resigned acceptance toward life\'s misfortunes. Untranslatable perfection.',
  },
  {
    id: 'ls-005',
    text: 'What does "bre" (also spelled "bre" or "re") mean when used in speech?',
    options: ['A particle of emphasis or address (hey, come on, man)', 'Water', 'Slow down', 'Are you stupid?'],
    correctIndex: 0,
    category: CATEGORIES.LANGUAGE_SLANG,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: '"Bre" is used across Serbian, Macedonian, Bulgarian, and even Greek. It\'s a verbal filler that adds urgency, surprise, or familiarity.',
  },
  {
    id: 'ls-006',
    text: 'The Albanian word "burrë" means what?',
    options: ['Boy', 'Man/husband', 'Warrior', 'Father'],
    correctIndex: 1,
    category: CATEGORIES.LANGUAGE_SLANG,
    difficulty: 'hard',
    timeLimit: 9,
    funFact: '"Burrë" in Albanian means both "man" and "husband". The word conveys honour and masculinity — a "true burrë" is a man of his word.',
  },
  {
    id: 'ls-007',
    text: 'What does "pička materina" imply when used as an expression in Serbian/Croatian?',
    options: ['A compliment to the listener', 'A very strong profanity/curse expression', 'A toast before drinking', 'A greeting between close friends'],
    correctIndex: 1,
    category: CATEGORIES.LANGUAGE_SLANG,
    difficulty: 'hard',
    timeLimit: 9,
    funFact: 'Balkan profanity is legendary. Linguists have noted that Serbian swearing is among the most creative and grammatically flexible in the world.',
  },
  {
    id: 'ls-008',
    text: 'What does the Romanian expression "nu-mi pasa" mean?',
    options: ['I\'m hungry', 'I don\'t care / it doesn\'t matter to me', 'Let\'s go', 'I forgot'],
    correctIndex: 1,
    category: CATEGORIES.LANGUAGE_SLANG,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: '"Nu-mi pasă" is Romania\'s version of the universal Balkan shoulder-shrug. It pairs well with a coffee and a sigh.',
  },

  // ─────────────────────────────────────────────
  // YUGOSLAV NOSTALGIA (8 questions)
  // ─────────────────────────────────────────────
  {
    id: 'yn-001',
    text: 'What car was manufactured by Zastava in Yugoslavia?',
    options: ['Fiat Uno', 'Yugo / Zastava Koral', 'Trabant', 'Lada Niva'],
    correctIndex: 1,
    category: CATEGORIES.YUGOSLAV_NOSTALGIA,
    difficulty: 'easy',
    timeLimit: 6,
    funFact: 'The Yugo GV was exported to the USA in 1985 at $3,990 — the cheapest new car ever sold in America. Critics were brutal, but Balkans loved it.',
  },
  {
    id: 'yn-002',
    text: 'How many years did Josip Broz Tito rule Yugoslavia?',
    options: ['15 years', '25 years', '35 years', '45 years'],
    correctIndex: 2,
    category: CATEGORIES.YUGOSLAV_NOSTALGIA,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Tito ruled from 1945 until his death in 1980 — 35 years. He kept Yugoslavia independent of the Soviet Union through the famous Tito-Stalin Split.',
  },
  {
    id: 'yn-003',
    text: 'What was the Yugoslav "non-aligned movement" about?',
    options: ['Not joining NATO', 'Not aligning with either the USA or USSR during the Cold War', 'Neutrality in sports', 'Military disarmament'],
    correctIndex: 1,
    category: CATEGORIES.YUGOSLAV_NOSTALGIA,
    difficulty: 'medium',
    timeLimit: 9,
    funFact: 'Yugoslavia was a founding member of the Non-Aligned Movement (1961), positioning itself as a third path between capitalism and Soviet communism.',
  },
  {
    id: 'yn-004',
    text: 'The Yugoslav TV series "Otpisani" (Written Off) was a beloved show about what?',
    options: ['Communist party bureaucracy', 'World War II Serbian partisans and resistance', 'A football team in the 1970s', 'Yugoslav space program'],
    correctIndex: 1,
    category: CATEGORIES.YUGOSLAV_NOSTALGIA,
    difficulty: 'hard',
    timeLimit: 10,
    funFact: '"Otpisani" (1974) was so popular it became a genuine cultural phenomenon across all of Yugoslavia. Its theme music is instantly recognisable.',
  },
  {
    id: 'yn-005',
    text: 'What was the name of Yugoslavia\'s most famous domestic chocolate brand?',
    options: ['Milka', 'Najlepše Želje', 'Kraš', 'Eurocream'],
    correctIndex: 1,
    category: CATEGORIES.YUGOSLAV_NOSTALGIA,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: '"Najlepše Želje" (Most Beautiful Wishes) by Kraš/Zvečevo was the chocolate given as gifts, in stockings, at Easter. Pure nostalgia.',
  },
  {
    id: 'yn-006',
    text: 'Tito\'s birthday on May 25th was celebrated as what in Yugoslavia?',
    options: ['State Day', 'Day of Youth (Dan Mladosti)', 'Liberation Day', 'National Sports Day'],
    correctIndex: 1,
    category: CATEGORIES.YUGOSLAV_NOSTALGIA,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'The "Štafeta Mladosti" (Youth Relay Baton) was passed from city to city as a festival culminating in a spectacular stadium show in Belgrade on May 25th.',
  },
  {
    id: 'yn-007',
    text: 'The film "Ko to tamo peva" (Who\'s Singing Over There?) was made in which year?',
    options: ['1960', '1975', '1980', '1988'],
    correctIndex: 2,
    category: CATEGORIES.YUGOSLAV_NOSTALGIA,
    difficulty: 'hard',
    timeLimit: 10,
    funFact: 'Directed by Slobodan Šijan in 1980, "Ko to tamo peva" is consistently voted the greatest Yugoslav film ever made — a dark comedy set on the eve of WWII.',
  },
  {
    id: 'yn-008',
    text: 'What does "Jugonostalgija" (Yugonostalgia) refer to?',
    options: ['Longing for a united Yugoslavia and its culture', 'Collecting old Yugoslav coins', 'A music genre from the 1980s', 'Tourism to Yugoslav-era monuments'],
    correctIndex: 0,
    category: CATEGORIES.YUGOSLAV_NOSTALGIA,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Yugonostalgia is real and widespread. Studies show many former Yugoslavs remember the era positively, regardless of ethnicity.',
  },

  // ─────────────────────────────────────────────
  // MEMES & HUMOR (8 questions)
  // ─────────────────────────────────────────────
  {
    id: 'mh-001',
    text: 'Which Balkan country is stereotypically associated with the most aggressive driving?',
    options: ['Albania', 'Serbia', 'All Balkan countries equally', 'Greece'],
    correctIndex: 2,
    category: CATEGORIES.MEMES_HUMOR,
    difficulty: 'easy',
    timeLimit: 6,
    funFact: 'In Balkan meme culture, EVERY country claims the others drive worse. The truth? The entire region is a Formula 1 qualifying round.',
  },
  {
    id: 'mh-002',
    text: 'What is the Balkan cultural phenomenon of "inat"?',
    options: ['Extreme hospitality', 'Stubborn spite or defiance as a point of pride', 'Love for coffee', 'Competitive singing'],
    correctIndex: 1,
    category: CATEGORIES.MEMES_HUMOR,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: '"Inat" means doing something purely out of spite, even against your own interest. "Iz inata" (out of spite) is almost a life philosophy in the Balkans.',
  },
  {
    id: 'mh-003',
    text: 'What do Balkan people say is the correct way to make coffee?',
    options: ['Nespresso capsule', 'Boil in džezva (cezve) pot', 'French press', 'Any method, coffee is coffee'],
    correctIndex: 1,
    category: CATEGORIES.MEMES_HUMOR,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Bosnian/Turkish coffee made in a džezva is serious business. Offering someone instant coffee is a mild insult to their intelligence.',
  },
  {
    id: 'mh-004',
    text: 'In Balkan meme culture, "komšija" (neighbour) is known for doing what?',
    options: ['Being very quiet and private', 'Watching everything, knowing your business, offering food and opinions', 'Only appearing at New Year', 'Being extremely formal'],
    correctIndex: 1,
    category: CATEGORIES.MEMES_HUMOR,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'The Balkan komšija is an institution. They know when you come home, who you were with, and will have šljivovica ready before you open your door.',
  },
  {
    id: 'mh-005',
    text: 'What is the punchline of the classic Balkan joke: "Why don\'t Balkan people go to the therapist?"',
    options: ['"Because they have komšije (neighbours)"', '"Because rakija is cheaper"', '"Because they just shout it out loud instead"', '"Because there are no therapists, only priests"'],
    correctIndex: 1,
    category: CATEGORIES.MEMES_HUMOR,
    difficulty: 'medium',
    timeLimit: 9,
    funFact: 'Rakija really is the Balkan answer to most ailments — emotional or physical. "Malo rakije" (a little rakija) cures everything from heartbreak to flu.',
  },
  {
    id: 'mh-006',
    text: 'In Balkan meme culture, what happens when a Balkan mother sees her child not eating?',
    options: ['She politely offers more food', 'She goes into full crisis mode and makes three more dishes', 'She respects the child\'s decision', 'She leaves a plate out for later'],
    correctIndex: 1,
    category: CATEGORIES.MEMES_HUMOR,
    difficulty: 'easy',
    timeLimit: 6,
    funFact: '"Jesi li jeo?" (Have you eaten?) is the Balkan mother\'s love language. Not eating is a personal insult to three generations of cooking heritage.',
  },
  {
    id: 'mh-007',
    text: 'What does "to nije normalno" mean in Balkan conversational context?',
    options: ['"This is acceptable"', '"That\'s unbelievable / not normal" — an expression of exasperated disbelief', '"Is this OK?"', '"Calm down"'],
    correctIndex: 1,
    category: CATEGORIES.MEMES_HUMOR,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: '"To nije normalno" can mean either something is amazingly good OR absolutely terrible. Context and tone is everything in the Balkans.',
  },
  {
    id: 'mh-008',
    text: 'What is "Balkan time" in meme culture?',
    options: ['Being exactly punctual', 'Arriving 30-60 minutes late as the standard', 'An old Ottoman calendar system', 'Daylight savings in the region'],
    correctIndex: 1,
    category: CATEGORIES.MEMES_HUMOR,
    difficulty: 'easy',
    timeLimit: 6,
    funFact: '"Sad" (now) in Balkan cultures can mean anything from immediately to two hours. "Odmah" (right away) usually means when the coffee is finished.',
  },

  // ─────────────────────────────────────────────
  // BONUS QUESTIONS — Extra depth across categories
  // ─────────────────────────────────────────────
  {
    id: 'hg-011',
    text: 'The Neretva River runs through which two countries?',
    options: ['Serbia and Montenegro', 'Bosnia and Herzegovina and Croatia', 'Albania and Greece', 'North Macedonia and Bulgaria'],
    correctIndex: 1,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'medium',
    timeLimit: 9,
    funFact: 'The Neretva is famous for its emerald-green colour. The Stari Most bridge in Mostar spans the Neretva — rebuilt after its destruction in 1993.',
  },
  {
    id: 'hg-012',
    text: 'Which Balkan country joined the European Union first?',
    options: ['Bulgaria', 'Romania', 'Greece', 'Slovenia'],
    correctIndex: 2,
    category: CATEGORIES.HISTORY_GEO,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Greece joined the EU (then EEC) in 1981, becoming its 10th member. Slovenia was next from the Balkans, joining in 2004.',
  },
  {
    id: 'sp-010',
    text: 'Which Serbian tennis player is known as "Nole"?',
    options: ['Viktor Troicki', 'Novak Djokovic', 'Janko Tipsarević', 'Filip Krajinović'],
    correctIndex: 1,
    category: CATEGORIES.SPORTS,
    difficulty: 'easy',
    timeLimit: 5,
    funFact: '"Nole" is Djokovic\'s nickname from childhood. Serbia treats him like royalty — his face has appeared on Serbian dinar banknotes in special editions.',
  },
  {
    id: 'fd-011',
    text: 'Shopska salad is the national salad of which country?',
    options: ['Greece', 'Serbia', 'Bulgaria', 'North Macedonia'],
    correctIndex: 2,
    category: CATEGORIES.FOOD_DRINK,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'Shopska salad (tomato, cucumber, pepper, onion, topped with grated white cheese) has the colours of the Bulgarian flag — coincidence? Bulgarians say no.',
  },
  {
    id: 'cm-011',
    text: 'Which Balkan country has a tradition called "slava" — a family patron saint celebration?',
    options: ['Croatia', 'Bulgaria', 'Serbia', 'Bosnia'],
    correctIndex: 2,
    category: CATEGORIES.CULTURE_MUSIC,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'Slava is a uniquely Serbian Orthodox tradition where a family celebrates its patron saint with food, wine, and community gatherings. UNESCO listed it in 2014.',
  },
  {
    id: 'yn-009',
    text: 'What was the name of the Yugoslav airline?',
    options: ['AirYugo', 'JAT (Jugoslovenski Aerotransport)', 'Balkan Airways', 'Adriatic Air'],
    correctIndex: 1,
    category: CATEGORIES.YUGOSLAV_NOSTALGIA,
    difficulty: 'medium',
    timeLimit: 8,
    funFact: 'JAT Airways (later Air Serbia) flew from 1947 until 2013. It was the pride of Yugoslav aviation — and infamous for never quite running on time.',
  },
  {
    id: 'ls-009',
    text: 'What does "yamas" (γεια μας) mean as a toast in Greek?',
    options: ['Good food', 'To our health', 'To love', 'To friendship only'],
    correctIndex: 1,
    category: CATEGORIES.LANGUAGE_SLANG,
    difficulty: 'easy',
    timeLimit: 6,
    funFact: '"Yamas!" is the Greek toast. It literally means "to us/our health". It is said while making strong eye contact — breaking eye contact brings 7 years of bad sex.',
  },
  {
    id: 'mh-009',
    text: 'What is "kafana" culture in the Balkans?',
    options: ['A type of outdoor market', 'A traditional tavern/café for socialising over drinks and live music', 'A coffee ceremony', 'A village council gathering'],
    correctIndex: 1,
    category: CATEGORIES.MEMES_HUMOR,
    difficulty: 'easy',
    timeLimit: 7,
    funFact: 'The kafana is the soul of Balkan social life. Arguments, romances, business deals, and national crises have all been resolved (or started) in kafanas.',
  },
];

/**
 * Get questions filtered by category
 */
export function getQuestionsByCategory(category: Category): Question[] {
  return questions.filter((q) => q.category === category);
}

/**
 * Get questions filtered by difficulty
 */
export function getQuestionsByDifficulty(difficulty: Question['difficulty']): Question[] {
  return questions.filter((q) => q.difficulty === difficulty);
}

/**
 * Pick N random questions, optionally filtered by category
 */
export function pickRandomQuestions(
  count: number,
  options?: { category?: Category; difficulty?: Question['difficulty'] }
): Question[] {
  let pool = [...questions];

  if (options?.category) {
    pool = pool.filter((q) => q.category === options.category);
  }
  if (options?.difficulty) {
    pool = pool.filter((q) => q.difficulty === options.difficulty);
  }

  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Pick a balanced set of questions spread across categories
 */
export function pickBalancedQuestions(totalCount: number): Question[] {
  const categoryKeys = Object.values(CATEGORIES);
  const perCategory = Math.ceil(totalCount / categoryKeys.length);
  const selected: Question[] = [];

  for (const cat of categoryKeys) {
    const pool = questions.filter((q) => q.category === cat).sort(() => Math.random() - 0.5);
    selected.push(...pool.slice(0, perCategory));
  }

  return selected.sort(() => Math.random() - 0.5).slice(0, totalCount);
}
