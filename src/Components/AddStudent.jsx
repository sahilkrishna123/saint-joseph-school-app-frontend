import { useState, useEffect } from 'react';
import api from "../api/axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EMPTY_FORM = {
    grNumber: '',
    seatNumber: '',
    fullName: '',
    fatherName: '',
    surname: '',
    gender: '',
    dateOfBirth: '',
    placeOfBirth: '',
    dateOfAdmission: '',
    classInWhichAdmitted: '',
    lastSchoolAttended: '',
    dateOfLeaving: '',
    classFromWhichLeft: '',
    reasonOfLeaving: '',
    progessInStudies: '',
    conduct: '',
    remarks: '',
    cnicNumber: '',
    relationWithBeneficiary: '',
    cellNumber: '',
    classId: '',
    class: '',
    section: '',
};

const EMPTY_ERRORS = {
    grNumber: '',
    fullName: '',
    fatherName: '',
    gender: '',
    dateOfBirth: '',
    classId: '',
    cnicNumber: '',
    cellNumber: '',
};

const Field = ({ label, error, required, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

export default function AddStudent() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState(EMPTY_ERRORS);
    const [classes, setClasses] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [serverError, setServerError] = useState('');

    useEffect(() => {
        api.get(`/classes`)
            .then((res) => {
                const list = Array.isArray(res.data?.data?.data)
                    ? res.data.data.data
                    : Array.isArray(res.data?.data)
                        ? res.data.data
                        : Array.isArray(res.data)
                            ? res.data
                            : [];
                setClasses(list);
            })
            .catch(() => setClasses([]));
    }, []);

    const selectedClass = classes.find((c) => c._id === form.classId);
    const sections = selectedClass?.sections ?? [];

    const set = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        setSuccessMsg('');
        setServerError('');
    };

    // ── Validation ──────────────────────────────────────────────────────────────
    const validate = () => {
        const e = { ...EMPTY_ERRORS };
        let valid = true;

        if (!form.grNumber || isNaN(form.grNumber) || Number(form.grNumber) < 1) {
            e.grNumber = 'GR number must be a positive number.';
            valid = false;
        }
        if (!form.fullName.trim()) {
            e.fullName = 'Full name is required.';
            valid = false;
        }
        if (!form.fatherName.trim()) {
            e.fatherName = 'Father name is required.';
            valid = false;
        }
        // CNIC — optional but if filled must be exactly 13 digits
        if (form.cnicNumber && !/^\d{13}$/.test(form.cnicNumber.replace(/-/g, ''))) {
            e.cnicNumber = 'CNIC must be exactly 13 digits.';
            valid = false;
        }

        // Cell — optional but if filled must be exactly 11 digits
        if (form.cellNumber && !/^\d{11}$/.test(form.cellNumber.replace(/-/g, ''))) {
            e.cellNumber = 'Cell number must be exactly 11 digits.';
            valid = false;
        }
        if (!form.gender) {
            e.gender = 'Please select a gender.';
            valid = false;
        }
        if (!form.dateOfBirth) {
            e.dateOfBirth = 'Date of birth is required.';
            valid = false;
        } else {
            const dob = new Date(form.dateOfBirth);
            const today = new Date();
            const age = today.getFullYear() - dob.getFullYear();
            if (dob >= today) {
                e.dateOfBirth = 'Date of birth must be in the past.';
                valid = false;
            } else if (age > 30) {
                e.dateOfBirth = 'Please enter a valid date of birth.';
                valid = false;
            }
        }
        if (!form.classId) {
            e.classId = 'Please select a class.';
            valid = false;
        }

        setErrors(e);
        return valid;
    };

    // ── Submit ──────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validate()) return;

        setSubmitting(true);
        setServerError('');

        const payload = {
            grNumber: Number(form.grNumber),
            seatNumber: form.seatNumber ? Number(form.seatNumber) : undefined,
            fullName: form.fullName.trim(),
            fatherName: form.fatherName.trim(),
            surname: form.surname.trim() || undefined,
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            placeOfBirth: form.placeOfBirth || undefined,
            dateOfAdmission: form.dateOfAdmission || undefined,
            classInWhichAdmitted: form.classInWhichAdmitted || undefined,
            lastSchoolAttended: form.lastSchoolAttended || undefined,
            dateOfLeaving: form.dateOfLeaving || undefined,
            classFromWhichLeft: form.classFromWhichLeft || undefined,
            reasonOfLeaving: form.reasonOfLeaving || undefined,
            progessInStudies: form.progessInStudies || undefined,
            conduct: form.conduct || undefined,
            remarks: form.remarks || undefined,
            cnicNumber: form.cnicNumber || undefined,
            relationWithBeneficiary: form.relationWithBeneficiary || undefined,
            cellNumber: form.cellNumber || undefined,
            classId: form.classId,
            class: selectedClass?.name ?? '',
            section: form.section || null,
        };

        try {
            await api.post(`/students`, payload);
            setSuccessMsg(`Student "${payload.fullName}" added successfully.`);
            toast.success(`Student "${payload.fullName}" added successfully.`);

            setForm(EMPTY_FORM);
            setErrors(EMPTY_ERRORS);
        } 
        catch (err) {
            const data = err.response?.data;
            const raw = data?.message || '';

            const isDuplicateGR =
                data?.error?.code === 11000 ||
                raw.includes('11000') ||
                raw.toLowerCase().includes('grnumber');

            const errorMsg = isDuplicateGR
                ? `GR Number ${form.grNumber} is already taken. Please use a different GR number.`
                : raw || 'Failed to add student. Please try again.';

            toast.error(errorMsg);
            setServerError(errorMsg);

            if (isDuplicateGR) {
                setErrors((prev) => ({ ...prev, grNumber: 'This GR number is already in use.' }));
            }
        }
        finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
        setErrors(EMPTY_ERRORS);
        setSuccessMsg('');
        setServerError('');
    };

    const inputClass = (field) =>
        `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${errors[field] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-400'
        }`;

    // ────────────────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Student</h1>
            <ToastContainer position="top-right" autoClose={3000} />

            {successMsg && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
                    {successMsg}
                </div>
            )}
            {serverError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                    {serverError}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">

                {/* ── Section: Basic Info ── */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Basic Information</p>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="GR Number" error={errors.grNumber} required>
                        <input
                            type="number"
                            min="1"
                            value={form.grNumber}
                            onChange={(e) => set('grNumber', e.target.value)}
                            className={inputClass('grNumber')}
                        />
                    </Field>
                    <Field label="Seat Number" error="">
                        <input
                            type="number"
                            min="1"
                            value={form.seatNumber}
                            onChange={(e) => set('seatNumber', e.target.value)}
                            className={inputClass('seatNumber')}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name" error={errors.fullName} required>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={(e) => set('fullName', e.target.value)}
                            className={inputClass('fullName')}
                        />
                    </Field>
                    <Field label="Father Name" error={errors.fatherName} required>
                        <input
                            type="text"
                            value={form.fatherName}
                            onChange={(e) => set('fatherName', e.target.value)}
                            className={inputClass('fatherName')}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Surname" error="">
                        <input
                            type="text"
                            value={form.surname}
                            onChange={(e) => set('surname', e.target.value)}
                            className={inputClass('surname')}
                        />
                    </Field>
                    <Field label="Gender" error={errors.gender} required>
                        <select
                            value={form.gender}
                            onChange={(e) => set('gender', e.target.value)}
                            className={inputClass('gender')}
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Date of Birth" error={errors.dateOfBirth} required>
                        <input
                            type="date"
                            value={form.dateOfBirth}
                            max={new Date().toISOString().slice(0, 10)}
                            onChange={(e) => set('dateOfBirth', e.target.value)}
                            className={inputClass('dateOfBirth')}
                        />
                    </Field>
                    <Field label="Place of Birth" error="">
                        <input
                            type="text"
                            placeholder=""
                            value={form.placeOfBirth}
                            onChange={(e) => set('placeOfBirth', e.target.value)}
                            className={inputClass('placeOfBirth')}
                        />
                    </Field>
                </div>

                {/* ── Section: Admission Info ── */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Admission Information</p>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Class" error={errors.classId} required>
                        <select
                            value={form.classId}
                            onChange={(e) => {
                                const cls = classes.find((c) => c._id === e.target.value);
                                setForm((prev) => ({ ...prev, classId: e.target.value, class: cls?.name ?? '', section: '' }));
                                setErrors((prev) => ({ ...prev, classId: '' }));
                            }}
                            className={inputClass('classId')}
                        >
                            <option value="">Select class</option>
                            {classes.map((c) => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                    </Field>
                    {sections.length > 0 && (
                        <Field label="Section" error="">
                            <select
                                value={form.section}
                                onChange={(e) => set('section', e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Select section</option>
                                {sections.map((sec) => (
                                    <option key={sec} value={sec}>{sec}</option>
                                ))}
                            </select>
                        </Field>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Date of Admission" error="">
                        <input
                            type="date"
                            value={form.dateOfAdmission}
                            onChange={(e) => set('dateOfAdmission', e.target.value)}
                            className={inputClass('dateOfAdmission')}
                        />
                    </Field>
                    <Field label="Class In Which Admitted" error="">
                        <input
                            type="text"
                            placeholder="e.g. VI (Sixth)"
                            value={form.classInWhichAdmitted}
                            onChange={(e) => set('classInWhichAdmitted', e.target.value)}
                            className={inputClass('classInWhichAdmitted')}
                        />
                    </Field>
                </div>

                <Field label="Last School Attended" error="">
                    <input
                        type="text"
                        placeholder=""
                        value={form.lastSchoolAttended}
                        onChange={(e) => set('lastSchoolAttended', e.target.value)}
                        className={inputClass('lastSchoolAttended')}
                    />
                </Field>

                {/* ── Section: Leaving Info ── */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Leaving Information</p>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Date of Leaving" error="">
                        <input
                            type="date"
                            value={form.dateOfLeaving}
                            onChange={(e) => set('dateOfLeaving', e.target.value)}
                            className={inputClass('dateOfLeaving')}
                        />
                    </Field>
                    <Field label="Class From Which Left" error="">
                        <input
                            type="text"
                            placeholder="e.g. VIII (Eighth)"
                            value={form.classFromWhichLeft}
                            onChange={(e) => set('classFromWhichLeft', e.target.value)}
                            className={inputClass('classFromWhichLeft')}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Reason of Leaving" error="">
                        <input
                            type="text"
                            placeholder=""
                            value={form.reasonOfLeaving}
                            onChange={(e) => set('reasonOfLeaving', e.target.value)}
                            className={inputClass('reasonOfLeaving')}
                        />
                    </Field>
                    <Field label="Progress In Studies" error="">
                        <input
                            type="text"
                            placeholder=""
                            value={form.progessInStudies}
                            onChange={(e) => set('progessInStudies', e.target.value)}
                            className={inputClass('progessInStudies')}
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Conduct" error="">
                        <input
                            type="text"
                            placeholder=""
                            value={form.conduct}
                            onChange={(e) => set('conduct', e.target.value)}
                            className={inputClass('conduct')}
                        />
                    </Field>
                    <Field label="Remarks" error="">
                        <input
                            type="text"
                            placeholder=""
                            value={form.remarks}
                            onChange={(e) => set('remarks', e.target.value)}
                            className={inputClass('remarks')}
                        />
                    </Field>
                </div>

                {/* ── Section: Guardian Info ── */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Guardian / Contact Information</p>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="CNIC Number" error={errors.cnicNumber}>
                        <input
                            type="text"
                            placeholder="4210112345671"
                            value={form.cnicNumber}
                            maxLength={13}
                            onChange={(e) => set('cnicNumber', e.target.value)}
                            className={inputClass('cnicNumber')}
                        />
                    </Field>
                    <Field label="Relation With Beneficiary" error="">
                        <input
                            type="text"
                            placeholder="Father or Guardian"
                            value={form.relationWithBeneficiary}
                            onChange={(e) => set('relationWithBeneficiary', e.target.value)}
                            className={inputClass('relationWithBeneficiary')}
                        />
                    </Field>
                </div>

                <Field label="Cell Number" error={errors.cellNumber}>
                    <input
                        type="text"
                        placeholder="03001234567"
                        maxLength={11}
                        value={form.cellNumber}
                        onChange={(e) => set('cellNumber', e.target.value)}
                        className={inputClass('cellNumber')}
                    />
                </Field>

                {/* ── Actions ── */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                        {submitting ? 'Adding…' : 'Add Student'}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-5 py-2 border border-gray-300 text-sm rounded hover:bg-gray-50 transition-colors"
                    >
                        Reset
                    </button>
                </div>

            </div>
        </div>
    );
}