import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Building2,
    Briefcase,
    School,
    Users,
    Clock,
    Sunset,
    Utensils,
    CheckCircle2,
    Plus,
    Send,
    AlertTriangle
} from 'lucide-react'
import logo from './assets/logo.png'
import { EVENT_CONFIG, isRegistrationOpen } from './config'
import { FormField } from './components/FormField'
import { SearchableSelect } from './components/SearchableSelect'
import './App.css'
import AttendeeLogin from './components/AttendeeLogin'
import VerificationStep, { readPending, PENDING_KEY } from './components/VerificationStep'
import { mapProfile } from './lib/profile'
import { api } from './lib/firebase'

const UNIVERSITIES = [
    {
        id: 'aub',
        full_name: 'American University of Beirut',
        abbreviation: 'AUB',
        alt_text: 'American University of Beirut (AUB), AUB logo, American University of Beirut logo, AUB Beirut, American Univ Beirut, AUB Lebanon, American University Beirut'
    },
    {
        id: 'lau',
        full_name: 'Lebanese American University',
        abbreviation: 'LAU',
        alt_text: 'Lebanese American University (LAU), LAU logo, Lebanese American University logo, LAU Lebanon, Lebanese American Univ Beirut, Lebanese-American University, Lebanese American Uni, LAU Beirut Campus, LAU Byblos Campus, LAU Byblos, LAU Beirut'
    },
    {
        id: 'usj',
        full_name: 'Saint Joseph University of Beirut',
        abbreviation: 'USJ',
        alt_text: 'Saint Joseph University of Beirut (USJ), USJ logo, Saint Joseph University logo, Universite Saint-Joseph de Beyrouth, St Joseph University, Saint Joseph Univ Beirut, USJ Beirut'
    },
    {
        id: 'lu',
        full_name: 'Lebanese University',
        abbreviation: 'LU, LUFS1, ULFG1',
        alt_text: 'Lebanese University (LU), LU logo, Lebanese University logo, Universite Libanaise, UL logo, LUFS1, LUFG1, ULFG1, ULFS1, Lebanese National University, LU Lebanon, LU Hadat, LU Hadath, LU Nabatieh, LU Saida, LU Fanar, LU Tripoli'
    },
    {
        id: 'bau',
        full_name: 'Beirut Arab University',
        abbreviation: 'BAU',
        alt_text: 'Beirut Arab University (BAU), BAU logo, Beirut Arab University logo, BAU Lebanon, Beirut Arab Uni, BAU Beirut'
    },
    {
        id: 'uob',
        full_name: 'University of Balamand',
        abbreviation: 'UOB',
        alt_text: 'University of Balamand (UOB), UOB logo, University of Balamand logo, UOB Lebanon, Balamand University, Balamand Uni logo'
    },
    {
        id: 'ndu',
        full_name: 'Notre Dame University-Louaize',
        abbreviation: 'NDU',
        alt_text: 'Notre Dame University-Louaize (NDU), NDU logo, Notre Dame University Louaize logo, Notre Dame Louaize, NDU Lebanon, Notre Dame Univ Louaize'
    },
    {
        id: 'usek',
        full_name: 'Holy Spirit University of Kaslik',
        abbreviation: 'USEK',
        alt_text: 'Holy Spirit University of Kaslik (USEK), USEK logo, Holy Spirit University of Kaslik logo, USEK Lebanon, Holy Spirit Univ Kaslik, Universite Saint-Esprit de Kaslik'
    },
    {
        id: 'haigazian',
        full_name: 'Haigazian University',
        abbreviation: 'HU',
        alt_text: 'Haigazian University (HU), HU logo, Haigazian University logo, Haigazian University Beirut, Haigazian Uni Lebanon'
    },
    {
        id: 'upa',
        full_name: 'Antonine University',
        abbreviation: 'UPA',
        alt_text: 'Antonine University (UPA), UPA logo, Antonine University logo, Universite Antonine, Antonine Uni Lebanon'
    },
    {
        id: 'iul',
        full_name: 'Islamic University of Lebanon',
        abbreviation: 'IUL',
        alt_text: 'Islamic University of Lebanon (IUL), IUL logo, Islamic University of Lebanon logo, IUL Lebanon, Islamic Univ Lebanon, Universite Islamique du Liban'
    },
    {
        id: 'global',
        full_name: 'Global University',
        abbreviation: 'GU',
        alt_text: 'Global University (GU), GU logo, Global University logo, Global Univ Lebanon, Global Uni Beirut'
    },
    {
        id: 'jinan',
        full_name: 'Jinan University',
        abbreviation: 'JU',
        alt_text: 'Jinan University (JU), JU logo, Jinan University logo, Jinan Univ Lebanon, Universite Jinan, Jinan Uni Beirut'
    },
    {
        id: 'aul',
        full_name: 'Arts, Sciences and Technology University in Lebanon',
        abbreviation: 'AUL',
        alt_text: 'Arts, Sciences and Technology University in Lebanon (AUL), AUL logo, Arts, Sciences and Technology University in Lebanon logo, AUL Lebanon, AUL University, Arts and Sciences University'
    },
    {
        id: 'usal',
        full_name: 'USAL',
        abbreviation: 'USAL',
        alt_text: 'USAL - University Of Sciences And Arts In Lebanon, USAL logo, USAL Lebanon, University Of Sciences And Arts In Lebanon logo, USAL Univ Lebanon'
    },
    {
        id: 'liu',
        full_name: 'Lebanese International University',
        abbreviation: 'LIU',
        alt_text: 'Lebanese International University (LIU), LIU logo, Lebanese International University logo, LIU Lebanon, Lebanese Intl Univ, LIU Beirut'
    },
    {
        id: 'mut',
        full_name: 'Manar University of Tripoli',
        abbreviation: 'MUT',
        alt_text: 'Manar University of Tripoli (MUT), MUT logo, Manar University of Tripoli logo, MUT Lebanon, Manar Univ Lebanon'
    },
    {
        id: 'meu',
        full_name: 'Middle East University',
        abbreviation: 'MEU',
        alt_text: 'Middle East University (MEU), MEU logo, Middle East University logo, MEU Lebanon, Middle East Univ Beirut'
    },
    {
        id: 'sagesse',
        full_name: 'Sagesse University',
        abbreviation: 'ULS',
        alt_text: 'Sagesse University (ULS), ULS logo, Sagesse University logo, Universite La Sagesse, Sagesse Univ Lebanon, ULS Lebanon'
    },
    {
        id: 'aou',
        full_name: 'Arab Open University',
        abbreviation: 'AOU, AO University',
        alt_text: 'Arab Open University (AOU), AOU logo, Arab Open University logo, AOU Lebanon, Arab Open Uni, AOU Beirut, AO University, Arab Open University Lebanon'
    },
    {
        id: 'aust',
        full_name: 'American University of Science and Technology',
        abbreviation: 'AUST',
        alt_text: 'American University of Science and Technology (AUST), AUST logo, American University of Science and Technology logo, AUST Lebanon, American Univ Science Technology, AUST Beirut'
    },
    {
        id: 'rhu',
        full_name: 'Rafik Hariri University',
        abbreviation: 'RHU',
        alt_text: 'Rafik Hariri University (RHU), RHU logo, Rafik Hariri University logo, RHU Lebanon, Rafic Hariri Univ, Rafik Hariri Uni Beirut'
    },
    {
        id: 'aut',
        full_name: 'American University of Technology',
        abbreviation: 'AUT',
        alt_text: 'American University of Technology (AUT), AUT logo, American University of Technology logo, AUT Lebanon, American Univ Tech, AUT Beirut'
    },
    {
        id: 'mubs',
        full_name: 'Modern University for Business and Science',
        abbreviation: 'MUBS',
        alt_text: 'Modern University for Business and Science (MUBS), MUBS logo, Modern University for Business and Science logo, MUBS Lebanon, Modern Univ Business Science, MUBS Beirut'
    },
    {
        id: 'aku',
        full_name: 'Al-Kafaàt University',
        abbreviation: 'AKU',
        alt_text: 'Al-Kafaat University (AKU), AKU logo, Al-Kafaat University logo, Al Kafaat University, AKU Lebanon, Al Kafaat Uni'
    },
    {
        id: 'self',
        full_name: 'Self taught',
        abbreviation: 'SELF',
        alt_text: 'Self-taught, Self-taught logo, Self-learning icon, Self-educated, Independent learning, Self taught path'
    },
    {
        id: 'mu',
        full_name: 'Al Maaref University',
        abbreviation: 'MU',
        alt_text: 'Al Maaref University, Almaaref, Al maaref, MU Uni, MU, Maaref'
    },
];

