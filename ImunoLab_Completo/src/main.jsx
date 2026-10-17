
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FileText,
  GraduationCap,
  Home,
  Layers,
  RotateCcw,
  Search,
  ShieldCheck,
  Target,
  Users,
  XCircle,
} from "lucide-react";
import { createRoot } from "react-dom/client";
import studyBank from "./studyBank.json";
import "./styles.css";

const FORM_URL =
  "https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=w_YeiiSDA0G_ShMoxdw2U3et3sbX1jFFrJYR6Yrgy4VUQUpRNDk0UEpHWFE0RVU0WEs3TDVSVkkyVS4u";

const VIDEO_URL = "https://www.youtube.com/embed/0J59CxIrZhM";

const DRIVE_URL =
  "https://drive.google.com/drive/folders/17_nMqeLzmExhUY-maLjUX8f6feIg3Sug";

function AntibodyIcon({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Anticorpo"
      role="img"
    >
      <g
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 7 L24 24 L40 7" />
        <path d="M24 24 L24 42" />
        <path d="M8 7 L4 3" />
        <path d="M40 7 L44 3" />
      </g>
    </svg>
  );
}

const navItems = [
  { id: "home", label: "Visão geral", icon: Home },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "quiz", label: "Simulados", icon: Target },
  { id: "topics", label: "Explorar tópicos", icon: BookOpen },
  {
    id: "satisfaction",
    label: "Pesquisa de Satisfação Institucional",
    icon: Users,
  },
  {
    id: "alternative",
    label: "Complemento — Via Alternativa",
    icon: PlayIcon,
  },
  { id: "drive", label: "Drive da Turma", icon: FileText },
];

function PlayIcon(props) {
  return <Activity {...props} />;
}

function getText(item, keys, fallback = "") {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }
  return fallback;
}

function getAxis(item) {
  return getText(
    item,
    ["axis", "eixo", "area", "discipline", "disciplina", "category", "categoria"],
    "Imunologia"
  );
}

function getTopic(item) {
  return getText(
    item,
    ["topic", "topico", "tópico", "subject", "assunto", "theme", "tema"],
    "Geral"
  );
}

function getQuestionText(item) {
  return getText(
    item,
    ["question", "pergunta", "enunciado", "prompt", "front", "title"],
    "Pergunta não disponível"
  );
}

function getOptions(item) {
  const options = getText(
    item,
    ["options", "alternatives", "alternativas", "choices", "opcoes", "opções"],
    []
  );

  if (Array.isArray(options)) return options;
  if (options && typeof options === "object") return Object.values(options);
  return [];
}

function getCorrectAnswer(item, options) {
  const answer = getText(
    item,
    [
      "answer",
      "correctAnswer",
      "correct_answer",
      "resposta",
      "correct",
      "gabarito",
      "rightAnswer",
    ],
    null
  );

  if (answer === null) return 0;

  if (typeof answer === "number") return answer;

  if (typeof answer === "string") {
    const normalized = answer.trim().toLowerCase();
    const letter = normalized.match(/^([a-z])[\).]?$/i);

    if (letter && letter[1].length === 1) {
      const index = letter[1].toUpperCase().charCodeAt(0) - 65;
      if (index >= 0 && index < options.length) return index;
    }

    const matchingIndex = options.findIndex(
      (option) =>
        String(option).trim().toLowerCase() === normalized
    );

    if (matchingIndex >= 0) return matchingIndex;
  }

  return 0;
}

function normalizeOption(option) {
  if (typeof option === "string" || typeof option === "number") {
    return String(option);
  }

  return getText(
    option,
    ["text", "texto", "label", "value", "answer", "resposta"],
    JSON.stringify(option)
  );
}

