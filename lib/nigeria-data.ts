// Nigerian States, Cities, and Markets data for database seeding

export const NIGERIAN_STATES = [
  { name: "Abia", slug: "abia" },
  { name: "Adamawa", slug: "adamawa" },
  { name: "Akwa Ibom", slug: "akwa-ibom" },
  { name: "Anambra", slug: "anambra" },
  { name: "Bauchi", slug: "bauchi" },
  { name: "Bayelsa", slug: "bayelsa" },
  { name: "Benue", slug: "benue" },
  { name: "Borno", slug: "borno" },
  { name: "Cross River", slug: "cross-river" },
  { name: "Delta", slug: "delta" },
  { name: "Ebonyi", slug: "ebonyi" },
  { name: "Edo", slug: "edo" },
  { name: "Ekiti", slug: "ekiti" },
  { name: "Enugu", slug: "enugu" },
  { name: "FCT - Abuja", slug: "fct-abuja" },
  { name: "Gombe", slug: "gombe" },
  { name: "Imo", slug: "imo" },
  { name: "Jigawa", slug: "jigawa" },
  { name: "Kaduna", slug: "kaduna" },
  { name: "Kano", slug: "kano" },
  { name: "Katsina", slug: "katsina" },
  { name: "Kebbi", slug: "kebbi" },
  { name: "Kogi", slug: "kogi" },
  { name: "Kwara", slug: "kwara" },
  { name: "Lagos", slug: "lagos" },
  { name: "Nasarawa", slug: "nasarawa" },
  { name: "Niger", slug: "niger" },
  { name: "Ogun", slug: "ogun" },
  { name: "Ondo", slug: "ondo" },
  { name: "Osun", slug: "osun" },
  { name: "Oyo", slug: "oyo" },
  { name: "Plateau", slug: "plateau" },
  { name: "Rivers", slug: "rivers" },
  { name: "Sokoto", slug: "sokoto" },
  { name: "Taraba", slug: "taraba" },
  { name: "Yobe", slug: "yobe" },
  { name: "Zamfara", slug: "zamfara" },
];

export interface CityData {
  name: string;
  slug: string;
  lga?: string;
  stateName: string;
  markets: MarketData[];
}

export interface MarketData {
  name: string;
  slug: string;
  description?: string;
  specialty?: string;
}

