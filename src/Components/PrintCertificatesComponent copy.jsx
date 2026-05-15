import { useState, useEffect, useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../api/axios';

// ── Certificate dimensions (mm converted to px at 96dpi: 1mm ≈ 3.7795px) ──
// Leaving Certificate:      A4 landscape  297 × 210 mm
// Provisional Certificate:  A5 portrait   148 × 210 mm
// Character Certificate:    A4 portrait   210 × 297 mm

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

// ── School info (customize as needed) ──────────────────────────────────────
const SCHOOL = {
    name: 'Bright Future High School',
    address: '123 Education Road, Knowledge City',
    phone: '+92-300-0000000',
    email: 'info@brightfuture.edu.pk',
    principal: 'Dr. Muhammad Arif',
    established: '1998',
};

// ── Individual certificate layouts ─────────────────────────────────────────

function LeavingCertificate({ student, certType }) {
    const today = new Date().toLocaleDateString('en-PK', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    return (
        <div style={{
            width: certType.width,
            height: certType.height,
            backgroundColor: '#fffef7',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Georgia", "Times New Roman", serif',
            boxSizing: 'border-box',
        }}>
            {/* Border frame */}
            <div style={{
                position: 'absolute', inset: '8mm',
                border: `3px solid ${certType.color}`,
                borderRadius: 2,
            }} />
            <div style={{
                position: 'absolute', inset: '10mm',
                border: `1px solid ${certType.accent}`,
                borderRadius: 1,
            }} />

            {/* Corner ornaments */}
            {[['8mm','8mm'], ['8mm','auto'], ['auto','8mm'], ['auto','auto']].map(([t, b, l, r], i) => {
                const corners = [
                    { top: '8mm', left: '8mm' },
                    { top: '8mm', right: '8mm' },
                    { bottom: '8mm', left: '8mm' },
                    { bottom: '8mm', right: '8mm' },
                ];
                const rotations = ['0deg', '90deg', '270deg', '180deg'];
                return (
                    <div key={i} style={{
                        position: 'absolute', ...corners[i],
                        width: 16, height: 16,
                        borderTop: `3px solid ${certType.accent}`,
                        borderLeft: `3px solid ${certType.accent}`,
                        transform: `rotate(${rotations[i]})`,
                    }} />
                );
            })}

            {/* Content */}
            <div style={{
                position: 'absolute', inset: '14mm',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', borderBottom: `1px solid ${certType.accent}`, paddingBottom: 8, width: '100%', marginBottom: 10 }}>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: certType.color, textTransform: 'uppercase', marginBottom: 4 }}>
                        {SCHOOL.established} • Affiliated with Board of Secondary Education
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: certType.color, letterSpacing: 1 }}>
                        {SCHOOL.name}
                    </div>
                    <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>
                        {SCHOOL.address} | {SCHOOL.phone}
                    </div>
                </div>

                {/* Title */}
                <div style={{
                    fontSize: 18, fontWeight: 'bold', letterSpacing: 4,
                    color: certType.color, textTransform: 'uppercase',
                    borderBottom: `2px solid ${certType.accent}`,
                    paddingBottom: 6, marginBottom: 14, width: '100%', textAlign: 'center',
                }}>
                    Leaving Certificate
                </div>

                {/* Body */}
                <div style={{ fontSize: 11, lineHeight: 2, color: '#2a2a2a', width: '100%' }}>
                    <p style={{ textAlign: 'center', marginBottom: 8 }}>
                        This is to certify that <strong>{student.firstName} {student.lastName}</strong>,
                        Son/Daughter of <strong>{'_________________'}</strong>,
                        bearing Roll Number <strong>{student.rollNumber}</strong>,
                        was a bonafide student of this institution in Class <strong>{student.classId?.name ?? student.class}</strong>
                        {student.section ? `, Section ${student.section}` : ''}.
                    </p>
                    <p style={{ textAlign: 'center', marginBottom: 8 }}>
                        Date of Birth: <strong>{student.dateOfBirth?.slice(0, 10) ?? '—'}</strong> &nbsp;|&nbsp;
                        Gender: <strong>{student.gender ?? '—'}</strong>
                    </p>
                    <p style={{ textAlign: 'center', marginBottom: 8 }}>
                        The student has left the institution on <strong>{today}</strong> after completing their studies.
                        Their conduct and character were <strong>Good</strong> during their stay.
                    </p>
                    <p style={{ textAlign: 'center', fontSize: 10, color: '#666', marginTop: 4 }}>
                        This certificate is issued on the request of the student/guardian for all lawful purposes.
                    </p>
                </div>

                {/* Signatures */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    width: '100%', marginTop: 'auto', paddingTop: 16,
                }}>
                    {['Class Teacher', 'Examination In-charge', 'Principal'].map((role) => (
                        <div key={role} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ borderTop: `1px solid ${certType.color}`, paddingTop: 6, fontSize: 9, color: '#444' }}>
                                {role === 'Principal' ? SCHOOL.principal : '____________________'}<br />
                                <span style={{ fontWeight: 'bold' }}>{role}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Date issued */}
                <div style={{ textAlign: 'right', width: '100%', fontSize: 9, color: '#777', marginTop: 8 }}>
                    Date of Issue: {today}
                </div>
            </div>
        </div>
    );
}

function ProvisionalCertificate({ student, certType }) {
    const today = new Date().toLocaleDateString('en-PK', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    return (
        <div style={{
            width: certType.width,
            height: certType.height,
            backgroundColor: '#f8fff8',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Georgia", "Times New Roman", serif',
            boxSizing: 'border-box',
        }}>
            <div style={{
                position: 'absolute', inset: '6mm',
                border: `2.5px solid ${certType.color}`,
            }} />
            <div style={{
                position: 'absolute', inset: '8mm',
                border: `1px solid ${certType.accent}`,
            }} />

            <div style={{
                position: 'absolute', inset: '12mm',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 8, width: '100%' }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: certType.color }}>
                        {SCHOOL.name}
                    </div>
                    <div style={{ fontSize: 8, color: '#555', marginTop: 2 }}>{SCHOOL.address}</div>
                    <div style={{
                        height: 2, background: `linear-gradient(to right, transparent, ${certType.accent}, transparent)`,
                        margin: '8px 0',
                    }} />
                </div>

                {/* Title */}
                <div style={{
                    fontSize: 14, fontWeight: 'bold', letterSpacing: 2,
                    color: certType.color, textTransform: 'uppercase',
                    marginBottom: 12, textAlign: 'center',
                }}>
                    Provisional Certificate
                </div>

                {/* Body */}
                <div style={{ fontSize: 10, lineHeight: 1.9, color: '#2a2a2a', width: '100%', textAlign: 'center' }}>
                    <p>This is to certify that</p>
                    <p style={{ fontSize: 13, fontWeight: 'bold', color: certType.color, margin: '4px 0' }}>
                        {student.firstName} {student.lastName}
                    </p>
                    <p>Roll No. <strong>{student.rollNumber}</strong> | Class: <strong>{student.classId?.name ?? student.class}</strong>
                        {student.section ? ` | Sec: ${student.section}` : ''}</p>
                    <p>D.O.B: <strong>{student.dateOfBirth?.slice(0, 10) ?? '—'}</strong> | Gender: <strong>{student.gender ?? '—'}</strong></p>
                    <p style={{ marginTop: 8 }}>
                        is provisionally admitted and enrolled as a student of this institution,
                        subject to verification of original documents.
                    </p>
                    <p style={{ fontSize: 9, color: '#666', marginTop: 6 }}>
                        This certificate is provisional and shall be treated as such until further confirmation.
                    </p>
                </div>

                {/* Signatures */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    width: '100%', marginTop: 'auto', paddingTop: 12,
                }}>
                    {['Admission Officer', 'Principal'].map((role) => (
                        <div key={role} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ borderTop: `1px solid ${certType.color}`, paddingTop: 4, fontSize: 8, color: '#444' }}>
                                {role === 'Principal' ? SCHOOL.principal : '________________'}<br />
                                <strong>{role}</strong>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'right', width: '100%', fontSize: 8, color: '#777', marginTop: 6 }}>
                    Issued: {today}
                </div>
            </div>
        </div>
    );
}

