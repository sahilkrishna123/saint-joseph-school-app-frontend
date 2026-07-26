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
    const FieldLeft = ({ top, left, width, value, style = {} }) => (
        <span style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            width: width ? `${width}%` : 'auto',
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

    // Converts "DD-MM-YYYY" into words, e.g. "Seventh February Two Thousand Eleven"
    const dateToWords = (val) => {
        if (!val || !/^\d{2}-\d{2}-\d{4}$/.test(val)) return '';

        const [day, month, year] = val.split('-').map(Number);

        const dayWords = [
            '', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth',
            'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth',
            'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth', 'Twentieth', 'Twenty-First',
            'Twenty-Second', 'Twenty-Third', 'Twenty-Fourth', 'Twenty-Fifth', 'Twenty-Sixth',
            'Twenty-Seventh', 'Twenty-Eighth', 'Twenty-Ninth', 'Thirtieth', 'Thirty-First',
        ];

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];

        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const twoDigitWords = (n) => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            const t = Math.floor(n / 10);
            const o = n % 10;
            return `${tens[t]}${o ? '-' + ones[o] : ''}`;
        };

        const yearToWords = (y) => {
            const thousands = Math.floor(y / 1000);
            const remainder = y % 1000;
            const hundreds = Math.floor(remainder / 100);
            const lastTwo = remainder % 100;

            let words = `${ones[thousands]} Thousand`;
            if (hundreds > 0) {
                words += ` ${ones[hundreds]} Hundred`;
            }
            if (lastTwo > 0) {
                words += `${hundreds > 0 || thousands > 0 ? ' and' : ''} ${twoDigitWords(lastTwo)}`;
            }
            return words.trim();
        };

        if (!day || day < 1 || day > 31 || !month || month < 1 || month > 12) return '';

        return `${dayWords[day]} ${monthNames[month - 1]} ${yearToWords(year)}`;
    };

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
                    display: 'none', // make display none 
                }}
            />

            {/* Left Side */}
            <FieldLeft top={38.5} left={8.5} value={safe(student.grNumber)} />
            <FieldLeft top={38.5} left={27.4} value={safe(student.seatNumber)} />

            <FieldLeft top={41.9} left={15} value={safe(student.fullName)} />
            <FieldLeft top={45} left={15} value={safe(student.fatherName)} />
            <FieldLeft top={45} left={25} value={safe(student.surname)} />

            <FieldLeft top={48.5} left={12} value={safe(student.placeOfBirth)} />
            <FieldLeft top={52} left={25.7} value={safe(student.dateOfBirth)} />
            <FieldLeft top={52.6} left={13.4} value={dateToWords(student.dateOfBirth)} />


            <FieldLeft top={58} left={11.5} value={safe(student.lastSchoolAttended)} />
            <FieldLeft top={61.7} left={13} value={safe(student.dateOfAdmission)} />
            <FieldLeft top={64.9} left={15} value={safe(student.progessInStudies)} />
            <FieldLeft top={64.9} left={27} value={safe(student.conduct)} />
            <FieldLeft top={68.5} left={20} value={safe(student.dateOfLeaving)} />
            <FieldLeft top={72} left={29} value="2026" />
            <FieldLeft top={74.5} left={13.7} value={safe(student.seatNumber)} />
            <FieldLeft top={74.5} left={25} value={safe(student.grade)} />

            <FieldLeft top={89.5} left={6.5} value="26-07-2026" />

            {/* Right Side */}
            <Field top={36.2} left={45} value={safe(student.grNumber)} />
            <Field top={36.2} left={85} value={safe(student.seatNumber)} />

            {student.leavingCertificateIssued && (
                <Field top={36.6} left={60} value="DUPLICATE" />
            )}

            <Field top={39.3} left={62} value={safe(student.fullName)} />
            <Field top={42.7} left={50} value={safe(student.fatherName)} />
            <Field top={42.8} left={80} value={safe(student.surname)} />
            <Field top={46.3} left={65} value={safe(student.placeOfBirth)} />
            <Field top={49.7} left={75} value={safe(student.dateOfBirth)} />
            <Field top={52.9} left={53} value={dateToWords(student.dateOfBirth)} />

            <Field top={56.4} left={60} value={safe(student.lastSchoolAttended)} />
            <Field top={59.5} left={60} value={safe(student.dateOfAdmission)} />
            <Field top={63} left={60} value={safe(student.progessInStudies)} />
            <Field top={63} left={78} value={safe(student.conduct)} />
            <Field top={66.5} left={65} value={safe(student.dateOfLeaving)} />
            <Field top={69.7} left={83} value="2026" />
            <Field top={72.5} left={52.4} value={safe(student.seatNumber)} />

            <Field top={72.5} left={73} value={safe(student.grade)} />

            <Field top={86.4} left={42.5} value="26-07-2026" />

        </div>

    )
}