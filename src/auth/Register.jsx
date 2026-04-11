// src/pages/Register.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, User, Mail, Phone, Lock, Globe, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import successMessage from '../utilities/successMessage';
import { BASE_URL } from '../BaseUrl';
import ErrorMessage from '../utilities/ErrorMessage';
import PolicyModal from '../components/PolicyModal';
import teamImg from '../assets/team.jpg';

const countries = [
    { name: "Afghanistan", code: "AF", phone: "+93" },
    { name: "Albania", code: "AL", phone: "+355" },
    { name: "Algeria", code: "DZ", phone: "+213" },
    { name: "Andorra", code: "AD", phone: "+376" },
    { name: "Angola", code: "AO", phone: "+244" },
    { name: "Antigua and Barbuda", code: "AG", phone: "+1-268" },
    { name: "Argentina", code: "AR", phone: "+54" },
    { name: "Armenia", code: "AM", phone: "+374" },
    { name: "Australia", code: "AU", phone: "+61" },
    { name: "Austria", code: "AT", phone: "+43" },
    { name: "Azerbaijan", code: "AZ", phone: "+994" },
    { name: "Bahamas", code: "BS", phone: "+1-242" },
    { name: "Bahrain", code: "BH", phone: "+973" },
    { name: "Bangladesh", code: "BD", phone: "+880" },
    { name: "Barbados", code: "BB", phone: "+1-246" },
    { name: "Belarus", code: "BY", phone: "+375" },
    { name: "Belgium", code: "BE", phone: "+32" },
    { name: "Belize", code: "BZ", phone: "+501" },
    { name: "Benin", code: "BJ", phone: "+229" },
    { name: "Bhutan", code: "BT", phone: "+975" },
    { name: "Bolivia", code: "BO", phone: "+591" },
    { name: "Bosnia and Herzegovina", code: "BA", phone: "+387" },
    { name: "Botswana", code: "BW", phone: "+267" },
    { name: "Brazil", code: "BR", phone: "+55" },
    { name: "Brunei", code: "BN", phone: "+673" },
    { name: "Bulgaria", code: "BG", phone: "+359" },
    { name: "Burkina Faso", code: "BF", phone: "+226" },
    { name: "Burundi", code: "BI", phone: "+257" },
    { name: "Cambodia", code: "KH", phone: "+855" },
    { name: "Cameroon", code: "CM", phone: "+237" },
    { name: "Canada", code: "CA", phone: "+1" },
    { name: "Cape Verde", code: "CV", phone: "+238" },
    { name: "Central African Republic", code: "CF", phone: "+236" },
    { name: "Chad", code: "TD", phone: "+235" },
    { name: "Chile", code: "CL", phone: "+56" },
    { name: "China", code: "CN", phone: "+86" },
    { name: "Colombia", code: "CO", phone: "+57" },
    { name: "Comoros", code: "KM", phone: "+269" },
    { name: "Congo", code: "CG", phone: "+242" },
    { name: "Costa Rica", code: "CR", phone: "+506" },
    { name: "Croatia", code: "HR", phone: "+385" },
    { name: "Cuba", code: "CU", phone: "+53" },
    { name: "Cyprus", code: "CY", phone: "+357" },
    { name: "Czech Republic", code: "CZ", phone: "+420" },
    { name: "Denmark", code: "DK", phone: "+45" },
    { name: "Djibouti", code: "DJ", phone: "+253" },
    { name: "Dominica", code: "DM", phone: "+1-767" },
    { name: "Dominican Republic", code: "DO", phone: "+1-809" },
    { name: "Ecuador", code: "EC", phone: "+593" },
    { name: "Egypt", code: "EG", phone: "+20" },
    { name: "El Salvador", code: "SV", phone: "+503" },
    { name: "Equatorial Guinea", code: "GQ", phone: "+240" },
    { name: "Eritrea", code: "ER", phone: "+291" },
    { name: "Estonia", code: "EE", phone: "+372" },
    { name: "Eswatini", code: "SZ", phone: "+268" },
    { name: "Ethiopia", code: "ET", phone: "+251" },
    { name: "Fiji", code: "FJ", phone: "+679" },
    { name: "Finland", code: "FI", phone: "+358" },
    { name: "France", code: "FR", phone: "+33" },
    { name: "Gabon", code: "GA", phone: "+241" },
    { name: "Gambia", code: "GM", phone: "+220" },
    { name: "Georgia", code: "GE", phone: "+995" },
    { name: "Germany", code: "DE", phone: "+49" },
    { name: "Ghana", code: "GH", phone: "+233" },
    { name: "Greece", code: "GR", phone: "+30" },
    { name: "Guatemala", code: "GT", phone: "+502" },
    { name: "Guinea", code: "GN", phone: "+224" },
    { name: "Guyana", code: "GY", phone: "+592" },
    { name: "Haiti", code: "HT", phone: "+509" },
    { name: "Honduras", code: "HN", phone: "+504" },
    { name: "Hungary", code: "HU", phone: "+36" },
    { name: "Iceland", code: "IS", phone: "+354" },
    { name: "India", code: "IN", phone: "+91" },
    { name: "Indonesia", code: "ID", phone: "+62" },
    { name: "Iran", code: "IR", phone: "+98" },
    { name: "Iraq", code: "IQ", phone: "+964" },
    { name: "Ireland", code: "IE", phone: "+353" },
    { name: "Israel", code: "IL", phone: "+972" },
    { name: "Italy", code: "IT", phone: "+39" },
    { name: "Jamaica", code: "JM", phone: "+1-876" },
    { name: "Japan", code: "JP", phone: "+81" },
    { name: "Jordan", code: "JO", phone: "+962" },
    { name: "Kenya", code: "KE", phone: "+254" },
    { name: "Kuwait", code: "KW", phone: "+965" },
    { name: "Kyrgyzstan", code: "KG", phone: "+996" },
    { name: "Laos", code: "LA", phone: "+856" },
    { name: "Latvia", code: "LV", phone: "+371" },
    { name: "Lebanon", code: "LB", phone: "+961" },
    { name: "Lesotho", code: "LS", phone: "+266" },
    { name: "Liberia", code: "LR", phone: "+231" },
    { name: "Libya", code: "LY", phone: "+218" },
    { name: "Lithuania", code: "LT", phone: "+370" },
    { name: "Luxembourg", code: "LU", phone: "+352" },
    { name: "Madagascar", code: "MG", phone: "+261" },
    { name: "Malawi", code: "MW", phone: "+265" },
    { name: "Malaysia", code: "MY", phone: "+60" },
    { name: "Maldives", code: "MV", phone: "+960" },
    { name: "Mali", code: "ML", phone: "+223" },
    { name: "Malta", code: "MT", phone: "+356" },
    { name: "Mauritania", code: "MR", phone: "+222" },
    { name: "Mauritius", code: "MU", phone: "+230" },
    { name: "Mexico", code: "MX", phone: "+52" },
    { name: "Moldova", code: "MD", phone: "+373" },
    { name: "Mongolia", code: "MN", phone: "+976" },
    { name: "Morocco", code: "MA", phone: "+212" },
    { name: "Mozambique", code: "MZ", phone: "+258" },
    { name: "Myanmar", code: "MM", phone: "+95" },
    { name: "Namibia", code: "NA", phone: "+264" },
    { name: "Nepal", code: "NP", phone: "+977" },
    { name: "Netherlands", code: "NL", phone: "+31" },
    { name: "New Zealand", code: "NZ", phone: "+64" },
    { name: "Nicaragua", code: "NI", phone: "+505" },
    { name: "Niger", code: "NE", phone: "+227" },
    { name: "Nigeria", code: "NG", phone: "+234" },
    { name: "North Macedonia", code: "MK", phone: "+389" },
    { name: "Norway", code: "NO", phone: "+47" },
    { name: "Oman", code: "OM", phone: "+968" },
    { name: "Pakistan", code: "PK", phone: "+92" },
    { name: "Palestine", code: "PS", phone: "+970" },
    { name: "Panama", code: "PA", phone: "+507" },
    { name: "Paraguay", code: "PY", phone: "+595" },
    { name: "Peru", code: "PE", phone: "+51" },
    { name: "Philippines", code: "PH", phone: "+63" },
    { name: "Poland", code: "PL", phone: "+48" },
    { name: "Portugal", code: "PT", phone: "+351" },
    { name: "Qatar", code: "QA", phone: "+974" },
    { name: "Romania", code: "RO", phone: "+40" },
    { name: "Russia", code: "RU", phone: "+7" },
    { name: "Rwanda", code: "RW", phone: "+250" },
    { name: "Saudi Arabia", code: "SA", phone: "+966" },
    { name: "Senegal", code: "SN", phone: "+221" },
    { name: "Serbia", code: "RS", phone: "+381" },
    { name: "Sierra Leone", code: "SL", phone: "+232" },
    { name: "Singapore", code: "SG", phone: "+65" },
    { name: "Slovakia", code: "SK", phone: "+421" },
    { name: "Slovenia", code: "SI", phone: "+386" },
    { name: "Somalia", code: "SO", phone: "+252" },
    { name: "South Africa", code: "ZA", phone: "+27" },
    { name: "South Sudan", code: "SS", phone: "+211" },
    { name: "Spain", code: "ES", phone: "+34" },
    { name: "Sri Lanka", code: "LK", phone: "+94" },
    { name: "Sudan", code: "SD", phone: "+249" },
    { name: "Sweden", code: "SE", phone: "+46" },
    { name: "Switzerland", code: "CH", phone: "+41" },
    { name: "Syria", code: "SY", phone: "+963" },
    { name: "Taiwan", code: "TW", phone: "+886" },
    { name: "Tanzania", code: "TZ", phone: "+255" },
    { name: "Thailand", code: "TH", phone: "+66" },
    { name: "Togo", code: "TG", phone: "+228" },
    { name: "Trinidad and Tobago", code: "TT", phone: "+1-868" },
    { name: "Tunisia", code: "TN", phone: "+216" },
    { name: "Turkey", code: "TR", phone: "+90" },
    { name: "Uganda", code: "UG", phone: "+256" },
    { name: "Ukraine", code: "UA", phone: "+380" },
    { name: "United Arab Emirates", code: "AE", phone: "+971" },
    { name: "United Kingdom", code: "GB", phone: "+44" },
    { name: "United States", code: "US", phone: "+1" },
    { name: "Uruguay", code: "UY", phone: "+598" },
    { name: "Venezuela", code: "VE", phone: "+58" },
    { name: "Vietnam", code: "VN", phone: "+84" },
    { name: "Yemen", code: "YE", phone: "+967" },
    { name: "Zambia", code: "ZM", phone: "+260" },
    { name: "Zimbabwe", code: "ZW", phone: "+263" }
];

