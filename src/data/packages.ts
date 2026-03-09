export interface Package {
  id: string;
  name: string;
  codeName: string;
  description: string;
  capacity: string;
  duration: string;
  weekdayPrice: number;
  weekendPrice: number;
  features: string[];
  icon: string;
  popular?: boolean;
  color: 'green' | 'blue' | 'purple' | 'yellow';
}

export interface AddOn {
  id: string;
  name: string;
  command: string;
  price: number;
  description: string;
}

export const packages: Package[] = [
  {
    id: 'pair-programming',
    name: 'Pair Programming',
    codeName: 'couple',
    description: 'Perfect for couples - dating, anniversaries, quality time',
    capacity: '2 pax',
    duration: '2 hours',
    weekdayPrice: 1299,
    weekendPrice: 1499,
    features: [
      'Private theatre for 2',
      '1 tub popcorn + 2 drinks',
      'Cozy seating setup',
      'Connect your device (HDMI/Bluetooth)',
    ],
    icon: '💑',
    color: 'green',
  },
  {
    id: 'romantic-runtime',
    name: 'Romantic Runtime',
    codeName: 'date',
    description: 'Special dates & anniversaries with romantic setup',
    capacity: '2 pax',
    duration: '2.5 hours',
    weekdayPrice: 1799,
    weekendPrice: 1999,
    features: [
      'Everything in Pair Programming',
      'Rose petals + fairy lights',
      '2 mocktails',
      'Welcome message on screen',
    ],
    icon: '💕',
    popular: true,
    color: 'purple',
  },
  {
    id: 'team-standup',
    name: 'Team Standup',
    codeName: 'squad',
    description: 'Friends outing, reunion, binge-watch session',
    capacity: '5-10 pax',
    duration: '3 hours',
    weekdayPrice: 2499,
    weekendPrice: 2999,
    features: [
      'Private theatre',
      '2 tubs popcorn + 10 drinks',
      'Gaming add-on available',
      'Perfect for friend groups',
    ],
    icon: '👥',
    color: 'blue',
  },
  {
    id: 'family-fork',
    name: 'Family Fork',
    codeName: 'family',
    description: 'Family movie night, weekend outing',
    capacity: 'up to 8 pax',
    duration: '3 hours',
    weekdayPrice: 2299,
    weekendPrice: 2799,
    features: [
      'Private theatre',
      '2 tubs popcorn + 8 drinks',
      'Kids snack box included',
      'Play movies, cartoons, YouTube',
    ],
    icon: '👨‍👩‍👧‍👦',
    color: 'green',
  },
  {
    id: 'birthday-build',
    name: 'Birthday Build',
    codeName: 'birthday',
    description: 'Birthday celebrations with full decoration',
    capacity: 'up to 15 pax',
    duration: '3 hours',
    weekdayPrice: 3999,
    weekendPrice: 4499,
    features: [
      'Birthday decoration (balloons, banner)',
      '2 tubs popcorn + nachos + 15 drinks',
      'Cake cutting setup',
      '"Happy Birthday" on screen',
      'Photo assistance',
    ],
    icon: '🎂',
    popular: true,
    color: 'yellow',
  },
  {
    id: 'full-stack-party',
    name: 'Full Stack Party',
    codeName: 'premium',
    description: 'Premium celebrations - big birthdays, farewell, kitty party',
    capacity: 'up to 25 pax',
    duration: '3.5 hours',
    weekdayPrice: 5499,
    weekendPrice: 5999,
    features: [
      'Full theatre (25 seats)',
      'Premium themed decoration',
      'Snacks + drinks for all',
      'Custom welcome message',
      'Dedicated staff',
    ],
    icon: '🎉',
    color: 'purple',
  },
  {
    id: 'commit-push',
    name: 'Commit & Push',
    codeName: 'proposal',
    description: 'Marriage proposals with romantic surprise setup',
    capacity: '2+ pax',
    duration: '2 hours',
    weekdayPrice: 5999,
    weekendPrice: 5999,
    features: [
      'Romantic decoration (roses, petals, LED)',
      '"Will You Marry Me?" screen setup',
      'Custom slideshow assistance',
      'Roses + chocolates + mocktails',
      'Surprise coordination',
    ],
    icon: '💍',
    color: 'purple',
  },
  {
    id: 'junior-dev',
    name: 'Junior Dev Party',
    codeName: 'kids',
    description: 'Kids birthday party (ages 4-12)',
    capacity: '20 kids + 5 parents',
    duration: '3 hours',
    weekdayPrice: 4999,
    weekendPrice: 4999,
    features: [
      'Cartoon-themed decoration',
      'Kid-friendly seating',
      'Snacks + juice boxes',
      'Games on screen',
      'Return gift table setup',
    ],
    icon: '🧒',
    color: 'blue',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Edition',
    codeName: 'corporate',
    description: 'Corporate team outings, office celebrations',
    capacity: 'up to 25 pax',
    duration: '3 hours',
    weekdayPrice: 5999,
    weekendPrice: 5999,
    features: [
      'Professional setup',
      'Laptop/presentation support',
      'Snacks + beverages for all',
      'GST invoice provided',
      'Team photo',
    ],
    icon: '💼',
    color: 'blue',
  },
  {
    id: 'open-source',
    name: 'Open Source Batch',
    codeName: 'college',
    description: 'College students special rate',
    capacity: 'up to 25 pax',
    duration: '3 hours',
    weekdayPrice: 3499,
    weekendPrice: 3499,
    features: [
      'Full theatre access',
      '3 tubs popcorn + 25 drinks',
      'Student ID required',
      'Perfect for class reunions',
    ],
    icon: '🎓',
    color: 'green',
  },
];

