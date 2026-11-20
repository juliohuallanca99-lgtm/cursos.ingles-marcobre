// Helper utilities
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const levels = ["A1", "A2", "B1", "B2", "C1"];
const levelNames = { A1: "Beginner", A2: "Elementary", B1: "Intermediate", B2: "Upper-intermediate", C1: "Advanced" };

let currentLevel = localStorage.getItem("ep_level") || "A1";
let currentPage = "home";
let currentFilter = "All";
let activeSpeechText = null;

// Persistent Data Stores
let done = JSON.parse(localStorage.getItem("ep_done") || "[]");
let scores = JSON.parse(localStorage.getItem("ep_scores") || "{}");
let assignments = JSON.parse(localStorage.getItem("ep_assignments") || "[]");
let customExercises = JSON.parse(localStorage.getItem("ep_custom_ex") || "[]");
let homeworkList = JSON.parse(localStorage.getItem("ep_homework") || "[]");
let lessonPlans = JSON.parse(localStorage.getItem("ep_lessons") || "[]");
let journalNotes = JSON.parse(localStorage.getItem("ep_notes") || "[]");

// Initial Seed Data for Homework if empty
if (homeworkList.length === 0) {
  homeworkList = [
    { id: 101, level: "A1", title: "Basic Verb To Be Homework", desc: "Complete 5 sentences using am/is/are.", dueDate: "This Friday" },
    { id: 102, level: "A2", title: "Past Simple Narrative", desc: "Write 4 lines about what you did last weekend.", dueDate: "Next Monday" },
    { id: 103, level: "B1", title: "Conditional Sentence Drill", desc: "Form 3 first conditional sentences.", dueDate: "In 2 days" }
  ];
}

// Data: Comprehensive Grammar Topics with Multi-format Exercises
const grammar = [
  {
    l: "A1", t: "Verb to be: am, is, are", cat: "Grammar foundations",
    desc: "Talk about identity, jobs, nationalities and feelings.",
    rule: "Subject + am / is / are + complement",
    ex: ["I am an English teacher.", "She is from Peru.", "They are at work."],
    tip: "Use am with I, is with he/she/it, and are with you/we/they.",
    qs: [
      { type: "mc", q: "I ___ from Peru.", opts: ["am", "is", "are"], ans: 0, exp: "Use am with I." },
      { type: "mc", q: "My colleagues ___ friendly.", opts: ["is", "am", "are"], ans: 2, exp: "Colleagues = they, so use are." },
      { type: "fitb", q: "She ___ (be) a doctor.", ans: "is", exp: "Use is for she." },
      { type: "unscramble", words: ["is", "She", "engineer", "an"], ans: "She is an engineer", exp: "Order: Subject + Verb + Article + Noun." }
    ]
  },
  {
    l: "A1", t: "Present simple routines", cat: "Present tenses",
    desc: "Describe daily routines, habits and general facts.",
    rule: "I/You/We/They + base verb | He/She/It + verb-s",
    ex: ["I work in Lima.", "She teaches English.", "Do you speak English?"],
    tip: "In negative sentences use don't / doesn't + base verb.",
    qs: [
      { type: "mc", q: "She ___ English every day.", opts: ["study", "studies", "studying"], ans: 1, exp: "Study changes to studies for she." },
      { type: "fitb", q: "They ___ (not / work) on Sundays.", ans: "don't work", exp: "Use don't + base verb for they." },
      { type: "unscramble", words: ["like", "Do", "coffee", "you"], ans: "Do you like coffee", exp: "Question structure with Do." }
    ]
  },
  {
    l: "A2", t: "Past simple & Irregular verbs", cat: "Past tenses",
    desc: "Talk about finished events in the past.",
    rule: "Subject + verb-ed OR irregular past form",
    ex: ["We visited the site yesterday.", "Did you call the supervisor?", "I didn't see the message."],
    tip: "After did / didn't, always use the base form of the verb.",
    qs: [
      { type: "mc", q: "I ___ the report last night.", opts: ["write", "wrote", "written"], ans: 1, exp: "Past simple of write is wrote." },
      { type: "fitb", q: "Did she ___ (send) the email?", ans: "send", exp: "After did, use the base verb." },
      { type: "error", q: "They didn't went to the meeting.", ans: "They didn't go to the meeting.", exp: "Correct 'went' to 'go' after didn't." }
    ]
  },
  {
    l: "A2", t: "Comparatives and superlatives", cat: "Adjectives",
    desc: "Compare people, places and items.",
    rule: "short + er/est | more/most + long adjective",
    ex: ["This route is shorter.", "It is the most comfortable room.", "My phone is better."],
    tip: "Irregular: good → better → best, bad → worse → worst.",
    qs: [
      { type: "mc", q: "This exercise is ___ than the last one.", opts: ["easy", "easier", "easiest"], ans: 1, exp: "Use easier than for comparisons." },
      { type: "fitb", q: "That is the ___ (good) option.", ans: "best", exp: "Superlative of good is best." }
    ]
  },
  {
    l: "B1", t: "First and second conditionals", cat: "Conditionals",
    desc: "Talk about real future possibilities and imaginary scenarios.",
    rule: "First: If + present, will + verb | Second: If + past, would + verb",
    ex: ["If it rains, we'll stay inside.", "If I had more time, I'd learn French."],
    tip: "Do not put will immediately after 'if'.",
    qs: [
      { type: "mc", q: "If I finish early, I ___ you.", opts: ["call", "will call", "would call"], ans: 1, exp: "First conditional uses will call." },
      { type: "fitb", q: "If I ___ (be) rich, I would travel the world.", ans: "were", exp: "Second conditional uses 'were' for all subjects in formal style." }
    ]
  },
  {
    l: "B2", t: "Passive voice in business context", cat: "Advanced structures",
    desc: "Focus on the action or result rather than the agent.",
    rule: "be + past participle",
    ex: ["The report was sent yesterday.", "Safety procedures are reviewed regularly."],
    tip: "Use 'by' only when the person or cause is important.",
    qs: [
      { type: "mc", q: "The documents ___ yesterday.", opts: ["sent", "were sent", "are sending"], ans: 1, exp: "Past passive requires were + past participle." },
      { type: "error", q: "The contract was sign by the manager.", ans: "The contract was signed by the manager.", exp: "Use past participle 'signed'." }
    ]
  },
  {
    l: "C1", t: "Inversion for emphasis", cat: "Advanced grammar",
    desc: "Use negative adverbials at sentence beginnings for formal emphasis.",
    rule: "Negative adverbial + auxiliary + subject + main verb",
    ex: ["Never have I seen such dedication.", "Rarely do we encounter this issue."],
    tip: "Inversion reverses word order just like a question form.",
    qs: [
      { type: "mc", q: "Rarely ___ such a dedicated team.", opts: ["I have seen", "have I seen", "I saw"], ans: 1, exp: "After 'rarely', invert auxiliary and subject." },
      { type: "fitb", q: "Not only ___ he arrive late, but he forgot the key.", ans: "did", exp: "Use auxiliary 'did' for past simple inversion." }
    ]
  }
];

// Data: Vocabulary Sets
const vocab = [
  {
    l: "A1", topic: "Daily life & Workplace",
    words: [
      ["routine", "rutina", "I have a busy morning routine."],
      ["usually", "usualmente", "I usually take the bus."],
      ["colleague", "colega de trabajo", "My colleague is very helpful."],
      ["schedule", "horario / agenda", "Our schedule starts at eight."]
    ]
  },
  {
    l: "A2", topic: "Travel & Services",
    words: [
      ["reservation", "reserva", "I made a hotel reservation."],
      ["suitcase", "maleta", "My suitcase is heavy."],
      ["abroad", "en el extranjero", "Have you ever studied abroad?"],
      ["delay", "retraso", "The flight has a short delay."]
    ]
  },
  {
    l: "B1", topic: "Workplace & Management",
    words: [
      ["deadline", "fecha límite", "We must meet the project deadline."],
      ["reliable", "confiable", "She is a very reliable employee."],
      ["improve", "mejorar", "We want to improve quality."]
    ]
  },
  {
    l: "B2", topic: "Opinion & Argumentation",
    words: [
      ["drawback", "desventaja", "One drawback is the high cost."],
      ["evidence", "evidencia", "We need empirical evidence."],
      ["feasible", "viable / factible", "The business plan is feasible."]
    ]
  },
  {
    l: "C1", topic: "Academic & Executive Speech",
    words: [
      ["compelling", "convincente", "He gave a compelling speech."],
      ["undermine", "debilitar / minar", "Do not undermine team morale."],
      ["subtle", "sutil", "There is a subtle difference."]
    ]
  }
];

// Data: Listening Passages
const listening = [
  {
    l: "A1", title: "Introducing a new colleague", kind: "Everyday conversation",
    text: "Hello everyone, my name is Alex. I am from Canada, but I live in Lima now. I work as a project coordinator. I start work at eight o'clock and finish at five. In my free time, I enjoy cooking and learning Spanish.",
    qs: [
      { q: "Where is Alex from?", opts: ["Lima", "Canada", "Spain"], ans: 1 },
      { q: "What time does Alex finish work?", opts: ["At five", "At eight", "At six"], ans: 0 }
    ]
  },
  {
    l: "A2", title: "Planning a team meeting", kind: "Workplace call",
    text: "Hi Sam, are you free this Thursday? We need to review the quarterly goals. Let's meet in Conference Room B at two o'clock. I will bring the printed reports, so please bring your laptop.",
    qs: [
      { q: "When will they meet?", opts: ["Wednesday", "Thursday", "Friday"], ans: 1 },
      { q: "Where is the meeting?", opts: ["Room A", "Room B", "Online"], ans: 1 }
    ]
  },
  {
    l: "B1", title: "Project update announcement", kind: "Presentation",
    text: "Good morning team. I want to share a quick update regarding our project timeline. Phase one is complete. However, due to shipping delays, phase two will begin next Wednesday instead of Monday. Please check your emails for the revised timetable.",
    qs: [
      { q: "Why was phase two delayed?", opts: ["Budget cuts", "Shipping delays", "Staff changes"], ans: 1 }
    ]
  },
  {
    l: "B2", title: "The benefits of remote collaboration", kind: "Radio interview",
    text: "Remote collaboration allows companies to hire talent globally without geographical boundaries. However, maintaining team cohesion requires proactive communication and clear goals. Without regular syncs, trust can diminish.",
    qs: [
      { q: "What is essential for remote teams?", opts: ["Longer work hours", "Proactive communication", "Strict supervision"], ans: 1 }
    ]
  },
  {
    l: "C1", title: "Sustainable Urban Design", kind: "Academic presentation",
    text: "Urban development should not be calculated purely by financial returns. True urban resilience incorporates green spaces, universal accessibility, and public transit efficiency. Reconciling stakeholder interests remains the core challenge for modern city planning.",
    qs: [
      { q: "What defines urban resilience according to the speaker?", opts: ["High property prices", "Green spaces & transit accessibility", "Industrial output"], ans: 1 }
    ]
  }
];

// Data: Reading Passages
const readings = [
  {
    l: "A1", title: "A day at the Marcona Office",
    text: "Sara works at a renewable energy plant. She arrives at seven in the morning and checks her emails. At noon, she has lunch with her team in the cafeteria. She loves her job because every day is different.",
    qs: [
      { q: "What time does Sara arrive?", opts: ["7:00 AM", "8:00 AM", "9:00 AM"], ans: 0 },
      { q: "Where does she have lunch?", opts: ["At home", "In the cafeteria", "In a restaurant"], ans: 1 }
    ]
  },
  {
    l: "A2", title: "Travel log: Cusco and Beyond",
    text: "Last winter, Carlos visited Cusco with his brother. They took a train to Machu Picchu early in the morning. Even though the altitude made walking difficult, the breathtaking view made the journey unforgettable.",
    qs: [
      { q: "Who did Carlos travel with?", opts: ["His supervisor", "His brother", "Alone"], ans: 1 }
    ]
  },
  {
    l: "B1", title: "Adapting to New Technologies",
    text: "When our company adopted a new software system, many employees were hesitant. Training sessions were organized twice a week to help everyone adapt. Within a month, productivity increased by twenty percent.",
    qs: [
      { q: "How often were training sessions held?", opts: ["Daily", "Twice a week", "Once a month"], ans: 1 }
    ]
  },
  {
    l: "B2", title: "Ethics in Modern Marketing",
    text: "Modern consumers demand transparency from brands. Marketing campaigns that exaggerate claims or hide fees face immediate backlash on social platforms. Ethical marketing is no longer just a legal obligation; it is a vital strategy for brand survival.",
    qs: [
      { q: "Why is ethical marketing important today?", opts: ["It is cheaper", "Consumers demand transparency", "It avoids paying taxes"], ans: 1 }
    ]
  },
  {
    l: "C1", title: "The Cognitive Impact of Multilingualism",
    text: "Cognitive research suggests that navigating multiple linguistic codes enhances executive function and mental flexibility. Multilingual individuals frequently demonstrate superior task-switching capabilities, as their brains continuously suppress inactive language systems.",
    qs: [
      { q: "What benefit of multilingualism is highlighted?", opts: ["Enhanced task-switching and flexibility", "Better eyesight", "Faster reading speeds"], ans: 0 }
    ]
  }
];


