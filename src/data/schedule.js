// ─────────────────────────────────────────────────────────────────────────────
// Schedule data — MSc ASA Semester III 2026-27
//
// All times are strings in "HH:MM" 24-hour format.
// Blocks fall into two categories:
//   FIXED   — college class, commute, break, admin. Shown as context, no checkbox.
//   TRACKED — study, internship_prep, fitness, linkedin. Have checkboxes.
//
// The schedule encodes TWO batch variants for Tuesday and Wednesday.
// The correct variant is selected at runtime based on user's batch setting.
//
// Stay-back mechanic:
//   Each day defines `lastClassEnd` and `nominalDeparture`.
//   `nominalDeparture` = lastClassEnd + ~60 min nominal stay-back.
//   When user enters extra stay-back minutes, ALL tracked home blocks shift
//   forward by that many minutes.
//   "Staying Back" is a synthetic display state active between
//   lastClassEnd and (nominalDeparture + extraStayBackMinutes).
//
// Dinner anchor: 21:00 (21:30 Friday). Tracked blocks shifted past anchor → Absorbed.
// ─────────────────────────────────────────────────────────────────────────────

export const BLOCK_TYPES = {
  COLLEGE:     'college',
  COMMUTE:     'commute',
  BREAK:       'break',
  ADMIN:       'admin',
  STUDY:       'study',
  PREP:        'internship_prep',
  FITNESS:     'fitness',
  LINKEDIN:    'linkedin',
}

// Subject colour tokens — used in UI
export const SUBJECT_COLOURS = {
  HPDM:  '#A855F7',
  IMLT:  '#3B82F6',
  FA:    '#10B981',
  MA:    '#F59E0B',
  SCV:   '#06B6D4',
  SCVI:  '#818CF8',
  PM:    '#8B5CF6',
  AAD:   '#EC4899',
  DDA:   '#FF6B6B',
}

export const BLOCK_COLOURS = {
  [BLOCK_TYPES.STUDY]:    '#60A5FA',
  [BLOCK_TYPES.PREP]:     '#C084FC',
  [BLOCK_TYPES.FITNESS]:  '#F87171',
  [BLOCK_TYPES.LINKEDIN]: '#38BDF8',
  [BLOCK_TYPES.COLLEGE]:  '#334155',
  [BLOCK_TYPES.COMMUTE]:  '#1E293B',
  [BLOCK_TYPES.BREAK]:    '#1E293B',
  [BLOCK_TYPES.ADMIN]:    '#1E293B',
}

// ─── Monday ──────────────────────────────────────────────────────────────────
// Ends: MA 13:00 | Nominal departure: 14:00 | Home: 16:00
const mondayBlocks = [
  { id: 'mon_commute_in',  type: BLOCK_TYPES.COMMUTE,  label: 'Commute — REST',           start: '05:00', end: '07:00', tracked: false },
  { id: 'mon_buffer',      type: BLOCK_TYPES.BREAK,    label: 'Settle in',                start: '07:00', end: '07:30', tracked: false },
  { id: 'mon_imlt_1',      type: BLOCK_TYPES.COLLEGE,  label: 'IMLT — RB',                start: '07:30', end: '09:30', tracked: false, subject: 'IMLT' },
  { id: 'mon_break_1',     type: BLOCK_TYPES.BREAK,    label: 'Break',                    start: '09:30', end: '10:00', tracked: false },
  { id: 'mon_pm',          type: BLOCK_TYPES.COLLEGE,  label: 'Project Management — PM',  start: '10:00', end: '12:00', tracked: false, subject: 'PM' },
  { id: 'mon_ma',          type: BLOCK_TYPES.COLLEGE,  label: 'MA — RS  (Room 103)',       start: '12:00', end: '13:00', tracked: false, subject: 'MA' },
  { id: 'mon_commute_out', type: BLOCK_TYPES.COMMUTE,  label: 'Commute home — REST',       start: '14:00', end: '16:00', tracked: false },
  { id: 'mon_unwind',      type: BLOCK_TYPES.BREAK,    label: 'Unwind',                   start: '16:00', end: '17:00', tracked: false },
  { id: 'mon_prep',        type: BLOCK_TYPES.PREP,     label: 'Internship Prep',          start: '17:00', end: '18:00', tracked: true  },
  { id: 'mon_study',       type: BLOCK_TYPES.STUDY,    label: 'Study — IMLT',             start: '18:00', end: '19:00', tracked: true,  subject: 'IMLT' },
  { id: 'mon_fitness',     type: BLOCK_TYPES.FITNESS,  label: 'Fitness (18 min)',         start: '19:00', end: '19:30', tracked: true,  sessionType: 'short' },
  { id: 'mon_admin',       type: BLOCK_TYPES.ADMIN,    label: 'Admin / CR / Free',        start: '19:30', end: '21:00', tracked: false },
  { id: 'mon_dinner',      type: BLOCK_TYPES.BREAK,    label: 'Dinner',                   start: '21:00', end: '22:00', tracked: false },
]

