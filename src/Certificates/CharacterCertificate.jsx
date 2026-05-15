const SCHOOL = {
    name: 'Bright Future High School',
    address: '123 Education Road, Knowledge City',
    phone: '+92-300-0000000',
    email: 'info@brightfuture.edu.pk',
    principal: 'Dr. Muhammad Arif',
    established: '1998',
};

export default function CharacterCertificate({ student, certType }) {
    const today = new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
        <div style={{ width: certType.width, height: certType.height, backgroundColor: '#fdfaff', position: 'relative', overflow: 'hidden', fontFamily: '"Georgia", serif', boxSizing: 'border-box' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '60%', height: '60%', borderRadius: '50%', background: `radial-gradient(circle, ${certType.color}08, transparent)`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: '8mm', border: `3px double ${certType.color}` }} />
            <div style={{ position: 'absolute', inset: '11mm', border: `1px solid ${certType.accent}` }} />
            <div style={{ position: 'absolute', inset: '15mm', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: 10, width: '100%' }}>
                    <div style={{ fontSize: 8, letterSpacing: 4, color: certType.accent, textTransform: 'uppercase', marginBottom: 6 }}>Est. {SCHOOL.established}</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold', color: certType.color, letterSpacing: 0.5 }}>{SCHOOL.name}</div>
                    <div style={{ fontSize: 9, color: '#666', marginTop: 3 }}>{SCHOOL.address}</div>
                    <div style={{ height: 3, margin: '10px auto', background: `linear-gradient(to right, transparent, ${certType.accent}, ${certType.color}, ${certType.accent}, transparent)`, width: '80%' }} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 'bold', letterSpacing: 5, color: certType.color, textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>Character Certificate</div>
                <div style={{ background: `${certType.color}0d`, border: `1px solid ${certType.color}33`, borderRadius: 4, padding: '12px 20px', width: '90%', marginBottom: 16, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 'bold', color: certType.color }}>{student.firstName} {student.lastName}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Roll No. {student.rollNumber} · Class {student.classId?.name ?? student.class}{student.section ? ` / Section ${student.section}` : ''}</div>
                    <div style={{ fontSize: 10, color: '#555' }}>D.O.B: {student.dateOfBirth?.slice(0, 10) ?? '—'} · {student.gender ?? '—'}</div>
                </div>
                <div style={{ fontSize: 11, lineHeight: 2, color: '#2a2a2a', width: '100%', textAlign: 'center' }}>
                    <p>This is to certify that the above-named student was a bonafide student of this institution. During their period of study, their <strong>moral character, conduct, and behavior</strong> were found to be <strong>Excellent</strong> and they bore a <strong>good reputation</strong> among peers and faculty alike.</p>
                    <p style={{ marginTop: 8 }}>This certificate is issued in good faith on the basis of available institutional records and to the best of our knowledge and belief.</p>
                    <p style={{ fontSize: 10, color: '#777', marginTop: 6, fontStyle: 'italic' }}>We wish them the very best in their future endeavors.</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: 'auto', paddingTop: 16 }}>
                    {['Class Teacher', 'Vice Principal', 'Principal'].map((role, i) => (
                        <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ borderTop: `1px solid ${certType.color}`, paddingTop: 6, fontSize: 9, color: '#444' }}>
                                {role === 'Principal' ? SCHOOL.principal : '____________________'}<br /><strong>{role}</strong>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ textAlign: 'right', width: '100%', fontSize: 9, color: '#888', marginTop: 8 }}>Date of Issue: {today} &nbsp;|&nbsp; {SCHOOL.name}</div>
            </div>
        </div>
    );
}