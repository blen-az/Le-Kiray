import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBb-sXwe9V9aEWzQf06txTvG3mRSNFnl-I",
  authDomain: "rentacar-75226.firebaseapp.com",
  projectId: "rentacar-75226",
  storageBucket: "rentacar-75226.firebasestorage.app",
  messagingSenderId: "689583054898",
  appId: "1:689583054898:web:8d4c5b4a62d58e5fe41c2b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const fakeAgents = [
  {
    id: 'fake-agent-1',
    companyName: 'Ethio Heavy Equipment PLC',
    contactPhone: '+251 91 123 4567',
    contactEmail: 'contact@ethioheavy.com',
    serviceLocations: ['Addis Ababa', 'Adama', 'Dire Dawa'],
    isApproved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fake-agent-2',
    companyName: 'Blue Nile Machinery',
    contactPhone: '+251 92 234 5678',
    contactEmail: 'info@bluenilemachinery.com',
    serviceLocations: ['Bahir Dar', 'Gondar', 'Dessie'],
    isApproved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const fakeListings = [
  {
    agentId: 'fake-agent-1',
    agentName: 'Ethio Heavy Equipment PLC',
    category: 'EXCAVATOR',
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
    agentId: 'fake-agent-1',
    agentName: 'Ethio Heavy Equipment PLC',
    category: 'DOZER',
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
    agentId: 'fake-agent-2',
    agentName: 'Blue Nile Machinery',
    category: 'LOADER',
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
    agentId: 'fake-agent-2',
    agentName: 'Blue Nile Machinery',
    category: 'DUMP_TRUCK',
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
    agentId: 'fake-agent-1',
    agentName: 'Ethio Heavy Equipment PLC',
    category: 'COMPACTOR',
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
    agentId: 'fake-agent-2',
    agentName: 'Blue Nile Machinery',
    category: 'EXCAVATOR',
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

async function seed() {
  console.log('Seeding fake agents...');
  for (const agent of fakeAgents) {
    const agentRef = doc(db, 'agentProfiles', agent.id);
    await setDoc(agentRef, agent);
  }
  
  console.log('Seeding fake listings...');
  for (const listing of fakeListings) {
    const docRef = doc(collection(db, 'listings'));
    const timestamp = new Date().toISOString();
    await setDoc(docRef, { ...listing, id: docRef.id, createdAt: timestamp, updatedAt: timestamp });
  }
  
  console.log('Successfully seeded database with fake data.');
  process.exit(0);
}

seed().catch(console.error);