// ─── Tuesday Batch 1 (SC-VI on Tuesday) ──────────────────────────────────────
// Ends: SC-VI 14:00 | Nominal departure: 15:00 | Home: 17:00
const tuesdayB1Blocks = [
  { id: 'tue_commute_in',  type: BLOCK_TYPES.COMMUTE,  label: 'Commute — REST',          start: '05:00', end: '07:00', tracked: false },
  { id: 'tue_buffer',      type: BLOCK_TYPES.BREAK,    label: 'Settle in',               start: '07:00', end: '07:30', tracked: false },
  { id: 'tue_imlt',        type: BLOCK_TYPES.COLLEGE,  label: 'IMLT — RB',               start: '07:30', end: '09:30', tracked: false, subject: 'IMLT' },
  { id: 'tue_break_1',     type: BLOCK_TYPES.BREAK,    label: 'Break',                   start: '09:30', end: '10:00', tracked: false },
  { id: 'tue_fa',          type: BLOCK_TYPES.COLLEGE,  label: 'FA — AA',                 start: '10:00', end: '12:00', tracked: false, subject: 'FA' },
  { id: 'tue_scvi',        type: BLOCK_TYPES.COLLEGE,  label: 'SC-VI — NP  (LAB 8)',     start: '12:00', end: '14:00', tracked: false, subject: 'SCVI' },
  { id: 'tue_commute_out', type: BLOCK_TYPES.COMMUTE,  label: 'Commute home — REST',     start: '15:00', end: '17:00', tracked: false },
  { id: 'tue_unwind',      type: BLOCK_TYPES.BREAK,    label: 'Unwind',                  start: '17:00', end: '17:30', tracked: false },
  { id: 'tue_study',       type: BLOCK_TYPES.STUDY,    label: 'Study — FA',              start: '17:30', end: '18:30', tracked: true,  subject: 'FA' },
  { id: 'tue_prep',        type: BLOCK_TYPES.PREP,     label: 'Internship Prep',         start: '18:30', end: '19:30', tracked: true  },
  { id: 'tue_admin',       type: BLOCK_TYPES.ADMIN,    label: 'Admin / Free',            start: '19:30', end: '21:00', tracked: false },
  { id: 'tue_dinner',      type: BLOCK_TYPES.BREAK,    label: 'Dinner',                  start: '21:00', end: '22:00', tracked: false },
]

// ─── Tuesday Batch 2 (SC-VI on Wednesday) ────────────────────────────────────
// Ends: FA 12:00 | Nominal departure: 13:00 | Home: 15:00
const tuesdayB2Blocks = [
  { id: 'tue_commute_in',  type: BLOCK_TYPES.COMMUTE,  label: 'Commute — REST',            start: '05:00', end: '07:00', tracked: false },
  { id: 'tue_buffer',      type: BLOCK_TYPES.BREAK,    label: 'Settle in',                 start: '07:00', end: '07:30', tracked: false },
  { id: 'tue_imlt',        type: BLOCK_TYPES.COLLEGE,  label: 'IMLT — RB',                 start: '07:30', end: '09:30', tracked: false, subject: 'IMLT' },
  { id: 'tue_break_1',     type: BLOCK_TYPES.BREAK,    label: 'Break',                     start: '09:30', end: '10:00', tracked: false },
  { id: 'tue_fa',          type: BLOCK_TYPES.COLLEGE,  label: 'FA — AA',                   start: '10:00', end: '12:00', tracked: false, subject: 'FA' },
  { id: 'tue_commute_out', type: BLOCK_TYPES.COMMUTE,  label: 'Commute home — REST',       start: '13:00', end: '15:00', tracked: false },
  { id: 'tue_unwind',      type: BLOCK_TYPES.BREAK,    label: 'Unwind',                    start: '15:00', end: '15:30', tracked: false },
  { id: 'tue_study_fa',    type: BLOCK_TYPES.STUDY,    label: 'Study — FA',                start: '15:30', end: '16:30', tracked: true,  subject: 'FA' },
  { id: 'tue_prep',        type: BLOCK_TYPES.PREP,     label: 'Internship Prep',           start: '16:30', end: '17:30', tracked: true  },
  { id: 'tue_study_back',  type: BLOCK_TYPES.STUDY,    label: 'Study — IMLT/HPDM backlog', start: '17:30', end: '18:30', tracked: true,  subject: 'IMLT' },
  { id: 'tue_admin',       type: BLOCK_TYPES.ADMIN,    label: 'Admin / Free',              start: '18:30', end: '21:00', tracked: false },
  { id: 'tue_dinner',      type: BLOCK_TYPES.BREAK,    label: 'Dinner',                    start: '21:00', end: '22:00', tracked: false },
]

