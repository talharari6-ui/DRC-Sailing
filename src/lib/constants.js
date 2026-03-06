// Day names in Hebrew
export const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

// Boat types
export const BOAT_TYPES = [
  'מלח',
  'קאנו',
  'קיאק',
  'לוח-גלישה',
  'דוני-דגים',
  'סירת-מנוע',
]

// Shirt sizes
export const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// Gender options
export const GENDERS = [
  { value: 'male', label: 'זכר' },
  { value: 'female', label: 'נקבה' },
  { value: 'other', label: 'אחר' },
]

// Color palette for groups (original colors from CSS)
export const GROUP_COLORS = [
  '#3b82f6', // blue
  '#7dd3fc', // blue-light
  '#34d399', // green
  '#f87171', // red
  '#fbbf24', // yellow
  '#a78bfa', // purple
  '#fb923c', // orange
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

// Color scheme (matches original CSS variables)
export const COLORS = {
  bg: '#0a1628',
  bg2: '#0d2444',
  bg3: '#0e3060',
  card: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.09)',
  blue: '#3b82f6',
  blueLight: '#7dd3fc',
  green: '#34d399',
  red: '#f87171',
  yellow: '#fbbf24',
  purple: '#a78bfa',
  text: '#e0f2fe',
  muted: '#64748b',
}

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: true,
  ABSENT: false,
  UNCONFIRMED: null,
}

// Session status
export const SESSION_STATUS = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
  PENDING_APPROVAL: 'pending_approval',
}

// Default pagination
export const ITEMS_PER_PAGE = 20
