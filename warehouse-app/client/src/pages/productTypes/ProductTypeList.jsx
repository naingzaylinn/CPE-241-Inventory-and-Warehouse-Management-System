
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productTypesApi } from '../../api/productTypes.api'
import { ConfirmModal, AlertModal } from '../../components/Modal'

export default function ProductTypeList() {
  const nav = useNavigate()
  const [list, setList] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [alert, setAlert] = useState('')

  const load = () => productTypesApi.list().then(setList)
  useEffect(() => { load() }, [])

  const del = async (id) => {
    try { await productTypesApi.delete(id); load() }
    catch (e) { setAlert(e.data?.message || 'Cannot delete') }
    setConfirm(null)
  }

  return (
    <div>
      {alert && <AlertModal message={alert} onClose={() => setAlert('')} />}
      {confirm && <ConfirmModal message={`Delete "${confirm.id}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}
      <div className="page-header">
        <span className="page-title">Product Type</span>
        <button className="btn-primary" onClick={() => nav('/product-types/new')}>+ New</button>
      </div>
      <table>
        <thead><tr><th>Type ID</th><th>Type Name</th><th style={{width:140}}>Actions</th></tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.type_id}>
              <td>{r.type_id}</td><td>{r.type_name}</td>
              <td>
                <button className="btn-primary" style={{marginRight:6}} onClick={() => nav(`/product-types/${r.type_id}`)}>Edit</button>
                <button className="btn-danger" onClick={() => setConfirm({ id: r.type_id })}>Delete</button>
              </td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={3} className="text-center text-muted">No records</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
