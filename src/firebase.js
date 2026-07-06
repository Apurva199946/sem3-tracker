import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import {
  getFirestore, doc, getDoc, setDoc, updateDoc,
  collection, addDoc, deleteDoc, query, getDocs,
  enableIndexedDbPersistence
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

const app  = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db   = getFirestore(app)

// Offline persistence — works silently, fails gracefully if already enabled
enableIndexedDbPersistence(db).catch(() => {})

const provider = new GoogleAuthProvider()

// ── Auth helpers ─────────────────────────────────────────────────────────────
export const signInWithGoogle = () => signInWithPopup(auth, provider)
export const signOutUser      = () => signOut(auth)
export { auth }

// ── Firestore path helpers ────────────────────────────────────────────────────
const userRef       = (uid)             => doc(db, 'users', uid)
const settingsRef   = (uid)             => doc(db, 'users', uid, 'settings', 'preferences')
const dayLogRef     = (uid, dateKey)    => doc(db, 'users', uid, 'logs', dateKey)
const weekRef       = (uid, weekKey)    => doc(db, 'users', uid, 'weekly', weekKey)
const assignmentRef = (uid, id)         => doc(db, 'users', uid, 'assignments', id)
const assignColl    = (uid)             => collection(db, 'users', uid, 'assignments')

// ── Settings ──────────────────────────────────────────────────────────────────
export const SCHEMA_VERSION = 1

export async function loadSettings(uid) {
  const snap = await getDoc(settingsRef(uid))
  if (!snap.exists()) return null
  const data = snap.data()
  // Forward-migrate if schema version is old
  if ((data.schemaVersion || 0) < SCHEMA_VERSION) {
    const migrated = migrateSettings(data)
    await setDoc(settingsRef(uid), migrated)
    return migrated
  }
  return data
}

export async function saveSettings(uid, settings) {
  await setDoc(settingsRef(uid), { ...settings, schemaVersion: SCHEMA_VERSION })
}

function migrateSettings(old) {
  // v0 → v1: ensure all required fields exist with sensible defaults
  return {
    batch:                old.batch            ?? null,
    phaseManualOverride:  old.phaseManualOverride ?? null,
    tuesdayOutbound:      old.tuesdayOutbound  ?? 'rest',
    ddaIIIActive:         old.ddaIIIActive     ?? false,
    schemaVersion:        SCHEMA_VERSION,
  }
}

// ── Day logs ──────────────────────────────────────────────────────────────────
export async function loadDayLog(uid, dateKey) {
  const snap = await getDoc(dayLogRef(uid, dateKey))
  return snap.exists() ? snap.data() : null
}

export async function saveDayLog(uid, dateKey, log) {
  await setDoc(dayLogRef(uid, dateKey), log, { merge: true })
}

// ── Weekly (LinkedIn) ─────────────────────────────────────────────────────────
export async function loadWeekLog(uid, weekKey) {
  const snap = await getDoc(weekRef(uid, weekKey))
  return snap.exists() ? snap.data() : null
}

export async function saveWeekLog(uid, weekKey, data) {
  await setDoc(weekRef(uid, weekKey), data, { merge: true })
}

// ── Assignments ───────────────────────────────────────────────────────────────
export async function loadAssignments(uid) {
  const q    = query(assignColl(uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addAssignment(uid, assignment) {
  const ref = await addDoc(assignColl(uid), assignment)
  return ref.id
}

export async function updateAssignment(uid, id, changes) {
  await updateDoc(assignmentRef(uid, id), changes)
}

export async function deleteAssignment(uid, id) {
  await deleteDoc(assignmentRef(uid, id))
}

// ── Logs for streak calculation (last N days) ─────────────────────────────────
export async function loadLogsRange(uid, dateKeys) {
  const results = {}
  await Promise.all(
    dateKeys.map(async (key) => {
      const snap = await getDoc(dayLogRef(uid, key))
      results[key] = snap.exists() ? snap.data() : null
    })
  )
  return results
}

export async function loadWeekLogsRange(uid, weekKeys) {
  const results = {}
  await Promise.all(
    weekKeys.map(async (key) => {
      const snap = await getDoc(weekRef(uid, key))
      results[key] = snap.exists() ? snap.data() : null
    })
  )
  return results
}