function normalizeBank(bank) {
  const cards = Array.isArray(bank?.cards) ? bank.cards : [];
  const questions = Array.isArray(bank?.questions)
    ? bank.questions
    : [];

  const normalizedCards = cards.map((card, index) => ({
    ...card,
    _id: card.id ?? `card-${index}`,
    _axis: getAxis(card),
    _topic: getTopic(card),
    _front: getText(
      card,
      ["front", "question", "pergunta", "term", "termo", "title"],
      "Frente do cartão"
    ),
    _back: getText(
      card,
      ["back", "answer", "resposta", "definition", "definicao", "definição"],
      "Verso do cartão"
    ),
  }));

  const normalizedQuestions = questions.map((question, index) => {
    const rawOptions = getOptions(question);
    const options = rawOptions.map(normalizeOption);

    return {
      ...question,
      _id: question.id ?? `question-${index}`,
      _axis: getAxis(question),
      _topic: getTopic(question),
      _question: getQuestionText(question),
      _options: options,
      _answer: getCorrectAnswer(question, options),
      _explanation: getText(
        question,
        ["explanation", "explicacao", "explicação", "justification", "comentario", "comentário"],
        ""
      ),
    };
  });

  const axes = [
    ...new Set([
      ...normalizedCards.map((item) => item._axis),
      ...normalizedQuestions.map((item) => item._axis),
    ]),
  ];

  const topics = [
    ...new Set([
      ...normalizedCards.map((item) => item._topic),
      ...normalizedQuestions.map((item) => item._topic),
    ]),
  ];

  return {
    cards: normalizedCards,
    questions: normalizedQuestions,
    axes,
    topics,
  };
}

const bank = normalizeBank(studyBank);

