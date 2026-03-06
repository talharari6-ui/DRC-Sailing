'use client'

export default function AdminSubstitutions() {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '800' }}>🔄 החלפות מדריכים</h1>
      </div>
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '32px 16px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔄</div>
        <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
          עמוד החלפות מדריכים - ניהול החלפות ואישורים
        </p>
      </div>
    </div>
  )
}