// ─── Wednesday Batch 1 (SC-VI on Tuesday) ────────────────────────────────────
// HPDM starts 07:00 (alt route — leave home 05:00, arrive 06:50)
// Ends: AAD 11:00 | Nominal departure: 12:00 | Home: 14:00
const wednesdayB1Blocks = [
  { id: 'wed_commute_in',  type: BLOCK_TYPES.COMMUTE,  label: 'Commute — REST  (alt route)', start: '05:00', end: '06:55', tracked: false },
  { id: 'wed_hpdm',        type: BLOCK_TYPES.COLLEGE,  label: 'HPDM — Sourav S.  ⚡ 7:00 AM', start: '07:00', end: '09:00', tracked: false, subject: 'HPDM' },
  { id: 'wed_aad',         type: BLOCK_TYPES.COLLEGE,  label: 'AAD — Subhash Sir',           start: '09:00', end: '11:00', tracked: false, subject: 'AAD' },
  { id: 'wed_commute_out', type: BLOCK_TYPES.COMMUTE,  label: 'Commute home — REST',         start: '12:00', end: '14:00', tracked: false },
  { id: 'wed_unwind',      type: BLOCK_TYPES.BREAK,    label: 'Unwind',                      start: '14:00', end: '15:00', tracked: false },
  { id: 'wed_study',       type: BLOCK_TYPES.STUDY,    label: 'Study — HPDM',               start: '15:00', end: '16:00', tracked: true,  subject: 'HPDM' },
  { id: 'wed_prep',        type: BLOCK_TYPES.PREP,     label: 'Internship Prep',            start: '16:00', end: '17:00', tracked: true  },
  { id: 'wed_fitness',     type: BLOCK_TYPES.FITNESS,  label: 'Fitness (18 min)',           start: '17:00', end: '17:30', tracked: true,  sessionType: 'short' },
  { id: 'wed_admin',       type: BLOCK_TYPES.ADMIN,    label: 'Admin / Free',               start: '17:30', end: '21:00', tracked: false },
  { id: 'wed_dinner',      type: BLOCK_TYPES.BREAK,    label: 'Dinner',                     start: '21:00', end: '22:00', tracked: false },
]

// ─── Wednesday Batch 2 (SC-VI on Wednesday) ──────────────────────────────────
// HPDM starts 07:00 (alt route)
// Ends: SC-VI 14:00 | Nominal departure: 15:00 | Home: 17:00
const wednesdayB2Blocks = [
  { id: 'wed_commute_in',  type: BLOCK_TYPES.COMMUTE,  label: 'Commute — REST  (alt route)',       start: '05:00', end: '06:55', tracked: false },
  { id: 'wed_hpdm',        type: BLOCK_TYPES.COLLEGE,  label: 'HPDM — Sourav S.  ⚡ 7:00 AM',     start: '07:00', end: '09:00', tracked: false, subject: 'HPDM' },
  { id: 'wed_aad',         type: BLOCK_TYPES.COLLEGE,  label: 'AAD — Subhash Sir',                start: '09:00', end: '11:00', tracked: false, subject: 'AAD' },
  { id: 'wed_break',       type: BLOCK_TYPES.BREAK,    label: 'Break',                            start: '11:00', end: '12:00', tracked: false },
  { id: 'wed_scvi',        type: BLOCK_TYPES.COLLEGE,  label: 'SC-VI — NP  (CR 927, Mithibai)',   start: '12:00', end: '14:00', tracked: false, subject: 'SCVI' },
  { id: 'wed_commute_out', type: BLOCK_TYPES.COMMUTE,  label: 'Commute home — REST',              start: '15:00', end: '17:00', tracked: false },
  { id: 'wed_unwind',      type: BLOCK_TYPES.BREAK,    label: 'Unwind',                           start: '17:00', end: '17:30', tracked: false },
  { id: 'wed_fitness',     type: BLOCK_TYPES.FITNESS,  label: 'Fitness (18 min)',                start: '17:30', end: '18:00', tracked: true,  sessionType: 'short' },
  { id: 'wed_study',       type: BLOCK_TYPES.STUDY,    label: 'Study — HPDM',                    start: '18:00', end: '19:00', tracked: true,  subject: 'HPDM' },
  { id: 'wed_prep',        type: BLOCK_TYPES.PREP,     label: 'Internship Prep',                 start: '19:00', end: '20:00', tracked: true  },
  { id: 'wed_admin',       type: BLOCK_TYPES.ADMIN,    label: 'Admin / Free',                    start: '20:00', end: '21:00', tracked: false },
  { id: 'wed_dinner',      type: BLOCK_TYPES.BREAK,    label: 'Dinner',                          start: '21:00', end: '22:00', tracked: false },
]

