import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { VehicleCategory } from '../types';

const fakeListings = [
  {
    category: VehicleCategory.EXCAVATOR,
    make: 'Caterpillar',
    model: '320D L',
    year: 2019,
    imageUrls: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'],
    location: 'Addis Ababa',
    specifications: ['Operating Weight: 21,500 kg', 'Net Power: 104 kW', 'Bucket Capacity: 1.0 m3'],
    description: 'Well maintained Caterpillar 320D L excavator. Perfect for large scale earthmoving and construction projects. Regularly serviced with full maintenance history available.',
    status: 'active',
  },
  {
    category: VehicleCategory.DOZER,
    make: 'Komatsu',
    model: 'D155A-6',
    year: 2020,
    imageUrls: ['https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1200&q=80'],
    location: 'Adama',
    specifications: ['Operating Weight: 41,700 kg', 'Net Power: 268 kW', 'Blade Capacity: 9.4 m3'],
    description: 'Powerful Komatsu D155A dozer suitable for heavy ripping and dozing operations. Equipped with an advanced Sigma Dozer blade for higher production.',
    status: 'active',
  },
  {
    category: VehicleCategory.LOADER,
    make: 'Volvo',
    model: 'L120H',
    year: 2021,
    imageUrls: ['https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80'],
    location: 'Bahir Dar',
    specifications: ['Operating Weight: 20,730 kg', 'Net Power: 203 kW', 'Bucket Capacity: 3.5 m3'],
    description: 'Highly efficient Volvo wheel loader. Excellent fuel efficiency and operator comfort. Ideal for quarrying and aggregates handling.',
    status: 'active',
  },
  {
    category: VehicleCategory.DUMP_TRUCK,
    make: 'Sinotruk',
    model: 'HOWO 371',
    year: 2022,
    imageUrls: ['https://images.unsplash.com/photo-1501526029524-a8ea952b15be?auto=format&fit=crop&w=1200&q=80'],
    location: 'Gondar',
    specifications: ['Drive: 6x4', 'Engine Power: 371 HP', 'Payload Capacity: 25 Tons'],
    description: 'Reliable HOWO dump truck. Heavy duty chassis suitable for tough Ethiopian terrain. Excellent for material transport across long distances.',
    status: 'active',
  },
  {
    category: VehicleCategory.COMPACTOR,
    make: 'BOMAG',
    model: 'BW 213 D-5',
    year: 2018,
    imageUrls: ['https://images.unsplash.com/photo-1580983218765-f663becf48d4?auto=format&fit=crop&w=1200&q=80'],
    location: 'Addis Ababa',
    specifications: ['Operating Weight: 12,500 kg', 'Working Width: 2,130 mm', 'Engine Power: 95 kW'],
    description: 'BOMAG single drum roller. Excellent compaction performance for soil and aggregate bases. Fully functional water spray system included.',
    status: 'active',
  },
  {
    category: VehicleCategory.EXCAVATOR,
    make: 'Hitachi',
    model: 'ZX210LC-6',
    year: 2021,
    imageUrls: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'],
    location: 'Dessie',
    specifications: ['Operating Weight: 22,100 kg', 'Net Power: 122 kW', 'Bucket Capacity: 1.1 m3'],
    description: 'Hitachi Zaxis 210 LC. Highly reliable and smooth hydraulic system. Features the latest fuel-saving technologies. Available immediately.',
    status: 'active',
  }
];

export const seedMockListings = async (agentId: string, agentName: string) => {
  try {
    for (const listing of fakeListings) {
      const docRef = doc(collection(db, 'listings'));
      const timestamp = new Date().toISOString();
      await setDoc(docRef, {
        ...listing,
        id: docRef.id,
        agentId,
        agentName,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    return true;
  } catch (error) {
    console.error('Error seeding listings:', error);
    return false;
  }
};
