import { useState, useEffect } from 'react';
import api from "../api/axios";

const EMPTY_FORM = {
    rollNumber: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    classId: '',
    section: '',
};

const EMPTY_ERRORS = {
    rollNumber: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    classId: '',
};

// ── Field helper ────────────────────────────────────────────────────────────
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

    // Selected class object — to get sections
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

        if (!form.rollNumber || isNaN(form.rollNumber) || Number(form.rollNumber) < 1) {
            e.rollNumber = 'Roll number must be a positive number.';
            valid = false;
        }
        if (!form.firstName.trim()) {
            e.firstName = 'First name is required.';
            valid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(form.firstName.trim())) {
            e.firstName = 'First name must contain letters only.';
            valid = false;
        }
        if (!form.lastName.trim()) {
            e.lastName = 'Last name is required.';
            valid = false;
        } else if (!/^[a-zA-Z\s]+$/.test(form.lastName.trim())) {
            e.lastName = 'Last name must contain letters only.';
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
            rollNumber: Number(form.rollNumber),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            classId: form.classId,
            class: selectedClass?.name ?? '',
            section: form.section || null,
        };

        try {
            await api.post(`/students`, payload);
            setSuccessMsg(`Student ${payload.firstName} ${payload.lastName} added successfully.`);
            setForm(EMPTY_FORM);
            setErrors(EMPTY_ERRORS);
        } catch (err) {
            setServerError(err.response?.data?.message || 'Failed to add student. Please try again.');
        } finally {
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
        <div className="p-6 max-w-2xl">

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Student</h1>

            {/* Success */}
            {successMsg && (
                <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
                    {successMsg}
                </div>
            )}

            {/* Server error */}
            {serverError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                    {serverError}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">

                {/* Roll Number */}
                <Field label="Roll Number" error={errors.rollNumber} required>
                    <input
                        type="number"
                        min="1"
                        placeholder="e.g. 101"
                        value={form.rollNumber}
                        onChange={(e) => set('rollNumber', e.target.value)}
                        className={inputClass('rollNumber')}
                    />
                </Field>

                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                    <Field label="First Name" error={errors.firstName} required>
                        <input
                            type="text"
                            placeholder="Ahmed"
                            value={form.firstName}
                            onChange={(e) => set('firstName', e.target.value)}
                            className={inputClass('firstName')}
                        />
                    </Field>
                    <Field label="Last Name" error={errors.lastName} required>
                        <input
                            type="text"
                            placeholder="Khan"
                            value={form.lastName}
                            onChange={(e) => set('lastName', e.target.value)}
                            className={inputClass('lastName')}
                        />
                    </Field>
                </div>

                {/* Gender */}
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

                {/* Date of Birth */}
                <Field label="Date of Birth" error={errors.dateOfBirth} required>
                    <input
                        type="date"
                        value={form.dateOfBirth}
                        max={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => set('dateOfBirth', e.target.value)}
                        className={inputClass('dateOfBirth')}
                    />
                </Field>

                {/* Class */}
                <Field label="Class" error={errors.classId} required>
                    <select
                        value={form.classId}
                        onChange={(e) => {
                            set('classId', e.target.value);
                            set('section', ''); // reset section when class changes
                        }}
                        className={inputClass('classId')}
                    >
                        <option value="">Select class</option>
                        {classes.map((c) => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </Field>

                {/* Section — only if the selected class has sections */}
                {sections.length > 0 && (
                    <Field label="Section" error="">
                        <select
                            value={form.section}
                            onChange={(e) => set('section', e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Select section (optional)</option>
                            {sections.map((sec) => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </Field>
                )}

                {/* Actions */}
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