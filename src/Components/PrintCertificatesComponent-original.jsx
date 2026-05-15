import { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from "../api/axios";

// ─── Certificate dimensions (mm → px at 96dpi: 1mm ≈ 3.78px) ───────────────
const CERT_CONFIGS = {
    leaving: {
        label: 'Leaving Certificate',
        shortLabel: 'LC',
        widthMm: 210,
        heightMm: 297,
        color: '#1a3a5c',
        accent: '#c9a84c',
        bg: '#faf7f0',
    },
    provisional: {
        label: 'Provisional Certificate',
        shortLabel: 'PC',
        widthMm: 210,
        heightMm: 148,
        color: '#2d5a27',
        accent: '#8bc34a',
        bg: '#f4faf3',
    },
    character: {
        label: 'Character Certificate',
        shortLabel: 'CC',
        widthMm: 210,
        heightMm: 210,
        color: '#4a1a6b',
        accent: '#ce93d8',
        bg: '#fdf4ff',
    },
};

const EMPTY_FILTERS = { search: '', filterClass: '', filterSection: '', filterGender: '' };

// ─── Individual Certificate Templates ────────────────────────────────────────

function LeavingCertificate({ student, schoolName = "Excellence Academy" }) {
    const cfg = CERT_CONFIGS.leaving;
    return (
        <div style={{
            width: `${cfg.widthMm}mm`,
            height: `${cfg.heightMm}mm`,
            background: cfg.bg,
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Georgia", serif',
            boxSizing: 'border-box',
            padding: '14mm',
            pageBreakAfter: 'always',
            breakAfter: 'page',
        }}>
            {/* Decorative border */}
            <div style={{
                position: 'absolute', inset: '6mm', border: `2px solid ${cfg.color}`,
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', inset: '8mm', border: `0.5px solid ${cfg.accent}`,
                pointerEvents: 'none',
            }} />

            {/* Corner ornaments */}
            {[['6mm','6mm'],['6mm','auto'],['auto','6mm'],['auto','auto']].map(([t,b], i) => (
                <div key={i} style={{
                    position: 'absolute',
                    top: i < 2 ? (i===0 ? '4mm' : 'auto') : 'auto',
                    bottom: i >= 2 ? (i===2 ? 'auto' : '4mm') : 'auto',
                    left: i % 2 === 0 ? '4mm' : 'auto',
                    right: i % 2 === 1 ? '4mm' : 'auto',
                    width: '8mm', height: '8mm',
                    borderTop: i < 2 ? `3px solid ${cfg.accent}` : 'none',
                    borderBottom: i >= 2 ? `3px solid ${cfg.accent}` : 'none',
                    borderLeft: i % 2 === 0 ? `3px solid ${cfg.accent}` : 'none',
                    borderRight: i % 2 === 1 ? `3px solid ${cfg.accent}` : 'none',
                }} />
            ))}

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '6mm' }}>
                <div style={{
                    width: '16mm', height: '16mm', borderRadius: '50%',
                    background: cfg.color, margin: '0 auto 3mm',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '18px', fontWeight: 'bold',
                }}>🎓</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: cfg.color, letterSpacing: '2px', textTransform: 'uppercase' }}>
                    {schoolName}
                </div>
                <div style={{ width: '40mm', height: '1px', background: cfg.accent, margin: '2mm auto' }} />
                <div style={{ fontSize: '13px', color: cfg.color, letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    Leaving Certificate
                </div>
            </div>

            {/* Body */}
            <div style={{ fontSize: '10px', color: '#444', lineHeight: '1.8', textAlign: 'justify', marginBottom: '5mm' }}>
                This is to certify that <strong style={{ color: cfg.color }}>{student.firstName} {student.lastName}</strong>,
                Son/Daughter of ________________, bearing Roll Number <strong>{student.rollNumber}</strong>,
                was a bonafide student of this institution. {student.gender === 'Female' ? 'She' : 'He'} was enrolled in
                Class <strong>{student.classId?.name ?? student.class}</strong>
                {student.section ? `, Section ${student.section}` : ''}.
            </div>

            {/* Data rows */}
            <div style={{ marginBottom: '5mm' }}>
                {[
                    ['Full Name', `${student.firstName} ${student.lastName}`],
                    ['Roll Number', student.rollNumber],
                    ['Class', `${student.classId?.name ?? student.class}${student.section ? ' – Section ' + student.section : ''}`],
                    ['Gender', student.gender],
                    ['Date of Birth', student.dateOfBirth?.slice(0, 10) ?? '—'],
                    ['Date of Issue', new Date().toLocaleDateString('en-GB')],
                ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', borderBottom: `0.5px solid #ddd`, padding: '1.5mm 0', gap: '3mm' }}>
                        <span style={{ width: '35mm', fontSize: '9px', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                        <span style={{ fontSize: '10px', color: '#222', flex: 1 }}>{value}</span>
                    </div>
                ))}
            </div>

            <div style={{ fontSize: '9px', color: '#666', textAlign: 'justify', marginBottom: '10mm', fontStyle: 'italic' }}>
                During {student.gender === 'Female' ? 'her' : 'his'} stay at this institution, {student.gender === 'Female' ? 'she' : 'he'} bore a good moral character
                and {student.gender === 'Female' ? 'her' : 'his'} conduct was found satisfactory. This certificate is issued on
                {student.gender === 'Female' ? ' her' : ' his'} request for the purpose it may serve.
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm' }}>
                {['Class Teacher', 'Principal'].map((sig) => (
                    <div key={sig} style={{ textAlign: 'center', width: '35mm' }}>
                        <div style={{ borderTop: `1px solid ${cfg.color}`, paddingTop: '1mm', fontSize: '8px', color: cfg.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{sig}</div>
                    </div>
                ))}
            </div>

            {/* Stamp area */}
            <div style={{
                position: 'absolute', bottom: '18mm', left: '50%', transform: 'translateX(-50%)',
                width: '22mm', height: '22mm', border: `1.5px dashed ${cfg.accent}`,
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '7px', color: cfg.accent, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px',
            }}>Official<br/>Stamp</div>
        </div>
    );
}

function ProvisionalCertificate({ student, schoolName = "Excellence Academy" }) {
    const cfg = CERT_CONFIGS.provisional;
    return (
        <div style={{
            width: `${cfg.widthMm}mm`,
            height: `${cfg.heightMm}mm`,
            background: cfg.bg,
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Georgia", serif',
            boxSizing: 'border-box',
            padding: '10mm 14mm',
            pageBreakAfter: 'always',
            breakAfter: 'page',
        }}>
            <div style={{ position: 'absolute', inset: '5mm', border: `1.5px solid ${cfg.color}`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: '7mm', border: `0.5px solid ${cfg.accent}`, pointerEvents: 'none' }} />

            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4mm', marginBottom: '4mm' }}>
                <div style={{ width: '14mm', height: '14mm', borderRadius: '50%', background: cfg.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px' }}>📋</div>
                <div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: cfg.color, letterSpacing: '1px' }}>{schoolName}</div>
                    <div style={{ fontSize: '11px', color: cfg.accent, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px' }}>Provisional Certificate</div>
                </div>
            </div>

            <div style={{ width: '100%', height: '0.5px', background: cfg.accent, marginBottom: '4mm' }} />

            <div style={{ fontSize: '9.5px', color: '#444', lineHeight: '1.7', marginBottom: '4mm' }}>
                This is to certify that <strong style={{ color: cfg.color }}>{student.firstName} {student.lastName}</strong> (Roll No: <strong>{student.rollNumber}</strong>)
                is/was a student of Class <strong>{student.classId?.name ?? student.class}{student.section ? ', Section ' + student.section : ''}</strong> at this institution.
                This provisional certificate is issued pending the issuance of the original certificate.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5mm 4mm', marginBottom: '5mm' }}>
                {[
                    ['Name', `${student.firstName} ${student.lastName}`],
                    ['Roll No', student.rollNumber],
                    ['Class', `${student.classId?.name ?? student.class}`],
                    ['Section', student.section || '—'],
                    ['Gender', student.gender],
                    ['DOB', student.dateOfBirth?.slice(0, 10) ?? '—'],
                    ['Issue Date', new Date().toLocaleDateString('en-GB')],
                    ['Valid Until', '—'],
                ].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', gap: '2mm', alignItems: 'baseline', borderBottom: '0.3px solid #ddd', padding: '1mm 0' }}>
                        <span style={{ fontSize: '7.5px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase', width: '18mm', flexShrink: 0 }}>{l}</span>
                        <span style={{ fontSize: '9px', color: '#222' }}>{v}</span>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: '12mm', left: '18mm', right: '18mm' }}>
                {['Issuing Authority', 'Principal'].map(sig => (
                    <div key={sig} style={{ textAlign: 'center', width: '35mm' }}>
                        <div style={{ borderTop: `1px solid ${cfg.color}`, paddingTop: '1mm', fontSize: '7.5px', color: cfg.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{sig}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CharacterCertificate({ student, schoolName = "Excellence Academy" }) {
    const cfg = CERT_CONFIGS.character;
    return (
        <div style={{
            width: `${cfg.widthMm}mm`,
            height: `${cfg.heightMm}mm`,
            background: cfg.bg,
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Georgia", serif',
            boxSizing: 'border-box',
            padding: '12mm 14mm',
            pageBreakAfter: 'always',
            breakAfter: 'page',
        }}>
            <div style={{ position: 'absolute', inset: '5mm', border: `1.5px solid ${cfg.color}`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: '7mm', border: `0.5px solid ${cfg.accent}`, pointerEvents: 'none' }} />

            {/* Decorative background pattern */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `radial-gradient(circle at 80% 20%, ${cfg.accent}18 0%, transparent 50%), radial-gradient(circle at 20% 80%, ${cfg.color}10 0%, transparent 50%)`,
                pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '5mm', position: 'relative' }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: cfg.color, letterSpacing: '2px', textTransform: 'uppercase' }}>{schoolName}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2mm', justifyContent: 'center', margin: '2mm 0' }}>
                    <div style={{ flex: 1, height: '0.5px', background: cfg.accent }} />
                    <span style={{ fontSize: '9px', color: cfg.accent, letterSpacing: '3px', textTransform: 'uppercase' }}>⭐ Character Certificate ⭐</span>
                    <div style={{ flex: 1, height: '0.5px', background: cfg.accent }} />
                </div>
            </div>

            {/* Body */}
            <div style={{ fontSize: '10px', color: '#444', lineHeight: '1.9', textAlign: 'justify', position: 'relative' }}>
                <p style={{ marginBottom: '3mm' }}>
                    This is to certify that <strong style={{ color: cfg.color }}>{student.firstName} {student.lastName}</strong>,
                    Roll Number <strong>{student.rollNumber}</strong>, Class <strong>{student.classId?.name ?? student.class}{student.section ? ', Section ' + student.section : ''}</strong>,
                    Date of Birth: <strong>{student.dateOfBirth?.slice(0, 10) ?? '—'}</strong>, was a student of this institution.
                </p>
                <p style={{ marginBottom: '3mm' }}>
                    During {student.gender === 'Female' ? 'her' : 'his'} association with <strong>{schoolName}</strong>,
                    {student.gender === 'Female' ? ' she' : ' he'} consistently demonstrated exemplary moral character, integrity,
                    and respect towards fellow students and faculty alike.
                </p>
                <p style={{ marginBottom: '3mm' }}>
                    {student.gender === 'Female' ? 'Her' : 'His'} behavior was found to be of the highest standard and {student.gender === 'Female' ? 'she' : 'he'}
                    was never involved in any disciplinary case during {student.gender === 'Female' ? 'her' : 'his'} tenure at this institution.
                </p>
                <p>
                    We wish {student.gender === 'Female' ? 'her' : 'him'} all the best in {student.gender === 'Female' ? 'her' : 'his'} future endeavors.
                    This certificate is issued on {student.gender === 'Female' ? 'her' : 'his'} request.
                </p>
            </div>

            {/* Issue date */}
            <div style={{ fontSize: '8.5px', color: '#888', marginTop: '4mm', position: 'relative' }}>
                Date of Issue: {new Date().toLocaleDateString('en-GB')}
            </div>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'absolute', bottom: '13mm', left: '18mm', right: '18mm' }}>
                {['Class Teacher', 'Principal'].map(sig => (
                    <div key={sig} style={{ textAlign: 'center', width: '35mm' }}>
                        <div style={{ borderTop: `1px solid ${cfg.color}`, paddingTop: '1mm', fontSize: '7.5px', color: cfg.color, fontWeight: 'bold', textTransform: 'uppercase' }}>{sig}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Print container (hidden off-screen) ─────────────────────────────────────
const PrintContent = ({ students, certType, printRef }) => {
    const CertComp = certType === 'leaving' ? LeavingCertificate : certType === 'provisional' ? ProvisionalCertificate : CharacterCertificate;
    return (
        <div ref={printRef} style={{ display: 'none' }}>
            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { margin: 0; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                @media print { div[data-print-root] { display: block !important; } }
            `}</style>
            <div data-print-root style={{ display: 'block' }}>
                {students.map((s) => (
                    <CertComp key={s._id} student={s} />
                ))}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PrintCertificatesComponent() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [certType, setCertType] = useState('leaving');
    const [printing, setPrinting] = useState(false);

    const printRef = useRef();

    // ── Fetch ────────────────────────────────────────────────────────────────
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

    // ── Derived ──────────────────────────────────────────────────────────────
    const { search, filterClass, filterSection, filterGender } = filters;

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

    // ── Selection helpers ────────────────────────────────────────────────────
    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const allFilteredSelected = filtered.length > 0 && filtered.every(s => selectedIds.has(s._id));
    const someFilteredSelected = filtered.some(s => selectedIds.has(s._id));

    const toggleAll = () => {
        if (allFilteredSelected) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                filtered.forEach(s => next.delete(s._id));
                return next;
            });
        } else {
            setSelectedIds(prev => {
                const next = new Set(prev);
                filtered.forEach(s => next.add(s._id));
                return next;
            });
        }
    };

    const clearSelection = () => setSelectedIds(new Set());

    // ── Print ────────────────────────────────────────────────────────────────
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `${CERT_CONFIGS[certType].label} - ${new Date().toLocaleDateString()}`,
        onBeforePrint: () => { setPrinting(true); },
        onAfterPrint: () => { setPrinting(false); },
    });

    const cfg = CERT_CONFIGS[certType];

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Print content (hidden) */}
            <PrintContent students={selectedStudents} certType={certType} printRef={printRef} />

            {/* Page */}
            <div className="p-6 max-w-6xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Print Certificates</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Select students and certificate type, then print</p>
                    </div>

                    {/* Print button */}
                    <button
                        onClick={handlePrint}
                        disabled={selectedIds.size === 0 || printing}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: selectedIds.size > 0 ? cfg.color : '#9ca3af', color: '#fff' }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        {printing ? 'Preparing…' : `Print ${selectedIds.size > 0 ? `(${selectedIds.size})` : ''}`}
                    </button>
                </div>

                {/* ── Certificate Type Selector ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Certificate Type</h2>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(CERT_CONFIGS).map(([key, c]) => (
                            <button
                                key={key}
                                onClick={() => setCertType(key)}
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all"
                                style={{
                                    borderColor: certType === key ? c.color : '#e5e7eb',
                                    background: certType === key ? c.color + '10' : '#fff',
                                    color: certType === key ? c.color : '#6b7280',
                                }}
                            >
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                                {c.label}
                                <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: c.color + '20', color: c.color }}>
                                    {c.widthMm}×{c.heightMm}mm
                                </span>
                            </button>
                        ))}
                    </div>
                    {certType && (
                        <p className="text-xs text-gray-400 mt-2">
                            ℹ️ Load {cfg.widthMm}×{cfg.heightMm}mm paper in your printer for {cfg.label}.
                        </p>
                    )}
                </div>

                {/* ── Filters ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Search & Filter Students</h2>
                    <div className="flex flex-wrap gap-2.5">
                        <input
                            type="text"
                            placeholder="Search name or roll no…"
                            value={search}
                            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                        />
                        <select
                            value={filterClass}
                            onChange={e => setFilters(f => ({ ...f, filterClass: e.target.value, filterSection: '' }))}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        {availableSections.length > 0 && (
                            <select
                                value={filterSection}
                                onChange={e => setFilters(f => ({ ...f, filterSection: e.target.value }))}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                            >
                                <option value="">All Sections</option>
                                {availableSections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
                            </select>
                        )}
                        <select
                            value={filterGender}
                            onChange={e => setFilters(f => ({ ...f, filterGender: e.target.value }))}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                        >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        {(search || filterClass || filterSection || filterGender) && (
                            <button
                                onClick={() => setFilters(EMPTY_FILTERS)}
                                className="text-sm text-red-500 hover:underline px-2 flex items-center gap-1"
                            >
                                ✕ Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Selection toolbar ── */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={allFilteredSelected}
                                ref={el => { if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected; }}
                                onChange={toggleAll}
                                className="w-4 h-4 rounded accent-blue-600"
                            />
                            <span className="font-medium">{allFilteredSelected ? 'Deselect all' : 'Select all'}</span>
                            <span className="text-gray-400">({filtered.length} visible)</span>
                        </label>
                        {selectedIds.size > 0 && (
                            <button onClick={clearSelection} className="text-red-400 hover:text-red-600 text-xs underline">
                                Clear selection
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedIds.size > 0 && (
                            <span
                                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                                style={{ background: cfg.color }}
                            >
                                {selectedIds.size} selected
                            </span>
                        )}
                        <span className="text-xs text-gray-400">{filtered.length} student{filtered.length !== 1 ? 's' : ''} shown</span>
                    </div>
                </div>

                {/* ── Error ── */}
                {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

                {/* ── Student Table ── */}
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading students…</div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-4 py-3 w-10">
                                        <input
                                            type="checkbox"
                                            checked={allFilteredSelected}
                                            ref={el => { if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected; }}
                                            onChange={toggleAll}
                                            className="w-4 h-4 rounded accent-blue-600"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left">Roll #</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Gender</th>
                                    <th className="px-4 py-3 text-left">Class</th>
                                    <th className="px-4 py-3 text-left">Section</th>
                                    <th className="px-4 py-3 text-left">DOB</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No students found.</td>
                                    </tr>
                                ) : filtered.map(s => {
                                    const isSelected = selectedIds.has(s._id);
                                    return (
                                        <tr
                                            key={s._id}
                                            onClick={() => toggleSelect(s._id)}
                                            className="cursor-pointer transition-colors hover:bg-gray-50"
                                            style={{ background: isSelected ? cfg.color + '08' : undefined }}
                                        >
                                            <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelect(s._id)}
                                                    className="w-4 h-4 rounded"
                                                    style={{ accentColor: cfg.color }}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 font-mono">{s.rollNumber}</td>
                                            <td className="px-4 py-3 font-medium text-gray-800">
                                                {s.firstName} {s.lastName}
                                                {isSelected && (
                                                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded font-semibold text-white" style={{ background: cfg.color }}>
                                                        ✓
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{s.gender}</td>
                                            <td className="px-4 py-3 text-gray-600">{s.classId?.name ?? s.class}</td>
                                            <td className="px-4 py-3 text-gray-600">{s.section || '—'}</td>
                                            <td className="px-4 py-3 text-gray-600">{s.dateOfBirth?.slice(0, 10) ?? '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Print summary ── */}
                {selectedIds.size > 0 && (
                    <div
                        className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-3"
                        style={{ background: cfg.color + '12', border: `1px solid ${cfg.color}30` }}
                    >
                        <div>
                            <p className="text-sm font-semibold" style={{ color: cfg.color }}>
                                Ready to print {selectedIds.size} × {cfg.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Paper size: {cfg.widthMm}mm × {cfg.heightMm}mm · Each student on a separate page
                            </p>
                        </div>
                        <button
                            onClick={handlePrint}
                            disabled={printing}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow transition-all disabled:opacity-60"
                            style={{ background: cfg.color }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            {printing ? 'Preparing…' : 'Print Now'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}