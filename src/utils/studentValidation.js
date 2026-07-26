// studentValidation.js
// Defines required fields per certificate type and validates student data.

export const CERT_REQUIRED_FIELDS = {
    leaving: [
        { key: 'grNumber', label: 'GR Number' },
        { key: 'seatNumber', label: 'Seat Number' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'fatherName', label: 'Father Name' },
        { key: 'surname', label: 'Surname' },
        { key: 'placeOfBirth', label: 'Place of Birth' },
        { key: 'dateOfBirth', label: 'Date of Birth' },
        { key: 'lastSchoolAttended', label: 'Last School Attended' },
        { key: 'dateOfAdmission', label: 'Date of Admission' },
        { key: 'progessInStudies', label: 'Progress in Studies' },
        { key: 'conduct', label: 'Conduct' },
        { key: 'dateOfLeaving', label: 'Date of Leaving' },
    ],
    leaving2: [
        { key: 'grNumber', label: 'GR Number' },
        { key: 'seatNumber', label: 'Seat Number' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'fatherName', label: 'Father Name' },
        { key: 'surname', label: 'Surname' },
        { key: 'placeOfBirth', label: 'Place of Birth' },
        { key: 'dateOfBirth', label: 'Date of Birth' },
        { key: 'lastSchoolAttended', label: 'Last School Attended' },
        { key: 'dateOfAdmission', label: 'Date of Admission' },
        { key: 'progessInStudies', label: 'Progress in Studies' },
        { key: 'conduct', label: 'Conduct' },
        { key: 'dateOfLeaving', label: 'Date of Leaving' },
    ],
    provisional: [
        { key: 'grNumber', label: 'GR Number' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'fatherName', label: 'Father Name' },
        { key: 'dateOfBirth', label: 'Date of Birth' },
        { key: 'class', label: 'Class' },
        { key: 'dateOfAdmission', label: 'Date of Admission' },
    ],
    character: [
        { key: 'grNumber', label: 'GR Number' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'fatherName', label: 'Father Name' },
        { key: 'conduct', label: 'Conduct' },
        { key: 'dateOfLeaving', label: 'Date of Leaving' },
        { key: 'class', label: 'Class' },
    ],
};

/**
 * Returns an array of missing field labels for a given student + cert type.
 * Empty array means student data is complete for that certificate.
 */
export function getMissingFields(student, certTypeId) {
    const required = CERT_REQUIRED_FIELDS[certTypeId] ?? [];
    return required.filter(({ key }) => {
        const val = student[key];
        return val === undefined || val === null || String(val).trim() === '';
    });
}

/**
 * Returns true if the student has all required fields for the given cert type.
 */
export function isStudentComplete(student, certTypeId) {
    return getMissingFields(student, certTypeId).length === 0;
}