// ─── Thursday ─────────────────────────────────────────────────────────────────
// Ends: MA 13:00 | Nominal departure: 14:00 | Home: 16:00
const thursdayBlocks = [
  { id: 'thu_commute_in',  type: BLOCK_TYPES.COMMUTE,  label: 'Commute — REST',                  start: '05:00', end: '07:00', tracked: false },
  { id: 'thu_buffer',      type: BLOCK_TYPES.BREAK,    label: 'Settle in',                       start: '07:00', end: '07:30', tracked: false },
  { id: 'thu_scv',         type: BLOCK_TYPES.COLLEGE,  label: 'SC-V Practical — Kartik & Viral', start: '07:30', end: '09:30', tracked: false, subject: 'SCV' },
  { id: 'thu_break_1',     type: BLOCK_TYPES.BREAK,    label: 'Break',                           start: '09:30', end: '10:00', tracked: false },
  { id: 'thu_fa',          type: BLOCK_TYPES.COLLEGE,  label: 'FA — VP',                         start: '10:00', end: '12:00', tracked: false, subject: 'FA' },
  { id: 'thu_ma',          type: BLOCK_TYPES.COLLEGE,  label: 'MA — RS',                         start: '12:00', end: '13:00', tracked: false, subject: 'MA' },
  { id: 'thu_commute_out', type: BLOCK_TYPES.COMMUTE,  label: 'Commute home — light review',     start: '14:00', end: '16:00', tracked: false },
  { id: 'thu_unwind',      type: BLOCK_TYPES.BREAK,    label: 'Unwind',                          start: '16:00', end: '16:45', tracked: false },
  { id: 'thu_study',       type: BLOCK_TYPES.STUDY,    label: 'Study — FA / MA / SC-V HW',      start: '16:45', end: '17:45', tracked: true,  subject: 'FA' },
  { id: 'thu_prep',        type: BLOCK_TYPES.PREP,     label: 'Internship Prep',                start: '17:45', end: '18:45', tracked: true  },
  { id: 'thu_admin',       type: BLOCK_TYPES.ADMIN,    label: 'Admin / DDA-III / Free',         start: '18:45', end: '21:00', tracked: false },
  { id: 'thu_dinner',      type: BLOCK_TYPES.BREAK,    label: 'Dinner',                         start: '21:00', end: '22:00', tracked: false },
]

