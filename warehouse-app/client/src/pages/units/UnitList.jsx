import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { unitsApi } from '../../api/units.api'
import { ConfirmModal, AlertModal } from '../../components/Modal'

export default function UnitList() {
  const nav = useNavigate()
  const [list, setList] = useState([])
  const [confirm, setConfirm] = useState(null)
  const [alert, setAlert] = useState('')

  const load = () => unitsApi.list().then(setList)
  useEffect(() => { load() }, [])

  const del = async (id) => {
    try { await unitsApi.delete(id); load() }
    catch (e) { setAlert(e.data?.message || 'Cannot delete') }
    setConfirm(null)
  }

  return (
    <div>
      {alert && <AlertModal message={alert} onClose={() => setAlert('')} />}
      {confirm && <ConfirmModal message={`Delete "${confirm.id}"?`} onConfirm={() => del(confirm.id)} onCancel={() => setConfirm(null)} />}
      <div className="page-header">
        <span className="page-title">Units</span>
        <button className="btn-primary" onClick={() => nav('/units/new')}>+ New</button>
      </div>
      <table>
        <thead><tr><th>Unit ID</th><th>Unit Name</th><th style={{width:140}}>Actions</th></tr></thead>
        <tbody>
          {list.map(r => (
            <tr key={r.unit_id}>
              <td>{r.unit_id}</td><td>{r.unit_name}</td>
              <td>
                <button className="btn-primary" style={{marginRight:6}} onClick={() => nav(`/units/${r.unit_id}`)}>Edit</button>
                <button className="btn-danger" onClick={() => setConfirm({ id: r.unit_id })}>Delete</button>
              </td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={3} className="text-center text-muted">No records</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