const Register = () => {
    const navigation = useNavigate('');

    // Pre-fill from URL params or lead info in session
    const urlParams = new URLSearchParams(window.location.search);
    const prefillEmail = urlParams.get('email') || '';
    const leadInfoStr = sessionStorage.getItem('leadInfo');
    const leadData = leadInfoStr ? (() => { try { return JSON.parse(leadInfoStr); } catch { return null; } })() : null;
    const nameParts = (leadData?.fullName || '').split(' ');

    const [form, setForm] = useState({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: prefillEmail || leadData?.email || '',
        phone: leadData?.phone || '',
        countryCode: '',
        countryName: '',
        password: '',
        confirmPassword: '',
        agree: false,
        hasVisa: false,
        hasWorkPermit: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [strength, setStrength] = useState(0);
    const [selectedPrefix, setSelectedPrefix] = useState('');
    const [showTerms, setShowTerms] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (!form.firstName.trim()) newErrors.firstName = "First name is required";
        if (!form.lastName.trim()) newErrors.lastName = "Last name is required";

        if (!form.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!form.phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{8,15}$/.test(form.phone.replace(/\s/g, ''))) {
            newErrors.phone = "Invalid phone number format";
        }

        if (!form.countryCode) newErrors.country = "Please select your country";

        if (!form.password) {
            newErrors.password = "Password is required";
        } else if (form.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!form.hasVisa && !form.hasWorkPermit) {
            // Both are allowed to be false — they're just required to be answered (checkbox = answered)
        }

        if (!form.agree) newErrors.agree = "You must agree to the terms";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateStrength = (pwd) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        setStrength(score);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        if (validate()) {
            const formDatajson = {
                "firstName": form?.firstName,
                "lastName": form?.lastName,
                "email": form?.email,
                "phoneNumber": form?.phone?.slice(-9), // last 9 digits
                "countryCode": selectedPrefix,
                "password": form?.password,
                "role": "JOB_SEEKER", // RECRUITER
                "hasVisa": form?.hasVisa,
                "hasWorkPermit": form?.hasWorkPermit
            }
            handlePostRegister(formDatajson);
        }
    };

    const handlePostRegister = async (formDatajson) => {
        try {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formDatajson),
            });
            const data = await response.json();
            if (!response.ok) {
                ErrorMessage(
                    data?.errors?.[0]?.message ||
                    data?.message ||
                    'Registration Failed'
                );
                setIsLoading(false);
                return;
            }
            successMessage(data?.message || 'Registration Successful!');
            setIsLoading(false);
            sessionStorage.setItem('accessToken', JSON.stringify(data?.data?.token));
            sessionStorage.setItem('user', JSON.stringify(data?.data));

            // Check for pending action (from lead capture flow)
            const pendingAction = sessionStorage.getItem('pendingAction');
            let dest = '/dashboard';
            if (pendingAction) {
                try {
                    const action = JSON.parse(pendingAction);
                    if (action.jobId) dest = `/joblisting/${action.jobId}`;
                } catch {}
                sessionStorage.removeItem('pendingAction');
            }
            sessionStorage.removeItem('leadInfo');
            navigation(dest, { replace: true });
        } catch (error) {
            console.error('Registration error:', error);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };
    const handleCountryChange = (e) => {
        const selectedCode = e.target.value;
        const selected = countries.find(c => c.code === selectedCode);
        if (selected) {
            setForm({
                ...form,
                countryCode: selected.code,
                countryName: selected.name,
                // phone: selected.phone, // pre-fill prefix
            });
            setSelectedPrefix(selected.phone);
        }
    };

    const getStrengthColor = () => {
        if (strength === 0) return 'bg-gray-300';
        if (strength <= 2) return 'bg-red-500';
        if (strength === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-6xl grid md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">

                {/* Right side - Form (left on mobile) */}
                <div className="order-1 md:order-2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            Create your account
                        </h1>
                        <p className="mt-3 text-gray-600 dark:text-gray-400">
                            Start finding great jobs in Dubai today
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                                    className={`w-full px-4 py-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-black dark:text-white rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
                                    placeholder="First name"
                                />
                                {errors.firstName && <p className="mt-1.5 text-sm text-red-600">{errors.firstName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                                    className={`w-full px-4 py-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-black dark:text-white rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
                                    placeholder="Last name"
                                />
                                {errors.lastName && <p className="mt-1.5 text-sm text-red-600">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value.trim() })}
                                    className={`w-full pl-10 pr-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-black dark:text-white rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-[auto,1fr] gap-3">
                            <div className='w-[140px]'>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Country
                                </label>
                                <select
                                    value={form.countryCode}
                                    onChange={handleCountryChange}
                                    className={`w-full px-3 py-3 border ${errors.country ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-black dark:text-white rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
                                >
                                    <option value="">Select country</option>
                                    {countries.map(c => (
                                        <option key={c.code} value={c.code}>
                                            {c.name} ({c.phone})
                                        </option>
                                    ))}
                                </select>
                                {errors.country && <p className="mt-1.5 text-sm text-red-600">{errors.country}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm pointer-events-none">
                                        {form.countryCode ? countries.find(c => c.code === form.countryCode)?.phone : ''}
                                    </div>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value.trim() })}
                                        className={`w-full pl-16 pr-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-black dark:text-white rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
                                        placeholder="501234567"
                                    />
                                </div>
                                {errors.phone && <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => {
                                        setForm({ ...form, password: e.target.value });
                                        calculateStrength(e.target.value);
                                    }}
                                    className={`w-full pl-10 pr-10 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-black dark:text-white rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
                                    placeholder="At least 8 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {form.password && (
                                <div className="mt-2">
                                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                            style={{ width: `${(strength / 4) * 100}%` }}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        {strength === 0 ? 'Weak' : strength <= 2 ? 'Fair' : strength === 3 ? 'Good' : 'Strong'}
                                    </p>
                                </div>
                            )}

                            {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.confirmPassword}
                                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                    className={`w-full pl-10 pr-10 py-3 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-black dark:text-white rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition`}
                                    placeholder="Confirm password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>}
                        </div>

                        {/* Visa & Work Permit */}
                        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Authorization</p>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="hasVisa"
                                    checked={form.hasVisa}
                                    onChange={e => setForm({ ...form, hasVisa: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                                />
                                <label htmlFor="hasVisa" className="text-sm text-gray-600 dark:text-gray-400">
                                    I have a valid visa
                                </label>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="hasWorkPermit"
                                    checked={form.hasWorkPermit}
                                    onChange={e => setForm({ ...form, hasWorkPermit: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                                />
                                <label htmlFor="hasWorkPermit" className="text-sm text-gray-600 dark:text-gray-400">
                                    I have a valid work permit
                                </label>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="agree"
                                checked={form.agree}
                                onChange={e => setForm({ ...form, agree: e.target.checked })}
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                            />
                            <label htmlFor="agree" className="text-sm text-gray-600 dark:text-gray-400">
                                I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-teal-600 dark:text-teal-400 hover:underline">Terms of Use</button>
                            </label>
                        </div>
                        {errors.agree && <p className="text-sm text-red-600 -mt-2">{errors.agree}</p>}

                        <button
                            type="submit"
                            className="w-full py-3.5 px-6 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            Create Free Account
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Left side - Inspirational visual (hidden on mobile) */}
                <div className="hidden md:block relative bg-[#FAFBFC] dark:bg-gray-900 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={teamImg}
                            alt="Confident professional in modern Dubai office with skyline"
                            className="w-full h-full object-cover opacity-35 dark:opacity-20"
                        />
                        <div className="absolute inset-0 bg-white/75 dark:bg-gray-950/75" />
                    </div>

                    <div className="relative h-full flex flex-col justify-center px-12 lg:px-16 text-center">
                        <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
                            Create your account<br />and start finding jobs in Dubai
                        </h2>
                        <p className="text-xl text-gray-700 dark:text-gray-300 max-w-lg mx-auto leading-relaxed">
                            Unlock thousands of opportunities across the UAE.<br />
                            Your next career step begins here.
                        </p>
                    </div>
                </div>
            </div>
            <PolicyModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
        </div>
    );
};

export default Register;