function CharacterCertificate({ student, certType }) {
    const today = new Date().toLocaleDateString('en-PK', {
        day: 'numeric', month: 'long', year: 'numeric',
    });
    return (
        <div style={{
            width: certType.width,
            height: certType.height,
            backgroundColor: '#fdfaff',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Georgia", "Times New Roman", serif',
            boxSizing: 'border-box',
        }}>
            {/* Decorative background */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%', height: '60%',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${certType.color}08, transparent)`,
                pointerEvents: 'none',
            }} />

            <div style={{
                position: 'absolute', inset: '8mm',
                border: `3px double ${certType.color}`,
            }} />
            <div style={{
                position: 'absolute', inset: '11mm',
                border: `1px solid ${certType.accent}`,
            }} />

            <div style={{
                position: 'absolute', inset: '15mm',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center',
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 10, width: '100%' }}>
                    <div style={{
                        fontSize: 8, letterSpacing: 4, color: certType.accent,
                        textTransform: 'uppercase', marginBottom: 6,
                    }}>Est. {SCHOOL.established}</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: certType.color, letterSpacing: 0.5 }}>
                        {SCHOOL.name}
                    </div>
                    <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>{SCHOOL.address}</div>
                    <div style={{
                        height: 3, margin: '10px auto',
                        background: `linear-gradient(to right, transparent, ${certType.accent}, ${certType.color}, ${certType.accent}, transparent)`,
                        width: '80%',
                    }} />
                </div>

                {/* Title */}
                <div style={{
                    fontSize: 20, fontWeight: 'bold', letterSpacing: 5,
                    color: certType.color, textTransform: 'uppercase',
                    marginBottom: 20, textAlign: 'center',
                }}>
                    Character Certificate
                </div>

                {/* Reference box */}
                <div style={{
                    background: `${certType.color}0d`,
                    border: `1px solid ${certType.color}33`,
                    borderRadius: 4, padding: '12px 20px',
                    width: '90%', marginBottom: 16, textAlign: 'center',
                }}>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: certType.color }}>
                        {student.firstName} {student.lastName}
                    </div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>
                        Roll No. {student.rollNumber} &nbsp;·&nbsp;
                        Class {student.classId?.name ?? student.class}
                        {student.section ? ` / Section ${student.section}` : ''}
                    </div>
                    <div style={{ fontSize: 10, color: '#555' }}>
                        D.O.B: {student.dateOfBirth?.slice(0, 10) ?? '—'} &nbsp;·&nbsp; {student.gender ?? '—'}
                    </div>
                </div>

                {/* Body */}
                <div style={{ fontSize: 11, lineHeight: 2, color: '#2a2a2a', width: '100%', textAlign: 'center' }}>
                    <p>
                        This is to certify that the above-named student was a bonafide student of this institution.
                        During their period of study, their <strong>moral character, conduct, and behavior</strong> were
                        found to be <strong>Excellent</strong> and they bore a <strong>good reputation</strong> among
                        peers and faculty alike.
                    </p>
                    <p style={{ marginTop: 8 }}>
                        This certificate is issued in good faith on the basis of available institutional records
                        and to the best of our knowledge and belief.
                    </p>
                    <p style={{ fontSize: 10, color: '#777', marginTop: 6, fontStyle: 'italic' }}>
                        We wish them the very best in their future endeavors.
                    </p>
                </div>

                {/* Signatures */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    width: '100%', marginTop: 'auto', paddingTop: 16,
                }}>
                    {['Class Teacher', 'Vice Principal', `Principal\n${SCHOOL.principal}`].map((role, i) => (
                        <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                borderTop: `1px solid ${certType.color}`,
                                paddingTop: 6, fontSize: 9, color: '#444',
                                whiteSpace: 'pre-line',
                            }}>
                                {'____________________'}<br />
                                <strong>{role}</strong>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'right', width: '100%', fontSize: 9, color: '#888', marginTop: 8 }}>
                    Date of Issue: {today} &nbsp;|&nbsp; {SCHOOL.name}
                </div>
            </div>
        </div>
    );
}

