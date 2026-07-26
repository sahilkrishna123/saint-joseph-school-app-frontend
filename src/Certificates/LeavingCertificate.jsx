export default function LeavingCertificate({ student, certType }) {
    const today = new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
    // Safe accessor — returns empty string for null/undefined/whitespace values
    const safe = (val) => {
        if (val === undefined || val === null) return '';
        const str = String(val).trim();
        return str === 'null' || str === 'undefined' ? '' : str;
    };
    // Helper for absolutely-positioned overlay fields
    const Field = ({ top, left, width, value, style = {} }) => (
        <span style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            width: width ? `${width}%` : 'auto',
            fontSize: '18px',
            fontStyle: 'italic',
            fontWeight: 'bold',
            fontFamily: '"Times New Roman", Times, serif',
            color: '#000',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            ...style,
        }}>
            {value}
        </span>
    );

    return (
        <div style={{
            position: 'relative',
            left: 50, // left margin
            width: '330mm',
            height: '216mm',
            overflow: 'hidden',
            display: 'block',
        }}>
            {/* Background certificate image */}
            <img
                src="/certificates/leaving-certificate.jpeg"
                alt="Certificate"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill',   // must be 'fill' so overlay aligns exactly
                    display: 'block', // make display none 
                }}
            />

            {/* Left Side */}
            <Field top={38} left={8.5} value={safe(student.grNumber)} />
            <Field top={36.6} left={85} value={safe(student.seatNumber)} />
            <Field top={41.4} left={15} value={safe(student.fullName)} />
 
            {/* Right Side */}
            <Field top={36.6} left={45} value={safe(student.grNumber)} />
            <Field top={36.6} left={85} value={safe(student.seatNumber)} />
            {student.leavingCertificateIssued && (
                <Field top={36.6} left={60} value="DUPLICATE" />
            )}
            <Field top={39.8} left={62} value={safe(student.fullName)} />
            <Field top={42.7} left={50} value={safe(student.fatherName)} />
            <Field top={42.7} left={80} value={safe(student.surname)} />
            <Field top={45.9} left={65} value={safe(student.placeOfBirth)} />
            <Field top={49.3} left={75} value={safe(student.dateOfBirth)} />
            <Field top={52.4} left={75} value={safe(student.dateOfBirth)} />
            <Field top={55.4} left={60} value={safe(student.lastSchoolAttended)} />
            <Field top={58.4} left={60} value={safe(student.dateOfAdmission)} />
            <Field top={61.7} left={60} value={safe(student.progessInStudies)} />
            <Field top={61.7} left={78} value={safe(student.conduct)} />
            <Field top={64.7} left={65} value={safe(student.dateOfLeaving)} />


        </div>

    )
}