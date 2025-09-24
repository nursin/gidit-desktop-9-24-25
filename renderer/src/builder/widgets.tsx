import type { JSX } from 'react'
import { LayoutDashboard } from 'lucide-react'
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap'
import AppSearch from '@/components/dashboard/AppSearch'
import BehavioralAnalysis from '@/components/dashboard/BehavioralAnalysis'
import BrainDumpTriage from '@/components/dashboard/BrainDumpTriage'
import BreakPromptTile from '@/components/dashboard/BreakPromptTile'
import BudgetTracker from '@/components/dashboard/BudgetTracker'
import CalendarCard from '@/components/dashboard/CalendarCard'
import ChallengeTimer from '@/components/dashboard/ChallengeTimer'
import ChatApp from '@/components/dashboard/ChatApp'
import DailyTaskSuggestions from '@/components/dashboard/DailyTaskSuggestions'
import Dashboard from '@/components/dashboard/Dashboard'
import DateTimeDisplay from '@/components/dashboard/DateTimeDisplay'
import DietaryTracker from '@/components/dashboard/DietaryTracker'
import DocumentRecords from '@/components/dashboard/DocumentRecords'
import DoneWall from '@/components/dashboard/DoneWall'
import DreamWeaver from '@/components/dashboard/DreamWeaver'
import EnergySelector from '@/components/dashboard/EnergySelector'
import FamilyAuthenticator from '@/components/dashboard/FamilyAuthenticator'
import FinanceCard from '@/components/dashboard/FinanceCard'
import FitnessTracker from '@/components/dashboard/FitnessTracker'
import FlashcardDeck from '@/components/dashboard/FlashcardDeck'
import FocusMode from '@/components/dashboard/FocusMode'
import Gallery from '@/components/dashboard/Gallery'
import GoalPlanner from '@/components/dashboard/GoalPlanner'
import HealthSummary from '@/components/dashboard/HealthSummary'
import IndexCardStack from '@/components/dashboard/IndexCardStack'
import LaunchButton from '@/components/dashboard/LaunchButton'
import MemoryGame from '@/components/dashboard/MemoryGame'
import MindfulMoments from '@/components/dashboard/MindfulMoments'
import MoodTracker from '@/components/dashboard/MoodTracker'
import MysteryTaskPicker from '@/components/dashboard/MysteryTaskPicker'
import NavigationBar from '@/components/dashboard/NavigationBar'
import NoteDisplay from '@/components/dashboard/NoteDisplay'
import NotificationsPanel from '@/components/dashboard/NotificationsPanel'
import NowNextPanel from '@/components/dashboard/NowNextPanel'
import PeriodTracker from '@/components/dashboard/PeriodTracker'
import PersonalManual from '@/components/dashboard/PersonalManual'
import Presentation from '@/components/dashboard/Presentation'
import ProgressAnalytics from '@/components/dashboard/ProgressAnalytics'
import ProjectPlanner from '@/components/dashboard/ProjectPlanner'
import PsychologicalProfile from '@/components/dashboard/PsychologicalProfile'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import RockPaperScissors from '@/components/dashboard/RockPaperScissors'
import SBARSynthesizer from '@/components/dashboard/SBARSynthesizer'
import ScrumBoard from '@/components/dashboard/ScrumBoard'
import SessionRecap from '@/components/dashboard/SessionRecap'
import SoundscapeGenerator from '@/components/dashboard/SoundscapeGenerator'
import Spreadsheet from '@/components/dashboard/Spreadsheet'
import StatsPanel from '@/components/dashboard/StatsPanel'
import StickyNoteBoard from '@/components/dashboard/StickyNoteBoard'
import StoryWriter from '@/components/dashboard/StoryWriter'
import StreaksTracker from '@/components/dashboard/StreaksTracker'
import TaskSpinner from '@/components/dashboard/TaskSpinner'
import TasksQuadrant from '@/components/dashboard/TasksQuadrant'
import TicTacToe from '@/components/dashboard/TicTacToe'
import TimeBlockPlanner from '@/components/dashboard/TimeBlockPlanner'
import TimersAndReminders from '@/components/dashboard/TimersAndReminders'
import ToDoList from '@/components/dashboard/ToDoList'
import VirtualPet from '@/components/dashboard/VirtualPet'
import VoiceCapture from '@/components/dashboard/VoiceCapture'
import WebBrowser from '@/components/dashboard/WebBrowser'
import WeeklySpread from '@/components/dashboard/WeeklySpread'
import WhatAmIForgetting from '@/components/dashboard/WhatAmIForgetting'
import WordProcessor from '@/components/dashboard/WordProcessor'