// ── Certificate renderer selector ──────────────────────────────────────────
function Certificate({ student, certType }) {
    if (certType.id === 'leaving') return <LeavingCertificate student={student} certType={certType} />;
    if (certType.id === 'provisional') return <ProvisionalCertificate student={student} certType={certType} />;
    return <CharacterCertificate student={student} certType={certType} />;
}

// ── Printable area (hidden on screen, visible on print) ────────────────────
function PrintArea({ students, certType, ref: forwardedRef }) {
    return (
        <div ref={forwardedRef}>
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-area, #print-area * { visibility: visible; }
                    #print-area { position: fixed; top: 0; left: 0; }
                    ${certType.pageSize}
                }
            `}</style>
            <div id="print-area">
                {students.map((student, i) => (
                    <div key={student._id} style={{
                        pageBreakAfter: i < students.length - 1 ? 'always' : 'auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: certType.width, height: certType.height,
                    }}>
                        <Certificate student={student} certType={certType} />
                    </div>
                ))}
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

    // Filters (mirroring Students.jsx)
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterSection, setFilterSection] = useState('');
    const [filterGender, setFilterGender] = useState('');

    // Certificate type
    const [selectedCertType, setSelectedCertType] = useState(CERT_TYPES[0]);

    // Selected students
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Preview modal
    const [previewStudent, setPreviewStudent] = useState(null);

    // Print ref
    const printRef = useRef(null);

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/students');
            const list = Array.isArray(res.data?.data?.data) ? res.data.data.data : [];
            setStudents(list);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load students.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchClasses = useCallback(async () => {
        try {
            const res = await api.get('/classes');
            const list = Array.isArray(res.data?.data?.data)
                ? res.data.data.data
                : Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                        ? res.data : [];
            setClasses(list);
        } catch (e) {
            console.error('Failed to fetch classes:', e);
        }
    }, []);

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, [fetchStudents, fetchClasses]);

    // ── Derived ──────────────────────────────────────────────────────────────
    const selectedClassObj = classes.find(
        (c) => c.name === filterClass || c._id === filterClass
    );
    const availableSections = selectedClassObj?.sections ?? [];

    const filtered = students.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        const q = search.toLowerCase();
        if (q && !fullName.includes(q) && !String(s.rollNumber).includes(q)) return false;
        if (filterClass && s.class !== filterClass && s.classId?._id !== filterClass) return false;
        if (filterSection && s.section !== filterSection) return false;
        if (filterGender && s.gender !== filterGender) return false;
        return true;
    });

    const selectedStudents = students.filter((s) => selectedIds.has(s._id));

    // ── Selection helpers ────────────────────────────────────────────────────
    const toggleStudent = (id) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            filtered.forEach((s) => next.add(s._id));
            return next;
        });
    };

    const deselectAll = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            filtered.forEach((s) => next.delete(s._id));
            return next;
        });
    };

    const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selectedIds.has(s._id));
    const someFilteredSelected = filtered.some((s) => selectedIds.has(s._id));

    // ── Print ────────────────────────────────────────────────────────────────
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `${selectedCertType.label} - ${new Date().toLocaleDateString()}`,
    });

    const triggerPrint = () => {
        if (selectedStudents.length === 0) return;
        handlePrint();
    };

    // ── UI ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hidden print area */}
            <div style={{ display: 'none' }}>
                <PrintArea ref={printRef} students={selectedStudents} certType={selectedCertType} />
            </div>

            <div className="p-6 space-y-5 max-w-6xl mx-auto">

                {/* ── Page Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Print Certificates</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Select a certificate type, choose students, then print.
                        </p>
                    </div>
                    <button
                        onClick={triggerPrint}
                        disabled={selectedStudents.length === 0}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow transition-all
                            ${selectedStudents.length === 0
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''}
                    </button>
                </div>

                {/* ── Certificate Type Selector ── */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Certificate Type
                    </p>
                    <div className="flex gap-3 flex-wrap">
                        {CERT_TYPES.map((ct) => (
                            <button
                                key={ct.id}
                                onClick={() => setSelectedCertType(ct)}
                                className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all text-left
                                    ${selectedCertType.id === ct.id
                                        ? 'border-blue-600 bg-blue-50 text-blue-800'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-white text-xs font-bold`}
                                        style={{ backgroundColor: ct.color }}>
                                        {ct.shortLabel}
                                    </span>
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

                {/* ── Search & Filters ── */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Search & Filter Students
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <input
                            type="text"
                            placeholder="Search name or roll no…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                        />
                        <select
                            value={filterClass}
                            onChange={(e) => { setFilterClass(e.target.value); setFilterSection(''); }}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                        >
                            <option value="">All Classes</option>
                            {classes.map((c) => (
                                <option key={c._id} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                        {availableSections.length > 0 && (
                            <select
                                value={filterSection}
                                onChange={(e) => setFilterSection(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                            >
                                <option value="">All Sections</option>
                                {availableSections.map((sec) => (
                                    <option key={sec} value={sec}>{sec}</option>
                                ))}
                            </select>
                        )}
                        <select
                            value={filterGender}
                            onChange={(e) => setFilterGender(e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                        >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        {(search || filterClass || filterSection || filterGender) && (
                            <button
                                onClick={() => { setSearch(''); setFilterClass(''); setFilterSection(''); setFilterGender(''); }}
                                className="text-sm text-red-500 hover:underline px-2"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Selection Bar ── */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={allFilteredSelected ? deselectAll : selectAll}
                            className="text-sm text-blue-600 hover:underline font-medium"
                        >
                            {allFilteredSelected ? 'Deselect All Visible' : 'Select All Visible'}
                        </button>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">
                            {filtered.length} student{filtered.length !== 1 ? 's' : ''} shown
                        </span>
                    </div>
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-blue-700">
                                {selectedIds.size} selected
                            </span>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="text-xs text-gray-400 hover:text-red-500 hover:underline"
                            >
                                Clear selection
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {/* ── Students Table ── */}
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
                                            <input
                                                type="checkbox"
                                                checked={allFilteredSelected && filtered.length > 0}
                                                ref={(el) => {
                                                    if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected;
                                                }}
                                                onChange={allFilteredSelected ? deselectAll : selectAll}
                                                className="rounded accent-blue-600 cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll #</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DOB</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                                                No students found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((s) => {
                                            const isSelected = selectedIds.has(s._id);
                                            return (
                                                <tr
                                                    key={s._id}
                                                    onClick={() => toggleStudent(s._id)}
                                                    className={`cursor-pointer transition-colors
                                                        ${isSelected
                                                            ? 'bg-blue-50 hover:bg-blue-100'
                                                            : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleStudent(s._id)}
                                                            className="rounded accent-blue-600 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 font-mono">{s.rollNumber}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-800">
                                                        {s.firstName} {s.lastName}
                                                        {isSelected && (
                                                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                                                Selected
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">{s.gender}</td>
                                                    <td className="px-4 py-3 text-gray-600">{s.classId?.name ?? s.class}</td>
                                                    <td className="px-4 py-3 text-gray-600">{s.section ?? '—'}</td>
                                                    <td className="px-4 py-3 text-gray-600">{s.dateOfBirth?.slice(0, 10) ?? '—'}</td>
                                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => setPreviewStudent(s)}
                                                            className="px-2.5 py-1 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors font-medium"
                                                        >
                                                            Preview
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ── Selected summary chip row ── */}
                {selectedStudents.length > 0 && (
                    <div className="bg-blue-600 text-white rounded-xl px-5 py-4 flex items-center justify-between shadow">
                        <div>
                            <div className="font-semibold">
                                {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} ready to print
                            </div>
                            <div className="text-blue-200 text-sm mt-0.5">
                                Certificate: {selectedCertType.label} &nbsp;·&nbsp; {selectedCertType.width} × {selectedCertType.height}
                            </div>
                        </div>
                        <button
                            onClick={triggerPrint}
                            className="flex items-center gap-2 bg-white text-blue-700 px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 active:scale-95 transition-all shadow"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Now
                        </button>
                    </div>
                )}
            </div>

            {/* ── Preview Modal ── */}
            {previewStudent && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setPreviewStudent(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                            <div>
                                <h2 className="font-semibold text-gray-800">
                                    {selectedCertType.label} Preview
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {previewStudent.firstName} {previewStudent.lastName}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        toggleStudent(previewStudent._id);
                                    }}
                                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors
                                        ${selectedIds.has(previewStudent._id)
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {selectedIds.has(previewStudent._id) ? '✓ Selected' : '+ Select'}
                                </button>
                                <button
                                    onClick={() => setPreviewStudent(null)}
                                    className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        {/* Scaled certificate preview */}
                        <div className="overflow-auto p-6 bg-gray-100 flex items-center justify-center">
                            <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center' }}>
                                <Certificate student={previewStudent} certType={selectedCertType} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}