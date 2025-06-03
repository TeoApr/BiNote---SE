// Sample Data for the Application

// Sample Notes Data
const sampleNotes = [
    {
        id: 1,
        title: "Computational Biology",
        author: "Jonathan Tristan",
        subject: "Computer Science",
        price: 19999,
        pages: 20,
        rating: 4.8,
        reviews: 51,
        description: "Complete semester lecture summaries for Computational Biology, key formulas with detailed explanations, practice problems with comprehensive solutions, diagrams and illustrations of core concepts",
        features: [
            "Complete semester lecture summaries for Computational Biology",
            "Key formulas with detailed explanations",
            "Practice problems with comprehensive solutions",
            "Diagrams and illustrations of core concepts"
        ],
        icon: "📊",
        reviews_list: [
            {
                user: "I Gusti Ngurah",
                rating: 5,
                comment: "Catatannya super jelas dan rapi! Penjelasan tentang transkripsi dan translasi jadi mudah dipahami, apalagi ada diagram dan contoh soalnya juga. Sangat membantu belajar sebelum ujian, recommended banget!"
            },
            {
                user: "Babeh",
                rating: 5,
                comment: "Catatannya sangat membantu dan isinya cukup lengkap, terutama bagian transkripsi dan translasinya jelas. Mungkin akan lebih bagus lagi kalau ditambah sedikit penjelasan aplikasinya dalam bioinformatika. Tapi overall worth it!"
            }
        ]
    },
    {
        id: 2,
        title: "Code Reengineering",
        author: "Jonathan Tristan",
        subject: "Computer Science",
        price: 14999,
        pages: 30,
        rating: 4.7,
        reviews: 35,
        description: "Smell Code The Bloaters lengkap dengan contoh soal, latihan dan kisi-kisi untuk ujian",
        features: [
            "Smell Code identification techniques",
            "Refactoring patterns and practices",
            "Code quality metrics",
            "Real-world examples and case studies"
        ],
        icon: "🔧",
        reviews_list: [
            {
                user: "Ahmad",
                rating: 5,
                comment: "Materinya sangat praktis dan mudah diaplikasikan"
            }
        ]
    },
    {
        id: 3,
        title: "Agile Software Development",
        author: "Jonathan Tristan",
        subject: "Computer Science",
        price: 9999,
        pages: 20,
        rating: 5.0,
        reviews: 28,
        description: "Comprehensive guide to Agile methodologies and practices",
        features: [
            "Scrum framework explained",
            "Sprint planning techniques",
            "User stories and epics",
            "Agile estimation methods"
        ],
        icon: "⚡",
        reviews_list: []
    },
    {
        id: 4,
        title: "Software Engineering",
        author: "Jonathan Tristan",
        subject: "Engineering",
        price: 49999,
        pages: 25,
        rating: 4.6,
        reviews: 42,
        description: "Mata kuliah yang membahas proses perancangan, pengembangan, dan pemeliharaan perangkat lunak secara terstruktur dan efisien",
        features: [
            "Software development lifecycle",
            "Requirements engineering",
            "Software architecture patterns",
            "Testing and quality assurance"
        ],
        icon: "🏗️",
        reviews_list: []
    },
    {
        id: 5,
        title: "Pattern Software Design",
        author: "Jonathan Tristan",
        subject: "Computer Science",
        price: 44999,
        pages: 21,
        rating: 4.0,
        reviews: 25,
        description: "Design patterns and architectural principles for software development",
        features: [
            "Creational design patterns",
            "Structural design patterns",
            "Behavioral design patterns",
            "SOLID principles"
        ],
        icon: "🎨",
        reviews_list: []
    },
    {
        id: 6,
        title: "Research Methodology",
        author: "Jonathan Tristan",
        subject: "Mathematics",
        price: 79999,
        pages: 22,
        rating: 4.5,
        reviews: 33,
        description: "Complete guide to research methodologies and statistical analysis",
        features: [
            "Quantitative research methods",
            "Qualitative research approaches",
            "Data collection techniques",
            "Statistical analysis methods"
        ],
        icon: "🔬",
        reviews_list: []
    }
];

// Sample Users Data
const sampleUsers = [
    {
        email: "test@example.com",
        password: "123456",
        firstName: "John",
        lastName: "Doe",
        institution: "Bina Nusantara University",
        major: "Computer Science",
        phone: "081234567890",
        birthDate: "1995-01-01",
        description: "Student passionate about technology and learning"
    },
    {
        email: "jane@example.com",
        password: "password",
        firstName: "Jane",
        lastName: "Smith",
        institution: "Institut Teknologi Bandung",
        major: "Engineering",
        phone: "081987654321",
        birthDate: "1996-05-15",
        description: "Engineering student interested in sustainable technology"
    }
];

