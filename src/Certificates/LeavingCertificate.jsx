const SCHOOL = {
    name: 'Bright Future High School',
    address: '123 Education Road, Knowledge City',
    phone: '+92-300-0000000',
    email: 'info@brightfuture.edu.pk',
    principal: 'Dr. Muhammad Arif',
    established: '1998',
};

export default function LeavingCertificate({ student, certType }) {
    const today = new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
        <div style={{
            width: certType.width, height: certType.height, backgroundColor: '#fffef7',
            position: 'relative', overflow: 'hidden', fontFamily: '"Georgia", "Times New Roman", serif', boxSizing: 'border-box',
        }}>
            <div style={{ position: 'absolute', inset: '8mm', border: `3px solid ${certType.color}`, borderRadius: 2 }} />
            <div style={{ position: 'absolute', inset: '10mm', border: `1px solid ${certType.accent}`, borderRadius: 1 }} />
            {[{ top: '8mm', left: '8mm' }, { top: '8mm', right: '8mm' }, { bottom: '8mm', left: '8mm' }, { bottom: '8mm', right: '8mm' }].map((pos, i) => (
                <div key={i} style={{ position: 'absolute', ...pos, width: 16, height: 16, borderTop: `3px solid ${certType.accent}`, borderLeft: `3px solid ${certType.accent}`, transform: `rotate(${[0, 90, 270, 180][i]}deg)` }} />
            ))}
            <div style={{ position: 'absolute', inset: '14mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', borderBottom: `1px solid ${certType.accent}`, paddingBottom: 8, width: '100%', marginBottom: 10 }}>
                    <div style={{ fontSize: 9, letterSpacing: 3, color: certType.color, textTransform: 'uppercase', marginBottom: 4 }}>{SCHOOL.established} • Affiliated with Board of Secondary Education</div>
                    <div style={{ fontSize: 22, fontWeight: 'bold', color: certType.color, letterSpacing: 1 }}>{SCHOOL.name}</div>
                    <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>{SCHOOL.address} | {SCHOOL.phone}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 'bold', letterSpacing: 4, color: certType.color, textTransform: 'uppercase', borderBottom: `2px solid ${certType.accent}`, paddingBottom: 6, marginBottom: 14, width: '100%', textAlign: 'center' }}>Leaving Certificate</div>
                <div style={{ fontSize: 11, lineHeight: 2, color: '#2a2a2a', width: '100%' }}>
                    <p style={{ textAlign: 'center', marginBottom: 8 }}>This is to certify that <strong>{student.firstName} {student.lastName}</strong>, Son/Daughter of <strong>_________________</strong>, bearing Roll Number <strong>{student.rollNumber}</strong>, was a bonafide student of this institution in Class <strong>{student.classId?.name ?? student.class}</strong>{student.section ? `, Section ${student.section}` : ''}.</p>
                    <p style={{ textAlign: 'center', marginBottom: 8 }}>Date of Birth: <strong>{student.dateOfBirth?.slice(0, 10) ?? '—'}</strong> &nbsp;|&nbsp; Gender: <strong>{student.gender ?? '—'}</strong></p>
                    <p style={{ textAlign: 'center', marginBottom: 8 }}>The student has left the institution on <strong>{today}</strong> after completing their studies. Their conduct and character were <strong>Good</strong> during their stay.</p>
                    <p style={{ textAlign: 'center', fontSize: 10, color: '#666', marginTop: 4 }}>This certificate is issued on the request of the student/guardian for all lawful purposes.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', paddingTop: 16 }}>
                    {['Class Teacher', 'Examination In-charge', 'Principal'].map(role => (
                        <div key={role} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ borderTop: `1px solid ${certType.color}`, paddingTop: 6, fontSize: 9, color: '#444' }}>{role === 'Principal' ? SCHOOL.principal : '____________________'}<br /><span style={{ fontWeight: 'bold' }}>{role}</span></div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'right', width: '100%', fontSize: 9, color: '#777', marginTop: 8 }}>Date of Issue: {today}</div>
            </div>
        </div>
    );
}