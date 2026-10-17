import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, Brain, CheckCircle2, ChevronLeft,
  ChevronRight, ClipboardList, Clock3,
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

const NOTEBOOK_FLASHCARDS = [
  {
    title: 'Imunologia P1',
    description: 'Acesse o primeiro conjunto de flashcards no NotebookLM.',
    url: 'https://notebooklm.link.google/0bQkVL56rqRW',
    color: '#64d8c5'
  },
  {
    title: 'Imunologia P2',
    description: 'Acesse o segundo conjunto de flashcards no NotebookLM.',
    url: 'https://notebooklm.link.google/OgqkejAOkrqb',
    color: '#a69aff'
  },
  {
    title: 'Imuno-Hemato',
    description: 'Acesse o terceiro conjunto de flashcards no NotebookLM.',
    url: 'https://notebooklm.link.google/SPDW2gOtHg2J',
    color: '#ffab8a'
  }
];

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
  };

  const chooseAxis = (id) => {
    setAxis(id);
    setCardIndex(0);
    setFlipped(false);
  };

  const startQuiz = (a = 'all') => {
    setQuizAxis(a);
    setQuizIndex(0);
    setAnswers({});
    setFinished(false);
    nav('quiz');
  };

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

    window.setTimeout(() => {
      setView('images');
    }, 0);
  };

  const headings = {
    home: 'Visão geral',
    flashcards: 'Flashcards',
    quiz: 'Simulados',
    images: 'Biblioteca de Imagens',
    satisfaction: 'Pesquisa de Satisfação Institucional',
    alternative: 'Complemento — Via Alternativa',
    drive: 'Drive da Turma'
  };

  const navItems = [
    ['home', Home, 'Visão geral'],
    ['flashcards', Layers, 'Flashcards'],
    ['quiz', ClipboardList, 'Simulados'],
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

            {/* Flashcards externos do NotebookLM */}
            <div className="notebook-section">
              <div className="notebook-heading">
                <div>
                  <div className="eyebrow">MATERIAIS COMPLEMENTARES</div>
                  <h2>Flashcards no NotebookLM</h2>
                  <p>
                    Acesse os conjuntos de cartões para revisar os conteúdos
                    de Imunologia.
                  </p>
                </div>
                <ExternalLink size={20} />
              </div>

              <div className="notebook-grid">
                {NOTEBOOK_FLASHCARDS.map((item, index) => (
                  <article className="notebook-card" key={item.url}>
                    <div
                      className="notebook-card-icon"
                      style={{
                        color: item.color,
                        background: `${item.color}18`
                      }}
                    >
                      <Layers size={22} />
                    </div>

                    <span className="notebook-number">
                      MATERIAL 0{index + 1}
                    </span>

                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <a
                      className="btn secondary notebook-link"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir flashcards <ExternalLink size={15} />
                    </a>
                  </article>
                ))}
              </div>
            </div>

            {/* Sistema de flashcards original — mantido */}
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
                    <div className="progress
