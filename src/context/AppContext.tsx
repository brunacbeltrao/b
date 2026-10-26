import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  NavigationTab,
  PriorityItem,
  CalendarEvent,
  EventCategory,
  CommercialProposal,
  ProposalStage,
  TeamOneOnOne,
  DelegatedTask,
  PendingAgenda,
  FDRSubject,
  LDSSession,
  SpiritualityState,
  HabitItem,
  WorkoutDay,
  HealthState,
  HealthAppointment,
  HealthExam,
  AdhdTreatment,
  FinancialTransaction,
  SleepLogDay,
  BookItem,
  DelegationInboxItem,
  AssessorItem,
} from '../types';
import {
  INITIAL_PRIORITIES,
  INITIAL_QUICK_NOTE,
  INITIAL_EVENTS,
  INITIAL_PROPOSALS,
  INITIAL_ONE_ON_ONES,
  INITIAL_DELEGATED_TASKS,
  INITIAL_PENDING_AGENDAS,
  INITIAL_DELEGATION_INBOX,
  INITIAL_ASSESSORS,
  INITIAL_FDR_SUBJECTS,
  INITIAL_LDS_SESSIONS,
  INITIAL_SPIRITUALITY,
  INITIAL_HABITS,
  INITIAL_WORKOUT_WEEK,
  INITIAL_HEALTH,
  INITIAL_FINANCIAL,
  INITIAL_SLEEP_WEEK,
  INITIAL_BOOKS,
} from '../data/initialData';

interface AppContextType {
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  
  // Cockpit
  priorities: PriorityItem[];
  togglePriority: (id: string) => void;
  addPriority: (text: string, category?: PriorityItem['category']) => void;
  deletePriority: (id: string) => void;
  quickNote: string;
  setQuickNote: (note: string) => void;

  // Calendar
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  categoryFilters: Record<EventCategory, boolean>;
  toggleCategoryFilter: (category: EventCategory) => void;

  // Bevilaqua
  proposals: CommercialProposal[];
  updateProposalStage: (id: string, stage: ProposalStage) => void;
  addProposal: (proposal: Omit<CommercialProposal, 'id' | 'updatedAt'>) => void;
  deleteProposal: (id: string) => void;
  cycleRevenueCurrent: number;
  setCycleRevenueCurrent: (val: number) => void;
  cycleRevenueGoal: number;
  setCycleRevenueGoal: (val: number) => void;
  cycleContractsCurrent: number;
  setCycleContractsCurrent: (val: number) => void;
  cycleContractsGoal: number;
  setCycleContractsGoal: (val: number) => void;
  teamOneOnOnes: TeamOneOnOne[];
  addOneOnOneTopic: (id: string, topic: string) => void;
  delegatedTasks: DelegatedTask[];
  toggleDelegatedTaskStatus: (id: string) => void;
  addDelegatedTask: (task: Omit<DelegatedTask, 'id'>) => void;
  deleteDelegatedTask: (id: string) => void;
  pendingAgendas: PendingAgenda[];
  togglePendingAgenda: (id: string) => void;
  addPendingAgenda: (title: string, category: PendingAgenda['category']) => void;

  // Box To-Do de Delegação & Assessores de Negócios
  delegationInbox: DelegationInboxItem[];
  addDelegationInboxItem: (text: string, suggestedLeader?: DelegationInboxItem['suggestedLeader'], notes?: string) => void;
  toggleDelegationInboxItem: (id: string) => void;
  deleteDelegationInboxItem: (id: string) => void;
  convertToDelegatedTask: (inboxId: string, assignee: string, deadline: string, priority?: DelegatedTask['priority']) => void;
  assessors: AssessorItem[];
  toggleAssessorOneOnOne: (id: string) => void;

  // Academia & LDS
  fdrSubjects: FDRSubject[];
  toggleFDRItem: (subjectId: string, type: 'exams' | 'assignments' | 'fichamentos', itemId: string) => void;
  ldsSessions: LDSSession[];
  toggleLDSReading: (sessionId: string) => void;
  updateLDSSession: (sessionId: string, updates: Partial<LDSSession>) => void;
  addLDSSession: (session: Omit<LDSSession, 'id'>) => void;
  deleteLDSSession: (sessionId: string) => void;