const REGIONS = [
    "Beirut", "Metn/Baabda", "Jbeil/Keserwen", "Aley/Chouf",
    "North", "Akkar", "South/Nabatiyi", "Beqaa/Hermel", "Outside Lebanon"
]

const EXPERIENCE_CATEGORIES = {
    Student: [
        "1st - 2nd",
        "3rd Year",
        "Master Student",
        "PHD",
        "Fresh Graduate",
        "Bootcamp Attendee",
        "Bootcamp Graduate",
        "Looking for a job"
    ],
    Professional: [
        "Intern",
        "< 1 year",
        "1 - 3 years",
        "3 - 5 years",
        "5+ years",
    ],
    "Manager / Team Lead": [
        "CTO",
        "CEO",
        "Project Manager",
        "Manager / Director",
        "Executive Manager",
        "Executive / Founder"
    ]
}

const SPECIALIZATIONS = [
    "AI Engineer", "AI Researcher", "Full Stack Developer", "Data Scientist", "Data Engineer",
    "Cloud Engineer", "DevOps Engineer", "Backend Developer", "Frontend Developer",
    "Mobile Developer", "Product Manager", "Project Manager", "UX/UI Designer", "QA Engineer", "Other in tech", "Other non-tech"
]

const UNIVERSITY_MAJORS = [
    "Computer Science", "Computer Engineering", "Software Engineering", "Information Technology", "Information Systems", "Data Science", "Artificial Intelligence", "Cybersecurity", "Network Engineering", "Math & Computer Science", "Bioinformatics",
    "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Mechatronics Engineering", "Biomedical Engineering", "Chemical Engineering", "Industrial Engineering", "Aerospace Engineering", "Petroleum Engineering", "Environmental Engineering", "Computer Communications Engineering",
    "Business Administration", "Marketing", "Finance", "Accounting", "Economics", "Management Information Systems", "Human Resources", "Business Analytics", "Entrepreneurship", "Hospitality Management", "Supply Chain Management",
    "Graphic Design", "UI/UX Design", "Interior Design", "Digital Media", "Multimedia Design", "Animation", "Fashion Design", "Industrial Design",
    "Mathematics", "Physics", "Chemistry", "Biology", "Statistics", "Geology", "Environmental Science", "Astronomy",
    "Medicine", "Pharmacy", "Nursing", "Dentistry", "Public Health", "Nutrition", "Physical Therapy", "Veterinary Medicine", "Biomedical Sciences",
    "Law", "Political Science", "International Relations", "Psychology", "Sociology", "Education", "English Literature", "Translation", "History", "Philosophy", "Linguistics", "Anthropology",
    "Architecture", "Fine Arts", "Journalism", "Mass Communication", "Public Relations", "Radio & Television",
    "Other"
]

