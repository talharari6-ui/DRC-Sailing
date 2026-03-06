export default function ViewModeToggle({ currentMode, onModeChange }) {
  const modes = [
    { value: 'month', label: 'חודש' },
    { value: 'week', label: 'שבוע' },
    { value: 'day', label: 'יום' }
  ]

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '12px',
        direction: 'rtl',
        justifyContent: 'center'
      }}
    >
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onModeChange(mode.value)}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor:
              currentMode === mode.value
                ? 'var(--blue-light)'
                : 'var(--bg2)',
            color:
              currentMode === mode.value
                ? '#fff'
                : 'var(--text)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: currentMode === mode.value ? '600' : '400',
            transition: 'all 0.2s',
            minWidth: '60px'
          }}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
