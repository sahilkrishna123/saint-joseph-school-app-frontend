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
                words += `${hundreds > 0 || thousands > 0 ? ' ' : ''} ${twoDigitWords(lastTwo)}`;
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
            <FieldLeft top={10} left={30} value={safe(student.grNumber)} />

            <FieldLeft top={36} left={20} value={safe(student.fullName)} />
            <FieldLeft top={39} left={20} value={safe(student.fatherName)} />
            <FieldLeft top={42} left={20} value={safe(student.surname)} />
            <FieldLeft top={45} left={20} value={safe(student.placeOfBirth)} />
            <FieldLeft top={48} left={20} value={safe(student.dateOfBirth)} />
            <FieldLeft top={51} left={23} value={dateToWords(student.dateOfBirth)} />
            <FieldLeft top={54} left={23} value={safe(student.lastSchoolAttended)} />
            <FieldLeft top={57} left={23} value={safe(student.dateOfAdmission)} />
            <FieldLeft top={60} left={23} value={safe(student.class)} />
            <FieldLeft top={63} left={17} value={safe(student.dateOfLeaving)} />
            <FieldLeft top={63} left={31} value={safe(student.classInWhichAdmitted)} />
            <FieldLeft top={65} left={26} value={safe(student.reasonOfLeaving)} />
            <FieldLeft top={68.5} left={18} value={safe(student.progessInStudies)} />
            <FieldLeft top={68.5} left={30} value={safe(student.conduct)} />
            <FieldLeft top={72} left={20} value={safe(student.remarks)} />





            {/* Right Side */}
            <Field top={18} left={92} value={safe(student.grNumber)} />

            {student.leavingCertificateTwoIssued && (
                <Field top={36.6} left={60} value="DUPLICATE" />
            )}

            <Field top={34} left={69} value={safe(student.fullName)} />
            <Field top={38} left={69} value={safe(student.fatherName)} />
            <Field top={41} left={69} value={safe(student.surname)} />
            <Field top={44} left={69} value={safe(student.placeOfBirth)} />
            <Field top={47} left={77} value={safe(student.dateOfBirth)} />
            <Field top={50} left={70} value={dateToWords(student.dateOfBirth)} />

            <Field top={53} left={70} value={safe(student.lastSchoolAttended)} />
            <Field top={56} left={70} value={safe(student.dateOfAdmission)} />
            <Field top={59} left={70} value={safe(student.class)} />

            <Field top={62} left={60} value={safe(student.dateOfLeaving)} />
            <Field top={62} left={90} value={safe(student.classInWhichAdmitted)} />
            <Field top={65} left={70} value={safe(student.reasonOfLeaving)} />

            <Field top={68} left={60} value={safe(student.progessInStudies)} />
            <Field top={68} left={86} value={safe(student.conduct)} />
            <Field top={71} left={60} value={safe(student.remarks)} />

        </div>

    )
}