const TECH_INTERESTS = [
    "Front End", "Cloud", "Kubernetes", "Microservices", "Databases",
    "Android", "Flutter", "Machine Learning", "Tensorflow / Keras",
    "Google Gemini / ChatGPT", "Cybersecurity", "Web3 / Blockchain", "Other"
]

const TAKEAWAYS = [
    "New technologies", "Networking",
    "Hands-on workshops", "Inspiring speakers",
    "Local tech community", "Career opportunities",
    "Open Source challenge", "Other"
]

const DEVFEST_ATTENDANCE_OPTIONS = [
    "Yes",
    "Registered,\nnever invited",
    "Heard of it",
    "No"
]

const App = () => {
    const [isOpen, setIsOpen] = useState(true)
    const [isVip, setIsVip] = useState(false)

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setIsVip(params.has('vip'));
    }, []);

    const [formData, setFormData] = useState({
        secretCode: '',
        email: '',
        firstName: '',
        lastName: '',
        specialization: '',
        activeExpCategories: [],
        expLevels: {
            Student: 0,
            Professional: 0,
            "Manager / Team Lead": 0
        },
        status: '', // Derived from experience (student/prof/fresh)
        company: '',
        university: '',
        referral: '',
        referralOtherText: '',
        referralPartnerText: '',
        region: '',
        ageRange: '',
        gender: '',
        linkedIn: '',
        phone: '',
        attendedBefore: 3, // Defaulting to "No" (index 3) or could leave null
        takeaways: [],
        techInterests: [],
        otherTechInterestInput: '',
        comments: '',
        attendanceType: ''
    })

    const [pending, setPending] = useState(readPending)
    const [verifiedUser, setVerifiedUser] = useState(null)
    const [submitError, setSubmitError] = useState('')
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    // Company Search State
    const [searchTerm, setSearchTerm] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [showAddCompany, setShowAddCompany] = useState(false)
    const [isCompanyFocused, setIsCompanyFocused] = useState(false)
    const companySearchRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (companySearchRef.current && !companySearchRef.current.contains(event.target)) {
                setIsCompanyFocused(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [])

    useEffect(() => {
        setIsOpen(isRegistrationOpen());
    }, [])

    useEffect(() => {
        const selectedUniv = UNIVERSITIES.find(u => u.abbreviation === formData.university);
        const isAlreadySelected = (selectedUniv && searchTerm === selectedUniv.full_name) || (formData.company && searchTerm === formData.company);

        if (!isCompanyFocused) {
            setSearchResults([])
            setShowAddCompany(false)
            return
        }

        if (searchTerm.trim() === '') {
            setSearchResults(UNIVERSITIES)
            setShowAddCompany(false)
        } else {
            const results = UNIVERSITIES.filter(u => {
                const q = searchTerm.toLowerCase()
                return u.full_name.toLowerCase().includes(q) ||
                    u.abbreviation.toLowerCase().includes(q) ||
                    u.alt_text.toLowerCase().includes(q)
            })
            setSearchResults(results)
            setShowAddCompany(results.length === 0 && !UNIVERSITIES.find(u => u.full_name.toLowerCase() === searchTerm.toLowerCase()))
        }
    }, [searchTerm, formData.university, formData.company, isCompanyFocused])

    // Derive status simple category for the badge based on experience selection
    useEffect(() => {
        let newStatus = 'professional';
        if (formData.activeExpCategories.includes('Manager / Team Lead')) {
            newStatus = 'professional';
        } else if (formData.activeExpCategories.includes('Professional')) {
            newStatus = 'professional';
        } else if (formData.activeExpCategories.includes('Student')) {
            const studentLevel = EXPERIENCE_CATEGORIES.Student[formData.expLevels.Student];
            if (studentLevel === "Fresh Graduate" || studentLevel === "Bootcamp Graduate") {
                newStatus = 'fresh_graduate';
            } else {
                newStatus = 'student';
            }
        } else {
            newStatus = 'attendee';
        }

        setFormData(prev => ({ ...prev, status: newStatus }));
    }, [formData.activeExpCategories, formData.expLevels]);

    const validate = () => {
        const newErrors = {};
        if (isVip && !formData.secretCode) newErrors.secretCode = 'Secret code is required';
        if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (formData.activeExpCategories.length === 0) newErrors.experience = 'Please select at least one experience category';

        const phoneClean = (formData.phone || '').replace(/\s+/g, '');
        if (phoneClean && !/^(?:\+961)?(03|71|76|78|79)\d{6}$/.test(phoneClean)) {
            newErrors.phone = 'Invalid format. Use 8 digits starting with 03, 71, 76, 78, or 79';
        }

        if (!formData.linkedIn) {
            newErrors.linkedIn = 'LinkedIn Link is required';
        } else if (!/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(formData.linkedIn)) {
            newErrors.linkedIn = 'Please provide a valid LinkedIn URL';
        }

        if (!formData.region) newErrors.region = 'Please select a region';
        if (formData.attendedBefore === '') newErrors.attendedBefore = 'Please select an option';
        if (formData.takeaways.length === 0) newErrors.takeaways = 'Please select your main takeaways';
        if (!formData.referral) newErrors.referral = 'Please select how you heard about us';
        if (!formData.attendanceType) newErrors.attendanceType = 'Please select your expected attendance';
        if (!formData.company && !formData.university && !searchTerm) {
            newErrors.companySearch = 'Company or university is required. Search and select or add a new one.';
        }

        if (!formData.specialization) newErrors.specialization = 'Please select a specialization';

        const isProfOrFresh = formData.status === 'professional' || formData.status === 'fresh_graduate';
        if (!isProfOrFresh && (formData.university || formData.company) && !formData.major) {
            newErrors.major = 'Please choose your major';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            // Scroll to the first error smoothly
            const firstErrorField = document.querySelector('.has-error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }
        return true;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (validate()) {
            setIsSubmitting(true);
            // Build referral value
            let referralValue = formData.referral;
            if (formData.referral === 'Via Partner' && formData.referralPartnerText) {
                referralValue = `partner: ${formData.referralPartnerText}`;
            } else if (formData.referral === 'Other' && formData.referralOtherText) {
                referralValue = `Other: ${formData.referralOtherText}`;
            }
            const submitData = { ...formData, referral: referralValue };
            try {
                if (verifiedUser && verifiedUser.email?.toLowerCase() === formData.email.trim().toLowerCase()) {
                    await api('register', { email: formData.email, form: submitData }, verifiedUser);
                    setIsSuccess(true);
                } else {
                    const session = await api('pending', { email: formData.email, form: submitData });
                    localStorage.setItem(PENDING_KEY, JSON.stringify(session));
                    setPending(session);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) { setSubmitError(error.message); }
            finally { setIsSubmitting(false); }
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field while typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target;
        validateUpTo(name, { [name]: value });
    }

    // Helper to validate all fields up to the currently interacting field
    const validateUpTo = (currentFieldName, overrides = {}) => {
        const currentData = { ...formData, ...overrides };
        // Define the sequential order of all mandatory fields
        const fieldOrder = [
            'email',
            'firstName',
            'lastName',
            'linkedIn',
            'region',
            'experience',
            'specialization',
            'companySearch', // Represents Company/University requirement
            'major',
            'attendedBefore',
            'referral',
            'takeaways',
            'attendanceType'
        ];

        // Add secret code to the beginning if VIP
        if (isVip) {
            fieldOrder.unshift('secretCode');
        }

        const currentIndex = fieldOrder.indexOf(currentFieldName);

        // Let's run full validation logically to get all possible errors
        const tempErrors = {};
        if (isVip && !currentData.secretCode) tempErrors.secretCode = 'Secret code is required';
        if (!currentData.email || !/^\S+@\S+\.\S+$/.test(currentData.email)) tempErrors.email = 'Valid email is required';
        if (!currentData.firstName) tempErrors.firstName = 'First name is required';
        if (!currentData.lastName) tempErrors.lastName = 'Last name is required';
        if (!currentData.linkedIn) {
            tempErrors.linkedIn = 'LinkedIn Link is required';
        } else if (!/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(currentData.linkedIn)) {
            tempErrors.linkedIn = 'Please provide a valid LinkedIn URL';
        }
        if (!currentData.region) tempErrors.region = 'Please select a region';
        if (currentData.activeExpCategories.length === 0) tempErrors.experience = 'Please select at least one experience category';

        if (!currentData.specialization) {
            tempErrors.specialization = 'Please select a specialization';
        }

        const isProfOrFresh = currentData.status === 'professional' || currentData.status === 'fresh_graduate';
        if (!isProfOrFresh && (currentData.university || currentData.company) && !currentData.major) {
            tempErrors.major = 'Please choose your major';
        }

        if (!currentData.company && !currentData.university && !searchTerm) {
            tempErrors.companySearch = 'Company or university is required. Search and select or add a new one.';
        }
        if (currentData.attendedBefore === '') tempErrors.attendedBefore = 'Please select an option';
        if (currentData.takeaways.length === 0) tempErrors.takeaways = 'Please select your main takeaways';
        if (!currentData.referral) tempErrors.referral = 'Please select how you heard about us';
        if (!currentData.attendanceType) tempErrors.attendanceType = 'Please select your expected attendance';

        // We also always check phone format specifically on blur if it has a value, regardless of order
        const phoneClean = (currentData.phone || '').replace(/\s+/g, '');
        if (phoneClean && !/^(?:\+961)?(03|71|76|78|79)\d{6}$/.test(phoneClean)) {
            tempErrors.phone = 'Invalid format. Use 8 digits starting with 03, 71, 76, 78, or 79';
        }

        setErrors(prev => {
            const updatedErrors = { ...prev };

            // Apply errors for all fields BEFORE and INCLUDING the current field in the sequence
            // For example, if user blurs/changes 'region', evaluate 'email', 'firstName', 'lastName', 'linkedIn', AND 'region'
            if (currentIndex !== -1) {
                for (let i = 0; i <= currentIndex; i++) {
                    const fieldToCheck = fieldOrder[i];
                    if (tempErrors[fieldToCheck]) {
                        updatedErrors[fieldToCheck] = tempErrors[fieldToCheck];
                    }
                }
            } else {
                // If it's a field not in the strict order (like phone), just check its own error
                if (tempErrors[currentFieldName]) {
                    updatedErrors[currentFieldName] = tempErrors[currentFieldName];
                }
            }

            // Always clear the error of the *current* field if it has been fixed
            if (currentIndex !== -1 && !tempErrors[currentFieldName]) {
                updatedErrors[currentFieldName] = null;
            } else if (!tempErrors[currentFieldName]) {
                updatedErrors[currentFieldName] = null;
            }

            // Explicitly set phone error if it exists, clear if it doesn't and we are checking phone
            if (currentFieldName === 'phone') {
                updatedErrors.phone = tempErrors.phone || null;
            }

            return updatedErrors;
        });
    }

    const handleMultiSelect = (name, value) => {
        setFormData(prev => {
            const currentList = prev[name];
            const newList = currentList.includes(value)
                ? currentList.filter(item => item !== value)
                : [...currentList, value];
            return { ...prev, [name]: newList };
        });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }

    const isProfessionalOrFreshGrad = formData.status === 'professional' || formData.status === 'fresh_graduate';

    if (pending && !isSuccess) return <VerificationStep initial={pending} onDone={firstName => { setFormData(prev => ({ ...prev, firstName })); setPending(null); setIsSuccess(true); }} />;

    if (!isOpen) {
        return (
            <div className="app-container closed-container">
                <div className="logo-container">
                    <img src={logo} alt="GDG Lebanon Logo" className="logo" />
                </div>
                <div className="closed-message">
                    <AlertTriangle size={48} className="warning-icon" />
                    <h1>Registration Closed</h1>
                    <p>Thank you for your interest! Registration for {EVENT_CONFIG.eventName} is now closed.</p>
                </div>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <div className="app-container success-container">
                <div className="logo-container">
                    <img src={logo} alt="GDG Lebanon Logo" className="logo" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="success-message"
                >
                    <CheckCircle2 size={64} className="success-icon" />
                    <h1>RSVP Submitted Successfully!</h1>
                    <p>Thank you, {formData.firstName}. Your email is confirmed and your registration is complete. Please wait for our notice.</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo-container">
                    <img src={logo} alt="GDG Lebanon Logo" className="logo" />
                </div>
                <div className="header-text">
                    <h1>{EVENT_CONFIG.eventName}</h1>
                    <p>{EVENT_CONFIG.eventDescription}</p>
                </div>
            </header>

            <main className="form-wrapper">
                <form onSubmit={handleSubmit} className="single-page-form" noValidate>
                    {submitError && <p role="alert" className="login-panel login-error">{submitError}</p>}

                    {isVip && (
                        <section className="form-section">
                            <h2>Access & Security</h2>
                            <FormField label="Secret Code" required error={errors.secretCode}>
                                <input
                                    type="text"
                                    name="secretCode"
                                    placeholder="Enter your VIP or general access code"
                                    value={formData.secretCode}
                                    onChange={handleChange}
                                />
                            </FormField>
                        </section>
                    )}

                    <section className="form-section">
                        <h2>Personal Information</h2>

                        <FormField label="Email" required error={errors.email}>
                            <input type="email" name="email" placeholder="your.email@example.com" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
                        </FormField>

                        <AttendeeLogin email={formData.email}
                            onEmail={email => setFormData(prev => ({ ...prev, email }))}
                            onVerified={setVerifiedUser}
                            onProfile={profile => {
                                const mapped = mapProfile(profile, UNIVERSITIES);
                                setFormData(prev => ({ ...prev, ...mapped }));
                                if (profile.company) setSearchTerm(profile.company);
                                setErrors({});
                            }} />

                        <div className="grid-2-always">
                            <FormField label="First Name" required error={errors.firstName}>
                                <input type="text" name="firstName" placeholder="First name" value={formData.firstName} onChange={handleChange} onBlur={handleBlur} />
                            </FormField>
                            <FormField label="Last Name" required error={errors.lastName}>
                                <input type="text" name="lastName" placeholder="Last name" value={formData.lastName} onChange={handleChange} onBlur={handleBlur} />
                            </FormField>
                        </div>

                        <div className="grid-2-always">
                            <FormField label="Phone Number" error={errors.phone}>
                                <input type="tel" name="phone" placeholder="+961 XX XXX XXX" value={formData.phone} onChange={handleChange} onBlur={handleBlur} />
                            </FormField>
                            <FormField label="LinkedIn Profile Link" required error={errors.linkedIn}>
                                <input type="url" name="linkedIn" placeholder="https://linkedin.com/in/..." value={formData.linkedIn} onChange={handleChange} onBlur={handleBlur} />
                            </FormField>
                        </div>

                        <div>
                            <FormField label="Region" required error={errors.region}>
                                <SearchableSelect
                                    options={REGIONS}
                                    value={formData.region}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, region: val }))
                                        if (errors.region) setErrors(prev => ({ ...prev, region: null }))
                                        validateUpTo('region', { region: val });
                                    }}
                                    placeholder="Select your region or nearest"
                                    allowAdd={false}
                                />
                            </FormField>
                        </div>

                        <div className="grid-2-always">
                            <FormField label="Age Range (Optional)">
                                <select name="ageRange" value={formData.ageRange} onChange={handleChange} className={!formData.ageRange ? 'select-placeholder' : ''}>
                                    <option value="">Select age range</option>
                                    <option value="18-23">18 - 23 years</option>
                                    <option value="24-30">24 - 30 years</option>
                                    <option value="30+">30+ years</option>
                                </select>
                            </FormField>

                            <FormField label="Gender (Optional)">
                                <select name="gender" value={formData.gender} onChange={handleChange} className={!formData.gender ? 'select-placeholder' : ''}>
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                            </FormField>
                        </div>
                    </section>

                    <section className="form-section">
                        <h2>Professional Profile</h2>

                        <FormField label="Your Specialization" required error={errors.specialization}>
                            <SearchableSelect
                                options={SPECIALIZATIONS}
                                value={formData.specialization}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, specialization: val }))
                                    if (errors.specialization) setErrors(prev => ({ ...prev, specialization: null }))
                                    validateUpTo('specialization', { specialization: val });
                                }}
                                placeholder="Select specialization"
                                allowAdd={false}
                                fallbackOptions={["Other in tech", "Other non-tech"]}
                            />
                        </FormField>

                        <FormField label="Experience / Study Category (Select all that apply)" required error={errors.experience}>
                            {/*add hint text */}
                            <p className="hint" style={{ fontSize: '13px', color: '#6b7280', marginTop: '-4px', marginBottom: '12px' }}>
                                For example if you are student and working select both, if you are software engineer and CTO select both
                            </p>
                            <div className="pill-grid pill-grid--equal">
                                {Object.keys(EXPERIENCE_CATEGORIES).map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={`pill-btn ${formData.activeExpCategories.includes(cat) ? 'active' : ''}`}
                                        onClick={() => {
                                            const cats = formData.activeExpCategories;
                                            const newCats = cats.includes(cat)
                                                ? cats.filter(c => c !== cat)
                                                : [...cats, cat];
                                            setFormData(prev => ({ ...prev, activeExpCategories: newCats }));
                                            if (errors.experience) setErrors(prev => ({ ...prev, experience: null }));
                                            validateUpTo('experience', { activeExpCategories: newCats });
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {formData.activeExpCategories.length > 0 && (
                                <div className="sliders-container">
                                    {formData.activeExpCategories.map(cat => (
                                        <div key={cat} className="experience-slider-group">
                                            <label className="slider-category-label">Select your {cat} level:</label>
                                            <div className="custom-slider-wrapper">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={EXPERIENCE_CATEGORIES[cat].length - 1}
                                                    step="1"
                                                    value={formData.expLevels[cat]}
                                                    onChange={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            expLevels: { ...prev.expLevels, [cat]: val }
                                                        }));
                                                    }}
                                                    className="experience-range"
                                                />
                                                <div className="slider-ticks">
                                                    {EXPERIENCE_CATEGORIES[cat].map((opt, idx, arr) => {
                                                        const total = arr.length > 1 ? arr.length - 1 : 1;
                                                        const percent = (idx / total) * 100;
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`slider-tick ${formData.expLevels[cat] === idx ? 'active' : ''}`}
                                                                style={{ left: `${percent}%` }}
                                                                onClick={() => {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        expLevels: { ...prev.expLevels, [cat]: idx }
                                                                    }));
                                                                }}
                                                            >
                                                                <div className="tick-mark"></div>
                                                                <div className="tick-label">{opt}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </FormField>

                        <FormField
                            label={isProfessionalOrFreshGrad ? "Your current company (Required for badge)" : "Your university"}
                            required
                            error={errors.companySearch}
                        >
                            <div className="search-box" ref={companySearchRef}>
                                <div className="search-input-wrapper">
                                    <Building2 size={20} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search name or type to add new..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            if (errors.companySearch) setErrors(prev => ({ ...prev, companySearch: null }));
                                        }}
                                        onFocus={() => setIsCompanyFocused(true)}
                                        onClick={() => setIsCompanyFocused(true)}
                                    />
                                </div>
                                {isProfessionalOrFreshGrad && (
                                    <span className="form-subtitle" style={{ marginTop: '4px', fontSize: '13px' }}>
                                        Hint: If you are a Freelancer, please write "Freelancer"
                                    </span>
                                )}

                                {(searchResults.length > 0 || (showAddCompany && searchTerm.length > 1)) && isCompanyFocused && (
                                    <div className="results-list">
                                        {searchResults.map(result => (
                                            <div
                                                key={result.id}
                                                className="result-entry"
                                                onClick={() => {
                                                    const newUniversity = result.abbreviation;
                                                    setFormData({ ...formData, university: newUniversity, company: '' })
                                                    setSearchTerm(result.full_name)
                                                    setIsCompanyFocused(false)
                                                    if (errors.companySearch) setErrors(prev => ({ ...prev, companySearch: null }));
                                                    validateUpTo('companySearch', { university: newUniversity, company: '' });
                                                }}
                                            >
                                                {result.full_name}
                                            </div>
                                        ))}

                                        {searchTerm.length > 1 && (
                                            <button
                                                type="button"
                                                className="ss-add-btn"
                                                onClick={() => {
                                                    setFormData({ ...formData, company: searchTerm, university: '' })
                                                    setIsCompanyFocused(false)
                                                    if (errors.companySearch) setErrors(prev => ({ ...prev, companySearch: null }));
                                                    validateUpTo('companySearch', { company: searchTerm, university: '' });
                                                }}
                                            >
                                                <Plus size={14} />
                                                <span>Add "<strong>{searchTerm}</strong>"</span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                {(formData.company || formData.university) && (searchTerm === formData.company || searchTerm === UNIVERSITIES.find(u => u.abbreviation === formData.university)?.full_name) && (
                                    <div className="selected-indicator success">
                                        <CheckCircle2 size={16} /> Successfully Selected: {searchTerm}
                                    </div>
                                )}
                            </div>
                        </FormField>

                        {!isProfessionalOrFreshGrad && (formData.company || formData.university) && (
                            <FormField label="Your Major" required error={errors.major}>
                                <SearchableSelect
                                    options={UNIVERSITY_MAJORS}
                                    value={formData.major}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, major: val }))
                                        if (errors.major) setErrors(prev => ({ ...prev, major: null }))
                                        validateUpTo('major', { major: val });
                                    }}
                                    placeholder="e.g., Computer Science, Engineering, Business Administration"
                                    allowAdd={true}
                                />
                            </FormField>
                        )}

                        <div className="badge-preview">
                            <p className="preview-label">Live Badge Preview</p>
                            <div className="badge-card">
                                <div className="badge-name">{formData.firstName || 'Your'} {formData.lastName || 'Name'}</div>
                                <div className="badge-role">
                                    {formData.status === 'professional' ? 'Professional' :
                                        formData.status === 'student' ? 'Student' :
                                            formData.status === 'fresh_graduate' ? 'Fresh Graduate' : 'Attendee'}
                                </div>
                                <div className="badge-company">{formData.company || UNIVERSITIES.find(u => u.abbreviation === formData.university)?.full_name || searchTerm || 'Company / University'}</div>
                                <div className="badge-footer">GDG Lebanon RSVP</div>
                            </div>
                        </div>
                    </section>

                    <section className="form-section">
                        <h2>Event Questions & Interests</h2>

                        <FormField label="Have you attended DevFest before?" required error={errors.attendedBefore}>
                            <div className="custom-slider-wrapper" style={{ marginTop: '30px', marginBottom: '40px' }}>
                                <input
                                    type="range"
                                    min="0"
                                    max={DEVFEST_ATTENDANCE_OPTIONS.length - 1}
                                    step="1"
                                    value={formData.attendedBefore}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        setFormData(prev => ({ ...prev, attendedBefore: val }));
                                        if (errors.attendedBefore) setErrors(prev => ({ ...prev, attendedBefore: null }));
                                    }}
                                    className="experience-range"
                                />
                                <div className="slider-ticks">
                                    {DEVFEST_ATTENDANCE_OPTIONS.map((opt, idx, arr) => {
                                        const total = arr.length - 1;
                                        const percent = (idx / total) * 100;
                                        return (
                                            <div
                                                key={idx}
                                                className={`slider-tick ${formData.attendedBefore === idx ? 'active' : ''}`}
                                                style={{ left: `${percent}%` }}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, attendedBefore: idx }));
                                                    if (errors.attendedBefore) setErrors(prev => ({ ...prev, attendedBefore: null }));
                                                    validateUpTo('attendedBefore', { attendedBefore: idx });
                                                }}
                                            >
                                                <div className="tick-mark"></div>
                                                <div className="tick-label" style={{ fontSize: '11px', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                                    {opt.split('\n').map((line, i) => (
                                                        <span key={i}>{line}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </FormField>

                        <FormField label="How did you hear about DevFest?" required error={errors.referral}>
                            <SearchableSelect
                                options={["Social Media", "University", "Friends / Colleagues", "GDG Website / Newsletter", "Other community events", "Via Partner", "Other"]}
                                value={formData.referral}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, referral: val, referralOtherText: '', referralPartnerText: '' }))
                                    if (errors.referral) setErrors(prev => ({ ...prev, referral: null }))
                                    validateUpTo('referral', { referral: val });
                                }}
                                placeholder="Select source"
                                allowAdd={false}
                                fallbackOptions={["Other"]}
                            />
                            {formData.referral === 'Via Partner' && (
                                <div style={{ marginTop: '10px', paddingLeft: '12px', borderLeft: '3px solid var(--google-blue)' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ background: 'rgba(66,133,244,0.04)', fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)' }}
                                        placeholder="Partner name (e.g. Google, AWS...)"
                                        value={formData.referralPartnerText}
                                        onChange={(e) => setFormData(prev => ({ ...prev, referralPartnerText: e.target.value }))}
                                    />
                                </div>
                            )}
                            {formData.referral === 'Other' && (
                                <div style={{ marginTop: '10px', paddingLeft: '12px', borderLeft: '3px solid var(--google-yellow)' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        style={{ background: 'rgba(251,188,5,0.05)', fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)' }}
                                        placeholder="Please specify..."
                                        value={formData.referralOtherText}
                                        onChange={(e) => setFormData(prev => ({ ...prev, referralOtherText: e.target.value }))}
                                    />
                                </div>
                            )}
                        </FormField>

                        <FormField label="What are your main takeaways? (Select multiple)" required error={errors.takeaways}>
                            <div className="pill-grid">
                                {TAKEAWAYS.map(item => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`pill-btn ${formData.takeaways.includes(item) ? 'active' : ''}`}
                                        onClick={() => {
                                            const current = formData.takeaways;
                                            const updated = current.includes(item) ? current.filter(x => x !== item) : [...current, item];
                                            setFormData(prev => ({ ...prev, takeaways: updated }));
                                            if (errors.takeaways) setErrors(prev => ({ ...prev, takeaways: null }));
                                            validateUpTo('takeaways', { takeaways: updated });
                                        }}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                            {formData.takeaways.includes("Other") && (
                                <div style={{ marginTop: '10px', paddingLeft: '12px', borderLeft: '3px solid var(--google-yellow)' }}>
                                    <input
                                        type="text"
                                        name="otherTakeawaysInput"
                                        className="form-input"
                                        style={{ background: 'rgba(251,188,5,0.05)', fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)' }}
                                        placeholder="Please specify other takeaways..."
                                        value={formData.otherTakeawaysInput}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </FormField>

                        <FormField label="Please select the technologies you are interested in (Optional)">
                            <div className="pill-grid">
                                {TECH_INTERESTS.map(tech => (
                                    <button
                                        key={tech}
                                        type="button"
                                        className={`pill-btn ${formData.techInterests.includes(tech) ? 'active' : ''}`}
                                        onClick={() => handleMultiSelect('techInterests', tech)}
                                    >
                                        {tech}
                                    </button>
                                ))}
                            </div>
                            {formData.techInterests.includes("Other") && (
                                <div style={{ marginTop: '10px', paddingLeft: '12px', borderLeft: '3px solid var(--google-yellow)' }}>
                                    <input
                                        type="text"
                                        name="otherTechInterestInput"
                                        className="form-input"
                                        style={{ background: 'rgba(251,188,5,0.05)', fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)' }}
                                        placeholder="Please specify other tech interests..."
                                        value={formData.otherTechInterestInput}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </FormField>
                    </section>

                    <section className="form-section attendance-section">
                        <h2>Attendance & Networking Details</h2>
                        <p className="form-subtitle">Knowing your expected stay helps us reduce food waste and manage seating effectively.</p>

                        <FormField label="Expected Attendance Type" required error={errors.attendanceType}>
                            <div className="attendance-grid">
                                <button
                                    type="button"
                                    className={`attendance-card ${formData.attendanceType === 'full_day' ? 'active active-blue' : ''}`}
                                    onClick={() => {
                                        const nextData = { ...formData, attendanceType: 'full_day' };
                                        setFormData(nextData);
                                        if (errors.attendanceType) setErrors(prev => ({ ...prev, attendanceType: null }));
                                        validateUpTo('attendanceType', { attendanceType: 'full_day' });
                                    }}
                                >
                                    <div className="card-top">
                                        <Clock className="icon-blue" />
                                        <div className="card-text">
                                            <strong>Full Day Experience</strong>
                                            <span>Attend all sessions and networking events.</span>
                                        </div>
                                    </div>
                                    <div className="card-tag neutral">Standard Selection | Includes guaranteed lunch and swag</div>
                                </button>

                                <button
                                    type="button"
                                    className={`attendance-card ${formData.attendanceType === 'few_hours' ? 'active active-red' : ''}`}
                                    onClick={() => {
                                        const nextData = { ...formData, attendanceType: 'few_hours' };
                                        setFormData(nextData);
                                        if (errors.attendanceType) setErrors(prev => ({ ...prev, attendanceType: null }));
                                        validateUpTo('attendanceType', { attendanceType: 'few_hours' });
                                    }}
                                >
                                    <div className="card-top">
                                        <Clock className="icon-red" />
                                        <div className="card-text">
                                            <strong>Flash Attendee (Few Hours)</strong>
                                            <span>Quick visit to catch specific talks.</span>
                                        </div>
                                    </div>
                                    <div className="card-tag high">High Selection | 1 Workshop Seat</div>
                                </button>

                                <button
                                    type="button"
                                    className={`attendance-card ${formData.attendanceType === 'networking' ? 'active active-yellow' : ''}`}
                                    onClick={() => {
                                        const nextData = { ...formData, attendanceType: 'networking' };
                                        setFormData(nextData);
                                        if (errors.attendanceType) setErrors(prev => ({ ...prev, attendanceType: null }));
                                        validateUpTo('attendanceType', { attendanceType: 'networking' });
                                    }}
                                >
                                    <div className="card-top">
                                        <Users className="icon-yellow" />
                                        <div className="card-text">
                                            <strong>Networking Focused (Visitor)</strong>
                                            <span>Focus on making connections in the lobby and expo.</span>
                                        </div>
                                    </div>
                                    <div className="card-tag high">High Selection | Session not guaranteed</div>
                                </button>

                                <button
                                    type="button"
                                    className={`attendance-card ${formData.attendanceType === 'afternoon' ? 'active active-green' : ''}`}
                                    onClick={() => {
                                        const nextData = { ...formData, attendanceType: 'afternoon' };
                                        setFormData(nextData);
                                        if (errors.attendanceType) setErrors(prev => ({ ...prev, attendanceType: null }));
                                        validateUpTo('attendanceType', { attendanceType: 'afternoon' });
                                    }}
                                >
                                    <div className="card-top">
                                        <Sunset className="icon-green" />
                                        <div className="card-text">
                                            <strong>Afternoon attendee</strong>
                                            <span>Access only starting 13:30 till the end of the day.</span>
                                        </div>
                                    </div>
                                    <div className="card-tag danger">Limited Access</div>
                                </button>
                            </div>
                        </FormField>

                        <div className="disclaimer-alert">
                            <Utensils size={28} className="icon" />
                            <p>Important Note: Meals are guaranteed only for Full Day Experience attendees. Opting for a shorter, more targeted visit helps us accommodate more attendees and might increase your chances of being selected! As we try to have diverse attendees.</p>
                        </div>

                        <FormField label="Additional Comments / 5min demo proposal (Optional)">
                            <textarea
                                name="comments"
                                rows="3"
                                placeholder="Any suggestions, topics you'd like to hear about, or propose a 5min demo..."
                                value={formData.comments}
                                onChange={handleChange}
                            ></textarea>
                        </FormField>
                    </section>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-primary btn-large"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit RSVP'} <Send size={18} />
                        </button>
                    </div>

                </form>
            </main>
        </div>
    )
}

export default App
