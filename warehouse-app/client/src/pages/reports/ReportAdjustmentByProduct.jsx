import { useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { formatNumber } from '../../utils'

export default function ReportAdjustmentByProduct() {
  const [f, setF] = useState({ date_from: '', date_to: '', limit: '5' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  const run = async () => { setRows(await reportsApi.adjustmentByProduct(f)); setRan(true) }
  const cancel = () => { setF({ date_from: '', date_to: '', limit: '5' }); setRows([]); setRan(false) }

  return (
    <div>
      <div className="page-header"><span className="page-title">#12 — Product Adjustment Summary by Period (Analysis)</span></div>
      <div className="report-filter">
        <p>Product Adjustment Summary by Period</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group"><label>From Date</label><input type="date" value={f.date_from} onChange={e => setF({ ...f, date_from: e.target.value })} /></div>
          <div className="form-group"><label>To Date</label><input type="date" value={f.date_to} onChange={e => setF({ ...f, date_to: e.target.value })} /></div>
          <div className="form-group">
            <label>Top N</label>
            <input type="number" value={f.limit} onChange={e => setF({ ...f, limit: e.target.value })} style={{ width: 70 }} min="1" />
          </div>
          <button className="btn-primary" onClick={run}>OK</button>
          <button className="btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      </div>
      {ran && (
        <table>
          <thead><tr><th>Product Code</th><th>Product Name</th><th>Qty Added</th><th>Qty Removed</th><th>Net Change</th><th>Vouchers Count</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.product_code}>
                <td>{r.product_code}</td><td>{r.product_name}</td>
                <td className="text-green">{formatNumber(r.qty_added, 3)}</td>
                <td className="text-red">{formatNumber(r.qty_removed, 3)}</td>
                <td className={parseFloat(r.net_change) < 0 ? 'text-red text-bold' : 'text-green text-bold'}>{formatNumber(r.net_change, 3)}</td>
                <td>{r.adjustment_vouchers_count}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="text-center text-muted">No results</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
