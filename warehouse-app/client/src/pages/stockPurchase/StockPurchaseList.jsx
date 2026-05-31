import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockPurchaseApi } from '../../api/stockPurchase.api'
import { suppliersApi } from '../../api/suppliers.api'
import { ConfirmModal, AlertModal } from '../../components/Modal'
import { formatDate } from '../../utils'

export default function StockPurchaseList() {
  const nav = useNavigate()
  const [list, setList] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [f, setF] = useState({ date_from: '', date_to: '', supplier_id: '' })
  const [confirm, setConfirm] = useState(null)
  const [alert, setAlert] = useState('')

  const load = () => stockPurchaseApi.list(Object.fromEntries(Object.entries(f).filter(([, v]) => v))).then(setList)
  useEffect(() => { suppliersApi.list().then(setSuppliers); load() }, [])

  const del = async (id) => {
    try { await stockPurchaseApi.delete(id); load() }
    catch (e) { setAlert(e.data?.message || 'Cannot delete') }
    setConfirm(null)
  }

  return (
    <div>
      {alert && <AlertModal message={alert} onClose={() => setAlert('')} />}
      {confirm && <ConfirmModal message={`Delete "${confirm.id}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}
      <div className="page-header">
        <span className="page-title">Stock In/Out — Purchase PO</span>
        <button className="btn-primary" onClick={() => nav('/stock/purchase/new')}>+ New</button>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ minWidth: 140 }}><label>From Date</label><input type="date" value={f.date_from} onChange={e => setF({ ...f, date_from: e.target.value })} /></div>
        <div className="form-group" style={{ minWidth: 140 }}><label>To Date</label><input type="date" value={f.date_to} onChange={e => setF({ ...f, date_to: e.target.value })} /></div>
        <div className="form-group" style={{ minWidth: 180 }}>
          <label>Supplier</label>
          <select value={f.supplier_id} onChange={e => setF({ ...f, supplier_id: e.target.value })}>
            <option value="">All Suppliers</option>
            {suppliers.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={load}>Search</button>
        <button className="btn-secondary" onClick={() => { setF({ date_from: '', date_to: '', supplier_id: '' }); setTimeout(load, 0) }}>Clear</button>
      </div>
      <table>
        <thead><tr><th>Stock No</th><th>Date</th><th>Warehouse</th><th>Reason</th><th>Supplier</th><th style={{width:140}}>Actions</th></tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.stock_no}>
              <td>{r.stock_no}</td><td>{formatDate(r.stock_date)}</td><td>{r.warehouse_name}</td>
              <td>{r.reason}</td><td>{r.supplier_name}</td>
              <td>
                <button className="btn-primary" style={{marginRight:6}} onClick={() => nav(`/stock/purchase/${r.stock_no}`)}>View</button>
                <button className="btn-danger" onClick={() => setConfirm({ id: r.stock_no })}>Delete</button>
              </td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={6} className="text-center text-muted">No records</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