// Expanded CEFR-aligned content bank: additional grammar, vocabulary, reading and listening.
const epGrammarExpansion = [{"l": "A1", "t": "Articles: a, an, the", "cat": "Nouns and articles", "desc": "Choose articles for singular countable nouns and familiar references.", "rule": "a/an + singular countable noun; the + specific/known noun", "ex": ["I have a book.", "She is an architect.", "The book on the table is mine."], "tip": "Use an before a vowel sound, not simply a vowel letter.", "qs": [{"type": "mc", "q": "I need ___ umbrella.", "opts": ["a", "an", "the"], "ans": 1, "exp": "Umbrella begins with a vowel sound."}, {"type": "fitb", "q": "He is ___ teacher.", "ans": "a", "exp": "Use a before a consonant sound."}, {"type": "mc", "q": "Where is ___ phone I left here?", "opts": ["a", "an", "the"], "ans": 2, "exp": "The phone is specific."}]}, {"l": "A1", "t": "Plural nouns and demonstratives", "cat": "Nouns", "desc": "Name objects and distinguish near and far things.", "rule": "this/that + singular; these/those + plural", "ex": ["This is my bag.", "Those are my keys."], "tip": "Most nouns add -s; some have irregular plurals: child/children, person/people.", "qs": [{"type": "mc", "q": "___ are my shoes here.", "opts": ["This", "These", "That"], "ans": 1, "exp": "Use these with plural nouns."}, {"type": "fitb", "q": "One child, two ___.", "ans": "children", "exp": "Child has an irregular plural."}, {"type": "mc", "q": "Look at ___ house over there.", "opts": ["this", "these", "that"], "ans": 2, "exp": "Use that for a singular item farther away."}]}, {"l": "A1", "t": "Possessive adjectives and pronouns", "cat": "People and possessions", "desc": "Show who owns something.", "rule": "my/your/his/her/its/our/their + noun; mine/yours/his/hers/ours/theirs stand alone", "ex": ["This is my desk.", "That blue bag is hers."], "tip": "Do not use a possessive pronoun directly before a noun.", "qs": [{"type": "mc", "q": "This is ___ jacket.", "opts": ["I", "my", "mine"], "ans": 1, "exp": "A possessive adjective comes before a noun."}, {"type": "fitb", "q": "This pen is not yours; it is ___. (I)", "ans": "mine", "exp": "Use the possessive pronoun mine."}, {"type": "mc", "q": "They love ___ new home.", "opts": ["their", "theirs", "them"], "ans": 0, "exp": "Their is followed by a noun."}]}, {"l": "A1", "t": "There is / There are", "cat": "Describing places", "desc": "Say what exists in a room or place.", "rule": "There is + singular/uncountable; There are + plural", "ex": ["There is a café near here.", "There are two windows."], "tip": "Use Is there…? / Are there…? to ask questions.", "qs": [{"type": "mc", "q": "There ___ three chairs.", "opts": ["is", "are", "be"], "ans": 1, "exp": "Three chairs is plural."}, {"type": "fitb", "q": "___ there a bank near here?", "ans": "Is", "exp": "Use Is there with a singular noun."}, {"type": "mc", "q": "There isn’t ___ milk.", "opts": ["some", "any", "many"], "ans": 1, "exp": "Any is common in negatives."}]}, {"l": "A1", "t": "Can / can’t for ability and permission", "cat": "Abilities", "desc": "Talk about skills and simple permission.", "rule": "subject + can/can’t + base verb", "ex": ["I can swim.", "Can I open the window?"], "tip": "Can has the same form for all subjects and is followed by the base verb.", "qs": [{"type": "mc", "q": "She can ___ three languages.", "opts": ["speaks", "speak", "speaking"], "ans": 1, "exp": "Can + base verb."}, {"type": "fitb", "q": "___ you help me, please?", "ans": "Can", "exp": "Can forms a polite request."}, {"type": "mc", "q": "He ___ drive; he is only twelve.", "opts": ["can", "can’t", "doesn’t can"], "ans": 1, "exp": "Can’t expresses inability."}]}, {"l": "A1", "t": "Present continuous", "cat": "Actions now", "desc": "Describe actions happening now and temporary situations.", "rule": "am/is/are + verb-ing", "ex": ["They are studying now.", "I am staying with a friend this week."], "tip": "Remember spelling changes: make/making, run/running, lie/lying.", "qs": [{"type": "mc", "q": "Look! The baby ___.", "opts": ["cries", "is crying", "cry"], "ans": 1, "exp": "An action happening now uses present continuous."}, {"type": "fitb", "q": "We are ___ (have) lunch.", "ans": "having", "exp": "Have changes to having."}, {"type": "mc", "q": "I ___ at my aunt’s this week.", "opts": ["stay", "am staying", "stays"], "ans": 1, "exp": "A temporary situation."}]}, {"l": "A2", "t": "Present continuous vs present simple", "cat": "Present tenses", "desc": "Contrast habits with actions happening now or temporary situations.", "rule": "Present simple = routines/facts; present continuous = now/temporary", "ex": ["I usually walk to work.", "Today I am taking the bus."], "tip": "State verbs such as know, like and believe are not usually continuous.", "qs": [{"type": "mc", "q": "She usually ___ tea, but today she ___ coffee.", "opts": ["drinks / is having", "is drinking / has", "drink / having"], "ans": 0, "exp": "Habit + temporary action."}, {"type": "fitb", "q": "I ___ (not / understand) this question.", "ans": "don’t understand", "exp": "Understand is a state verb."}, {"type": "mc", "q": "Why ___ you ___?", "opts": ["do / laugh", "are / laughing", "does / laughing"], "ans": 1, "exp": "The action is happening now."}]}, {"l": "A2", "t": "Past continuous", "cat": "Narratives", "desc": "Set the scene and describe an action in progress in the past.", "rule": "was/were + verb-ing", "ex": ["I was cooking at eight.", "They were driving when it started to rain."], "tip": "Use past simple for the interrupting event and past continuous for the background action.", "qs": [{"type": "mc", "q": "I ___ when you called.", "opts": ["slept", "was sleeping", "am sleeping"], "ans": 1, "exp": "An action in progress in the past."}, {"type": "fitb", "q": "They were ___ (watch) a film.", "ans": "watching", "exp": "Were + verb-ing."}, {"type": "mc", "q": "While she ___, the lights went out.", "opts": ["studied", "was studying", "studies"], "ans": 1, "exp": "While often introduces the longer action."}]}, {"l": "A2", "t": "Present perfect: ever, never, just, already, yet", "cat": "Present perfect", "desc": "Talk about experiences and recent events.", "rule": "have/has + past participle", "ex": ["Have you ever tried sushi?", "I have just finished.", "She hasn’t arrived yet."], "tip": "Ever is common in questions; never means at no time; yet is common in questions and negatives.", "qs": [{"type": "mc", "q": "Have you ___ been to Brazil?", "opts": ["ever", "yet", "already"], "ans": 0, "exp": "Ever asks about life experience."}, {"type": "fitb", "q": "He has ___ finished his homework. (very recently)", "ans": "just", "exp": "Just indicates a recent event."}, {"type": "mc", "q": "We haven’t eaten ___.", "opts": ["already", "yet", "ever"], "ans": 1, "exp": "Yet is common at the end of negative sentences."}]}, {"l": "A2", "t": "Future plans: going to and present continuous", "cat": "Future forms", "desc": "Talk about intentions and fixed arrangements.", "rule": "be going to + base verb (intention); present continuous (arrangement)", "ex": ["I’m going to study tonight.", "We’re meeting Ana at six."], "tip": "Use will for spontaneous decisions and predictions; going to for prior intentions/evidence.", "qs": [{"type": "mc", "q": "We ___ the dentist at 3; it is booked.", "opts": ["see", "are seeing", "will seeing"], "ans": 1, "exp": "A fixed arrangement."}, {"type": "fitb", "q": "Look at those clouds! It ___ (rain).", "ans": "is going to rain", "exp": "A prediction based on present evidence."}, {"type": "mc", "q": "I’ve decided: I ___ a new course.", "opts": ["am going to take", "taking", "am take"], "ans": 0, "exp": "A prior intention."}]}, {"l": "A2", "t": "Quantifiers: much, many, a lot of, a few, a little", "cat": "Quantity", "desc": "Describe amounts with countable and uncountable nouns.", "rule": "many + countable plural; much + uncountable; a few/a little = small positive amount", "ex": ["There aren’t many seats.", "We have a little time."], "tip": "A few is used with countable nouns; a little with uncountable nouns.", "qs": [{"type": "mc", "q": "How ___ water do we need?", "opts": ["many", "much", "few"], "ans": 1, "exp": "Water is uncountable."}, {"type": "fitb", "q": "There are ___ apples left. (small number)", "ans": "a few", "exp": "Apples are countable plural."}, {"type": "mc", "q": "We have ___ information.", "opts": ["a few", "many", "a little"], "ans": 2, "exp": "Information is uncountable."}]}, {"l": "A2", "t": "Comparatives, superlatives and as…as", "cat": "Comparison", "desc": "Compare people, places, objects and experiences.", "rule": "-er/more…than; the -est/the most; as + adjective + as", "ex": ["This route is safer than the old one.", "It is as interesting as the book."], "tip": "Use than after a comparative; use the before most superlatives.", "qs": [{"type": "mc", "q": "This is ___ restaurant in town.", "opts": ["the better", "the best", "best than"], "ans": 1, "exp": "Use the best for a superlative."}, {"type": "fitb", "q": "My bag is as ___ as yours. (heavy)", "ans": "heavy", "exp": "As…as uses the base adjective."}, {"type": "mc", "q": "A train is usually ___ than a bus.", "opts": ["fast", "faster", "fastest"], "ans": 1, "exp": "Comparative + than."}]}, {"l": "B1", "t": "Present perfect vs past simple", "cat": "Narrative tenses", "desc": "Choose between life experience/current relevance and a finished past time.", "rule": "Present perfect: have/has + participle; past simple: V2 / -ed", "ex": ["I have visited Arequipa twice.", "I visited Arequipa in 2022."], "tip": "Do not use present perfect with finished time expressions such as yesterday or last year.", "qs": [{"type": "mc", "q": "I ___ her in 2020.", "opts": ["have met", "met", "meet"], "ans": 1, "exp": "A finished past time takes past simple."}, {"type": "fitb", "q": "They have never ___ (fly) abroad.", "ans": "flown", "exp": "Use the past participle after have."}, {"type": "mc", "q": "How long ___ you lived here?", "opts": ["did", "have", "are"], "ans": 1, "exp": "How long asks about a situation continuing to now."}]}, {"l": "B1", "t": "Past perfect", "cat": "Narrative sequence", "desc": "Show that one past event happened before another.", "rule": "had + past participle", "ex": ["The train had left before we arrived.", "She was tired because she had worked late."], "tip": "Use past perfect for the earlier event when the sequence needs clarification.", "qs": [{"type": "mc", "q": "By the time we arrived, the film ___.", "opts": ["started", "had started", "has started"], "ans": 1, "exp": "The film started before we arrived."}, {"type": "fitb", "q": "He had ___ (forget) his passport.", "ans": "forgotten", "exp": "Forgotten is the past participle."}, {"type": "mc", "q": "I didn’t recognise her because she ___.", "opts": ["changed", "had changed", "has changed"], "ans": 1, "exp": "The change happened before the recognition."}]}, {"l": "B1", "t": "Used to and would for past habits", "cat": "Past habits", "desc": "Describe repeated past actions and past states.", "rule": "used to + base verb; would + base verb for repeated actions", "ex": ["I used to live near the sea.", "Every summer, we would visit my grandparents."], "tip": "Used to works for states; would is not normally used for past states.", "qs": [{"type": "mc", "q": "I ___ have long hair when I was young.", "opts": ["would", "used to", "use to"], "ans": 1, "exp": "Used to describes a past state."}, {"type": "fitb", "q": "Every Sunday, we ___ (play) football.", "ans": "would play", "exp": "Would can describe repeated past actions."}, {"type": "mc", "q": "She ___ like coffee, but now she does.", "opts": ["didn’t use to", "wouldn’t used to", "wasn’t use to"], "ans": 0, "exp": "Negative form: didn’t use to."}]}, {"l": "B1", "t": "Second and third conditionals", "cat": "Hypothetical situations", "desc": "Discuss unreal present situations and imagined past outcomes.", "rule": "Second: if + past, would + base; Third: if + past perfect, would have + participle", "ex": ["If I had more time, I would travel.", "If we had left earlier, we would have arrived on time."], "tip": "The third conditional looks back at an impossible past alternative.", "qs": [{"type": "mc", "q": "If I had studied harder, I ___ the exam.", "opts": ["would pass", "would have passed", "will pass"], "ans": 1, "exp": "Third conditional: would have + participle."}, {"type": "fitb", "q": "If she ___ (be) here, she would help.", "ans": "were", "exp": "Second conditional uses were in formal hypothetical clauses."}, {"type": "mc", "q": "If I won the lottery, I ___ a house.", "opts": ["buy", "would buy", "would have bought"], "ans": 1, "exp": "Imaginary present/future situation."}]}, {"l": "B1", "t": "Relative clauses", "cat": "Complex sentences", "desc": "Add information about people, things and places.", "rule": "who (people), which (things), that (people/things), where (places), whose (possession)", "ex": ["The woman who called is my manager.", "That is the café where we met."], "tip": "Defining relative clauses identify the noun; non-defining clauses add extra information.", "qs": [{"type": "mc", "q": "A pilot is someone ___ flies a plane.", "opts": ["which", "who", "where"], "ans": 1, "exp": "Who refers to people."}, {"type": "fitb", "q": "That is the house ___ I grew up.", "ans": "where", "exp": "Where refers to a place."}, {"type": "mc", "q": "The book, ___ I bought yesterday, is excellent.", "opts": ["which", "who", "whose"], "ans": 0, "exp": "Which refers to things."}]}, {"l": "B1", "t": "Reported speech: statements and questions", "cat": "Reporting", "desc": "Report what someone said without using their exact words.", "rule": "say/tell + (that) clause; reported questions use statement word order", "ex": ["“I am tired.” → She said she was tired.", "“Where do you live?” → He asked where I lived."], "tip": "Pronouns and time expressions may change; questions do not keep question word order.", "qs": [{"type": "mc", "q": "“I can swim.” → He said he ___ swim.", "opts": ["can", "could", "will"], "ans": 1, "exp": "Can often shifts back to could."}, {"type": "fitb", "q": "“Where is the station?” → She asked where the station ___.", "ans": "was", "exp": "Reported question uses statement order."}, {"type": "mc", "q": "She ___ me that she was busy.", "opts": ["said", "told", "spoke"], "ans": 1, "exp": "Tell is followed by an object: told me."}]}, {"l": "B2", "t": "Future continuous and future perfect", "cat": "Advanced future forms", "desc": "Describe an action in progress or completed by a future time.", "rule": "will be + -ing; will have + past participle", "ex": ["This time tomorrow, I’ll be flying.", "By June, we’ll have completed the course."], "tip": "Use by + future time with the future perfect.", "qs": [{"type": "mc", "q": "By next Friday, they ___ the project.", "opts": ["will finish", "will have finished", "are finish"], "ans": 1, "exp": "Completion before a future deadline."}, {"type": "fitb", "q": "At 8 p.m. I ___ (work).", "ans": "will be working", "exp": "Future continuous describes an action in progress."}, {"type": "mc", "q": "This time next week, we ___ on holiday.", "opts": ["will relax", "will be relaxing", "relaxed"], "ans": 1, "exp": "An activity in progress at a future time."}]}, {"l": "B2", "t": "Mixed conditionals", "cat": "Complex conditionals", "desc": "Connect an unreal past condition with a present result, or vice versa.", "rule": "If + past perfect, would + base (past condition/present result)", "ex": ["If I had taken that job, I would live abroad now."], "tip": "Check the time reference in each clause before choosing the conditional form.", "qs": [{"type": "mc", "q": "If I had gone to bed earlier, I ___ so tired now.", "opts": ["wouldn’t be", "wouldn’t have been", "am not"], "ans": 0, "exp": "Past condition with a present result."}, {"type": "fitb", "q": "If she were more organised, she ___ (not / miss) the deadline yesterday.", "ans": "wouldn’t have missed", "exp": "Present condition with a past result."}, {"type": "mc", "q": "If we had booked earlier, we ___ there now.", "opts": ["would be", "will be", "were"], "ans": 0, "exp": "Past condition, present consequence."}]}, {"l": "B2", "t": "Passive reporting structures", "cat": "Formal grammar", "desc": "Report beliefs, claims and general opinions impersonally.", "rule": "It + passive reporting verb + that…; subject + passive reporting verb + to-infinitive", "ex": ["It is believed that the painting is genuine.", "The painting is believed to be genuine."], "tip": "Common verbs: believe, report, expect, know, consider, say.", "qs": [{"type": "mc", "q": "The minister ___ to be considering the proposal.", "opts": ["is said", "says", "is saying"], "ans": 0, "exp": "Passive reporting structure."}, {"type": "fitb", "q": "It is ___ that prices will rise. (expect)", "ans": "expected", "exp": "It is expected that…"}, {"type": "mc", "q": "The building is believed ___ in the 18th century.", "opts": ["to build", "to have been built", "being built"], "ans": 1, "exp": "Use perfect passive infinitive for an earlier event."}]}, {"l": "B2", "t": "Participle clauses", "cat": "Concise writing", "desc": "Reduce clauses and make written English more concise.", "rule": "-ing participle for active meaning; past participle for passive meaning", "ex": ["Walking home, I saw an old friend.", "Built in 1890, the house has been restored."], "tip": "The understood subject of the participle clause should match the main clause subject.", "qs": [{"type": "mc", "q": "___ by the news, she called her family.", "opts": ["Hearing", "Heard", "To hear"], "ans": 1, "exp": "Past participle gives a passive meaning."}, {"type": "fitb", "q": "___ (walk) through the park, we found a café.", "ans": "Walking", "exp": "The subject is we in both clauses."}, {"type": "mc", "q": "The man ___ at the desk is the director.", "opts": ["sit", "sitting", "sat"], "ans": 1, "exp": "Present participle describes an active action."}]}, {"l": "B2", "t": "Cleft sentences and emphasis", "cat": "Emphasis", "desc": "Highlight specific information in speech and writing.", "rule": "It is/was + focus + that/who…; What + clause + be…", "ex": ["It was Maya who suggested the idea.", "What I need is a little more time."], "tip": "Cleft structures help organise information and correct misunderstandings.", "qs": [{"type": "mc", "q": "___ I dislike is the lack of clarity.", "opts": ["What", "Which", "That what"], "ans": 0, "exp": "What-clause acts as the subject."}, {"type": "fitb", "q": "It was the manager ___ approved the request.", "ans": "who", "exp": "Who refers to a person."}, {"type": "mc", "q": "It was yesterday ___ we received the news.", "opts": ["who", "where", "that"], "ans": 2, "exp": "That introduces the focused time expression."}]}, {"l": "B2", "t": "Modal verbs of deduction", "cat": "Speculation", "desc": "Make deductions about present and past situations.", "rule": "must be / might be / can’t be; must have / might have / can’t have + participle", "ex": ["She must be at home.", "They might have missed the train."], "tip": "Must expresses strong positive deduction; can’t expresses strong negative deduction.", "qs": [{"type": "mc", "q": "The lights are off. They ___ be at home.", "opts": ["must", "can’t", "should"], "ans": 1, "exp": "Strong evidence suggests they are not at home."}, {"type": "fitb", "q": "He looks exhausted. He ___ have slept well.", "ans": "can’t", "exp": "Can’t have expresses an impossible past deduction."}, {"type": "mc", "q": "She hasn’t replied; she ___ be busy.", "opts": ["might", "mustn’t", "can’t have"], "ans": 0, "exp": "Might expresses possibility."}]}, {"l": "C1", "t": "Advanced inversion", "cat": "Emphasis and style", "desc": "Use inversion after negative or restrictive adverbials for formal emphasis.", "rule": "Negative adverbial + auxiliary + subject + verb", "ex": ["Rarely have I witnessed such generosity.", "Under no circumstances should you disclose the code."], "tip": "Inversion is common in formal writing and emphatic speech.", "qs": [{"type": "mc", "q": "Not until midnight ___ the guests leave.", "opts": ["the guests did", "did the guests", "the guests"], "ans": 1, "exp": "Not until at the beginning triggers inversion."}, {"type": "fitb", "q": "Seldom ___ we see such dedication.", "ans": "do", "exp": "Present simple inversion uses do."}, {"type": "mc", "q": "Under no circumstances ___ the door be left open.", "opts": ["should", "it should", "should it"], "ans": 0, "exp": "Modal precedes subject."}]}, {"l": "C1", "t": "Subjunctive and mandative structures", "cat": "Formal recommendations", "desc": "Express demands, recommendations and necessities in formal contexts.", "rule": "suggest/recommend/insist + that + subject + base verb; It is essential that…", "ex": ["They recommended that he apply again.", "It is vital that every member be informed."], "tip": "The mandative subjunctive uses the base form, including be.", "qs": [{"type": "mc", "q": "The committee insisted that he ___ present.", "opts": ["is", "be", "was"], "ans": 1, "exp": "Mandative subjunctive uses base form."}, {"type": "fitb", "q": "It is essential that she ___ (attend) the hearing.", "ans": "attend", "exp": "Base form after essential that."}, {"type": "mc", "q": "I suggest that the report ___ revised.", "opts": ["is", "be", "being"], "ans": 1, "exp": "Be + past participle forms the passive subjunctive."}]}, {"l": "C1", "t": "Advanced hedging and stance", "cat": "Academic communication", "desc": "Qualify claims and signal degrees of certainty.", "rule": "may/might/seem/appear/tend to; it is likely/possible that…", "ex": ["The findings appear to indicate a gradual shift.", "This may partly explain the difference."], "tip": "Hedging makes academic claims appropriately cautious rather than absolute.", "qs": [{"type": "mc", "q": "The results ___ suggest a link, although more research is needed.", "opts": ["definitely", "may", "must"], "ans": 1, "exp": "May expresses cautious possibility."}, {"type": "fitb", "q": "The evidence appears ___ support the hypothesis.", "ans": "to", "exp": "Appear + to-infinitive."}, {"type": "mc", "q": "It ___ that the policy has had limited impact.", "opts": ["would appear", "appears to be", "is appearing"], "ans": 0, "exp": "Would appear is a cautious stance phrase."}]}, {"l": "C1", "t": "Nominalisation", "cat": "Academic style", "desc": "Turn verbs and adjectives into nouns to create concise formal prose.", "rule": "analyse → analysis; decide → decision; fail → failure", "ex": ["The team analysed the data. → The team conducted an analysis of the data."], "tip": "Avoid excessive nominalisation when it makes writing less direct.", "qs": [{"type": "mc", "q": "Which is the nominal form of “approve”?", "opts": ["approval", "approvingly", "approved"], "ans": 0, "exp": "Approval is the noun."}, {"type": "fitb", "q": "The company decided to expand. → The company made a ___ to expand.", "ans": "decision", "exp": "Decision is the noun form."}, {"type": "mc", "q": "“The system failed” → “The ___ of the system”", "opts": ["failure", "failing", "failed"], "ans": 0, "exp": "Failure is the noun."}]}, {"l": "C1", "t": "Advanced concessive clauses", "cat": "Argumentation", "desc": "Express contrast and unexpected results with nuanced linking devices.", "rule": "although/even though/while/whereas; much as; however/nevertheless", "ex": ["Much as I admire the proposal, I have reservations.", "The plan is ambitious; nevertheless, it is achievable."], "tip": "Although introduces a clause; despite/in spite of are followed by a noun or -ing form.", "qs": [{"type": "mc", "q": "___ the cost, the project went ahead.", "opts": ["Although", "Despite", "However"], "ans": 1, "exp": "Despite + noun phrase."}, {"type": "fitb", "q": "Much as I ___ (appreciate) your help, I cannot agree.", "ans": "appreciate", "exp": "Much as + subject + verb."}, {"type": "mc", "q": "The evidence was limited. ___, the conclusion was persuasive.", "opts": ["Despite", "Nevertheless", "Although"], "ans": 1, "exp": "Nevertheless links contrasting sentences."}]}, {"l": "C1", "t": "Ellipsis and substitution", "cat": "Cohesion", "desc": "Avoid repetition by omitting recoverable words or using substitute forms.", "rule": "so/not, do so, one/ones, that/those", "ex": ["I think so.", "She promised to call, and she did.", "I prefer the blue ones."], "tip": "Use substitution only when the reference is clear to the reader.", "qs": [{"type": "mc", "q": "“Will they win?” “I hope ___.”", "opts": ["to", "so", "it"], "ans": 1, "exp": "Hope so substitutes for the expected clause."}, {"type": "fitb", "q": "I wanted to complain, but I didn’t ___ so.", "ans": "do", "exp": "Do so substitutes for the repeated action."}, {"type": "mc", "q": "The climate here is milder than ___ in the north.", "opts": ["that", "those", "one"], "ans": 0, "exp": "That substitutes for a singular noun."}]}];
const epVocabExpansion = [{"l": "A1", "topic": "Personal information", "words": [["first name", "nombre", "My first name is Ana."], ["surname", "apellido", "My surname is Ruiz."], ["address", "dirección", "What is your address?"], ["nationality", "nacionalidad", "What is your nationality?"], ["married", "casado/a", "My sister is married."], ["single", "soltero/a", "He is single."]]}, {"l": "A1", "topic": "Family and relationships", "words": [["parents", "padres", "My parents live nearby."], ["daughter", "hija", "Their daughter is six."], ["husband", "esposo", "Her husband is a teacher."], ["wife", "esposa", "His wife is from Chile."], ["cousin", "primo/a", "My cousin studies medicine."], ["grandparents", "abuelos", "We visit our grandparents."]]}, {"l": "A1", "topic": "Food and drink", "words": [["bread", "pan", "I buy fresh bread."], ["cheese", "queso", "Would you like some cheese?"], ["vegetables", "verduras", "Eat more vegetables."], ["hungry", "hambriento/a", "I am hungry."], ["thirsty", "sediento/a", "Are you thirsty?"], ["menu", "carta / menú", "Can I see the menu?"]]}, {"l": "A1", "topic": "Home and furniture", "words": [["kitchen", "cocina", "The kitchen is small."], ["bedroom", "dormitorio", "My bedroom is upstairs."], ["shelf", "estante", "The books are on the shelf."], ["sofa", "sofá", "The sofa is comfortable."], ["upstairs", "arriba / en el piso superior", "The bathroom is upstairs."], ["near", "cerca", "The bank is near my house."]]}, {"l": "A2", "topic": "Travel and transport", "words": [["platform", "andén", "The train leaves from platform four."], ["return ticket", "billete de ida y vuelta", "I need a return ticket."], ["boarding pass", "tarjeta de embarque", "Show your boarding pass."], ["luggage", "equipaje", "Our luggage is heavy."], ["journey", "trayecto / viaje", "The journey takes two hours."], ["sightseeing", "visitas turísticas", "We went sightseeing yesterday."]]}, {"l": "A2", "topic": "Health and the body", "words": [["headache", "dolor de cabeza", "I have a terrible headache."], ["cough", "tos", "This cough is keeping me awake."], ["appointment", "cita", "I have a doctor’s appointment."], ["painful", "doloroso", "My knee is painful."], ["medicine", "medicina", "Take this medicine twice a day."], ["healthy", "saludable", "A balanced diet is healthy."]]}, {"l": "A2", "topic": "Shopping and services", "words": [["receipt", "recibo", "Keep your receipt."], ["refund", "reembolso", "Can I get a refund?"], ["exchange", "cambio", "I would like to exchange this shirt."], ["cash", "efectivo", "Do you accept cash?"], ["discount", "descuento", "There is a student discount."], ["customer", "cliente", "The customer asked for help."]]}, {"l": "A2", "topic": "Weather and environment", "words": [["forecast", "pronóstico", "The forecast says it will rain."], ["cloudy", "nublado", "It is cloudy today."], ["windy", "ventoso", "It is too windy for a picnic."], ["temperature", "temperatura", "The temperature is rising."], ["recycle", "reciclar", "We recycle paper and glass."], ["pollution", "contaminación", "Air pollution is a serious problem."]]}, {"l": "B1", "topic": "Personality and relationships", "words": [["considerate", "considerado/a", "It was considerate of you to call."], ["stubborn", "terco/a", "He can be stubborn sometimes."], ["reliable", "fiable", "She is reliable and organised."], ["get along", "llevarse bien", "I get along with my neighbours."], ["fall out", "pelearse", "They fell out over money."], ["supportive", "que brinda apoyo", "My friends are very supportive."]]}, {"l": "B1", "topic": "Education and learning", "words": [["assignment", "tarea / trabajo", "The assignment is due on Friday."], ["qualification", "titulación", "The job requires a qualification."], ["attend", "asistir", "All students must attend."], ["revise", "repasar", "I revise before every exam."], ["drop out", "abandonar los estudios", "He dropped out of university."], ["take notes", "tomar apuntes", "I take notes during lectures."]]}, {"l": "B1", "topic": "Media and technology", "words": [["device", "dispositivo", "This device connects to Wi-Fi."], ["privacy", "privacidad", "Online privacy matters."], ["download", "descargar", "Download the document."], ["reliable source", "fuente fiable", "Check whether it is a reliable source."], ["update", "actualización", "Install the latest update."], ["screen time", "tiempo de pantalla", "I try to limit my screen time."]]}, {"l": "B1", "topic": "Feelings and reactions", "words": [["disappointed", "decepcionado/a", "I was disappointed with the result."], ["relieved", "aliviado/a", "She felt relieved after the test."], ["embarrassed", "avergonzado/a", "He was embarrassed by his mistake."], ["overwhelmed", "abrumado/a", "I felt overwhelmed by the workload."], ["grateful", "agradecido/a", "I am grateful for your help."], ["frustrated", "frustrado/a", "They were frustrated by the delay."]]}, {"l": "B2", "topic": "Debate and argument", "words": [["counterargument", "contraargumento", "A strong counterargument deserves a response."], ["compelling", "convincente", "The speaker made a compelling case."], ["flawed", "defectuoso", "The argument is based on flawed assumptions."], ["evidence-based", "basado en pruebas", "We need an evidence-based approach."], ["concede", "admitir", "I concede that the cost is high."], ["rebuttal", "refutación", "Her rebuttal was concise."]]}, {"l": "B2", "topic": "Work and organisations", "words": [["stakeholder", "parte interesada", "Every stakeholder was consulted."], ["turnover", "rotación", "Staff turnover has decreased."], ["workload", "carga de trabajo", "The workload is manageable."], ["allocate", "asignar", "We need to allocate resources."], ["feasible", "viable", "The proposal is financially feasible."], ["accountability", "rendición de cuentas", "Accountability builds trust."]]}, {"l": "B2", "topic": "Society and change", "words": [["inequality", "desigualdad", "The report examines social inequality."], ["awareness", "conciencia", "The campaign raised awareness."], ["sustainable", "sostenible", "Cities need sustainable transport."], ["implementation", "implementación", "Implementation will take six months."], ["widespread", "generalizado", "There is widespread concern."], ["consequence", "consecuencia", "We must consider every consequence."]]}, {"l": "B2", "topic": "Science and research", "words": [["findings", "hallazgos", "The findings were published."], ["sample", "muestra", "The sample included 500 people."], ["bias", "sesgo", "Researchers tried to avoid bias."], ["correlation", "correlación", "Correlation does not prove causation."], ["assess", "evaluar", "The study assesses the impact."], ["significant", "significativo", "The difference was statistically significant."]]}, {"l": "C1", "topic": "Academic argumentation", "words": [["nuanced", "matizado", "Her analysis offers a nuanced perspective."], ["corroborate", "corroborar", "Further data corroborate the claim."], ["tentative", "provisional", "The conclusions remain tentative."], ["contention", "afirmación / tesis", "I challenge the central contention."], ["plausible", "verosímil", "That is a plausible explanation."], ["substantiated", "fundamentado", "The allegation was not substantiated."]]}, {"l": "C1", "topic": "Idiomatic language", "words": [["to a large extent", "en gran medida", "To a large extent, the policy succeeded."], ["take something with a pinch of salt", "tomar algo con cautela", "Take online reviews with a pinch of salt."], ["the tip of the iceberg", "la punta del iceberg", "These costs are just the tip of the iceberg."], ["a double-edged sword", "arma de doble filo", "Technology can be a double-edged sword."], ["to play devil’s advocate", "hacer de abogado del diablo", "Let me play devil’s advocate."], ["by and large", "en general", "By and large, the results were positive."]]}, {"l": "C1", "topic": "Public policy and institutions", "words": [["account for", "explicar / representar", "Several factors account for the change."], ["underpin", "sustentar", "Trust underpins effective institutions."], ["safeguard", "salvaguardar", "The law safeguards individual rights."], ["disparity", "disparidad", "There is a marked disparity in access."], ["regulatory", "regulatorio", "The sector faces regulatory pressure."], ["provision", "disposición / prestación", "The provision of public services varies."]]}, {"l": "C1", "topic": "Precision and evaluation", "words": [["ambiguous", "ambiguo", "The wording is ambiguous."], ["inherent", "inherente", "There are inherent risks."], ["detrimental", "perjudicial", "The delay was detrimental to morale."], ["exacerbate", "agravar", "The decision could exacerbate tensions."], ["mitigate", "mitigar", "These measures may mitigate the impact."], ["pervasive", "generalizado / omnipresente", "Digital media has a pervasive influence."]]}];
const epReadingExpansion = [{"l": "A1", "title": "A new neighbourhood", "kind": "Everyday life", "text": "My name is Elena and I moved to a new neighbourhood two weeks ago. There is a small supermarket opposite my building and a bus stop around the corner. On Saturdays, I usually go to the market with my brother. We buy fruit, vegetables and bread. In the afternoon, I sometimes meet my neighbours in the park. I like living here because everything is close and the people are friendly.", "qs": [{"q": "Where is the supermarket?", "opts": ["Opposite Elena’s building", "Inside the park", "Next to the school"], "ans": 0}, {"q": "When does Elena go to the market?", "opts": ["On Fridays", "On Saturdays", "On Sundays"], "ans": 1}, {"q": "Why does she like the neighbourhood?", "opts": ["It is very quiet at night", "Everything is close and people are friendly", "Her office is there"], "ans": 1}]}, {"l": "A1", "title": "A simple weekend plan", "kind": "Leisure", "text": "Tom and his friends are planning their weekend. On Saturday morning, they are going to play basketball at the sports centre. After lunch, Tom is meeting his cousin at a café. On Sunday, he wants to stay at home because he has an English test on Monday. His friends are going to watch a film, but Tom cannot go with them.", "qs": [{"q": "What are they doing on Saturday morning?", "opts": ["Playing basketball", "Watching a film", "Studying English"], "ans": 0}, {"q": "Who is Tom meeting after lunch?", "opts": ["His teacher", "His cousin", "His brother"], "ans": 1}, {"q": "Why is Tom staying home on Sunday?", "opts": ["He is ill", "He has an English test", "He is working"], "ans": 1}]}, {"l": "A2", "title": "A delayed journey", "kind": "Travel", "text": "Last month, Nina travelled to Trujillo by bus. The journey usually takes eight hours, but heavy rain caused a delay. The bus arrived three hours late. Nina was tired, but she had a book and downloaded some podcasts before leaving. When she finally arrived, her aunt was waiting at the bus station. Nina decided to travel by plane next time if she could find a reasonable ticket.", "qs": [{"q": "How did Nina travel?", "opts": ["By train", "By bus", "By plane"], "ans": 1}, {"q": "What caused the delay?", "opts": ["Heavy rain", "A traffic accident", "A mechanical problem"], "ans": 0}, {"q": "What might Nina do next time?", "opts": ["Drive herself", "Travel by plane", "Cancel the trip"], "ans": 1}]}, {"l": "A2", "title": "A healthier routine", "kind": "Health and lifestyle", "text": "Rafael used to skip breakfast and go to bed very late. Recently, he has changed his routine. He now prepares breakfast the night before and walks for thirty minutes after work. He has also reduced the amount of coffee he drinks. He says he has more energy, although changing old habits has not always been easy.", "qs": [{"q": "What did Rafael use to do?", "opts": ["Exercise every morning", "Skip breakfast", "Cook lunch"], "ans": 1}, {"q": "When does he walk?", "opts": ["Before work", "At lunchtime", "After work"], "ans": 2}, {"q": "How does he feel now?", "opts": ["More energetic", "More stressed", "Less active"], "ans": 0}]}, {"l": "B1", "title": "Learning beyond the classroom", "kind": "Education", "text": "When a community centre started a free language exchange, the organisers expected only a few participants. Instead, people of different ages began attending every week. Some wanted to improve their English for work, while others were interested in meeting people from different backgrounds. Participants take turns teaching words and expressions from their own languages. The organisers say the most valuable result has been the confidence people gain when communicating with others.", "qs": [{"q": "Why did people join the exchange?", "opts": ["Only to prepare for exams", "For work or social reasons", "To become professional teachers"], "ans": 1}, {"q": "How do participants contribute?", "opts": ["They take turns sharing their languages", "They pay for private lessons", "They study alone"], "ans": 0}, {"q": "What do organisers consider the main benefit?", "opts": ["Higher salaries", "More grammar tests", "Greater confidence"], "ans": 2}]}, {"l": "B1", "title": "The impact of everyday choices", "kind": "Environment", "text": "Individual actions cannot solve environmental problems on their own, but they can influence wider change. Choosing public transport, repairing objects instead of replacing them and reducing food waste are practical steps. However, responsibility should not fall entirely on individuals. Local authorities and businesses also need to make sustainable choices easier and more affordable. Progress is more likely when personal habits are supported by effective public policies.", "qs": [{"q": "What is the writer’s main point?", "opts": ["Only governments can act", "Individual and institutional action both matter", "Small actions are useless"], "ans": 1}, {"q": "Which action is mentioned?", "opts": ["Buying more packaging", "Repairing objects", "Driving longer distances"], "ans": 1}, {"q": "What helps personal habits have a wider impact?", "opts": ["Supportive public policies", "More advertising", "Higher prices"], "ans": 0}]}, {"l": "B2", "title": "The changing nature of work", "kind": "Society and work", "text": "Flexible working arrangements are often presented as an uncomplicated benefit. Employees may save commuting time and gain greater control over their schedules. Yet flexibility can blur the boundary between professional and private life, particularly when expectations about availability remain unclear. Organisations that introduce hybrid work successfully tend to establish explicit communication norms, evaluate outcomes rather than visibility, and ensure that remote employees have equal access to development opportunities.", "qs": [{"q": "What risk of flexible work is identified?", "opts": ["Less access to technology", "Blurred work-life boundaries", "Lower professional standards"], "ans": 1}, {"q": "What should organisations evaluate?", "opts": ["Employee visibility", "Outcomes", "Time spent online"], "ans": 1}, {"q": "What supports equal opportunity?", "opts": ["Development access for remote staff", "More office meetings", "Longer working hours"], "ans": 0}]}, {"l": "B2", "title": "Why cities need green spaces", "kind": "Urban development", "text": "Urban green spaces are sometimes treated as decorative additions rather than essential infrastructure. In reality, parks and tree-lined streets can reduce heat, absorb rainwater and provide places for physical activity. Their benefits, however, are not distributed equally. Lower-income neighbourhoods often have fewer accessible green areas, despite facing greater exposure to environmental stress. Urban planners therefore need to consider not only how much green space a city contains, but also who can reach and enjoy it.", "qs": [{"q": "How are green spaces sometimes viewed?", "opts": ["As essential infrastructure", "As decorative additions", "As commercial centres"], "ans": 1}, {"q": "Which benefit is mentioned?", "opts": ["Reducing urban heat", "Increasing traffic", "Raising rents"], "ans": 0}, {"q": "What inequality does the text highlight?", "opts": ["Unequal access to green areas", "Unequal access to offices", "Unequal park maintenance costs"], "ans": 0}]}, {"l": "C1", "title": "The limits of measuring progress", "kind": "Critical thinking", "text": "The appeal of numerical indicators lies in their apparent objectivity: they compress complex realities into figures that can be compared over time. Nevertheless, what is measurable is not necessarily what matters most. A school may report improved test scores while overlooking curiosity, collaboration or intellectual independence. Metrics are therefore most useful when interpreted alongside qualitative evidence and a clear understanding of the purposes they are intended to serve.", "qs": [{"q": "What is the central criticism of numerical indicators?", "opts": ["They are always inaccurate", "They may overlook important qualities", "They cannot be compared"], "ans": 1}, {"q": "What example illustrates this limitation?", "opts": ["A school focusing on test scores", "A company reducing costs", "A city building a park"], "ans": 0}, {"q": "What does the writer recommend?", "opts": ["Abandoning all measurement", "Using figures alongside qualitative evidence", "Comparing only annual results"], "ans": 1}]}, {"l": "C1", "title": "Language, identity and belonging", "kind": "Culture", "text": "Language is more than a vehicle for exchanging information; it can also signal affiliation, distance and belonging. Speakers routinely adjust their vocabulary, pronunciation and level of formality according to context, often without conscious deliberation. Such accommodation may foster solidarity, but it can also expose unequal expectations about whose speech is regarded as legitimate. A nuanced understanding of language therefore requires attention to both communicative choices and the social values attached to them.", "qs": [{"q": "What can language signal besides information?", "opts": ["Affiliation and belonging", "Only educational level", "Geographical distance alone"], "ans": 0}, {"q": "Why do speakers adapt their language?", "opts": ["To avoid all variation", "To respond to context", "To use more difficult words"], "ans": 1}, {"q": "What issue does the text raise?", "opts": ["Unequal judgements about speech", "The disappearance of writing", "The cost of translation"], "ans": 0}]}];
const epListeningExpansion = [{"l": "A1", "title": "At the café", "kind": "Everyday conversation", "text": "Hello. Can I have a cheese sandwich and an orange juice, please? Of course. Would you like anything else? No, thank you. How much is that? It is six pounds fifty. Here you are. Thank you. Have a nice day. You too. Goodbye.", "qs": [{"q": "What does the customer order?", "opts": ["A cheese sandwich and orange juice", "A coffee and cake", "A salad and water"], "ans": 0}, {"q": "How much does it cost?", "opts": ["Six pounds", "Six pounds fifty", "Seven pounds"], "ans": 1}, {"q": "Does the customer order anything else?", "opts": ["Yes, a cake", "Yes, a coffee", "No"], "ans": 2}]}, {"l": "A1", "title": "Finding the classroom", "kind": "Directions", "text": "Excuse me, where is Room 12? Go straight along this corridor and turn left at the library. Room 12 is opposite the computer room. Is it on the first floor? No, it is on the ground floor. Thank you very much. You’re welcome.", "qs": [{"q": "Where should the listener turn?", "opts": ["Right", "Left", "At the stairs"], "ans": 1}, {"q": "What is Room 12 opposite?", "opts": ["The library", "The computer room", "The office"], "ans": 1}, {"q": "Which floor is it on?", "opts": ["Ground floor", "First floor", "Second floor"], "ans": 0}]}, {"l": "A2", "title": "Changing a reservation", "kind": "Travel and services", "text": "Good afternoon. I have a reservation for two nights, from the twelfth to the fourteenth. I’m afraid I need to change it. I would like to arrive on the thirteenth and stay until the sixteenth. Let me check. Yes, we have a room available. The price is slightly higher because Saturday is included. That’s fine. Could you email me the new confirmation?", "qs": [{"q": "What is the guest changing?", "opts": ["A restaurant order", "A hotel reservation", "A train ticket"], "ans": 1}, {"q": "What are the new dates?", "opts": ["12th–14th", "13th–16th", "14th–16th"], "ans": 1}, {"q": "Why is the price higher?", "opts": ["The room is larger", "Saturday is included", "Breakfast is included"], "ans": 1}]}, {"l": "A2", "title": "A message about a course", "kind": "Education", "text": "Hi, it’s Laura. I’m calling about the evening English course. The first class is next Tuesday, not Monday as we originally planned. It starts at half past six and finishes at eight. Please bring a notebook, but you don’t need to buy the course book yet. The teacher will explain which edition to get in the first lesson.", "qs": [{"q": "When is the first class?", "opts": ["Monday", "Tuesday", "Wednesday"], "ans": 1}, {"q": "What time does it start?", "opts": ["6:00", "6:30", "8:00"], "ans": 1}, {"q": "What should students bring?", "opts": ["A course book", "A laptop", "A notebook"], "ans": 2}]}, {"l": "B1", "title": "A community project update", "kind": "Announcements", "text": "Thanks for joining the call. We have made good progress with the community garden. The raised beds are ready, and volunteers planted the first vegetables last weekend. We are still waiting for the water connection, so please do not bring any more plants until we confirm the installation date. In the meantime, we need two people to help design the information signs. If you are interested, send me a message by Thursday.", "qs": [{"q": "What has already been completed?", "opts": ["The water connection", "The raised beds", "The information signs"], "ans": 1}, {"q": "Why should volunteers wait before bringing plants?", "opts": ["There is no water connection yet", "The garden is closed", "The soil is unsuitable"], "ans": 0}, {"q": "What help is needed now?", "opts": ["Transporting tools", "Designing signs", "Buying vegetables"], "ans": 1}]}, {"l": "B1", "title": "A podcast about learning habits", "kind": "Education and ideas", "text": "Many learners believe that studying for longer automatically leads to better results. However, research on memory suggests that short, spaced practice sessions can be more effective than one long session. It also helps to retrieve information from memory instead of simply rereading notes. This is why a quick self-test can be useful, even when you make mistakes. The important thing is to return to the material regularly.", "qs": [{"q": "What study method is recommended?", "opts": ["One long session", "Short, spaced sessions", "Only rereading notes"], "ans": 1}, {"q": "What does retrieval practice involve?", "opts": ["Testing what you remember", "Copying a textbook", "Listening without a task"], "ans": 0}, {"q": "Why can mistakes be useful?", "opts": ["They replace revision", "They show what needs more practice", "They guarantee success"], "ans": 1}]}, {"l": "B2", "title": "A radio discussion on public transport", "kind": "Interview", "text": "Host: Is investment in public transport simply a matter of building more lines? Expert: Not at all. Infrastructure matters, but reliability, affordability and connections between services are equally important. A new station is of limited value if buses do not connect with it or fares exclude low-income passengers. Host: So planning needs to be integrated? Expert: Exactly. Transport policy should be coordinated with housing and employment decisions, otherwise improvements may benefit only a narrow group.", "qs": [{"q": "What does the expert say is equally important as infrastructure?", "opts": ["Reliability, affordability and connections", "Car parking and advertising", "Private ownership"], "ans": 0}, {"q": "When may a new station have limited value?", "opts": ["When it is underground", "When services do not connect or fares exclude people", "When it is busy"], "ans": 1}, {"q": "Which policies should be coordinated?", "opts": ["Transport, housing and employment", "Tourism and sport", "Education and health only"], "ans": 0}]}, {"l": "B2", "title": "A presentation on online information", "kind": "Media literacy", "text": "We are exposed to an extraordinary volume of information, but access should not be confused with understanding. Before sharing a claim, consider who produced it, what evidence is offered and whether independent sources reach similar conclusions. Images can be taken out of context, and headlines may exaggerate what an article actually says. A brief pause to verify a source can prevent misleading information from spreading.", "qs": [{"q": "What distinction does the speaker make?", "opts": ["Access is not the same as understanding", "Images are always reliable", "Headlines contain all the evidence"], "ans": 0}, {"q": "What should listeners examine?", "opts": ["The author’s popularity only", "Source, evidence and independent confirmation", "The length of the article"], "ans": 1}, {"q": "What is the purpose of pausing to verify?", "opts": ["To write a longer post", "To prevent misleading information spreading", "To avoid reading articles"], "ans": 1}]}, {"l": "C1", "title": "A lecture on cultural heritage", "kind": "Academic lecture", "text": "Cultural heritage is often invoked as though it were a fixed inheritance, passed intact from one generation to the next. In practice, communities continually reinterpret what they preserve, how they present it and whose histories are foregrounded. Conservation decisions are therefore never entirely technical; they involve competing values and choices about representation. Recognising this does not undermine the importance of preservation. Rather, it makes the process more transparent and inclusive.", "qs": [{"q": "How does the lecturer challenge the idea of heritage?", "opts": ["It is fixed and unchanged", "It is continually reinterpreted", "It has no social value"], "ans": 1}, {"q": "Why are conservation decisions not purely technical?", "opts": ["They involve competing values", "They require no expertise", "They are always temporary"], "ans": 0}, {"q": "What does transparency aim to support?", "opts": ["Exclusion", "More inclusive preservation", "Less public discussion"], "ans": 1}]}, {"l": "C1", "title": "An interview about artificial intelligence", "kind": "Technology and society", "text": "Interviewer: Should we regard automated systems as neutral decision-makers? Researcher: That would be premature. Such systems reflect the data, assumptions and priorities embedded in their design. Even when their outputs appear consistent, the criteria may reproduce historical inequalities. This does not mean automation should be rejected outright; it means institutions must be able to explain decisions, audit outcomes and provide meaningful routes of appeal.", "qs": [{"q": "Why might automated systems reproduce inequalities?", "opts": ["They are too slow", "Their data and design may embed existing assumptions", "They always ignore data"], "ans": 1}, {"q": "What is the researcher’s position?", "opts": ["Reject all automation", "Adopt it without limits", "Use it with explanation, audits and appeals"], "ans": 2}, {"q": "What does “routes of appeal” refer to?", "opts": ["Ways to challenge a decision", "Methods to speed up software", "Training data sources"], "ans": 0}]}];
grammar.push(...epGrammarExpansion);
vocab.push(...epVocabExpansion);
readings.push(...epReadingExpansion);
listening.push(...epListeningExpansion);
let activeVocabTopic = 0, activeListeningIndex = 0, activeReadingIndex = 0;

// Storage Persistence Helper
function saveAllData() {
  localStorage.setItem("ep_done", JSON.stringify(done));
  localStorage.setItem("ep_scores", JSON.stringify(scores));
  localStorage.setItem("ep_assignments", JSON.stringify(assignments));
  localStorage.setItem("ep_custom_ex", JSON.stringify(customExercises));
  localStorage.setItem("ep_homework", JSON.stringify(homeworkList));
  localStorage.setItem("ep_lessons", JSON.stringify(lessonPlans));
  localStorage.setItem("ep_notes", JSON.stringify(journalNotes));
  localStorage.setItem("ep_level", currentLevel);
}

