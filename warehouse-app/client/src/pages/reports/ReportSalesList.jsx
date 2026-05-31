import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { customersApi } from '../../api/customers.api'
import { warehousesApi } from '../../api/warehouses.api'
import { productsApi } from '../../api/products.api'
import { formatDate, formatNumber } from '../../utils'

export default function ReportSalesList() {
  const [customers, setCustomers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [f, setF] = useState({ date_from: '', date_to: '', customer_id: '', warehouse_id: '', product_code: '' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  useEffect(() => {
    Promise.all([customersApi.list(), warehousesApi.list(), productsApi.list()]).then(([c, w, p]) => {
      setCustomers(c); setWarehouses(w); setProducts(p)
    })
  }, [])

  const run = async () => { setRows(await reportsApi.salesList(f)); setRan(true) }
  const cancel = () => { setF({ date_from: '', date_to: '', customer_id: '', warehouse_id: '', product_code: '' }); setRows([]); setRan(false) }

  return (
    <div>
      <div className="page-header"><span className="page-title">#07 — Sales Stock Records</span></div>
      <div className="report-filter">
        <p>Sales Stock Records List</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group"><label>From Date</label><input type="date" value={f.date_from} onChange={e => setF({ ...f, date_from: e.target.value })} /></div>
          <div className="form-group"><label>To Date</label><input type="date" value={f.date_to} onChange={e => setF({ ...f, date_to: e.target.value })} /></div>
          <div className="form-group">
            <label>Customer Code</label>
            <select value={f.customer_id} onChange={e => setF({ ...f, customer_id: e.target.value })}>
              <option value="">All</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_id} — {c.customer_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Warehouse</label>
            <select value={f.warehouse_id} onChange={e => setF({ ...f, warehouse_id: e.target.value })}>
              <option value="">All</option>
              {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Product Code</label>
            <select value={f.product_code} onChange={e => setF({ ...f, product_code: e.target.value })}>
              <option value="">All</option>
              {products.map(p => <option key={p.product_code} value={p.product_code}>{p.product_code}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={run}>OK</button>
          <button className="btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      </div>
      {ran && (
        <table>
          <thead><tr><th>Stock No</th><th>Date</th><th>Warehouse</th><th>Reason</th><th>Customer</th><th>Product</th><th>Ref SO</th><th>Qty OUT</th><th>Qty IN</th><th>Unit</th><th>Unit Price</th><th>Extended Price</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.stock_no}</td><td>{formatDate(r.stock_date)}</td><td>{r.warehouse_name}</td>
                <td>{r.reason}</td><td>{r.customer_name}</td>
                <td>{r.product_code} — {r.product_name}</td><td>{r.ref_so_no || '—'}</td>
                <td>{r.quantity_out ?? '—'}</td><td>{r.quantity_in ?? '—'}</td>
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
