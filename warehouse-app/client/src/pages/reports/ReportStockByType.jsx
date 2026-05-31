import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { productTypesApi } from '../../api/productTypes.api'
import { formatNumber } from '../../utils'

export default function ReportStockByType() {
  const [types, setTypes] = useState([])
  const [f, setF] = useState({ as_of_date: '', type_id: '' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  useEffect(() => { productTypesApi.list().then(setTypes) }, [])
  const run = async () => { setRows(await reportsApi.stockByType(f)); setRan(true) }
  const cancel = () => { setF({ as_of_date: '', type_id: '' }); setRows([]); setRan(false) }

  return (
    <div>
      <div className="page-header"><span className="page-title">#03 — Stock Movement Summary by Product Type (Analysis)</span></div>
      <div className="report-filter">
        <p>Stock Movement Summary Report</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group"><label>As of Date</label><input type="date" value={f.as_of_date} onChange={e => setF({ ...f, as_of_date: e.target.value })} /></div>
          <div className="form-group">
            <label>Product Type</label>
            <select value={f.type_id} onChange={e => setF({ ...f, type_id: e.target.value })}>
              <option value="">All Types</option>
              {types.map(t => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={run}>OK</button>
          <button className="btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      </div>
      {ran && (
        <table>
          <thead><tr><th>Product Type</th><th>Total Qty IN</th><th>Total Qty OUT</th><th>Net Stock Balance</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.type_name}>
                <td>{r.type_name}</td>
                <td>{formatNumber(r.total_qty_in, 3)}</td>
                <td>{formatNumber(r.total_qty_out, 3)}</td>
                <td className={parseFloat(r.net_stock_balance) < 0 ? 'text-red' : 'text-green'}>{formatNumber(r.net_stock_balance, 3)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={4} className="text-center text-muted">No results</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