export const CITIES_AND_MARKETS: CityData[] = [
  // ─── LAGOS ───────────────────────────────────────────
  {
    name: "Ikeja",
    slug: "ikeja",
    lga: "Ikeja",
    stateName: "Lagos",
    markets: [
      {
        name: "Computer Village",
        slug: "computer-village",
        description: "Nigeria's largest tech hub — smartphones, laptops, accessories and repairs",
        specialty: "Electronics & Technology",
      },
      {
        name: "Ikeja Shopping Complex",
        slug: "ikeja-shopping-complex",
        description: "Multi-purpose shopping center in Ikeja",
        specialty: "General Merchandise",
      },
    ],
  },
  {
    name: "Yaba",
    slug: "yaba",
    lga: "Lagos Mainland",
    stateName: "Lagos",
    markets: [
      {
        name: "Tejuosho Ultra-Modern Market",
        slug: "tejuosho-market",
        description: "Modern market for clothing, shoes, bags and boutique fashion",
        specialty: "Fashion & Clothing",
      },
      {
        name: "Yaba Market",
        slug: "yaba-market",
        description: "Major foodstuffs and general goods market in Yaba",
        specialty: "Foodstuffs & Provisions",
      },
    ],
  },
  {
    name: "Surulere",
    slug: "surulere",
    lga: "Surulere",
    stateName: "Lagos",
    markets: [
      {
        name: "Bode Thomas Market",
        slug: "bode-thomas-market",
        description: "Popular market for fashion, food and everyday items",
        specialty: "Fashion & Food",
      },
    ],
  },
  {
    name: "Lagos Island",
    slug: "lagos-island",
    lga: "Lagos Island",
    stateName: "Lagos",
    markets: [
      {
        name: "Balogun Market",
        slug: "balogun-market",
        description: "West Africa's largest open-air fashion and textile market",
        specialty: "Textiles & Fashion",
      },
      {
        name: "Idumota Market",
        slug: "idumota-market",
        description: "Wholesale drugs, cosmetics and general goods",
        specialty: "Pharmaceuticals & Cosmetics",
      },
    ],
  },
  {
    name: "Ojo",
    slug: "ojo",
    lga: "Ojo",
    stateName: "Lagos",
    markets: [
      {
        name: "Alaba International Market",
        slug: "alaba-international-market",
        description: "West Africa's largest consumer electronics and appliances market",
        specialty: "Electronics & Appliances",
      },
      {
        name: "Trade Fair Complex",
        slug: "trade-fair-complex",
        description: "Mega wholesale hub — auto parts, cosmetics, general merchandise",
        specialty: "Wholesale Trade",
      },
    ],
  },
  {
    name: "Mushin",
    slug: "mushin",
    lga: "Mushin",
    stateName: "Lagos",
    markets: [
      {
        name: "Ladipo International Market",
        slug: "ladipo-market",
        description: "Nigeria's largest automobile spare parts market",
        specialty: "Auto Parts & Vehicles",
      },
    ],
  },
  {
    name: "Kosofe",
    slug: "kosofe",
    lga: "Kosofe",
    stateName: "Lagos",
    markets: [
      {
        name: "Mile 12 Market",
        slug: "mile-12-market",
        description: "Lagos's largest wholesale foodstuffs and agricultural produce market",
        specialty: "Agriculture & Foodstuffs",
      },
    ],
  },
  {
    name: "Ebute Metta",
    slug: "ebute-metta",
    lga: "Lagos Mainland",
    stateName: "Lagos",
    markets: [
      {
        name: "Oyingbo Market",
        slug: "oyingbo-market",
        description: "Food, dry fish, crayfish and bulk provisions market",
        specialty: "Foodstuffs & Seafood",
      },
    ],
  },

  // ─── ABUJA (FCT) ─────────────────────────────────────
  {
    name: "Wuse",
    slug: "wuse",
    lga: "Municipal Area Council",
    stateName: "FCT - Abuja",
    markets: [
      {
        name: "Wuse Market",
        slug: "wuse-market",
        description: "Abuja's largest and most central market — general merchandise, fashion, electronics",
        specialty: "General Merchandise",
      },
      {
        name: "Garki International Market",
        slug: "garki-market",
        description: "Premium fabrics, fashion accessories and electronics in Garki",
        specialty: "Fashion & Electronics",
      },
    ],
  },
  {
    name: "Utako",
    slug: "utako",
    lga: "Municipal Area Council",
    stateName: "FCT - Abuja",
    markets: [
      {
        name: "Utako Market",
        slug: "utako-market",
        description: "Bulk agro-commodities, fresh produce and transportation hub",
        specialty: "Agriculture & Produce",
      },
    ],
  },
  {
    name: "Dei-Dei",
    slug: "dei-dei",
    lga: "Bwari Area Council",
    stateName: "FCT - Abuja",
    markets: [
      {
        name: "Dei-Dei International Market",
        slug: "dei-dei-market",
        description: "Abuja's largest building materials and construction supplies market",
        specialty: "Building Materials",
      },
    ],
  },
  {
    name: "Kubwa",
    slug: "kubwa",
    lga: "Bwari Area Council",
    stateName: "FCT - Abuja",
    markets: [
      {
        name: "Kubwa Market",
        slug: "kubwa-market",
        description: "Fresh foodstuffs, household items and local apparel",
        specialty: "Foodstuffs & Household",
      },
    ],
  },

  // ─── KANO ────────────────────────────────────────────
  {
    name: "Kano City",
    slug: "kano-city",
    lga: "Kano Municipal",
    stateName: "Kano",
    markets: [
      {
        name: "Kantin Kwari Market",
        slug: "kantin-kwari-market",
        description: "West Africa's largest textile market — fabrics, lace, Ankara and wax prints",
        specialty: "Textiles & Fabrics",
      },
      {
        name: "Sabon Gari Market",
        slug: "sabon-gari-market",
        description: "Consumer electronics, cosmetics and imported packaged goods",
        specialty: "Electronics & Imports",
      },
      {
        name: "Kurmi Market",
        slug: "kurmi-market",
        description: "Historic market for traditional leather goods, spices and cultural artifacts",
        specialty: "Crafts & Leather Goods",
      },
    ],
  },
  {
    name: "Dawakin Tofa",
    slug: "dawakin-tofa",
    lga: "Dawakin Tofa",
    stateName: "Kano",
    markets: [
      {
        name: "Dawanau International Market",
        slug: "dawanau-market",
        description: "Africa's largest grain market — sorghum, millet, sesame, beans and maize",
        specialty: "Grains & Agriculture",
      },
    ],
  },

  // ─── PORT HARCOURT (RIVERS) ──────────────────────────
  {
    name: "Diobu",
    slug: "diobu",
    lga: "Port Harcourt",
    stateName: "Rivers",
    markets: [
      {
        name: "Mile 1 Market",
        slug: "mile-1-market",
        description: "Port Harcourt's largest central market — fresh fish, foodstuffs and tailoring",
        specialty: "Foodstuffs & Tailoring",
      },
      {
        name: "Mile 3 Market",
        slug: "mile-3-market",
        description: "Building hardware, electrical supplies and wholesale provisions",
        specialty: "Hardware & Provisions",
      },
    ],
  },
  {
    name: "Old Township",
    slug: "old-township",
    lga: "Port Harcourt",
    stateName: "Rivers",
    markets: [
      {
        name: "Creek Road Market",
        slug: "creek-road-market",
        description: "Thrift apparel (Okrika), imported shoes and fashion bags",
        specialty: "Fashion & Thrift",
      },
    ],
  },
  {
    name: "Trans-Amadi",
    slug: "trans-amadi",
    lga: "Obio-Akpor",
    stateName: "Rivers",
    markets: [
      {
        name: "Ikokwu Spare Parts Market",
        slug: "ikokwu-market",
        description: "Automobile parts, engine accessories and mechanical supplies",
        specialty: "Auto Parts",
      },
    ],
  },

  // ─── IBADAN (OYO) ────────────────────────────────────
  {
    name: "Ibadan",
    slug: "ibadan",
    lga: "Ibadan North",
    stateName: "Oyo",
    markets: [
      {
        name: "Bodija International Market",
        slug: "bodija-market",
        description: "Bulk grains, cattle, yam and farm produce — feeds South-West Nigeria",
        specialty: "Agriculture & Livestock",
      },
      {
        name: "Gbagi International Market",
        slug: "gbagi-market",
        description: "Bulk textiles, lace, Ankara and tailoring equipment",
        specialty: "Textiles & Fabrics",
      },
      {
        name: "Dugbe Market",
        slug: "dugbe-market",
        description: "Electronics, stationery, office supplies and corporate retail",
        specialty: "Electronics & Office",
      },
      {
        name: "Aleshinloye Market",
        slug: "aleshinloye-market",
        description: "Luxury lace, jewellery, boutique footwear and high-end cosmetics",
        specialty: "Luxury & Jewellery",
      },
    ],
  },

  // ─── ONITSHA (ANAMBRA) ──────────────────────────────
  {
    name: "Onitsha",
    slug: "onitsha",
    lga: "Onitsha North",
    stateName: "Anambra",
    markets: [
      {
        name: "Onitsha Main Market",
        slug: "onitsha-main-market",
        description: "West Africa's largest commercial market by turnover — textiles, shoes, cosmetics, merchandise",
        specialty: "General Merchandise",
      },
      {
        name: "Bridgehead Market",
        slug: "bridgehead-market",
        description: "Pharmaceuticals, chemicals, timber and construction materials",
        specialty: "Pharmaceuticals & Building",
      },
      {
        name: "Ochanja Market",
        slug: "ochanja-market",
        description: "Leather footwear, bags, belts and raw leather materials",
        specialty: "Leather & Footwear",
      },
    ],
  },

  // ─── ENUGU ───────────────────────────────────────────
  {
    name: "Enugu City",
    slug: "enugu-city",
    lga: "Enugu North",
    stateName: "Enugu",
    markets: [
      {
        name: "Ogbete Main Market",
        slug: "ogbete-market",
        description: "Enugu's central commercial hub — provisions, electronics, fashion and foodstuffs",
        specialty: "General Merchandise",
      },
      {
        name: "Kenyatta Market",
        slug: "kenyatta-market",
        description: "Building materials, hardware, electrical fixtures and apparel",
        specialty: "Building & Hardware",
      },
      {
        name: "New Market (Ahia Orie)",
        slug: "new-market-enugu",
        description: "Fresh agricultural produce, fruits, garri and vegetables",
        specialty: "Agriculture & Fresh Produce",
      },
    ],
  },

  // ─── KADUNA ──────────────────────────────────────────
  {
    name: "Kaduna City",
    slug: "kaduna-city",
    lga: "Kaduna North",
    stateName: "Kaduna",
    markets: [
      {
        name: "Kasuwan Barci",
        slug: "kasuwan-barci",
        description: "Kaduna's central market for textiles, provisions and general goods",
        specialty: "Textiles & Provisions",
      },
      {
        name: "Tudun Wada Market",
        slug: "tudun-wada-market",
        description: "Fresh foodstuffs and everyday household items",
        specialty: "Foodstuffs",
      },
    ],
  },

  // ─── BENIN CITY (EDO) ────────────────────────────────
  {
    name: "Benin City",
    slug: "benin-city",
    lga: "Oredo",
    stateName: "Edo",
    markets: [
      {
        name: "Oba Market",
        slug: "oba-market",
        description: "Benin City's largest market for textiles, foodstuffs and general merchandise",
        specialty: "Textiles & Food",
      },
      {
        name: "New Benin Market",
        slug: "new-benin-market",
        description: "Electronics, fashion, household goods and fresh produce",
        specialty: "Electronics & Fashion",
      },
    ],
  },
];

