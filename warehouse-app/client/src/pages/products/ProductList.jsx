import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '../../api/products.api'
import { productTypesApi } from '../../api/productTypes.api'
import { ConfirmModal, AlertModal } from '../../components/Modal'

export default function ProductList() {
  const nav = useNavigate()
  const [list, setList] = useState([])
  const [types, setTypes] = useState([])
  const [filterType, setFilterType] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [alert, setAlert] = useState('')

  const load = () => productsApi.list(filterType ? { type_id: filterType } : {}).then(setList)
  useEffect(() => { productTypesApi.list().then(setTypes) }, [])
  useEffect(() => { load() }, [filterType])

  const del = async (id) => {
    try { await productsApi.delete(id); load() }
    catch (e) { setAlert(e.data?.message || 'Cannot delete') }
    setConfirm(null)
  }

  return (
    <div>
      {alert && <AlertModal message={alert} onClose={() => setAlert('')} />}
      {confirm && <ConfirmModal message={`Delete "${confirm.id}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}
      <div className="page-header">
        <span className="page-title">Product</span>
        <button className="btn-primary" onClick={() => nav('/products/new')}>+ New</button>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <label style={{ fontSize: 13 }}>Filter by Type:</label>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ width: 180 }}>
          <option value="">All Types</option>
          {types.map(t => <option key={t.type_id} value={t.type_id}>{t.type_name}</option>)}
        </select>
      </div>
      <table>
        <thead>
          <tr><th>Code</th><th>Name</th><th>Type</th><th>Unit</th><th>Price</th><th>Has BOM</th><th style={{width:140}}>Actions</th></tr>
        </thead>
        <tbody>
          {list.map(r => (
            <tr key={r.product_code}>
              <td>{r.product_code}</td><td>{r.product_name}</td><td>{r.type_name}</td>
              <td>{r.unit_name}</td><td>{parseFloat(r.price).toFixed(2)}</td>
              <td>{r.has_bom ? 'Yes' : 'No'}</td>
              <td>
                <button className="btn-primary" style={{marginRight:6}} onClick={() => nav(`/products/${r.product_code}`)}>Edit</button>
                <button className="btn-danger" onClick={() => setConfirm({ id: r.product_code })}>Delete</button>
              </td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={7} className="text-center text-muted">No records</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
