import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { suppliersApi } from '../../api/suppliers.api'
import { formatDate, formatNumber } from '../../utils'

export default function ReportPurchaseList() {
  const [suppliers, setSuppliers] = useState([])
  const [f, setF] = useState({ date_from: '', date_to: '', supplier_id: '' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  useEffect(() => { suppliersApi.list().then(setSuppliers) }, [])
  const run = async () => { setRows(await reportsApi.purchaseList(f)); setRan(true) }
  const cancel = () => { setF({ date_from: '', date_to: '', supplier_id: '' }); setRows([]); setRan(false) }

  return (
    <div>
      <div className="page-header"><span className="page-title">#04 — Purchase Stock Records</span></div>
      <div className="report-filter">
        <p>Purchase stock records</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group"><label>From Date</label><input type="date" value={f.date_from} onChange={e => setF({ ...f, date_from: e.target.value })} /></div>
          <div className="form-group"><label>To Date</label><input type="date" value={f.date_to} onChange={e => setF({ ...f, date_to: e.target.value })} /></div>
          <div className="form-group">
            <label>Supplier</label>
            <select value={f.supplier_id} onChange={e => setF({ ...f, supplier_id: e.target.value })}>
              <option value="">All Suppliers</option>
              {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={run}>OK</button>
          <button className="btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      </div>
      {ran && (
        <table>
          <thead><tr><th>Stock No</th><th>Date</th><th>Warehouse</th><th>Reason</th><th>Supplier</th><th>Product</th><th>Ref PO</th><th>Qty IN</th><th>Qty OUT</th><th>Unit</th><th>Unit Price</th><th>Extended Price</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.stock_no}</td><td>{formatDate(r.stock_date)}</td><td>{r.warehouse_name}</td>
                <td>{r.reason}</td><td>{r.supplier_name}</td>
                <td>{r.product_code} — {r.product_name}</td><td>{r.ref_po_no || '—'}</td>
                <td>{r.quantity_in ?? '—'}</td><td>{r.quantity_out ?? '—'}</td>
                <td>{r.unit_name}</td><td>{formatNumber(r.unit_price)}</td><td>{formatNumber(r.extended_price)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={12} className="text-center text-muted">No results</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
