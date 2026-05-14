import { useState } from 'react';
import { useStudents } from '../hooks/useStudents';

const empty = { name: '', grade: '' };

export default function Students() {
  const { students, add, update, remove } = useStudents();
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    editId !== null ? update(editId, form) : add(form);
    setForm(empty);
    setEditId(null);
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setForm({ name: s.name, grade: s.grade });
  };

  return (
    <div>
      <h1>Students</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Grade"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
        />
        <button onClick={handleSubmit}>
          {editId !== null ? 'Update' : 'Add'}
        </button>
        {editId !== null && (
          <button onClick={() => { setEditId(null); setForm(empty); }}>
            Cancel
          </button>
        )}
      </div>

      <table width="100%" cellPadding={8} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ddd' }}>
            <th align="left">Name</th>
            <th align="left">Grade</th>
            <th align="left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td>{s.name}</td>
              <td>{s.grade}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>{' '}
                <button onClick={() => remove(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}