
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, BookOpen, Brain, CheckCircle2, ChevronLeft,
  ChevronRight, ClipboardList, Clock3, FlaskConical,
  GraduationCap, HeartPulse, Home, Layers, Menu,
  Microscope, ShieldCheck, Shuffle, Target, X,
  ArrowUpRight, RotateCcw, Bookmark, ExternalLink,
  PlayCircle, MessageSquare, FolderOpen
} from 'lucide-react';
import studyBank from './studyBank.json';
import './styles.css';

const FORM_URL = 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=w_YeiiSDA0G_ShMoxdw2U3et3sbX1jFFrJYR6Yrgy4VUQUpRNDk0UEpHWFE0RVU0WEs3TDVSVkkyVS4u';

const VIDEO_URL = 'https://www.youtube.com/embed/0J59CxIrZhM';

const DRIVE_URL = 'https://drive.google.com/drive/folders/17_nMqeLzmExhUY-maLjUX8f6feIg3Sug';

const GITHUB_API_BASE =
  'https://api.github.com/repos/filippicaroline/imuno-lab/contents/ImunoLab_Completo/public/biblioteca';

const axes = [
  {
    id: 'p1',
    name: 'Imunologia P1',
    short: 'P1',
    desc: 'Fundamentos e imunidade inata',
    color: '#64d8c5',
    icon: ShieldCheck
  },
  {
    id: 'p2',
    name: 'Imunologia P2',
    short: 'P2',
    desc: 'Mecanismos efetores e memória',
    color: '#9d91ff',
    icon: Brain
  },
  {
    id: 'hemato',
    name: 'Imuno-Hemato',
    short: 'H',
    desc: 'Antígenos, anticorpos e hemoterapia',
    color: '#ff9b78',
    icon: HeartPulse
  }
];

const imageFolders = {
  p1: 'Imunologia P1',
  p2: 'Imunologia P2',
  hemato: 'ImunoHemato'
};

const cards = studyBank.cards;
const questions = studyBank.questions;

const topics = {
  p1: [
    'Resposta imune inata e adaptativa',
    'Barreiras e células efetoras',
    'Sistema complemento',
    'Inflamação e recrutamento leucocitário',
    'Apresentação de antígenos',
    'MHC classe I e II',
    'Células NK e fagócitos'
  ],
  p2: [
    'Mecanismos efetores da imunidade',
    'Linfócitos T CD4+ e CD8+',
    'Citotoxicidade celular',
    'Neutralização e opsonização',
    'Citotoxicidade dependente de anticorpos',
    'Células T de memória',
    'Complemento: mecanismos e avaliação'
  ],
  hemato: [
    'Antígenos e anticorpos',
    'Estrutura e classes das imunoglobulinas',
    'Sistema ABO e antígeno H',
    'Sistema Rh',
    'Testes imuno-hematológicos',
    'Sífilis: testes sorológicos',
    'Histocompatibilidade e aloantígenos',
    'Hipersensibilidade',
    'Autoimunidade e infecções'
  ]
};

