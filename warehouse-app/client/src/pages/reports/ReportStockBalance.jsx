import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { warehousesApi } from '../../api/warehouses.api'
import { productsApi } from '../../api/products.api'
import { formatNumber } from '../../utils'

export default function ReportStockBalance() {
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [f, setF] = useState({ as_of_date: '', warehouse_id: '', product_code: '' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  useEffect(() => {
    Promise.all([warehousesApi.list(), productsApi.list()]).then(([w, p]) => { setWarehouses(w); setProducts(p) })
  }, [])

  const run = async () => { setRows(await reportsApi.stockBalance(f)); setRan(true) }
  const cancel = () => { setF({ as_of_date: '', warehouse_id: '', product_code: '' }); setRows([]); setRan(false) }

  return (
    <div>
      <div className="page-header"><span className="page-title">#10 — Stock Balance Report</span></div>
      <div className="report-filter">
        <p>Stock Balance Report</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group"><label>As of Date</label><input type="date" value={f.as_of_date} onChange={e => setF({ ...f, as_of_date: e.target.value })} /></div>
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
          <thead><tr><th>Warehouse</th><th>Product Code</th><th>Product Name</th><th>Unit</th><th>Total IN</th><th>Total OUT</th><th>Balance</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.warehouse_name}</td><td>{r.product_code}</td><td>{r.product_name}</td>
                <td>{r.unit_name}</td><td>{formatNumber(r.total_in, 3)}</td><td>{formatNumber(r.total_out, 3)}</td>
                <td className={parseFloat(r.balance) < 0 ? 'text-red text-bold' : 'text-green text-bold'}>{formatNumber(r.balance, 3)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="text-center text-muted">No results</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