  // Spirituality (Catequese de Crisma e 1ª Comunhão)
  spirituality: SpiritualityState;
  updateMassNotes: (notes: string) => void;
  addMassIntention: (intention: string) => void;
  removeMassIntention: (index: number) => void;
  toggleCatechesisModule: (id: string) => void;
  updateCatechesisNotes: (notes: string) => void;
  toggleSacramentalConfession: () => void;
  toggleRosaryMystery: (index: number) => void;
  setRosaryMysteryType: (type: SpiritualityState['rosary']['selectedMysteryType']) => void;
  addRosaryIntention: (intention: string) => void;
  removeRosaryIntention: (index: number) => void;
  addPrayerIntention: (intention: string) => void;
  removePrayerIntention: (index: number) => void;

  // Saúde, TDAH & Venvanse
  health: HealthState;
  updateAdhdTreatment: (updates: Partial<AdhdTreatment>) => void;
  toggleAdhdPillTakenToday: () => void;
  addAppointment: (appointment: Omit<HealthAppointment, 'id'>) => void;
  toggleAppointmentStatus: (id: string) => void;
  deleteAppointment: (id: string) => void;
  addExam: (exam: Omit<HealthExam, 'id'>) => void;
  updateExamStatus: (id: string, status: HealthExam['status'], notes?: string) => void;
  deleteExam: (id: string) => void;

  // Gestão Financeira
  financialTransactions: FinancialTransaction[];
  addFinancialTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  deleteFinancialTransaction: (id: string) => void;

  // Ritmo Circadiano & Sono
  sleepLogs: SleepLogDay[];
  updateSleepLog: (id: string, updates: Partial<SleepLogDay>) => void;

  // Estante de Livros Lidos 2026
  books: BookItem[];
  addBook: (book: Omit<BookItem, 'id'>) => void;
  updateBook: (id: string, updates: Partial<BookItem>) => void;
  updateBookProgress: (id: string, page: number) => void;
  updateBookStatus: (id: string, status: BookItem['status']) => void;
  deleteBook: (id: string) => void;

  // Wellness & Routine
  habits: HabitItem[];
  toggleHabit: (id: string) => void;
  addHabit: (habit: Omit<HabitItem, 'id' | 'streak'>) => void;
  editHabit: (id: string, updates: Partial<HabitItem>) => void;
  deleteHabit: (id: string) => void;
  waterGlasses: number;
  incrementWater: () => void;
  decrementWater: () => void;
  workoutWeek: Record<string, WorkoutDay>;
  toggleWorkoutActivity: (
    day: string,
    activity: 'musculacao' | 'cardio' | 'alongamento' | 'futebol' | 'volei'
  ) => void;

  // Global utilities
  triggerCelebration: () => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'bruna_os_v3_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('cockpit');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Cockpit state
  const [priorities, setPriorities] = useState<PriorityItem[]>(() =>
    loadFromStorage('priorities', INITIAL_PRIORITIES)
  );
  const [quickNote, setQuickNote] = useState<string>(() =>
    loadFromStorage('quickNote', INITIAL_QUICK_NOTE)
  );

