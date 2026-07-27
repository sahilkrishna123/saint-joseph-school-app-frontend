export default function CharacterCertificate({ student, certType }) {
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
            transform: 'translateX(-50%)',
            textAlign: 'center',
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
            // position: 'relative',
            // width: '100%',        // fills whatever container the print gives it
            // aspectRatio: '356 / 216',  // matches certType: 148mm × 210mm portrait
            // display: 'block',
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
                    display: 'none', // set to display none
                }}
            />
            {/* <Field top={40} left={88} value={`${student.seatNumber}`} /> */}


            <Field top={49} left={25} value={`${student.fullName}`} />
            <Field top={54.6} left={9} value={`${student.fatherName}`} />
            <Field top={54.6} left={28} value={`${student.surname}`} />
            <Field top={61.2} left={7} value={`${student.grNumber}`} />

            <Field top={67.3} left={7} value={`${student.dateOfAdmission}`} />
            <Field top={67.3} left={22} value="31-03-2026" />

            <Field top={88} left={3.4} value="21-07-2026" />


        </div>

    );
}