export type WidgetDefinition = {
  id: string
  name: string
  category: string
  component: JSX.Element
  initialWidth?: number
  initialHeight?: number
}

export const WIDGETS: Record<string, WidgetDefinition> = {
  ActivityHeatmap: { id: 'ActivityHeatmap', name: 'Activity Heatmap', category: 'General', component: <ActivityHeatmap /> },
  AppSearch: { id: 'AppSearch', name: 'App Search', category: 'General', component: <AppSearch /> },
  BehavioralAnalysis: { id: 'BehavioralAnalysis', name: 'Behavioral Analysis', category: 'General', component: <BehavioralAnalysis /> },
  BrainDumpTriage: { id: 'BrainDumpTriage', name: 'Brain Dump Triage', category: 'General', component: <BrainDumpTriage /> },
  BreakPromptTile: { id: 'BreakPromptTile', name: 'Break Prompt Tile', category: 'General', component: <BreakPromptTile /> },
  BudgetTracker: { id: 'BudgetTracker', name: 'Budget Tracker', category: 'General', component: <BudgetTracker /> },
  CalendarCard: { id: 'CalendarCard', name: 'Calendar Card', category: 'General', component: <CalendarCard /> },
  ChallengeTimer: { id: 'ChallengeTimer', name: 'Challenge Timer', category: 'General', component: <ChallengeTimer /> },
  ChatApp: { id: 'ChatApp', name: 'Chat App', category: 'General', component: <ChatApp /> },
  DailyTaskSuggestions: { id: 'DailyTaskSuggestions', name: 'Daily Task Suggestions', category: 'General', component: <DailyTaskSuggestions /> },
  Dashboard: { id: 'Dashboard', name: 'Dashboard', category: 'General', component: <Dashboard /> },
  DateTimeDisplay: { id: 'DateTimeDisplay', name: 'Date Time Display', category: 'General', component: <DateTimeDisplay /> },
  DietaryTracker: { id: 'DietaryTracker', name: 'Dietary Tracker', category: 'General', component: <DietaryTracker /> },
  DocumentRecords: { id: 'DocumentRecords', name: 'Document Records', category: 'General', component: <DocumentRecords /> },
  DoneWall: { id: 'DoneWall', name: 'Done Wall', category: 'General', component: <DoneWall /> },
  DreamWeaver: { id: 'DreamWeaver', name: 'Dream Weaver', category: 'General', component: <DreamWeaver /> },
  EnergySelector: { id: 'EnergySelector', name: 'Energy Selector', category: 'General', component: <EnergySelector /> },
  FamilyAuthenticator: { id: 'FamilyAuthenticator', name: 'Family Authenticator', category: 'General', component: <FamilyAuthenticator /> },
  FinanceCard: { id: 'FinanceCard', name: 'Finance Card', category: 'General', component: <FinanceCard /> },
  FitnessTracker: { id: 'FitnessTracker', name: 'Fitness Tracker', category: 'General', component: <FitnessTracker /> },
  FlashcardDeck: { id: 'FlashcardDeck', name: 'Flashcard Deck', category: 'General', component: <FlashcardDeck /> },
  FocusMode: { id: 'FocusMode', name: 'Focus Mode', category: 'General', component: <FocusMode /> },
  Gallery: { id: 'Gallery', name: 'Gallery', category: 'General', component: <Gallery /> },
  GoalPlanner: { id: 'GoalPlanner', name: 'Goal Planner', category: 'General', component: <GoalPlanner /> },
  HealthSummary: { id: 'HealthSummary', name: 'Health Summary', category: 'General', component: <HealthSummary /> },
  IndexCardStack: { id: 'IndexCardStack', name: 'Index Card Stack', category: 'General', component: <IndexCardStack /> },
  LaunchButton: { id: 'LaunchButton', name: 'Launch Button', category: 'General', component: <LaunchButton /> },
  MemoryGame: { id: 'MemoryGame', name: 'Memory Game', category: 'General', component: <MemoryGame /> },
  MindfulMoments: { id: 'MindfulMoments', name: 'Mindful Moments', category: 'General', component: <MindfulMoments /> },
  MoodTracker: { id: 'MoodTracker', name: 'Mood Tracker', category: 'General', component: <MoodTracker /> },
  MysteryTaskPicker: { id: 'MysteryTaskPicker', name: 'Mystery Task Picker', category: 'General', component: <MysteryTaskPicker /> },
  NavigationBar: { id: 'NavigationBar', name: 'Navigation Bar', category: 'General', component: <NavigationBar /> },
  NoteDisplay: { id: 'NoteDisplay', name: 'Note Display', category: 'General', component: <NoteDisplay /> },
  NotificationsPanel: { id: 'NotificationsPanel', name: 'Notifications Panel', category: 'General', component: <NotificationsPanel /> },
  NowNextPanel: { id: 'NowNextPanel', name: 'Now Next Panel', category: 'General', component: <NowNextPanel /> },
  PeriodTracker: { id: 'PeriodTracker', name: 'Period Tracker', category: 'General', component: <PeriodTracker /> },
  PersonalManual: { id: 'PersonalManual', name: 'Personal Manual', category: 'General', component: <PersonalManual /> },
  Presentation: { id: 'Presentation', name: 'Presentation', category: 'General', component: <Presentation /> },
  ProgressAnalytics: { id: 'ProgressAnalytics', name: 'Progress Analytics', category: 'General', component: <ProgressAnalytics /> },
  ProjectPlanner: { id: 'ProjectPlanner', name: 'Project Planner', category: 'General', component: <ProjectPlanner /> },
  PsychologicalProfile: { id: 'PsychologicalProfile', name: 'Psychological Profile', category: 'General', component: <PsychologicalProfile /> },
  RecentTransactions: { id: 'RecentTransactions', name: 'Recent Transactions', category: 'General', component: <RecentTransactions /> },
  RockPaperScissors: { id: 'RockPaperScissors', name: 'Rock Paper Scissors', category: 'General', component: <RockPaperScissors /> },
  SBARSynthesizer: { id: 'SBARSynthesizer', name: 'S B A R Synthesizer', category: 'General', component: <SBARSynthesizer /> },
  ScrumBoard: { id: 'ScrumBoard', name: 'Scrum Board', category: 'General', component: <ScrumBoard /> },
  SessionRecap: { id: 'SessionRecap', name: 'Session Recap', category: 'General', component: <SessionRecap /> },
  SoundscapeGenerator: { id: 'SoundscapeGenerator', name: 'Soundscape Generator', category: 'General', component: <SoundscapeGenerator /> },
  Spreadsheet: { id: 'Spreadsheet', name: 'Spreadsheet', category: 'General', component: <Spreadsheet /> },
  StatsPanel: { id: 'StatsPanel', name: 'Stats Panel', category: 'General', component: <StatsPanel /> },
  StickyNoteBoard: { id: 'StickyNoteBoard', name: 'Sticky Note Board', category: 'General', component: <StickyNoteBoard /> },
  StoryWriter: { id: 'StoryWriter', name: 'Story Writer', category: 'General', component: <StoryWriter /> },
  StreaksTracker: { id: 'StreaksTracker', name: 'Streaks Tracker', category: 'General', component: <StreaksTracker /> },
  TaskSpinner: { id: 'TaskSpinner', name: 'Task Spinner', category: 'General', component: <TaskSpinner /> },
  TasksQuadrant: { id: 'TasksQuadrant', name: 'Tasks Quadrant', category: 'General', component: <TasksQuadrant /> },
  TicTacToe: { id: 'TicTacToe', name: 'Tic Tac Toe', category: 'General', component: <TicTacToe /> },
  TimeBlockPlanner: { id: 'TimeBlockPlanner', name: 'Time Block Planner', category: 'General', component: <TimeBlockPlanner /> },
  TimersAndReminders: { id: 'TimersAndReminders', name: 'Timers And Reminders', category: 'General', component: <TimersAndReminders /> },
  ToDoList: { id: 'ToDoList', name: 'To Do List', category: 'General', component: <ToDoList /> },
  VirtualPet: { id: 'VirtualPet', name: 'Virtual Pet', category: 'General', component: <VirtualPet /> },
  VoiceCapture: { id: 'VoiceCapture', name: 'Voice Capture', category: 'General', component: <VoiceCapture /> },
  WebBrowser: { id: 'WebBrowser', name: 'Web Browser', category: 'General', component: <WebBrowser /> },
  WeeklySpread: { id: 'WeeklySpread', name: 'Weekly Spread', category: 'General', component: <WeeklySpread /> },
  WhatAmIForgetting: { id: 'WhatAmIForgetting', name: 'What Am I Forgetting', category: 'General', component: <WhatAmIForgetting /> },
  WordProcessor: { id: 'WordProcessor', name: 'Word Processor', category: 'General', component: <WordProcessor /> },
}

export const WIDGET_CATEGORIES = {
  General: {
    name: 'General',
    icon: LayoutDashboard,
  },
}