export const CATEGORIES = [
  // Electronics
  { name: "Electronics", slug: "electronics", icon: "📱", children: [
    { name: "Phones & Tablets", slug: "phones-tablets", icon: "📱" },
    { name: "Laptops & Computers", slug: "laptops-computers", icon: "💻" },
    { name: "TV & Audio", slug: "tv-audio", icon: "📺" },
    { name: "Cameras", slug: "cameras", icon: "📷" },
    { name: "Accessories", slug: "electronics-accessories", icon: "🎧" },
  ]},
  // Vehicles
  { name: "Vehicles", slug: "vehicles", icon: "🚗", children: [
    { name: "Cars", slug: "cars", icon: "🚗" },
    { name: "Motorcycles & Tricycles", slug: "motorcycles-tricycles", icon: "🏍️" },
    { name: "Trucks & Buses", slug: "trucks-buses", icon: "🚌" },
    { name: "Vehicle Parts & Accessories", slug: "vehicle-parts", icon: "⚙️" },
    { name: "Boats", slug: "boats", icon: "⛵" },
  ]},
  // Real Estate
  { name: "Real Estate", slug: "real-estate", icon: "🏠", children: [
    { name: "Houses & Apartments for Rent", slug: "houses-rent", icon: "🏘️" },
    { name: "Houses & Apartments for Sale", slug: "houses-sale", icon: "🏠" },
    { name: "Land & Plots", slug: "land-plots", icon: "🌍" },
    { name: "Commercial Property", slug: "commercial-property", icon: "🏢" },
    { name: "Short Stay & Serviced Apartments", slug: "short-stay", icon: "🛋️" },
  ]},
  // Fashion
  { name: "Fashion", slug: "fashion", icon: "👗", children: [
    { name: "Women's Clothing", slug: "womens-clothing", icon: "👗" },
    { name: "Men's Clothing", slug: "mens-clothing", icon: "👔" },
    { name: "Kids' Clothing", slug: "kids-clothing", icon: "👶" },
    { name: "Shoes & Footwear", slug: "shoes-footwear", icon: "👠" },
    { name: "Bags & Luggage", slug: "bags-luggage", icon: "👜" },
    { name: "Watches & Jewellery", slug: "watches-jewellery", icon: "💍" },
  ]},
  // Home & Garden
  { name: "Home & Garden", slug: "home-garden", icon: "🏡", children: [
    { name: "Furniture", slug: "furniture", icon: "🛋️" },
    { name: "Home Appliances", slug: "home-appliances", icon: "🫧" },
    { name: "Kitchen & Dining", slug: "kitchen-dining", icon: "🍳" },
    { name: "Garden & Outdoor", slug: "garden-outdoor", icon: "🌱" },
    { name: "Bedding & Bath", slug: "bedding-bath", icon: "🛁" },
  ]},
  // Agriculture
  { name: "Agriculture", slug: "agriculture", icon: "🌾", children: [
    { name: "Farm Produce", slug: "farm-produce", icon: "🌾" },
    { name: "Livestock & Poultry", slug: "livestock-poultry", icon: "🐄" },
    { name: "Farm Equipment", slug: "farm-equipment", icon: "🚜" },
    { name: "Seedlings & Seeds", slug: "seedlings-seeds", icon: "🌱" },
  ]},
  // Building Materials
  { name: "Building Materials", slug: "building-materials", icon: "🏗️", children: [
    { name: "Cement & Roofing", slug: "cement-roofing", icon: "🏗️" },
    { name: "Tiles & Flooring", slug: "tiles-flooring", icon: "⬜" },
    { name: "Iron Rods & Steel", slug: "iron-rods-steel", icon: "🔩" },
    { name: "Plumbing & Fittings", slug: "plumbing-fittings", icon: "🔧" },
    { name: "Electrical & Lighting", slug: "electrical-lighting", icon: "💡" },
  ]},
  // Services
  { name: "Services", slug: "services", icon: "🛠️", children: [
    { name: "Home Services", slug: "home-services", icon: "🏠" },
    { name: "Business Services", slug: "business-services", icon: "💼" },
    { name: "Education & Lessons", slug: "education-lessons", icon: "📚" },
    { name: "Tech & IT Services", slug: "tech-it-services", icon: "💻" },
    { name: "Health & Beauty", slug: "health-beauty", icon: "💆" },
  ]},
  // Jobs
  { name: "Jobs", slug: "jobs", icon: "💼", children: [
    { name: "Full-time Jobs", slug: "full-time-jobs", icon: "💼" },
    { name: "Part-time & Contract", slug: "part-time-contract", icon: "📋" },
    { name: "Internship", slug: "internship", icon: "🎓" },
  ]},
  // Food & Agriculture
  { name: "Food & Beverages", slug: "food-beverages", icon: "🍎", children: [
    { name: "Fresh Produce", slug: "fresh-produce", icon: "🥬" },
    { name: "Packaged Foods", slug: "packaged-foods", icon: "📦" },
    { name: "Beverages", slug: "beverages", icon: "🥤" },
    { name: "Catering Services", slug: "catering-services", icon: "🍽️" },
  ]},
  // Sports & Fitness
  { name: "Sports & Fitness", slug: "sports-fitness", icon: "⚽", children: [
    { name: "Sports Equipment", slug: "sports-equipment", icon: "⚽" },
    { name: "Gym & Fitness", slug: "gym-fitness", icon: "🏋️" },
    { name: "Outdoor Sports", slug: "outdoor-sports", icon: "🏕️" },
  ]},
  // Kids & Baby
  { name: "Kids & Baby", slug: "kids-baby", icon: "🧸", children: [
    { name: "Baby Essentials", slug: "baby-essentials", icon: "🍼" },
    { name: "Toys & Games", slug: "toys-games", icon: "🧸" },
    { name: "Kids Furniture", slug: "kids-furniture", icon: "🪑" },
  ]},
];