function App() {
  const [view, setView] = useState('home');
  const [axis, setAxis] = useState('all');
  const [mobile, setMobile] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [quizAxis, setQuizAxis] = useState('all');
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [topic, setTopic] = useState('');

  // Estado da Biblioteca de Imagens
  const [imageAxis, setImageAxis] = useState('p1');
  const [libraryImages, setLibraryImages] = useState({
    p1: [],
    p2: [],
    hemato: []
  });
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');

  const visibleCards = cards.filter(
    c => axis === 'all' || c[0] === axis
  );

  const currentCard = visibleCards.length
    ? visibleCards[cardIndex % visibleCards.length]
    : null;

  const quiz = questions.filter(
    q => quizAxis === 'all' || q.axis === quizAxis
  );

  const q = quiz[Math.min(quizIndex, quiz.length - 1)];

  const nav = (v) => {
    setView(v);
    setMobile(false);
    setTopic('');
  };

  const chooseAxis = (id) => {
    setAxis(id);
    setCardIndex(0);
    setFlipped(false);
    setTopic('');
  };

  const startQuiz = (a = 'all') => {
    setQuizAxis(a);
    setQuizIndex(0);
    setAnswers({});
    setFinished(false);
    nav('quiz');
  };

  // Carrega os arquivos de imagem diretamente das três pastas públicas
  // do repositório GitHub.
  useEffect(() => {
    if (view !== 'images') return;

    let cancelled = false;

    async function loadLibrary() {
      setLibraryLoading(true);
      setLibraryError('');

      try {
        const entries = await Promise.all(
          Object.entries(imageFolders).map(async ([id, folder]) => {
            const url =
              `${GITHUB_API_BASE}/${encodeURIComponent(folder)}?ref=main`;

            const response = await fetch(url);

            if (!response.ok) {
              throw new Error(
                `Falha ao acessar a pasta "${folder}" (HTTP ${response.status}).`
              );
            }

            const files = await response.json();

            if (!Array.isArray(files)) {
              throw new Error(
                `A pasta "${folder}" não retornou uma lista de arquivos.`
              );
            }

            const images = files
              .filter(file =>
                file.type === 'file' &&
                /\.(png|jpe?g|webp|gif)$/i.test(file.name)
              )
              .map(file => ({
                name: file.name,
                url: file.download_url
              }))
              .filter(file => Boolean(file.url))
              .sort((a, b) =>
                a.name.localeCompare(b.name, 'pt-BR', {
                  numeric: true,
                  sensitivity: 'base'
                })
              );

            return [id, images];
          })
        );

        if (!cancelled) {
          setLibraryImages(Object.fromEntries(entries));
        }
      } catch (error) {
        console.error('Erro ao carregar a Biblioteca de Imagens:', error);

        if (!cancelled) {
          setLibraryError(
            'Não foi possível carregar a biblioteca. Verifique se as pastas ' +
            'e imagens estão públicas no GitHub e tente novamente.'
          );
        }
      } finally {
        if (!cancelled) {
          setLibraryLoading(false);
        }
      }
    }

    loadLibrary();

    return () => {
      cancelled = true;
    };
  }, [view]);

  const retryLibrary = () => {
    setLibraryError('');
    setView('home');

    // A troca de tela permite executar novamente o carregamento.
    window.setTimeout(() => {
      setView('images');
    }, 0);
  };

  const headings = {
    home: 'Visão geral',
    flashcards: 'Flashcards',
    quiz: 'Simulados',
    explore: 'Explorar tópicos',
    images: 'Biblioteca de Imagens',
    satisfaction: 'Pesquisa de Satisfação Institucional',
    alternative: 'Complemento — Via Alternativa',
    drive: 'Drive da Turma'
  };

  const navItems = [
    ['home', Home, 'Visão geral'],
    ['flashcards', Layers, 'Flashcards'],
    ['quiz', ClipboardList, 'Simulados'],
    ['explore', FlaskConical, 'Explorar tópicos'],
    ['images', Microscope, 'Biblioteca de Imagens'],
    ['satisfaction', MessageSquare, 'Pesquisa de Satisfação Institucional'],
    ['alternative', PlayCircle, 'Complemento — Via Alternativa'],
    ['drive', FolderOpen, 'Drive da Turma']
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">
            <Microscope size={23} />
          </div>
          <div>
            <strong>Imuno<span>Lab</span></strong>
            <small>MONITORIA · MEDICINA</small>
          </div>
          <button
            className="icon-btn close-menu"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="side-label">ESPAÇO DE ESTUDO</div>

        <nav className="nav-list">
          {navItems.map(([id, Icon, label]) => (
            <button
              key={id}
              className={`nav-item ${view === id ? 'active' : ''}`}
              onClick={() => nav(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === 'flashcards' && <em>{cards.length}</em>}
            </button>
          ))}
        </nav>

        <div className="side-label axes-label">
          EIXOS DE IMUNOLOGIA
        </div>

        <div className="axis-list">
          {axes.map(a => (
            <button
              key={a.id}
              className={`axis-item ${axis === a.id ? 'selected' : ''}`}
              onClick={() => {
                chooseAxis(a.id);
                nav('flashcards');
              }}
            >
              <span
                className="axis-dot"
                style={{ background: a.color }}
              />
              <span>
                <b>{a.name}</b>
                <small>{a.desc}</small>
              </span>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <div className="study-card">
            <div className="study-icon">
              <GraduationCap size={18} />
            </div>
            <b>Aprenda no seu ritmo</b>
            <p>
              Revise conceitos, teste seu conhecimento e estude por eixos.
            </p>
            <button onClick={() => startQuiz('all')}>
              Começar simulado <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="side-foot">
            <span className="status-dot" />
            Conteúdo local · sem login
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMobile(true)}
          >
            <Menu size={20} />
          </button>
          <div className="crumb">
            ImunoLab <ChevronRight size={14} />
            <span>{headings[view]}</span>
          </div>
          <div className="top-actions">
            <div className="avatar">IL</div>
          </div>
        </header>

        {view === 'home' && (
          <section className="content-wrap">
            <div className="hero">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span className="live-dot" />
                  SUA PLATAFORMA DE APRENDIZAGEM
                </div>
                <h1>Imunologia, <span>conectada.</span></h1>
                <p>
                  Do reconhecimento do antígeno à resposta efetora.
                  Estude por eixos, revise com flashcards e avalie
                  seu conhecimento com simulados.
                </p>
                <div className="hero-actions">
                  <button
                    className="btn primary"
                    onClick={() => nav('explore')}
                  >
                    <BookOpen size={17} /> Explorar tópicos
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => startQuiz('all')}
                  >
                    <Target size={17} /> Fazer um simulado
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="hero-meta">
                  <span>
                    <CheckCircle2 size={14} /> 3 eixos de estudo
                  </span>
                  <span>
                    <ShieldCheck size={14} /> Sem cadastro
                  </span>
                  <span>
                    <Clock3 size={14} /> No seu ritmo
                  </span>
                </div>
              </div>

              <div className="hero-art">
                <div className="orbit orbit-a" />
                <div className="orbit orbit-b" />
                <div className="cell cell-main">
                  <div className="cell-core" />
                  <div className="cell-nucleus" />
                  <i /><i /><i />
                </div>
                <div className="float-tag tag-a">
                  <span className="tag-dot teal" /> Antígeno
                </div>
                <div className="float-tag tag-b">
                  <span className="tag-dot purple" /> Linfócito T
                </div>
                <div className="float-tag tag-c">
                  <span className="tag-dot orange" /> Anticorpo
                </div>
                <div className="hero-spark spark-one">✳</div>
                <div className="hero-spark spark-two">+</div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon teal-bg">
                  <Layers size={19} />
                </div>
                <div>
                  <strong>{cards.length}</strong>
                  <span>flashcards</span>
                </div>
                <small>revisão ativa</small>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple-bg">
                  <ClipboardList size={19} />
                </div>
                <div>
                  <strong>{questions.length}</strong>
                  <span>questões</span>
                </div>
                <small>com justificativas</small>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange-bg">
                  <Activity size={19} />
                </div>
                <div>
                  <strong>3</strong>
                  <span>eixos integrados</span>
                </div>
                <small>estudo organizado</small>
              </div>
            </div>

            <div className="section-head home-section-head">
              <div>
                <div className="eyebrow">TRILHAS DE APRENDIZAGEM</div>
                <h2>Escolha seu eixo</h2>
                <p>
                  Selecione um eixo para revisar os conteúdos com flashcards.
                </p>
              </div>
              <button
                className="text-link"
                onClick={() => nav('explore')}
              >
                Explorar tópicos <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="axis-cards">
              {axes.map((a, i) => {
                const Icon = a.icon;

                return (
                  <article className="axis-card" key={a.id}>
                    <div className="axis-card-top">
                      <div
                        className="axis-symbol"
                        style={{
                          color: a.color,
                          background: a.color + '16'
                        }}
                      >
                        <Icon size={21} />
                      </div>
                      <span className="axis-number">0{i + 1}</span>
                    </div>
                    <h3>{a.name}</h3>
                    <p>
                      {a.desc}. Revise os principais conceitos com cartões
                      de estudo.
                    </p>
                    <div className="axis-card-meta">
                      <span>
                        <Layers size={14} />
                        {cards.filter(c => c[0] === a.id).length} cards
                      </span>
                    </div>
                    <button
                      className="card-open"
                      onClick={() => {
                        chooseAxis(a.id);
                        nav('flashcards');
                      }}
                    >
                      Estudar eixo <ArrowUpRight size={16} />
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="bottom-grid">
              <article className="feature-panel flash-feature">
                <div className="feature-icon purple-bg">
                  <Layers size={20} />
                </div>
                <div className="feature-copy">
                  <div className="eyebrow">REVISÃO ATIVA</div>
                  <h3>Fixe o conteúdo com flashcards</h3>
                  <p>
                    Recupere a informação antes de revelar a resposta.
                  </p>
                  <button
                    className="btn secondary"
                    onClick={() => nav('flashcards')}
                  >
                    Estudar flashcards <ChevronRight size={16} />
                  </button>
                </div>
                <div className="mini-cards">
                  <div className="mini-card mini-back">Fc</div>
                  <div className="mini-card mini-front">Ag</div>
                </div>
              </article>

              <article className="feature-panel quiz-feature">
                <div className="feature-icon orange-bg">
                  <Target size={20} />
                </div>
                <div className="feature-copy">
                  <div className="eyebrow">PRATIQUE E AVALIE</div>
                  <h3>Simulados com feedback</h3>
                  <p>
                    Questões de múltipla escolha com justificativas.
                  </p>
                  <button
                    className="btn secondary"
                    onClick={() => startQuiz('all')}
                  >
                    Iniciar simulado <ChevronRight size={16} />
                  </button>
                </div>
                <div className="quiz-visual">
                  <div className="quiz-ring"><span>Q</span></div>
                  <div className="quiz-line line-1" />
                  <div className="quiz-line line-2" />
                  <div className="quiz-line line-3" />
                </div>
              </article>
            </div>

            <div className="disclaimer">
              <ShieldCheck size={16} />
              <p>
                <b>Material educacional.</b> Confirme conceitos clínicos e
                condutas em bibliografia e diretrizes atualizadas.
              </p>
            </div>
          </section>
        )}

        {view === 'flashcards' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">ACTIVE RECALL</div>
                <h1>Flashcards</h1>
                <p>
                  Responda mentalmente antes de virar o cartão.
                </p>
              </div>
              <div className="counter-pill">
                <Layers size={15} /> {visibleCards.length} cartões
              </div>
            </div>

            <div className="filter-tabs">
              {[
                ['all', 'Todos os eixos'],
                ...axes.map(a => [a.id, a.name])
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={axis === id ? 'tab active' : 'tab'}
                  onClick={() => chooseAxis(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {currentCard && (
              <div className="flash-layout">
                <div className="flash-main">
                  <div className="flash-progress">
                    <span>
                      Cartão {cardIndex % visibleCards.length + 1}
                      {' '}de {visibleCards.length}
                    </span>
                    <div className="progress-track">
                      <div
                        style={{
                          width:
                            `${((cardIndex % visibleCards.length + 1) /
                              visibleCards.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <button
                    className={`flashcard ${flipped ? 'flipped' : ''}`}
                    onClick={() => setFlipped(f => !f)}
                  >
                    <div className="flash-topline">
                      <span className={`tag-axis ${currentCard[0]}`}>
                        {axes.find(a => a.id === currentCard[0])?.name}
                      </span>
                      <span>{flipped ? 'RESPOSTA' : 'PERGUNTA'}</span>
                    </div>
                    <div className="flash-content">
                      {flipped ? (
                        <>
                          <div className="answer-check">
                            <CheckCircle2 size={24} />
                          </div>
                          <p>{currentCard[2]}</p>
                        </>
                      ) : (
                        <>
                          <div className="question-mark">?</div>
                          <h2>{currentCard[1]}</h2>
                        </>
                      )}
                      <div className="flip-hint">
                        <RotateCcw size={15} />
                        {flipped
                          ? 'Clique para ver a pergunta'
                          : 'Clique para revelar a resposta'}
                      </div>
                    </div>
                  </button>

                  <div className="flash-controls">
                    <button
                      className="btn secondary"
                      onClick={() => {
                        setCardIndex(
                          i => (i - 1 + visibleCards.length) %
                            visibleCards.length
                        );
                        setFlipped(false);
                      }}
                    >
                      <ChevronLeft size={17} /> Anterior
                    </button>
                    <button
                      className="btn ghost"
                      onClick={() => {
                        setCardIndex(
                          Math.floor(Math.random() * visibleCards.length)
                        );
                        setFlipped(false);
                      }}
                    >
                      <Shuffle size={16} /> Aleatório
                    </button>
                    <button
                      className="btn primary"
                      onClick={() => {
                        setCardIndex(
                          i => (i + 1) % visibleCards.length
                        );
                        setFlipped(false);
                      }}
                    >
                      Próximo <ChevronRight size={17} />
                    </button>
                  </div>
                </div>

                <aside className="flash-aside">
                  <div className="aside-box">
                    <div className="aside-title">
                      <Brain size={17} />
                      <h3>Revisão eficiente</h3>
                    </div>
                    <p className="aside-copy">
                      Explique o conceito com suas próprias palavras antes
                      de conferir.
                    </p>
                    <div className="mini-rule">
                      <span>1</span>
                      <p>
                        <b>Recupere</b>
                        <small>Responda sem consultar.</small>
                      </p>
                    </div>
                    <div className="mini-rule">
                      <span>2</span>
                      <p>
                        <b>Confira</b>
                        <small>Compare com a resposta.</small>
                      </p>
                    </div>
                    <div className="mini-rule">
                      <span>3</span>
                      <p>
                        <b>Repita</b>
                        <small>Volte aos cartões difíceis.</small>
                      </p>
                    </div>
                  </div>

                  <div className="aside-box">
                    <div className="aside-title">
                      <Bookmark size={17} />
                      <h3>Atalhos por eixo</h3>
                    </div>
                    {axes.map(a => (
                      <button
                        className="shortcut"
                        key={a.id}
                        onClick={() => chooseAxis(a.id)}
                      >
                        <span
                          className="axis-dot"
                          style={{ background: a.color }}
                        />
                        {a.name}
                        <span>
                          {cards.filter(c => c[0] === a.id).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </aside>
              </div>
            )}
          </section>
        )}

        {view === 'quiz' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">AVALIAÇÃO FORMATIVA</div>
                <h1>Simulados</h1>
                <p>
                  Questões de múltipla escolha com explicação da alternativa
                  correta.
                </p>
              </div>
              <div className="counter-pill">
                <Clock3 size={15} />
                {finished
                  ? 'Finalizado'
                  : `${quizIndex + 1} de ${quiz.length}`}
              </div>
            </div>

            <div className="filter-tabs">
              {[
                ['all', 'Todos os eixos'],
                ...axes.map(a => [a.id, a.name])
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={quizAxis === id ? 'tab active' : 'tab'}
                  onClick={() => startQuiz(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {!finished && q ? (
              <div className="quiz-layout">
                <div className="quiz-main">
                  <div className="quiz-progress">
                    <div className="quiz-progress-top">
                      <span>QUESTÃO {quizIndex + 1}</span>
                      <span>
                        {quiz.filter(
                          x => answers[x.id] !== undefined
                        ).length} respondidas
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        style={{
                          width:
                            `${((quizIndex + 1) / quiz.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="question-panel">
                    <div className="question-meta">
                      <span className={`tag-axis ${q.axis}`}>
                        {axes.find(a => a.id === q.axis)?.name}
                      </span>
                      <span>Escolha uma alternativa</span>
                    </div>
                    <h2>{q.q}</h2>

                    <div className="options-list">
                      {q.opts.map((opt, i) => {
                        const selected = answers[q.id] === i;
                        const revealed = answers[q.id] !== undefined;

                        return (
                          <button
                            key={opt}
                            disabled={revealed}
                            className={`option ${selected ? 'selected' : ''} ${revealed && i === q.correct ? 'correct' : ''} ${revealed && selected && i !== q.correct ? 'incorrect' : ''}`}
                            onClick={() =>
                              setAnswers(a => ({ ...a, [q.id]: i }))
                            }
                          >
                            <span className="option-letter">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{opt}</span>
                            {revealed && i === q.correct &&
                              <CheckCircle2 size={18} />}
                            {revealed && selected && i !== q.correct &&
                              <X size={18} />}
                          </button>
                        );
                      })}
                    </div>

                    {answers[q.id] !== undefined && (
                      <div
                        className={`explanation ${answers[q.id] === q.correct ? 'good' : 'bad'}`}
                      >
                        <div className="explanation-icon">
                          {answers[q.id] === q.correct
                            ? <CheckCircle2 size={18} />
                            : <Activity size={18} />}
                        </div>
                        <div>
                          <b>
                            {answers[q.id] === q.correct
                              ? 'Resposta correta'
                              : 'Revise este conceito'}
                          </b>
                          <p>{q.why}</p>
                        </div>
                      </div>
                    )}

                    <div className="question-footer">
                      <button
                        className="btn secondary"
                        disabled={quizIndex === 0}
                        onClick={() => setQuizIndex(i => i - 1)}
                      >
                        <ChevronLeft size={16} /> Anterior
                      </button>
                      {quizIndex < quiz.length - 1 ? (
                        <button
                          className="btn primary"
                          disabled={answers[q.id] === undefined}
                          onClick={() => setQuizIndex(i => i + 1)}
                        >
                          Próxima questão <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button
                          className="btn primary"
                          disabled={answers[q.id] === undefined}
                          onClick={() => setFinished(true)}
                        >
                          Ver resultado <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="quiz-aside">
                  <div className="aside-box score-box">
                    <div className="score-circle">
                      <span>
                        {Math.round(
                          (quiz.filter(
                            x => answers[x.id] !== undefined
                          ).length / quiz.length) * 100
                        )}%
                      </span>
                    </div>
                    <h3>Seu progresso</h3>
                    <p>
                      Acompanhe seu desempenho neste simulado.
                    </p>
                    <div className="score-row">
                      <span>Respondidas</span>
                      <b>
                        {quiz.filter(
                          x => answers[x.id] !== undefined
                        ).length}/{quiz.length}
                      </b>
                    </div>
                    <div className="score-row">
                      <span>Corretas até agora</span>
                      <b>
                        {quiz.filter(
                          x => answers[x.id] === x.correct
                        ).length}
                      </b>
                    </div>
                  </div>

                  <div className="aside-box">
                    <div className="aside-title">
                      <ClipboardList size={17} />
                      <h3>Questões</h3>
                    </div>
                    <div className="question-numbers">
                      {quiz.map((x, i) => (
                        <button
                          key={x.id}
                          onClick={() => setQuizIndex(i)}
                          className={`${i === quizIndex ? 'current' : ''} ${answers[x.id] !== undefined ? 'done' : ''}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      className="btn secondary full"
                      onClick={() => {
                        setAnswers({});
                        setQuizIndex(0);
                        setFinished(false);
                      }}
                    >
                      <RotateCcw size={15} /> Reiniciar simulado
                    </button>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="result-panel">
                <div className="result-icon">
                  <GraduationCap size={27} />
                </div>
                <div className="eyebrow">RESULTADO DO SIMULADO</div>
                <h2>
                  {quiz.filter(
                    x => answers[x.id] === x.correct
                  ).length} de {quiz.length} acertos
                </h2>
                <p>
                  Você acertou{' '}
                  {Math.round(
                    quiz.filter(x => answers[x.id] === x.correct).length /
                    quiz.length * 100
                  )}% das questões. Revise as justificativas e refaça
                  as questões para consolidar o aprendizado.
                </p>

                <div className="result-stats">
                  <div>
                    <strong>
                      {quiz.filter(
                        x => answers[x.id] === x.correct
                      ).length}
                    </strong>
                    <span>Corretas</span>
                  </div>
                  <div>
                    <strong>
                      {quiz.filter(
                        x => answers[x.id] !== undefined &&
                          answers[x.id] !== x.correct
                      ).length}
                    </strong>
                    <span>Incorretas</span>
                  </div>
                  <div>
                    <strong>
                      {quiz.filter(
                        x => answers[x.id] === undefined
                      ).length}
                    </strong>
                    <span>Em branco</span>
                  </div>
                </div>

                <div className="result-actions">
                  <button
                    className="btn primary"
                    onClick={() => startQuiz(quizAxis)}
                  >
                    <RotateCcw size={16} /> Refazer simulado
                  </button>
                  <button
                    className="btn secondary"
                    onClick={() => nav('flashcards')}
                  >
                    <Layers size={16} /> Revisar flashcards
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => nav('home')}
                  >
                    Voltar ao início
                  </button>
                </div>

                <div className="review-answers">
                  <h3>Revisão das respostas</h3>
                  {quiz.map((x, i) => (
                    <div className="review-row" key={x.id}>
                      <span
                        className={
                          answers[x.id] === x.correct
                            ? 'review-correct'
                            : 'review-wrong'
                        }
                      >
                        {answers[x.id] === x.correct ? '✓' : '!'}
                      </span>
                      <div>
                        <b>{i + 1}. {x.q}</b>
                        <p>
                          Correta: {x.opts[x.correct]} — {x.why}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {view === 'explore' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">MAPA DE CONTEÚDOS</div>
                <h1>Explore por tópico</h1>
                <p>
                  Selecione um assunto para começar sua revisão.
                </p>
              </div>
            </div>

            <div className="filter-tabs">
              {[
                ['all', 'Todos os eixos'],
                ...axes.map(a => [a.id, a.name])
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={axis === id ? 'tab active' : 'tab'}
                  onClick={() => chooseAxis(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="topic-grid">
              {axes
                .filter(a => axis === 'all' || a.id === axis)
                .map(a => (
                  <div className="topic-group" key={a.id}>
                    <div className="topic-group-head">
                      <span
                        className="axis-dot"
                        style={{ background: a.color }}
                      />
                      <div>
                        <h3>{a.name}</h3>
                        <p>{a.desc}</p>
                      </div>
                    </div>

                    {topics[a.id].map((t, i) => (
                      <button
                        className="topic-row"
                        key={t}
                        onClick={() => setTopic(t)}
                      >
                        <span>{String(i + 1).padStart(2, '0')}</span>
                        <b>{t}</b>
                        <ArrowUpRight size={15} />
                      </button>
                    ))}

                    <button
                      className="topic-open"
                      onClick={() => {
                        chooseAxis(a.id);
                        nav('flashcards');
                      }}
                    >
                      Revisar flashcards deste eixo
                      <ChevronRight size={15} />
                    </button>
                  </div>
                ))}
            </div>

            {topic && (
              <div className="aside-box" style={{ marginTop: 24 }}>
                <div className="eyebrow">TÓPICO SELECIONADO</div>
                <h2>{topic}</h2>
                <p>
                  Use os flashcards do eixo correspondente para revisar
                  este assunto.
                </p>
                <button
                  className="btn primary"
                  onClick={() => {
                    nav('flashcards');
                    setCardIndex(0);
                    setFlipped(false);
                  }}
                >
                  Estudar flashcards <ChevronRight size={16} />
                </button>
              </div>
            )}
          </section>
        )}

        {/* NOVA ABA: BIBLIOTECA DE IMAGENS */}
        {view === 'images' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">ACERVO VISUAL</div>
                <h1>Biblioteca de Imagens</h1>
                <p>
                  Consulte imagens e esquemas para apoiar a revisão dos
                  conteúdos de Imunologia e Imuno-Hematologia.
                </p>
              </div>
              <div className="counter-pill">
                <Microscope size={15} />
                {Object.values(libraryImages).reduce(
                  (total, list) => total + list.length,
                  0
                )} imagens
              </div>
            </div>

            <div className="filter-tabs">
              {[
                ['p1', 'Imunologia P1'],
                ['p2', 'Imunologia P2'],
                ['hemato', 'Imuno-Hemato']
              ].map(([id, label]) => (
                <button
                  key={id}
                  className={imageAxis === id ? 'tab active' : 'tab'}
                  onClick={() => setImageAxis(id)}
                >
                  {label}
                  {' '}
                  <span>
                    ({libraryImages[id].length})
                  </span>
                </button>
              ))}
            </div>

            {libraryLoading && (
              <div
                className="aside-box"
                style={{ marginTop: 24, padding: 28 }}
              >
                <div className="aside-title">
                  <Microscope size={20} />
                  <h3>Carregando biblioteca...</h3>
                </div>
                <p>
                  Estamos buscando as imagens armazenadas no repositório.
                </p>
              </div>
            )}

            {!libraryLoading && libraryError && (
              <div
                className="aside-box"
                style={{ marginTop: 24, padding: 28 }}
              >
                <div className="aside-title">
                  <ShieldCheck size={20} />
                  <h3>Não foi possível carregar as imagens</h3>
                </div>
                <p>{libraryError}</p>
                <p>
                  Confirme se os arquivos estão dentro de
                  {' '}<code>public/biblioteca</code> no repositório
                  <code> imuno-lab</code> e se o repositório está público.
                </p>
                <button
                  className="btn primary"
                  onClick={retryLibrary}
                >
                  <RotateCcw size={16} /> Tentar novamente
                </button>
              </div>
            )}

            {!libraryLoading && !libraryError && (
              <>
                <div
                  className="section-head"
                  style={{ marginTop: 28 }}
                >
                  <div>
                    <div className="eyebrow">EIXO SELECIONADO</div>
                    <h2>{axes.find(a => a.id === imageAxis)?.name}</h2>
                    <p>
                      {axes.find(a => a.id === imageAxis)?.desc}
                      {' · '}
                      {libraryImages[imageAxis].length}
                      {' '}
                      {libraryImages[imageAxis].length === 1
                        ? 'imagem encontrada'
                        : 'imagens encontradas'}
                    </p>
                  </div>
                </div>

                {libraryImages[imageAxis].length === 0 ? (
                  <div
                    className="aside-box"
                    style={{ marginTop: 20, padding: 28 }}
                  >
                    <div className="aside-title">
                      <FolderOpen size={20} />
                      <h3>Nenhuma imagem encontrada</h3>
                    </div>
                    <p>
                      Não encontramos imagens nesta pasta. Confira se os
                      arquivos foram enviados para:
                    </p>
                    <p>
                      <code>
                        ImunoLab_Completo/public/biblioteca/
                        {imageFolders[imageAxis]}/
                      </code>
                    </p>
                    <button
                      className="btn secondary"
                      onClick={retryLibrary}
                    >
                      <RotateCcw size={16} /> Atualizar biblioteca
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                      gap: 20,
                      marginTop: 20
                    }}
                  >
                    {libraryImages[imageAxis].map((img, index) => (
                      <article
                        className="feature-panel"
                        key={img.url || img.name}
                        style={{
                          display: 'block',
                          padding: 14,
                          minWidth: 0
                        }}
                      >
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir imagem em tamanho original"
                          style={{
                            display: 'block',
                            cursor: 'zoom-in'
                          }}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            loading="lazy"
                            style={{
                              display: 'block',
                              width: '100%',
                              height: 230,
                              objectFit: 'contain',
                              background: '#fff',
                              borderRadius: 10
                            }}
                          />
                        </a>

                        <p
                          style={{
                            marginTop: 12,
                            marginBottom: 0,
                            overflowWrap: 'anywhere',
                            fontSize: 13,
                            lineHeight: 1.5
                          }}
                        >
                          {index + 1}. {img.name}
                        </p>

                        <a
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            marginTop: 10,
                            fontSize: 13,
                            textDecoration: 'none'
                          }}
                        >
                          Ver imagem <ExternalLink size={14} />
                        </a>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {view === 'satisfaction' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">SUA OPINIÃO É IMPORTANTE</div>
                <h1>Pesquisa de Satisfação Institucional</h1>
                <p>
                  Ajude a avaliar a monitoria e a melhorar continuamente
                  os recursos educacionais do ImunoLab.
                </p>
              </div>
            </div>

            <div
              className="feature-panel"
              style={{ display: 'block', padding: 28 }}
            >
              <div
                className="feature-icon teal-bg"
                style={{ marginBottom: 18 }}
              >
                <MessageSquare size={22} />
              </div>
              <h2>Queremos ouvir você!</h2>
              <p>
                Sua participação é importante para identificarmos pontos
                fortes e oportunidades de melhoria na monitoria.
              </p>
              <p>
                Toque no botão abaixo para responder ao formulário
                institucional.
              </p>
              <a
                className="btn primary"
                href={FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  textDecoration: 'none',
                  marginTop: 12
                }}
              >
                Responder à pesquisa <ExternalLink size={16} />
              </a>
            </div>
          </section>
        )}

        {view === 'alternative' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">MATERIAL COMPLEMENTAR</div>
                <h1>Complemento — Via Alternativa</h1>
                <p>
                  Assista ao vídeo complementar sobre a via alternativa
                  do sistema complemento.
                </p>
              </div>
            </div>

            <div
              className="feature-panel"
              style={{ display: 'block', padding: 20 }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  overflow: 'hidden',
                  borderRadius: 12,
                  background: '#101522'
                }}
              >
                <iframe
                  src={VIDEO_URL}
                  title="Complemento — Via Alternativa"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 0
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p style={{ marginTop: 16 }}>
                Se o vídeo não carregar, você pode abri-lo diretamente
                no YouTube.
              </p>
              <a
                className="btn secondary"
                href="https://www.youtube.com/watch?v=0J59CxIrZhM"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  textDecoration: 'none'
                }}
              >
                Assistir no YouTube <ExternalLink size={16} />
              </a>
            </div>
          </section>
        )}

        {view === 'drive' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">ARQUIVOS COMPARTILHADOS</div>
                <h1>Drive da Turma</h1>
                <p>
                  Acesse a pasta compartilhada para consultar os arquivos
                  disponibilizados pela monitoria e acompanhar os novos
                  materiais.
                </p>
              </div>
            </div>

            <div
              className="feature-panel"
              style={{ display: 'block', padding: 28 }}
            >
              <div
                className="feature-icon teal-bg"
                style={{ marginBottom: 18 }}
              >
                <FolderOpen size={24} />
              </div>
              <h2>Materiais da turma</h2>
              <p>
                Reunimos nesta pasta os arquivos complementares e os
                materiais que forem sendo adicionados ao longo da monitoria.
              </p>
              <p>
                Toque no botão abaixo para abrir o Google Drive e consultar
                os documentos disponíveis.
              </p>
              <a
                className="btn primary"
                href={DRIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  textDecoration: 'none',
                  marginTop: 12
                }}
              >
                Abrir Drive da Turma <ExternalLink size={16} />
              </a>
            </div>
          </section>
        )}

        <footer className="footer">
          <span>© ImunoLab · Monitoria de Imunologia</span>
          <span>
            Feito para estudar melhor
            <span className="footer-heart"> ✳</span>
          </span>
        </footer>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
