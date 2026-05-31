import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { warehousesApi } from '../../api/warehouses.api'
import { ConfirmModal, AlertModal } from '../../components/Modal'

export default function WarehouseList() {
  const nav = useNavigate()
  const [list, setList] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [alert, setAlert] = useState('')

  const load = () => warehousesApi.list().then(setList)
  useEffect(() => { load() }, [])

  const del = async (id) => {
    try { await warehousesApi.delete(id); load() }
    catch (e) { setAlert(e.data?.message || 'Cannot delete') }
    setConfirm(null)
  }

  return (
    <div>
      {alert && <AlertModal message={alert} onClose={() => setAlert('')} />}
      {confirm && <ConfirmModal message={`Delete "${confirm.id}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}
      <div className="page-header">
        <span className="page-title">Warehouse</span>
        <button className="btn-primary" onClick={() => nav('/warehouses/new')}>+ New</button>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Location</th><th style={{width:140}}>Actions</th></tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.warehouse_id}>
              <td>{r.warehouse_id}</td><td>{r.warehouse_name}</td><td>{r.location || '—'}</td>
              <td>
                <button className="btn-primary" style={{marginRight:6}} onClick={() => nav(`/warehouses/${r.warehouse_id}`)}>Edit</button>
                <button className="btn-danger" onClick={() => setConfirm({ id: r.warehouse_id })}>Delete</button>
              </td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={4} className="text-center text-muted">No records</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