  // Calendar state
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    loadFromStorage('events', INITIAL_EVENTS)
  );
  const [categoryFilters, setCategoryFilters] = useState<Record<EventCategory, boolean>>({
    estagio: true,
    lds: true,
    fdr: true,
    descanso: true,
    espiritualidade: true,
    pessoal: true,
  });

  // Bevilaqua state (Meta 2026: R$ 84.037 | Atual: R$ 59.159)
  const [proposals, setProposals] = useState<CommercialProposal[]>(() =>
    loadFromStorage('proposals', INITIAL_PROPOSALS)
  );
  const [cycleRevenueCurrent, setCycleRevenueCurrent] = useState<number>(() =>
    loadFromStorage('revenue_current', 59159)
  );
  const [cycleRevenueGoal, setCycleRevenueGoal] = useState<number>(() =>
    loadFromStorage('revenue_goal', 84037)
  );
  const [cycleContractsCurrent, setCycleContractsCurrent] = useState<number>(() =>
    loadFromStorage('contracts_current', 14)
  );
  const [cycleContractsGoal, setCycleContractsGoal] = useState<number>(() =>
    loadFromStorage('contracts_goal', 20)
  );
  const [teamOneOnOnes, setTeamOneOnOnes] = useState<TeamOneOnOne[]>(() =>
    loadFromStorage('1on1s_v2', INITIAL_ONE_ON_ONES)
  );
  const [delegatedTasks, setDelegatedTasks] = useState<DelegatedTask[]>(() =>
    loadFromStorage('delegatedTasks_v2', INITIAL_DELEGATED_TASKS)
  );
  const [pendingAgendas, setPendingAgendas] = useState<PendingAgenda[]>(() =>
    loadFromStorage('pendingAgendas', INITIAL_PENDING_AGENDAS)
  );

  // Box To-Do de Delegação (Brain-Dump)
  const [delegationInbox, setDelegationInbox] = useState<DelegationInboxItem[]>(() =>
    loadFromStorage('delegation_inbox_v2', INITIAL_DELEGATION_INBOX)
  );

  // 10 Assessores de Negócios (Ares, Atena, Marketing) & 1:1 com Aline
  const [assessors, setAssessors] = useState<AssessorItem[]>(() =>
    loadFromStorage('assessors_v2', INITIAL_ASSESSORS)
  );

  // Academia & LDS state (As 3 Disciplinas Dogmáticas: DPC II, Constitucional II, Civil IV + LDS)
  const [fdrSubjects, setFdrSubjects] = useState<FDRSubject[]>(() => {
    const loaded = loadFromStorage('fdrSubjects_v4', null);
    if (loaded && Array.isArray(loaded) && loaded.length === 3) {
      return loaded;
    }
    const older = loadFromStorage('fdrSubjects', null);
    if (older && Array.isArray(older) && older.length === 3) {
      return older;
    }
    return INITIAL_FDR_SUBJECTS;
  });
  const [ldsSessions, setLdsSessions] = useState<LDSSession[]>(() => {
    const loaded = loadFromStorage('ldsSessions_v3', null) || loadFromStorage('ldsSessions', null);
    if (loaded && Array.isArray(loaded) && loaded.length > 0) {
      return loaded.map(s => ({
        ...s,
        time: (!s.time || s.time === '18:30') ? '20:00' : s.time,
      }));
    }
    return INITIAL_LDS_SESSIONS;
  });

  useEffect(() => {
    saveToStorage('ldsSessions_v3', ldsSessions);
    saveToStorage('ldsSessions', ldsSessions);
  }, [ldsSessions]);

  // Spirituality state (Catequese Pessoal de Crisma e 1ª Comunhão)
  const [spirituality, setSpirituality] = useState<SpiritualityState>(() => {
    const loaded = loadFromStorage('spirituality', INITIAL_SPIRITUALITY);
    if (!loaded?.catechesis || !('sacramentsAim' in loaded.catechesis)) {
      return INITIAL_SPIRITUALITY;
    }
    return loaded;
  });

  // Saúde, TDAH, Venvanse & Exames Laboratoriais (Check-up Clínico 04/05/2026)
  const [health, setHealth] = useState<HealthState>(() => {
    const loaded = loadFromStorage('health_v3', null);
    if (loaded && Array.isArray(loaded.exams) && loaded.exams.length > 0) {
      return loaded;
    }
    return INITIAL_HEALTH;
  });

  // Gestão Financeira Pessoal (Estágio R$ 1.100 + Extrato BTG + Pai R$ 150/sem)
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(() => {
    const loaded = loadFromStorage('financial_txs_v2', null);
    if (loaded && Array.isArray(loaded) && loaded.length > 0) {
      return loaded;
    }
    return INITIAL_FINANCIAL;
  });

  // Ritmo Circadiano & Sono
  const [sleepLogs, setSleepLogs] = useState<SleepLogDay[]>(() =>
    loadFromStorage('sleep_logs', INITIAL_SLEEP_WEEK)
  );

  // Estante de Livros 2026
  const [books, setBooks] = useState<BookItem[]>(() => {
    const loaded = loadFromStorage('books_v3', null);
    if (Array.isArray(loaded) && loaded.length > 0) return loaded;
    return INITIAL_BOOKS;
  });

  // Wellness state
  const [habits, setHabits] = useState<HabitItem[]>(() =>
    loadFromStorage('habits', INITIAL_HABITS)
  );
  const [waterGlasses, setWaterGlasses] = useState<number>(() =>
    loadFromStorage('waterGlasses', 7)
  );
  const [workoutWeek, setWorkoutWeek] = useState<Record<string, WorkoutDay>>(() =>
    loadFromStorage('workoutWeek', INITIAL_WORKOUT_WEEK)
  );

  // Auto-save listeners
  useEffect(() => saveToStorage('priorities', priorities), [priorities]);
  useEffect(() => saveToStorage('quickNote', quickNote), [quickNote]);
  useEffect(() => saveToStorage('events', events), [events]);
  useEffect(() => saveToStorage('proposals', proposals), [proposals]);
  useEffect(() => saveToStorage('revenue_current', cycleRevenueCurrent), [cycleRevenueCurrent]);
  useEffect(() => saveToStorage('revenue_goal', cycleRevenueGoal), [cycleRevenueGoal]);
  useEffect(() => saveToStorage('contracts_current', cycleContractsCurrent), [cycleContractsCurrent]);
  useEffect(() => saveToStorage('contracts_goal', cycleContractsGoal), [cycleContractsGoal]);
  useEffect(() => saveToStorage('1on1s_v2', teamOneOnOnes), [teamOneOnOnes]);
  useEffect(() => saveToStorage('delegatedTasks_v2', delegatedTasks), [delegatedTasks]);
  useEffect(() => saveToStorage('pendingAgendas', pendingAgendas), [pendingAgendas]);
  useEffect(() => saveToStorage('delegation_inbox_v2', delegationInbox), [delegationInbox]);
  useEffect(() => saveToStorage('assessors_v2', assessors), [assessors]);
  useEffect(() => {
    saveToStorage('fdrSubjects_v4', fdrSubjects);
    saveToStorage('fdrSubjects', fdrSubjects);
  }, [fdrSubjects]);
  useEffect(() => saveToStorage('ldsSessions', ldsSessions), [ldsSessions]);
  useEffect(() => saveToStorage('spirituality', spirituality), [spirituality]);
  useEffect(() => {
    saveToStorage('health_v3', health);
    saveToStorage('health_v2', health);
  }, [health]);
  useEffect(() => {
    saveToStorage('financial_txs_v2', financialTransactions);
    saveToStorage('financial_txs', financialTransactions);
  }, [financialTransactions]);
  useEffect(() => saveToStorage('sleep_logs', sleepLogs), [sleepLogs]);
  useEffect(() => {
    saveToStorage('books_v3', books);
    saveToStorage('books_v2', books);
  }, [books]);
  useEffect(() => saveToStorage('habits', habits), [habits]);
  useEffect(() => saveToStorage('waterGlasses', waterGlasses), [waterGlasses]);
  useEffect(() => saveToStorage('workoutWeek', workoutWeek), [workoutWeek]);

  // Confetti trigger helper
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#c9a3ae', '#d4af37', '#3f7a55', '#8b1538', '#f7ecef'],
      });
    } catch {
      // ignore
    }
  };

  // Cockpit handlers
  const togglePriority = (id: string) => {
    setPriorities(prev => {
      const next = prev.map(p => {
        if (p.id === id) {
          const completed = !p.completed;
          if (completed) triggerCelebration();
          return { ...p, completed };
        }
        return p;
      });
      return next;
    });
  };

  const addPriority = (text: string, category: PriorityItem['category'] = 'executivo') => {
    if (!text.trim()) return;
    const newItem: PriorityItem = {
      id: 'p-' + Date.now(),
      text: text.trim(),
      completed: false,
      category,
    };
    setPriorities(prev => [...prev.slice(-2), newItem]); // keep around 3
  };

  const deletePriority = (id: string) => {
    setPriorities(prev => prev.filter(p => p.id !== id));
  };

  // Calendar handlers
  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: 'ev-' + Date.now(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const toggleCategoryFilter = (cat: EventCategory) => {
    setCategoryFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Bevilaqua handlers
  const updateProposalStage = (id: string, stage: ProposalStage) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id === id) {
          if (stage === 'fechado' && p.stage !== 'fechado') {
            triggerCelebration();
            setCycleContractsCurrent(c => c + 1);
            setCycleRevenueCurrent(r => r + p.value);
          }
          return { ...p, stage, updatedAt: 'Agora mesmo' };
        }
        return p;
      })
    );
  };

  const addProposal = (prop: Omit<CommercialProposal, 'id' | 'updatedAt'>) => {
    const newProp: CommercialProposal = {
      ...prop,
      id: 'prop-' + Date.now(),
      updatedAt: 'Recém criado',
    };
    setProposals(prev => [newProp, ...prev]);
  };

  const deleteProposal = (id: string) => {
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  const addOneOnOneTopic = (id: string, topic: string) => {
    if (!topic.trim()) return;
    setTeamOneOnOnes(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, keyTopics: [...item.keyTopics, topic.trim()] };
        }
        return item;
      })
    );
  };

  const toggleDelegatedTaskStatus = (id: string) => {
    setDelegatedTasks(prev =>
      prev.map(task => {
        if (task.id === id) {
          const nextStatus: DelegatedTask['status'] =
            task.status === 'a_fazer'
              ? 'em_andamento'
              : task.status === 'em_andamento'
              ? 'revisao'
              : task.status === 'revisao'
              ? 'concluido'
              : 'a_fazer';
          return { ...task, status: nextStatus };
        }
        return task;
      })
    );
  };

  const deleteDelegatedTask = (id: string) => {
    setDelegatedTasks(prev => prev.filter(t => t.id !== id));
  };

  const addDelegatedTask = (task: Omit<DelegatedTask, 'id'>) => {
    const newTask: DelegatedTask = {
      ...task,
      id: 'dt-' + Date.now(),
    };
    setDelegatedTasks(prev => [newTask, ...prev]);
  };

  // Delegation Inbox (Brain-Dump To-Do) handlers
  const addDelegationInboxItem = (
    text: string,
    suggestedLeader: DelegationInboxItem['suggestedLeader'] = 'A definir',
    notes?: string
  ) => {
    if (!text.trim()) return;
    const newItem: DelegationInboxItem = {
      id: 'inbox-' + Date.now(),
      text: text.trim(),
      suggestedLeader,
      completed: false,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      notes: notes?.trim(),
    };
    setDelegationInbox(prev => [newItem, ...prev]);
  };

  const toggleDelegationInboxItem = (id: string) => {
    setDelegationInbox(prev =>
      prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const deleteDelegationInboxItem = (id: string) => {
    setDelegationInbox(prev => prev.filter(item => item.id !== id));
  };

  const convertToDelegatedTask = (
    inboxId: string,
    assignee: string,
    deadline: string,
    priority: DelegatedTask['priority'] = 'alta'
  ) => {
    const item = delegationInbox.find(i => i.id === inboxId);
    if (!item) return;

    addDelegatedTask({
      title: item.text,
      assignee,
      deadline: deadline || 'Esta semana',
      status: 'em_andamento',
      priority,
      notes: item.notes,
    });

    setDelegationInbox(prev =>
      prev.map(i => (i.id === inboxId ? { ...i, completed: true } : i))
    );
  };

  const toggleAssessorOneOnOne = (id: string) => {
    setAssessors(prev =>
      prev.map(assessor =>
        assessor.id === id
          ? { ...assessor, oneOnOneWithAlineDone: !assessor.oneOnOneWithAlineDone }
          : assessor
      )
    );
  };

  const togglePendingAgenda = (id: string) => {
    setPendingAgendas(prev =>
      prev.map(pa => (pa.id === id ? { ...pa, done: !pa.done } : pa))
    );
  };

  const addPendingAgenda = (title: string, category: PendingAgenda['category']) => {
    if (!title.trim()) return;
    setPendingAgendas(prev => [
      ...prev,
      { id: 'pa-' + Date.now(), title: title.trim(), category, done: false },
    ]);
  };

  // FDR handlers
  const toggleFDRItem = (
    subjectId: string,
    type: 'exams' | 'assignments' | 'fichamentos',
    itemId: string
  ) => {
    setFdrSubjects(prev =>
      prev.map(sub => {
        if (sub.id === subjectId) {
          return {
            ...sub,
            [type]: sub[type].map((item: any) =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
          };
        }
        return sub;
      })
    );
  };

  // LDS handlers
  const toggleLDSReading = (sessionId: string) => {
    setLdsSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          const next = !s.readingDone;
          if (next) triggerCelebration();
          return { ...s, readingDone: next };
        }
        return s;
      })
    );
  };

  const updateLDSSession = (sessionId: string, updates: Partial<LDSSession>) => {
    setLdsSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, ...updates } : s))
    );
  };

  const addLDSSession = (session: Omit<LDSSession, 'id'>) => {
    const newSession: LDSSession = {
      ...session,
      id: `lds-${Date.now()}`,
    };
    setLdsSessions(prev => [...prev, newSession]);
  };

  const deleteLDSSession = (sessionId: string) => {
    setLdsSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  // Spirituality handlers
  const updateMassNotes = (notes: string) => {
    setSpirituality(prev => ({
      ...prev,
      mass: { ...prev.mass, gospelNotes: notes },
    }));
  };

  const addMassIntention = (intention: string) => {
    if (!intention.trim()) return;
    setSpirituality(prev => ({
      ...prev,
      mass: {
        ...prev.mass,
        intentions: [...prev.mass.intentions, intention.trim()],
      },
    }));
  };

  const removeMassIntention = (index: number) => {
    setSpirituality(prev => ({
      ...prev,
      mass: {
        ...prev.mass,
        intentions: prev.mass.intentions.filter((_, i) => i !== index),
      },
    }));
  };

  const toggleCatechesisModule = (id: string) => {
    setSpirituality(prev => ({
      ...prev,
      catechesis: {
        ...prev.catechesis,
        modules: prev.catechesis.modules.map(m => {
          if (m.id === id) {
            const next = !m.completed;
            if (next) triggerCelebration();
            return { ...m, completed: next };
          }
          return m;
        }),
      },
    }));
  };

  const updateCatechesisNotes = (notes: string) => {
    setSpirituality(prev => ({
      ...prev,
      catechesis: {
        ...prev.catechesis,
        studyNotes: notes,
      },
    }));
  };

  const toggleSacramentalConfession = () => {
    setSpirituality(prev => ({
      ...prev,
      catechesis: {
        ...prev.catechesis,
        confessionDone: !prev.catechesis.confessionDone,
      },
    }));
  };

  const toggleRosaryMystery = (index: number) => {
    setSpirituality(prev => {
      const nextChecked = [...prev.rosary.mysteriesChecked];
      nextChecked[index] = !nextChecked[index];
      const allDone = nextChecked.every(Boolean);
      let newStreak = prev.rosary.currentStreak;
      if (allDone && !prev.rosary.mysteriesChecked.every(Boolean)) {
        newStreak += 1;
        triggerCelebration();
      }
      return {
        ...prev,
        rosary: {
          ...prev.rosary,
          mysteriesChecked: nextChecked,
          currentStreak: newStreak,
        },
      };
    });
  };

  const setRosaryMysteryType = (type: SpiritualityState['rosary']['selectedMysteryType']) => {
    setSpirituality(prev => ({
      ...prev,
      rosary: {
        ...prev.rosary,
        selectedMysteryType: type,
        mysteriesChecked: [false, false, false, false, false],
      },
    }));
  };

  const addRosaryIntention = (intention: string) => {
    if (!intention.trim()) return;
    setSpirituality(prev => ({
      ...prev,
      rosary: {
        ...prev.rosary,
        intentions: [...prev.rosary.intentions, intention.trim()],
      },
    }));
  };

  const removeRosaryIntention = (index: number) => {
    setSpirituality(prev => ({
      ...prev,
      rosary: {
        ...prev.rosary,
        intentions: prev.rosary.intentions.filter((_, i) => i !== index),
      },
    }));
  };

  // Saúde, TDAH & Venvanse handlers
  const updateAdhdTreatment = (updates: Partial<AdhdTreatment>) => {
    setHealth(prev => ({
      ...prev,
      adhd: { ...prev.adhd, ...updates },
    }));
  };

  const toggleAdhdPillTakenToday = () => {
    setHealth(prev => {
      const nextTaken = !prev.adhd.dailyLogTakenToday;
      if (nextTaken) triggerCelebration();
      const currentRemaining = prev.adhd.currentPillsRemaining;
      return {
        ...prev,
        adhd: {
          ...prev.adhd,
          dailyLogTakenToday: nextTaken,
          currentPillsRemaining: nextTaken
            ? Math.max(0, currentRemaining - 1)
            : currentRemaining + 1,
          takenTimeToday: nextTaken ? 'Hoje, 07:45' : undefined,
        },
      };
    });
  };

  const addAppointment = (appointment: Omit<HealthAppointment, 'id'>) => {
    const newApp: HealthAppointment = {
      ...appointment,
      id: 'app-' + Date.now(),
    };
    setHealth(prev => ({
      ...prev,
      appointments: [newApp, ...prev.appointments],
    }));
  };

  const toggleAppointmentStatus = (id: string) => {
    setHealth(prev => ({
      ...prev,
      appointments: prev.appointments.map(a =>
        a.id === id
          ? { ...a, status: a.status === 'agendada' ? 'realizada' : 'agendada' }
          : a
      ),
    }));
  };

  const deleteAppointment = (id: string) => {
    setHealth(prev => ({
      ...prev,
      appointments: prev.appointments.filter(a => a.id !== id),
    }));
  };

  const addExam = (exam: Omit<HealthExam, 'id'>) => {
    const newEx: HealthExam = {
      ...exam,
      id: 'ex-med-' + Date.now(),
    };
    setHealth(prev => ({
      ...prev,
      exams: [newEx, ...prev.exams],
    }));
  };

  const updateExamStatus = (id: string, status: HealthExam['status'], notes?: string) => {
    setHealth(prev => ({
      ...prev,
      exams: prev.exams.map(e =>
        e.id === id ? { ...e, status, ...(notes ? { resultNotes: notes } : {}) } : e
      ),
    }));
  };

  const deleteExam = (id: string) => {
    setHealth(prev => ({
      ...prev,
      exams: prev.exams.filter(e => e.id !== id),
    }));
  };

  // Finanças handlers
  const addFinancialTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: 'ft-' + Date.now(),
    };
    setFinancialTransactions(prev => [newTx, ...prev]);
    if (tx.type === 'receita') triggerCelebration();
  };

  const deleteFinancialTransaction = (id: string) => {
    setFinancialTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Sono handlers
  const updateSleepLog = (id: string, updates: Partial<SleepLogDay>) => {
    setSleepLogs(prev =>
      prev.map(s => {
        if (s.id === id) {
          const merged = { ...s, ...updates };
          if (updates.bedTime || updates.wakeTime) {
            try {
              const [bH, bM] = merged.bedTime.split(':').map(Number);
              const [wH, wM] = merged.wakeTime.split(':').map(Number);
              let diffMinutes = (wH * 60 + wM) - (bH * 60 + bM);
              if (diffMinutes < 0) diffMinutes += 24 * 60;
              merged.totalHours = Number((diffMinutes / 60).toFixed(2));
            } catch {
              // keep as is
            }
          }
          return merged;
        }
        return s;
      })
    );
  };

  // Livros handlers
  const addBook = (book: Omit<BookItem, 'id'>) => {
    const newBk: BookItem = {
      ...book,
      id: 'bk-' + Date.now(),
    };
    setBooks(prev => [newBk, ...prev]);
    if (book.status === 'lido') triggerCelebration();
  };

  const updateBook = (id: string, updates: Partial<BookItem>) => {
    setBooks(prev =>
      prev.map(b => {
        if (b.id === id) {
          const updated = { ...b, ...updates };
          if (updates.status === 'lido' && b.status !== 'lido') {
            triggerCelebration();
          }
          return updated;
        }
        return b;
      })
    );
  };

  const updateBookProgress = (id: string, page: number) => {
    setBooks(prev =>
      prev.map(b => {
        if (b.id === id) {
          const isFinished = page >= b.totalPages;
          if (isFinished && b.status !== 'lido') {
            triggerCelebration();
          }
          return {
            ...b,
            currentPage: page,
            status: isFinished ? 'lido' : b.status === 'quero_ler' ? 'lendo' : b.status,
          };
        }
        return b;
      })
    );
  };

  const updateBookStatus = (id: string, status: BookItem['status']) => {
    setBooks(prev =>
      prev.map(b => {
        if (b.id === id) {
          if (status === 'lido' && b.status !== 'lido') {
            triggerCelebration();
          }
          return { ...b, status };
        }
        return b;
      })
    );
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  // Wellness handlers
  const toggleHabit = (id: string) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id === id) {
          const completed = !h.completed;
          if (completed) triggerCelebration();
          return {
            ...h,
            completed,
            streak: completed ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );
  };

  const addHabit = (habitData: Omit<HabitItem, 'id' | 'streak'>) => {
    const newHabit: HabitItem = {
      ...habitData,
      id: `h-custom-${Date.now()}`,
      streak: 0,
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const editHabit = (id: string, updates: Partial<HabitItem>) => {
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const incrementWater = () => {
    setWaterGlasses(prev => {
      const next = Math.min(prev + 1, 14);
      if (next === 10) triggerCelebration();
      return next;
    });
  };

  const decrementWater = () => {
    setWaterGlasses(prev => Math.max(prev - 1, 0));
  };

  const toggleWorkoutActivity = (
    day: string,
    activity: 'musculacao' | 'cardio' | 'alongamento' | 'futebol' | 'volei'
  ) => {
    setWorkoutWeek(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [activity]: !prev[day]?.[activity],
      },
    }));
  };

  const resetToDefaults = () => {
    if (window.confirm('Deseja restaurar todos os dados padrões da Bruna OS?')) {
      localStorage.clear();
      setPriorities(INITIAL_PRIORITIES);
      setQuickNote(INITIAL_QUICK_NOTE);
      setEvents(INITIAL_EVENTS);
      setProposals(INITIAL_PROPOSALS);
      setCycleRevenueCurrent(59159);
      setCycleRevenueGoal(84037);
      setCycleContractsCurrent(14);
      setCycleContractsGoal(20);
      setTeamOneOnOnes(INITIAL_ONE_ON_ONES);
      setDelegatedTasks(INITIAL_DELEGATED_TASKS);
      setPendingAgendas(INITIAL_PENDING_AGENDAS);
      setFdrSubjects(INITIAL_FDR_SUBJECTS);
      setLdsSessions(INITIAL_LDS_SESSIONS);
      setSpirituality(INITIAL_SPIRITUALITY);
      setHealth(INITIAL_HEALTH);
      setFinancialTransactions(INITIAL_FINANCIAL);
      setSleepLogs(INITIAL_SLEEP_WEEK);
      setBooks(INITIAL_BOOKS);
      setHabits(INITIAL_HABITS);
      setWaterGlasses(7);
      setWorkoutWeek(INITIAL_WORKOUT_WEEK);
      triggerCelebration();
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isMobileNavOpen,
        setIsMobileNavOpen,
        priorities,
        togglePriority,
        addPriority,
        deletePriority,
        quickNote,
        setQuickNote,
        events,
        addEvent,
        deleteEvent,
        categoryFilters,
        toggleCategoryFilter,
        proposals,
        updateProposalStage,
        addProposal,
        deleteProposal,
        cycleRevenueCurrent,
        setCycleRevenueCurrent,
        cycleRevenueGoal,
        setCycleRevenueGoal,
        cycleContractsCurrent,
        setCycleContractsCurrent,
        cycleContractsGoal,
        setCycleContractsGoal,
        teamOneOnOnes,
        addOneOnOneTopic,
        delegatedTasks,
        toggleDelegatedTaskStatus,
        addDelegatedTask,
        deleteDelegatedTask,
        pendingAgendas,
        togglePendingAgenda,
        addPendingAgenda,
        delegationInbox,
        addDelegationInboxItem,
        toggleDelegationInboxItem,
        deleteDelegationInboxItem,
        convertToDelegatedTask,
        assessors,
        toggleAssessorOneOnOne,
        fdrSubjects,
        toggleFDRItem,
        ldsSessions,
        toggleLDSReading,
        updateLDSSession,
        addLDSSession,
        deleteLDSSession,
        spirituality,
        updateMassNotes,
        addMassIntention,
        removeMassIntention,
        toggleCatechesisModule,
        updateCatechesisNotes,
        toggleSacramentalConfession,
        toggleRosaryMystery,
        setRosaryMysteryType,
        addRosaryIntention,
        removeRosaryIntention,
        addPrayerIntention: addRosaryIntention,
        removePrayerIntention: removeRosaryIntention,
        health,
        updateAdhdTreatment,
        toggleAdhdPillTakenToday,
        addAppointment,
        toggleAppointmentStatus,
        deleteAppointment,
        addExam,
        updateExamStatus,
        deleteExam,
        financialTransactions,
        addFinancialTransaction,
        deleteFinancialTransaction,
        sleepLogs,
        updateSleepLog,
        books,
        addBook,
        updateBook,
        updateBookProgress,
        updateBookStatus,
        deleteBook,
        habits,
        toggleHabit,
        addHabit,
        editHabit,
        deleteHabit,
        waterGlasses,
        incrementWater,
        decrementWater,
        workoutWeek,
        toggleWorkoutActivity,
        triggerCelebration,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
