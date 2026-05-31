import { useEffect, useState } from 'react'
import { reportsApi } from '../../api/reports.api'
import { stockPurchaseApi } from '../../api/stockPurchase.api'
import { formatDate, formatNumber } from '../../utils'

export default function ReportReceivingVoucher() {
  const [stockList, setStockList] = useState([])
  const [f, setF] = useState({ stock_no: '' })
  const [result, setResult] = useState(null)
  const [ran, setRan] = useState(false)

  useEffect(() => { stockPurchaseApi.list().then(setStockList) }, [])
  const run = async () => { setResult(await reportsApi.receivingVoucher(f)); setRan(true) }
  const cancel = () => { setF({ stock_no: '' }); setResult(null); setRan(false) }
  const total = result?.lines?.reduce((s, r) => s + parseFloat(r.extended_price), 0) || 0

  return (
    <div>
      <div className="page-header"><span className="page-title">#05 — Stock Receiving Voucher</span></div>
      <div className="report-filter">
        <p>Print Stock Receiving Voucher</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label>Stock No</label>
            <select value={f.stock_no} onChange={e => setF({ stock_no: e.target.value })}>
              <option value="">— Select —</option>
              {stockList.map(s => <option key={s.stock_no} value={s.stock_no}>{s.stock_no}</option>)}
            </select>
          </div>
          <button className="btn-primary" onClick={run}>OK</button>
          <button className="btn-secondary" onClick={cancel}>Cancel</button>
        </div>
      </div>
      {ran && result?.header && (
        <div>
          <div style={{ background: 'white', padding: 16, border: '1px solid #ddd', borderRadius: 8, marginBottom: 16 }}>
            <h4 style={{ marginBottom: 8 }}>Stock Receiving Voucher</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              <p><strong>Stock No:</strong> {result.header.stock_no}</p>
              <p><strong>Date:</strong> {formatDate(result.header.stock_date)}</p>
              <p><strong>Warehouse:</strong> {result.header.warehouse_name}</p>
              <p><strong>Reason:</strong> {result.header.reason}</p>
              <p><strong>Supplier:</strong> {result.header.supplier_name}</p>
              <p><strong>Contact:</strong> {result.header.contact_info || '—'}</p>
            </div>
          </div>
          <table>
            <thead><tr><th>No</th><th>Code</th><th>Name</th><th>Ref PO</th><th>Qty IN</th><th>Qty OUT</th><th>Unit</th><th>Unit Price</th><th>Extended Price</th></tr></thead>
            <tbody>
              {result.lines.map((r, i) => (
                <tr key={i}>
                  <td>{i + 1}</td><td>{r.product_code}</td><td>{r.product_name}</td>
                  <td>{r.ref_po_no || '—'}</td><td>{r.quantity_in ?? '—'}</td><td>{r.quantity_out ?? '—'}</td>
                  <td>{r.unit_name}</td><td>{formatNumber(r.unit_price)}</td><td>{formatNumber(r.extended_price)}</td>
                </tr>
              ))}
              <tr className="row-total"><td colSpan={8} className="text-right">TOTAL</td><td>{total.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
      )}
      {ran && !result?.header && <p className="text-muted text-center" style={{ padding: 16 }}>No record found.</p>}
    </div>
  )
}