export const addOns: AddOn[] = [
  {
    id: 'gaming',
    name: 'Gaming Setup',
    command: 'install --gaming',
    price: 500,
    description: 'PS5/Xbox with 2 controllers',
  },
  {
    id: 'extra-hour',
    name: 'Extra Hour',
    command: 'install --extra-hour',
    price: 800,
    description: 'Extend your runtime',
  },
  {
    id: 'premium-decor',
    name: 'Premium Decoration',
    command: 'install --premium-decor',
    price: 1000,
    description: 'Upgraded balloons, flowers, theme',
  },
  {
    id: 'fog-entry',
    name: 'Fog Machine Entry',
    command: 'install --fog-entry',
    price: 500,
    description: 'Dramatic entry effect',
  },
  {
    id: 'photography',
    name: 'Photography (Basic)',
    command: 'install --photography',
    price: 1500,
    description: '30 mins, 50 edited photos',
  },
  {
    id: 'photography-premium',
    name: 'Photography (Premium)',
    command: 'install --photography-pro',
    price: 3000,
    description: '1 hour, 100 photos + reels',
  },
  {
    id: 'cake',
    name: 'Cake (Black Forest 1kg)',
    command: 'install --cake-1kg',
    price: 800,
    description: 'Fresh from local bakery',
  },
  {
    id: 'roses',
    name: 'Rose Bouquet',
    command: 'install --roses',
    price: 500,
    description: 'Fresh roses bouquet',
  },
  {
    id: 'snacks',
    name: 'Extra Snacks Platter',
    command: 'install --snacks-platter',
    price: 600,
    description: 'Nachos, sandwich, fries',
  },
  {
    id: 'slideshow',
    name: 'Custom Video Editing',
    command: 'install --slideshow',
    price: 1000,
    description: 'We edit your photos into slideshow',
  },
];

export const timeSlots = [
  { id: 'morning', label: 'Morning', time: '10:00 AM - 1:00 PM', type: 'off-peak' },
  { id: 'afternoon', label: 'Afternoon', time: '1:30 PM - 4:30 PM', type: 'off-peak' },
  { id: 'evening', label: 'Evening', time: '5:00 PM - 8:00 PM', type: 'peak' },
  { id: 'night', label: 'Night', time: '8:30 PM - 11:00 PM', type: 'peak' },
];
