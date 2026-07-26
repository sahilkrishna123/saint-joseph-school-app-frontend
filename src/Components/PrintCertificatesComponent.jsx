import { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../api/axios';
import LeavingCertificate from '../Certificates/LeavingCertificate';
import LeavingCertificate2 from '../Certificates/LeavingCertificate2';
import ProvisionalCertificate from '../Certificates/ProvisionalCertificate';
import CharacterCertificate from '../Certificates/CharacterCertificate';
import { getMissingFields, isStudentComplete } from '../utils/studentValidation';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CERT_TYPES = [
    {
        id: 'leaving',
        label: 'Leaving Certificate',
        shortLabel: 'LC',
        width: '330mm',
        height: '216mm',
        color: '#1e3a5f',
        accent: '#c8a951',
        pageSize: '@page { size: 330mm 216mm ; margin: 0; }',
    },
    {
        id: 'leaving2',
        label: 'Leaving Certificate 2',
        shortLabel: 'LC',
        width: '356mm',
        height: '216mm',
        color: '#1e3a5f',
        accent: '#c8a951',
        pageSize: '@page { size: 297mm 210mm landscape; margin: 0; }',
    },
    {
        id: 'provisional',
        label: 'Provisional Certificate',
        shortLabel: 'PC',
         width: '330mm',
        height: '216mm',
        color: '#1a4731',
        accent: '#d4a843',
        pageSize: '@page { size: 330mm 216mm ; margin: 0; }',
    },
    {
        id: 'character',
        label: 'Character Certificate',
        shortLabel: 'CC',
        width: '356mm',
        height: '216mm',
        color: '#3b1f5e',
        accent: '#c8953d',
        pageSize: '@page { size: 210mm 297mm portrait; margin: 0; }',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Certificate({ student, certType }) {
    if (certType.id === 'leaving') return <LeavingCertificate student={student} certType={certType} />;
    if (certType.id === 'leaving2') return <LeavingCertificate2 student={student} certType={certType} />;
    if (certType.id === 'provisional') return <ProvisionalCertificate student={student} certType={certType} />;
    return <CharacterCertificate student={student} certType={certType} />;
}

const MM_TO_PX = 4.1795;
const PREVIEW_SCALE = 0.55;
function parseMm(mmStr) { return parseFloat(mmStr) * MM_TO_PX; }

function ScaledPreview({ certType, children }) {
    const naturalW = parseMm(certType.width);
    const naturalH = parseMm(certType.height);
    const scaledW = naturalW * PREVIEW_SCALE;
    const scaledH = naturalH * PREVIEW_SCALE;
    return (
        <div style={{ width: scaledW, height: scaledH, position: 'relative', flexShrink: 0 }}>
            <div style={{
                width: naturalW, height: naturalH,
                transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left',
                position: 'absolute', top: 0, left: 0,
            }}>
                {children}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Missing Fields Badge
// ─────────────────────────────────────────────────────────────────────────────

function MissingBadge({ count, onClick }) {
    return (
        <button
            onClick={onClick}
            title={`${count} field${count !== 1 ? 's' : ''} missing — click to fix`}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200 transition-colors"
        >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {count} missing
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick-Edit Modal  (patches only the fields required for the cert)
// ─────────────────────────────────────────────────────────────────────────────

const FIELD_META = {
    grNumber:           { label: 'GR Number',            type: 'text' },
    seatNumber:         { label: 'Seat Number',           type: 'text' },
    fullName:           { label: 'Full Name',             type: 'text' },
    fatherName:         { label: 'Father Name',           type: 'text' },
    surname:            { label: 'Surname',               type: 'text' },
    placeOfBirth:       { label: 'Place of Birth',        type: 'text' },
    dateOfBirth:        { label: 'Date of Birth',         type: 'date' },
    lastSchoolAttended: { label: 'Last School Attended',  type: 'text' },
    dateOfAdmission:    { label: 'Date of Admission',     type: 'date' },
    progessInStudies:   { label: 'Progress in Studies',   type: 'text' },
    conduct:            { label: 'Conduct',               type: 'text' },
    dateOfLeaving:      { label: 'Date of Leaving',       type: 'date' },
    class:              { label: 'Class',                 type: 'text' },
    remarks:            { label: 'Remarks',               type: 'text' },
};

const toInputDate = (val) => {
    if (!val) return '';
    if (/^\d{2}-\d{2}-\d{4}$/.test(val)) {
        const [d, m, y] = val.split('-');
        return `${y}-${m}-${d}`;
    }
    if (val.includes('T')) return val.slice(0, 10);
    return val;
};

function QuickEditModal({ student, missingFields, onClose, onSaved }) {
    const [form, setForm] = useState(() => {
        const init = {};
        missingFields.forEach(({ key }) => {
            const meta = FIELD_META[key];
            init[key] = meta?.type === 'date' ? toInputDate(student[key]) : (student[key] ?? '');
        });
        return init;
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await api.patch(`/students/${student._id}`, form);
            onSaved({ ...student, ...form });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center mt-0.5">
                        <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <h2 className="font-semibold text-gray-900">Complete Missing Information</h2>
                        <p className="text-sm text-amber-700 mt-0.5">
                            <strong>{student.fullName}</strong> is missing {missingFields.length} field{missingFields.length !== 1 ? 's' : ''} required for this certificate.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
                </div>

                {/* Fields */}
                <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto">
                    {missingFields.map(({ key, label }) => {
                        const meta = FIELD_META[key] ?? { label, type: 'text' };
                        return (
                            <div key={key}>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    {meta.label}
                                    <span className="ml-1 text-red-400">*</span>
                                </label>
                                <input
                                    type={meta.type}
                                    value={form[key] ?? ''}
                                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                    placeholder={`Enter ${meta.label.toLowerCase()}…`}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-colors"
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-6 mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-400">Changes are saved to the student record.</p>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-2 text-sm rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60 transition-colors"
                        >
                            {saving ? 'Saving…' : 'Save & Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PrintCertificatesComponent() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterGender, setFilterGender] = useState('');

    const [selectedCertType, setSelectedCertType] = useState(CERT_TYPES[0]);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [previewStudent, setPreviewStudent] = useState(null);

    // Quick-edit state
    const [quickEditStudent, setQuickEditStudent] = useState(null);
    const [quickEditMissing, setQuickEditMissing] = useState([]);

    const printRef = useRef(null);

    // ── Data fetching ────────────────────────────────────────────────────────

    const fetchStudents = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await api.get('/students');
            const list = Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
            setStudents(list);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load students.');
        } finally { setLoading(false); }
    }, []);

    const fetchClasses = useCallback(async () => {
        try {
            const res = await api.get('/classes');
            const list = Array.isArray(res.data?.data?.data) ? res.data.data.data
                : Array.isArray(res.data?.data) ? res.data.data
                    : Array.isArray(res.data) ? res.data : [];
            setClasses(list);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchStudents(); fetchClasses(); }, [fetchStudents, fetchClasses]);

    // ── Filtering ────────────────────────────────────────────────────────────

    const selectedClassObj = classes.find(c => c.name === filterClass || c._id === filterClass);
    const availableSections = selectedClassObj?.sections ?? [];

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        if (q && !s.fullName?.toLowerCase().includes(q) && !String(s.grNumber).includes(q)) return false;
        if (filterClass && s.class !== filterClass && s.classId?._id !== filterClass) return false;
        if (filterSection && s.section !== filterSection) return false;
        if (filterGender && s.gender !== filterGender) return false;
        return true;
    });

    // ── Selection helpers ────────────────────────────────────────────────────

    const selectedStudents = students.filter(s => selectedIds.has(s._id));
    const allFilteredSelected = filtered.length > 0 && filtered.every(s => selectedIds.has(s._id));
    const someFilteredSelected = filtered.some(s => selectedIds.has(s._id));

    const toggleStudent = (id) => {
        const student = students.find(s => s._id === id);
        if (!student) return;

        // If trying to select, validate first
        if (!selectedIds.has(id)) {
            const missing = getMissingFields(student, selectedCertType.id);
            if (missing.length > 0) {
                setQuickEditStudent(student);
                setQuickEditMissing(missing);
                return; // don't select yet — open quick edit
            }
        }

        setSelectedIds(prev => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const selectAll = () => {
        // Only select complete students; open quick edit for the first incomplete one found
        const incomplete = filtered.find(s => !isStudentComplete(s, selectedCertType.id));
        if (incomplete && filtered.some(s => !selectedIds.has(s._id) && !isStudentComplete(s, selectedCertType.id))) {
            const missing = getMissingFields(incomplete, selectedCertType.id);
            setQuickEditStudent(incomplete);
            setQuickEditMissing(missing);
            return;
        }
        setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(s => n.add(s._id)); return n; });
    };

    const deselectAll = () => setSelectedIds(prev => {
        const n = new Set(prev); filtered.forEach(s => n.delete(s._id)); return n;
    });

    // ── Quick-edit handlers ──────────────────────────────────────────────────

    const openQuickEdit = (student) => {
        const missing = getMissingFields(student, selectedCertType.id);
        if (missing.length === 0) return; // nothing to fix
        setQuickEditStudent(student);
        setQuickEditMissing(missing);
    };

    const handleQuickEditSaved = (updatedStudent) => {
        // Update the local students list with the new data
        setStudents(prev => prev.map(s => s._id === updatedStudent._id ? updatedStudent : s));

        // If now complete, auto-select the student
        const stillMissing = getMissingFields(updatedStudent, selectedCertType.id);
        if (stillMissing.length === 0) {
            setSelectedIds(prev => { const n = new Set(prev); n.add(updatedStudent._id); return n; });
        }

        setQuickEditStudent(null);
        setQuickEditMissing([]);
    };

    // ── Preview ──────────────────────────────────────────────────────────────

    const handlePreview = (e, student) => {
        e.stopPropagation();
        const missing = getMissingFields(student, selectedCertType.id);
        if (missing.length > 0) {
            setQuickEditStudent(student);
            setQuickEditMissing(missing);
            return;
        }
        setPreviewStudent(student);
    };

    // ── Print ────────────────────────────────────────────────────────────────

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${selectedCertType.label} - ${new Date().toLocaleDateString()}`,
    });

    const triggerPrint = () => { if (selectedStudents.length > 0) handlePrint(); };

    // Count of incomplete students in current filter
    const incompleteCount = filtered.filter(s => !isStudentComplete(s, selectedCertType.id)).length;

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Hidden print target */}
            <div style={{ visibility: 'hidden', position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', zIndex: -1 }}>
                <div ref={printRef}>
                    <style>{`
                        @media print {
                            ${selectedCertType.pageSize}
                            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        }
                    `}</style>
                    {selectedStudents.map((student, i) => (
                        <div key={student._id} style={{
                            width: '330mm', height: '216mm', overflow: 'hidden',
                            pageBreakAfter: i < selectedStudents.length - 1 ? 'always' : 'auto',
                            breakAfter: i < selectedStudents.length - 1 ? 'page' : 'auto',
                        }}>
                            <Certificate student={student} certType={selectedCertType} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 space-y-5 max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Print Certificates</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Select a certificate type, choose students, then print.</p>
                    </div>
                    <button onClick={triggerPrint} disabled={selectedStudents.length === 0}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow transition-all ${selectedStudents.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                    </button>
                </div>

                {/* Certificate Type */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Certificate Type</p>
                    <div className="flex gap-3 flex-wrap">
                        {CERT_TYPES.map(ct => (
                            <button key={ct.id} onClick={() => { setSelectedCertType(ct); setSelectedIds(new Set()); }}
                                className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${selectedCertType.id === ct.id ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded text-white text-xs font-bold" style={{ backgroundColor: ct.color }}>{ct.shortLabel}</span>
                                    {selectedCertType.id === ct.id && (
                                        <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="font-semibold">{ct.label}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{ct.width} × {ct.height}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Search & Filter Students</p>
                    <div className="flex flex-wrap gap-3">
                        <input type="text" placeholder="Search name or roll no…" value={search} onChange={e => setSearch(e.target.value)}
                            className="border border-gray-400 rounded-lg px-3 py-2 text-md flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
                        <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setFilterSection(''); }}
                            className="border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50">
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        {availableSections.length > 0 && (
                            <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
                                className="border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50">
                                <option value="">All Sections</option>
                                {availableSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                            </select>
                        )}
                        <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
                            className="border border-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50">
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        {(search || filterClass || filterSection || filterGender) && (
                            <button onClick={() => { setSearch(''); setFilterClass(''); setFilterSection(''); setFilterGender(''); }}
                                className="text-sm text-red-500 hover:underline px-2">Clear</button>
                        )}
                    </div>
                </div>

                {/* Incomplete students notice */}
                {!loading && incompleteCount > 0 && (
                    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-amber-800">
                                {incompleteCount} student{incompleteCount !== 1 ? 's have' : ' has'} incomplete data for <em>{selectedCertType.label}</em>
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                Click the <strong>"missing"</strong> badge or the <strong>Preview</strong> button on those rows to fill in the required fields before printing.
                            </p>
                        </div>
                    </div>
                )}

                {/* Selection bar */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <button onClick={allFilteredSelected ? deselectAll : selectAll} className="text-sm text-blue-600 hover:underline font-medium">
                            {allFilteredSelected ? 'Deselect All Visible' : 'Select All Visible'}
                        </button>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">{filtered.length} student{filtered.length !== 1 ? 's' : ''} shown</span>
                    </div>
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-blue-700">{selectedIds.size} selected</span>
                            <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-400 hover:text-red-500 hover:underline">Clear selection</button>
                        </div>
                    )}
                </div>

                {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">{error}</div>}

                {/* Table */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">Loading students…</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-md">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-10">
                                            <input type="checkbox"
                                                checked={allFilteredSelected && filtered.length > 0}
                                                ref={el => { if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected; }}
                                                onChange={allFilteredSelected ? deselectAll : selectAll}
                                                className="rounded accent-blue-600 cursor-pointer" />
                                        </th>
                                        {['GR #', 'Name', 'Father Name', 'Gender', 'Class', 'Section', 'DOB', 'Status', 'Preview'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-400">No students found.</td></tr>
                                    ) : filtered.map(s => {
                                        const isSelected = selectedIds.has(s._id);
                                        const missing = getMissingFields(s, selectedCertType.id);
                                        const isComplete = missing.length === 0;

                                        return (
                                            <tr key={s._id}
                                                onClick={() => toggleStudent(s._id)}
                                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : !isComplete ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-gray-50'}`}>

                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" checked={isSelected}
                                                        onChange={() => toggleStudent(s._id)}
                                                        className="rounded accent-blue-600 cursor-pointer"
                                                        disabled={!isComplete && !isSelected} />
                                                </td>

                                                <td className="px-4 py-3 text-gray-500 font-mono">{s.grNumber}</td>

                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    <span>{s.fullName}</span>
                                                    {isSelected && (
                                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Selected</span>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-gray-600">{s.fatherName}</td>
                                                <td className="px-4 py-3 text-gray-600">{s.gender}</td>
                                                <td className="px-4 py-3 text-gray-600">{s.classId?.name ?? s.class}</td>
                                                <td className="px-4 py-3 text-gray-600">{s.section ?? '—'}</td>
                                                <td className="px-4 py-3 text-gray-600">{s.dateOfBirth ?? '—'}</td>

                                                {/* Status column */}
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    {isComplete ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Ready
                                                        </span>
                                                    ) : (
                                                        <MissingBadge count={missing.length} onClick={() => openQuickEdit(s)} />
                                                    )}
                                                </td>

                                                {/* Preview column */}
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => handlePreview(e, s)}
                                                        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${isComplete ? 'bg-purple-50 text-purple-600 hover:bg-purple-100' : 'bg-gray-100 text-gray-400 hover:bg-amber-50 hover:text-amber-600'}`}
                                                        title={isComplete ? 'Preview certificate' : 'Fill missing fields first'}
                                                    >
                                                        {isComplete ? 'Preview' : 'Fix & Preview'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Print summary bar */}
                {selectedStudents.length > 0 && (
                    <div className="bg-blue-600 text-white rounded-xl px-5 py-4 flex items-center justify-between shadow">
                        <div>
                            <div className="font-semibold">{selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} ready to print</div>
                            <div className="text-blue-200 text-sm mt-0.5">Certificate: {selectedCertType.label} · {selectedCertType.width} × {selectedCertType.height}</div>
                        </div>
                        <button onClick={triggerPrint}
                            className="flex items-center gap-2 bg-white text-blue-700 px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 active:scale-95 transition-all shadow">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Now
                        </button>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewStudent(null)}>
                    <div className="bg-white w-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
                            <div>
                                <h2 className="font-semibold text-gray-800">{selectedCertType.label} Preview</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{previewStudent.fullName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => toggleStudent(previewStudent._id)}
                                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${selectedIds.has(previewStudent._id) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                    {selectedIds.has(previewStudent._id) ? '✓ Selected' : '+ Select'}
                                </button>
                                <button onClick={() => setPreviewStudent(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none px-1 ml-1">×</button>
                            </div>
                        </div>
                        <div className="overflow-auto bg-gray-100 flex-1 flex items-center justify-center p-6">
                            <ScaledPreview certType={selectedCertType}>
                                <Certificate student={previewStudent} certType={selectedCertType} />
                            </ScaledPreview>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick-Edit Modal */}
            {quickEditStudent && (
                <QuickEditModal
                    student={quickEditStudent}
                    missingFields={quickEditMissing}
                    onClose={() => { setQuickEditStudent(null); setQuickEditMissing([]); }}
                    onSaved={handleQuickEditSaved}
                />
            )}
        </div>
    );
}