import { useState } from 'react';

const initial = [
  { id: 1, name: 'Ali Khan', grade: 'A' },
  { id: 2, name: 'Sara Ahmed', grade: 'B' },
];

export function useStudents() {
  const [students, setStudents] = useState(initial);

  const add = (data) =>
    setStudents((prev) => [...prev, { id: Date.now(), ...data }]);

  const update = (id, data) =>
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));

  const remove = (id) =>
    setStudents((prev) => prev.filter((s) => s.id !== id));

  return { students, add, update, remove };
}