// Sample Testimonials Data
const testimonials = [
    {
        id: 1,
        name: "I Gusti Ngurah",
        avatar: "IG",
        rating: 5,
        comment: "Catatannya super jelas dan rapi! Penjelasan tentang transkripsi dan translasi jadi mudah dipahami, apalagi ada diagram dan contoh soalnya juga. Sangat membantu belajar sebelum ujian, recommended banget!"
    },
    {
        id: 2,
        name: "Babeh",
        avatar: "B",
        rating: 5,
        comment: "Catatannya sangat membantu dan isinya cukup lengkap, terutama bagian transkripsi dan translasinya jelas. Mungkin akan lebih bagus lagi kalau ditambah sedikit penjelasan aplikasinya dalam bioinformatika. Tapi overall worth it!"
    },
    {
        id: 3,
        name: "Cici",
        avatar: "C",
        rating: 5,
        comment: "Materinya padat, jelas, dan mudah dipahami! Penjelasan transkripsi dan translasi sangat runtut, cocok banget buat pemula maupun yang mau review sebelum ujian. Plus, tampilannya rapi dan enak dibaca. Mantap!"
    }
];

// Sample Promotional Data
const promotions = [
    {
        id: 1,
        title: "Get 20% off with minimum purchase Rp. 50000",
        description: "Limited time offer!",
        discount: 20,
        minPurchase: 50000,
        validUntil: "2024-12-31"
    },
    {
        id: 2,
        title: "Buy 1 get 1 notes",
        description: "Special deal for students!",
        type: "bogo",
        validUntil: "2024-12-31"
    }
];

// Features Data
const features = [
    {
        id: 1,
        icon: "📚",
        title: "Quality Study Materials",
        description: "Exceptional study materials that transform complex information into clear, accessible knowledge"
    },
    {
        id: 2,
        icon: "💰",
        title: "Earn Money Quickly",
        description: "Each time your document is sold, you earn money. This money is immediately credited to your account"
    },
    {
        id: 3,
        icon: "⚡",
        title: "Easy to Upload",
        description: "In less than a minute, you have created an account, set the price of your document and started selling!"
    }
];

// Payment Methods Data
const paymentMethods = [
    {
        id: 'qris',
        name: 'QRIS',
        icon: '🔲',
        description: 'Pay with QRIS',
        processingTime: '1-2 minutes'
    },
    {
        id: 'ovo',
        name: 'OVO',
        icon: '🟣',
        description: 'Pay with OVO',
        processingTime: '1-3 minutes'
    },
    {
        id: 'gopay',
        name: 'GoPay',
        icon: '🟢',
        description: 'Pay with GOPAY',
        processingTime: '1-3 minutes'
    },
    {
        id: 'dana',
        name: 'DANA',
        icon: '🔵',
        description: 'Pay with DANA',
        processingTime: '1-3 minutes'
    },
    {
        id: 'shopeepay',
        name: 'ShopeePay',
        icon: '🟠',
        description: 'Pay with ShopeePay',
        processingTime: '1-3 minutes'
    }
];

// Price Filter Options
const priceFilters = [
    { value: '', label: 'All Prices' },
    { value: '0-20000', label: 'Under Rp 20,000' },
    { value: '20000-50000', label: 'Rp 20,000 - 50,000' },
    { value: '50000-100000', label: 'Above Rp 50,000' }
];

// Data Access Functions
const DataService = {
    // Notes
    getAllNotes: () => sampleNotes,
    getNoteById: (id) => sampleNotes.find(note => note.id === id),
    getNotesBySubject: (subject) => sampleNotes.filter(note => note.subject === subject),
    searchNotes: (query) => {
        const searchTerm = query.toLowerCase();
        return sampleNotes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) ||
            note.author.toLowerCase().includes(searchTerm) ||
            note.subject.toLowerCase().includes(searchTerm) ||
            note.description.toLowerCase().includes(searchTerm)
        );
    },
    filterNotesByPrice: (minPrice, maxPrice) => {
        return sampleNotes.filter(note => {
            if (maxPrice) {
                return note.price >= minPrice && note.price <= maxPrice;
            } else {
                return note.price >= minPrice;
            }
        });
    },
    
    // Users
    getAllUsers: () => sampleUsers,
    getUserByEmail: (email) => sampleUsers.find(user => user.email === email),
    authenticateUser: (email, password) => {
        return sampleUsers.find(user => user.email === email && user.password === password);
    },
    
    // Other data
    getTestimonials: () => testimonials,
    getPromotions: () => promotions,
    getFeatures: () => features,
    getPaymentMethods: () => paymentMethods,
    getPriceFilters: () => priceFilters
};

// Export for use in other modules
window.DataService = DataService;