function AntibodyLogo() {
  return (
    <div className="brand">
      <div className="brand-icon">
        <AntibodyIcon size={32} />
      </div>
      <div>
        <div className="brand-name">ImunoLab</div>
        <div className="brand-subtitle">Aprender. Praticar. Evoluir.</div>
      </div>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState("home");
  const [selectedAxis, setSelectedAxis] = useState("Todos");
  const [selectedTopic, setSelectedTopic] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const filteredCards = useMemo(() => {
    return bank.cards.filter((card) => {
      const matchesAxis =
        selectedAxis === "Todos" || card._axis === selectedAxis;

      const matchesTopic =
        selectedTopic === "Todos" || card._topic === selectedTopic;

      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        `${card._front} ${card._back} ${card._axis} ${card._topic}`
          .toLowerCase()
          .includes(search);

      return matchesAxis && matchesTopic && matchesSearch;
    });
  }, [selectedAxis, selectedTopic, searchTerm]);

  const filteredQuestions = useMemo(() => {
    return bank.questions.filter((question) => {
      const matchesAxis =
        selectedAxis === "Todos" || question._axis === selectedAxis;

      const matchesTopic =
        selectedTopic === "Todos" || question._topic === selectedTopic;

      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !search ||
        `${question._question} ${question._axis} ${question._topic}`
          .toLowerCase()
          .includes(search);

      return matchesAxis && matchesTopic && matchesSearch;
    });
  }, [selectedAxis, selectedTopic, searchTerm]);

  const currentCard = filteredCards[cardIndex];

  const currentQuestion = quizQuestions[quizIndex];

  function changePage(page) {
    setActivePage(page);
    setSearchTerm("");
    setSelectedAxis("Todos");
    setSelectedTopic("Todos");
    setCardIndex(0);
    setIsFlipped(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeAxis(axis) {
    setSelectedAxis(axis);
    setSelectedTopic("Todos");
    setCardIndex(0);
    setIsFlipped(false);
  }

  function nextCard() {
    if (!filteredCards.length) return;
    setCardIndex((index) => (index + 1) % filteredCards.length);
    setIsFlipped(false);
  }

  function previousCard() {
    if (!filteredCards.length) return;
    setCardIndex(
      (index) => (index - 1 + filteredCards.length) % filteredCards.length
    );
    setIsFlipped(false);
  }

  function startQuiz() {
    const pool = filteredQuestions.length
      ? [...filteredQuestions]
      : [...bank.questions];

    if (!pool.length) return;

    const shuffled = pool.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));

    setQuizQuestions(selected);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setQuizFinished(false);
    setActivePage("quiz");
  }

  function submitAnswer() {
    if (selectedAnswer === null || !currentQuestion) return;

    const newAnswers = [
      ...answers,
      {
        questionId: currentQuestion._id,
        selected: selectedAnswer,
        correct: selectedAnswer === currentQuestion._answer,
      },
    ];

    setAnswers(newAnswers);

    if (quizIndex + 1 >= quizQuestions.length) {
      setQuizFinished(true);
    } else {
      setQuizIndex((index) => index + 1);
      setSelectedAnswer(null);
    }
  }

  function restartQuiz() {
    setQuizQuestions([]);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setQuizFinished(false);
  }

  const score = answers.filter((answer) => answer.correct).length;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <AntibodyLogo />

        <div className="sidebar-label">AMBIENTE DE ESTUDOS</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => changePage(item.id)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-icon">
            <ShieldCheck size={20} />
          </div>
          <div>
            <strong>Seu espaço de estudo</strong>
            <p>Conhecimento que fortalece a prática.</p>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <span>ImunoLab</span>
            <ChevronRight size={15} />
            <strong>
              {navItems.find((item) => item.id === activePage)?.label}
            </strong>
          </div>

          <div className="course-label">
            <GraduationCap size={17} />
            <span>Medicina • PUCPR</span>
          </div>
        </header>

        <div className="page-content">
          {activePage === "home" && (
            <section className="welcome-section">
              <div className="welcome-card">
                <div className="welcome-copy">
                  <div className="eyebrow">
                    <span className="eyebrow-dot" />
                    MONITORIA DE IMUNOLOGIA
                  </div>

                  <h1>Bem-vindo ao ImunoLab.</h1>

                  <p>
                    Um espaço para revisar conceitos, testar seus
                    conhecimentos e aprofundar o estudo da Imunologia
                    no seu ritmo.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => changePage("flashcards")}
                  >
                    Começar a estudar
                    <ArrowRight size={18} />
                  </button>
                </div>

                <div className="welcome-art">
                  <div className="welcome-art-circle">
                    <AntibodyIcon size={94} />
                  </div>
                  <span className="floating-dot dot-one" />
                  <span className="floating-dot dot-two" />
                  <span className="floating-dot dot-three" />
                </div>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Seu ambiente de aprendizagem</h2>
                  <p>Escolha uma atividade para continuar.</p>
                </div>
              </div>

              <div className="feature-grid">
                <button
                  className="feature-card"
                  onClick={() => changePage("flashcards")}
                >
                  <div className="feature-icon purple">
                    <Layers size={23} />
                  </div>
                  <h3>Flashcards</h3>
                  <p>Revise conceitos e pratique a recuperação ativa.</p>
                  <span className="feature-link">
                    Estudar agora <ArrowRight size={16} />
                  </span>
                </button>

                <button className="feature-card" onClick={startQuiz}>
                  <div className="feature-icon blue">
                    <Target size={23} />
                  </div>
                  <h3>Simulados</h3>
                  <p>Teste seus conhecimentos com questões objetivas.</p>
                  <span className="feature-link">
                    Fazer simulado <ArrowRight size={16} />
                  </span>
                </button>

                <button
                  className="feature-card"
                  onClick={() => changePage("topics")}
                >
                  <div className="feature-icon green">
                    <BookOpen size={23} />
                  </div>
                  <h3>Explorar tópicos</h3>
                  <p>Encontre conteúdos por eixo e assunto.</p>
                  <span className="feature-link">
                    Explorar <ArrowRight size={16} />
                  </span>
                </button>
              </div>

              <div className="section-heading">
                <div>
                  <h2>Conteúdos disponíveis</h2>
                  <p>Material de apoio para sua rotina de estudos.</p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon purple">
                    <Layers size={21} />
                  </div>
                  <div>
                    <span className="stat-number">{bank.cards.length}</span>
                    <span className="stat-label">Flashcards</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon blue">
                    <CircleHelp size={21} />
                  </div>
                  <div>
                    <span className="stat-number">
                      {bank.questions.length}
                    </span>
                    <span className="stat-label">Questões</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <BookOpen size={21} />
                  </div>
                  <div>
                    <span className="stat-number">{bank.axes.length}</span>
                    <span className="stat-label">Eixos de estudo</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activePage === "flashcards" && (
            <section>
              <div className="page-heading">
                <div className="eyebrow">APRENDIZAGEM ATIVA</div>
                <h1>Flashcards</h1>
                <p>
                  Tente responder mentalmente antes de revelar o verso
                  do cartão.
                </p>
              </div>

              <FilterBar
                axes={bank.axes}
                topics={bank.topics}
                selectedAxis={selectedAxis}
                selectedTopic={selectedTopic}
                searchTerm={searchTerm}
                onAxisChange={changeAxis}
                onTopicChange={(topic) => {
                  setSelectedTopic(topic);
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                onSearchChange={(value) => {
                  setSearchTerm(value);
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
              />

              <div className="study-count">
                {filteredCards.length} cartões encontrados
              </div>

              {currentCard ? (
                <div className="flashcard-area">
                  <div className="flashcard-progress">
                    <span>
                      Cartão {cardIndex + 1} de {filteredCards.length}
                    </span>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${
                            ((cardIndex + 1) / filteredCards.length) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`flashcard ${isFlipped ? "flipped" : ""}`}
                    onClick={() => setIsFlipped((value) => !value)}
                    aria-label="Virar flashcard"
                  >
                    <span className="flashcard-tag">
                      {currentCard._topic}
                    </span>
                    <span className="flashcard-label">
                      {isFlipped ? "RESPOSTA" : "PERGUNTA"}
                    </span>
                    <span className="flashcard-text">
                      {isFlipped ? currentCard._back : currentCard._front}
                    </span>
                    <span className="flashcard-hint">
                      <RotateCcw size={16} />
                      Toque no cartão para virar
                    </span>
                  </button>

                  <div className="flashcard-controls">
                    <button
                      className="secondary-button"
                      onClick={previousCard}
                      disabled={filteredCards.length <= 1}
                    >
                      <ArrowLeft size={17} />
                      Anterior
                    </button>

                    <button
                      className="primary-button"
                      onClick={nextCard}
                      disabled={filteredCards.length <= 1}
                    >
                      Próximo cartão
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Nenhum cartão encontrado"
                  description="Tente alterar os filtros ou o termo da pesquisa."
                />
              )}
            </section>
          )}

          {activePage === "quiz" && (
            <section>
              <div className="page-heading">
                <div className="eyebrow">TESTE SEUS CONHECIMENTOS</div>
                <h1>Simulados</h1>
                <p>
                  Pratique com questões de Imunologia e acompanhe seu
                  desempenho ao final.
                </p>
              </div>

              {!quizQuestions.length ? (
                <div className="quiz-start-card">
                  <div className="large-feature-icon">
                    <Target size={35} />
                  </div>
                  <h2>Pronto para testar seus conhecimentos?</h2>
                  <p>
                    O simulado seleciona até 10 questões do banco de
                    questões. Você verá o resultado ao finalizar.
                  </p>

                  <FilterBar
                    axes={bank.axes}
                    topics={bank.topics}
                    selectedAxis={selectedAxis}
                    selectedTopic={selectedTopic}
                    searchTerm={searchTerm}
                    onAxisChange={changeAxis}
                    onTopicChange={setSelectedTopic}
                    onSearchChange={setSearchTerm}
                  />

                  <button
                    className="primary-button"
                    onClick={startQuiz}
                    disabled={!bank.questions.length}
                  >
                    Iniciar simulado
                    <ArrowRight size={18} />
                  </button>
                </div>
              ) : quizFinished ? (
                <div className="result-card">
                  <div className="result-icon">
                    <CheckCircle2 size={42} />
                  </div>
                  <div className="eyebrow">SIMULADO CONCLUÍDO</div>
                  <h2>Você finalizou!</h2>
                  <div className="result-score">
                    {score}
                    <span>/{quizQuestions.length}</span>
                  </div>
                  <p>
                    Você acertou {score} de {quizQuestions.length} questões.
                  </p>
                  <div className="result-progress">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          (score / quizQuestions.length) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <div className="result-actions">
                    <button
                      className="secondary-button"
                      onClick={restartQuiz}
                    >
                      <ArrowLeft size={17} />
                      Voltar aos simulados
                    </button>
                    <button className="primary-button" onClick={startQuiz}>
                      Tentar novamente
                      <RotateCcw size={17} />
                    </button>
                  </div>

                  <div className="answer-review">
                    <h3>Revisão das respostas</h3>
                    {quizQuestions.map((question, index) => {
                      const result = answers[index];
                      return (
                        <div className="review-item" key={question._id}>
                          <div className="review-status">
                            {result?.correct ? (
                              <CheckCircle2 size={19} />
                            ) : (
                              <XCircle size={19} />
                            )}
                          </div>
                          <div>
                            <strong>
                              {index + 1}. {question._question}
                            </strong>
                            <p>
                              Resposta correta:{" "}
                              {question._options[question._answer] ??
                                "Consulte o material de estudo"}
                            </p>
                            {question._explanation && (
                              <p>{question._explanation}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : currentQuestion ? (
                <div className="question-card">
                  <div className="question-topline">
                    <span>
                      Questão {quizIndex + 1} de {quizQuestions.length}
                    </span>
                    <span>{currentQuestion._topic}</span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          (quizIndex / quizQuestions.length) * 100
                        }%`,
                      }}
                    />
                  </div>

                  <h2>{currentQuestion._question}</h2>

                  <div className="answer-options">
                    {currentQuestion._options.map((option, index) => (
                      <button
                        key={`${currentQuestion._id}-${index}`}
                        className={`answer-option ${
                          selectedAnswer === index ? "selected" : ""
                        }`}
                        onClick={() => setSelectedAnswer(index)}
                      >
                        <span className="option-letter">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </button>
                    ))}
                  </div>

                  {currentQuestion._options.length === 0 && (
                    <p className="empty-message">
                      Esta questão não possui alternativas cadastradas.
                      Verifique o formato dos dados em studyBank.json.
                    </p>
                  )}

                  <div className="question-footer">
                    <span>
                      {quizIndex + 1} de {quizQuestions.length}
                    </span>
                    <button
                      className="primary-button"
                      onClick={submitAnswer}
                      disabled={
                        selectedAnswer === null ||
                        currentQuestion._options.length === 0
                      }
                    >
                      {quizIndex + 1 === quizQuestions.length
                        ? "Finalizar simulado"
                        : "Próxima questão"}
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Não foi possível carregar a questão"
                  description="Volte e inicie um novo simulado."
                />
              )}
            </section>
          )}

          {activePage === "topics" && (
            <section>
              <div className="page-heading">
                <div className="eyebrow">ORGANIZE SEUS ESTUDOS</div>
                <h1>Explorar tópicos</h1>
                <p>
                  Escolha um eixo ou assunto para encontrar cartões
                  relacionados e revisar os principais conceitos.
                </p>
              </div>

              <FilterBar
                axes={bank.axes}
                topics={bank.topics}
                selectedAxis={selectedAxis}
                selectedTopic={selectedTopic}
                searchTerm={searchTerm}
                onAxisChange={changeAxis}
                onTopicChange={setSelectedTopic}
                onSearchChange={setSearchTerm}
              />

              <div className="topic-results-heading">
                <h2>Conteúdos encontrados</h2>
                <span>
                  {filteredCards.length} cartões · {filteredQuestions.length}{" "}
                  questões
                </span>
              </div>

              {bank.axes.length > 0 && (
                <div className="axis-grid">
                  {bank.axes.map((axis) => {
                    const axisCards = bank.cards.filter(
                      (card) => card._axis === axis
                    );
                    const axisQuestions = bank.questions.filter(
                      (question) => question._axis === axis
                    );

                    return (
                      <button
                        key={axis}
                        className={`axis-card ${
                          selectedAxis === axis ? "selected" : ""
                        }`}
                        onClick={() => changeAxis(axis)}
                      >
                        <div className="axis-card-icon">
                          <BookOpen size={22} />
                        </div>
                        <h3>{axis}</h3>
                        <p>
                          {axisCards.length} flashcards · {axisQuestions.length}{" "}
                          questões
                        </p>
                        <span>
                          Explorar eixo <ArrowRight size={15} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="topic-list">
                {filteredCards.slice(0, 20).map((card) => (
                  <div className="topic-row" key={card._id}>
                    <div className="topic-row-icon">
                      <BookOpen size={18} />
                    </div>
                    <div className="topic-row-content">
                      <strong>{card._front}</strong>
                      <span>
                        {card._axis} · {card._topic}
                      </span>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Estudar este cartão"
                      onClick={() => {
                        setCardIndex(
                          Math.max(
                            0,
                            filteredCards.findIndex(
                              (item) => item._id === card._id
                            )
                          )
                        );
                        setActivePage("flashcards");
                      }}
                    >
                      <ChevronRight size={19} />
                    </button>
                  </div>
                ))}
              </div>

              {!filteredCards.length && (
                <EmptyState
                  title="Nenhum conteúdo encontrado"
                  description="Altere os filtros para explorar outros tópicos."
                />
              )}
            </section>
          )}

          {activePage === "satisfaction" && (
            <section>
              <div className="page-heading">
                <div className="eyebrow">SUA OPINIÃO É IMPORTANTE</div>
                <h1>Pesquisa de Satisfação Institucional</h1>
                <p>
                  Contribua para o aprimoramento das atividades e dos
                  recursos disponibilizados pela monitoria.
                </p>
              </div>

              <div className="external-content-card">
                <div className="external-content-icon">
                  <Users size={30} />
                </div>
                <h2>Ajude a melhorar o ImunoLab</h2>
                <p>
                  Sua participação é importante para avaliarmos a experiência
                  de aprendizagem e identificarmos oportunidades de melhoria.
                </p>
                <a
                  className="primary-button link-button"
                  href={FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Responder à pesquisa
                  <ExternalLink size={17} />
                </a>
                <p className="external-note">
                  O formulário será aberto em uma nova aba.
                </p>
              </div>
            </section>
          )}

          {activePage === "alternative" && (
            <section>
              <div className="page-heading">
                <div className="eyebrow">MATERIAL COMPLEMENTAR</div>
                <h1>Via alternativa do complemento</h1>
                <p>
                  Assista ao conteúdo complementar e reforce os conceitos
                  relacionados à ativação do sistema complemento.
                </p>
              </div>

              <div className="video-card">
                <div className="video-frame">
                  <iframe
                    src={VIDEO_URL}
                    title="Complemento — Via Alternativa"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <div className="video-description">
                  <div className="video-title-icon">
                    <Activity size={22} />
                  </div>
                  <div>
                    <h2>Complemento — Via Alternativa</h2>
                    <p>
                      Material audiovisual de apoio aos estudos de Imunologia.
                    </p>
                  </div>
                  <a
                    href="https://www.youtube.com/watch?v=0J59CxIrZhM"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="icon-button"
                    aria-label="Abrir vídeo no YouTube"
                  >
                    <ExternalLink size={19} />
                  </a>
                </div>
              </div>
            </section>
          )}

          {activePage === "drive" && (
            <section>
              <div className="page-heading">
                <div className="eyebrow">MATERIAIS DA TURMA</div>
                <h1>Drive da Turma</h1>
                <p>
                  Acesse a pasta compartilhada para consultar os materiais
                  disponibilizados para a turma.
                </p>
              </div>

              <div className="external-content-card">
                <div className="external-content-icon">
                  <FileText size={30} />
                </div>
                <h2>Materiais compartilhados</h2>
                <p>
                  Abra o Google Drive para visualizar os arquivos e documentos
                  disponibilizados pela turma.
                </p>
                <a
                  className="primary-button link-button"
                  href={DRIVE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir Drive da Turma
                  <ExternalLink size={17} />
                </a>
                <p className="external-note">
                  O acesso aos arquivos depende das permissões configuradas
                  no Google Drive.
                </p>
              </div>
            </section>
          )}
        </div>

        <footer className="site-footer">
          <div className="footer-brand">
            <AntibodyIcon size={20} />
            <span>ImunoLab</span>
          </div>
          <p>Desenvolvido pela Monitoria de Imunologia da PUCPR</p>
        </footer>
      </main>
    </div>
  );
}

function FilterBar({
  axes,
  topics,
  selectedAxis,
  selectedTopic,
  searchTerm,
  onAxisChange,
  onTopicChange,
  onSearchChange,
}) {
  return (
    <div className="filter-bar">
      <label className="search-box">
        <Search size={18} />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Pesquisar conteúdo..."
        />
      </label>

      <select
        aria-label="Filtrar por eixo"
        value={selectedAxis}
        onChange={(event) => onAxisChange(event.target.value)}
      >
        <option value="Todos">Todos os eixos</option>
        {axes.map((axis) => (
          <option key={axis} value={axis}>
            {axis}
          </option>
        ))}
      </select>

      <select
        aria-label="Filtrar por tópico"
        value={selectedTopic}
        onChange={(event) => onTopicChange(event.target.value)}
      >
        <option value="Todos">Todos os tópicos</option>
        {topics.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </select>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Search size={25} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
