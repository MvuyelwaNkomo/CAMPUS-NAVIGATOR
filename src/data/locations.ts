import { Location } from "@/types/location";

export const locations: Location[] = [
  {
    id: "1",
    name: "Main Library",
    category: "academic",
    description:
      "Central library with extensive study spaces, computer labs, and research resources",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
    hours: "Mon-Fri: 7:00 AM - 11:00 PM, Sat-Sun: 9:00 AM - 9:00 PM",
    contact: "library@university.edu | +1 (555) 123-4567",
    tips: [
      "Book study rooms online up to 2 weeks in advance",
      "Silent study areas are on floors 3-5",
      "Free printing available with student ID (100 pages/month)",
    ],
  },
  {
    id: "2",
    name: "Engineering & Science Labs",
    category: "academic",
    description:
      "Modern facility housing biology, chemistry, and physics labs with state-of-the-art equipment and a second building with engineering equipment.",
    image:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80",
    hours: "Mon-Fri: 8:00 AM - 8:00 PM, Sat: 10:00 AM - 4:00 PM",
    contact: "science@university.edu | +1 (555) 123-4568",
    tips: [
      "Lab safety training required before first use",
      "Equipment checkout available at front desk",
      "Study lounges on each floor",
    ],
  },
  {
    id: "3",
    name: "Student Centre",
    category: "recreation",
    description:
      "Central hub with multiple dining options, student services, and social spaces",
    image:
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80",
    hours: "Mon-Sun: 7:00 AM - 11:00 PM",
    contact: "union@university.edu | +1 (555) 123-4569",
    tips: [
      "Meal plans accepted at all food vendors",
      "ATM and campus store on first floor",
      "Free WiFi throughout the building",
    ],
  },
  // UPSCHOOL HOSTELS
  {
    id: "4",
    name: "Kariba Hostel",
    category: "residential",
    description:
      "Upschool region - High-rise hostel named after Lake Kariba, the world's largest man-made lake. Features 3 floors with modern amenities and study lounges.",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    hours: "24/7 Access with Student ID",
    contact: "kariba.hostel@university.edu | +260 123-4570",
    tips: [
      "High-rise building with elevator access",
      "Quiet hours: 10 PM - 8 AM on weekdays",
      "Laundry facilities on each floor (mobile payment)",
    ],
    hostelRegion: "upschool",
    isHighRise: true,
    floors: 3,
  },
  {
    id: "4a",
    name: "Tanganyika Hostel",
    category: "residential",
    description:
      "Upschool region - High-rise hostel named after Lake Tanganyika, the world's second deepest lake. A 3-floor building with spacious rooms and stunning views.",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "tanganyika.hostel@university.edu | +260 123-4571",
    tips: [
      "High-rise building with panoramic views",
      "Study rooms available on each floor",
      "Common kitchen on ground floor",
    ],
    hostelRegion: "upschool",
    isHighRise: true,
    floors: 3,
  },
  {
    id: "4b",
    name: "Bangweulu Hostel",
    category: "residential",
    description:
      "Upschool region - High-rise hostel named after Lake Bangweulu, known for its rich wetland ecosystem. 3-floor building with peaceful atmosphere.",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "bangweulu.hostel@university.edu | +260 123-4572",
    tips: [
      "High-rise with tranquil courtyard",
      "Meditation and wellness room available",
      "Close to academic buildings",
    ],
    hostelRegion: "upschool",
    isHighRise: true,
    floors: 3,
  },
  {
    id: "4c",
    name: "Mweru Hostel",
    category: "residential",
    description:
      "Upschool region - High-rise hostel named after Lake Mweru on the Zambia-DRC border. 3-floor building with modern security and excellent facilities.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "mweru.hostel@university.edu | +260 123-4573",
    tips: [
      "High-rise with 24/7 security desk",
      "CCTV coverage on all floors",
      "Private study pods available",
    ],
    hostelRegion: "upschool",
    isHighRise: true,
    floors: 3,
  },
  {
    id: "4d",
    name: "Kafue Hostel",
    category: "residential",
    description:
      "Upschool region - Named after the Kafue River, Zambia's longest river. Single-story hostel with spacious common areas and close proximity to academic buildings.",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "kafue.hostel@university.edu | +260 123-4574",
    tips: [
      "Close to the main library (5-minute walk)",
      "Common kitchen available",
      "Study rooms available for booking",
    ],
    hostelRegion: "upschool",
    isHighRise: false,
  },
  {
    id: "4e",
    name: "Lusemfwa Hostel",
    category: "residential",
    description:
      "Upschool region - Named after the Lusemfwa River in Central Province. Single-story hostel known for its vibrant community and recreational facilities.",
    image:
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "lusemfwa.hostel@university.edu | +260 123-4575",
    tips: [
      "Indoor game room with pool table",
      "Weekly social events organized by RAs",
      "Bike storage available",
    ],
    hostelRegion: "upschool",
    isHighRise: false,
  },
  
  // DOWNSCHOOL HOSTELS
  {
    id: "4f",
    name: "Zambezi Hostel",
    category: "residential",
    description:
      "Downschool region - Named after Zambia's iconic Zambezi River, offering easy access to dining facilities and student center.",
    image:
      "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "zambezi.hostel@university.edu | +260 123-4576",
    tips: [
      "2-minute walk to Campus Food Market",
      "Free WiFi in all common areas",
      "Resident advisors available 24/7",
    ],
    hostelRegion: "downschool",
    isHighRise: false,
  },
  {
    id: "4g",
    name: "Luangwa Hostel",
    category: "residential",
    description:
      "Downschool region - Named after the Luangwa River, home to one of Africa's greatest wildlife sanctuaries. Features eco-friendly design and green spaces.",
    image:
      "https://images.unsplash.com/photo-1581264803609-f5c86e6e2fec?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "luangwa.hostel@university.edu | +260 123-4577",
    tips: [
      "Outdoor courtyard for studying and relaxation",
      "Energy-efficient rooms with natural lighting",
      "Recycling stations on every floor",
    ],
    hostelRegion: "downschool",
    isHighRise: false,
  },
  {
    id: "4h",
    name: "Chambeshi Hostel",
    category: "residential",
    description:
      "Upschool region - Named after the Chambeshi River, the most remote headstream of the Congo River. Modern accommodation with excellent amenities.",
    image:
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "chambeshi.hostel@university.edu | +260 123-4578",
    tips: [
      "Suite-style rooms with private bathrooms",
      "Computer lab with printing services",
      "Convenience store in building",
    ],
    hostelRegion: "upschool",
    isHighRise: false,
  },
  {
    id: "4i",
    name: "Kalungwishi Hostel",
    category: "residential",
    description:
      "Downschool region - Named after the Kalungwishi River known for its beautiful waterfalls. Large communal spaces perfect for group activities.",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "kalungwishi.hostel@university.edu | +260 123-4579",
    tips: [
      "Large communal spaces for group study",
      "Basketball court adjacent to building",
      "Walking distance to Student Centre",
    ],
    hostelRegion: "downschool",
    isHighRise: false,
  },
  {
    id: "4j",
    name: "Luapula Hostel",
    category: "residential",
    description:
      "Downschool region - Named after the Luapula River forming part of the Zambia-DRC border. Comfortable hostel with modern security features.",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "luapula.hostel@university.edu | +260 123-4580",
    tips: [
      "24/7 security with CCTV coverage",
      "Spacious rooms with natural lighting",
      "Close to Recreation Center",
    ],
    hostelRegion: "downschool",
    isHighRise: false,
  },
  {
    id: "4k",
    name: "Mulungushi Hostel",
    category: "residential",
    description:
      "Downschool region - Named after the Mulungushi River, site of the historic Mulungushi Rock. Features premium accommodation and study facilities.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    hours: "24/7 Access with Student ID",
    contact: "mulungushi.hostel@university.edu | +260 123-4581",
    tips: [
      "Private study rooms available",
      "Fast WiFi connectivity",
      "Near Health Services building",
    ],
    hostelRegion: "downschool",
    isHighRise: false,
  },
  {
    id: "5",
    name: "Campus Upschool Market",
    category: "dining",
    description:
      "Convenience store with groceries, snacks, and grab-and-go meals",
    image:
      "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80",
    hours: "Mon-Fri: 8:00 AM - 10:00 PM, Sat-Sun: 10:00 AM - 8:00 PM",
    contact: "foodmarket@university.edu | +1 (555) 123-4571",
    tips: [
      "Accepts meal plan flex dollars",
      "Weekly specials posted at entrance",
      "Pre-order online for quick pickup",
    ],
  },
  {
    id: "6",
    name: "Recreation Center",
    category: "recreation",
    description:
      "Full-service gym with cardio equipment, weights, pool, and group fitness classes",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    hours: "Mon-Fri: 6:00 AM - 11:00 PM, Sat-Sun: 8:00 AM - 10:00 PM",
    contact: "recreation@university.edu | +1 (555) 123-4572",
    tips: [
      "Free for all students with valid ID",
      "Towel service available at front desk",
      "Sign up for fitness classes through the mobile app",
    ],
  },
  {
    id: "7",
    name: "Lecture Hall Complex",
    category: "academic",
    description:
      "Large lecture halls for general education courses and special events",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    hours: "Mon-Fri: 7:00 AM - 10:00 PM",
    contact: "facilities@university.edu | +1 (555) 123-4573",
    tips: [
      "Arrive 10 minutes early for large classes",
      "Outlets available at most seats",
      "Vending machines in lobby area",
    ],
  },
  {
    id: "8",
    name: "Health Services",
    category: "services",
    description:
      "On-campus medical clinic providing basic healthcare and counseling services",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
    hours: "Mon-Fri: 8:00 AM - 5:00 PM",
    contact: "health@university.edu | +1 (555) 123-4574",
    tips: [
      "Schedule appointments online or by phone",
      "Walk-in hours: 8-10 AM daily",
      "Free flu shots available in fall semester",
    ],
  },
  {
    id: "9",
    name: "ICT Center",
    category: "academic",
    description:
      "A dedicated building for all computer science and data science students",  
  image:
    "https://unsplash.com/photos/modern-building-with-geometric-facade-and-windows-GTTgB3wHMaM",
    hours:"Mon-Fri: 7;00 AM - 5:00 PM",
    contact: "ict@university.edu | +1 (555) 123-4574",
    tips: [
      "Open to all students for study purposes",
      "Please observe oderliness and silence during lectures and seminars",
    ],
  },

];
