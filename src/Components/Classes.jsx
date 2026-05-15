import { useState, useEffect, useCallback } from 'react';
import api from "../api/axios";

const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

const EMPTY_FORM = {
    name: '',
    hasSections: false,
    sections: [],
};

export default function Classes() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [filterSections, setFilterSections] = useState(''); // 'yes' | 'no' | ''

    // Edit modal
    const [modalOpen, setModalOpen] = useState(false);
    const [editClass, setEditClass] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [customSection, setCustomSection] = useState('');

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState(null);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    const fetchClasses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/classes');
            const list = Array.isArray(res.data?.data?.data)
                ? res.data.data.data
                : Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data
                        : [];
            setClasses(list);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load classes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchClasses(); }, [fetchClasses]);

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filtered = classes.filter((c) => {
        if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterSections === 'yes' && !c.hasSections) return false;
        if (filterSections === 'no' && c.hasSections) return false;
        return true;
    });

    // ── Edit modal ────────────────────────────────────────────────────────────
    const openEdit = (cls) => {
        setEditClass(cls);
        setForm({
            name: cls.name ?? '',
            hasSections: cls.hasSections ?? false,
            sections: cls.sections ? [...cls.sections] : [],
        });
        setCustomSection('');
        setSaveError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditClass(null);
        setForm(EMPTY_FORM);
        setCustomSection('');
        setSaveError('');
    };

    // ── Section helpers inside modal ──────────────────────────────────────────
    const toggleSection = (sec) => {
        setForm((prev) => ({
            ...prev,
            sections: prev.sections.includes(sec)
                ? prev.sections.filter((s) => s !== sec)
                : [...prev.sections, sec],
        }));
    };

    const addCustomSection = () => {
        const val = customSection.trim().toUpperCase();
        if (!val) return;
        if (form.sections.includes(val)) {
            setSaveError(`Section "${val}" is already added.`);
            return;
        }
        setForm((prev) => ({ ...prev, sections: [...prev.sections, val] }));
        setCustomSection('');
        setSaveError('');
    };

    const removeSection = (sec) => {
        setForm((prev) => ({ ...prev, sections: prev.sections.filter((s) => s !== sec) }));
    };

    const toggleHasSections = (checked) => {
        setForm((prev) => ({
            ...prev,
            hasSections: checked,
            sections: checked ? prev.sections : [],
        }));
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!form.name.trim()) { setSaveError('Class name is required.'); return; }
        if (form.hasSections && form.sections.length === 0) {
            setSaveError('Add at least one section, or uncheck "Has Sections".');
            return;
        }

        setSaving(true);
        setSaveError('');
        try {
            await api.patch(`/classes/${editClass._id}`, {
                name: form.name.trim(),
                hasSections: form.hasSections,
                sections: form.hasSections ? form.sections : [],
            });
            await fetchClasses();
            closeModal();
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to update class.');
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async (id) => {
        try {
            await api.delete(`/classes/${id}`);
            setClasses((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete class.');
        } finally {
            setDeleteTarget(null);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 space-y-6">

            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
                <span className="text-sm text-gray-500">
                    {filtered.length} class{filtered.length !== 1 ? 'es' : ''}
                </span>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-wrap gap-3">
                <input
                    type="text"
                    placeholder="Search by class name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select
                    value={filterSections}
                    onChange={(e) => setFilterSections(e.target.value)}
                    className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <option value="">All Classes</option>
                    <option value="yes">Has Sections</option>
                    <option value="no">No Sections</option>
                </select>
                {(search || filterSections) && (
                    <button
                        onClick={() => { setSearch(''); setFilterSections(''); }}
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
                <div className="overflow-x-auto rounded border border-gray-200">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Class Name</th>
                                <th className="px-4 py-3 text-left">Has Sections</th>
                                <th className="px-4 py-3 text-left">Sections</th>
                                <th className="px-4 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                        No classes found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800">{c.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${c.hasSections ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                {c.hasSections ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {c.sections?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {c.sections.map((sec) => (
                                                        <span key={sec} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                                            {sec}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(c)}
                                                    className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(c)}
                                                    className="px-3 py-1 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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
                        <h2 className="text-lg font-semibold text-gray-800">Edit Class</h2>

                        {saveError && (
                            <div className="px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
                                {saveError}
                            </div>
                        )}

                        <div className="space-y-4">

                            {/* Class Name */}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Class Name <span className="text-red-500">*</span></label>
                                <input
                                    value={form.name}
                                    onChange={(e) => { setForm({ ...form, name: e.target.value }); setSaveError(''); }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="e.g. 9, 10, One"
                                />
                            </div>

                            {/* Has Sections toggle */}
                            <div className="flex items-center gap-3">
                                <input
                                    id="editHasSections"
                                    type="checkbox"
                                    checked={form.hasSections}
                                    onChange={(e) => toggleHasSections(e.target.checked)}
                                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                                />
                                <label htmlFor="editHasSections" className="text-sm text-gray-700 cursor-pointer">
                                    This class has sections
                                </label>
                            </div>

                            {/* Sections */}
                            {form.hasSections && (
                                <div>
                                    <label className="block text-xs text-gray-500 mb-2">Sections</label>

                                    {/* Quick-pick */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {SECTION_OPTIONS.map((sec) => (
                                            <button
                                                key={sec}
                                                type="button"
                                                onClick={() => toggleSection(sec)}
                                                className={`px-3 py-1 text-sm rounded border transition-colors ${
                                                    form.sections.includes(sec)
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                                                }`}
                                            >
                                                {sec}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom section */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Custom section (e.g. G)"
                                            value={customSection}
                                            onChange={(e) => setCustomSection(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addCustomSection()}
                                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={addCustomSection}
                                            className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Selected tags */}
                                    {form.sections.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {form.sections.map((sec) => (
                                                <span
                                                    key={sec}
                                                    className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                                                >
                                                    {sec}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSection(sec)}
                                                        className="text-blue-400 hover:text-red-500 leading-none"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
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
                        <h2 className="text-lg font-semibold text-gray-800">Delete Class</h2>
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete class <strong>{deleteTarget.name}</strong>? This cannot be undone.
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