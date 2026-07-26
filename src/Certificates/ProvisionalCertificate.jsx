
export default function ProvisionalCertificate({ student, certType }) {
    // console.log(student.dateOfBirth);
    // student.dateOfBirth = '15-05-1992';
    const today = new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
    // Safe accessor — returns empty string for null/undefined/whitespace values
    const safe = (val) => {
        if (val === undefined || val === null) return '';
        const str = String(val).trim();
        return str === 'null' || str === 'undefined' ? '' : str;
    };

    // Splits DOB into three separate word parts for the fixed sentence structure:
    // "(In words) the [DAY] day of the month of [MONTH] of the year one thousand nine hundred / two thousand [YEAR_REMAINDER]"
    const dobToWordParts = (val) => {
        if (!val || !/^\d{2}-\d{2}-\d{4}$/.test(val)) {
            return { dayWord: '', monthWord: '', yearWord: '' };
        }

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

        // Only the last two digits' words, e.g. 2009 -> "and Nine", 1998 -> "and Ninety-Eight", 2000 -> "" (blank left for round years)
        const yearRemainderWords = (y) => {
            const lastTwo = y % 100;
            if (lastTwo === 0) return '';
            return `${twoDigitWords(lastTwo)}`;
        };

        if (!day || day < 1 || day > 31 || !month || month < 1 || month > 12) {
            return { dayWord: '', monthWord: '', yearWord: '' };
        }

        return {
            dayWord: dayWords[day],
            monthWord: monthNames[month - 1],
            yearWord: yearRemainderWords(year),
        };
    };

    const { dayWord, monthWord, yearWord } = dobToWordParts(student.dateOfBirth);


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
    // Strikethrough overlay for whichever year-phrase doesn't apply
    const StrikeThrough = ({ top, left, width, style = {} }) => (
        <span style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            width: `${width}%`,
            height: '2px',
            backgroundColor: '#000',
            transform: 'translateY(-50%) rotate(-0deg)', // slight tilt for a natural hand-struck look
            ...style,
        }} />
    );
    const [, , dobYearStr] = (student.dateOfBirth || '').split('-');
    const dobYear = Number(dobYearStr);
    return (
        <>
            <div style={{
                position: 'relative',
                width: '100%',        // fills whatever container the print gives it
                aspectRatio: '356 / 216',  // matches certType: 148mm × 210mm portrait
                display: 'block',
            }}>
                {/* Background certificate image */}
                <img
                    src="/certificates/provisional-certificate.jpeg"
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

                {/* Left Side */}
                <FieldLeft top={41.5} left={9.5} value={safe(student.grNumber)} />
                <FieldLeft top={41.5} left={29.4} value={safe(student.seatNumber)} />
                <FieldLeft top={48} left={23} value={safe(student.fullName)} />
                <FieldLeft top={51.5} left={14.3} value={safe(student.fatherName)} />
                <FieldLeft top={51.5} left={27} value={safe(student.surname)} />
                <FieldLeft top={55} left={22.5} value={safe(student.seatNumber)} />
                <FieldLeft top={58.5} left={26} value="2026" />
                <FieldLeft top={65} left={9} value="April" />
                <FieldLeft top={65} left={17.4} value={safe(student.grade)} />
                <FieldLeft top={71.8} left={27} value={safe(student.dateOfBirth)} />
                <FieldLeft top={92.5} left={8} value="21-07-2026" />

                <FieldLeft top={75} left={12} value={dayWord} />
                <FieldLeft top={75} left={25} value={monthWord} />

                {dobYear >= 2000 && (
                    <>
                        <StrikeThrough top={79.5} left={4.5} width={6} />
                        <FieldLeft top={78.5} left={21} value={`Two Thousand ${yearWord}`} />
                    </>

                )}
                {dobYear > 0 && dobYear < 2000 && (
                    <>
                        <StrikeThrough top={78.6} left={51.5} width={6.5} />
                        <FieldLeft top={78.5} left={21} value={yearWord} />
                    </>
                )}
                <FieldLeft top={90} left={48} value="21-07-2026" />





                {/* Right Side */}
                <Field top={40} left={51} value={safe(student.grNumber)} />
                <Field top={40} left={90} value={safe(student.seatNumber)} />

                {student.provisionalCertificateIssued && (
                    <Field top={36.6} left={60} value="DUPLICATE" />
                )}

                <Field top={48} left={78} value={safe(student.fullName)} />
                <Field top={51.5} left={60} value={safe(student.fatherName)} />
                <Field top={51.5} left={87} value={safe(student.surname)} />

                <Field top={55} left={73} value={safe(student.seatNumber)} />
                <Field top={59} left={80} value="2026" />
                <Field top={62.5} left={86} value="April" />
                <Field top={66} left={47} value={safe(student.grade)} />
                <Field top={70} left={84} value={safe(student.dateOfBirth)} />

                <Field top={74} left={52.5} value={dayWord} />
                <Field top={74} left={79} value={monthWord} />
                <Field top={77.5} left={76} value={yearWord} />

                {dobYear >= 2000 && (
                    <StrikeThrough top={78.6} left={39} width={11.4} />  // strikes "one thousand nine hundred"
                )}
                {dobYear > 0 && dobYear < 2000 && (
                    <StrikeThrough top={78.6} left={51.5} width={6.5} />  // strikes "two thousand"
                )}

                <Field top={90} left={48} value="21-07-2026" />

            </div>

        </>

    );
}