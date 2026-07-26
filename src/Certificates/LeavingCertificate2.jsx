export default function LeavingCertificate2({ student, certType }) {
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

    const FieldLeft = ({ top, left, width, value, style = {} }) => (
        <span style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            width: width ? `${width}%` : 'auto',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            fontSize: '13px',
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
                src="/certificates/leaving-certificate-2.jpeg"
                alt="Certificate"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill',   // must be 'fill' so overlay aligns exactly
                    display: 'block', // set to display none
                }}
            />
            
            {/* Left Side */}
            <FieldLeft top={38.5} left={10} value={safe(student.grNumber)} />
            <FieldLeft top={38.5} left={29} value={safe(student.seatNumber)} />

            <FieldLeft top={41.9} left={21} value={safe(student.fullName)} />
            <FieldLeft top={45} left={16} value={safe(student.fatherName)} />
            <FieldLeft top={45} left={28} value={safe(student.surname)} />

            <FieldLeft top={48.5} left={21} value={safe(student.placeOfBirth)} />
            <FieldLeft top={52} left={29} value={safe(student.dateOfBirth)} />
            {/* <FieldLeft top={52.6} left={23} value={dateToWords(student.dateOfBirth)} /> */}


            <FieldLeft top={58} left={22} value={safe(student.lastSchoolAttended)} />
            <FieldLeft top={61.7} left={22} value={safe(student.dateOfAdmission)} />
            <FieldLeft top={64.9} left={17} value={safe(student.progessInStudies)} />
            <FieldLeft top={64.9} left={28.7} value={safe(student.conduct)} />
            <FieldLeft top={68.5} left={22} value={safe(student.dateOfLeaving)} />
            <FieldLeft top={72} left={30} value="2026" />
            <FieldLeft top={74.5} left={16} value={safe(student.seatNumber)} />
            <FieldLeft top={74.5} left={25.5} value={safe(student.grade)} />

            <FieldLeft top={89.5} left={8.6} value="21-07-2026" />

            {/* Right Side */}
            <Field top={36.2} left={48} value={safe(student.grNumber)} />
            <Field top={36.2} left={88} value={safe(student.seatNumber)} />

            {student.leavingCertificateTwoIssued && (
                <Field top={36.6} left={60} value="DUPLICATE" />
            )}

            <Field top={39.3} left={69} value={safe(student.fullName)} />
            <Field top={42.7} left={60} value={safe(student.fatherName)} />
            <Field top={42.8} left={84} value={safe(student.surname)} />
            <Field top={46.3} left={69} value={safe(student.placeOfBirth)} />
            <Field top={49.7} left={82} value={safe(student.dateOfBirth)} />
            {/* <Field top={52.9} left={70} value={dateToWords(student.dateOfBirth)} /> */}

            <Field top={56.4} left={70} value={safe(student.lastSchoolAttended)} />
            <Field top={59.5} left={70} value={safe(student.dateOfAdmission)} />
            <Field top={63} left={60} value={safe(student.progessInStudies)} />
            <Field top={63} left={84} value={safe(student.conduct)} />
            <Field top={66.5} left={70} value={safe(student.dateOfLeaving)} />
            <Field top={69.7} left={85} value="2026" />
            <Field top={72.5} left={56} value={safe(student.seatNumber)} />

            <Field top={72.5} left={73.9} value={safe(student.grade)} />

            <Field top={86.4} left={45.8} value="21-07-2026" />



        </div>

    )
}