import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { warehousesApi } from '../../api/warehouses.api'
import { productsApi } from '../../api/products.api'
import { formatDate, formatNumber } from '../../utils'

export default function ReportStockCard() {
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [f, setF] = useState({ date_from: '', date_to: '', warehouse_id: '', product_code: '' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  useEffect(() => {
    Promise.all([warehousesApi.list(), productsApi.list()]).then(([w, p]) => { setWarehouses(w); setProducts(p) })
  }, [])

  const run = async () => { setRows(await reportsApi.stockCard(f)); setRan(true) }
  const cancel = () => { setF({ date_from: '', date_to: '', warehouse_id: '', product_code: '' }); setRows([]); setRan(false) }

  return (
    <div>
      <div className="page-header"><span className="page-title">#11 — Stock Card Report</span></div>
      <div className="report-filter">
        <p>Stock Card Report</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group"><label>From Date</label><input type="date" value={f.date_from} onChange={e => setF({ ...f, date_from: e.target.value })} /></div>
          <div className="form-group"><label>To Date</label><input type="date" value={f.date_to} onChange={e => setF({ ...f, date_to: e.target.value })} /></div>
          <div className="form-group">
            <label>Warehouse Code</label>
            <select value={f.warehouse_id} onChange={e => setF({ ...f, warehouse_id: e.target.value })}>
              <option value="">Blank for all</option>
              {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_id} — {w.warehouse_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Product</label>
            <select value={f.product_code} onChange={e => setF({ ...f, product_code: e.target.value })}>
              <option value="">Blank for all</option>
              {products.map(p => <option key={p.product_code} value={p.product_code}>{p.product_code} — {p.product_name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={run}>OK</button>
          <button className="btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      </div>
      {ran && (
        <table>
          <thead><tr><th>Date</th><th>Stock No</th><th>Warehouse</th><th>Product Code</th><th>Product Name</th><th>Reason</th><th>Qty IN</th><th>Qty OUT</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{formatDate(r.stock_date)}</td><td>{r.stock_no}</td><td>{r.warehouse_name}</td>
                <td>{r.product_code}</td><td>{r.product_name}</td><td>{r.reason}</td>
                <td>{formatNumber(r.qty_in, 3)}</td><td>{formatNumber(r.qty_out, 3)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={8} className="text-center text-muted">No results</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
