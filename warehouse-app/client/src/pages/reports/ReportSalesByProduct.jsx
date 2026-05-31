import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { productsApi } from '../../api/products.api'
import { formatNumber } from '../../utils'

export default function ReportSalesByProduct() {
  const [products, setProducts] = useState([])
  const [f, setF] = useState({ date_from: '', date_to: '', product_code: '' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  useEffect(() => { productsApi.list().then(setProducts) }, [])
  const run = async () => { setRows(await reportsApi.salesByProduct(f)); setRan(true) }
  const cancel = () => { setF({ date_from: '', date_to: '', product_code: '' }); setRows([]); setRan(false) }

  return (
    <div>
      <div className="page-header"><span className="page-title">#09 — Sales Summary by Product (Analysis)</span></div>
      <div className="report-filter">
        <p>Sales Summary by Product</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group"><label>From Date</label><input type="date" value={f.date_from} onChange={e => setF({ ...f, date_from: e.target.value })} /></div>
          <div className="form-group"><label>To Date</label><input type="date" value={f.date_to} onChange={e => setF({ ...f, date_to: e.target.value })} /></div>
          <div className="form-group">
            <label>Product Code</label>
            <select value={f.product_code} onChange={e => setF({ ...f, product_code: e.target.value })}>
              <option value="">All Products</option>
              {products.map(p => <option key={p.product_code} value={p.product_code}>{p.product_code} — {p.product_name}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={run}>OK</button>
          <button className="btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      </div>
      {ran && (
        <table>
          <thead><tr><th>Product Code</th><th>Product Name</th><th>Total Orders</th><th>Total Qty Sold</th><th>Total Sales Value</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.product_code}>
                <td>{r.product_code}</td><td>{r.product_name}</td><td>{r.total_orders}</td>
                <td>{formatNumber(r.total_qty_sold, 3)}</td><td>{formatNumber(r.total_sales_value)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="text-center text-muted">No results</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
