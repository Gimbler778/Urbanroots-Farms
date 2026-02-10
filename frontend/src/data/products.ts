import { Product } from '@/types/product';

// Generate 21 equipment items
export const equipmentData: Product[] = Array.from({ length: 21 }, (_, i) => ({
  id: `equipment-${i + 1}`,
  name: `${getEquipmentName(i)} ${i + 1}`,
  category: 'equipment' as const,
  price: Math.floor(Math.random() * 500) + 50,
  description: `High-quality farming equipment for ${getEquipmentName(i).toLowerCase()} operations`,
  longDescription: `This ${getEquipmentName(i).toLowerCase()} is designed for modern farming operations. Built with durability and efficiency in mind, it features advanced technology to help you maximize productivity. Whether you're a small-scale farmer or managing large agricultural operations, this equipment will meet your needs. The ergonomic design ensures comfortable operation for extended periods, while the robust construction guarantees years of reliable service.`,
  images: [
    'https://cdn-icons-png.flaticon.com/512/2292/2292039.png', // Tool icon
    'https://cdn-icons-png.flaticon.com/512/2292/2292039.png',
    'https://cdn-icons-png.flaticon.com/512/2292/2292039.png'
  ],
  features: [
    'Durable construction',
    'Easy to use',
    'Maintenance-free design',
    'Weather-resistant',
    'Ergonomic handle',
    'Long-lasting performance'
  ],
  specifications: {
    'Weight': `${Math.floor(Math.random() * 50) + 10} kg`,
    'Material': 'Heavy-duty steel',
    'Warranty': '2 years',
    'Color': 'Black/Red'
  }
}));

// Generate 21 service items
export const servicesData: Product[] = Array.from({ length: 21 }, (_, i) => ({
  id: `service-${i + 1}`,
  name: `${getServiceName(i)} Service`,
  category: 'service' as const,
  price: Math.floor(Math.random() * 300) + 100,
  description: `Professional ${getServiceName(i).toLowerCase()} service for your urban farming needs`,
  longDescription: `Our ${getServiceName(i).toLowerCase()} service is provided by experienced professionals who understand the unique challenges of urban farming. We offer comprehensive solutions tailored to your specific needs, ensuring optimal results for your farming operations. Our team uses the latest techniques and equipment to deliver high-quality service that exceeds expectations. With flexible scheduling and competitive pricing, we make professional farming services accessible to everyone.`,
  images: [
    'https://cdn-icons-png.flaticon.com/512/2292/2292039.png', // Tool icon
    'https://cdn-icons-png.flaticon.com/512/2292/2292039.png'
  ],
  features: [
    'Professional team',
    'Flexible scheduling',
    'Quality guaranteed',
    'Affordable pricing',
    'Quick turnaround',
    'Expert consultation included'
  ],
  specifications: {
    'Service Duration': `${Math.floor(Math.random() * 4) + 1} hours`,
    'Team Size': `${Math.floor(Math.random() * 3) + 2} professionals`,
    'Availability': 'Mon-Sat',
    'Response Time': '24-48 hours'
  }
}));

function getEquipmentName(index: number): string {
  const names = [
    'Irrigation System',
    'Soil Tester',
    'Pruning Shears',
    'Garden Hoe',
    'Seed Planter',
    'Compost Bin',
    'Plant Sprayer',
    'Grow Light',
    'Watering Can',
    'Garden Rake',
    'Trowel Set',
    'Plant Support Stakes',
    'Greenhouse Kit',
    'pH Meter',
    'Garden Gloves',
    'Fertilizer Spreader',
    'Harvesting Basket',
    'Mulching Tool',
    'Garden Cart',
    'Drip Irrigation Kit',
    'Hydroponic System'
  ];
  return names[index % names.length];
}

function getServiceName(index: number): string {
  const names = [
    'Soil Testing',
    'Garden Planning',
    'Pest Control',
    'Irrigation Setup',
    'Plant Maintenance',
    'Harvesting Assistance',
    'Composting Setup',
    'Vertical Garden Installation',
    'Hydroponics Consultation',
    'Seasonal Planting',
    'Garden Cleanup',
    'Fertilization',
    'Pruning & Trimming',
    'Disease Diagnosis',
    'Garden Design',
    'Crop Rotation Planning',
    'Organic Farming Consultation',
    'Water Management',
    'Greenhouse Setup',
    'Urban Farming Workshop',
    'Plant Health Assessment'
  ];
  return names[index % names.length];
}
