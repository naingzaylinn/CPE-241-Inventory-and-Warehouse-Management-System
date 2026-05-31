import { useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { formatNumber } from '../../utils'

export default function ReportPurchaseBySupplier() {
  const [f, setF] = useState({ date_from: '', date_to: '' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  const run = async () => { setRows(await reportsApi.purchaseBySupplier(f)); setRan(true) }
  const cancel = () => { setF({ date_from: '', date_to: '' }); setRows([]); setRan(false) }

  return (
    <div>
      <div className="page-header"><span className="page-title">#06 — Purchase Quantity by Supplier (Analysis)</span></div>
      <div className="report-filter">
        <p>Purchase quantity by supplier (analysis)</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group"><label>From Date</label><input type="date" value={f.date_from} onChange={e => setF({ ...f, date_from: e.target.value })} /></div>
          <div className="form-group"><label>To Date</label><input type="date" value={f.date_to} onChange={e => setF({ ...f, date_to: e.target.value })} /></div>
          <button className="btn-primary" onClick={run}>OK</button>
          <button className="btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      </div>
      {ran && (
        <table>
          <thead><tr><th>Supplier ID</th><th>Supplier Name</th><th>Total Transactions</th><th>Total Qty Purchased</th><th>Total Purchase Value</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.supplier_id}>
                <td>{r.supplier_id}</td><td>{r.supplier_name}</td><td>{r.total_transactions}</td>
                <td>{formatNumber(r.total_qty_purchased, 3)}</td><td>{formatNumber(r.total_purchase_value)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="text-center text-muted">No results</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
