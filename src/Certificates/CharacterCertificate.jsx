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


            <Field top={47.5} left={30} value={`${student.fullName}`} />
            <Field top={51.2} left={20} value={`${student.fatherName}`} />
            <Field top={51.2} left={43} value={`${student.surname}`} />
            <Field top={60} left={18} value={`${student.grNumber}`} />

            <Field top={85} left={18} value="21-07-2026" />


        </div>

    );
}