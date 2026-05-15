import { useState, useEffect, useCallback } from 'react';
import api from "../api/axios";

const EMPTY_FORM = {
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    class: '',
    classId: '',
    section: '',
    rollNumber: '',
};

export default function Students() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterGender, setFilterGender] = useState('');

    // Modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ── Fetch all students ──────────────────────────────────────────────────────
    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/students", {
                // withCredentials: true,
            });
            const list = Array.isArray(res.data?.data?.data)
                ? res.data.data.data
                : [];

            setStudents(list);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load students.');
        } finally {
            setLoading(false);
        }
    }, []);
    // ── Fetch classes (for filter dropdown) ────────────────────────────────────
    const fetchClasses = useCallback(async () => {
        try {
            const res = await api.get(`/classes`);

            const list = Array.isArray(res.data?.data?.data)
                ? res.data.data.data
                : Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];

            setClasses(list);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, [fetchStudents, fetchClasses]);

    // ── Derived: available sections from selected filter class ──────────────────
    const selectedClassObj = classes.find(
        (c) => c.name === filterClass || c._id === filterClass
    );
    const availableSections = selectedClassObj?.sections ?? [];

    // ── Filtered students list ──────────────────────────────────────────────────
    const filtered = students.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const q = search.toLowerCase();

        if (q && !fullName.includes(q) && !String(s.rollNumber).includes(q)) return false;
        if (filterClass && s.class !== filterClass && s.classId?._id !== filterClass) return false;
        if (filterSection && s.section !== filterSection) return false;
        if (filterGender && s.gender !== filterGender) return false;

        return true;
    });

    // ── Open edit modal ─────────────────────────────────────────────────────────
    const openEdit = (student) => {
        setEditStudent(student);
        setForm({
            firstName: student.firstName ?? '',
            lastName: student.lastName ?? '',
            gender: student.gender ?? '',
            dateOfBirth: student.dateOfBirth?.slice(0, 10) ?? '',
            class: student.class ?? '',
            classId: student.classId?._id ?? student.classId ?? '',
            section: student.section ?? '',
            rollNumber: student.rollNumber ?? '',
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditStudent(null);
        setForm(EMPTY_FORM);
    };

    // ── Save (update) ───────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.firstName.trim()) return;
        setSaving(true);
        try {
            await api.patch(`/students/${editStudent._id}`, form);
            await fetchStudents();
            closeModal();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update student.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await api.delete(`/students/${id}`);
            setStudents((prev) => prev.filter((s) => s._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete student.');
        } finally {
            setDeleteTarget(null);
        }
    };

    // ── Sections for the edit form's class ─────────────────────────────────────
    const editClassObj = classes.find(
        (c) => c._id === form.classId || c.name === form.class
    );
    const editSections = editClassObj?.sections ?? [];

    // ────────────────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Students</h1>
                <span className="text-xl text-gray-500">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {/* ── Search & Filters ── */}
            <div className="flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search name or roll no…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-400 rounded px-3 py-2 text-md flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                {/* Class filter */}
                <select
                    value={filterClass}
                    onChange={(e) => { setFilterClass(e.target.value); setFilterSection(''); }}
                    className="border border-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                </select>

                {/* Section filter — only if a class with sections is chosen */}
                {availableSections.length > 0 && (
                    <select
                        value={filterSection}
                        onChange={(e) => setFilterSection(e.target.value)}
                        className="border border-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">All Sections</option>
                        {availableSections.map((sec) => (
                            <option key={sec} value={sec}>{sec}</option>
                        ))}
                    </select>
                )}

                {/* Gender filter */}
                <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="border border-gray-400 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>

                {/* Clear filters */}
                {(search || filterClass || filterSection || filterGender) && (
                    <button
                        onClick={() => { setSearch(''); setFilterClass(''); setFilterSection(''); setFilterGender(''); }}
                        className="text-sm text-red-500 hover:underline px-2"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* ── Error ── */}
            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded text-sm">{error}</div>
            )}

            {/* ── Table ── */}
            {loading ? (
                <p className="text-gray-400 text-sm">Loading…</p>
            ) : (
                <div className="overflow-x-auto rounded border border-gray-300">
                    <table className="w-full text-md body-text">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-md">
                            <tr>
                                <th className="px-4 py-3 text-left">Roll #</th>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Gender</th>
                                <th className="px-4 py-3 text-left">Class</th>
                                <th className="px-4 py-3 text-left">Section</th>
                                <th className="px-4 py-3 text-left">DOB</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-6 text-center text-gray-400">No students found.</td>
                                </tr>
                            ) : (
                                filtered.map((s) => (
                                    <tr key={s._id} className="hover:bg-gray-200 transition-colors">
                                        <td className="px-4 py-3 text-gray-500">{s.rollNumber}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{s.firstName} {s.lastName}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.gender}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.classId?.name ?? s.class}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.section}</td>
                                        <td className="px-4 py-3 text-gray-600">{s.dateOfBirth?.slice(0, 10)}</td>
                                        <td className="px-4 py-3 flex gap-2">
                                            <button
                                                onClick={() => openEdit(s)}
                                                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget(s)}
                                                className="px-3 py-1 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">Edit Student</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">First Name</label>
                                <input
                                    value={form.firstName}
                                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Last Name</label>
                                <input
                                    value={form.lastName}
                                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Roll Number</label>
                                <input
                                    type="number"
                                    value={form.rollNumber}
                                    onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Gender</label>
                                <select
                                    value={form.gender}
                                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    value={form.dateOfBirth}
                                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Class</label>
                                <select
                                    value={form.classId}
                                    onChange={(e) => {
                                        const cls = classes.find((c) => c._id === e.target.value);
                                        setForm({ ...form, classId: e.target.value, class: cls?.name ?? '', section: '' });
                                    }}
                                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="">Select class</option>
                                    {classes.map((c) => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            {editSections.length > 0 && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Section</label>
                                    <select
                                        value={form.section}
                                        onChange={(e) => setForm({ ...form, section: e.target.value })}
                                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    >
                                        <option value="">Select section</option>
                                        {editSections.map((sec) => (
                                            <option key={sec} value={sec}>{sec}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm ── */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">Delete Student</h2>
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>? This cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteTarget._id)}
                                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}