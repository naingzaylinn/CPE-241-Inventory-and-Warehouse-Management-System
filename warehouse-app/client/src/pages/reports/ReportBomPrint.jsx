import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { productsApi } from '../../api/products.api'
import { formatNumber } from '../../utils'

export default function ReportBomPrint() {
  const [products, setProducts] = useState([])
  const [f, setF] = useState({ product_code: '' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  useEffect(() => { productsApi.list().then(p => setProducts(p.filter(x => x.has_bom))) }, [])

  const selected = products.find(p => p.product_code === f.product_code)
  const run = async () => { setRows(await reportsApi.bomPrint(f)); setRan(true) }
  const cancel = () => { setF({ product_code: '' }); setRows([]); setRan(false) }
  const total = rows.reduce((s, r) => s + parseFloat(r.total_value), 0)

  return (
    <div>
      <div className="page-header"><span className="page-title">#02 — BOM Detail Report</span></div>
      <div className="report-filter">
        <p>BOM Detail Report Filter</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label>Product Code</label>
            <select value={f.product_code} onChange={e => setF({ product_code: e.target.value })}>
              <option value="">— Select —</option>
              {products.map(p => <option key={p.product_code} value={p.product_code}>{p.product_code}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Product Name</label>
            <input value={selected?.product_name || ''} disabled style={{ background: '#ddd' }} />
          </div>
          <button className="btn-primary" onClick={run}>OK</button>
          <button className="btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      </div>
      {ran && (
        <table>
          <thead><tr><th>No</th><th>Material Code</th><th>Material Name</th><th>Qty Needed</th><th>Unit</th><th>Unit Price</th><th>Total Value</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td><td>{r.material_code}</td><td>{r.material_name}</td>
                <td>{formatNumber(r.quantity_needed, 3)}</td><td>{r.material_unit}</td>
                <td>{formatNumber(r.unit_price)}</td><td>{formatNumber(r.total_value)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={7} className="text-center text-muted">No results</td></tr>}
            {rows.length > 0 && <tr className="row-total"><td colSpan={6} className="text-right">TOTAL BOM COST</td><td>{total.toFixed(2)}</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
