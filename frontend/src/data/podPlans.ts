import largeDiagonal from '@/assets/designs/pods/large/Large_diagonal.jpg'
import largeLateral from '@/assets/designs/pods/large/Large_lateral.jpg'
import largePlants from '@/assets/designs/pods/large/Large_plants.jpg'
import largeTop from '@/assets/designs/pods/large/Large_top.jpg'
import mediumDiagonal from '@/assets/designs/pods/medium/medium_diagonal.jpg'
import mediumLateral from '@/assets/designs/pods/medium/medium_lateral.jpg'
import mediumLateralTwo from '@/assets/designs/pods/medium/medium_lateral2.jpg'
import mediumPlants from '@/assets/designs/pods/medium/medium_plants.jpg'
import mediumTop from '@/assets/designs/pods/medium/medium_top.jpg'
import smallDiagonal from '@/assets/designs/pods/small/small_diagonal.jpg'
import smallLateral from '@/assets/designs/pods/small/small_lateral.jpg'
import smallPlants from '@/assets/designs/pods/small/small_plants.jpg'
import smallTop from '@/assets/designs/pods/small/small_top.jpg'

export type PodSize = 'small' | 'medium' | 'large'
export type PodPlanId = 'starter' | 'standard' | 'premium'

export interface PodPlan {
  id: PodPlanId
  slug: string
  name: string
  tagline: string
  size: PodSize
  accentLabel?: string
  monthlyPrice: number
  installationFee: number
  area: string
  maxPlants: string
  heroCopy: string
  description: string
  longDescription: string
  images: string[]
  bestFor: string[]
  crops: string[]
  features: string[]
  highlights: string[]
  services: string[]
  specifications: Record<string, string>
}

export const podPlans: PodPlan[] = [
  {
    id: 'starter',
    slug: 'starter-pod',
    name: 'Starter Pod',
    tagline: 'Perfect for compact terraces and first-time growers.',
    size: 'small',
    monthlyPrice: 1499,
    installationFee: 5000,
    area: '2x4 ft growing area',
    maxPlants: 'Up to 20 plants',
    heroCopy: 'Compact footprint, smart automation, and enough capacity for herbs, greens, and everyday harvests.',
    description: 'A compact modular pod for balconies, rooftops, and pilot installations.',
    longDescription: 'The Starter Pod is built for buildings that want a clean entry point into controlled urban farming. It keeps the footprint tight while bundling irrigation, grow lighting, remote monitoring, and guided maintenance so your team can start harvesting quickly without managing farm infrastructure from scratch.',
    images: [smallDiagonal, smallLateral, smallPlants, smallTop],
    bestFor: ['Compact balconies', 'Apartment rooftops', 'Small offices'],
    crops: ['Herbs', 'Leafy greens', 'Microgreens'],
    features: ['Smart drip irrigation', 'Energy-efficient LED grow lights', 'Mobile app monitoring', 'Low-maintenance crop cycles', 'Fast installation and onboarding'],
    highlights: ['Ideal for trial deployments', 'Low space requirement', 'Simple upkeep schedule'],
    services: ['Monthly seed delivery', 'Remote agronomy support', 'Quarterly maintenance visit'],
    specifications: {
      Footprint: '2x4 ft',
      Capacity: '20 plants',
      Lighting: 'Integrated LED grow array',
      Watering: 'Automated drip irrigation',
      Monitoring: 'App-based alerts and status',
    },
  },
  {
    id: 'standard',
    slug: 'standard-pod',
    name: 'Standard Pod',
    tagline: 'Balanced output for families, residential towers, and shared amenities.',
    size: 'medium',
    accentLabel: 'Most Popular',
    monthlyPrice: 2999,
    installationFee: 5000,
    area: '4x4 ft growing area',
    maxPlants: 'Up to 40 plants',
    heroCopy: 'A reliable all-rounder with climate control, richer monitoring, and enough volume for weekly harvest routines.',
    description: 'The most flexible pod for recurring building harvests and shared community farming.',
    longDescription: 'The Standard Pod is designed for steady, predictable output. It expands the crop zone, adds more environmental control, and includes priority support so building teams can run a dependable urban farming program for residents, staff, or amenity spaces.',
    images: [mediumDiagonal, mediumLateral, mediumLateralTwo, mediumPlants, mediumTop],
    bestFor: ['Residential towers', 'Family use', 'Shared amenity zones'],
    crops: ['Vegetables', 'Herbs', 'Small fruits'],
    features: ['Advanced irrigation system', 'Integrated climate control', 'IoT monitoring and alerts', 'Higher output crop layout', 'Priority maintenance routing'],
    highlights: ['Best value plan', 'Balanced space-to-yield ratio', 'Suitable for regular community harvests'],
    services: ['Monthly seed delivery', '24/7 priority support', 'Monthly maintenance visit', 'Free nutrient refills'],
    specifications: {
      Footprint: '4x4 ft',
      Capacity: '40 plants',
      Lighting: 'Full spectrum LED array',
      Climate: 'Temperature and humidity control',
      Monitoring: 'Live IoT alerts and analytics',
    },
  },
  {
    id: 'premium',
    slug: 'premium-pod',
    name: 'Premium Pod',
    tagline: 'Maximum output for serious year-round growing.',
    size: 'large',
    monthlyPrice: 4999,
    installationFee: 5000,
    area: '6x4 ft growing area',
    maxPlants: 'Up to 80 plants',
    heroCopy: 'Large-format controlled growing with automation, optimization insights, and premium support coverage.',
    description: 'A high-capacity controlled-environment pod for buildings with ambitious harvest goals.',
    longDescription: 'The Premium Pod is built for large shared spaces and year-round production. With a larger crop bed, automated hydroponic infrastructure, and optimization support, it gives property teams a way to run a visible flagship farming installation with less operational guesswork.',
    images: [largeDiagonal, largeLateral, largePlants, largeTop],
    bestFor: ['Large rooftops', 'Commercial campuses', 'Flagship installations'],
    crops: ['All crops', 'Year-round programs', 'High-yield rotations'],
    features: ['Automated hydroponic system', 'Full climate control suite', 'AI-assisted optimization', 'Dedicated support manager', 'Premium nutrient coverage'],
    highlights: ['Highest production capacity', 'Built for flagship deployments', 'Advanced monitoring and optimization'],
    services: ['Unlimited seed varieties', 'Dedicated support manager', 'Bi-weekly maintenance visit', 'Premium nutrient and supply pack'],
    specifications: {
      Footprint: '6x4 ft',
      Capacity: '80 plants',
      Lighting: 'Commercial-grade LED canopy',
      Climate: 'Multi-zone climate automation',
      Monitoring: 'Advanced optimization dashboard',
    },
  },
]

export const podPlansBySlug = Object.fromEntries(podPlans.map((plan) => [plan.slug, plan])) as Record<string, PodPlan>
export const podPlansById = Object.fromEntries(podPlans.map((plan) => [plan.id, plan])) as Record<PodPlanId, PodPlan>
