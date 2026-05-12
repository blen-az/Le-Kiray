const fs = require('fs');

let f = fs.readFileSync('src/services/subscriptionService.ts', 'utf8');

const newPlans = `const DEFAULT_PLANS: SubscriptionPlan[] = [
  // 5 Machineries
  { id: 'em-5-3m', name: 'Basic (3 Months)', maxVehicles: 5, price: 6000, durationMonths: 3, category: 'EARTH_MOVING' },
  { id: 'em-5-6m', name: 'Basic (6 Months)', maxVehicles: 5, price: 11000, durationMonths: 6, category: 'EARTH_MOVING' },
  { id: 'em-5-1y', name: 'Basic (1 Year)', maxVehicles: 5, price: 20000, durationMonths: 12, category: 'EARTH_MOVING' },

  // 15 Machineries
  { id: 'em-15-3m', name: 'Pro (3 Months)', maxVehicles: 15, price: 9000, durationMonths: 3, category: 'EARTH_MOVING' },
  { id: 'em-15-6m', name: 'Pro (6 Months)', maxVehicles: 15, price: 16000, durationMonths: 6, category: 'EARTH_MOVING' },
  { id: 'em-15-1y', name: 'Pro (1 Year)', maxVehicles: 15, price: 30000, durationMonths: 12, category: 'EARTH_MOVING' },

  // Limitless Machineries
  { id: 'em-unl-3m', name: 'Enterprise (3 Months)', maxVehicles: 9999, price: 15000, durationMonths: 3, category: 'EARTH_MOVING' },
  { id: 'em-unl-6m', name: 'Enterprise (6 Months)', maxVehicles: 9999, price: 28000, durationMonths: 6, category: 'EARTH_MOVING' },
  { id: 'em-unl-1y', name: 'Enterprise (1 Year)', maxVehicles: 9999, price: 55000, durationMonths: 12, category: 'EARTH_MOVING' },

  // Contractors / Consumers
  { id: 'con-3m', name: 'Contractor (3 Months)', maxVehicles: 0, price: 6000, durationMonths: 3, category: 'CONSUMER' },
  { id: 'con-6m', name: 'Contractor (6 Months)', maxVehicles: 0, price: 11000, durationMonths: 6, category: 'CONSUMER' },
  { id: 'con-1y', name: 'Contractor (1 Year)', maxVehicles: 0, price: 20000, durationMonths: 12, category: 'CONSUMER' }
];`;

f = f.replace(/const DEFAULT_PLANS: SubscriptionPlan\[\] = \[\s*[\s\S]*?\s*\];/, newPlans);
f = f.replace(/periodEnd\.setMonth\(periodEnd\.getMonth\(\) \+ 1\);/, `periodEnd.setMonth(periodEnd.getMonth() + plan.durationMonths);`);

fs.writeFileSync('src/services/subscriptionService.ts', f);
console.log('Done');