export const PACKAGES = [
  {
    name: "Free Starter",
    slug: "free-starter",
    tagline: "Perfect for casual sellers",
    price: 0,
    durationDays: 30,
    maxListings: 5,
    boostFrequencyHours: 168, // 7 days
    heroSpotsPerMonth: 0,
    featuredSlotsPerMonth: 0,
    badge: null,
    badgeColor: null,
    isFree: true,
    isPopular: false,
    sortOrder: 1,
    features: [
      "Up to 5 active listings",
      "Standard search placement",
      "In-app messaging",
      "30-day listing duration",
    ],
  },
  {
    name: "Trader Plus",
    slug: "trader-plus",
    tagline: "For small shop owners",
    price: 9500,
    durationDays: 30,
    maxListings: 35,
    boostFrequencyHours: 24, // Daily auto-boost
    heroSpotsPerMonth: 0,
    featuredSlotsPerMonth: 2,
    badge: "ID Verified",
    badgeColor: "#3B82F6",
    isFree: false,
    isPopular: false,
    sortOrder: 2,
    features: [
      "Up to 35 active listings",
      "Daily auto-boost (top of category)",
      "🔵 ID Verified badge",
      "WhatsApp & phone call button",
      "Custom store link",
      "Basic analytics dashboard",
      "2 featured slots/month",
    ],
  },
  {
    name: "Market Pro",
    slug: "market-pro",
    tagline: "For established retailers",
    price: 29000,
    durationDays: 30,
    maxListings: 150,
    boostFrequencyHours: 6, // 4x daily boost
    heroSpotsPerMonth: 1,
    featuredSlotsPerMonth: 10,
    badge: "CAC Verified",
    badgeColor: "#F59E0B",
    isFree: false,
    isPopular: true,
    sortOrder: 3,
    features: [
      "Up to 150 active listings",
      "Boost every 6 hours (4× daily)",
      "⭐ CAC Verified Merchant badge",
      "1 market hero spot/month",
      "10 featured slots/month",
      "Seller follow feature",
      "Priority SEO indexing",
      "Full analytics & insights",
      "Bulk listing upload (CSV)",
    ],
  },
  {
    name: "Distributor VIP",
    slug: "distributor-vip",
    tagline: "For importers & distributors",
    price: 79000,
    durationDays: 30,
    maxListings: 1000,
    boostFrequencyHours: 2, // Every 2 hours
    heroSpotsPerMonth: 3,
    featuredSlotsPerMonth: -1, // unlimited
    badge: "VIP Certified",
    badgeColor: "#8B5CF6",
    isFree: false,
    isPopular: false,
    sortOrder: 4,
    features: [
      "Up to 1,000 listings",
      "Boost every 2 hours (maximum visibility)",
      "💎 VIP Certified Distributor badge",
      "3 market hero spots/month",
      "Unlimited featured slots",
      "Homepage banner inclusion (1 week/month)",
      "Dedicated account manager",
      "API access for inventory sync",
      "No competitor ads on your listings",
      "Pay-Per-Click campaign access",
    ],
  },
];
