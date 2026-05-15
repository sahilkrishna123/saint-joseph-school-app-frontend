import { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../api/axios';
import LeavingCertificate from '../Certificates/LeavingCertificate'
import ProvisionalCertificate from '../Certificates/ProvisionalCertificate'
import CharacterCertificate from '../Certificates/CharacterCertificate'

const CERT_TYPES = [
    {
        id: 'leaving',
        label: 'Leaving Certificate',
        shortLabel: 'LC',
        width: '297mm',
        height: '210mm',
        color: '#1e3a5f',
        accent: '#c8a951',
        pageSize: '@page { size: 297mm 210mm landscape; margin: 0; }',
    },
    {
        id: 'provisional',
        label: 'Provisional Certificate',
        shortLabel: 'PC',
        width: '148mm',
        height: '210mm',
        color: '#1a4731',
        accent: '#d4a843',
        pageSize: '@page { size: 148mm 210mm portrait; margin: 0; }',
    },
    {
        id: 'character',
        label: 'Character Certificate',
        shortLabel: 'CC',
        width: '210mm',
        height: '297mm',
        color: '#3b1f5e',
        accent: '#c8953d',
        pageSize: '@page { size: 210mm 297mm portrait; margin: 0; }',
    },
];

function Certificate({ student, certType }) {
    if (certType.id === 'leaving') return <LeavingCertificate student={student} certType={certType} />;
    if (certType.id === 'provisional') return <ProvisionalCertificate student={student} certType={certType} />;
    return <CharacterCertificate student={student} certType={certType} />;
}

// ── ScaledPreview ─────────────────────────────────────────────────────────────
const MM_TO_PX = 3.7795;
const PREVIEW_SCALE = 0.52;

function parseMm(mmStr) { return parseFloat(mmStr) * MM_TO_PX; }

function ScaledPreview({ certType, children }) {
    const naturalW = parseMm(certType.width);
    const naturalH = parseMm(certType.height);
    const scaledW = naturalW * PREVIEW_SCALE;
    const scaledH = naturalH * PREVIEW_SCALE;
    return (
        <div style={{ width: scaledW, height: scaledH, position: 'relative', flexShrink: 0 }}>
            <div style={{ width: naturalW, height: naturalH, transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                {children}
            </div>
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────────
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

    const printRef = useRef(null);

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

    const selectedClassObj = classes.find(c => c.name === filterClass || c._id === filterClass);
    const availableSections = selectedClassObj?.sections ?? [];

    const filtered = students.filter(s => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const q = search.toLowerCase();
        if (q && !fullName.includes(q) && !String(s.rollNumber).includes(q)) return false;
        if (filterClass && s.class !== filterClass && s.classId?._id !== filterClass) return false;
        if (filterSection && s.section !== filterSection) return false;
        if (filterGender && s.gender !== filterGender) return false;
        return true;
    });

    const selectedStudents = students.filter(s => selectedIds.has(s._id));
    const allFilteredSelected = filtered.length > 0 && filtered.every(s => selectedIds.has(s._id));
    const someFilteredSelected = filtered.some(s => selectedIds.has(s._id));

    const toggleStudent = id => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const selectAll = () => setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(s => n.add(s._id)); return n; });
    const deselectAll = () => setSelectedIds(prev => { const n = new Set(prev); filtered.forEach(s => n.delete(s._id)); return n; });

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${selectedCertType.label} - ${new Date().toLocaleDateString()}`,
    });

    const triggerPrint = () => { if (selectedStudents.length > 0) handlePrint(); };

    return (
        <div className="min-h-screen bg-gray-50">
            <div style={{ visibility: 'hidden', position: 'absolute', top: 0, left: 0, width: 0, height: 0, overflow: 'hidden', zIndex: -1 }}>
                <div ref={printRef}>
                    <style>{`
                        @media print {
                            ${selectedCertType.pageSize}
                            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        }
                    `}</style>
                    {selectedStudents.map((student, i) => (
                        <div key={student._id} style={{ pageBreakAfter: i < selectedStudents.length - 1 ? 'always' : 'auto', breakAfter: i < selectedStudents.length - 1 ? 'page' : 'auto' }}>
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
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                    </button>
                </div>

                {/* Certificate Type */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Certificate Type</p>
                    <div className="flex gap-3 flex-wrap">
                        {CERT_TYPES.map(ct => (
                            <button key={ct.id} onClick={() => setSelectedCertType(ct)}
                                className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${selectedCertType.id === ct.id ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded text-white text-xs font-bold" style={{ backgroundColor: ct.color }}>{ct.shortLabel}</span>
                                    {selectedCertType.id === ct.id && (
                                        <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
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
                            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
                        <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setFilterSection(''); }}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50">
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        {availableSections.length > 0 && (
                            <select value={filterSection} onChange={e => setFilterSection(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50">
                                <option value="">All Sections</option>
                                {availableSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                            </select>
                        )}
                        <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50">
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
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-10">
                                            <input type="checkbox" checked={allFilteredSelected && filtered.length > 0}
                                                ref={el => { if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected; }}
                                                onChange={allFilteredSelected ? deselectAll : selectAll}
                                                className="rounded accent-blue-600 cursor-pointer" />
                                        </th>
                                        {['Roll #', 'Name', 'Gender', 'Class', 'Section', 'DOB', 'Preview'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">No students found.</td></tr>
                                    ) : filtered.map(s => {
                                        const isSelected = selectedIds.has(s._id);
                                        return (
                                            <tr key={s._id} onClick={() => toggleStudent(s._id)}
                                                className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}>
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <input type="checkbox" checked={isSelected} onChange={() => toggleStudent(s._id)} className="rounded accent-blue-600 cursor-pointer" />
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 font-mono">{s.rollNumber}</td>
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    {s.firstName} {s.lastName}
                                                    {isSelected && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">Selected</span>}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{s.gender}</td>
                                                <td className="px-4 py-3 text-gray-600">{s.classId?.name ?? s.class}</td>
                                                <td className="px-4 py-3 text-gray-600">{s.section ?? '—'}</td>
                                                <td className="px-4 py-3 text-gray-600">{s.dateOfBirth?.slice(0, 10) ?? '—'}</td>
                                                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => setPreviewStudent(s)}
                                                        className="px-2.5 py-1 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors font-medium">Preview</button>
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                            Print Now
                        </button>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {previewStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewStudent(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-shrink-0">
                            <div>
                                <h2 className="font-semibold text-gray-800">{selectedCertType.label} Preview</h2>
                                <p className="text-xs text-gray-500 mt-0.5">{previewStudent.firstName} {previewStudent.lastName}</p>
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
        </div>
    );
}