// ─── Friday ───────────────────────────────────────────────────────────────────
// Pressure day. Ends: DDA-III 17:00 | Nominal departure: 18:00 | Home: 20:30
// Almost no tracked blocks. LinkedIn optional during stay-back.
const fridayBlocks = [
  { id: 'fri_commute_in',  type: BLOCK_TYPES.COMMUTE,  label: 'Commute — REST',                    start: '05:00', end: '07:00', tracked: false },
  { id: 'fri_buffer',      type: BLOCK_TYPES.BREAK,    label: 'Settle in',                         start: '07:00', end: '07:30', tracked: false },
  { id: 'fri_hpdm',        type: BLOCK_TYPES.COLLEGE,  label: 'HPDM — Sourav S.',                  start: '07:30', end: '09:30', tracked: false, subject: 'HPDM' },
  { id: 'fri_break_1',     type: BLOCK_TYPES.BREAK,    label: 'Break',                             start: '09:30', end: '10:00', tracked: false },
  { id: 'fri_scv',         type: BLOCK_TYPES.COLLEGE,  label: 'SC-V Practical — Shraddha / LNK', start: '10:00', end: '12:00', tracked: false, subject: 'SCV' },
  { id: 'fri_lunch',       type: BLOCK_TYPES.BREAK,    label: 'Lunch — eat tiffin, rest',         start: '12:00', end: '13:00', tracked: false },
  { id: 'fri_ma',          type: BLOCK_TYPES.COLLEGE,  label: 'MA — RS',                           start: '13:00', end: '15:00', tracked: false, subject: 'MA' },
  { id: 'fri_dda',         type: BLOCK_TYPES.COLLEGE,  label: 'DDA-III — Shweta S. + Nikhil P.',  start: '15:00', end: '17:00', tracked: false, subject: 'DDA' },
  { id: 'fri_linkedin',    type: BLOCK_TYPES.LINKEDIN, label: 'LinkedIn  (optional stay-back)',    start: '17:00', end: '18:00', tracked: true  },
  { id: 'fri_commute_out', type: BLOCK_TYPES.COMMUTE,  label: 'Commute home — REST',               start: '18:00', end: '20:30', tracked: false },
  { id: 'fri_wind',        type: BLOCK_TYPES.BREAK,    label: 'Wind down',                        start: '20:30', end: '21:30', tracked: false },
  { id: 'fri_dinner',      type: BLOCK_TYPES.BREAK,    label: 'Dinner',                           start: '21:30', end: '22:30', tracked: false },
]

// ─── Saturday ─────────────────────────────────────────────────────────────────
// Free day. No college, no commute. Natural wake ~08:00.
const saturdayBlocks = [
  { id: 'sat_morning',     type: BLOCK_TYPES.BREAK,    label: 'Wake & morning routine',              start: '08:00', end: '09:00', tracked: false },
  { id: 'sat_breakfast',   type: BLOCK_TYPES.BREAK,    label: 'Breakfast / settle',                  start: '09:00', end: '09:30', tracked: false },
  { id: 'sat_fitness',     type: BLOCK_TYPES.FITNESS,  label: 'Fitness (38 min)',                   start: '09:30', end: '10:30', tracked: true,  sessionType: 'long' },
  { id: 'sat_refresh',     type: BLOCK_TYPES.BREAK,    label: 'Refresh / ease into work',           start: '10:30', end: '11:30', tracked: false },
  { id: 'sat_prep',        type: BLOCK_TYPES.PREP,     label: 'Internship Prep  (deep session)',    start: '11:30', end: '13:30', tracked: true  },
  { id: 'sat_lunch',       type: BLOCK_TYPES.BREAK,    label: 'Lunch + real break',                 start: '13:30', end: '14:30', tracked: false },
  { id: 'sat_study_hpdm',  type: BLOCK_TYPES.STUDY,    label: 'Study — HPDM  (deep, non-neg.)',    start: '14:30', end: '16:30', tracked: true,  subject: 'HPDM' },
  { id: 'sat_study_2',     type: BLOCK_TYPES.STUDY,    label: 'Study — IMLT / FA',                 start: '16:30', end: '17:30', tracked: true,  subject: 'IMLT' },
  { id: 'sat_study_3',     type: BLOCK_TYPES.STUDY,    label: 'Study — SC-V/SC-VI HW / MA / Backlog', start: '17:30', end: '18:30', tracked: true, subject: 'SCV' },
  { id: 'sat_linkedin',    type: BLOCK_TYPES.LINKEDIN, label: 'LinkedIn weekly / DDA-III prep',    start: '18:30', end: '19:30', tracked: true  },
  { id: 'sat_free',        type: BLOCK_TYPES.ADMIN,    label: 'Free time',                         start: '19:30', end: '21:00', tracked: false },
  { id: 'sat_dinner',      type: BLOCK_TYPES.BREAK,    label: 'Dinner',                            start: '21:00', end: '22:00', tracked: false },
]

