
import { VehicleCategory, Vehicle, SubscriptionPlan, User, UserRole, Lead, Booking } from '../types';

export const MOCK_USER: User = {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: UserRole.CONSUMER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
};

export const MOCK_AGENT: User = {
    id: 'agent-1',
    name: 'Sam Fleetmaster',
    email: 'sam@fleet.com',
    role: UserRole.AGENT,
    companyName: 'City Rent & Earth-Movers',
    subscriptionTier: 'Growth',
    isApproved: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam'
};

export const MOCK_ADMIN: User = {
    id: 'admin-1',
    name: 'LeKiray Admin',
    email: 'admin@lekiray.com',
    role: UserRole.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
};

export const VEHICLES: Vehicle[] = [
    {
        id: 'v1',
        category: VehicleCategory.COMPACT,
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=800',
        dailyRate: 4500,
        agentId: 'agent-1',
        agentName: 'City Rent',
        location: 'Addis Ababa',
        specifications: ['Electric', 'Autopilot', '5 Seats'],
        description: 'The future of driving. Clean, fast, and sophisticated.',
        status: 'available'
    },
    {
        id: 'v2',
        category: VehicleCategory.FAMILY,
        make: 'Land Rover',
        model: 'Defender',
        year: 2022,
        imageUrl: 'https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?auto=format&fit=crop&q=80&w=800',
        dailyRate: 8000,
        agentId: 'agent-1',
        agentName: 'City Rent',
        location: 'Bole, Addis Ababa',
        specifications: ['4x4', 'Premium Sound', 'All-Terrain'],
        description: 'Rugged capability meets luxury for your family adventure.',
        status: 'available'
    },
    {
        id: 'v3',
        category: VehicleCategory.EARTH_MOVING,
        make: 'Caterpillar',
        model: '336 Next Gen Excavator',
        year: 2021,
        imageUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec4?auto=format&fit=crop&q=80&w=800',
        agentId: 'agent-1',
        agentName: 'City Rent',
        location: 'Kaliti Industrial',
        specifications: ['High Production', 'CAT Connect Tech', '36 Tonne'],
        description: 'Maximum power and efficiency for the most demanding sites.',
        status: 'available'
    },
    {
        id: 'v4',
        category: VehicleCategory.VAN,
        make: 'Ford',
        model: 'Transit Custom',
        year: 2022,
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
        dailyRate: 3200,
        agentId: 'agent-1',
        agentName: 'City Rent',
        location: 'Kazanchis',
        specifications: ['LWB', 'Rear Camera', '1,200kg Payload'],
        description: 'Reliable workhorse for your business logistics.',
        status: 'available'
    },
    {
        id: 'v5',
        category: VehicleCategory.EARTH_MOVING,
        make: 'John Deere',
        model: '850L Crawler Dozer',
        year: 2022,
        imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c4b083?auto=format&fit=crop&q=80&w=800',
        agentId: 'agent-1',
        agentName: 'City Rent',
        location: 'Semera',
        specifications: ['Grade Control', 'Hydrostatic Drive', 'Dual Tilt'],
        description: 'Unmatched visibility and grading precision.',
        status: 'available'
    }
];

export const MOCK_LEADS: Lead[] = [
    {
        id: 'l1',
        vehicleId: 'v3',
        vehicleName: 'CAT 336 Excavator',
        agentId: 'agent-1',
        consumerId: 'user-1',
        consumerName: 'Alex Johnson',
        location: 'Lemi Kura Site',
        duration: '3 Months',
        scopeOfWork: 'Basement excavation and site clearing.',
        status: 'new',
        createdAt: '2023-10-20T10:00:00Z'
    }
];

export const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'b1',
        vehicleId: 'v1',
        vehicleName: 'Tesla Model 3',
        consumerId: 'user-1',
        startDate: '2023-11-01',
        endDate: '2023-11-03',
        totalPrice: 9000,
        status: 'confirmed'
    }
];

export const PLANS: SubscriptionPlan[] = [
    { id: 'cv-1', name: 'Standard (Car)', maxVehicles: 10, monthlyFee: 1000, category: 'CARS_VANS' },
    { id: 'cv-2', name: 'Growth (Car)', maxVehicles: 25, monthlyFee: 2500, category: 'CARS_VANS' },
    { id: 'em-1', name: 'Heavy Basic', maxVehicles: 5, monthlyFee: 5000, category: 'EARTH_MOVING' },
    { id: 'em-2', name: 'Heavy Pro', maxVehicles: 15, monthlyFee: 10000, category: 'EARTH_MOVING' }
];
