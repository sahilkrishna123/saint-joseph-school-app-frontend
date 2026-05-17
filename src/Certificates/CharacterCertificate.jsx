export default function CharacterCertificate({ student, certType }) {
    const today = new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
    // Helper for absolutely-positioned overlay fields
    const Field = ({ top, left, width, value, style = {} }) => (
        <span style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            width: width ? `${width}%` : 'auto',
            fontSize: '24px',   // scales with container width
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
                width: '100%',        // fills whatever container the print gives it
                aspectRatio: '356 / 216',  // matches certType: 148mm × 210mm portrait
                display: 'block',
            }}>
                {/* Background certificate image */}
                <img
                    src="/certificates/character-certificate.jpeg"
                    alt="Certificate"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'fill',   // must be 'fill' so overlay aligns exactly
                        display: 'block',
                    }}
                />
                <Field top={40} left={48} value={`${student.grNumber}`} />
                <Field top={40} left={88} value={`${student.seatNumber}`} />


                <Field top={47.5} left={65} value={`${student.fullName}`} />
                <Field top={51.2} left={50} value={`${student.fatherName}`} />
                <Field top={51.2} left={83} value={`${student.surname}`} />

                <Field top={55} left={68} value={`${student.seatNumber}`} />


            </div>

    );
}