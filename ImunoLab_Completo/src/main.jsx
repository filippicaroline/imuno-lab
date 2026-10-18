
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, BookOpen, Brain, CheckCircle2, ChevronLeft,
  ChevronRight, ClipboardList, Clock3, GraduationCap,
  HeartPulse, Home, Layers, Menu, Microscope, ShieldCheck, Droplets,
  Shuffle, Target, X, ArrowUpRight, RotateCcw, Bookmark,
  ExternalLink, PlayCircle, MessageSquare, FolderOpen, Images,
  ZoomIn, Image as ImageIcon
} from 'lucide-react';
import studyBank from './studyBank.json';
import './styles.css';

const FORM_URL = 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=w_YeiiSDA0G_ShMoxdw2U3et3sbX1jFFrJYR6Yrgy4VUQUpRNDk0UEpHWFE0RVU0WEs3TDVSVkkyVS4u';
const VIDEO_URL = 'https://www.youtube.com/embed/0J59CxIrZhM';
const DRIVE_URL = 'https://drive.google.com/drive/folders/17_nMqeLzmExhUY-maLjUX8f6feIg3Sug';

const GITHUB_API = 'https://api.github.com/repos/filippicaroline/imuno-lab/contents/ImunoLab_Completo/public/biblioteca';

const imageCategories = [
  { id: 'p1', name: 'Imunologia P1', folder: 'Imunologia P1', color: '#64d8c5' },
  { id: 'p2', name: 'Imunologia P2', folder: 'Imunologia P2', color: '#9d91ff' },
  { id: 'hemato', name: 'Imuno-Hemato', folder: 'ImunoHemato', color: '#ff9b78' }
];

