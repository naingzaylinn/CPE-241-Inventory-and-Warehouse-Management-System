import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { stockSalesApi } from '../../api/stockSales.api'
import { customersApi } from '../../api/customers.api'
import { warehousesApi } from '../../api/warehouses.api'
import { productsApi } from '../../api/products.api'
import { ConfirmModal, AlertModal } from '../../components/Modal'
import { formatDate } from '../../utils'

export default function StockSalesList() {
  const nav = useNavigate()
  const [list, setList] = useState([])
  const [customers, setCustomers] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [f, setF] = useState({ date_from: '', date_to: '', customer_id: '', warehouse_id: '', product_code: '' })
  const [confirm, setConfirm] = useState(null)
  const [alert, setAlert] = useState('')

  const load = () => stockSalesApi.list(Object.fromEntries(Object.entries(f).filter(([, v]) => v))).then(setList)
  useEffect(() => {
    Promise.all([customersApi.list(), warehousesApi.list(), productsApi.list()]).then(([c, w, p]) => {
      setCustomers(c); setWarehouses(w); setProducts(p)
    })
    load()
  }, [])

  const del = async (id) => {
    try { await stockSalesApi.delete(id); load() }
    catch (e) { setAlert(e.data?.message || 'Cannot delete') }
    setConfirm(null)
  }

  return (
    <div>
      {alert && <AlertModal message={alert} onClose={() => setAlert('')} />}
      {confirm && <ConfirmModal message={`Delete "${confirm.id}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}
      <div className="page-header">
        <span className="page-title">Stock In/Out — Sales</span>
        <button className="btn-primary" onClick={() => nav('/stock/sales/new')}>+ New</button>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ minWidth: 140 }}><label>From Date</label><input type="date" value={f.date_from} onChange={e => setF({ ...f, date_from: e.target.value })} /></div>
        <div className="form-group" style={{ minWidth: 140 }}><label>To Date</label><input type="date" value={f.date_to} onChange={e => setF({ ...f, date_to: e.target.value })} /></div>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label>Customer</label>
          <select value={f.customer_id} onChange={e => setF({ ...f, customer_id: e.target.value })}>
            <option value="">All</option>
            {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.customer_name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label>Warehouse</label>
          <select value={f.warehouse_id} onChange={e => setF({ ...f, warehouse_id: e.target.value })}>
            <option value="">All</option>
            {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.warehouse_name}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ minWidth: 160 }}>
          <label>Product</label>
          <select value={f.product_code} onChange={e => setF({ ...f, product_code: e.target.value })}>
            <option value="">All</option>
            {products.map(p => <option key={p.product_code} value={p.product_code}>{p.product_code}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={load}>Search</button>
        <button className="btn-secondary" onClick={() => { setF({ date_from: '', date_to: '', customer_id: '', warehouse_id: '', product_code: '' }); setTimeout(load, 0) }}>Clear</button>
      </div>
      <table>
        <thead><tr><th>Stock No</th><th>Date</th><th>Warehouse</th><th>Reason</th><th>Customer</th><th style={{width:140}}>Actions</th></tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.stock_no}>
              <td>{r.stock_no}</td><td>{formatDate(r.stock_date)}</td><td>{r.warehouse_name}</td>
              <td>{r.reason}</td><td>{r.customer_name}</td>
              <td>
                <button className="btn-primary" style={{marginRight:6}} onClick={() => nav(`/stock/sales/${r.stock_no}`)}>View</button>
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
