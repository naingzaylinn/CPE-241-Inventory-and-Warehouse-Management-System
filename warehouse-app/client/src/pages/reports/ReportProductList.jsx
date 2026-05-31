import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { productTypesApi } from '../../api/productTypes.api'
import { formatNumber } from '../../utils'

export default function ReportProductList() {
  const [types, setTypes] = useState([])
  const [f, setF] = useState({ type_id: '' })
  const [rows, setRows] = useState([])
  const [ran, setRan] = useState(false)

  useEffect(() => { productTypesApi.list().then(setTypes) }, [])

  const run = async () => { setRows(await reportsApi.productList(f)); setRan(true) }
  const cancel = () => { setF({ type_id: '' }); setRows([]); setRan(false) }

  return (
    <div>
      <div className="page-header"><span className="page-title">#01 — Product List</span></div>
      <div className="report-filter">
        <p>Product Report Filter</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
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
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Unit</th><th>Price</th><th>Has BOM</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.product_code}>
                <td>{r.product_code}</td><td>{r.product_name}</td><td>{r.type_name}</td>
                <td>{r.unit_name}</td><td>{formatNumber(r.price)}</td><td>{r.has_bom}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="text-center text-muted">No results</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  )
}
