function FilterToggle({ currentFilter, onFilterChange }) {
  const filters = [
    { value: 'all', label: 'כל המדריכים' },
    { value: 'my', label: 'שלי בלבד' }
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
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor:
              currentFilter === filter.value
                ? 'var(--blue-light)'
                : 'var(--bg2)',
            color:
              currentFilter === filter.value
                ? '#fff'
                : 'var(--text)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: currentFilter === filter.value ? '600' : '400',
            transition: 'all 0.2s',
            minWidth: '80px'
          }}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default FilterToggle
