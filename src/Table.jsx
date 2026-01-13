
import { useState } from 'react'

export default function Table({ cols, rows }) {
  const [q, setQ] = useState('');
  const [p, setP] = useState(1);
  const size = 10;

  const filtered = rows.filter(r =>
    Object.values(r).some(val =>
      String(val).toLowerCase().includes(q.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filtered.length / size);
  const page = filtered.slice((p - 1) * size, p * size);

  return (
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input
            placeholder="Search records..."
            style={{
              padding: '10px 12px 10px 36px',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              outline: 'none',
              fontSize: 14,
              width: 250
            }}
            value={q}
            onChange={e => { setQ(e.target.value); setP(1); }}
          />
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Showing {page.length} of {filtered.length} results
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
            <tr>
              {cols.map(c => (
                <th key={c} style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  {c.replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {page.length > 0 ? page.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#fcfdfe'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                {cols.map(c => (
                  <td key={c} style={{ padding: '14px 20px', fontSize: 14, color: '#334155' }}>
                    {c === 'status' ? (
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 600,
                        background: r[c] === 'Paid' ? '#dcfce7' : '#fee2e2',
                        color: r[c] === 'Paid' ? '#166534' : '#991b1b'
                      }}>
                        {r[c]}
                      </span>
                    ) : r[c]}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={cols.length} style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                  No records found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', gap: 10, alignItems: 'center' }}>
        <button
          disabled={p === 1}
          onClick={() => setP(p - 1)}
          style={{ ...pageBtn, opacity: p === 1 ? 0.5 : 1, cursor: p === 1 ? 'not-allowed' : 'pointer' }}
        >
          Previous
        </button>
        <span style={{ fontSize: 14, color: '#64748b' }}>
          Page <strong>{p}</strong> of <strong>{totalPages || 1}</strong>
        </span>
        <button
          disabled={p >= totalPages}
          onClick={() => setP(p + 1)}
          style={{ ...pageBtn, opacity: p >= totalPages ? 0.5 : 1, cursor: p >= totalPages ? 'not-allowed' : 'pointer' }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

const pageBtn = {
  background: 'white',
  border: '1px solid #e2e8f0',
  padding: '6px 12px',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  color: '#334155'
};