// Navigation Handler
function setPage(p) {
  currentPage = p;
  $$("[data-page]").forEach(x => x.classList.toggle("active", x.dataset.page === p));
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function chooseLevel(l) {
  currentLevel = l;
  flashIndex = 0; activeVocabTopic = 0; activeListeningIndex = 0; activeReadingIndex = 0;
  stopAudio();
  saveAllData();
  const el = $("#activeLevelBadge");
  if (el) el.textContent = l;
  render();
}

function levelPicker() {
  return `
    <div class="level-grid">
      ${levels.map(l => `
        <button class="level-card ${currentLevel === l ? 'selected' : ''}" onclick="chooseLevel('${l}')">
          <strong>${l}</strong>
          <span>${levelNames[l]}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function pageHeader(eyebrow, title, desc) {
  return `
    <div class="section-head">
      <div>
        <div class="eyebrow" style="color:var(--teal)">${eyebrow}</div>
        <h2>${title}</h2>
        <p>${desc}</p>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------
// PAGE RENDERERS
// ---------------------------------------------------------------------

// 1. HOME DASHBOARD
function renderHome() {
  const completedCount = done.length;
  const homeworkPending = homeworkList.filter(h => h.level === currentLevel).length;

  return `
    <section class="hero">
      <div class="eyebrow">Interactive Language Learning Suite</div>
      <h1>Master English with Precision & Confidence.</h1>
      <p>Comprehensive CEFR curriculum (A1 to C1) with real-time exercises, vocabulary flashcards, speaking prompts, and an integrated Teacher Studio.</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn light" onclick="setPage('library')">Explore Learning Resources →</button>
        <button class="btn ghost" onclick="setPage('student')">✏️ My Practice Sandbox</button>
      </div>
    </section>

    <div class="stats">
      <div class="stat"><b>${completedCount}</b><span>Activities Completed</span></div>
      <div class="stat"><b>${currentLevel}</b><span>Active Level</span></div>
      <div class="stat"><b>${homeworkPending}</b><span>Pending Homework Tasks</span></div>
      <div class="stat"><b>${customExercises.length}</b><span>Custom Teacher Items</span></div>
    </div>

    ${pageHeader("Select CEFR Level", "Where would you like to focus?", "Choose your level to filter exercises, readings, and vocabulary.")}
    ${levelPicker()}

    ${pageHeader("Skill Areas", "What do you want to train today?", "Select any domain to practice immediately.")}
    <div class="resource-grid">
      ${[
        ['Grammar', '✎', 'Master rules, tenses, fill-in-the-blanks, and error correction.', 'grammar'],
        ['Vocabulary', '▦', 'Flashcards with 3D flip, audio, and example sentences.', 'vocabulary'],
        ['Listening', '♫', 'Audio recordings with custom playback speed & quizzes.', 'listening'],
        ['Reading', '▤', 'Graded reading passages and comprehension drills.', 'reading'],
        ['Speaking', '◉', 'Guided prompts with voice audio support.', 'speaking'],
        ['Writing', '✉', 'Submit essays and paragraphs directly to your teacher.', 'writing']
      ].map(a => `
        <article class="resource" onclick="setPage('${a[3]}')">
          <span class="tag">${a[1]} Skill Module</span>
          <h3>${a[0]}</h3>
          <p>${a[2]}</p>
          <div class="resource-foot">
            <span>Level ${currentLevel}</span>
            <b>Start Practice →</b>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

// 2. LEARNING LIBRARY
function renderLibrary() {
  return `
    ${pageHeader("Resource Library", "Curriculum Overview", "Explore all available learning assets by category.")}
    ${levelPicker()}
    <div class="filters">
      ${["All", "Grammar", "Vocabulary", "Listening", "Reading"].map(x => `
        <button class="chip ${currentFilter === x ? 'active' : ''}" onclick="currentFilter='${x}';render()">${x}</button>
      `).join("")}
    </div>
    <div class="resource-grid">
      ${renderLibraryCards()}
    </div>
  `;
}

function renderLibraryCards() {
  let list = [];
  if (currentFilter === "All" || currentFilter === "Grammar") {
    grammar.filter(x => x.l === currentLevel).forEach(x => list.push({ tag: "Grammar", title: x.t, desc: x.desc, page: "grammar" }));
    customExercises.filter(x => x.level === currentLevel && x.type === "Grammar").forEach(x => list.push({ tag: "Custom Grammar", title: x.title, desc: x.desc, page: "grammar" }));
  }
  if (currentFilter === "All" || currentFilter === "Vocabulary") {
    vocab.filter(x => x.l === currentLevel).forEach(x => list.push({ tag: "Vocabulary", title: x.topic, desc: "Interactive vocabulary flashcards.", page: "vocabulary" }));
  }
  if (currentFilter === "All" || currentFilter === "Listening") {
    listening.filter(x => x.l === currentLevel).forEach(x => list.push({ tag: "Listening", title: x.title, desc: "Audio comprehension task.", page: "listening" }));
  }
  if (currentFilter === "All" || currentFilter === "Reading") {
    readings.filter(x => x.l === currentLevel).forEach(x => list.push({ tag: "Reading", title: x.title, desc: "Reading comprehension passage.", page: "reading" }));
  }

  if (list.length === 0) return `<div class="empty">No resources found for level ${currentLevel} with filter '${currentFilter}'.</div>`;

  return list.map(x => `
    <article class="resource" onclick="setPage('${x.page}')">
      <span class="tag">${x.tag} · ${currentLevel}</span>
      <h3>${x.title}</h3>
      <p>${x.desc}</p>
      <div class="resource-foot">
        <span>${levelNames[currentLevel]}</span>
        <b>Open Module →</b>
      </div>
    </article>
  `).join("");
}

// 3. GRAMMAR MODULE
function renderGrammar() {
  const stdGrammar = grammar.filter(x => x.l === currentLevel);
  const custGrammar = customExercises.filter(x => x.level === currentLevel && x.type === "Grammar");

  return `
    ${pageHeader("Grammar Studio", "Structure & Accuracy", "Learn grammar rules and solve interactive exercise formats.")}
    ${levelPicker()}
    <div class="resource-grid">
      ${stdGrammar.map(x => `
        <article class="resource" onclick="openGrammarModal('${x.t.replace(/'/g, "\\'")}')">
          <span class="tag">${x.cat} · ${x.l}</span>
          <h3>${x.t}</h3>
          <p>${x.desc}</p>
          <div class="resource-foot">
            <span>${x.qs.length} Questions</span>
            <b>Study & Practice →</b>
          </div>
        </article>
      `).join("")}

      ${custGrammar.map(x => `
        <article class="resource" style="border-color:var(--teal)" onclick="openCustomGrammarModal(${x.id})">
          <span class="tag" style="color:var(--blue)">Teacher Assigned · ${x.level}</span>
          <h3>${x.title}</h3>
          <p>${x.desc}</p>
          <div class="resource-foot">
            <span>Custom Task</span>
            <b>Solve Task →</b>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function openGrammarModal(title) {
  const item = grammar.find(g => g.t === title);
  if (!item) return;

  const bodyHTML = `
    <p class="muted">${item.desc}</p>
    <div class="grammar-block">
      <h3>Grammar Formula</h3>
      <div class="formula">${item.rule}</div>
    </div>
    <div class="grammar-block">
      <h3>Examples in Context</h3>
      ${item.ex.map(e => `<div class="example">${e}</div>`).join("")}
    </div>
    <div class="tip"><strong>💡 Teacher Tip:</strong> ${item.tip}</div>

    <div class="exercise">
      <h3>Interactive Practice Exercises</h3>
      ${item.qs.map((q, idx) => renderInteractiveQuestion(q, idx)).join("")}
      <button class="btn" onclick="checkGrammarAnswers('g-${item.t.replace(/\s+/g, "_")}')">Check Answers</button>
      <div id="score-g-${item.t.replace(/\s+/g, "_")}" class="feedback"></div>
    </div>
  `;

  window.currentQuizQuestions = item.qs;
  window.currentQuizId = 'g-' + item.t.replace(/\s+/g, "_");
  showModal(`GRAMMAR · ${item.l}`, item.t, bodyHTML);
}

function openCustomGrammarModal(id) {
  const item = customExercises.find(c => c.id === id);
  if (!item) return;

  const bodyHTML = `
    <p class="muted">${item.desc}</p>
    <div class="exercise">
      <h3>Teacher Exercise</h3>
      <p style="white-space:pre-wrap;margin-bottom:14px">${item.content}</p>
      <div class="field">
        <label>Your Answer / Sentence</label>
        <textarea id="customAnsInput" placeholder="Type your full answer here..."></textarea>
      </div>
      <button class="btn" onclick="submitCustomGrammarAnswer(${item.id})">Submit to Teacher</button>
    </div>
  `;
  showModal(`TEACHER EXERCISE · ${item.level}`, item.title, bodyHTML);
}

function submitCustomGrammarAnswer(id) {
  const ans = $("#customAnsInput").value.trim();
  if (!ans) { alert("Please type your answer before submitting."); return; }

  assignments.push({
    id: Date.now(),
    title: `Custom Exercise ID: ${id}`,
    body: ans,
    level: currentLevel,
    date: new Date().toLocaleDateString(),
    feedback: "",
    score: null,
    status: "Submitted"
  });
  saveAllData();
  alert("Your answer has been submitted to your teacher!");
  closeModal();
}

// Universal Question Renderer
function renderInteractiveQuestion(q, idx) {
  if (q.type === "mc" || !q.type) {
    return `
      <div class="q" data-q="${idx}" data-type="mc">
        <p>${idx + 1}. ${q.q}</p>
        <div class="options">
          ${q.opts.map((o, j) => `<button class="option" data-answer="${j}" onclick="selectOption(this)">${o}</button>`).join("")}
        </div>
        <div class="feedback" data-feedback></div>
      </div>
    `;
  } else if (q.type === "fitb") {
    return `
      <div class="q" data-q="${idx}" data-type="fitb" data-ans="${q.ans}">
        <p>${idx + 1}. ${q.q.replace("___", `<input type="text" class="fitb-input" data-fitb-idx="${idx}">`)}</p>
        <div class="feedback" data-feedback></div>
      </div>
    `;
  } else if (q.type === "unscramble") {
    return `
      <div class="q" data-q="${idx}" data-type="unscramble" data-ans="${q.ans}">
        <p>${idx + 1}. Unscramble: <em>(${q.words.join(" / ")})</em></p>
        <input type="text" class="fitb-input" style="width:100%" placeholder="Type full ordered sentence here..." data-unscramble-idx="${idx}">
        <div class="feedback" data-feedback></div>
      </div>
    `;
  } else if (q.type === "error") {
    return `
      <div class="q" data-q="${idx}" data-type="error" data-ans="${q.ans}">
        <p>${idx + 1}. Correct the sentence error: <em>"${q.q}"</em></p>
        <input type="text" class="fitb-input" style="width:100%" placeholder="Type corrected sentence..." data-error-idx="${idx}">
        <div class="feedback" data-feedback></div>
      </div>
    `;
  }
}

function selectOption(btn) {
  const group = btn.closest(".options");
  group.querySelectorAll(".option").forEach(b => b.classList.remove("chosen"));
  btn.classList.add("chosen");
}

function checkGrammarAnswers(quizId) {
  const questions = window.currentQuizQuestions || [];
  let correctCount = 0;

  questions.forEach((q, i) => {
    const row = $(`[data-q="${i}"]`);
    if (!row) return;

    const fb = row.querySelector("[data-feedback]");
    const type = q.type || "mc";

    if (type === "mc") {
      const chosen = row.querySelector(".option.chosen");
      row.querySelectorAll(".option").forEach(b => {
        b.classList.remove("correct", "wrong");
        if (+b.dataset.answer === q.ans) b.classList.add("correct");
      });

      if (chosen && +chosen.dataset.answer === q.ans) {
        correctCount++;
        fb.textContent = "✓ Correct! " + (q.exp || "");
        fb.style.color = "var(--green)";
      } else {
        if (chosen) chosen.classList.add("wrong");
        fb.textContent = "✗ Incorrect. " + (q.exp || "");
        fb.style.color = "var(--red)";
      }
    } else if (type === "fitb") {
      const input = row.querySelector(".fitb-input");
      const val = input ? input.value.trim().toLowerCase() : "";
      const expected = q.ans.toLowerCase();

      if (val === expected) {
        correctCount++;
        fb.textContent = "✓ Correct!";
        fb.style.color = "var(--green)";
      } else {
        fb.textContent = `✗ Incorrect. Expected: "${q.ans}"`;
        fb.style.color = "var(--red)";
      }
    } else if (type === "unscramble" || type === "error") {
      const input = row.querySelector("input");
      const val = input ? input.value.trim().toLowerCase().replace(/[.,!]/g, "") : "";
      const expected = q.ans.toLowerCase().replace(/[.,!]/g, "");

      if (val === expected) {
        correctCount++;
        fb.textContent = "✓ Excellent sentence construction!";
        fb.style.color = "var(--green)";
      } else {
        fb.textContent = `✗ Correct form: "${q.ans}"`;
        fb.style.color = "var(--red)";
      }
    }
  });

  const pct = Math.round((correctCount / questions.length) * 100);
  scores[quizId] = pct;

  if (pct >= 70 && !done.includes(quizId)) {
    done.push(quizId);
  }
  saveAllData();

  const scoreEl = $("#score-" + quizId);
  if (scoreEl) {
    scoreEl.textContent = `Result: ${correctCount}/${questions.length} (${pct}%). ${pct >= 70 ? "Great job! Activity completed." : "Try again to reach 70%!"}`;
  }
}

// 4. VOCABULARY MODULE (FLIP CARDS & PRACTICE)
let flashIndex = 0;
function renderVocabulary() {
  const items = vocab.filter(x => x.l === currentLevel);
  if (!items.length) return pageHeader("Vocabulary Builder", "Word Bank", "No vocabulary sets yet.");
  activeVocabTopic = Math.min(activeVocabTopic, items.length - 1);
  const item = items[activeVocabTopic];
  const words = item.words;
  const currentWord = words[flashIndex] || words[0];
  return `
    ${pageHeader("Vocabulary Builder", "Interactive Word Bank", "Build vocabulary by topic, learn words in context and practise pronunciation.")}
    ${levelPicker()}
    <div class="filters">${items.map((x,i)=>`<button class="chip ${i===activeVocabTopic?'active':''}" onclick="activeVocabTopic=${i};flashIndex=0;render();">${x.topic}</button>`).join('')}</div>
    <div class="content-card">
      <div class="crumb">${currentLevel} · ${item.topic} · ${words.length} words</div>
      <div class="flashcard-container" id="flashCardBox" onclick="this.classList.toggle('flipped')">
        <div class="flashcard-inner"><div class="flashcard-front"><span class="level-label" style="margin-bottom:10px">Card ${flashIndex+1} of ${words.length} · Click to flip</span><strong>${currentWord[0]}</strong><button class="btn small ghost" onclick="event.stopPropagation();speakText('${currentWord[0].replace(/'/g,"\\'")}')">🔊 Audio</button></div>
        <div class="flashcard-back"><span class="level-label" style="background:rgba(255,255,255,.2);color:white;margin-bottom:10px">Meaning</span><p>${currentWord[1]}</p><small style="font-style:italic">“${currentWord[2]}”</small></div></div>
      </div>
      <div class="filters" style="justify-content:center;margin-top:16px">${words.map((w,i)=>`<button class="chip ${i===flashIndex?'active':''}" onclick="flashIndex=${i};render();">${i+1}</button>`).join('')}</div>
      <div class="exercise" style="margin-top:24px"><h3>Word List & Examples</h3>${words.map(w=>`<div class="q" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px"><div><strong>${w[0]}</strong> <span class="muted">— ${w[1]}</span><div class="muted" style="font-size:13px">${w[2]}</div></div><button class="btn small outline" onclick="speakText('${w[0].replace(/'/g,"\\'")}')">🔊 Pronounce</button></div>`).join('')}</div>
    </div>`;
}

// 5. LISTENING MODULE
function renderListening() {
  const items = listening.filter(x => x.l === currentLevel);
  if (!items.length) return pageHeader("Listening Lab", "Comprehension", "No listening activities yet.");
  activeListeningIndex = Math.min(activeListeningIndex, items.length-1);
  const item = items[activeListeningIndex];
  return `${pageHeader("Listening Lab", "Comprehension & Ear Training", "Listen for gist, specific information, attitude and key details.")}${levelPicker()}
    <div class="filters">${items.map((x,i)=>`<button class="chip ${i===activeListeningIndex?'active':''}" onclick="activeListeningIndex=${i};render();">${x.title}</button>`).join('')}</div>
    <div class="content-card"><div class="crumb">${currentLevel} · ${item.kind} · Track ${activeListeningIndex+1} of ${items.length}</div><h2>${item.title}</h2>
      <div class="audio-player"><button class="play" id="playBtn" onclick="toggleAudio()">▶</button><div class="audio-meta"><strong>Listening track · Text-to-speech</strong><small id="audioStatus">Listen first, then answer without reading.</small></div><div class="audio-controls"><label class="muted">Speed</label><select id="speed" onchange="setSpeed(this.value)"><option value="0.8">0.8×</option><option value="1.0" selected>1.0×</option><option value="1.2">1.2×</option></select><button class="btn outline small" onclick="stopAudio()">Stop</button></div></div>
      <button class="btn ghost small" onclick="toggleTranscript()">📄 Show / hide transcript</button><div class="transcript" id="transcript" hidden>${item.text}</div>
      <div class="exercise"><h3>Comprehension Questions</h3>${item.qs.map((q,idx)=>`<div class="q" data-q="${idx}"><p>${idx+1}. ${q.q}</p><div class="options">${q.opts.map((o,j)=>`<button class="option" data-answer="${j}" onclick="selectOption(this)">${o}</button>`).join('')}</div><div class="feedback" data-feedback></div></div>`).join('')}<button class="btn" onclick="checkListeningQuiz('l-${currentLevel}-${activeListeningIndex}')">Submit Answers</button><div id="score-l-${currentLevel}-${activeListeningIndex}" class="feedback"></div></div>
    </div>`;
}

function toggleTranscript() {
  const t = $("#transcript");
  if (t) t.hidden = !t.hidden;
}

function checkListeningQuiz(quizId) {
  const item = listening.filter(x => x.l === currentLevel)[activeListeningIndex] || listening[0];
  let correctCount = 0;

  item.qs.forEach((q, i) => {
    const row = $(`[data-q="${i}"]`);
    if (!row) return;
    const chosen = row.querySelector(".option.chosen");
    const fb = row.querySelector("[data-feedback]");

    row.querySelectorAll(".option").forEach(b => {
      b.classList.remove("correct", "wrong");
      if (+b.dataset.answer === q.ans) b.classList.add("correct");
    });

    if (chosen && +chosen.dataset.answer === q.ans) {
      correctCount++;
      fb.textContent = "✓ Correct!";
      fb.style.color = "var(--green)";
    } else {
      if (chosen) chosen.classList.add("wrong");
      fb.textContent = "✗ Incorrect.";
      fb.style.color = "var(--red)";
    }
  });

  const pct = Math.round((correctCount / item.qs.length) * 100);
  scores[quizId] = pct;
  if (pct >= 70 && !done.includes(quizId)) done.push(quizId);
  saveAllData();

  $("#score-" + quizId).textContent = `Score: ${correctCount}/${item.qs.length} (${pct}%)`;
}

// 6. READING MODULE
function renderReading() {
  const items = readings.filter(x => x.l === currentLevel);
  if (!items.length) return pageHeader("Reading Studio", "Text Comprehension", "No reading activities yet.");
  activeReadingIndex = Math.min(activeReadingIndex, items.length-1);
  const item = items[activeReadingIndex];
  return `${pageHeader("Reading Studio", "Text Comprehension", "Practise skimming, scanning, inference, vocabulary in context and identifying the writer’s purpose.")}${levelPicker()}
    <div class="filters">${items.map((x,i)=>`<button class="chip ${i===activeReadingIndex?'active':''}" onclick="activeReadingIndex=${i};render();">${x.title}</button>`).join('')}</div>
    <div class="content-card"><div class="crumb">${currentLevel} · Reading ${activeReadingIndex+1} of ${items.length}</div><h2>${item.title}</h2><p style="font-size:16px;line-height:1.8;background:#fbfdfe;padding:18px;border-radius:12px;border:1px solid var(--line)">${item.text}</p>
      <div class="exercise"><h3>Comprehension Questions</h3>${item.qs.map((q,idx)=>`<div class="q" data-q="${idx}"><p>${idx+1}. ${q.q}</p><div class="options">${q.opts.map((o,j)=>`<button class="option" data-answer="${j}" onclick="selectOption(this)">${o}</button>`).join('')}</div><div class="feedback" data-feedback></div></div>`).join('')}<button class="btn" onclick="checkReadingQuiz('r-${currentLevel}-${activeReadingIndex}')">Check Comprehension</button><div id="score-r-${currentLevel}-${activeReadingIndex}" class="feedback"></div></div>
    </div>`;
}

function checkReadingQuiz(quizId) {
  const item = readings.filter(x => x.l === currentLevel)[activeReadingIndex] || readings[0];
  let correct = 0;

  item.qs.forEach((q, i) => {
    const row = $(`[data-q="${i}"]`);
    if (!row) return;
    const chosen = row.querySelector(".option.chosen");
    const fb = row.querySelector("[data-feedback]");

    row.querySelectorAll(".option").forEach(b => {
      b.classList.remove("correct", "wrong");
      if (+b.dataset.answer === q.ans) b.classList.add("correct");
    });

    if (chosen && +chosen.dataset.answer === q.ans) {
      correct++;
      fb.textContent = "✓ Correct!";
      fb.style.color = "var(--green)";
    } else {
      if (chosen) chosen.classList.add("wrong");
      fb.textContent = "✗ Incorrect";
      fb.style.color = "var(--red)";
    }
  });

  const pct = Math.round((correct / item.qs.length) * 100);
  scores[quizId] = pct;
  if (pct >= 70 && !done.includes(quizId)) done.push(quizId);
  saveAllData();

  $("#score-" + quizId).textContent = `Score: ${correct}/${item.qs.length} (${pct}%)`;
}

// 7. SPEAKING MODULE
function renderSpeaking() {
  const prompts = {
    A1: ["Introduce yourself and describe your job/studies.", "Describe your daily routine from morning to night."],
    A2: ["Describe your last vacation or weekend trip.", "Compare your hometown to another city."],
    B1: ["Discuss a problem you solved at work or school.", "Give advice to someone starting to learn English."],
    B2: ["Discuss the benefits and disadvantages of working remotely.", "Explain how technology affects modern communication."],
    C1: ["Critique the balance between economic development and environmental care.", "Defend your position on artificial intelligence in education."]
  };

  const list = prompts[currentLevel] || prompts["A1"];

  return `
    ${pageHeader("Speaking Workshop", "Fluency & Prompts", "Read the prompt, listen to the pronunciation, and practice speaking aloud.")}
    ${levelPicker()}

    <div class="content-card">
      <h2>Guided Prompts (${currentLevel})</h2>
      ${list.map((p, i) => `
        <div class="exercise">
          <span class="level-label">Speaking Topic ${i + 1}</span>
          <h3>${p}</h3>
          <div style="display:flex;gap:10px;margin-top:10px">
            <button class="btn ghost small" onclick="speakText('${p.replace(/'/g, "\\'")}')">🔊 Hear Prompt</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

// 8. WRITING SUBMISSION WORKSHOP
function renderWriting() {
  const prompts = {
    A1: "Write a short paragraph introducing yourself (40–60 words).",
    A2: "Write an email to a friend describing your last trip (60–90 words).",
    B1: "Write a proposal suggesting a change to your work or class schedule (100–140 words).",
    B2: "Write an essay discussing whether remote work improves productivity (150–200 words).",
    C1: "Write a critical report evaluating measuring performance in modern workplaces (200+ words)."
  };

  return `
    ${pageHeader("Writing Workshop", "Submission & Feedback", "Draft your response and submit it for your teacher to grade.")}
    ${levelPicker()}

    <div class="content-card">
      <div class="crumb">${currentLevel} · Writing Task</div>
      <h2>Task Instructions</h2>
      <p style="font-size:16px;font-weight:600;color:var(--navy)">${prompts[currentLevel]}</p>

      <div class="field">
        <label for="wtitle">Submission Title</label>
        <input id="wtitle" placeholder="e.g. My Remote Work Opinion Piece">
      </div>

      <div class="field">
        <label for="wtext">Your Composition</label>
        <textarea id="wtext" placeholder="Type your text here..." oninput="updateWordCount()"></textarea>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
        <span class="muted" id="wordCountLabel">0 words</span>
        <button class="btn" onclick="submitWritingTask()">Submit Task</button>
      </div>
    </div>
  `;
}

function updateWordCount() {
  const txt = $("#wtext").value.trim();
  const cnt = txt ? txt.split(/\s+/).length : 0;
  $("#wordCountLabel").textContent = `${cnt} words`;
}

function submitWritingTask() {
  const title = $("#wtitle").value.trim() || "Writing Assignment";
  const body = $("#wtext").value.trim();

  if (!body) { alert("Please write your task before submitting!"); return; }

  assignments.push({
    id: Date.now(),
    title,
    body,
    level: currentLevel,
    date: new Date().toLocaleDateString(),
    feedback: "",
    score: null,
    status: "Submitted"
  });

  saveAllData();
  alert("Your writing task has been successfully submitted!");
  $("#wtitle").value = "";
  $("#wtext").value = "";
  setPage("progress");
}

// ---------------------------------------------------------------------
// 9. STUDENT PRACTICE SANDBOX & HOMEWORK ROOM
// ---------------------------------------------------------------------
function renderStudentSandbox() {
  const assigned = homeworkList.filter(h => h.level === currentLevel);

  return `
    ${pageHeader("Student Activity Sandbox", "Homework & Self-Study Room", "Complete homework assigned by your teacher, record notes, and track daily goals.")}
    ${levelPicker()}

    <div class="subtabs">
      <button class="subtab active" onclick="switchStudentTab('hw', this)">📚 Assigned Homework (${assigned.length})</button>
      <button class="subtab" onclick="switchStudentTab('notes', this)">📓 Study Journal & Notes</button>
    </div>

    <div id="studentTabContent">
      ${renderStudentHomeworkTab(assigned)}
    </div>
  `;
}

function switchStudentTab(tab, btn) {
  $$(".subtab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const container = $("#studentTabContent");

  if (tab === "hw") {
    const assigned = homeworkList.filter(h => h.level === currentLevel);
    container.innerHTML = renderStudentHomeworkTab(assigned);
  } else if (tab === "notes") {
    container.innerHTML = renderStudentNotesTab();
  }
}

function renderStudentHomeworkTab(assigned) {
  if (assigned.length === 0) return `<div class="empty">No pending homework for level ${currentLevel}.</div>`;

  return `
    <div class="resource-grid">
      ${assigned.map(h => `
        <div class="exercise">
          <span class="level-label">${h.level} Homework</span>
          <h3>${h.title}</h3>
          <p class="muted">${h.desc}</p>
          <div class="notice">⏰ Due: ${h.dueDate || 'Flexible'}</div>
          <button class="btn small" onclick="openHomeworkModal(${h.id})">Solve & Submit</button>
        </div>
      `).join("")}
    </div>
  `;
}

function openHomeworkModal(id) {
  const item = homeworkList.find(h => h.id === id);
  if (!item) return;

  const bodyHTML = `
    <p>${item.desc}</p>
    <div class="field">
      <label>Your Homework Response</label>
      <textarea id="hwResponse" placeholder="Write your completed work here..."></textarea>
    </div>
    <button class="btn" onclick="submitHomeworkResponse(${item.id})">Send Submission</button>
  `;
  showModal(`HOMEWORK · ${item.level}`, item.title, bodyHTML);
}

function submitHomeworkResponse(id) {
  const item = homeworkList.find(h => h.id === id);
  const resp = $("#hwResponse").value.trim();
  if (!resp) { alert("Please complete the response field."); return; }

  assignments.push({
    id: Date.now(),
    title: `HW: ${item.title}`,
    body: resp,
    level: item.level,
    date: new Date().toLocaleDateString(),
    feedback: "",
    score: null,
    status: "Submitted"
  });

  saveAllData();
  alert("Homework submitted to your teacher!");
  closeModal();
}

function renderStudentNotesTab() {
  return `
    <div class="content-card">
      <h3>My Personal English Study Journal</h3>
      <div class="field">
        <label>Add New Study Note / Key Phrase</label>
        <textarea id="newNoteText" placeholder="Write grammar points or new words you learned today..."></textarea>
      </div>
      <button class="btn small" onclick="addJournalNote()">Save Note</button>

      <div style="margin-top:20px">
        <h4>Saved Notes (${journalNotes.length})</h4>
        ${journalNotes.length === 0 ? '<div class="empty">No notes saved yet.</div>' : journalNotes.map((n, i) => `
          <div class="example" style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <small class="muted">${n.date}</small>
              <p style="margin:4px 0">${n.text}</p>
            </div>
            <button class="btn small danger" onclick="deleteJournalNote(${i})">Delete</button>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function addJournalNote() {
  const txt = $("#newNoteText").value.trim();
  if (!txt) return;
  journalNotes.unshift({ text: txt, date: new Date().toLocaleDateString() });
  saveAllData();
  switchStudentTab("notes", $$(".subtab")[1]);
}

function deleteJournalNote(i) {
  journalNotes.splice(i, 1);
  saveAllData();
  switchStudentTab("notes", $$(".subtab")[1]);
}

// ---------------------------------------------------------------------
// 10. COMPLETE TEACHER DASHBOARD & CREATION SUITE
// ---------------------------------------------------------------------
function renderTeacherStudio() {
  return `
    ${pageHeader("Teacher Management Studio", "Content & Assessment Suite", "Create exercises, assign homework, grade submissions, and export data.")}

    <div class="stats">
      <div class="stat"><b>${assignments.length}</b><span>Total Submissions</span></div>
      <div class="stat"><b>${assignments.filter(a => a.status === "Submitted").length}</b><span>Pending Feedback</span></div>
      <div class="stat"><b>${customExercises.length}</b><span>Created Exercises</span></div>
      <div class="stat"><b>${homeworkList.length}</b><span>Active Homework Tasks</span></div>
    </div>

    <div class="subtabs">
      <button class="subtab active" onclick="switchTeacherTab('review', this)">📥 Review & Grade Submissions (${assignments.length})</button>
      <button class="subtab" onclick="switchTeacherTab('builder', this)">➕ Exercise & Content Builder</button>
      <button class="subtab" onclick="switchTeacherTab('assigner', this)">📌 Homework Assigner</button>
      <button class="subtab" onclick="switchTeacherTab('lessons', this)">📄 Lesson Plans & Notes</button>
    </div>

    <div id="teacherTabContent">
      ${renderTeacherReviewTab()}
    </div>
  `;
}

function switchTeacherTab(tab, btn) {
  $$(".subtab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const container = $("#teacherTabContent");

  if (tab === "review") container.innerHTML = renderTeacherReviewTab();
  else if (tab === "builder") container.innerHTML = renderTeacherBuilderTab();
  else if (tab === "assigner") container.innerHTML = renderTeacherAssignerTab();
  else if (tab === "lessons") container.innerHTML = renderTeacherLessonsTab();
}

// A. Teacher Review & Grade Tab with CSV/JSON Export
function renderTeacherReviewTab() {
  if (assignments.length === 0) {
    return `<div class="empty">No student submissions available yet.</div>`;
  }

  return `
    <div style="display:flex;justify-content:flex-end;gap:10px;margin-bottom:14px">
      <button class="btn small outline" onclick="exportSubmissionsJSON()">📥 Export JSON</button>
      <button class="btn small outline" onclick="exportSubmissionsCSV()">📊 Export CSV</button>
    </div>

    <div class="exercise">
      ${assignments.map(a => `
        <div class="q">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;flex-wrap:wrap">
            <div>
              <strong>${a.title}</strong>
              <span class="level-label">${a.level}</span>
              <small class="muted">Submitted: ${a.date}</small>
            </div>
            <div>
              ${getStatusBadge(a)}
            </div>
          </div>

          <p style="background:#f7fafc;padding:12px;border-radius:8px;margin:10px 0;white-space:pre-wrap;border:1px solid var(--line)">${a.body}</p>

          <div class="two-col">
            <div class="field">
              <label>Numeric Score (0 - 100)</label>
              <input type="number" id="score-${a.id}" value="${a.score !== null ? a.score : ''}" placeholder="e.g. 85">
            </div>
            <div class="field">
              <label>Qualitative Evaluation</label>
              <select id="qual-${a.id}">
                <option value="Logrado" ${a.qual === "Logrado" ? "selected" : ""}>Achieved / Logrado</option>
                <option value="En proceso" ${a.qual === "En proceso" ? "selected" : ""}>In Progress / En proceso</option>
                <option value="Requiere refuerzo" ${a.qual === "Requiere refuerzo" ? "selected" : ""}>Needs Practice / Requiere refuerzo</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label>Qualitative Feedback & Corrections</label>
            <textarea id="fb-${a.id}" placeholder="Write constructive feedback for student...">${a.feedback || ""}</textarea>
          </div>

          <button class="btn small success" onclick="saveTeacherFeedback(${a.id})">Save Assessment</button>
        </div>
      `).join("")}
    </div>
  `;
}

function getStatusBadge(a) {
  if (a.qual === "Logrado") return `<span class="status-tag status-achieved">Logrado</span>`;
  if (a.qual === "En proceso") return `<span class="status-tag status-in-process">En Proceso</span>`;
  if (a.qual === "Requiere refuerzo") return `<span class="status-tag status-needs-work">Requiere Refuerzo</span>`;
  return `<span class="status-tag" style="background:#edf2f7;color:#4a5568">Awaiting Assessment</span>`;
}

function saveTeacherFeedback(id) {
  const item = assignments.find(a => a.id === id);
  if (!item) return;

  const scoreVal = $("#score-" + id).value;
  item.score = scoreVal !== "" ? Number(scoreVal) : null;
  item.qual = $("#qual-" + id).value;
  item.feedback = $("#fb-" + id).value;
  item.status = "Reviewed";

  saveAllData();
  alert("Feedback and score saved successfully!");
  switchTeacherTab("review", $$(".subtab")[0]);
}

function exportSubmissionsJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assignments, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `english_pathway_submissions_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function exportSubmissionsCSV() {
  let csvContent = "data:text/csv;charset=utf-8,ID,Level,Title,Date,Status,Score,Qualitative,Feedback\n";
  assignments.forEach(a => {
    const row = [
      a.id,
      a.level,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      a.date,
      a.status,
      a.score || "",
      a.qual || "",
      `"${(a.feedback || '').replace(/"/g, '""')}"`
    ].join(",");
    csvContent += row + "\n";
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `student_grades_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// B. Teacher Exercise Builder Tab
function renderTeacherBuilderTab() {
  return `
    <div class="content-card">
      <h3>Create Custom Exercise / Module</h3>
      <div class="two-col">
        <div class="field">
          <label for="exTitle">Exercise Title</label>
          <input id="exTitle" placeholder="e.g. Present Perfect Practice Drill">
        </div>
        <div class="field">
          <label for="exLevel">Target CEFR Level</label>
          <select id="exLevel">
            ${levels.map(l => `<option value="${l}">${l} - ${levelNames[l]}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="two-col">
        <div class="field">
          <label for="exType">Module Category</label>
          <select id="exType">
            <option value="Grammar">Grammar Task</option>
            <option value="Reading">Reading Passage</option>
            <option value="Vocabulary">Vocabulary Set</option>
          </select>
        </div>
        <div class="field">
          <label for="exDesc">Short Summary / Instruction</label>
          <input id="exDesc" placeholder="e.g. Fill in the correct past form of verbs.">
        </div>
      </div>

      <div class="field">
        <label for="exContent">Exercise Content / Questions</label>
        <textarea id="exContent" placeholder="Write the exercise text or questions here..."></textarea>
      </div>

      <button class="btn" onclick="saveCustomExercise()">Publish Exercise to Platform</button>
    </div>

    <div class="content-card" style="margin-top:20px">
      <h3>Published Custom Exercises (${customExercises.length})</h3>
      ${customExercises.length === 0 ? '<div class="empty">No custom exercises published yet.</div>' : customExercises.map((ex, i) => `
        <div class="exercise" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong>${ex.title}</strong> <span class="level-label">${ex.level}</span>
            <p class="muted" style="margin:4px 0">${ex.desc}</p>
          </div>
          <button class="btn small danger" onclick="deleteCustomExercise(${i})">Delete</button>
        </div>
      `).join("")}
    </div>
  `;
}

function saveCustomExercise() {
  const title = $("#exTitle").value.trim();
  const level = $("#exLevel").value;
  const type = $("#exType").value;
  const desc = $("#exDesc").value.trim();
  const content = $("#exContent").value.trim();

  if (!title || !content) { alert("Please provide a title and exercise content!"); return; }

  customExercises.push({ id: Date.now(), title, level, type, desc, content });
  saveAllData();
  alert("Exercise successfully published!");
  switchTeacherTab("builder", $$(".subtab")[1]);
}

function deleteCustomExercise(index) {
  customExercises.splice(index, 1);
  saveAllData();
  switchTeacherTab("builder", $$(".subtab")[1]);
}

// C. Teacher Homework Assigner
function renderTeacherAssignerTab() {
  return `
    <div class="content-card">
      <h3>Assign New Homework</h3>
      <div class="two-col">
        <div class="field">
          <label for="hwTitle">Homework Title</label>
          <input id="hwTitle" placeholder="e.g. Unit 3 Grammar Review">
        </div>
        <div class="field">
          <label for="hwLevel">Assigned Level</label>
          <select id="hwLevel">
            ${levels.map(l => `<option value="${l}">${l} - ${levelNames[l]}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="field">
        <label for="hwDue">Due Date Tag</label>
        <input id="hwDue" placeholder="e.g. Next Friday, 5:00 PM">
      </div>

      <div class="field">
        <label for="hwDesc">Homework Instructions</label>
        <textarea id="hwDesc" placeholder="Describe the task for students..."></textarea>
      </div>

      <button class="btn" onclick="publishHomework()">Assign Homework</button>
    </div>

    <div class="content-card" style="margin-top:20px">
      <h3>Active Homework Assignments (${homeworkList.length})</h3>
      ${homeworkList.map((h, i) => `
        <div class="exercise" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong>${h.title}</strong> <span class="level-label">${h.level}</span>
            <p class="muted" style="margin:4px 0">${h.desc}</p>
            <small class="muted">Due: ${h.dueDate}</small>
          </div>
          <button class="btn small danger" onclick="deleteHomework(${i})">Remove</button>
        </div>
      `).join("")}
    </div>
  `;
}

function publishHomework() {
  const title = $("#hwTitle").value.trim();
  const level = $("#hwLevel").value;
  const dueDate = $("#hwDue").value.trim() || "Flexible";
  const desc = $("#hwDesc").value.trim();

  if (!title || !desc) { alert("Please complete title and description."); return; }

  homeworkList.push({ id: Date.now(), title, level, dueDate, desc });
  saveAllData();
  alert("Homework assigned to students!");
  switchTeacherTab("assigner", $$(".subtab")[2]);
}

function deleteHomework(i) {
  homeworkList.splice(i, 1);
  saveAllData();
  switchTeacherTab("assigner", $$(".subtab")[2]);
}

// D. Teacher Lesson Plan Manager
function renderTeacherLessonsTab() {
  return `
    <div class="content-card">
      <h3>Create Lesson Plan / Class Outline</h3>
      <div class="two-col">
        <div class="field">
          <label for="planTitle">Lesson Topic</label>
          <input id="planTitle" placeholder="e.g. Business Emails & Negotiations">
        </div>
        <div class="field">
          <label for="planLevel">Level</label>
          <select id="planLevel">
            ${levels.map(l => `<option value="${l}">${l}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="field">
        <label for="planBody">Session Notes & Outline</label>
        <textarea id="planBody" placeholder="1. Warm-up (5 mins)&#10;2. Vocabulary presentation..."></textarea>
      </div>
      <button class="btn" onclick="saveLessonPlan()">Save Lesson Plan</button>
    </div>

    <div class="content-card" style="margin-top:20px">
      <h3>Saved Lesson Outlines (${lessonPlans.length})</h3>
      ${lessonPlans.length === 0 ? '<div class="empty">No lesson plans saved yet.</div>' : lessonPlans.map((lp, i) => `
        <div class="exercise">
          <div style="display:flex;justify-content:space-between">
            <strong>${lp.title}</strong>
            <span class="level-label">${lp.level}</span>
          </div>
          <p style="white-space:pre-wrap;margin:10px 0" class="muted">${lp.body}</p>
          <button class="btn small danger" onclick="deleteLessonPlan(${i})">Delete</button>
        </div>
      `).join("")}
    </div>
  `;
}

function saveLessonPlan() {
  const title = $("#planTitle").value.trim();
  const level = $("#planLevel").value;
  const body = $("#planBody").value.trim();

  if (!title || !body) return;

  lessonPlans.push({ title, level, body });
  saveAllData();
  switchTeacherTab("lessons", $$(".subtab")[3]);
}

function deleteLessonPlan(i) {
  lessonPlans.splice(i, 1);
  saveAllData();
  switchTeacherTab("lessons", $$(".subtab")[3]);
}

// ---------------------------------------------------------------------
// 11. PROGRESS DASHBOARD
// ---------------------------------------------------------------------
function renderProgress() {
  const completedCount = done.length;
  const pct = Math.min(100, Math.round((completedCount / 15) * 100));

  return `
    ${pageHeader("My Learning Journey", "Overall Progress & Feedback", "Track your activity scores and view teacher evaluations.")}

    <div class="content-card">
      <div class="two-col">
        <div>
          <div class="crumb">COMPLETED ACTIVITIES</div>
          <h2>${completedCount} Items Passed</h2>
          <p class="muted">Activities with a score of 70% or higher.</p>
        </div>
        <div>
          <div class="crumb">TARGET PROGRESS</div>
          <h2>${pct}%</h2>
          <div class="progressbar"><span style="width:${pct}%"></span></div>
          <p class="muted">Goal: 15 activities completed</p>
        </div>
      </div>

      <div class="section-head">
        <div>
          <h2>Saved Quiz Scores</h2>
        </div>
      </div>
      ${Object.keys(scores).length === 0 ? '<div class="empty">No scores recorded yet. Complete exercises in Grammar or Reading to see your progress!</div>' : Object.entries(scores).map(([k, v]) => `
        <div class="q">
          <b>${k.replace(/^(g-|l-|r-)/, "").replace(/_/g, " ")}</b>
          <span style="float:right;font-weight:800;color:${v >= 70 ? 'var(--green)' : 'var(--red)'}">${v}%</span>
          <div class="progressbar"><span style="width:${v}%;background:${v >= 70 ? 'var(--teal)' : 'var(--gold)'}"></span></div>
        </div>
      `).join("")}
    </div>

    <div class="content-card">
      <h2>My Writing Submissions & Teacher Grades</h2>
      ${assignments.length === 0 ? '<div class="empty">No tasks submitted yet.</div>' : assignments.map(a => `
        <div class="exercise">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <strong>${a.title}</strong>
            <span class="level-label">${a.level}</span>
          </div>
          <small class="muted">Submitted on ${a.date}</small>
          <p class="muted" style="margin:8px 0">${a.body.slice(0, 180)}${a.body.length > 180 ? '...' : ''}</p>

          ${a.status === "Reviewed" ? `
            <div class="tip" style="background:#eef7f6;border-color:#bce3de">
              <strong>Teacher Feedback:</strong> ${a.feedback || "No written comment."}<br>
              <strong>Evaluation:</strong> ${getStatusBadge(a)} ${a.score !== null ? `| Score: ${a.score}/100` : ''}
            </div>
          ` : '<span class="muted">⏳ Awaiting Teacher Review</span>'}
        </div>
      `).join("")}
    </div>
  `;
}

// ---------------------------------------------------------------------
// AUDIO SYNTHESIS ENGINE
// ---------------------------------------------------------------------
let speechPlaying = false;
let speechSpeed = 1.0;

function setSpeed(v) {
  speechSpeed = parseFloat(v);
  if (speechPlaying && activeSpeechText) {
    stopAudio();
    playText(activeSpeechText);
  }
}

function playText(text) {
  if (!('speechSynthesis' in window)) {
    alert("Speech Synthesis is not supported in your browser.");
    return;
  }
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = speechSpeed;

  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => /^en(-|_)/i.test(v.lang));
  if (enVoice) u.voice = enVoice;

  u.onstart = () => {
    speechPlaying = true;
    const s = $("#audioStatus");
    if (s) s.textContent = "Playing speech...";
    const b = $("#playBtn");
    if (b) b.textContent = "⏸";
  };
  u.onend = () => {
    speechPlaying = false;
    const s = $("#audioStatus");
    if (s) s.textContent = "Playback complete";
    const b = $("#playBtn");
    if (b) b.textContent = "▶";
  };
  u.onerror = () => {
    speechPlaying = false;
    const b = $("#playBtn");
    if (b) b.textContent = "▶";
  };

  activeSpeechText = text;
  window.speechSynthesis.speak(u);
}

function toggleAudio() {
  if (speechPlaying) {
    window.speechSynthesis.pause();
    speechPlaying = false;
    if ($("#playBtn")) $("#playBtn").textContent = "▶";
  } else if (window.speechSynthesis && window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
    speechPlaying = true;
    if ($("#playBtn")) $("#playBtn").textContent = "⏸";
  } else {
    const item = listening.filter(x => x.l === currentLevel)[activeListeningIndex] || listening[0];
    playText(item.text);
  }
}

function stopAudio() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  speechPlaying = false;
  if ($("#playBtn")) $("#playBtn").textContent = "▶";
  if ($("#audioStatus")) $("#audioStatus").textContent = "Stopped";
}

function speakText(txt) {
  playText(txt);
}

// ---------------------------------------------------------------------
// MODAL CONTROLLER
// ---------------------------------------------------------------------
function showModal(crumb, title, body) {
  $("#modalCrumb").textContent = crumb;
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = body;
  $("#modal").classList.add("show");
}

function closeModal() {
  stopAudio();
  $("#modal").classList.remove("show");
}

// ---------------------------------------------------------------------
// APP RENDER ROUTER
// ---------------------------------------------------------------------
function render() {
  const container = $("#app");
  const views = {
    home: renderHome,
    library: renderLibrary,
    grammar: renderGrammar,
    vocabulary: renderVocabulary,
    listening: renderListening,
    reading: renderReading,
    speaking: renderSpeaking,
    writing: renderWriting,
    student: renderStudentSandbox,
    teacher: renderTeacherStudio,
    progress: renderProgress
  };

  container.innerHTML = (views[currentPage] || renderHome)();

  // Update navbar role indicator styling if in teacher tab
  const teacherBtn = $("#teacherModeBtn");
  if (teacherBtn) {
    teacherBtn.classList.toggle("active-teacher", currentPage === "teacher");
  }

  // Bind side navigation click events
  $$(".navitem").forEach(el => {
    el.classList.toggle("active", el.dataset.page === currentPage);
  });
}

// Initial kickoff when page loads
window.onload = function() {
  render();
};


// ------------------------------------------------------------------
// ENGLISH PATHWAY 2.0 — expanded learning experience
// Data is stored in this browser. Shared multi-device accounts require a backend.
// ------------------------------------------------------------------
const epModules=[
 {id:'A1.1',name:'Discovery & Confidence',months:'Months 1–3',outcome:'Introduce yourself, exchange basic information and understand familiar expressions.'},
 {id:'A1.2',name:'Socialising & Everyday Life',months:'Months 4–6',outcome:'Describe routines, preferences, places and everyday experiences.'},
 {id:'A2.1',name:'Experiences & Travel',months:'Months 7–9',outcome:'Talk about past experiences, travel, services and plans.'},
 {id:'A2.2',name:'Ideas, Opinions & Plans',months:'Months 10–12',outcome:'Explain preferences, compare options and express simple opinions.'},
 {id:'B1.1',name:'Communication & Independence',months:'Months 13–15',outcome:'Narrate events, explain reasons and participate in familiar discussions.'},
 {id:'B1.2',name:'Fluency & Confidence',months:'Months 16–18',outcome:'Connect ideas, support opinions and communicate with greater independence.'}
];
let epSubmissions=JSON.parse(localStorage.getItem('ep_submissions')||'[]');
let epTasks=JSON.parse(localStorage.getItem('ep_tasks')||'[]');
let epWriting=JSON.parse(localStorage.getItem('ep_writing')||'[]');
let epActivityCount=JSON.parse(localStorage.getItem('ep_activity_count')||'{}');
let epRecording=null,epRecorder=null,epChunks=[];
function epSave(){localStorage.setItem('ep_submissions',JSON.stringify(epSubmissions));localStorage.setItem('ep_tasks',JSON.stringify(epTasks));localStorage.setItem('ep_writing',JSON.stringify(epWriting));localStorage.setItem('ep_activity_count',JSON.stringify(epActivityCount));saveAllData();}
function epMark(id,score){if(!done.includes(id))done.push(id);scores[id]=score;epActivityCount[id]=1;epSave();}
function epHead(k,t,d){return `<div class="ep-wrap"><div class="ep-kicker">${k}</div><h1 class="ep-title">${t}</h1><p class="ep-lead">${d}</p></div>`;}
function epCard(icon,title,desc,page,tag='Explore'){return `<article class="ep-card"><div class="ep-icon">${icon}</div><h3>${title}</h3><p>${desc}</p><div class="ep-actions"><button class="ep-btn secondary" onclick="setPage('${page}')">${tag} →</button></div></article>`;}
function epHome(){let n=done.length,percent=Math.min(100,Math.round(n/30*100));return `${epHead('YOUR ENGLISH LEARNING SPACE','Learn English. Build confidence.','A practical learning path to help you communicate in English through grammar, vocabulary and the four skills.')}
 <section class="hero"><div class="eyebrow">YOUR LEARNING JOURNEY · A1–C1</div><h1>Make English part of your everyday life.</h1><p>Explore bite-sized lessons, practise at your own pace and build the confidence to use English in real situations.</p><button class="btn light" onclick="setPage('curriculum')">Explore the learning path →</button></section>
 <div class="ep-grid"><div class="ep-card"><span class="ep-pill">CURRENT LEVEL</span><h3 style="font-size:30px;margin:8px 0">${currentLevel}</h3><p>${levelNames[currentLevel]||'Learning pathway'}</p><div class="ep-actions"><button class="ep-btn secondary" onclick="setPage('curriculum')">View modules</button></div></div><div class="ep-card"><span class="ep-pill">ACTIVITIES COMPLETED</span><h3 style="font-size:30px;margin:8px 0">${n}</h3><p>Keep practising regularly. Every activity counts.</p></div><div class="ep-card"><span class="ep-pill">LEARNING PROGRESS</span><h3 style="font-size:30px;margin:8px 0">${percent}%</h3><div class="ep-progress"><span style="width:${percent}%"></span></div><p class="ep-small">Based on 30 suggested practice activities.</p></div></div>
 <div class="ep-row"><div><h2>Choose what to practise</h2><p class="ep-small">Develop all four skills alongside language knowledge.</p></div><button class="ep-btn outline" onclick="setPage('progress')">View my progress →</button></div>
 <div class="ep-grid">${epCard('📘','Grammar','Understand how English works with clear explanations and interactive practice.','grammar')}${epCard('🧩','Vocabulary','Learn useful words, collocations and expressions in context.','vocabulary')}${epCard('🎧','Listening','Listen for gist and detail, then check your understanding.','listening')}${epCard('📖','Reading','Read graded texts and develop comprehension strategies.','reading')}${epCard('🗣️','Speaking','Practise real-life situations and record your speaking.','speaking')}${epCard('✍️','Writing','Plan, write and improve texts for different purposes.','writing')}</div>
 <div class="ep-panel"><h2>How your course is organised</h2><p>Six learning modules over 18 months, moving from A1 towards B1+.</p><div class="ep-levels">${epModules.map(m=>`<div class="ep-level"><strong>${m.id}</strong><small>${m.months}</small></div>`).join('')}</div></div>`;}
function epCurriculum(){return `${epHead('18-MONTH LEARNING PATH','Your learning journey','A communicative general-English programme organised into six three-month modules. Each module develops listening, speaking, reading and writing.') }<div class="ep-grid">${epModules.map((m,i)=>`<article class="ep-card"><span class="ep-pill">${m.id} · ${m.months}</span><h3>${m.name}</h3><p>${m.outcome}</p><p class="ep-small"><b>Learning focus:</b> vocabulary, grammar in context, interaction and practical evidence of learning.</p><div class="ep-actions"><button class="ep-btn secondary" onclick="setPage('${i<2?'grammar':i<4?'reading':'speaking'}')">Practise this stage →</button></div></article>`).join('')}</div><div class="ep-panel"><h3>What you will develop</h3><div class="ep-grid"><div><b>Language knowledge</b><p class="ep-small">Grammar, vocabulary, pronunciation and useful expressions.</p></div><div><b>Communication</b><p class="ep-small">Pair work, role plays, discussions and everyday interaction.</p></div><div><b>Learning evidence</b><p class="ep-small">Short tasks, written work, recordings and self-reflection.</p></div></div></div>`;}
function epGrammar(){let items=grammar.filter(x=>['A1','A2','B1'].includes(x.l));return `${epHead('GRAMMAR ACADEMY','Grammar in context','Learn a structure, notice how it works and use it to communicate. Choose a topic to begin.') }<div class="ep-grid">${items.map((g,i)=>`<article class="ep-card"><span class="ep-pill">${g.l} · ${g.cat}</span><h3>${g.t}</h3><p>${g.desc}</p><p><b>Form:</b> ${g.rule}</p><div class="ep-actions"><button class="ep-btn" onclick="epGrammarLesson(${grammar.indexOf(g)})">Learn & practise →</button></div></article>`).join('')}</div>`;}
function epGrammarLesson(i){let g=grammar[i];let q=g.qs.map((x,j)=>({q:x.q||x.question||x.words?.join(' ')||'Complete the sentence',opts:x.opts||[],ans:x.ans,exp:x.exp||''}));let html=`<div class="ep-kicker">${g.l} · ${g.cat}</div><h2>${g.t}</h2><p>${g.desc}</p><div class="ep-panel"><h3>Remember</h3><p>${g.rule}</p><ul>${g.ex.map(e=>`<li>${e}</li>`).join('')}</ul><p><b>Tip:</b> ${g.tip}</p></div><h3>Check your understanding</h3>`;g.qs.forEach((x,j)=>{html+=`<div class="ep-question"><b>${j+1}. ${x.q||x.words?.join(' ')||'Complete the sentence'}</b>${x.opts?x.opts.map((o,k)=>`<button class="ep-option" onclick="epAnswer(this,${k},${x.ans},'${(x.exp||'').replace(/'/g,"\\'")}')">${o}</button>`).join(''):`<input class="ep-input" id="epg${j}" placeholder="Type your answer"><button class="ep-btn secondary" onclick="epTextAnswer('epg${j}','${String(x.ans).replace(/'/g,"\\'")}','${(x.exp||'').replace(/'/g,"\\'")}')">Check answer</button>`}<div id="epgf${j}"></div></div>`});html+=`<div class="ep-actions"><button class="ep-btn" onclick="epMark('grammar-${i}',100);alert('Practice completed!')">Mark lesson complete</button></div>`;showModal('GRAMMAR ACADEMY',g.t,html);}
function epAnswer(btn,k,ans,exp){let parent=btn.parentElement;parent.querySelectorAll('.ep-option').forEach(b=>b.disabled=true);btn.classList.add('chosen');let good=k===ans;let f=document.createElement('div');f.className='ep-feedback'+(good?'':' bad');f.textContent=(good?'Correct! ':'Not quite. ')+exp;parent.appendChild(f);}
function epTextAnswer(id,ans,exp){let el=document.getElementById(id),f=document.getElementById('epgf'+id.slice(3));let good=el.value.trim().toLowerCase()===ans.trim().toLowerCase();f.className='ep-feedback'+(good?'':' bad');f.textContent=good?'Correct!':`Try again. ${exp}`;}
function epVocabulary(){let sets=vocab.filter(v=>['A1','A2','B1'].includes(v.l));return `${epHead('VOCABULARY BUILDER','Words you can use','Build a useful vocabulary through topics, example sentences, pronunciation and active recall.') }<div class="ep-grid">${sets.map((v,i)=>`<article class="ep-card"><span class="ep-pill">${v.l}</span><h3>${v.topic}</h3><p>${v.words.length} useful words and expressions</p><div class="ep-actions"><button class="ep-btn" onclick="epVocabSet(${vocab.indexOf(v)})">Study words →</button></div></article>`).join('')}</div><div class="ep-panel"><h3>Vocabulary learning tip</h3><p>Learn words in phrases, notice the example sentence and create one sentence of your own. Revisit new vocabulary regularly.</p></div>`;}
function epVocabSet(i){let v=vocab[i];let cards=v.words.map((w,j)=>`<div class="ep-card"><span class="ep-pill">WORD ${j+1}</span><h2>${w[0]}</h2><p>${w[1]}</p><i>${w[2]}</i><div class="ep-actions"><button class="ep-btn secondary" onclick="epSpeak('${w[0]}')">🔊 Listen</button></div></div>`).join('');showModal('VOCABULARY BUILDER',v.topic,`<div class="ep-grid">${cards}</div><p class="ep-small">Try to say each word, explain its meaning and use it in a new sentence.</p><button class="ep-btn" onclick="epMark('vocab-${i}',100);closeModal()">Mark set complete</button>`);}
function epSpeakByIndex(i){epSpeak(listening[i].text)}
function epSpeak(t){if(!('speechSynthesis'in window)){alert('Speech playback is not available in this browser.');return}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(t);u.lang='en-GB';speechSynthesis.speak(u)}
function epListening(){let arr=listening.filter(x=>['A1','A2','B1'].includes(x.l));return `${epHead('LISTENING LAB','Listen for meaning','Practise understanding the main idea and specific information. Audio on this page is generated from text; recorded authentic audio can be added in a hosted version.') }<div class="ep-grid">${arr.map((a,i)=>`<article class="ep-card"><span class="ep-pill">${a.l} · ${a.kind}</span><h3>${a.title}</h3><p>Listen twice. First, identify the main idea. Then listen for details.</p><div class="ep-actions"><button class="ep-btn" onclick="epListen(${listening.indexOf(a)})">Start listening →</button></div></article>`).join('')}</div>`;}
function epListen(i){let a=listening[i];let html=`<span class="ep-pill">${a.l} · ${a.kind}</span><h2>${a.title}</h2><div class="ep-panel"><p>1. Listen for the general meaning.</p><button class="ep-btn" onclick="epSpeakByIndex(${i})">▶ Play listening</button> <button class="ep-btn secondary" onclick="document.getElementById('eptrans').hidden=!document.getElementById('eptrans').hidden">Show / hide transcript</button><p id="eptrans" hidden>${a.text}</p></div><h3>Check your understanding</h3>`;a.qs.forEach((q,j)=>{html+=`<div class="ep-question"><b>${q.q}</b>${q.opts.map((o,k)=>`<button class="ep-option" onclick="epAnswer(this,${k},${q.ans},'Listen again and focus on the key detail.')">${o}</button>`).join('')}</div>`});html+=`<button class="ep-btn" onclick="epMark('listening-${i}',100);closeModal()">Complete activity</button>`;showModal('LISTENING LAB',a.title,html);}
function epReading(){let arr=readings.filter(x=>['A1','A2','B1'].includes(x.l));return `${epHead('READING CENTRE','Read. Understand. Respond.','Develop reading skills with short texts, comprehension checks and vocabulary in context.') }<div class="ep-grid">${arr.map((a,i)=>`<article class="ep-card"><span class="ep-pill">${a.l} · READING</span><h3>${a.title}</h3><p>${a.text.slice(0,110)}…</p><div class="ep-actions"><button class="ep-btn" onclick="epRead(${readings.indexOf(a)})">Read text →</button></div></article>`).join('')}</div>`;}
function epRead(i){let a=readings[i];let html=`<span class="ep-pill">${a.l} · READING</span><h2>${a.title}</h2><div class="ep-panel"><p style="font-size:17px;line-height:1.9">${a.text}</p></div><h3>Comprehension check</h3>`;a.qs.forEach(q=>{html+=`<div class="ep-question"><b>${q.q}</b>${q.opts.map((o,k)=>`<button class="ep-option" onclick="epAnswer(this,${k},${q.ans},'Look back at the relevant sentence in the text.')">${o}</button>`).join('')}</div>`});html+=`<button class="ep-btn" onclick="epMark('reading-${i}',100);closeModal()">Complete reading</button>`;showModal('READING CENTRE',a.title,html);}
function epSpeaking(){return `${epHead('SPEAKING STUDIO','Find your voice in English','Practise speaking in realistic situations. Use the prompts to organise your ideas and record a response for self-review.') }<div class="ep-grid">${[['A1','Introduce yourself','Say your name, where you are from, what you do and what you enjoy.'],['A1–A2','Describe your daily routine','Talk about a typical weekday. Use time expressions and the present simple.'],['A2','Talk about a memorable trip','Where did you go? Who did you go with? What did you do?'],['A2–B1','Give your opinion','Is it better to study online or face to face? Give two reasons.'],['B1','Solve a problem','You and a friend have different plans for the weekend. Find a solution.'],['B1','Tell a story','Describe an unexpected event and explain what happened next.']].map((x,i)=>`<article class="ep-card"><span class="ep-pill">${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p><div class="ep-actions"><button class="ep-btn" onclick="epSpeakTask(${i})">Open task →</button></div></article>`).join('')}</div>`;}
let epSpeakPrompts=[['A1','Introduce yourself','Say your name, where you are from, what you do and what you enjoy.'],['A1–A2','Describe your daily routine','Talk about a typical weekday. Use time expressions and the present simple.'],['A2','Talk about a memorable trip','Where did you go? Who did you go with? What did you do?'],['A2–B1','Give your opinion','Is it better to study online or face to face? Give two reasons.'],['B1','Solve a problem','You and a friend have different plans for the weekend. Find a solution.'],['B1','Tell a story','Describe an unexpected event and explain what happened next.']];
function epSpeakTask(i){let x=epSpeakPrompts[i];showModal('SPEAKING STUDIO',x[1],`<span class="ep-pill">${x[0]}</span><div class="ep-panel"><p>${x[2]}</p><p><b>Plan your answer:</b> Think of 3 key points. Use linking words such as <i>first, then, because, however</i>.</p></div><div class="ep-record"><button class="ep-btn" id="epRecBtn" onclick="epRecordToggle()">● Start recording</button><span id="epRecStatus" class="ep-small">Recording stays on this device.</span></div><audio id="epAudio" controls style="width:100%;margin-top:12px;display:none"></audio><div class="ep-panel"><b>Self-assessment</b><p>Did I speak clearly? Did I use a range of vocabulary? Did I connect my ideas?</p><label><input type="checkbox"> I answered the task.</label><br><label><input type="checkbox"> I used complete sentences.</label><br><label><input type="checkbox"> I checked my pronunciation.</label></div><button class="ep-btn secondary" onclick="epMark('speaking-${i}',100);closeModal()">Mark practice complete</button>`);}
async function epRecordToggle(){let b=document.getElementById('epRecBtn'),s=document.getElementById('epRecStatus');if(!epRecorder||epRecorder.state==='inactive'){if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){s.textContent='Recording is not supported in this browser.';return}try{let stream=await navigator.mediaDevices.getUserMedia({audio:true});epChunks=[];epRecorder=new MediaRecorder(stream);epRecorder.ondataavailable=e=>{if(e.data.size)epChunks.push(e.data)};epRecorder.onstop=()=>{let blob=new Blob(epChunks,{type:'audio/webm'}),url=URL.createObjectURL(blob),a=document.getElementById('epAudio');a.src=url;a.style.display='block';stream.getTracks().forEach(t=>t.stop());s.textContent='Recording ready. Use the audio controls to review it.'};epRecorder.start();b.textContent='■ Stop recording';s.textContent='Recording…';}catch(e){s.textContent='Microphone permission was not granted.'}}else{epRecorder.stop();b.textContent='● Record again';}}
function epWritingPage(){return `${epHead('WRITING WORKSHOP','Write to communicate','Plan, draft and review different types of texts. Your work is saved in this browser and can be reviewed by your teacher when exported.') }<div class="ep-panel"><span class="ep-pill">A1–B1 · WRITING TASK</span><h2>Choose your writing task</h2><label>Task type</label><select class="ep-select" id="epWType"><option>Personal paragraph</option><option>Email to a friend</option><option>Describe a place</option><option>Past experience</option><option>Opinion paragraph</option><option>Short report</option></select><label>Writing prompt</label><textarea class="ep-textarea" id="epWPrompt">Write about a place you enjoy visiting. Explain where it is, what you can do there and why you like it.</textarea><label>Your title</label><input class="ep-input" id="epWTitle" placeholder="My favourite place"><label>Your text</label><textarea class="ep-textarea" id="epWText" oninput="document.getElementById('epWCount').textContent=this.value.trim()?this.value.trim().split(/\s+/).length:0" placeholder="Start writing here…"></textarea><p class="ep-small"><b id="epWCount">0</b> words</p><button class="ep-btn" onclick="epSubmitWriting()">Save my writing</button></div><div class="ep-panel"><h3>Before you submit</h3><ul><li>Have I answered the prompt?</li><li>Are my ideas in a clear order?</li><li>Have I checked verb forms, spelling and punctuation?</li><li>Have I used linking words where appropriate?</li></ul></div>`;}
function epSubmitWriting(){let title=document.getElementById('epWTitle').value.trim(),body=document.getElementById('epWText').value.trim();if(!body){alert('Please write your text before saving.');return}epWriting.unshift({id:Date.now(),type:document.getElementById('epWType').value,title,body,date:new Date().toLocaleString(),feedback:''});epSubmissions.unshift({id:Date.now(),student:localStorage.getItem('ep_student_name')||'Local student',task:document.getElementById('epWType').value,title,body,date:new Date().toLocaleString(),feedback:'',status:'Submitted'});epSave();epMark('writing-'+Date.now(),100);alert('Your writing has been saved on this device.');render();}
function epStudent(){let name=localStorage.getItem('ep_student_name')||'';return `${epHead('STUDENT WORKSPACE','My activities & homework','Keep your work organised, respond to tasks and review feedback.') }<div class="ep-panel"><label>Your name</label><input class="ep-input" id="epStudentName" value="${name.replace(/"/g,'&quot;')}" placeholder="Enter your name"><button class="ep-btn secondary" onclick="localStorage.setItem('ep_student_name',document.getElementById('epStudentName').value);render()">Save name</button></div><div class="ep-panel"><h2>Assigned homework</h2>${epTasks.length?epTasks.map(t=>`<div class="ep-question"><span class="ep-pill">${t.level}</span><h3>${t.title}</h3><p>${t.desc}</p><p class="ep-small">Due: ${t.due||'Not specified'}</p><button class="ep-btn" onclick="epDoTask(${t.id})">Open task →</button></div>`).join(''):'<p>No new tasks have been assigned in this browser yet.</p>'}</div><div class="ep-panel"><h2>My submissions</h2>${epSubmissions.length?`<table class="ep-table"><tr><th>Task</th><th>Date</th><th>Status</th><th>Feedback</th></tr>${epSubmissions.map(s=>`<tr><td>${s.title||s.task}</td><td>${s.date}</td><td>${s.status}</td><td>${s.feedback||'Awaiting feedback'}</td></tr>`).join('')}</table>`:'<p>Your submitted work will appear here.</p>'}</div>`;}
function epDoTask(id){let t=epTasks.find(x=>x.id===id);showModal('HOMEWORK',t.title,`<p>${t.desc}</p><textarea class="ep-textarea" id="epTaskAnswer" placeholder="Write your answer here…"></textarea><button class="ep-btn" onclick="epSendTask(${id})">Submit response</button>`);}
function epSendTask(id){let t=epTasks.find(x=>x.id===id),body=document.getElementById('epTaskAnswer').value.trim();if(!body){alert('Please add your response.');return}epSubmissions.unshift({id:Date.now(),student:localStorage.getItem('ep_student_name')||'Local student',task:t.title,title:t.title,body,date:new Date().toLocaleString(),feedback:'',status:'Submitted'});epSave();closeModal();render();}
function epTeacher(){return `${epHead('TEACHER STUDIO','Plan. Assign. Review.','Create learning tasks, review student evidence and provide feedback. This standalone version stores teacher and student data in this browser only.') }<div class="ep-grid"><div class="ep-card"><span class="ep-pill">TASK BUILDER</span><h3>Create an assignment</h3><label>Title</label><input class="ep-input" id="epTaskTitle" placeholder="e.g. My last holiday"><label>Level</label><select class="ep-select" id="epTaskLevel"><option>A1</option><option>A2</option><option>B1</option></select><label>Instructions</label><textarea class="ep-textarea" id="epTaskDesc" placeholder="Describe what students should do…"></textarea><label>Due date</label><input class="ep-input" id="epTaskDue" type="date"><button class="ep-btn" onclick="epCreateTask()">Publish task</button></div><div class="ep-card"><span class="ep-pill">STUDENT MANAGEMENT</span><h3>Learning evidence</h3><p>${epSubmissions.length} submission(s) recorded in this browser.</p><p>${epTasks.length} active task(s).</p><button class="ep-btn secondary" onclick="epExport()">Export submissions (CSV)</button></div><div class="ep-card"><span class="ep-pill">ASSESSMENT</span><h3>Feedback rubric</h3><p>Use constructive, criterion-based feedback rather than focusing only on grades.</p><ul><li>Task achievement</li><li>Organisation & coherence</li><li>Grammar & vocabulary</li><li>Fluency / pronunciation</li></ul></div></div><div class="ep-panel"><h2>Submission centre</h2>${epSubmissions.length?epSubmissions.map(s=>`<div class="ep-question"><div class="ep-row"><div><b>${s.student}</b> · ${s.title||s.task}<div class="ep-small">${s.date}</div></div><span class="ep-pill">${s.status}</span></div><p style="white-space:pre-wrap">${s.body}</p><label>Teacher feedback</label><textarea class="ep-textarea" id="epfb${s.id}" placeholder="What did the student do well? What is the next step?">${s.feedback||''}</textarea><button class="ep-btn secondary" onclick="epFeedback(${s.id})">Save feedback</button></div>`).join(''):'<p>No submissions yet. Student work created on this same browser will appear here.</p>'}</div><div class="ep-panel"><h2>Course planning</h2><p>Use the six-module, 18-month sequence to plan outcomes and evidence.</p><button class="ep-btn secondary" onclick="setPage('curriculum')">View curriculum</button></div>`;}
function epCreateTask(){let title=document.getElementById('epTaskTitle').value.trim(),desc=document.getElementById('epTaskDesc').value.trim();if(!title||!desc){alert('Add a title and instructions.');return}epTasks.unshift({id:Date.now(),title,level:document.getElementById('epTaskLevel').value,desc,due:document.getElementById('epTaskDue').value});epSave();render();}
function epFeedback(id){let s=epSubmissions.find(x=>x.id===id);s.feedback=document.getElementById('epfb'+id).value;s.status='Reviewed';epSave();alert('Feedback saved in this browser.');render();}
function epExport(){let rows=[['Student','Task','Date','Response','Feedback','Status'],...epSubmissions.map(s=>[s.student,s.title||s.task,s.date,s.body,s.feedback,s.status])];let csv=rows.map(r=>r.map(x=>'"'+String(x||'').replace(/"/g,'""')+'"').join(',')).join('\n');let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='english-pathway-submissions.csv';a.click();URL.revokeObjectURL(a.href);}
function epProgress(){let n=done.length,percent=Math.min(100,Math.round(n/30*100)),cats=[['Grammar',done.filter(x=>String(x).startsWith('grammar')).length],['Vocabulary',done.filter(x=>String(x).startsWith('vocab')).length],['Listening',done.filter(x=>String(x).startsWith('listening')).length],['Reading',done.filter(x=>String(x).startsWith('reading')).length],['Speaking',done.filter(x=>String(x).startsWith('speaking')).length],['Writing',done.filter(x=>String(x).startsWith('writing')).length]];return `${epHead('MY PROGRESS','Small steps add up','Review your learning activity and identify what to practise next.') }<div class="ep-grid"><div class="ep-card"><span class="ep-pill">COMPLETED ACTIVITIES</span><h2>${n}</h2><div class="ep-progress"><span style="width:${percent}%"></span></div><p class="ep-small">${percent}% of the 30-activity suggested target.</p></div><div class="ep-card"><span class="ep-pill">CURRENT LEVEL</span><h2>${currentLevel}</h2><p>${levelNames[currentLevel]||''}</p><button class="ep-btn secondary" onclick="setPage('curriculum')">Review learning path</button></div><div class="ep-card"><span class="ep-pill">WRITING SUBMISSIONS</span><h2>${epWriting.length}</h2><p>Texts saved on this device.</p></div></div><div class="ep-panel"><h2>Progress by skill</h2><table class="ep-table"><tr><th>Area</th><th>Activities completed</th><th>Next step</th></tr>${cats.map(c=>`<tr><td>${c[0]}</td><td>${c[1]}</td><td>${c[1]?'Keep practising':'Try one activity'}</td></tr>`).join('')}</table></div><div class="ep-panel"><h2>Reflect on your learning</h2><p>What can you do more confidently now? What would you like to practise next?</p><textarea class="ep-textarea" id="epReflection" placeholder="Write a short reflection…">${localStorage.getItem('ep_reflection')||''}</textarea><button class="ep-btn secondary" onclick="localStorage.setItem('ep_reflection',document.getElementById('epReflection').value);alert('Reflection saved.')">Save reflection</button></div>`;}
function render(){const views={home:epHome,curriculum:epCurriculum,library:epCurriculum,grammar:epGrammar,vocabulary:epVocabulary,listening:epListening,reading:epReading,speaking:epSpeaking,writing:epWritingPage,student:epStudent,teacher:epTeacher,progress:epProgress};let c=document.getElementById('app');if(c)c.innerHTML=(views[currentPage]||epHome)();$$('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===currentPage));let t=document.getElementById('teacherModeBtn');if(t)t.classList.toggle('active-teacher',currentPage==='teacher');let badge=document.getElementById('activeLevelBadge');if(badge)badge.textContent=currentLevel;}
// Add curriculum to the existing navigation without changing the original file structure.
window.addEventListener('DOMContentLoaded',()=>{let side=document.querySelector('.sidecard');if(side&&!document.querySelector('[data-page="curriculum"]')){let a=document.createElement('a');a.className='navitem';a.dataset.page='curriculum';a.innerHTML='<span class="ico">🧭</span>Learning Path';let anchor=side.querySelector('[data-page="grammar"]');anchor?.parentNode.insertBefore(a,anchor);a.addEventListener('click',()=>setPage('curriculum'));}document.querySelectorAll('[data-page]').forEach(el=>el.addEventListener('click',()=>setPage(el.dataset.page)));render();});


// ===================== FINAL QUALITY & CONTENT UPDATE =====================
// Expanded practice bank, full CEFR filtering and a more reliable browser TTS player.
const epFinalGrammar = [{"l": "A1", "t": "Subject and object pronouns", "cat": "Pronouns", "desc": "Use subject pronouns before verbs and object pronouns after verbs or prepositions.", "rule": "Subject: I, you, he, she, it, we, they. Object: me, you, him, her, it, us, them.", "ex": ["She knows me.", "I work with them.", "They invited us."], "tip": "Do not say 'Me like music'. Use a subject pronoun before the verb.", "qs": [{"q": "Maria is my friend. ___ is very kind.", "opts": ["Her", "She", "Hers"], "ans": 1, "exp": "She is the subject of the sentence."}, {"q": "Please call ___ tomorrow. (I)", "opts": ["I", "my", "me"], "ans": 2, "exp": "Use an object pronoun after call."}, {"q": "We live near Ana. We see ___ every day.", "opts": ["she", "her", "hers"], "ans": 1, "exp": "Her is the object of see."}]}, {"l": "A1", "t": "Imperatives and basic instructions", "cat": "Everyday communication", "desc": "Give simple instructions, directions and classroom commands.", "rule": "Base verb (+ object); negative: don't + base verb.", "ex": ["Turn left at the corner.", "Please open your book.", "Don't touch that button."], "tip": "Use please to make instructions more polite.", "qs": [{"q": "___ your name at the top of the page.", "opts": ["Write", "Writes", "Writing"], "ans": 0, "exp": "Use the base verb in an imperative."}, {"q": "___ run in the corridor.", "opts": ["Not", "Don't", "Doesn't"], "ans": 1, "exp": "Negative imperative = don't + base verb."}, {"q": "Which is the polite instruction?", "opts": ["Give me that.", "Please wait here.", "You waiting here."], "ans": 1, "exp": "Please makes the instruction more polite."}]}, {"l": "A2", "t": "Modal verbs: must, have to, should", "cat": "Modals", "desc": "Express obligation, rules, advice and recommendations.", "rule": "must + base verb; have/has to + base verb; should + base verb.", "ex": ["You must wear a seat belt.", "I have to get up early.", "You should take a break."], "tip": "Should gives advice; must and have to express stronger obligation.", "qs": [{"q": "You look tired. You ___ go to bed earlier.", "opts": ["should", "mustn't", "don't have"], "ans": 0, "exp": "Should is used to give advice."}, {"q": "Employees ___ show their ID at the entrance. It is a rule.", "opts": ["have to", "shouldn't", "can to"], "ans": 0, "exp": "Have to expresses an external obligation."}, {"q": "You ___ smoke here. It is prohibited.", "opts": ["don't have to", "mustn't", "should"], "ans": 1, "exp": "Mustn't expresses prohibition."}]}, {"l": "A2", "t": "Gerunds and infinitives: common patterns", "cat": "Verb patterns", "desc": "Use -ing or to + infinitive after common verbs and expressions.", "rule": "enjoy/avoid/finish + -ing; want/decide/hope + to-infinitive.", "ex": ["I enjoy reading.", "She decided to leave.", "They avoid driving at night."], "tip": "Learn the pattern with the verb; some verbs can take both forms with a change in meaning.", "qs": [{"q": "He wants ___ a new language.", "opts": ["learning", "to learn", "learn"], "ans": 1, "exp": "Want is followed by a to-infinitive."}, {"q": "We enjoy ___ together.", "opts": ["cook", "to cook", "cooking"], "ans": 2, "exp": "Enjoy is followed by a gerund."}, {"q": "They decided ___ early.", "opts": ["leave", "leaving", "to leave"], "ans": 2, "exp": "Decide is followed by a to-infinitive."}]}, {"l": "B1", "t": "Relative clauses: defining and non-defining", "cat": "Complex sentences", "desc": "Add information about people, places and things with relative clauses.", "rule": "who = people; which = things; where = places; whose = possession. Non-defining clauses use commas.", "ex": ["The woman who called is my manager.", "Lima, which is on the coast, has a mild climate.", "That's the café where we met."], "tip": "Do not use that in non-defining relative clauses.", "qs": [{"q": "The book ___ you lent me was excellent.", "opts": ["who", "which", "where"], "ans": 1, "exp": "Use which for things."}, {"q": "The man, ___ lives next door, is a doctor.", "opts": ["that", "who", "where"], "ans": 1, "exp": "A non-defining clause about a person uses who."}, {"q": "That's the hotel ___ we stayed.", "opts": ["where", "whose", "who"], "ans": 0, "exp": "Where refers to a place."}]}, {"l": "B1", "t": "Reported speech: statements and questions", "cat": "Reported language", "desc": "Report what someone said and asked, adjusting pronouns, tense and word order when needed.", "rule": "said (that) + clause; asked + if/whether or question word + subject + verb.", "ex": ["'I'm busy.' → She said (that) she was busy.", "'Where do you live?' → He asked where I lived."], "tip": "Reported questions use statement word order: subject before verb.", "qs": [{"q": "'I am tired,' she said. → She said that she ___ tired.", "opts": ["is", "was", "has"], "ans": 1, "exp": "A present form commonly backshifts to past in reported speech."}, {"q": "'Do you work here?' → He asked me ___ I worked there.", "opts": ["that", "what", "if"], "ans": 2, "exp": "Use if/whether for yes/no reported questions."}, {"q": "Choose the correct reported question.", "opts": ["She asked where did I live.", "She asked where I lived.", "She asked where do I live."], "ans": 1, "exp": "Reported questions use normal statement word order."}]}, {"l": "B2", "t": "Modal verbs of deduction", "cat": "Speculation and certainty", "desc": "Make logical deductions about present and past situations.", "rule": "must be = strong certainty; might/may/could be = possibility; can't be = impossibility. Past: modal + have + past participle.", "ex": ["She must be at home.", "They might have missed the train.", "He can't have forgotten."], "tip": "Choose the modal according to how certain you are, not simply the tense.", "qs": [{"q": "The lights are off and nobody answers. They ___ be out.", "opts": ["must", "might", "can't"], "ans": 1, "exp": "Might expresses a possible explanation."}, {"q": "You ___ have seen Jo; she's been abroad all week.", "opts": ["must", "can't", "might"], "ans": 1, "exp": "Can't have expresses an impossible past deduction."}, {"q": "The ground is wet. It ___ have rained.", "opts": ["must", "can't", "shouldn't"], "ans": 0, "exp": "Must have expresses a strong deduction about the past."}]}, {"l": "B2", "t": "Wish, if only and regrets", "cat": "Hypothetical meaning", "desc": "Express wishes about the present, regrets about the past and desired changes.", "rule": "wish/if only + past simple (present wish); + past perfect (past regret); wish + would (annoying behaviour/change).", "ex": ["I wish I had more time.", "If only we had booked earlier.", "I wish it would stop raining."], "tip": "The past form after wish often refers to an unreal present, not past time.", "qs": [{"q": "I wish I ___ more confident when speaking.", "opts": ["am", "were", "will be"], "ans": 1, "exp": "Use past simple for an unreal present wish."}, {"q": "If only we ___ the tickets earlier!", "opts": ["book", "had booked", "would book"], "ans": 1, "exp": "Past perfect expresses regret about the past."}, {"q": "I wish he ___ interrupting me.", "opts": ["would stop", "stopped yesterday", "has stopped"], "ans": 0, "exp": "Wish + would can express a desired change in behaviour."}]}, {"l": "C1", "t": "Advanced hedging and cautious claims", "cat": "Academic discourse", "desc": "Qualify statements to avoid overgeneralisation and express appropriate degrees of certainty.", "rule": "It appears/seems that…; may/might/could; tends to; is likely to; arguably; to some extent.", "ex": ["The findings may indicate a broader trend.", "This approach appears to be effective.", "The policy is likely to affect smaller organisations."], "tip": "Hedging is not vagueness: it makes claims proportionate to the available evidence.", "qs": [{"q": "Which sentence makes the most cautious academic claim?", "opts": ["This proves the policy always works.", "The findings may suggest a positive effect.", "Everyone knows the policy works."], "ans": 1, "exp": "May suggest signals a measured interpretation."}, {"q": "The results ___ indicate a gradual improvement.", "opts": ["are likely to", "definitely proves", "cannot never"], "ans": 0, "exp": "Are likely to expresses probability."}, {"q": "Which phrase limits the scope of a claim?", "opts": ["without any doubt", "to some extent", "in every possible case"], "ans": 1, "exp": "To some extent qualifies the claim."}]}, {"l": "C1", "t": "Nominalisation in formal writing", "cat": "Academic style", "desc": "Turn verbs and adjectives into nouns to create concise, formal and cohesive academic prose.", "rule": "analyse → analysis; decide → decision; fail → failure; significant → significance.", "ex": ["We analysed the data. → Our analysis of the data…", "The committee decided. → The committee's decision…"], "tip": "Avoid excessive nominalisation: too many abstract nouns can make writing difficult to read.", "qs": [{"q": "Choose the nominal form of 'assess'.", "opts": ["assessful", "assessment", "assessingly"], "ans": 1, "exp": "Assessment is the noun form."}, {"q": "The organisation decided to expand. → The organisation made a ___ to expand.", "opts": ["decisive", "decision", "deciding"], "ans": 1, "exp": "Decision is the noun form of decide."}, {"q": "Which version is more nominalised and formal?", "opts": ["They failed to comply.", "Their failure to comply was recorded.", "They did not comply at all."], "ans": 1, "exp": "Failure is a nominalisation of fail."}]}];
const epFinalVocab = [{"l": "A1", "topic": "Food, drinks & meals", "words": [["bread", "pan", "I have bread and eggs for breakfast."], ["cheese", "queso", "Would you like some cheese?"], ["vegetables", "verduras", "We eat vegetables every day."], ["hungry", "hambriento", "I'm hungry. Let's have lunch."], ["thirsty", "sediento", "Are you thirsty?"], ["menu", "carta / menú", "Can I see the menu, please?"], ["bill", "cuenta", "Could we have the bill?"], ["delicious", "delicioso", "The soup is delicious."]]}, {"l": "A1", "topic": "Home, rooms & furniture", "words": [["kitchen", "cocina", "The kitchen is next to the dining room."], ["bedroom", "dormitorio", "My bedroom has a large window."], ["bathroom", "baño", "The bathroom is upstairs."], ["sofa", "sofá", "There is a sofa in the living room."], ["shelf", "estante", "The books are on the shelf."], ["fridge", "refrigeradora", "The milk is in the fridge."], ["floor", "piso", "My keys are on the floor."], ["comfortable", "cómodo", "This chair is very comfortable."]]}, {"l": "A2", "topic": "Health, symptoms & wellbeing", "words": [["headache", "dolor de cabeza", "I've got a terrible headache."], ["cough", "tos", "He has had a cough for two days."], ["appointment", "cita", "I have a doctor's appointment at ten."], ["medicine", "medicina", "Take the medicine after lunch."], ["recover", "recuperarse", "It took her a week to recover."], ["painful", "doloroso", "The movement is painful."], ["balanced diet", "dieta equilibrada", "A balanced diet includes different foods."], ["get enough sleep", "dormir lo suficiente", "Try to get enough sleep."]]}, {"l": "A2", "topic": "Travel, transport & accommodation", "words": [["platform", "andén", "The train leaves from platform four."], ["departure", "salida", "The departure time is 7:30."], ["return ticket", "boleto de ida y vuelta", "I'd like a return ticket to Cusco."], ["luggage", "equipaje", "You can leave your luggage here."], ["boarding pass", "tarjeta de embarque", "Show your boarding pass at the gate."], ["available", "disponible", "Are there any rooms available?"], ["crowded", "abarrotado", "The bus was very crowded."], ["cancel", "cancelar", "They had to cancel the flight."]]}, {"l": "B1", "topic": "Environment & sustainability", "words": [["renewable energy", "energía renovable", "Solar power is a form of renewable energy."], ["waste", "residuos / desperdiciar", "We should reduce food waste."], ["conservation", "conservación", "Conservation protects natural habitats."], ["emissions", "emisiones", "The city aims to reduce emissions."], ["scarce", "escaso", "Clean water can be scarce in dry regions."], ["sustainable", "sostenible", "We need more sustainable transport."], ["raise awareness", "crear conciencia", "The campaign raises awareness of pollution."], ["take action", "tomar medidas", "Communities can take action together."]]}, {"l": "B1", "topic": "Personality, relationships & feelings", "words": [["reliable", "confiable", "She's reliable and always keeps her promises."], ["considerate", "considerado", "It was considerate of you to call."], ["confident", "seguro de sí mismo", "He feels more confident speaking English."], ["frustrated", "frustrado", "I felt frustrated by the delay."], ["get along with", "llevarse bien con", "I get along with my neighbours."], ["supportive", "que brinda apoyo", "My colleagues are very supportive."], ["disappointed", "decepcionado", "We were disappointed with the result."], ["resolve a conflict", "resolver un conflicto", "They met to resolve the conflict."]]}, {"l": "B2", "topic": "Media, technology & digital society", "words": [["data privacy", "privacidad de datos", "Data privacy should be taken seriously."], ["misleading", "engañoso", "The headline was misleading."], ["bias", "sesgo", "The report may contain bias."], ["algorithm", "algoritmo", "The platform uses an algorithm to rank content."], ["cybersecurity", "ciberseguridad", "Cybersecurity requires regular updates."], ["user-friendly", "fácil de usar", "The new interface is user-friendly."], ["to scrutinise", "examinar minuciosamente", "Researchers scrutinised the available evidence."], ["digital footprint", "huella digital", "Think about your digital footprint."]]}, {"l": "B2", "topic": "Debate, evidence & persuasion", "words": [["counterargument", "contraargumento", "A strong essay considers a counterargument."], ["substantiate", "fundamentar", "The author substantiates the claim with data."], ["plausible", "verosímil", "That is a plausible explanation."], ["compelling", "convincente", "She presented a compelling case."], ["concession", "concesión", "The writer makes a concession before disagreeing."], ["undermine", "debilitar", "Poor evidence can undermine an argument."], ["whereas", "mientras que", "Costs increased, whereas quality remained stable."], ["on balance", "en conjunto", "On balance, the benefits outweigh the risks."]]}, {"l": "C1", "topic": "Research, evidence & methodology", "words": [["empirical", "empírico", "The claim requires empirical support."], ["robust", "sólido / riguroso", "The study is based on robust evidence."], ["longitudinal", "longitudinal", "A longitudinal study follows participants over time."], ["correlation", "correlación", "Correlation does not necessarily imply causation."], ["replicate", "replicar", "Other teams tried to replicate the findings."], ["methodological", "metodológico", "The paper discusses methodological limitations."], ["underlying assumption", "supuesto subyacente", "The argument rests on an underlying assumption."], ["sample size", "tamaño de muestra", "The sample size was relatively small."]]}, {"l": "C1", "topic": "Nuance, stance & evaluation", "words": [["ambivalent", "ambivalente", "The public response was ambivalent."], ["contentious", "polémico", "It remains a contentious issue."], ["inherent", "inherente", "There are inherent limitations to the method."], ["pervasive", "generalizado", "Digital devices are pervasive in modern life."], ["tentative", "provisional", "The conclusions are tentative."], ["notwithstanding", "a pesar de", "Notwithstanding these concerns, the project continued."], ["to a considerable extent", "en gran medida", "The outcome depends, to a considerable extent, on context."], ["shed light on", "arrojar luz sobre", "The interviews shed light on the participants' experiences."]]}];
const epFinalReadings = [{"l": "A1", "title": "A busy Saturday", "kind": "Everyday life", "text": "On Saturday, Daniel gets up at eight. He has breakfast with his sister and then goes to the market. He buys tomatoes, bread and some oranges. In the afternoon, he plays football with his friends. In the evening, he watches a film at home. He is tired, but he is happy because he enjoys his weekends.", "qs": [{"q": "What time does Daniel get up?", "opts": ["At seven", "At eight", "At nine"], "ans": 1}, {"q": "Where does he go in the morning?", "opts": ["To the market", "To the cinema", "To school"], "ans": 0}, {"q": "What does he do in the afternoon?", "opts": ["He cooks dinner", "He plays football", "He watches a film"], "ans": 1}, {"q": "How does he feel in the evening?", "opts": ["Angry", "Bored", "Tired but happy"], "ans": 2}]}, {"l": "A2", "title": "A weekend in the countryside", "kind": "Travel and experiences", "text": "Last month, my friends and I spent a weekend in a small village in the mountains. We rented a house near a river and explored several walking paths. The weather was colder than we expected, so we bought warm clothes at a local shop. On Sunday, a guide showed us an old bridge and explained its history. We took plenty of photos and promised to return in the summer.", "qs": [{"q": "Where did the group stay?", "opts": ["In a hotel in the city", "In a house near a river", "At a campsite"], "ans": 1}, {"q": "Why did they buy warm clothes?", "opts": ["The weather was colder than expected", "They lost their luggage", "The guide asked them to"], "ans": 0}, {"q": "What did the guide show them?", "opts": ["A museum", "An old bridge", "A waterfall"], "ans": 1}, {"q": "When do they hope to return?", "opts": ["In winter", "Next weekend", "In summer"], "ans": 2}]}, {"l": "B1", "title": "Why local libraries still matter", "kind": "Society and education", "text": "Although many people now read on digital devices, local libraries continue to play an important role. They provide free access to books, computers and reliable information. They also offer a quiet place to study and organise activities for children and adults. For people who cannot afford a stable internet connection, library services can make a real difference. Rather than disappearing, many libraries are adapting by combining traditional collections with digital resources and community programmes.", "qs": [{"q": "What is the main idea?", "opts": ["Libraries are no longer useful", "Libraries are adapting and remain valuable", "Digital devices should be banned"], "ans": 1}, {"q": "Who may particularly benefit from library internet access?", "opts": ["People without a reliable connection at home", "Only university professors", "People who never read"], "ans": 0}, {"q": "What does 'adapting' mean in this text?", "opts": ["Refusing to change", "Changing to meet new needs", "Closing permanently"], "ans": 1}, {"q": "Which service is NOT mentioned?", "opts": ["Computers", "Community programmes", "Free private transport"], "ans": 2}]}, {"l": "B2", "title": "The hidden cost of convenience", "kind": "Opinion and argument", "text": "On-demand services have made everyday tasks faster, from ordering meals to receiving household goods. Yet convenience can conceal costs that are distributed unevenly. Workers may face unpredictable schedules, consumers may share more personal data than they realise, and local businesses can struggle to compete with large platforms. This does not mean that digital services should be rejected. It does suggest, however, that convenience should be assessed alongside working conditions, privacy and the long-term health of local economies.", "qs": [{"q": "What is the writer's central argument?", "opts": ["Convenience has benefits but should be assessed alongside wider costs", "All digital services should close", "Consumers never benefit from technology"], "ans": 0}, {"q": "Which group may experience unpredictable schedules?", "opts": ["Platform workers", "Local library users", "Government researchers"], "ans": 0}, {"q": "What does 'distributed unevenly' suggest?", "opts": ["Everyone experiences identical effects", "Costs affect different groups in different ways", "Costs do not exist"], "ans": 1}, {"q": "What is the writer's attitude?", "opts": ["Completely opposed to technology", "Uncritical and enthusiastic", "Balanced and qualified"], "ans": 2}]}, {"l": "C1", "title": "The limits of measurable success", "kind": "Academic and critical reading", "text": "Institutions increasingly rely on indicators to evaluate performance, allocate resources and demonstrate accountability. Quantification can reveal patterns that might otherwise remain invisible; nevertheless, indicators are never neutral representations of reality. The choice of what to measure, how to interpret results and which outcomes to disregard reflects underlying priorities. Once a metric becomes a target, organisations may optimise performance in ways that satisfy the measure while neglecting the broader purpose it was intended to represent. Responsible evaluation therefore requires both quantitative evidence and informed qualitative judgement.", "qs": [{"q": "What is the passage primarily concerned with?", "opts": ["The usefulness and limitations of performance indicators", "The history of mathematics", "The rejection of all institutional evaluation"], "ans": 0}, {"q": "Why are indicators not neutral?", "opts": ["They are always inaccurate", "Choices about measurement reflect priorities", "They cannot contain numbers"], "ans": 1}, {"q": "What can happen when a metric becomes a target?", "opts": ["The wider purpose may be neglected", "All outcomes improve equally", "Measurement becomes unnecessary"], "ans": 0}, {"q": "What does the writer recommend?", "opts": ["Only quantitative evidence", "Only personal opinions", "Combining quantitative and qualitative judgement"], "ans": 2}]}];
const epFinalListening = [{"l": "A1", "title": "A phone call to a friend", "kind": "Everyday conversation", "text": "Hi, Emma. It's Lucy. Are you at home? No, I'm at the supermarket. Oh, okay. Do you want to meet at the park at three? Yes, that sounds great. I'll bring a bottle of water. Perfect. See you there. Bye!", "qs": [{"q": "Where is Emma?", "opts": ["At home", "At the supermarket", "At school"], "ans": 1}, {"q": "Where do they want to meet?", "opts": ["At the park", "At the station", "At a café"], "ans": 0}, {"q": "What will Lucy bring?", "opts": ["A book", "A sandwich", "A bottle of water"], "ans": 2}, {"q": "What time will they meet?", "opts": ["At two", "At three", "At four"], "ans": 1}]}, {"l": "A2", "title": "A train announcement", "kind": "Public announcement", "text": "Attention, passengers. The 10:15 service to Manchester will now depart from platform six instead of platform three. The train is running approximately ten minutes late. Passengers travelling to Leeds should remain on this train until Sheffield, where they will need to change. We apologise for the inconvenience.", "qs": [{"q": "Which platform should passengers use?", "opts": ["Platform three", "Platform five", "Platform six"], "ans": 2}, {"q": "How late is the train?", "opts": ["About ten minutes", "About twenty minutes", "One hour"], "ans": 0}, {"q": "Where should passengers for Leeds change trains?", "opts": ["Manchester", "Sheffield", "London"], "ans": 1}, {"q": "What is the purpose of the announcement?", "opts": ["To advertise a journey", "To give updated travel information", "To cancel all services"], "ans": 1}]}, {"l": "B1", "title": "A short talk on volunteering", "kind": "Talk / monologue", "text": "When I first started volunteering at the community centre, I thought I would mainly be helping other people. That certainly happened, but I also gained skills I hadn't expected. I became more confident speaking to groups, learned to organise events and met people from different backgrounds. It wasn't always easy: sometimes we had limited resources, and plans changed at the last minute. Still, the experience taught me to be flexible and work as part of a team.", "qs": [{"q": "What did the speaker initially expect?", "opts": ["To gain a promotion", "Mainly to help other people", "To travel abroad"], "ans": 1}, {"q": "Which skill did the speaker develop?", "opts": ["Public speaking", "Driving", "Graphic design"], "ans": 0}, {"q": "What challenge did they face?", "opts": ["Too many paid staff", "Limited resources and changing plans", "No contact with the public"], "ans": 1}, {"q": "How does the speaker feel about the experience?", "opts": ["It was worthwhile despite difficulties", "It was a complete failure", "It was boring"], "ans": 0}]}, {"l": "B2", "title": "An expert discusses remote work", "kind": "Interview", "text": "Interviewer: Has remote work fundamentally changed professional life? Expert: It has changed where work happens, but the more significant shift concerns how organisations coordinate and evaluate it. When presence is no longer visible, managers need clearer objectives and more deliberate communication. There are advantages, including flexibility and access to wider talent pools, but isolation and blurred boundaries can become serious problems. The evidence suggests that outcomes depend less on the location itself than on the quality of management and the design of work.", "qs": [{"q": "What does the expert see as the most significant shift?", "opts": ["The end of professional communication", "Changes in coordination and evaluation", "A universal reduction in working hours"], "ans": 1}, {"q": "Why may managers need clearer objectives?", "opts": ["Because physical presence is less visible", "Because employees no longer have tasks", "Because all work is now individual"], "ans": 0}, {"q": "Which disadvantage is mentioned?", "opts": ["Higher office rent", "Isolation and blurred boundaries", "Lack of technology everywhere"], "ans": 1}, {"q": "What does the expert suggest outcomes depend on?", "opts": ["Location alone", "The quality of management and work design", "The number of meetings"], "ans": 1}]}, {"l": "C1", "title": "A lecture on public trust in science", "kind": "Academic lecture", "text": "Public trust in science is sometimes treated as a communication problem: if researchers explain their findings more clearly, confidence will follow. Clarity matters, but trust is also shaped by institutional conduct, transparency about uncertainty and the willingness to acknowledge mistakes. Scientific knowledge is provisional by design; conclusions may be refined as evidence accumulates. Presenting revision as a weakness can therefore be counterproductive. A more credible approach is to explain not only what is currently known, but also how that knowledge was established and where its limits lie.", "qs": [{"q": "What assumption does the lecturer question?", "opts": ["That trust depends only on clearer explanations", "That evidence can change", "That institutions matter"], "ans": 0}, {"q": "Why is acknowledging uncertainty important?", "opts": ["It makes all findings useless", "It reflects how scientific knowledge develops", "It removes the need for evidence"], "ans": 1}, {"q": "What may happen if revision is presented as weakness?", "opts": ["Public trust may be undermined", "Research becomes certain", "All disagreement disappears"], "ans": 0}, {"q": "What approach does the lecturer recommend?", "opts": ["Communicating findings and their limits transparently", "Avoiding difficult questions", "Presenting every result as final"], "ans": 0}]}];
grammar.push(...epFinalGrammar);
vocab.push(...epFinalVocab);
readings.push(...epFinalReadings);
listening.push(...epFinalListening);

function epEsc(value){
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function epJs(value){
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/[\r\n]+/g, ' ');
}
function epLevelTabs(){
  return `<div class="ep-level-tabs" aria-label="Choose CEFR level">${levels.map(l=>`<button class="ep-level-tab ${currentLevel===l?'active':''}" onclick="chooseLevel('${l}')">${l}<small>${epEsc(levelNames[l])}</small></button>`).join('')}</div>`;
}
function epLevelCount(items){
  return `<p class="ep-small">${items.length} learning resources at ${currentLevel}. Choose a card to study.</p>`;
}
function epGrammar(){
  const items=grammar.filter(x=>x.l===currentLevel);
  return `${epHead('GRAMMAR ACADEMY',`${currentLevel} · Grammar in context`,`Build accuracy step by step. Study the form, notice how it works, practise it and then use it in your own communication.`)}
  ${epLevelTabs()}${epLevelCount(items)}
  <div class="ep-grid">${items.map((g)=>`<article class="ep-card"><span class="ep-pill">${epEsc(g.l)} · ${epEsc(g.cat)}</span><h3>${epEsc(g.t)}</h3><p>${epEsc(g.desc)}</p><div class="ep-rule-preview">${epEsc(g.rule)}</div><p class="ep-small">${(g.qs||[]).length} guided practice questions + production tasks</p><div class="ep-actions"><button class="ep-btn" onclick="epGrammarLesson(${grammar.indexOf(g)})">Study this topic →</button></div></article>`).join('')}</div>`;
}
function epGrammarLesson(i){
  const g=grammar[i]; if(!g)return;
  const qs=g.qs||[];
  let html=`<div class="ep-kicker">${epEsc(g.l)} · ${epEsc(g.cat)}</div>
  <p class="ep-lead">${epEsc(g.desc)}</p>
  <div class="ep-panel"><h3>1. Form and meaning</h3><div class="ep-rule-preview">${epEsc(g.rule)}</div><h3>2. Examples in context</h3><ul>${(g.ex||[]).map(e=>`<li>${epEsc(e)}</li>`).join('')}</ul><div class="ep-tip"><b>Learning tip:</b> ${epEsc(g.tip||'Notice the form and use it in a complete sentence.')}</div></div>
  <div class="ep-panel"><h3>3. Controlled practice</h3><p class="ep-small">Choose the best answer or type the missing word. Read the feedback after each question.</p>`;
  qs.forEach((x,j)=>{
    const q=epEsc(x.q||x.question||x.words?.join(' ')||'Complete the sentence');
    html+=`<div class="ep-question"><b>${j+1}. ${q}</b>${x.opts?x.opts.map((o,k)=>`<button class="ep-option" onclick="epAnswer(this,${k},${Number(x.ans)},'${epJs(x.exp||'Review the rule and try again.')}')">${epEsc(o)}</button>`).join(''):`<input class="ep-input" id="epg${i}_${j}" placeholder="Type your answer"><button class="ep-btn secondary" onclick="epTextAnswer('epg${i}_${j}','${epJs(String(x.ans))}','${epJs(x.exp||'Check the grammar rule.')}')">Check answer</button>`}<div id="epgf${i}_${j}"></div></div>`;
  });
  html+=`</div><div class="ep-panel"><h3>4. Personalised practice</h3><p><b>Task A — Make it personal.</b> Write two true sentences about your life using this grammar point.</p><textarea class="ep-textarea" id="epOwnA" placeholder="Sentence 1…&#10;Sentence 2…"></textarea><p><b>Task B — Use it to communicate.</b> Write a short question and answer, or a three-line mini-dialogue using the target structure.</p><textarea class="ep-textarea" id="epOwnB" placeholder="A: …&#10;B: …"></textarea><div class="ep-checklist"><label><input type="checkbox"> I used the correct form.</label><label><input type="checkbox"> My sentences communicate a clear meaning.</label><label><input type="checkbox"> I checked spelling and punctuation.</label></div><button class="ep-btn" onclick="epMark('grammar-${i}',100);alert('Lesson marked as practised. Your written practice remains in this window until you close it.')">Mark lesson practised</button></div>`;
  showModal('GRAMMAR ACADEMY',g.t,html);
}
function epAnswer(btn,k,ans,exp){
  const parent=btn.parentElement;
  if(parent.dataset.answered==='1')return;
  parent.dataset.answered='1';
  parent.querySelectorAll('.ep-option').forEach(b=>b.disabled=true);
  btn.classList.add('chosen');
  const good=Number(k)===Number(ans);
  const f=document.createElement('div');f.className='ep-feedback'+(good?'':' bad');
  f.textContent=(good?'Correct. ':'Not quite. ')+(exp|| (good?'Well done.':'Review the example and try another activity.'));
  parent.appendChild(f);
}
function epTextAnswer(id,ans,exp){
  const el=document.getElementById(id); if(!el)return;
  const f=el.parentElement.querySelector('.ep-feedback')||document.createElement('div');
  f.className='ep-feedback';
  const normal=s=>String(s).trim().toLowerCase().replace(/[.!?]+$/,'').replace(/\s+/g,' ');
  const good=normal(el.value)===normal(ans);
  f.className='ep-feedback'+(good?'':' bad');
  f.textContent=good?'Correct. Well done.':`Not quite. ${exp||'Check the form and try again.'}`;
  if(!f.parentElement)el.insertAdjacentElement('afterend',f);
}
function epVocabulary(){
  const items=vocab.filter(x=>x.l===currentLevel);
  return `${epHead('VOCABULARY BUILDER',`${currentLevel} · Words you can use`,'Learn words in meaningful topics, notice collocations, listen to pronunciation and actively retrieve new language.')}
  ${epLevelTabs()}${epLevelCount(items)}
  <div class="ep-grid">${items.map(v=>`<article class="ep-card"><span class="ep-pill">${epEsc(v.l)} · TOPIC</span><h3>${epEsc(v.topic)}</h3><p>${v.words.length} words and useful expressions, with translations and example sentences.</p><div class="ep-actions"><button class="ep-btn" onclick="epVocabSet(${vocab.indexOf(v)})">Study & practise →</button></div></article>`).join('')}</div>
  <div class="ep-panel"><h3>How to learn vocabulary effectively</h3><ol><li>Notice the meaning and part of speech.</li><li>Read the example sentence aloud.</li><li>Learn the word as part of a phrase or collocation.</li><li>Cover the translation and try to recall the meaning.</li><li>Write a new sentence connected to your own life.</li></ol></div>`;
}
function epVocabSet(i){
  const v=vocab[i]; if(!v)return;
  const words=v.words||[];
  const cards=words.map((w,j)=>`<article class="ep-vocab-word"><div><span class="ep-pill">WORD ${j+1}</span><h3>${epEsc(w[0])}</h3><p class="ep-translation" id="eptransword${j}" hidden>${epEsc(w[1])}</p><p class="ep-example">${epEsc(w[2])}</p></div><div class="ep-actions"><button class="ep-btn secondary" onclick="epToggleWord(${j})">Show meaning</button><button class="ep-btn outline" onclick="epSpeak('${epJs(w[0])}')">🔊 Pronounce</button></div></article>`).join('');
  const quiz=words.slice(0,Math.min(6,words.length)).map((w,j)=>{
    const distractors=words.filter((z,k)=>k!==j).slice(0,2);
    const opts=[w[1],...distractors.map(z=>z[1])];
    const rotation=j%3; const rotated=opts.slice(rotation).concat(opts.slice(0,rotation));
    const answer=rotated.indexOf(w[1]);
    return `<div class="ep-question"><b>${j+1}. What does “${epEsc(w[0])}” mean?</b>${rotated.map((o,k)=>`<button class="ep-option" onclick="epAnswer(this,${k},${answer},'Think about the example sentence: ${epEsc(w[2]).replace(/'/g,"&#39;")}')">${epEsc(o)}</button>`).join('')}</div>`;
  }).join('');
  showModal('VOCABULARY BUILDER',v.topic,`<div class="ep-kicker">${v.l} · ${words.length} vocabulary items</div><p>Read each word, check its meaning and example, and listen to the pronunciation.</p><div class="ep-vocab-grid">${cards}</div><div class="ep-panel"><h3>Practice 1 · Meaning check</h3>${quiz}</div><div class="ep-panel"><h3>Practice 2 · Make it your own</h3><p>Choose three new words and write one original sentence for each.</p><textarea class="ep-textarea" id="epVocabOwn" placeholder="1. …&#10;2. …&#10;3. …"></textarea><button class="ep-btn" onclick="epMark('vocab-${i}',100);alert('Vocabulary practice completed.')">Mark set practised</button></div>`);
}
function epToggleWord(j){
  const p=document.getElementById('eptransword'+j); if(p){p.hidden=!p.hidden;const b=p.parentElement.parentElement.querySelector('button');if(b)b.textContent=p.hidden?'Show meaning':'Hide meaning';}
}

// Text-to-speech: queue sentence-sized chunks, wait for voice list where possible,
// expose status and stop/pause controls, and provide clear diagnostics.
let epSpeechRate=1, epSpeechChunks=[], epSpeechIndex=0, epSpeechStatusId=null, epSpeechButtonId=null, epSpeechCurrent=false, epSpeechRunId=0;
function epSpeechStatus(msg){
  const el=epSpeechStatusId&&document.getElementById(epSpeechStatusId);
  if(el)el.textContent=msg;
}
function epSpeechButton(msg){
  const el=epSpeechButtonId&&document.getElementById(epSpeechButtonId);
  if(el)el.textContent=msg;
}
function epGetEnglishVoice(){
  if(!window.speechSynthesis)return null;
  const voices=window.speechSynthesis.getVoices()||[];
  const preferred=document.getElementById('epVoiceSelect')?.value||'';
  return voices.find(v=>v.name===preferred)||voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en-US/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang))||null;
}
function epSplitSpeech(text){
  const sentences=String(text).replace(/\s+/g,' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[String(text)];
  const chunks=[];let part='';
  sentences.forEach(sentence=>{
    const s=sentence.trim(); if(!s)return;
    if((part+' '+s).trim().length>190&&part){chunks.push(part.trim());part=s;}else{part=(part+' '+s).trim();}
  });
  if(part)chunks.push(part);
  return chunks.length?chunks:[String(text)];
}
function epSpeak(text,rate=epSpeechRate,statusId=null,buttonId=null){
  if(!window.speechSynthesis||typeof SpeechSynthesisUtterance==='undefined'){
    if(statusId){const el=document.getElementById(statusId);if(el)el.textContent='This browser does not support speech playback. Please open the file in an updated Chrome or Edge browser.';}
    else alert('This browser does not support speech playback. Please open the platform in an updated Chrome or Edge browser.');
    return;
  }
  const content=String(text||'').trim(); if(!content)return;
  window.speechSynthesis.cancel();
  const runId=++epSpeechRunId;
  epSpeechChunks=epSplitSpeech(content);epSpeechIndex=0;epSpeechRate=Number(rate)||1;
  epSpeechStatusId=statusId;epSpeechButtonId=buttonId;epSpeechCurrent=true;
  epSpeechStatus('Preparing English voice…');
  const speakNext=()=>{
    if(runId!==epSpeechRunId||!epSpeechCurrent||epSpeechIndex>=epSpeechChunks.length){
      epSpeechCurrent=false;epSpeechStatus('Playback finished. You can listen again or review the transcript.');epSpeechButton('▶ Play again');return;
    }
    const chunk=epSpeechChunks[epSpeechIndex];
    const utterance=new SpeechSynthesisUtterance(chunk);
    const voice=epGetEnglishVoice();
    utterance.lang=voice?.lang||'en-GB';
    if(voice)utterance.voice=voice;
    utterance.rate=epSpeechRate;utterance.pitch=1;
    utterance.onstart=()=>{if(runId!==epSpeechRunId)return;epSpeechStatus(`Playing audio · part ${epSpeechIndex+1} of ${epSpeechChunks.length}`);epSpeechButton('⏸ Pause');};
    utterance.onend=()=>{if(runId!==epSpeechRunId)return;epSpeechIndex++;speakNext();};
    utterance.onerror=(event)=>{
      if(runId!==epSpeechRunId)return;
      epSpeechCurrent=false;
      const reason=event.error||'unknown playback error';
      epSpeechStatus(`Audio could not play (${reason}). Try Chrome/Edge, check your device volume and confirm that an English voice is installed.`);
      epSpeechButton('▶ Try again');
    };
    window.speechSynthesis.speak(utterance);
  };
  // getVoices() may initially be empty; speak still works with the language fallback.
  window.speechSynthesis.getVoices();
  speakNext();
}
function epPauseSpeech(){
  if(!window.speechSynthesis)return;
  if(window.speechSynthesis.speaking&&!window.speechSynthesis.paused){
    window.speechSynthesis.pause();epSpeechStatus('Paused. Press Resume to continue.');epSpeechButton('▶ Resume');
  }else if(window.speechSynthesis.paused){
    window.speechSynthesis.resume();epSpeechStatus('Resuming audio…');epSpeechButton('⏸ Pause');
  }
}
function epStopSpeech(){
  epSpeechRunId++;
  if(window.speechSynthesis)window.speechSynthesis.cancel();
  epSpeechCurrent=false;epSpeechStatus('Playback stopped.');epSpeechButton('▶ Play audio');
}
function epSpeakByIndex(i){
  const item=listening[i];if(item)epSpeak(item.text,epSpeechRate,'epAudioStatus','epPlayBtn');
}
function epListening(){
  const items=listening.filter(x=>x.l===currentLevel);
  return `${epHead('LISTENING LAB',`${currentLevel} · Listen for meaning`,'Develop listening strategies: predict, listen for gist, identify key details, notice opinions and infer meaning from context.')}
  ${epLevelTabs()}${epLevelCount(items)}
  <div class="ep-grid">${items.map(a=>`<article class="ep-card"><span class="ep-pill">${epEsc(a.l)} · ${epEsc(a.kind)}</span><h3>${epEsc(a.title)}</h3><p>${a.text.split(/\s+/).length} words · ${a.qs.length} comprehension questions</p><p class="ep-small">First listen for the main idea. Listen again for names, numbers, reasons and key details.</p><div class="ep-actions"><button class="ep-btn" onclick="epListen(${listening.indexOf(a)})">Open listening →</button></div></article>`).join('')}</div>
  <div class="ep-panel"><h3>Listening strategy</h3><ol><li>Before listening, read the title and predict the topic.</li><li>First listening: do not stop; identify the situation and main idea.</li><li>Second listening: focus on details and answer the questions.</li><li>Finally, reveal the transcript and notice words you missed.</li></ol></div>`;
}
function epListen(i){
  const a=listening[i];if(!a)return;
  epStopSpeech();
  const voices=window.speechSynthesis?window.speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang)):[];
  const voiceOptions=voices.map(v=>`<option value="${epEsc(v.name)}">${epEsc(v.name)} (${epEsc(v.lang)})</option>`).join('');
  let html=`<div class="ep-kicker">${epEsc(a.l)} · ${epEsc(a.kind)} · ${a.text.split(/\s+/).length} words</div>
  <h2>${epEsc(a.title)}</h2>
  <div class="ep-panel ep-audio-panel">
    <div class="ep-row"><div><b>Listening player</b><p class="ep-small">Generated speech · English voice · Available English voices depend on your browser and operating system; some voices may require an internet connection.</p></div><span class="ep-pill">TEXT-TO-SPEECH</span></div>
    <div class="ep-audio-controls"><button class="ep-btn" id="epPlayBtn" onclick="epSpeakByIndex(${i})">▶ Play audio</button><button class="ep-btn secondary" onclick="epPauseSpeech()">⏸ Pause / Resume</button><button class="ep-btn outline" onclick="epStopSpeech()">■ Stop</button></div>
    <div class="ep-audio-settings"><label>Playback speed<select class="ep-select" id="epRate" onchange="epSpeechRate=Number(this.value)"><option value="0.75">0.75× slower</option><option value="0.9">0.9×</option><option value="1" selected>1.0× normal</option><option value="1.1">1.1×</option><option value="1.25">1.25× faster</option></select></label><label>English voice<select class="ep-select" id="epVoiceSelect"><option value="">Automatic English voice</option>${voiceOptions}</select></label></div>
    <p class="ep-audio-status" id="epAudioStatus" role="status" aria-live="polite">Ready. Press Play audio to begin. If no sound is heard, check device volume and try another English voice.</p>
  </div>
  <div class="ep-panel"><div class="ep-row"><h3>Before / after listening</h3><button class="ep-btn secondary" onclick="epToggleTranscript()">Show transcript</button></div><div id="epTranscript" class="ep-transcript" hidden>${epEsc(a.text)}</div><p class="ep-small">Try answering the questions before opening the transcript.</p></div>
  <div class="ep-panel"><h3>Comprehension check</h3><p class="ep-small">Select one answer for each question, then check your score.</p>`;
  a.qs.forEach((q,j)=>{html+=`<div class="ep-question" data-listen-q="${j}"><b>${j+1}. ${epEsc(q.q)}</b>${q.opts.map((o,k)=>`<button class="ep-option" data-choice="${k}" onclick="epListenAnswer(this,${k},${q.ans},${j})">${epEsc(o)}</button>`).join('')}<div class="ep-answer-feedback"></div></div>`;});
  html+=`<button class="ep-btn" onclick="epSubmitListening(${i})">Check my answers</button><div id="epListenScore" class="ep-feedback" hidden></div></div>
  <div class="ep-panel"><h3>After listening · Reflection</h3><p>Which words or phrases were difficult to understand? What helped you understand the speaker?</p><textarea class="ep-textarea" id="epListenReflection" placeholder="I found it difficult to understand…"></textarea><button class="ep-btn secondary" onclick="epMark('listening-${i}',100);alert('Listening practice marked as completed.')">Mark listening completed</button></div>`;
  showModal('LISTENING LAB',a.title,html);
  epSpeechRate=1;
}
function epToggleTranscript(){const t=document.getElementById('epTranscript');if(t){t.hidden=!t.hidden;const b=t.parentElement.querySelector('button');if(b)b.textContent=t.hidden?'Show transcript':'Hide transcript';}}
function epListenAnswer(btn,k,ans,j){
  const row=btn.closest('[data-listen-q]');if(!row||row.dataset.answered==='1')return;
  row.dataset.answered='1';row.dataset.correct=String(Number(k)===Number(ans));
  row.querySelectorAll('.ep-option').forEach(b=>b.disabled=true);
  btn.classList.add('chosen');
  const f=row.querySelector('.ep-answer-feedback');
  f.textContent=Number(k)===Number(ans)?'Answer selected.':'Answer selected. Check your result after completing all questions.';
}
function epSubmitListening(i){
  const a=listening[i];let correct=0,answered=0;
  a.qs.forEach((q,j)=>{const row=document.querySelector(`[data-listen-q="${j}"]`);if(row){answered++;if(row.dataset.correct==='true')correct++;const f=row.querySelector('.ep-answer-feedback');if(f)f.textContent=(row.dataset.correct==='true'?'✓ Correct. ':'✗ Review this one. ')+`Correct answer: ${q.opts[q.ans]}`;}});
  const pct=answered?Math.round(correct/a.qs.length*100):0;
  const score=document.getElementById('epListenScore');if(score){score.hidden=false;score.textContent=`Your result: ${correct}/${a.qs.length} (${pct}%). ${pct>=75?'Good work.':'Listen again, review the transcript and try once more.'}`;}
  scores[`listening-${i}`]=pct;if(pct>=70&&!done.includes(`listening-${i}`))done.push(`listening-${i}`);epSave();
}
function epReading(){
  const items=readings.filter(x=>x.l===currentLevel);
  return `${epHead('READING CENTRE',`${currentLevel} · Read and understand`,'Build reading fluency through skimming, scanning, inference, vocabulary in context, writer purpose and critical response.')}
  ${epLevelTabs()}${epLevelCount(items)}
  <div class="ep-grid">${items.map(a=>`<article class="ep-card"><span class="ep-pill">${epEsc(a.l)} · ${epEsc(a.kind||'READING')}</span><h3>${epEsc(a.title)}</h3><p>${a.text.split(/\s+/).length} words · ${(a.qs||[]).length} comprehension questions</p><p class="ep-small">${epEsc(a.text.slice(0,135))}…</p><div class="ep-actions"><button class="ep-btn" onclick="epRead(${readings.indexOf(a)})">Read text →</button></div></article>`).join('')}</div>
  <div class="ep-panel"><h3>Reading strategies</h3><ul><li><b>Skimming:</b> read quickly to understand the main idea.</li><li><b>Scanning:</b> look for specific names, dates, figures or key words.</li><li><b>Inference:</b> use clues to understand ideas that are not stated directly.</li><li><b>Vocabulary in context:</b> use surrounding words to infer meaning.</li></ul></div>`;
}
function epRead(i){
  const a=readings[i];if(!a)return;
  let html=`<div class="ep-kicker">${epEsc(a.l)} · ${epEsc(a.kind||'READING')} · ${a.text.split(/\s+/).length} words</div><h2>${epEsc(a.title)}</h2>
  <div class="ep-panel ep-reading-text"><p>${epEsc(a.text)}</p></div>
  <div class="ep-panel"><h3>Reading comprehension</h3><p class="ep-small">Read the text carefully and choose the best answer.</p>`;
  (a.qs||[]).forEach((q,j)=>{html+=`<div class="ep-question" data-read-q="${j}"><b>${j+1}. ${epEsc(q.q)}</b>${q.opts.map((o,k)=>`<button class="ep-option" onclick="epReadAnswer(this,${k},${q.ans},${j})">${epEsc(o)}</button>`).join('')}<div class="ep-answer-feedback"></div></div>`;});
  html+=`<button class="ep-btn" onclick="epSubmitReading(${i})">Check comprehension</button><div id="epReadScore" class="ep-feedback" hidden></div></div>
  <div class="ep-panel"><h3>Vocabulary in context</h3><p>Choose one unfamiliar word or expression from the text. Write what you think it means and identify the clue that helped you.</p><textarea class="ep-textarea" placeholder="Word or expression: …&#10;My meaning: …&#10;Clue from the text: …"></textarea><h3>Critical response</h3><p>Write one sentence explaining your opinion about the topic or the writer's main point.</p><textarea class="ep-textarea" placeholder="In my opinion…"></textarea><button class="ep-btn secondary" onclick="epMark('reading-${i}',100);alert('Reading practice marked as completed.')">Mark reading completed</button></div>`;
  showModal('READING CENTRE',a.title,html);
}
function epReadAnswer(btn,k,ans,j){
  const row=btn.closest('[data-read-q]');if(!row||row.dataset.answered==='1')return;
  row.dataset.answered='1';row.dataset.correct=String(Number(k)===Number(ans));
  row.querySelectorAll('.ep-option').forEach(b=>b.disabled=true);btn.classList.add('chosen');
}
function epSubmitReading(i){
  const a=readings[i];let correct=0,answered=0;
  a.qs.forEach((q,j)=>{const row=document.querySelector(`[data-read-q="${j}"]`);if(row){answered++;if(row.dataset.correct==='true')correct++;const f=row.querySelector('.ep-answer-feedback');if(f)f.textContent=(row.dataset.correct==='true'?'✓ Correct. ':'✗ Review this one. ')+`Correct answer: ${q.opts[q.ans]}`;}});
  const pct=answered?Math.round(correct/a.qs.length*100):0;
  const score=document.getElementById('epReadScore');if(score){score.hidden=false;score.textContent=`Your result: ${correct}/${a.qs.length} (${pct}%). ${pct>=75?'Good reading.':'Return to the text and try again.'}`;}
  scores[`reading-${i}`]=pct;if(pct>=70&&!done.includes(`reading-${i}`))done.push(`reading-${i}`);epSave();
}


// ENGLISH PATHWAY — FINAL CONTENT & PRACTICE UPGRADE
// Additional CEFR-focused vocabulary, extended readings and richer listening tasks.
const epUltimateVocabData = [
{l:'A1',topic:'Food, shopping & quantities',words:[
['a loaf of bread','una barra de pan','Can I have a loaf of bread, please?','noun phrase','buy a loaf of bread'],['a bottle of water','una botella de agua','We need two bottles of water.','noun phrase','a bottle of still water'],['a packet of biscuits','un paquete de galletas','There is a packet of biscuits in the cupboard.','noun phrase','open a packet'],['cheap','barato','These apples are cheap today.','adjective','cheap clothes / a cheap ticket'],['expensive','caro','That restaurant is too expensive for us.','adjective','quite expensive'],['receipt','recibo','Would you like the receipt?','noun','keep the receipt'],['change','vuelto','Here is your change.','noun','keep the change'],['How much?','¿Cuánto?','How much are these oranges?','question phrase','How much does it cost?']]},
{l:'A1',topic:'Home, furniture & daily objects',words:[
['shelf','estante','The books are on the top shelf.','noun','a kitchen shelf'],['drawer','cajón','My keys are in the first drawer.','noun','open a drawer'],['pillow','almohada','I need another pillow, please.','noun','a soft pillow'],['blanket','manta','It is cold, so take a blanket.','noun','a warm blanket'],['curtains','cortinas','Please open the curtains.','plural noun','draw the curtains'],['kettle','hervidor','The kettle is boiling.','noun','boil the kettle'],['switch','interruptor','Turn off the light switch.','noun / verb','switch on / off'],['tidy','ordenado / ordenar','I tidy my room every Saturday.','adjective / verb','keep a room tidy']]},
{l:'A2',topic:'Health, symptoms & appointments',words:[
['sore throat','dolor de garganta','I have a sore throat and a cough.','noun phrase','have a sore throat'],['appointment','cita','I have a dentist appointment at ten.','noun','make / cancel an appointment'],['prescription','receta médica','The doctor gave me a prescription.','noun','a repeat prescription'],['recover','recuperarse','It took her a week to recover.','verb','recover from an illness'],['symptom','síntoma','A high temperature can be a symptom.','noun','common symptoms'],['painful','doloroso','The movement is still painful.','adjective','a painful injury'],['chemist’s','farmacia','You can buy this medicine at the chemist’s.','noun','go to the chemist’s'],['get better','mejorar','I hope you get better soon.','verb phrase','feel much better']]},
{l:'A2',topic:'Travel problems & solutions',words:[
['miss a connection','perder una conexión','We missed our connection in Madrid.','verb phrase','miss a flight / train'],['delayed','retrasado','The 8.30 train is delayed.','adjective','a delayed flight'],['platform','andén','The train leaves from platform four.','noun','change platforms'],['luggage','equipaje','You can leave your luggage here.','uncountable noun','hand luggage'],['refund','reembolso','I would like a refund, please.','noun / verb','get a full refund'],['get lost','perderse','We got lost in the old town.','verb phrase','get completely lost'],['book in advance','reservar con anticipación','It is cheaper if you book in advance.','verb phrase','book tickets in advance'],['available','disponible','Are there any seats available?','adjective','rooms available']]},
{l:'B1',topic:'Learning, progress & problem-solving',words:[
['make progress','progresar','You will make progress if you practise regularly.','collocation','steady progress'],['overcome','superar','She overcame her fear of speaking.','verb','overcome a difficulty'],['approach','enfoque','We need a different approach to the task.','noun','a practical approach'],['deal with','afrontar / gestionar','He knows how to deal with pressure.','phrasal verb','deal with a problem'],['feedback','retroalimentación','The tutor gave us useful feedback.','uncountable noun','give / receive feedback'],['set a goal','fijar una meta','Set a realistic goal for this month.','collocation','achieve a goal'],['efficient','eficiente','This is a more efficient way to work.','adjective','an efficient system'],['take responsibility','asumir responsabilidad','Everyone should take responsibility for their learning.','collocation','take responsibility for']]},
{l:'B1',topic:'Environment, communities & lifestyle',words:[
['renewable energy','energía renovable','Solar power is a form of renewable energy.','noun phrase','renewable energy sources'],['waste','residuo / desperdiciar','The town is trying to reduce food waste.','noun / verb','reduce waste'],['commute','desplazarse al trabajo','She commutes by train every day.','verb / noun','a long commute'],['facilities','instalaciones','The sports centre has excellent facilities.','plural noun','public facilities'],['volunteer','voluntario / ofrecerse','Local people volunteer at the centre.','noun / verb','volunteer for a project'],['raise awareness','crear conciencia','The campaign raises awareness of water pollution.','collocation','raise public awareness'],['affordable','asequible','The city needs more affordable housing.','adjective','affordable housing'],['take part','participar','More than fifty residents took part.','verb phrase','take part in an event']]},
{l:'B2',topic:'Critical thinking & argumentation',words:[
['compelling evidence','evidencia convincente','The report provides compelling evidence for reform.','collocation','compelling evidence'],['counterargument','contraargumento','A strong essay considers a counterargument.','noun','address a counterargument'],['assumption','suposición','The proposal is based on an untested assumption.','noun','challenge an assumption'],['substantiate','respaldar con pruebas','The figures substantiate the researcher’s claim.','verb','substantiate a claim'],['ambiguous','ambiguo','The instructions are ambiguous and need clarification.','adjective','an ambiguous statement'],['trade-off','equilibrio entre ventajas y desventajas','There is a trade-off between speed and accuracy.','noun','make a trade-off'],['plausible','verosímil','That is a plausible explanation.','adjective','a plausible argument'],['in the long run','a largo plazo','In the long run, prevention may cost less.','linking phrase','beneficial in the long run']]},
{l:'B2',topic:'Work, organisations & change',words:[
['streamline','optimizar / simplificar','The new process should streamline communication.','verb','streamline a process'],['allocate','asignar','Managers must allocate resources carefully.','verb','allocate a budget'],['implement','implementar','The policy will be implemented next month.','verb','implement a strategy'],['stakeholder','parte interesada','All stakeholders were invited to the consultation.','noun','key stakeholders'],['accountability','rendición de cuentas','Transparency improves public accountability.','noun','ensure accountability'],['sustainable growth','crecimiento sostenible','The company is aiming for sustainable growth.','collocation','long-term sustainable growth'],['disruption','alteración / interrupción','The strike caused major disruption to services.','noun','cause disruption'],['resilient','resiliente','Resilient teams adapt to unexpected change.','adjective','a resilient organisation']]},
{l:'C1',topic:'Academic discourse & research',words:[
['empirical','empírico','The argument is supported by empirical findings.','adjective','empirical evidence'],['robust','sólido / riguroso','The study is based on a robust methodology.','adjective','robust evidence'],['tentative','provisional','The authors reach a tentative conclusion.','adjective','tentative findings'],['extrapolate','extrapolar','It would be risky to extrapolate from such a small sample.','verb','extrapolate data'],['corroborate','corroborar','Further research is needed to corroborate the claim.','verb','corroborate a finding'],['discrepancy','discrepancia','There is a discrepancy between the two datasets.','noun','a significant discrepancy'],['underpin','fundamentar','Several assumptions underpin the framework.','verb','underpin an argument'],['scrutinise','examinar minuciosamente','The committee will scrutinise the evidence.','verb','scrutinise a proposal']]},
{l:'C1',topic:'Nuance, stance & sophisticated expression',words:[
['albeit','aunque','The plan was successful, albeit expensive.','conjunction','albeit limited'],['ostensibly','aparentemente','The policy was ostensibly designed to help families.','adverb','ostensibly independent'],['nevertheless','no obstante','The sample was small; nevertheless, the results are useful.','linking adverb','nevertheless important'],['by no means','de ninguna manera','The issue is by no means resolved.','emphatic phrase','by no means certain'],['to some extent','hasta cierto punto','The criticism is justified to some extent.','hedging phrase','true to some extent'],['unwarranted','injustificado','The conclusion goes beyond the evidence and is unwarranted.','adjective','unwarranted assumption'],['inherent','inherente','There are inherent risks in the approach.','adjective','inherent limitations'],['notwithstanding','a pesar de','Notwithstanding these concerns, the project continued.','preposition / adverb','notwithstanding the evidence']]}
];
vocab.push(...epUltimateVocabData);

const epUltimateReadings = [
{l:'A1',title:'A busy Saturday in town',kind:'Everyday life · 145 words',text:`On Saturday morning, Mia gets up at half past seven. She has breakfast with her brother, Leo. They usually eat toast and fruit, but today they have eggs because it is Leo’s birthday. At nine o’clock, they walk to the town centre. First, Mia goes to the bookshop to buy a present. Leo wants a new football, so they visit a sports shop next door. The football is thirty pounds. At eleven, they meet their cousin outside the library. It is raining, so they decide to have lunch in a small café. Mia orders a cheese sandwich and a glass of orange juice. Leo has soup. In the afternoon, they take the bus home. They are tired, but they are happy because they spend the day together.`,qs:[
{q:'Why do Mia and Leo have eggs for breakfast?',opts:['It is Leo’s birthday','They have no bread','They are at a café'],ans:0},{q:'Where does Mia buy a present?',opts:['At the library','At the bookshop','At the sports shop'],ans:1},{q:'How much is the football?',opts:['Thirteen pounds','Thirty pounds','Forty pounds'],ans:1},{q:'Why do they have lunch inside?',opts:['It is raining','The shops are closed','They are late'],ans:0},{q:'How do they get home?',opts:['By train','On foot','By bus'],ans:2},{q:'Which word in the text means “exhausted”?',opts:['tired','happy','small'],ans:0}]},
{l:'A1',title:'A new flat and a helpful neighbour',kind:'Home and community · 150 words',text:`Daniel has a new flat near the city park. It is on the third floor of a small building. The flat has one bedroom, a living room, a kitchen and a bathroom. There is a supermarket across the street, and there are two bus stops nearby. On his first evening, Daniel cannot find the light switch in the hallway. His neighbour, Mrs Green, hears him and comes to help. She also tells him that the rubbish goes outside on Monday and Thursday evenings. The building has a shared garden, but residents must keep it clean. Daniel is pleased because the area is quiet and the people are friendly. The next morning, he writes a thank-you note to Mrs Green and leaves it at her door.`,qs:[
{q:'Where is Daniel’s flat?',opts:['Near a park','Next to a station','Above a supermarket'],ans:0},{q:'How many bedrooms does it have?',opts:['One','Two','Three'],ans:0},{q:'Who helps Daniel?',opts:['His brother','Mrs Green','A shop assistant'],ans:1},{q:'When is the rubbish collected or put outside?',opts:['Every morning','Monday and Thursday evenings','At weekends'],ans:1},{q:'What must residents do in the shared garden?',opts:['Keep it clean','Plant vegetables','Pay visitors'],ans:0},{q:'Why does Daniel write a note?',opts:['To complain','To say thank you','To ask for money'],ans:1}]},
{l:'A2',title:'The weekend that did not go to plan',kind:'Narrative · 190 words',text:`When Priya booked a weekend trip to the coast, she imagined two days of sunshine and long walks. Unfortunately, the weather forecast changed on Friday evening. Heavy rain was expected, and the train company announced engineering work on the main line. Priya considered cancelling, but her friend suggested taking an earlier bus instead. They left home at six on Saturday and arrived just before ten. Their guesthouse was not ready, so they left their bags at reception and visited a local museum. The exhibition explained how the fishing town had changed over the last century. Later, the rain stopped and they walked along the harbour. Although they did not go swimming or sit on the beach, they discovered several independent cafés and tried a traditional fish pie. Priya said the weekend had been different from the one she had planned, but it was still enjoyable. She decided that unexpected changes sometimes lead to better experiences.`,qs:[
{q:'What changed before the trip?',opts:['The accommodation price','The weather and train arrangements','The number of travellers'],ans:1},{q:'What alternative did Priya’s friend suggest?',opts:['Hiring a car','Taking an earlier bus','Staying at home'],ans:1},{q:'Why did they visit the museum?',opts:['Their room was not ready','The harbour was closed','They missed lunch'],ans:0},{q:'What did the exhibition describe?',opts:['Local wildlife','The history of the fishing town','Modern train travel'],ans:1},{q:'Which statement is true?',opts:['They spent the day swimming','They cancelled the trip','They explored cafés and the harbour'],ans:2},{q:'What is the writer’s main message?',opts:['Plans should never change','Unexpected events can create positive experiences','Museums are better than beaches'],ans:1}]},
{l:'A2',title:'A practical guide to getting a better night’s sleep',kind:'Informative article · 185 words',text:`Many people find it difficult to sleep well, especially when they use phones or computers late at night. Experts often recommend creating a regular routine. Try to go to bed and wake up at roughly the same time every day, including weekends. It can also help to make your bedroom quiet, dark and comfortably cool. Avoid drinking large amounts of coffee in the evening because caffeine can stay in your body for several hours. If you exercise during the day, you may find it easier to relax at night. However, intense exercise immediately before bed can make some people feel more awake. If you cannot fall asleep, do not spend a long time checking the clock. Instead, get up briefly and do something calm, such as reading a paper book. These suggestions do not work in exactly the same way for everyone, but small changes can make a difference. If sleep problems continue, consider speaking to a health professional.`,qs:[
{q:'What is the article mainly about?',opts:['How to choose a phone','Ways to improve sleep habits','The history of coffee'],ans:1},{q:'What routine do experts recommend?',opts:['Different bedtimes every day','Regular sleeping and waking times','Sleeping late at weekends'],ans:1},{q:'Why should people avoid coffee late in the day?',opts:['It contains too much water','Caffeine can remain in the body','It makes the room warmer'],ans:1},{q:'What kind of exercise timing may make sleep harder?',opts:['Exercise during the morning','Intense exercise just before bed','A walk in the afternoon'],ans:1},{q:'What should someone do if they cannot sleep?',opts:['Keep checking the clock','Turn on a bright screen','Get up briefly and do a calm activity'],ans:2},{q:'What does “roughly” mean in this context?',opts:['Exactly','Approximately','Rarely'],ans:1}]},
{l:'B1',title:'Why local libraries are changing',kind:'Feature article · 230 words',text:`For many years, public libraries were mainly associated with borrowing books and finding a quiet place to study. Although these functions remain important, libraries in many towns are taking on a wider role. Some now provide language classes, digital skills workshops and support for people looking for work. Others lend equipment, host community meetings or offer activities for children and older residents.

This change reflects the way people use information. A growing amount of material is available online, but not everyone has reliable internet access or feels confident using digital services. Librarians can help visitors evaluate sources, complete online forms and develop basic technology skills. In this sense, the library is not becoming less relevant; it is responding to new needs.

However, these services require funding, trained staff and suitable spaces. When budgets are reduced, opening hours may become shorter and specialist support may disappear. Local authorities therefore need to consider libraries as more than buildings containing books. They can function as accessible learning centres where people meet, exchange ideas and receive practical assistance. Their future may depend on how well communities recognise and support this broader purpose.`,qs:[
{q:'What is the main idea?',opts:['Libraries are closing everywhere','Libraries are expanding their community role','Printed books are no longer useful'],ans:1},{q:'Why can online information create difficulties?',opts:['Everyone has equal access','Some people lack access or digital confidence','There is no information online'],ans:1},{q:'Which service is mentioned?',opts:['Car repairs','Digital skills workshops','Medical treatment'],ans:1},{q:'What may happen when budgets are cut?',opts:['Opening hours may be reduced','More staff are automatically hired','All services become free'],ans:0},{q:'What does “broader purpose” refer to?',opts:['Only storing books','Providing wider learning and community support','Selling computers'],ans:1},{q:'Which title best summarises the text?',opts:['The changing role of public libraries','Why people dislike reading','How to build a library'],ans:0}]},
{l:'B1',title:'The value of learning from mistakes',kind:'Opinion article · 220 words',text:`In classrooms and workplaces, mistakes are often treated as signs of failure. As a result, people may avoid difficult tasks or hide problems when they occur. Yet mistakes can provide useful information about what someone understands and what still needs attention. The key is not simply to make errors, but to examine them and decide what to do next.

For example, a language learner who repeatedly uses the wrong verb tense can keep a record of the sentences that cause difficulty. Instead of memorising a rule in isolation, the learner can compare examples, identify the pattern and practise using it in a short conversation. A team working on a project can do something similar by reviewing what went wrong after a deadline has been missed.

This approach requires an environment where people feel safe enough to ask questions and admit uncertainty. It also requires feedback that is specific and constructive. Telling someone that their work is poor rarely helps; explaining which part needs improvement and suggesting a practical next step is far more useful. Progress becomes more likely when reflection is followed by action.`,qs:[
{q:'What attitude to mistakes does the writer challenge?',opts:['They can provide information','They always indicate failure','They should be examined'],ans:1},{q:'What should a learner do with repeated errors?',opts:['Ignore them','Record and analyse them','Stop speaking'],ans:1},{q:'What is constructive feedback?',opts:['General criticism','Specific guidance and a next step','Praise without explanation'],ans:1},{q:'What kind of environment supports learning?',opts:['One where questions are discouraged','One where uncertainty can be admitted','One where errors are hidden'],ans:1},{q:'What does “in isolation” mean?',opts:['Without connection to context','With a partner','In a public place'],ans:0},{q:'What is the writer’s overall purpose?',opts:['To argue that mistakes can support improvement','To explain how to avoid all challenges','To compare schools and offices'],ans:0}]},
{l:'B2',title:'The hidden costs of convenience',kind:'Long-form article · 275 words',text:`Digital services have made everyday transactions remarkably convenient. Groceries can be delivered within hours, entertainment is available on demand and administrative tasks that once required a visit to an office can now be completed online. These developments save time, but convenience is not cost-free.

One cost is the loss of visibility. When a service is delivered through a few taps on a screen, users may pay less attention to the labour, energy and infrastructure involved. Delivery systems depend on warehouses, transport networks and workers whose conditions may vary considerably. Similarly, streaming platforms require energy-intensive data centres, even though the environmental impact is rarely visible to the customer.

There are also social consequences. If local shops lose customers to large platforms, neighbourhoods may become less varied and less economically resilient. On the other hand, digital services can improve access for people with limited mobility or those who live far from essential facilities. It would therefore be simplistic to argue that convenience is inherently harmful.

A more useful question is how its benefits and costs are distributed. Policymakers and businesses should make supply chains more transparent, protect workers and measure environmental impact. Consumers, meanwhile, can make more informed choices when reliable information is available. The aim should not be to reject convenience, but to ensure that efficiency does not depend on transferring hidden costs to other people or future generations.`,qs:[
{q:'What is the central argument?',opts:['Convenience should be rejected','Convenience brings benefits but can conceal wider costs','Digital services have no social impact'],ans:1},{q:'Why are some costs difficult for users to notice?',opts:['They happen outside the visible transaction','They are always included in the price','They do not exist'],ans:0},{q:'Which positive effect of digital services is acknowledged?',opts:['They eliminate all pollution','They can improve access for people with limited mobility','They guarantee local businesses more customers'],ans:1},{q:'What does the writer mean by “inherently harmful”?',opts:['Harmful by its very nature','Occasionally expensive','Difficult to measure'],ans:0},{q:'What should policymakers and businesses do?',opts:['Hide supply-chain information','Improve transparency and worker protection','Stop measuring environmental impact'],ans:1},{q:'Which statement best reflects the writer’s stance?',opts:['Balanced and qualified','Completely opposed','Uncritically enthusiastic'],ans:0}]},
{l:'B2',title:'Rethinking assessment in higher education',kind:'Discussion essay · 265 words',text:`Traditional examinations remain a familiar way of assessing learning, partly because they allow institutions to compare performance under controlled conditions. Nevertheless, a single timed test may provide only a narrow picture of what a student can do. It can reward rapid recall while giving limited attention to collaboration, research, sustained problem-solving or the ability to communicate ideas to different audiences.

Alternative forms of assessment, such as portfolios, presentations and project work, can capture a broader range of abilities. They may also encourage students to reflect on how their work develops over time. However, these methods are not automatically fairer. Group projects can conceal unequal contributions, while portfolios may demand substantial time and support outside the classroom. Assessors also need clear criteria if judgements are to remain consistent.

The debate should therefore move beyond the assumption that one method must replace another. A balanced system could combine short tests of core knowledge with authentic tasks that require students to apply what they have learned. The weighting of each component should reflect the aims of the course. If the goal is to develop independent thinkers, assessment needs to measure more than the ability to reproduce information under pressure.`,qs:[
{q:'What limitation of timed examinations is identified?',opts:['They are impossible to organise','They may provide a narrow picture of ability','They always assess collaboration'],ans:1},{q:'What can portfolios and projects capture?',opts:['A broader range of abilities','Only speed of recall','Attendance alone'],ans:0},{q:'Why are alternative methods not automatically fairer?',opts:['They require no criteria','They can involve unequal contributions or unequal support','They never take time'],ans:1},{q:'What solution does the writer favour?',opts:['Replacing every exam with group work','Using a balanced combination of methods','Assessing only memorisation'],ans:1},{q:'What does “authentic tasks” mean?',opts:['Tasks that resemble meaningful real-world applications','Tasks with no clear purpose','Tasks completed without feedback'],ans:0},{q:'What is the writer’s tone?',opts:['Measured and analytical','Angry and dismissive','Humorous and informal'],ans:0}]},
{l:'C1',title:'When expertise meets public uncertainty',kind:'Critical analysis · 300 words',text:`Public debate increasingly requires specialists to communicate complex evidence to audiences who may have little time, limited background knowledge or deeply held prior beliefs. The challenge is not merely to simplify technical language. It is to explain what the evidence can establish, what remains uncertain and why reasonable experts may disagree.

There is a temptation to present conclusions with absolute confidence in order to appear authoritative. Yet this strategy can undermine credibility when subsequent findings require revision. In fields such as climate science, medicine and economics, knowledge develops through the accumulation and reassessment of evidence. Acknowledging uncertainty is therefore not equivalent to admitting ignorance; it can demonstrate intellectual discipline.

The opposite danger is to overemphasise uncertainty until the audience assumes that nothing useful is known. This false balance may allow weak claims to appear as credible as conclusions supported by extensive research. Effective communication must distinguish between uncertainty about details and uncertainty about the overall direction of the evidence.

Institutions can help by explaining how conclusions were reached, disclosing limitations and correcting errors openly. Communicators should also consider the values and concerns that shape public responses. Evidence does not speak in a social vacuum: trust depends partly on whether people believe that institutions are listening and acting in good faith. The aim is not to eliminate disagreement, but to make disagreement better informed.`,qs:[
{q:'What is the communication challenge described?',opts:['Removing all technical detail','Explaining evidence, limits and legitimate disagreement','Ensuring every audience agrees'],ans:1},{q:'Why can absolute confidence undermine credibility?',opts:['Later evidence may require conclusions to be revised','It makes communication shorter','It prevents further research'],ans:0},{q:'What is the danger of overstating uncertainty?',opts:['It may create a false equivalence between strong and weak claims','It guarantees public trust','It makes evidence easier to understand'],ans:0},{q:'What does “intellectual discipline” imply here?',opts:['Refusing to change one’s mind','Being precise about what is and is not known','Avoiding complex topics'],ans:1},{q:'According to the text, trust also depends on…',opts:['Whether institutions listen and act in good faith','Whether all findings are simple','Whether disagreement disappears'],ans:0},{q:'Which best describes the author’s approach?',opts:['Nuanced and evidence-conscious','Certain that experts are always right','Dismissive of public concerns'],ans:0}]},
{l:'C1',title:'The ethics of preserving endangered languages',kind:'Academic feature · 305 words',text:`Efforts to preserve endangered languages are often framed as an uncomplicated cultural good. Linguistic diversity carries historical knowledge, distinctive ways of categorising experience and forms of artistic expression that cannot always be translated without loss. When a language ceases to be used, communities may lose more than a means of communication; they may also lose access to particular archives of memory and identity.

Nevertheless, preservation initiatives raise difficult ethical questions. Who decides which varieties should be documented, taught or standardised? External researchers may possess technical resources, but community members have the strongest claim to determine how their language is represented and transmitted. A project that records vocabulary without supporting everyday use may produce an archive while leaving the conditions of language shift unchanged.

There is also a risk of romanticising multilingualism while overlooking the practical pressures faced by speakers. Families may choose a dominant language because it offers educational or economic opportunities, not because they lack pride in their heritage. Policies that treat such decisions as individual failures misunderstand the structural inequalities involved.

A sustainable approach therefore requires more than dictionaries and recordings. It may involve bilingual education, teacher training, locally controlled media and opportunities for younger speakers to use the language in contemporary settings. Above all, preservation should be collaborative rather than imposed. The objective is not to freeze a language in an imagined traditional form, but to support communities in deciding how it can remain meaningful as their circumstances evolve.`,qs:[
{q:'What may be lost when a language stops being used?',opts:['Only a set of grammar rules','Historical knowledge and forms of identity','All possibilities for translation'],ans:1},{q:'What ethical issue is raised about research?',opts:['Who controls documentation and representation','Whether dictionaries are too short','Whether all languages should be standardised'],ans:0},{q:'Why might families shift to a dominant language?',opts:['They necessarily reject their heritage','They may seek educational or economic opportunities','They have no access to schools'],ans:1},{q:'What is criticised in the passage?',opts:['Community-led initiatives','Preservation that records words but ignores everyday use','Bilingual education'],ans:1},{q:'What does “romanticising” imply?',opts:['Viewing something in an idealised way','Examining it scientifically','Rejecting it completely'],ans:0},{q:'What is the author’s final recommendation?',opts:['Freeze languages in traditional forms','Make preservation collaborative and community-led','Focus only on recordings'],ans:1}]}
];
readings.push(...epUltimateReadings);

const epUltimateListening = [
{l:'A1',title:'At the café',kind:'Dialogue · ordering food',text:`Server: Hello. Are you ready to order? Customer: Yes, please. Can I have a cheese sandwich and a cup of tea? Server: Of course. Would you like milk in your tea? Customer: Yes, a little, please. Server: Anything else? Customer: No, thank you. How much is it? Server: That is seven pounds fifty. Customer: Here you are. Server: Thank you. Your order will be ready in five minutes.`,qs:[
{q:'What does the customer order?',opts:['A chicken salad and coffee','A cheese sandwich and tea','Soup and orange juice'],ans:1},{q:'How does the customer want the tea?',opts:['With a little milk','Without milk','With lemon'],ans:0},{q:'How much does the order cost?',opts:['£5.70','£7.15','£7.50'],ans:2},{q:'How long will the order take?',opts:['Five minutes','Ten minutes','Fifteen minutes'],ans:0},{q:'Where does the conversation take place?',opts:['At a café','At a station','At a supermarket'],ans:0}],gaps:[['The customer orders a cheese ________.','sandwich'],['The customer wants a little ________ in the tea.','milk'],['The order costs seven pounds ________.','fifty']]},
{l:'A1',title:'Finding the right bus stop',kind:'Dialogue · asking for directions',text:`Man: Excuse me. Does the number twelve bus go to the museum? Woman: No, you need the number eight. The bus stop is opposite the bank, next to the post office. Man: Is it far from here? Woman: Not really. Go straight ahead for two minutes and turn left at the traffic lights. You will see the bank on your right. Man: Thank you. How often does the bus come? Woman: Every twenty minutes. Man: Great. Thanks for your help.`,qs:[
{q:'Which bus goes to the museum?',opts:['Number eight','Number twelve','Number twenty'],ans:0},{q:'Where is the bus stop?',opts:['Behind the bank','Opposite the bank','Inside the post office'],ans:1},{q:'Where should the man turn?',opts:['Right at the traffic lights','Left at the traffic lights','Left at the museum'],ans:1},{q:'How often does the bus come?',opts:['Every ten minutes','Every fifteen minutes','Every twenty minutes'],ans:2},{q:'What is the woman doing?',opts:['Giving directions','Selling a ticket','Asking for money'],ans:0}],gaps:[['The man needs the number ________ bus.','eight'],['The stop is next to the ________ office.','post'],['The bus comes every ________ minutes.','twenty']]},
{l:'A2',title:'A change to the sports centre timetable',kind:'Public announcement',text:`Good evening, everyone. This is an announcement for members of the Riverside Sports Centre. Please note that the swimming pool will close at six thirty this Friday because maintenance work is taking place. The fitness room will remain open until the usual time of nine o’clock. Saturday morning classes will start thirty minutes later than normal. The yoga class will begin at ten, and the beginners’ fitness class will begin at eleven fifteen. We apologise for any inconvenience. Updated timetables are available at reception and on our website.`,qs:[
{q:'Why will the swimming pool close early?',opts:['A competition is taking place','Maintenance work is taking place','There are no staff'],ans:1},{q:'What time will the pool close?',opts:['6.00','6.30','7.00'],ans:1},{q:'Until what time will the fitness room remain open?',opts:['8.00','8.30','9.00'],ans:2},{q:'What time will the yoga class begin?',opts:['9.30','10.00','10.30'],ans:1},{q:'Where can members find the updated timetable?',opts:['Only by email','At reception and on the website','At the swimming pool'],ans:1}],gaps:[['The pool closes early on ________.','Friday'],['The fitness room stays open until ________ o’clock.','nine'],['The beginners’ class starts at eleven ________.','fifteen']]},
{l:'A2',title:'Leaving a message about a lost bag',kind:'Telephone message',text:`Hello, this is Mark Lewis calling about a bag I left on the number twenty-four bus this morning. It is a dark blue backpack with a small red label on the front. There is a notebook, a pair of glasses and a grey jumper inside. I got off the bus at King Street at about eight forty-five. Could you please call me back on 07700 123456 after two o’clock? I will be in a meeting before then. Thank you very much.`,qs:[
{q:'Where did Mark leave his bag?',opts:['On a train','On a bus','In a café'],ans:1},{q:'What colour is the backpack?',opts:['Dark blue','Black','Grey'],ans:0},{q:'What is on the front of the bag?',opts:['A white number','A red label','A green picture'],ans:1},{q:'Where did Mark get off?',opts:['Queen Road','King Street','Market Square'],ans:1},{q:'When should the person call him?',opts:['Before noon','At one o’clock','After two o’clock'],ans:2}],gaps:[['The bag is a dark blue ________.','backpack'],['Mark got off at King Street at about eight ________.','forty-five'],['He will be in a ________ before two o’clock.','meeting']]},
{l:'B1',title:'A community garden needs volunteers',kind:'Radio interview',text:`Presenter: The community garden has become popular since it opened last spring. What happens there? Organiser: We grow vegetables, but the project is also about bringing neighbours together. Some volunteers have gardening experience; others are complete beginners. We provide tools and short training sessions. Presenter: What do you need at the moment? Organiser: We especially need help on Wednesday afternoons because that is when local school groups visit. We also need someone to update our social media page. Presenter: Is there a cost? Organiser: No. Volunteering is free, and we can provide gloves. People should simply wear comfortable clothes and register online before their first visit.`,qs:[
{q:'What is the project about besides growing vegetables?',opts:['Bringing neighbours together','Selling gardening equipment','Building a sports centre'],ans:0},{q:'What support is provided to beginners?',opts:['Free meals','Tools and short training sessions','A professional qualification'],ans:1},{q:'When is help especially needed?',opts:['Monday mornings','Wednesday afternoons','Friday evenings'],ans:1},{q:'What additional task needs support?',opts:['Updating social media','Repairing a bus','Cooking lunch'],ans:0},{q:'What should new volunteers do before visiting?',opts:['Pay a fee','Bring their own tools','Register online'],ans:2},{q:'Which statement is correct?',opts:['Only experienced gardeners can join','Volunteering is free','Gloves are not available'],ans:1}],gaps:[['The garden opened last ________.','spring'],['School groups visit on Wednesday ________.','afternoons'],['New volunteers should register ________.','online']]},
{l:'B1',title:'Why people are choosing to repair things',kind:'Podcast · lifestyle',text:`Host: More people seem interested in repairing household items rather than replacing them. Why is that? Guest: There are several reasons. The cost of living has encouraged people to make products last longer, but environmental concerns are important too. Repairing a phone or a small appliance can prevent useful materials from becoming waste. Host: Is it always easy? Guest: Not necessarily. Some products are difficult to open, and replacement parts can be expensive or unavailable. That is why repair cafés and community workshops are useful. People can learn basic skills and share tools. Host: So it is about more than saving money? Guest: Exactly. It can build confidence and create social connections.`,qs:[
{q:'What has encouraged people to repair items?',opts:['Lower product prices','The cost of living and environmental concerns','A lack of household products'],ans:1},{q:'What environmental benefit is mentioned?',opts:['Reducing useful materials becoming waste','Increasing packaging','Using more electricity'],ans:0},{q:'What can make repair difficult?',opts:['Products are always too small','Parts may be expensive or unavailable','People have too much free time'],ans:1},{q:'What do repair cafés offer?',opts:['Only new products','A place to learn skills and share tools','Professional delivery services'],ans:1},{q:'What wider benefit does the guest identify?',opts:['Confidence and social connections','Higher electricity bills','More advertising'],ans:0},{q:'What is the guest’s overall attitude?',opts:['Positive but realistic','Completely negative','Indifferent'],ans:0}],gaps:[['Repairing can prevent materials becoming ________.','waste'],['Community workshops allow people to share ________.','tools'],['The guest says repair can build ________.','confidence']]},
{l:'B2',title:'Interview: should cities restrict private cars?',kind:'Radio debate',text:`Interviewer: Several cities are considering restrictions on private cars in central areas. Is this a practical policy? Transport researcher: It can be, provided that alternatives are reliable and accessible. Restricting cars without improving public transport would place an unfair burden on people who have no realistic alternative. However, where frequent buses, safe cycling routes and accessible pedestrian areas are available, reducing traffic can improve air quality and make streets more pleasant. Interviewer: What about local businesses? Researcher: The impact varies. Some retailers fear losing customers, while others benefit from increased foot traffic. Authorities should consult businesses, monitor the results and adjust delivery arrangements. The policy should be evaluated over time rather than judged by its first few weeks.`,qs:[
{q:'What condition does the researcher attach to car restrictions?',opts:['Public transport must be reliable and accessible','All shops must close','Cycling should be prohibited'],ans:0},{q:'Who might be unfairly affected?',opts:['People with no realistic travel alternative','Only tourists','People who work from home'],ans:0},{q:'What potential benefit is mentioned?',opts:['More traffic noise','Improved air quality and streets','Higher fuel consumption'],ans:1},{q:'How might local businesses be affected?',opts:['In exactly the same way','Some may lose customers while others gain foot traffic','All will close'],ans:1},{q:'What should authorities do?',opts:['Avoid consultation','Monitor outcomes and adjust arrangements','Decide after one day'],ans:1},{q:'What does “evaluated over time” suggest?',opts:['Judged using evidence collected over a period','Accepted without review','Cancelled immediately'],ans:0}],gaps:[['Alternatives must be reliable and ________.','accessible'],['The researcher mentions safe ________ routes.','cycling'],['The policy should be evaluated over ________.','time']]},
{l:'B2',title:'A briefing on workplace automation',kind:'Professional briefing',text:`Automation is often discussed as though it will either eliminate jobs on a massive scale or make work universally easier. In practice, its effects are more uneven. Repetitive tasks may be reduced, while demand grows for people who can interpret data, maintain systems and make decisions in situations that require judgement. The transition can nevertheless be disruptive, particularly for workers whose roles change faster than training opportunities become available. Employers should therefore treat reskilling as part of implementation, not as an optional benefit to be considered later. Employees also need clear information about how automated tools are used and how their performance is assessed. Ultimately, productivity gains are unlikely to be sustainable if the people affected are excluded from the process.`,qs:[
{q:'What does the speaker say about automation?',opts:['Its effects are uneven','It always eliminates every job','It has no effect on work'],ans:0},{q:'Which skills may become more important?',opts:['Interpreting data and exercising judgement','Repeating identical tasks','Avoiding technology'],ans:0},{q:'Why can the transition be disruptive?',opts:['Training may not keep pace with role changes','All workers receive immediate promotions','Systems never change'],ans:0},{q:'When should reskilling be considered?',opts:['Only after problems occur','As part of implementation','Only for senior managers'],ans:1},{q:'What information should employees receive?',opts:['How tools are used and performance assessed','Only company advertising','No information'],ans:0},{q:'What is needed for sustainable productivity gains?',opts:['Excluding affected workers','Involving the people affected','Removing all training'],ans:1}],gaps:[['Demand may grow for people who can interpret ________.','data'],['Employers should treat reskilling as part of ________.','implementation'],['Productivity gains may not be sustainable if workers are ________.','excluded']]},
{l:'C1',title:'Lecture: the limits of measuring wellbeing',kind:'Academic lecture',text:`Governments increasingly rely on indicators to assess national wellbeing, ranging from income and employment to reported life satisfaction. Such measures can illuminate patterns that economic output alone would miss. Yet the apparent precision of a composite index should not obscure the choices involved in constructing it. Decisions about which dimensions to include, how to weight them and whose experiences count are inevitably normative.

A further difficulty concerns comparability. Survey responses may be shaped by cultural expectations, changing reference points or reluctance to express dissatisfaction. An increase in reported satisfaction does not necessarily mean that material conditions have improved; it may reflect adaptation to circumstances. Conversely, a community experiencing disruption may report lower satisfaction even where long-term opportunities are expanding.

This does not make measurement futile. It means that indicators should be interpreted alongside qualitative evidence and made transparent enough to invite scrutiny. Rather than searching for a single definitive score, policymakers should use a range of measures to identify trade-offs, distributional effects and areas requiring further investigation.`,qs:[
{q:'What can wellbeing indicators reveal?',opts:['Patterns overlooked by economic output alone','Only national income','Exact individual motives'],ans:0},{q:'Why are choices in a composite index normative?',opts:['They involve judgements about what matters and whose experience counts','They are entirely automatic','They require no interpretation'],ans:0},{q:'What may influence survey responses?',opts:['Cultural expectations and reference points','Only weather conditions','The number of indicators'],ans:0},{q:'What does adaptation to circumstances complicate?',opts:['The interpretation of reported satisfaction','The collection of income data only','The definition of employment'],ans:0},{q:'What approach does the lecturer recommend?',opts:['One definitive score','A range of transparent measures and qualitative evidence','Avoiding all measurement'],ans:1},{q:'What is the lecture’s central qualification?',opts:['Measurement is useful but must be interpreted critically','Wellbeing cannot be studied','Economic output explains everything'],ans:0}],gaps:[['A composite index involves choices about which dimensions to ________.','include'],['Survey responses may be shaped by cultural ________.','expectations'],['Indicators should be interpreted alongside ________ evidence.','qualitative']]},
{l:'C1',title:'Panel discussion: who owns cultural knowledge?',kind:'Panel discussion',text:`Moderator: Museums and universities increasingly collaborate with communities to document cultural knowledge. What principles should guide these projects? Curator: Consent must be ongoing, not treated as a form signed at the beginning. Communities should be able to decide what can be recorded, who may access it and whether certain material should remain restricted. Researcher: I agree, although institutions also have obligations to preserve records and make scholarship available. The difficulty is that openness is not always ethically neutral. Some knowledge is context-dependent, and separating it from the people who sustain it can distort its meaning. Community representative: Partnership must therefore involve shared authority, not simply consultation. We need a say in budgets, interpretation and future use. Moderator: So the question is not only how knowledge is stored, but who retains the power to shape its circulation.`,qs:[
{q:'What does the curator mean by ongoing consent?',opts:['Permission should be revisited throughout the project','One signature is sufficient forever','Consent is unnecessary'],ans:0},{q:'What tension does the researcher identify?',opts:['Preservation and access may conflict with ethical restrictions','Museums have no records','Communities oppose all research'],ans:0},{q:'Why can separating knowledge from its community be problematic?',opts:['It can distort its meaning','It always improves accuracy','It makes storage impossible'],ans:0},{q:'What does the community representative demand?',opts:['Shared authority over budgets, interpretation and use','Only a public thank-you','No involvement after recording'],ans:0},{q:'What is the moderator’s final reframing?',opts:['The issue concerns power over circulation, not just storage','The issue is solely technical','The issue has already been resolved'],ans:0},{q:'Which principle is most strongly supported?',opts:['Meaningful community governance','Unlimited institutional access','One-way consultation'],ans:0}],gaps:[['Consent must be ________, not merely signed once.','ongoing'],['Some knowledge is ________-dependent.','context'],['Partnership should involve shared ________.','authority']]}
];
listening.push(...epUltimateListening);
// Give every listening passage a note-completion exercise, including earlier activities.
const epGapStopWords=new Set(['about','after','again','also','because','before','being','could','does','from','have','into','just','more','most','much','only','other','over','some','such','than','that','their','there','these','they','this','very','what','when','where','which','will','with','would','your']);
function epBuildGaps(text){
 const sentences=String(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[String(text)];const out=[];const used=new Set();
 for(const sentence of sentences){
  const candidates=[...sentence.matchAll(/\b[A-Za-z][A-Za-z'-]{3,}\b/g)].map(m=>m[0]).filter(w=>!epGapStopWords.has(w.toLowerCase())&&!used.has(w.toLowerCase()));
  if(!candidates.length)continue;const word=candidates[Math.min(1,candidates.length-1)];used.add(word.toLowerCase());out.push([sentence.trim().replace(new RegExp('\\b'+word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b'),'________'),word]);
  if(out.length===3)break;
 }
 return out;
}
listening.forEach(item=>{if(!item.gaps||item.gaps.length<3){const generated=epBuildGaps(item.text);item.gaps=[...(item.gaps||[]),...generated].slice(0,3);}});

// Extend each audio activity with additional listening-specific tasks.
function epUltimateListeningPage(){
 const items=listening.filter(x=>x.l===currentLevel);
 return `${epHead('LISTENING LAB',`${currentLevel} · Listen actively`,'Build listening skills through prediction, gist, detail, inference, note completion and transcript analysis.')} ${epLevelTabs()}${epLevelCount(items)}
 <div class="ep-grid">${items.map(a=>`<article class="ep-card"><span class="ep-pill">${epEsc(a.l)} · ${epEsc(a.kind)}</span><h3>${epEsc(a.title)}</h3><p>${a.text.split(/\s+/).length} words · ${(a.qs||[]).length} comprehension questions${a.gaps?` · ${a.gaps.length} note-completion items`:''}</p><p class="ep-small">Listen for the situation first, then identify key details, reasons and speaker attitude.</p><div class="ep-actions"><button class="ep-btn" onclick="epListen(${listening.indexOf(a)})">Start activity →</button></div></article>`).join('')}</div>
 <div class="ep-panel"><h3>How to approach a listening task</h3><ol><li><b>Predict:</b> use the title and situation to anticipate vocabulary.</li><li><b>First listen:</b> identify who is speaking, why and where.</li><li><b>Second listen:</b> focus on details, numbers, reasons and opinions.</li><li><b>Check:</b> complete the questions before revealing the transcript.</li><li><b>Review:</b> listen again and notice connected speech and key phrases.</li></ol></div>`;
}
function epUltimateListen(i){
 const a=listening[i];if(!a)return;epStopSpeech();
 let html=`<div class="ep-kicker">${epEsc(a.l)} · ${epEsc(a.kind)} · ${a.text.split(/\s+/).length} words</div><h2>${epEsc(a.title)}</h2>
 <div class="ep-panel"><h3>1 · Before you listen</h3><p>Look at the title. What words or information do you expect to hear?</p><textarea class="ep-textarea" id="epListenPredict" placeholder="I expect to hear about…"></textarea><div class="ep-small">Do not open the transcript yet. Try to listen without reading.</div></div>
 <div class="ep-panel ep-audio-panel"><div class="ep-row"><b>2 · Audio player</b><span class="ep-pill">SYNTHETIC ENGLISH VOICE</span></div><p class="ep-small">This player uses your browser’s built-in speech engine. Select an English voice if one is available on your device.</p>
 <div class="ep-audio-controls"><button class="ep-btn" id="epPlayBtn" onclick="epSpeakByIndex(${i})">▶ Play audio</button><button class="ep-btn secondary" onclick="epPauseSpeech()">⏸ Pause / resume</button><button class="ep-btn outline" onclick="epStopSpeech()">■ Stop</button><button class="ep-btn outline" onclick="epAudioTest()">Test voice</button></div>
 <div class="ep-audio-settings"><label>Speed<select class="ep-select" id="epRate" onchange="epSpeechRate=Number(this.value)"><option value="0.75">0.75×</option><option value="0.9">0.9×</option><option value="1" selected>1.0×</option><option value="1.1">1.1×</option><option value="1.25">1.25×</option></select></label><label>Voice<select class="ep-select" id="epVoiceSelect"><option value="">Automatic English voice</option>${(window.speechSynthesis?window.speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang)):[]).map(v=>`<option value="${epEsc(v.name)}">${epEsc(v.name)} (${epEsc(v.lang)})</option>`).join('')}</select></label></div><div class="ep-audio-controls"><button class="ep-btn outline" type="button" onclick="epRefreshVoices()">↻ Refresh available voices</button></div><p class="ep-audio-status" id="epAudioStatus" role="status" aria-live="polite">Ready. Press Play audio. If no sound is heard, use Test voice and check the device volume.</p></div>
 <div class="ep-panel"><h3>3 · First listening: gist</h3><p>What is the main purpose of this recording?</p><div class="ep-question" data-listen-gist>${['To give information or explain a situation','To tell an unrelated personal story','To advertise a product'].map((o,k)=>`<button class="ep-option" onclick="epListenAnswer(this,${k},${a.gistAns??0},0)">${o}</button>`).join('')}<div class="ep-answer-feedback"></div></div></div>
 <div class="ep-panel"><h3>4 · Second listening: comprehension</h3><p class="ep-small">Choose the best answer. You can replay the audio before submitting.</p>`;
 (a.qs||[]).forEach((q,j)=>{html+=`<div class="ep-question" data-listen-q="${j}"><b>${j+1}. ${epEsc(q.q)}</b>${q.opts.map((o,k)=>`<button class="ep-option" onclick="epListenAnswer(this,${k},${q.ans},${j+1})">${epEsc(o)}</button>`).join('')}<div class="ep-answer-feedback"></div></div>`});
 html+=`<button class="ep-btn" onclick="epSubmitUltimateListening(${i})">Check answers</button><div id="epListenScore" class="ep-feedback" hidden></div></div>`;
 if(a.gaps?.length){html+=`<div class="ep-panel"><h3>5 · Note completion</h3><p>Listen again and complete the missing words. Use one or two words for each gap.</p>${a.gaps.map((g,j)=>`<label class="ep-gap-label">${j+1}. ${epEsc(g[0])}<input class="ep-input" id="epGap${j}" autocomplete="off" placeholder="Your answer"></label>`).join('')}<button class="ep-btn secondary" onclick="epCheckGaps(${i})">Check note completion</button><div id="epGapFeedback" class="ep-feedback" hidden></div></div>`;}
 html+=`<div class="ep-panel"><div class="ep-row"><h3>6 · Transcript and language focus</h3><button class="ep-btn secondary" onclick="epToggleTranscript()">Show transcript</button></div><div id="epTranscript" class="ep-transcript" hidden>${epEsc(a.text)}</div><p class="ep-small">After checking your answers, reveal the transcript. Identify three useful phrases and listen again while following the text.</p><textarea class="ep-textarea" id="epListenPhrases" placeholder="Useful phrase 1…\\nUseful phrase 2…\\nUseful phrase 3…"></textarea></div>
 <div class="ep-panel"><h3>7 · Reflection</h3><p>What was difficult: the speed, vocabulary, connected speech, numbers or the speaker’s accent?</p><textarea class="ep-textarea" id="epListenReflection" placeholder="I found … difficult because …"></textarea><button class="ep-btn" onclick="epMark('listening-${i}',100);alert('Listening activity marked as practised.')">Mark activity practised</button></div>`;
 showModal('LISTENING LAB',a.title,html);epSpeechRate=1;epRefreshVoices();if(window.speechSynthesis)window.speechSynthesis.onvoiceschanged=epRefreshVoices;
}
function epRefreshVoices(){
 const select=document.getElementById('epVoiceSelect');if(!select||!window.speechSynthesis)return;
 const current=select.value;const voices=window.speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));
 select.innerHTML='<option value="">Automatic English voice</option>'+voices.map(v=>`<option value="${epEsc(v.name)}">${epEsc(v.name)} (${epEsc(v.lang)})</option>`).join('');
 if(current&&voices.some(v=>v.name===current))select.value=current;
 if(!voices.length){const status=document.getElementById('epAudioStatus');if(status)status.textContent='No English voice is currently listed. The browser may still use its default voice; check Windows language and speech settings if playback fails.';}
}
function epAudioTest(){epSpeak('Hello. This is an English audio test. If you can hear this sentence, your browser speech playback is working.',1,'epAudioStatus','epPlayBtn');}
function epSubmitUltimateListening(i){const a=listening[i],rows=[...document.querySelectorAll('[data-listen-gist],[data-listen-q]')];let correct=0,answered=0;rows.forEach((r)=>{answered++;if(r.dataset.correct==='true')correct++;const f=r.querySelector('.ep-answer-feedback');if(f){const qi=r.hasAttribute('data-listen-q')?Number(r.dataset.listenQ):-1;const answer=qi>=0?a.qs[qi]?.opts[a.qs[qi]?.ans]:'The best overall purpose is to understand the situation and its main message.';f.textContent=(r.dataset.correct==='true'?'✓ Correct. ':'✗ Review. ')+(qi>=0&&answer?`Correct answer: ${answer}`:answer);}});const pct=answered?Math.round(correct/answered*100):0;const el=document.getElementById('epListenScore');if(el){el.hidden=false;el.textContent=`Result: ${correct}/${answered} (${pct}%). ${pct>=75?'Good listening. Review the transcript for further learning.':'Replay the audio, focus on key information and try again.'}`;}scores[`listening-${i}`]=pct;if(pct>=70&&!done.includes(`listening-${i}`))done.push(`listening-${i}`);epSave();}
function epCheckGaps(i){const a=listening[i];let good=0;const norm=s=>String(s).toLowerCase().trim().replace(/[.,!?]/g,'').replace(/\s+/g,' ');a.gaps.forEach((g,j)=>{const el=document.getElementById(`epGap${j}`);if(el&&norm(el.value)===norm(g[1]))good++;});const f=document.getElementById('epGapFeedback');if(f){f.hidden=false;f.textContent=`You completed ${good} of ${a.gaps.length} gaps correctly. Answers: ${a.gaps.map(g=>g[1]).join(' · ')}`;}}
function epListenAnswer(btn,k,ans,j){const row=btn.closest('.ep-question');if(!row||row.dataset.answered==='1')return;row.dataset.answered='1';row.dataset.correct=String(Number(k)===Number(ans));row.dataset.selected=String(k);row.querySelectorAll('.ep-option').forEach(b=>b.disabled=true);btn.classList.add('chosen');const f=row.querySelector('.ep-answer-feedback');if(f)f.textContent=Number(k)===Number(ans)?'Selected. Check your score after finishing.':'Selected. Check your score after finishing.';}
function epSpeakByIndex(i){const item=listening[i];if(item)epSpeak(item.text,Number(document.getElementById('epRate')?.value||epSpeechRate),'epAudioStatus','epPlayBtn');}
function epUltimateReading(){const items=readings.filter(x=>x.l===currentLevel);return `${epHead('READING CENTRE',`${currentLevel} · Read critically`,'Work with complete graded texts and practise gist, detail, inference, vocabulary in context, writer purpose and response.')} ${epLevelTabs()}${epLevelCount(items)}<div class="ep-grid">${items.map(a=>`<article class="ep-card"><span class="ep-pill">${epEsc(a.l)} · ${epEsc(a.kind||'READING')}</span><h3>${epEsc(a.title)}</h3><p>${a.text.split(/\s+/).length} words · ${(a.qs||[]).length} comprehension questions</p><p class="ep-small">${epEsc(a.text.slice(0,145))}…</p><div class="ep-actions"><button class="ep-btn" onclick="epRead(${readings.indexOf(a)})">Open reading →</button></div></article>`).join('')}</div><div class="ep-panel"><h3>Reading toolkit</h3><ul><li><b>Skimming:</b> identify the topic and overall argument quickly.</li><li><b>Scanning:</b> locate names, dates, figures and supporting details.</li><li><b>Inference:</b> distinguish what the writer states from what the reader can reasonably conclude.</li><li><b>Lexical inference:</b> use definition, contrast, example and word formation clues.</li><li><b>Writer’s stance:</b> notice evaluative language, hedging and contrast markers.</li></ul></div>`;}
function epUltimateRead(i){const a=readings[i];if(!a)return;let html=`<div class="ep-kicker">${epEsc(a.l)} · ${epEsc(a.kind||'READING')} · ${a.text.split(/\s+/).length} words</div><h2>${epEsc(a.title)}</h2><div class="ep-panel ep-reading-text"><p>${epEsc(a.text).replace(/\n\n/g,'</p><p>')}</p></div><div class="ep-panel"><h3>1 · Gist and purpose</h3><p>Choose the best summary of the text.</p><div class="ep-question" data-read-gist>${['The text presents information and develops its central point.','The text is an unrelated personal message.','The text is a set of instructions with no explanation.'].map((o,k)=>`<button class="ep-option" onclick="epReadAnswer(this,${k},0,0)">${o}</button>`).join('')}<div class="ep-answer-feedback"></div></div></div><div class="ep-panel"><h3>2 · Detailed comprehension</h3>`;
 (a.qs||[]).forEach((q,j)=>{html+=`<div class="ep-question" data-read-q="${j}"><b>${j+1}. ${epEsc(q.q)}</b>${q.opts.map((o,k)=>`<button class="ep-option" onclick="epReadAnswer(this,${k},${q.ans},${j+1})">${epEsc(o)}</button>`).join('')}<div class="ep-answer-feedback"></div></div>`});
 html+=`<button class="ep-btn" onclick="epSubmitUltimateReading(${i})">Check comprehension</button><div id="epReadScore" class="ep-feedback" hidden></div></div><div class="ep-panel"><h3>3 · Vocabulary in context</h3><p>Choose a word or phrase from the text. Explain its meaning using the surrounding context and identify the clue.</p><textarea class="ep-textarea" placeholder="Word / phrase: …\\nMeaning in this text: …\\nContext clue: …"></textarea><h3>4 · Summarise</h3><p>Write a two- or three-sentence summary. Include the central idea and the most important supporting point.</p><textarea class="ep-textarea" placeholder="The text mainly discusses…\\nIt argues / explains that…"></textarea><h3>5 · Respond critically</h3><p>Do you agree with the writer’s main point? Support your view with one reason or example.</p><textarea class="ep-textarea" placeholder="I agree / disagree to some extent because…"></textarea><button class="ep-btn" onclick="epMark('reading-${i}',100);alert('Reading activity marked as practised.')">Mark reading practised</button></div>`;
 showModal('READING CENTRE',a.title,html);}
function epReadAnswer(btn,k,ans,j){const row=btn.closest('.ep-question');if(!row||row.dataset.answered==='1')return;row.dataset.answered='1';row.dataset.correct=String(Number(k)===Number(ans));row.dataset.selected=String(k);row.querySelectorAll('.ep-option').forEach(b=>b.disabled=true);btn.classList.add('chosen');const f=row.querySelector('.ep-answer-feedback');if(f)f.textContent='Answer selected. Submit the activity to see your result.';}
function epSubmitUltimateReading(i){const a=readings[i],rows=[...document.querySelectorAll('[data-read-gist],[data-read-q]')];let correct=0;rows.forEach(r=>{if(r.dataset.correct==='true')correct++;const f=r.querySelector('.ep-answer-feedback');if(f){const qi=r.hasAttribute('data-read-q')?Number(r.dataset.readQ):-1;const answer=qi>=0?a.qs[qi]?.opts[a.qs[qi]?.ans]:'The best summary identifies the text’s central point.';f.textContent=(r.dataset.correct==='true'?'✓ Correct. ':'✗ Review. ')+(qi>=0&&answer?`Correct answer: ${answer}`:answer);}});const pct=rows.length?Math.round(correct/rows.length*100):0;const el=document.getElementById('epReadScore');if(el){el.hidden=false;el.textContent=`Result: ${correct}/${rows.length} (${pct}%). ${pct>=75?'Strong comprehension.':'Return to the relevant paragraph and review the evidence.'}`;}scores[`reading-${i}`]=pct;if(pct>=70&&!done.includes(`reading-${i}`))done.push(`reading-${i}`);epSave();}
function epUltimateVocab(){const items=vocab.filter(x=>x.l===currentLevel);return `${epHead('VOCABULARY BUILDER',`${currentLevel} · Lexical range`,'Build a wider, more precise vocabulary through topic sets, collocations, word families, examples and active recall.')} ${epLevelTabs()}${epLevelCount(items)}<div class="ep-grid">${items.map(v=>`<article class="ep-card"><span class="ep-pill">${epEsc(v.l)} · TOPIC SET</span><h3>${epEsc(v.topic)}</h3><p>${v.words.length} items · meaning, example, word class and useful collocation</p><div class="ep-actions"><button class="ep-btn" onclick="epVocabSet(${vocab.indexOf(v)})">Study this set →</button></div></article>`).join('')}</div><div class="ep-panel"><h3>Build vocabulary you can actually use</h3><p>Learn words with their common partners, register and grammatical patterns. Then retrieve them from memory and use them in a new context.</p></div>`;}
function epUltimateVocabSet(i){const v=vocab[i];if(!v)return;const words=v.words||[];let html=`<div class="ep-kicker">${epEsc(v.l)} · ${words.length} lexical items</div><p>Study the meaning, word class, collocation and example. Use the pronunciation button to hear each item.</p><div class="ep-vocab-grid">${words.map((w,j)=>`<article class="ep-vocab-word"><span class="ep-pill">${j+1} · ${epEsc(w[3]||'VOCABULARY')}</span><h3>${epEsc(w[0])}</h3><p>${epEsc(w[1])}</p><p class="ep-example">${epEsc(w[2])}</p>${w[4]?`<p class="ep-small"><b>Useful combination:</b> ${epEsc(w[4])}</p>`:''}<div class="ep-actions"><button class="ep-btn outline" onclick="epSpeak('${epJs(w[0])}')">🔊 Pronounce</button></div></article>`).join('')}</div><div class="ep-panel"><h3>Practice 1 · Meaning in context</h3>`;
 words.slice(0,Math.min(8,words.length)).forEach((w,j)=>{const distract=words.filter((z,k)=>k!==j).slice(0,2);const opts=[w[1],...distract.map(z=>z[1])];const shift=j%3;const ro=opts.slice(shift).concat(opts.slice(0,shift));html+=`<div class="ep-question"><b>${j+1}. What does “${epEsc(w[0])}” mean?</b>${ro.map((o,k)=>`<button class="ep-option" onclick="epAnswer(this,${k},${ro.indexOf(w[1])},'Review the example and collocation.')">${epEsc(o)}</button>`).join('')}</div>`;});
 html+=`</div><div class="ep-panel"><h3>Practice 2 · Collocation and production</h3><p>Choose three items. Write one original sentence for each and include a natural collocation.</p><textarea class="ep-textarea" placeholder="1. …\\n2. …\\n3. …"></textarea><p>Now write a short paragraph using at least four items from this set.</p><textarea class="ep-textarea" placeholder="Write 4–6 connected sentences…"></textarea><button class="ep-btn" onclick="epMark('vocab-${i}',100);alert('Vocabulary set marked as practised.')">Mark set practised</button></div>`;showModal('VOCABULARY BUILDER',v.topic,html);}
// Final render overrides: all five CEFR levels, complete reading/listening exercises and expanded vocabulary.
epListening=epUltimateListeningPage;
epListen=epUltimateListen;
epReading=epUltimateReading;
epRead=epUltimateRead;
epVocabulary=epUltimateVocab;
epVocabSet=epUltimateVocabSet;



// ===================== ENGLISH PATHWAY 2.1 =====================
// A short, indicative CEFR placement check. It is not an official examination.
const epPlacementQuestions=[
 {l:'A1',q:'She ___ from Peru.',o:['are','is','am','be'],a:1},
 {l:'A1',q:'I usually ___ breakfast at seven.',o:['have','has','having','had'],a:0},
 {l:'A1',q:'There ___ two books on the table.',o:['is','are','be','am'],a:1},
 {l:'A1',q:'Choose the correct question.',o:['Where you live?','Where do you live?','Where does you live?','Where are live you?'],a:1},
 {l:'A2',q:'We ___ to the cinema last Saturday.',o:['go','have gone','went','were go'],a:2},
 {l:'A2',q:'You ___ wear a seat belt in a car. It is the law.',o:['might','must','could','would'],a:1},
 {l:'A2',q:'I have lived here ___ 2022.',o:['for','since','during','from'],a:1},
 {l:'A2',q:'This exercise is ___ than the last one.',o:['easy','easier','more easy','easiest'],a:1},
 {l:'B1',q:'If I ___ more time, I would take up another language.',o:['have','had','will have','would have'],a:1},
 {l:'B1',q:'The meeting ___ because the manager was ill.',o:['called off','was called off','has calling off','is call off'],a:1},
 {l:'B1',q:'I am not used to ___ so early.',o:['get up','got up','getting up','have got up'],a:2},
 {l:'B1',q:'By the time we arrived, the film ___.',o:['started','has started','had started','was starting'],a:2},
 {l:'B2',q:'Were the company ___ invest more, it could expand overseas.',o:['to','for','that','will'],a:0},
 {l:'B2',q:'The report, ___ was published yesterday, contains new findings.',o:['who','whose','which','where'],a:2},
 {l:'B2',q:'Hardly ___ the presentation when the fire alarm rang.',o:['we had begun','had we begun','we began','did we begun'],a:1},
 {l:'B2',q:'The proposal was rejected, ___ its potential benefits.',o:['although','despite','because','whereas'],a:1},
 {l:'C1',q:'The findings are compelling; ___, they should be interpreted with caution.',o:['nevertheless','likewise','therefore','insofar'],a:0},
 {l:'C1',q:'The minister denied ___ prior knowledge of the issue.',o:['to have','having had','have','to having'],a:1},
 {l:'C1',q:'Only after the data had been re-examined ___ the discrepancy.',o:['they noticed','did they notice','they had noticed','noticed they'],a:1},
 {l:'C1',q:'The new policy is intended to ___ the risk of unintended consequences.',o:['mitigate','alleviate from','diminish down','lessen out'],a:0}
];
let epPlacementAnswers={};
function epPlacement(){
 const answered=Object.keys(epPlacementAnswers).length;
 return `${epHead('LEVEL CHECK','Find your starting point','Answer 20 questions that gradually increase in difficulty. This short diagnostic gives an indicative level, not an official CEFR certificate.')}
 <div class="ep-panel"><div class="ep-row"><div><b>Your progress</b><p class="ep-small">Answer all questions for the most useful estimate.</p></div><strong id="epPlacementCount">${answered}/20</strong></div><div class="ep-progress-track"><span id="epPlacementBar" style="width:${answered/20*100}%"></span></div><div class="ep-small">A1 · Beginner &nbsp; A2 · Elementary &nbsp; B1 · Intermediate &nbsp; B2 · Upper-intermediate &nbsp; C1 · Advanced</div></div>
 <div class="ep-placement-grid">${epPlacementQuestions.map((q,i)=>`<section class="ep-placement-question" data-placement-q="${i}"><div class="ep-kicker">QUESTION ${i+1} · ${q.l}</div><h3>${epEsc(q.q)}</h3>${q.o.map((o,k)=>`<button class="ep-option ${epPlacementAnswers[i]===k?'selected':''}" onclick="epChoosePlacement(${i},${k})">${String.fromCharCode(65+k)}. ${epEsc(o)}</button>`).join('')}</section>`).join('')}</div>
 <div class="ep-panel"><button class="ep-btn" onclick="epSubmitPlacement()">Calculate my indicative level</button><button class="ep-btn secondary" onclick="epResetPlacement()">Reset answers</button><div id="epPlacementResult"></div></div>`;
}
function epChoosePlacement(i,k){epPlacementAnswers[i]=k;const card=document.querySelector(`[data-placement-q="${i}"]`);if(card){card.querySelectorAll('.ep-option').forEach((b,j)=>b.classList.toggle('selected',j===k));}const n=Object.keys(epPlacementAnswers).length;const count=document.getElementById('epPlacementCount');const bar=document.getElementById('epPlacementBar');if(count)count.textContent=`${n}/20`;if(bar)bar.style.width=`${n/20*100}%`;}
function epResetPlacement(){epPlacementAnswers={};render();}
function epSubmitPlacement(){
 const answered=Object.keys(epPlacementAnswers).length;
 if(answered!==epPlacementQuestions.length){const missing=epPlacementQuestions.length-answered;alert(`Please answer all 20 questions. ${missing} remaining.`);return;}
 const total=epPlacementQuestions.reduce((n,q,i)=>n+(Number(epPlacementAnswers[i])===q.a?1:0),0);
 const bands=[{min:0,level:'A1'},{min:5,level:'A2'},{min:9,level:'B1'},{min:13,level:'B2'},{min:17,level:'C1'}];
 const level=[...bands].reverse().find(x=>total>=x.min).level;
 const descriptions={A1:'Start with everyday expressions, basic sentence patterns and essential vocabulary.',A2:'Build confidence with familiar situations, past events and practical communication.',B1:'Develop independence, connected speech and the ability to explain opinions and experiences.',B2:'Focus on nuance, complex structures, extended texts and precise communication.',C1:'Refine flexibility, academic and professional language, register and subtle meaning.'};
 localStorage.setItem('ep_placement_result',JSON.stringify({score:total,level,date:new Date().toISOString()}));
 const el=document.getElementById('epPlacementResult');if(el)el.innerHTML=`<div class="ep-placement-result"><div class="ep-kicker">YOUR INDICATIVE RESULT</div><h2>${level} · ${total}/20 correct</h2><p>${epEsc(descriptions[level])}</p><p class="ep-small">This is a short in-platform estimate. A teacher should confirm the level using speaking, writing and a fuller assessment.</p><button class="ep-btn" onclick="chooseLevel('${level}');setPage('curriculum')">Use ${level} as my starting level</button></div>`;
}
const epHomeBase=epHome;
epHome=function(){return epHomeBase().replace('<button class="btn light" onclick="setPage(\'curriculum\')">Explore the learning path →</button>','<button class="btn light" onclick="setPage(\'curriculum\')">Explore the learning path →</button><button class="btn ghost" onclick="setPage(\'placement\')">Take a level check →</button>');};
const epRenderBase=render;
render=function(){if(currentPage==='placement'){const c=document.getElementById('app');if(c)c.innerHTML=epPlacement();$$('[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page===currentPage));const t=document.getElementById('teacherModeBtn');if(t)t.classList.toggle('active-teacher',false);const badge=document.getElementById('activeLevelBadge');if(badge)badge.textContent=currentLevel;return;}epRenderBase();};
