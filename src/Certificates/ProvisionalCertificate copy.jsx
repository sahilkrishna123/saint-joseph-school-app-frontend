const SCHOOL = {
    name: 'Bright Future High School',
    address: '123 Education Road, Knowledge City',
    phone: '+92-300-0000000',
    email: 'info@brightfuture.edu.pk',
    principal: 'Dr. Muhammad Arif',
    established: '1998',
};

export default function ProvisionalCertificate({ student, certType }) {
    const today = new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
        <div style={{ width: certType.width, height: certType.height, backgroundColor: '#f8fff8', position: 'relative', overflow: 'hidden', fontFamily: '"Georgia", serif', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', inset: '6mm', border: `2.5px solid ${certType.color}` }} />
            <div style={{ position: 'absolute', inset: '8mm', border: `1px solid ${certType.accent}` }} />
            <div style={{ position: 'absolute', inset: '12mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: 8, width: '100%' }}>
                    <div style={{ fontSize: 16, fontWeight: 'bold', color: certType.color }}>{SCHOOL.name}</div>
                    <div style={{ fontSize: 8, color: '#555', marginTop: 2 }}>{SCHOOL.address}</div>
                    <div style={{ height: 2, background: `linear-gradient(to right, transparent, ${certType.accent}, transparent)`, margin: '8px 0' }} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 'bold', letterSpacing: 2, color: certType.color, textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>Provisional Certificate</div>
                <div style={{ fontSize: 10, lineHeight: 1.9, color: '#2a2a2a', width: '100%', textAlign: 'center' }}>
                    <p>This is to certify that</p>
                    <p style={{ fontSize: 13, fontWeight: 'bold', color: certType.color, margin: '4px 0' }}>{student.firstName} {student.lastName}</p>
                    <p>Roll No. <strong>{student.rollNumber}</strong> | Class: <strong>{student.classId?.name ?? student.class}</strong>{student.section ? ` | Sec: ${student.section}` : ''}</p>
                    <p>D.O.B: <strong>{student.dateOfBirth?.slice(0, 10) ?? '—'}</strong> | Gender: <strong>{student.gender ?? '—'}</strong></p>
                    <p style={{ marginTop: 8 }}>is provisionally admitted and enrolled as a student of this institution, subject to verification of original documents.</p>
                    <p style={{ fontSize: 9, color: '#666', marginTop: 6 }}>This certificate is provisional and shall be treated as such until further confirmation.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', paddingTop: 12 }}>
                    {['Admission Officer', 'Principal'].map(role => (
                        <div key={role} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ borderTop: `1px solid ${certType.color}`, paddingTop: 4, fontSize: 8, color: '#444' }}>{role === 'Principal' ? SCHOOL.principal : '________________'}<br /><strong>{role}</strong></div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'right', width: '100%', fontSize: 8, color: '#777', marginTop: 6 }}>Issued: {today}</div>
            </div>
        </div>
    );
}