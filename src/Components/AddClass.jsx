import { useState } from 'react';
import api from "../api/axios";

const EMPTY_FORM = {
    name: '',
    hasSections: false,
    sections: [],
};

const EMPTY_ERRORS = {
    name: '',
    sections: '',
};

// ── Field helper ─────────────────────────────────────────────────────────────
const Field = ({ label, error, required, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
);

const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function AddClass() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState(EMPTY_ERRORS);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [serverError, setServerError] = useState('');
    const [customSection, setCustomSection] = useState('');

    const clearMessages = () => {
        setSuccessMsg('');
        setServerError('');
    };

    const setField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: '' }));
        clearMessages();
    };

    // Toggle hasSections — clears sections when turning off
    const toggleHasSections = (checked) => {
        setForm((prev) => ({ ...prev, hasSections: checked, sections: checked ? prev.sections : [] }));
        setErrors((prev) => ({ ...prev, sections: '' }));
        clearMessages();
    };

    // Toggle a section in the sections array
    const toggleSection = (sec) => {
        setForm((prev) => {
            const exists = prev.sections.includes(sec);
            return {
                ...prev,
                sections: exists
                    ? prev.sections.filter((s) => s !== sec)
                    : [...prev.sections, sec],
            };
        });
        setErrors((prev) => ({ ...prev, sections: '' }));
        clearMessages();
    };

    // Add a custom section
    const addCustomSection = () => {
        const val = customSection.trim().toUpperCase();
        if (!val) return;
        if (form.sections.includes(val)) {
            setErrors((prev) => ({ ...prev, sections: `Section "${val}" is already added.` }));
            return;
        }
        setForm((prev) => ({ ...prev, sections: [...prev.sections, val] }));
        setCustomSection('');
        setErrors((prev) => ({ ...prev, sections: '' }));
    };

    const removeSection = (sec) => {
        setForm((prev) => ({ ...prev, sections: prev.sections.filter((s) => s !== sec) }));
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e = { ...EMPTY_ERRORS };
        let valid = true;

        if (!form.name.trim()) {
            e.name = 'Class name is required.';
            valid = false;
        }
        if (form.hasSections && form.sections.length === 0) {
            e.sections = 'Please add at least one section.';
            valid = false;
        }

        setErrors(e);
        return valid;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validate()) return;

        setSubmitting(true);
        setServerError('');

        const payload = {
            name: form.name.trim(),
            hasSections: form.hasSections,
            sections: form.hasSections ? form.sections : [],
        };

        try {
            await api.post('/classes', payload);
            setSuccessMsg(`Class "${payload.name}" added successfully.`);
            setForm(EMPTY_FORM);
            setErrors(EMPTY_ERRORS);
            setCustomSection('');
        } catch (err) {
            setServerError(err.response?.data?.message || 'Failed to add class. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setForm(EMPTY_FORM);
        setErrors(EMPTY_ERRORS);
        setSuccessMsg('');
        setServerError('');
        setCustomSection('');
    };

    const inputClass = (field) =>
        `w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
            errors[field]
                ? 'border-red-400 focus:ring-red-300'
                : 'border-gray-300 focus:ring-blue-400'
        }`;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 max-w-2xl">

            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Class</h1>

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

                {/* Class Name */}
                <Field label="Class Name" error={errors.name} required>
                    <input
                        type="text"
                        placeholder="e.g. 9, 10, One, Two"
                        value={form.name}
                        onChange={(e) => setField('name', e.target.value)}
                        className={inputClass('name')}
                    />
                </Field>

                {/* Has Sections toggle */}
                <div className="flex items-center gap-3">
                    <input
                        id="hasSections"
                        type="checkbox"
                        checked={form.hasSections}
                        onChange={(e) => toggleHasSections(e.target.checked)}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="hasSections" className="text-sm font-medium text-gray-700 cursor-pointer">
                        This class has sections
                    </label>
                </div>

                {/* Sections — only if hasSections is true */}
                {form.hasSections && (
                    <Field label="Sections" error={errors.sections}>

                        {/* Quick-pick checkboxes */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {SECTION_OPTIONS.map((sec) => (
                                <button
                                    key={sec}
                                    type="button"
                                    onClick={() => toggleSection(sec)}
                                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                                        form.sections.includes(sec)
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                                    }`}
                                >
                                    {sec}
                                </button>
                            ))}
                        </div>

                        {/* Custom section input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Custom section (e.g. G)"
                                value={customSection}
                                onChange={(e) => setCustomSection(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addCustomSection()}
                                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                type="button"
                                onClick={addCustomSection}
                                className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
                            >
                                Add
                            </button>
                        </div>

                        {/* Selected sections as tags */}
                        {form.sections.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {form.sections.map((sec) => (
                                    <span
                                        key={sec}
                                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                                    >
                                        {sec}
                                        <button
                                            type="button"
                                            onClick={() => removeSection(sec)}
                                            className="text-blue-400 hover:text-red-500 leading-none"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </Field>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-5 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-60 transition-colors"
                    >
                        {submitting ? 'Adding…' : 'Add Class'}
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