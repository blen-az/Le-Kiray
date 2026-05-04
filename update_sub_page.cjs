const fs = require('fs');
let f = fs.readFileSync('src/features/agent/pages/SubscriptionPage.tsx', 'utf8');

f = f.replace(/const plans = data\?\.plans \|\| \[\];/, `const plans = (data?.plans || []).filter(p => p.category !== 'CONSUMER');`);
f = f.replace(/plan\.monthlyFee/g, 'plan.price');
f = f.replace(/>ETB\/mo</, `>ETB / {plan.durationMonths === 12 ? 'yr' : plan.durationMonths + ' mo'}<`);
// also replace "Up to {plan.maxVehicles} vehicles" to handle unlimited
f = f.replace(/Up to \{plan\.maxVehicles\} vehicles/, `Up to {plan.maxVehicles === 9999 ? 'Unlimited' : plan.maxVehicles} vehicles`);

fs.writeFileSync('src/features/agent/pages/SubscriptionPage.tsx', f);
console.log('Updated SubscriptionPage');
