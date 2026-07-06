import { useState, useEffect, useCallback } from 'react'
import {
  loadSettings, saveSettings,
  loadDayLog, saveDayLog,
  loadWeekLog, saveWeekLog,
  loadAssignments, addAssignment, updateAssignment, deleteAssignment,
  loadLogsRange, loadWeekLogsRange,
} from '../firebase'
import { todayKey, toWeekKey, lastNDateKeys } from '../utils/dateUtils'
import { getCurrentPhase } from '../utils/dateUtils'

export function useData(user) {
  const uid = user?.uid

  // ── Settings ────────────────────────────────────────────────────────────────
  const [settings, setSettings] = useState(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  useEffect(() => {
    if (!uid) return
    loadSettings(uid).then(s => {
      setSettings(s)
      setSettingsLoaded(true)
    }).catch(console.error)
  }, [uid])

  const updateSettings = useCallback(async (changes) => {
    const next = { ...settings, ...changes }
    setSettings(next)
    await saveSettings(uid, next)
  }, [uid, settings])

  // ── Today's log ─────────────────────────────────────────────────────────────
  const [todayLog, setTodayLog] = useState(null)
  const [todayLogLoaded, setTodayLogLoaded] = useState(false)
  const dateKey  = todayKey()
  const weekKey  = toWeekKey(new Date())

  useEffect(() => {
    if (!uid) return
    loadDayLog(uid, dateKey).then(log => {
      setTodayLog(log || {})
      setTodayLogLoaded(true)
    }).catch(console.error)
  }, [uid, dateKey])

  const patchTodayLog = useCallback(async (changes) => {
    const next = { ...todayLog, ...changes }
    setTodayLog(next)
    await saveDayLog(uid, dateKey, changes)
  }, [uid, dateKey, todayLog])

  // Check/uncheck a block
  const toggleBlock = useCallback(async (blockId, checked) => {
    const checkedBlocks = {
      ...(todayLog?.checkedBlocks || {}),
      [blockId]: { checked, checkedAt: Date.now() },
    }
    await patchTodayLog({ checkedBlocks })
  }, [todayLog, patchTodayLog])

  // Internship prep sub-items
  const togglePrepItem = useCallback(async (itemId, checked) => {
    const internshipPrep = { ...(todayLog?.internshipPrep || {}), [itemId]: checked }
    await patchTodayLog({ internshipPrep })
  }, [todayLog, patchTodayLog])

  // Fitness
  const setFitness = useCallback(async (mode) => {
    // Toggle off if same value
    const current = todayLog?.fitness
    const next    = current === mode ? null : mode
    await patchTodayLog({ fitness: next })
  }, [todayLog, patchTodayLog])

  // Stay-back
  const setStayBack = useCallback(async (minutes, note) => {
    await patchTodayLog({ stayBackMinutes: minutes, stayBackNote: note ?? todayLog?.stayBackNote ?? '' })
  }, [todayLog, patchTodayLog])

  // Event day
  const setEventDay = useCallback(async (isEvent, note) => {
    await patchTodayLog({ isEventDay: isEvent, eventDayNote: note || '' })
  }, [todayLog, patchTodayLog])

  // ── Weekly (LinkedIn) ────────────────────────────────────────────────────────
  const [weekLog, setWeekLog] = useState(null)

  useEffect(() => {
    if (!uid) return
    loadWeekLog(uid, weekKey).then(w => setWeekLog(w || {})).catch(console.error)
  }, [uid, weekKey])

  const toggleLinkedin = useCallback(async () => {
    const next = !weekLog?.linkedinDone
    const updated = { ...weekLog, linkedinDone: next }
    setWeekLog(updated)
    await saveWeekLog(uid, weekKey, { linkedinDone: next })
  }, [uid, weekKey, weekLog])

  // ── Assignments ──────────────────────────────────────────────────────────────
  const [assignments, setAssignments] = useState([])
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false)

  useEffect(() => {
    if (!uid) return
    loadAssignments(uid).then(a => {
      setAssignments(a)
      setAssignmentsLoaded(true)
    }).catch(console.error)
  }, [uid])

  const createAssignment = useCallback(async (data) => {
    const id = await addAssignment(uid, { ...data, createdAt: Date.now() })
    setAssignments(prev => [...prev, { id, ...data, createdAt: Date.now() }])
    return id
  }, [uid])

  const editAssignment = useCallback(async (id, changes) => {
    await updateAssignment(uid, id, changes)
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...changes } : a))
  }, [uid])

  const removeAssignment = useCallback(async (id) => {
    await deleteAssignment(uid, id)
    setAssignments(prev => prev.filter(a => a.id !== id))
  }, [uid])

  const markAssignmentDone = useCallback(async (id) => {
    await editAssignment(id, { status: 'done', completedAt: Date.now() })
  }, [editAssignment])

  // ── Historical logs (for stats + week view) ──────────────────────────────────
  const [historyLogs, setHistoryLogs] = useState({})

  const loadHistory = useCallback(async (days = 28) => {
    const keys  = lastNDateKeys(days)
    const logs  = await loadLogsRange(uid, keys)
    setHistoryLogs(logs)
    return logs
  }, [uid])

  // ── Phase ────────────────────────────────────────────────────────────────────
  const phase = getCurrentPhase(settings?.phaseManualOverride || null)

  return {
    // Settings
    settings,
    settingsLoaded,
    updateSettings,
    phase,

    // Today
    todayLog: todayLog || {},
    todayLogLoaded,
    toggleBlock,
    togglePrepItem,
    setFitness,
    setStayBack,
    setEventDay,

    // Weekly
    weekLog: weekLog || {},
    toggleLinkedin,

    // Assignments
    assignments,
    assignmentsLoaded,
    createAssignment,
    editAssignment,
    removeAssignment,
    markAssignmentDone,

    // History
    historyLogs,
    loadHistory,
  }
}