const notebookLinks = [
  {
    id: 'p1',
    title: 'Imunologia P1',
    description: 'Flashcards de Imunologia — P1',
    url: 'https://notebooklm.link.google/HSdT59RStKbw',
    color: '#64d8c5',
    icon: ShieldCheck
  },
  {
    id: 'p2',
    title: 'Imunologia P2',
    description: 'Flashcards de Imunologia — P2',
    url: 'https://notebook.google.com/notebook/94dece78-a01a-4496-ba66-9aa4d63d5e53/artifact/2288d47c-b299-4307-9ae1-ce72d369685d',
    color: '#9d91ff',
    icon: Brain
  },
  {
    id: 'hemato',
    title: 'Imuno-Hemato',
    description: 'Flashcards de Imunologia e Hematologia',
    url: 'https://notebook.google.com/notebook/94dece78-a01a-4496-ba66-9aa4d63d5e53/artifact/8eb31abc-9e4a-4a97-b316-b26f8a75653a',
    color: '#ff9b78',
    icon: HeartPulse
  }
];

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

  // Biblioteca de Imagens
  const [imageCategory, setImageCategory] = useState('p1');
  const [imageFiles, setImageFiles] = useState({});
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError, setImagesError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

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

  // Carrega as imagens das três pastas do repositório público.
  useEffect(() => {
    if (view !== 'images') return;

    let cancelled = false;

    async function loadImages() {
      setImagesLoading(true);
      setImagesError('');

      try {
        const results = await Promise.all(
          imageCategories.map(async (category) => {
            const url = `${GITHUB_API}/${encodeURIComponent(category.folder)}`;
            const response = await fetch(url);

            if (!response.ok) {
              throw new Error(
                `Não foi possível acessar a pasta ${category.name}.`
              );
            }

            const files = await response.json();

            const validImages = files
              .filter(file =>
                file.type === 'file' &&
                /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(file.name)
              )
              .map(file => ({
                name: file.name,
                url: `/biblioteca/${encodeURIComponent(category.folder)}/${encodeURIComponent(file.name)}`,
                category: category.name,
                id: `${category.id}-${file.name}`
              }));

            return [category.id, validImages];
          })
        );

        if (!cancelled) {
          setImageFiles(Object.fromEntries(results));
        }
      } catch (error) {
        if (!cancelled) {
          setImagesError(
            'Não foi possível carregar a biblioteca. Verifique sua conexão e tente novamente.'
          );
        }
      } finally {
        if (!cancelled) setImagesLoading(false);
      }
    }

    loadImages();

    return () => {
      cancelled = true;
    };
  }, [view]);

  const visibleImages = imageFiles[imageCategory] || [];

  const headings = {
    home: 'Visão geral',
    flashcards: 'Flashcards',
    quiz: 'Simulados',
    satisfaction: 'Pesquisa de Satisfação Institucional',
    alternative: 'Complemento — Via Alternativa',
    drive: 'Drive da Turma',
    images: 'Biblioteca de Imagens',
    fenotipagem: 'Fenotipagem ABO/Rh',
    chagas: 'Sorologia de Chagas'
  };

  const navItems = [
    ['home', Home, 'Visão geral'],
    ['flashcards', Layers, 'Flashcards'],
    ['quiz', ClipboardList, 'Simulados'],
    ['images', Images, 'Biblioteca de Imagens'],
    ['fenotipagem', Droplets, 'Fenotipagem ABO/Rh'],
    ['chagas', Microscope, 'Sorologia de Chagas'],
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
            aria-label="Fechar menu"
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
            aria-label="Abrir menu"
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

        {/* VISÃO GERAL */}
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
                  <button className="btn primary" onClick={() => nav('flashcards')}>
                    <BookOpen size={17} /> Estudar flashcards
                  </button>

                  <button className="btn ghost" onClick={() => startQuiz('all')}>
                    <Target size={17} /> Fazer um simulado
                    <ChevronRight size={16} />
                  </button>

                  <button className="btn secondary" onClick={() => nav('images')}>
                    <Images size={17} /> Biblioteca de imagens
                  </button>
                </div>

                <div className="hero-meta">
                  <span><CheckCircle2 size={14} /> 3 eixos de estudo</span>
                  <span><ShieldCheck size={14} /> Sem cadastro</span>
                  <span><Clock3 size={14} /> No seu ritmo</span>
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
                <div className="stat-icon teal-bg"><Layers size={19} /></div>
                <div><strong>{cards.length}</strong><span>flashcards</span></div>
                <small>revisão ativa</small>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple-bg"><ClipboardList size={19} /></div>
                <div><strong>{questions.length}</strong><span>questões</span></div>
                <small>com justificativas</small>
              </div>
              <div className="stat-card">
                <div className="stat-icon orange-bg"><Activity size={19} /></div>
                <div><strong>3</strong><span>eixos integrados</span></div>
                <small>estudo organizado</small>
              </div>
            </div>

            <div className="section-head home-section-head">
              <div>
                <div className="eyebrow">TRILHAS DE APRENDIZAGEM</div>
                <h2>Escolha seu eixo</h2>
                <p>Selecione um eixo para revisar os conteúdos com flashcards.</p>
              </div>
              <button className="text-link" onClick={() => nav('flashcards')}>
                Ver flashcards <ArrowUpRight size={16} />
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
                        style={{ color: a.color, background: a.color + '16' }}
                      >
                        <Icon size={21} />
                      </div>
                      <span className="axis-number">0{i + 1}</span>
                    </div>
                    <h3>{a.name}</h3>
                    <p>{a.desc}. Revise os principais conceitos com cartões de estudo.</p>
                    <div className="axis-card-meta">
                      <span><Layers size={14} /> {cards.filter(c => c[0] === a.id).length} cards</span>
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
                <div className="feature-icon purple-bg"><Layers size={20} /></div>
                <div className="feature-copy">
                  <div className="eyebrow">REVISÃO ATIVA</div>
                  <h3>Fixe o conteúdo com flashcards</h3>
                  <p>Recupere a informação antes de revelar a resposta.</p>
                  <button className="btn secondary" onClick={() => nav('flashcards')}>
                    Estudar flashcards <ChevronRight size={16} />
                  </button>
                </div>
                <div className="mini-cards">
                  <div className="mini-card mini-back">Fc</div>
                  <div className="mini-card mini-front">Ag</div>
                </div>
              </article>

              <article className="feature-panel quiz-feature">
                <div className="feature-icon orange-bg"><Target size={20} /></div>
                <div className="feature-copy">
                  <div className="eyebrow">PRATIQUE E AVALIE</div>
                  <h3>Simulados com feedback</h3>
                  <p>Questões de múltipla escolha com justificativas.</p>
                  <button className="btn secondary" onClick={() => startQuiz('all')}>
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
                <b>Material educacional.</b> Confirme conceitos clínicos
                e condutas em bibliografia e diretrizes atualizadas.
              </p>
            </div>
          </section>
        )}

        {/* FLASHCARDS */}
        {view === 'flashcards' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">ACTIVE RECALL</div>
                <h1>Flashcards</h1>
                <p>
                  Escolha um conjunto de cartões do NotebookLM ou revise
                  os flashcards disponíveis na plataforma.
                </p>
              </div>
              <div className="counter-pill">
                <Layers size={15} /> {visibleCards.length} cartões locais
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <div className="section-head">
                <div>
                  <div className="eyebrow">NOTEBOOKLM</div>
                  <h2>Flashcards por eixo</h2>
                  <p>Acesse os materiais externos de cada eixo de estudo.</p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
                gap: 18
              }}>
                {notebookLinks.map(notebook => {
                  const Icon = notebook.icon;
                  return (
                    <a
                      key={notebook.id}
                      href={notebook.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="axis-card"
                      style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                    >
                      <div className="axis-card-top">
                        <div className="axis-symbol" style={{
                          color: notebook.color,
                          background: notebook.color + '16'
                        }}>
                          <Icon size={21} />
                        </div>
                        <ExternalLink size={17} />
                      </div>
                      <h3>{notebook.title}</h3>
                      <p>{notebook.description}</p>
                      <div className="card-open" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        Acessar flashcards <ArrowUpRight size={16} />
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="section-head">
              <div>
                <div className="eyebrow">REVISÃO NA PLATAFORMA</div>
                <h2>Flashcards locais</h2>
                <p>Responda mentalmente antes de virar o cartão.</p>
              </div>
            </div>

            <div className="filter-tabs">
              {[['all', 'Todos os eixos'], ...axes.map(a => [a.id, a.name])].map(([id, label]) => (
                <button key={id} className={axis === id ? 'tab active' : 'tab'} onClick={() => chooseAxis(id)}>
                  {label}
                </button>
              ))}
            </div>

            {currentCard ? (
              <div className="flash-layout">
                <div className="flash-main">
                  <div className="flash-progress">
                    <span>Cartão {cardIndex % visibleCards.length + 1} de {visibleCards.length}</span>
                    <div className="progress-track">
                      <div style={{ width: `${((cardIndex % visibleCards.length + 1) / visibleCards.length) * 100}%` }} />
                    </div>
                  </div>

                  <button className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
                    <div className="flash-topline">
                      <span className={`tag-axis ${currentCard[0]}`}>
                        {axes.find(a => a.id === currentCard[0])?.name}
                      </span>
                      <span>{flipped ? 'RESPOSTA' : 'PERGUNTA'}</span>
                    </div>
                    <div className="flash-content">
                      {flipped ? (
                        <>
                          <div className="answer-check"><CheckCircle2 size={24} /></div>
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
                        {flipped ? 'Clique para ver a pergunta' : 'Clique para revelar a resposta'}
                      </div>
                    </div>
                  </button>

                  <div className="flash-controls">
                    <button className="btn secondary" onClick={() => {
                      setCardIndex(i => (i - 1 + visibleCards.length) % visibleCards.length);
                      setFlipped(false);
                    }}>
                      <ChevronLeft size={17} /> Anterior
                    </button>
                    <button className="btn ghost" onClick={() => {
                      setCardIndex(Math.floor(Math.random() * visibleCards.length));
                      setFlipped(false);
                    }}>
                      <Shuffle size={16} /> Aleatório
                    </button>
                    <button className="btn primary" onClick={() => {
                      setCardIndex(i => (i + 1) % visibleCards.length);
                      setFlipped(false);
                    }}>
                      Próximo <ChevronRight size={17} />
                    </button>
                  </div>
                </div>

                <aside className="flash-aside">
                  <div className="aside-box">
                    <div className="aside-title"><Brain size={17} /><h3>Revisão eficiente</h3></div>
                    <p className="aside-copy">Explique o conceito com suas próprias palavras antes de conferir.</p>
                    {[
                      ['1', 'Recupere', 'Responda sem consultar.'],
                      ['2', 'Confira', 'Compare com a resposta.'],
                      ['3', 'Repita', 'Volte aos cartões difíceis.']
                    ].map(([n, title, desc]) => (
                      <div className="mini-rule" key={n}>
                        <span>{n}</span><p><b>{title}</b><small>{desc}</small></p>
                      </div>
                    ))}
                  </div>

                  <div className="aside-box">
                    <div className="aside-title"><Bookmark size={17} /><h3>Atalhos por eixo</h3></div>
                    {axes.map(a => (
                      <button className="shortcut" key={a.id} onClick={() => chooseAxis(a.id)}>
                        <span className="axis-dot" style={{ background: a.color }} />
                        {a.name}
                        <span>{cards.filter(c => c[0] === a.id).length}</span>
                      </button>
                    ))}
                  </div>
                </aside>
              </div>
            ) : (
              <div className="aside-box">
                <h3>Nenhum flashcard disponível neste eixo</h3>
                <p>Selecione outro eixo ou escolha “Todos os eixos”.</p>
                <button className="btn secondary" onClick={() => chooseAxis('all')}>Ver todos os flashcards</button>
              </div>
            )}
          </section>
        )}

        {/* SIMULADOS */}
        {view === 'quiz' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">AVALIAÇÃO FORMATIVA</div>
                <h1>Simulados</h1>
                <p>Questões de múltipla escolha com explicação da alternativa correta.</p>
              </div>
              <div className="counter-pill">
                <Clock3 size={15} />
                {finished ? 'Finalizado' : `${quizIndex + 1} de ${quiz.length}`}
              </div>
            </div>

            <div className="filter-tabs">
              {[['all', 'Todos os eixos'], ...axes.map(a => [a.id, a.name])].map(([id, label]) => (
                <button key={id} className={quizAxis === id ? 'tab active' : 'tab'} onClick={() => startQuiz(id)}>
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
                      <span>{quiz.filter(x => answers[x.id] !== undefined).length} respondidas</span>
                    </div>
                    <div className="progress-track">
                      <div style={{ width: `${((quizIndex + 1) / quiz.length) * 100}%` }} />
                    </div>
                  </div>

                  <div className="question-panel">
                    <div className="question-meta">
                      <span className={`tag-axis ${q.axis}`}>{axes.find(a => a.id === q.axis)?.name}</span>
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
                            onClick={() => setAnswers(a => ({ ...a, [q.id]: i }))}
                          >
                            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                            <span>{opt}</span>
                            {revealed && i === q.correct && <CheckCircle2 size={18} />}
                            {revealed && selected && i !== q.correct && <X size={18} />}
                          </button>
                        );
                      })}
                    </div>

                    {answers[q.id] !== undefined && (
                      <div className={`explanation ${answers[q.id] === q.correct ? 'good' : 'bad'}`}>
                        <div className="explanation-icon">
                          {answers[q.id] === q.correct ? <CheckCircle2 size={18} /> : <Activity size={18} />}
                        </div>
                        <div>
                          <b>{answers[q.id] === q.correct ? 'Resposta correta' : 'Revise este conceito'}</b>
                          <p>{q.why}</p>
                        </div>
                      </div>
                    )}

                    <div className="question-footer">
                      <button className="btn secondary" disabled={quizIndex === 0} onClick={() => setQuizIndex(i => i - 1)}>
                        <ChevronLeft size={16} /> Anterior
                      </button>
                      {quizIndex < quiz.length - 1 ? (
                        <button className="btn primary" disabled={answers[q.id] === undefined} onClick={() => setQuizIndex(i => i + 1)}>
                          Próxima questão <ChevronRight size={16} />
                        </button>
                      ) : (
                        <button className="btn primary" disabled={answers[q.id] === undefined} onClick={() => setFinished(true)}>
                          Ver resultado <CheckCircle2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <aside className="quiz-aside">
                  <div className="aside-box score-box">
                    <div className="score-circle">
                      <span>{quiz.length ? Math.round((quiz.filter(x => answers[x.id] !== undefined).length / quiz.length) * 100) : 0}%</span>
                    </div>
                    <h3>Seu progresso</h3>
                    <p>Acompanhe seu desempenho neste simulado.</p>
                    <div className="score-row">
                      <span>Respondidas</span>
                      <b>{quiz.filter(x => answers[x.id] !== undefined).length}/{quiz.length}</b>
                    </div>
                    <div className="score-row">
                      <span>Corretas até agora</span>
                      <b>{quiz.filter(x => answers[x.id] === x.correct).length}</b>
                    </div>
                  </div>

                  <div className="aside-box">
                    <div className="aside-title"><ClipboardList size={17} /><h3>Questões</h3></div>
                    <div className="question-numbers">
                      {quiz.map((x, i) => (
                        <button key={x.id} onClick={() => setQuizIndex(i)} className={`${i === quizIndex ? 'current' : ''} ${answers[x.id] !== undefined ? 'done' : ''}`}>
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button className="btn secondary full" onClick={() => {
                      setAnswers({});
                      setQuizIndex(0);
                      setFinished(false);
                    }}>
                      <RotateCcw size={15} /> Reiniciar simulado
                    </button>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="result-panel">
                <div className="result-icon"><GraduationCap size={27} /></div>
                <div className="eyebrow">RESULTADO DO SIMULADO</div>
                <h2>{quiz.filter(x => answers[x.id] === x.correct).length} de {quiz.length} acertos</h2>
                <p>
                  Você acertou {quiz.length ? Math.round(quiz.filter(x => answers[x.id] === x.correct).length / quiz.length * 100) : 0}% das questões.
                  {' '}Revise as justificativas e refaça as questões para consolidar o aprendizado.
                </p>
                <div className="result-stats">
                  <div><strong>{quiz.filter(x => answers[x.id] === x.correct).length}</strong><span>Corretas</span></div>
                  <div><strong>{quiz.filter(x => answers[x.id] !== undefined && answers[x.id] !== x.correct).length}</strong><span>Incorretas</span></div>
                  <div><strong>{quiz.filter(x => answers[x.id] === undefined).length}</strong><span>Em branco</span></div>
                </div>
                <div className="result-actions">
                  <button className="btn primary" onClick={() => startQuiz(quizAxis)}><RotateCcw size={16} /> Refazer simulado</button>
                  <button className="btn secondary" onClick={() => nav('flashcards')}><Layers size={16} /> Revisar flashcards</button>
                  <button className="btn ghost" onClick={() => nav('home')}>Voltar ao início</button>
                </div>
                <div className="review-answers">
                  <h3>Revisão das respostas</h3>
                  {quiz.map((x, i) => (
                    <div className="review-row" key={x.id}>
                      <span className={answers[x.id] === x.correct ? 'review-correct' : 'review-wrong'}>
                        {answers[x.id] === x.correct ? '✓' : '!'}
                      </span>
                      <div>
                        <b>{i + 1}. {x.q}</b>
                        <p>Correta: {x.opts[x.correct]} — {x.why}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* BIBLIOTECA DE IMAGENS: SOMENTE TRÊS EIXOS */}
        {view === 'images' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">ACERVO VISUAL</div>
                <h1>Biblioteca de Imagens</h1>
                <p>
                  Explore as imagens separadas por eixo de estudo.
                  Selecione uma imagem para ampliá-la.
                </p>
              </div>
              <div className="counter-pill">
                <Images size={16} />
                {(imageFiles[imageCategory] || []).length} imagens
              </div>
            </div>

            <div className="filter-tabs" style={{ flexWrap: 'wrap', marginBottom: 24 }}>
              {imageCategories.map(category => (
                <button
                  key={category.id}
                  className={imageCategory === category.id ? 'tab active' : 'tab'}
                  onClick={() => setImageCategory(category.id)}
                >
                  {category.name}
                  {' '}({(imageFiles[category.id] || []).length})
                </button>
              ))}
            </div>

            {imagesLoading && (
              <div className="aside-box" style={{ textAlign: 'center', padding: 36 }}>
                <div className="eyebrow">CARREGANDO ACERVO</div>
                <p>Buscando as imagens no repositório do ImunoLab...</p>
              </div>
            )}

            {!imagesLoading && imagesError && (
              <div className="aside-box" style={{ padding: 24 }}>
                <h3>Não foi possível carregar as imagens</h3>
                <p>{imagesError}</p>
                <p>
                  Confira se as imagens estão no repositório público e se
                  a Vercel está publicando a pasta ImunoLab_Completo.
                </p>
                <button
                  className="btn primary"
                  onClick={() => {
                    setImageFiles({});
                    setImagesError('');
                    setView('home');
                    setTimeout(() => setView('images'), 0);
                  }}
                >
                  <RotateCcw size={16} /> Tentar novamente
                </button>
              </div>
            )}

            {!imagesLoading && !imagesError && visibleImages.length === 0 && (
              <div className="aside-box" style={{ textAlign: 'center', padding: 36 }}>
                <ImageIcon size={34} style={{ opacity: 0.55 }} />
                <h3>Nenhuma imagem encontrada</h3>
                <p>
                  Não foram encontrados arquivos de imagem nesta pasta.
                  Verifique se os arquivos estão dentro da pasta correspondente ao eixo.
                </p>
              </div>
            )}

            {!imagesLoading && !imagesError && visibleImages.length > 0 && (
              <>
                <div className="section-head">
                  <div>
                    <h2>{imageCategories.find(c => c.id === imageCategory)?.name}</h2>
                    <p>{visibleImages.length} arquivo(s) nesta categoria.</p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
                  gap: 18
                }}>
                  {visibleImages.map(image => (
                    <button
                      type="button"
                      key={image.id}
                      onClick={() => setSelectedImage(image)}
                      title={`Ampliar ${image.name}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'left',
                        padding: 10,
                        gap: 10,
                        minWidth: 0,
                        borderRadius: 14,
                        border: '1px solid var(--border, #e0e4eb)',
                        background: 'var(--surface, #fff)',
                        color: 'inherit',
                        cursor: 'pointer',
                        boxShadow: '0 3px 12px rgba(20,30,50,0.05)'
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: 180,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: 9,
                        background: '#f3f5f8'
                      }}>
                        <img
                          src={image.url}
                          alt={image.name}
                          loading="lazy"
                          onError={e => {
                            e.currentTarget.style.display = 'none';
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>

                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        overflowWrap: 'anywhere'
                      }}>
                        {image.name}
                      </span>

                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        color: imageCategories.find(c => c.id === imageCategory)?.color,
                        fontSize: 12
                      }}>
                        <ZoomIn size={14} /> Ampliar imagem
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* PESQUISA INSTITUCIONAL */}
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

            <div className="feature-panel" style={{ display: 'block', padding: 28 }}>
              <div className="feature-icon teal-bg" style={{ marginBottom: 18 }}>
                <MessageSquare size={22} />
              </div>
              <h2>Queremos ouvir você!</h2>
              <p>
                Sua participação é importante para identificarmos pontos
                fortes e oportunidades de melhoria na monitoria.
              </p>
              <p>Toque no botão abaixo para responder ao formulário institucional.</p>
              <a className="btn primary" href={FORM_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', textDecoration: 'none', marginTop: 12 }}>
                Responder à pesquisa <ExternalLink size={16} />
              </a>
            </div>
          </section>
        )}

        {/* VÍDEO COMPLEMENTAR */}
        {view === 'alternative' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">MATERIAL COMPLEMENTAR</div>
                <h1>Complemento — Via Alternativa</h1>
                <p>Assista ao vídeo complementar sobre a via alternativa do sistema complemento.</p>
              </div>
            </div>

            <div className="feature-panel" style={{ display: 'block', padding: 20 }}>
              <div style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16 / 9',
                overflow: 'hidden',
                borderRadius: 12,
                background: '#101522'
              }}>
                <iframe
                  src={VIDEO_URL}
                  title="Complemento — Via Alternativa"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <p style={{ marginTop: 16 }}>
                Se o vídeo não carregar, você pode abri-lo diretamente no YouTube.
              </p>
              <a className="btn secondary" href="https://www.youtube.com/watch?v=0J59CxIrZhM"
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Assistir no YouTube <ExternalLink size={16} />
              </a>
            </div>
          </section>
        )}

        {/* DRIVE DA TURMA */}
        {view === 'drive' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">ARQUIVOS COMPARTILHADOS</div>
                <h1>Drive da Turma</h1>
                <p>
                  Acesse a pasta compartilhada para consultar os arquivos
                  disponibilizados pela monitoria e acompanhar os novos materiais.
                </p>
              </div>
            </div>

            <div className="feature-panel" style={{ display: 'block', padding: 28 }}>
              <div className="feature-icon teal-bg" style={{ marginBottom: 18 }}>
                <FolderOpen size={24} />
              </div>
              <h2>Materiais da turma</h2>
              <p>
                Reunimos nesta pasta os arquivos complementares e os materiais
                que forem sendo adicionados ao longo da monitoria.
              </p>
              <p>
                Toque no botão abaixo para abrir o Google Drive e consultar os documentos disponíveis.
              </p>
              <a className="btn primary" href={DRIVE_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', textDecoration: 'none', marginTop: 12 }}>
                Abrir Drive da Turma <ExternalLink size={16} />
              </a>
            </div>
          </section>
        )}

        {/* SIMULADOR DE FENOTIPAGEM ABO/Rh */}
        {view === 'fenotipagem' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">PRÁTICA DE IMUNO-HEMATOLOGIA</div>
                <h1>Fenotipagem ABO/Rh</h1>
                <p>
                  Simule a tipagem sanguínea em lâmina com os reagentes anti-A,
                  anti-B e anti-D, observe a aglutinação e interprete o resultado.
                </p>
              </div>
            </div>

            <div
              style={{
                width: '100%',
                overflow: 'hidden',
                border: '1px solid var(--border, #283244)',
                borderRadius: 16,
                background: '#0b0f17'
              }}
            >
              <iframe
                src="/simulador_fenotipagem_abo_rh_dark.html"
                title="Simulador de Fenotipagem ABO e Rh"
                style={{
                  display: 'block',
                  width: '100%',
                  minHeight: '850px',
                  height: 'calc(100vh - 190px)',
                  border: 0
                }}
                loading="lazy"
              />
            </div>
          </section>
        )}

        {/* SIMULADOR DE SOROLOGIA DE CHAGAS */}
        {view === 'chagas' && (
          <section className="content-wrap">
            <div className="section-head">
              <div>
                <div className="eyebrow">PRÁTICA DE IMUNOLOGIA E PARASITOLOGIA</div>
                <h1>Sorologia de Chagas</h1>
                <p>
                  Simule a técnica de hemaglutinação indireta (HAI), acompanhe
                  as etapas do procedimento e interprete o resultado sorológico.
                </p>
              </div>
            </div>

            <div
              style={{
                width: '100%',
                overflow: 'hidden',
                border: '1px solid var(--border, #283244)',
                borderRadius: 16,
                background: 'var(--surface, #fff)'
              }}
            >
              <iframe
                src="/simulador_sorologia_chagas.html"
                title="Simulador de Sorologia de Chagas por Hemaglutinação Indireta"
                style={{
                  display: 'block',
                  width: '100%',
                  minHeight: '900px',
                  height: 'calc(100vh - 170px)',
                  border: 0
                }}
                loading="lazy"
              />
            </div>
          </section>
        )}

        <footer className="footer">
          <span>© ImunoLab · Monitoria de Imunologia</span>
          <span>Feito para estudar melhor <span className="footer-heart">✳</span></span>
        </footer>
      </main>

      {/* VISUALIZAÇÃO AMPLIADA DA IMAGEM */}
      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Imagem ampliada"
          onClick={() => setSelectedImage(null)}
          onKeyDown={e => {
            if (e.key === 'Escape') setSelectedImage(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            background: 'rgba(10, 15, 28, 0.88)'
          }}
        >
          <button
            type="button"
            aria-label="Fechar imagem"
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.35)',
              background: '#20283a',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            <X size={22} />
          </button>

          <div
            onClick={e => e.stopPropagation()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              width: '100%',
              maxWidth: 1100,
              maxHeight: '92vh'
            }}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              style={{
                maxWidth: '100%',
                maxHeight: '78vh',
                objectFit: 'contain',
                borderRadius: 8,
                background: '#fff'
              }}
            />

            <p style={{
              color: '#fff',
              textAlign: 'center',
              overflowWrap: 'anywhere',
              margin: 0
            }}>
              {selectedImage.name} · {selectedImage.category}
            </p>

            <a
              href={selectedImage.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ color: '#fff' }}
            >
              Abrir imagem em outra aba <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