// ─── Day config — used by stay-back mechanic ──────────────────────────────────
export const DAY_CONFIG = {
  monday: {
    lastClassEnd:     '13:00',
    nominalDeparture: '14:00',
    baseHomeArrival:  '16:00',
    dinnerAnchor:     '21:00',
    commuteDuration:  120,
  },
  tuesday_b1: {
    lastClassEnd:     '14:00',
    nominalDeparture: '15:00',
    baseHomeArrival:  '17:00',
    dinnerAnchor:     '21:00',
    commuteDuration:  120,
  },
  tuesday_b2: {
    lastClassEnd:     '12:00',
    nominalDeparture: '13:00',
    baseHomeArrival:  '15:00',
    dinnerAnchor:     '21:00',
    commuteDuration:  120,
  },
  wednesday_b1: {
    lastClassEnd:     '11:00',
    nominalDeparture: '12:00',
    baseHomeArrival:  '14:00',
    dinnerAnchor:     '21:00',
    commuteDuration:  120,
  },
  wednesday_b2: {
    lastClassEnd:     '14:00',
    nominalDeparture: '15:00',
    baseHomeArrival:  '17:00',
    dinnerAnchor:     '21:00',
    commuteDuration:  120,
  },
  thursday: {
    lastClassEnd:     '13:00',
    nominalDeparture: '14:00',
    baseHomeArrival:  '16:00',
    dinnerAnchor:     '21:00',
    commuteDuration:  120,
  },
  friday: {
    lastClassEnd:     '17:00',
    nominalDeparture: '18:00',
    baseHomeArrival:  '20:30',
    dinnerAnchor:     '21:30',
    commuteDuration:  150,  // post-5 PM = +30 min
  },
  saturday: {
    lastClassEnd:     null,
    nominalDeparture: null,
    baseHomeArrival:  null,
    dinnerAnchor:     '21:00',
    commuteDuration:  0,
  },
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the blocks and config for a given JS Date and batch (1 or 2).
 * dayIndex: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 */
export function getScheduleForDate(date, batch) {
  const day = date.getDay() // 0=Sun
  return getScheduleForDayIndex(day, batch)
}

export function getScheduleForDayIndex(dayIndex, batch) {
  switch (dayIndex) {
    case 0: return { blocks: [],             config: null,                   label: 'Sunday',    isFree: true }
    case 1: return { blocks: mondayBlocks,   config: DAY_CONFIG.monday,      label: 'Monday',    isFree: false }
    case 2: return batch === 1
      ? { blocks: tuesdayB1Blocks, config: DAY_CONFIG.tuesday_b1, label: 'Tuesday',   isFree: false }
      : { blocks: tuesdayB2Blocks, config: DAY_CONFIG.tuesday_b2, label: 'Tuesday',   isFree: false }
    case 3: return batch === 1
      ? { blocks: wednesdayB1Blocks, config: DAY_CONFIG.wednesday_b1, label: 'Wednesday', isFree: false }
      : { blocks: wednesdayB2Blocks, config: DAY_CONFIG.wednesday_b2, label: 'Wednesday', isFree: false }
    case 4: return { blocks: thursdayBlocks, config: DAY_CONFIG.thursday,    label: 'Thursday',  isFree: false }
    case 5: return { blocks: fridayBlocks,   config: DAY_CONFIG.friday,      label: 'Friday',    isFree: false }
    case 6: return { blocks: saturdayBlocks, config: DAY_CONFIG.saturday,    label: 'Saturday',  isFree: true  }
    default: return { blocks: [],            config: null,                   label: '',          isFree: true  }
  }
}

// Subjects for the assignments tab
export const SUBJECTS = [
  { code: 'IMLT',  label: 'Intro to Machine Learning Techniques', colour: SUBJECT_COLOURS.IMLT },
  { code: 'HPDM',  label: 'High Performance Data Mining',         colour: SUBJECT_COLOURS.HPDM },
  { code: 'FA',    label: 'Financial Analytics',                  colour: SUBJECT_COLOURS.FA   },
  { code: 'MA',    label: 'Marketing Analytics',                  colour: SUBJECT_COLOURS.MA   },
  { code: 'SCV',   label: 'Statistical Computing V',             colour: SUBJECT_COLOURS.SCV  },
  { code: 'SCVI',  label: 'Statistical Computing VI',            colour: SUBJECT_COLOURS.SCVI },
  { code: 'PM',    label: 'Project Management',                   colour: SUBJECT_COLOURS.PM   },
  { code: 'AAD',   label: 'Analytics Application Development',    colour: SUBJECT_COLOURS.AAD  },
  { code: 'DDA',   label: 'Data Driven Analytics III',           colour: SUBJECT_COLOURS.DDA  },
  { code: 'OTHER', label: 'Other',                                colour: '#6B7280'            },
]
