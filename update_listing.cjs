const fs = require('fs');
let content = fs.readFileSync('src/features/agent/pages/ListingForm.tsx', 'utf8');

const newCategories = `const CATEGORIES = [
  { value: VehicleCategory.EXCAVATOR, label: 'Excavators', description: 'Tracked and wheeled excavators' },
  { value: VehicleCategory.DOZER, label: 'Dozers', description: 'Bulldozers and track tractors' },
  { value: VehicleCategory.LOADER, label: 'Loaders', description: 'Wheel loaders, track loaders' },
  { value: VehicleCategory.CRANE, label: 'Cranes', description: 'Mobile and tower cranes' },
  { value: VehicleCategory.DUMP_TRUCK, label: 'Dump Trucks', description: 'Articulated and rigid haulers' },
  { value: VehicleCategory.COMPACTOR, label: 'Compactors', description: 'Soil and asphalt compactors' },
  { value: VehicleCategory.OTHER_MACHINERY, label: 'Other', description: 'Graders, scrapers, specialized equipment' },
];`;

content = content.replace(/const CATEGORIES = \[[\s\S]*?\];/, newCategories);

content = content.replace(/\s*dailyRate: z\.coerce\.number\(\)\.optional\(\)\.or\(z\.literal\(''\)\),/, '');
content = content.replace(/\s*weeklyRate: z\.coerce\.number\(\)\.optional\(\)\.or\(z\.literal\(''\)\),/, '');
content = content.replace(/\}\)\.superRefine\(\(data, ctx\) => \{[\s\S]*?\}\);/, '});');

content = content.replace(/\s*dailyRate: listing\.dailyRate,/, '');
content = content.replace(/\s*weeklyRate: listing\.weeklyRate,/, '');

content = content.replace('category: VehicleCategory.COMPACT,', 'category: VehicleCategory.EXCAVATOR,');

content = content.replace(/\s*const isEarthMoving = category === VehicleCategory\.EARTH_MOVING;/, '');

content = content.replace(/\s*dailyRate: data\.dailyRate === '' \? undefined : Number\(data\.dailyRate\),/, '');
content = content.replace(/\s*weeklyRate: data\.weeklyRate === '' \? undefined : Number\(data\.weeklyRate\),/, '');

content = content.replace(/\? cat\.value === VehicleCategory\.EARTH_MOVING\s*\?\s*'border-amber-500 bg-amber-500\/10'\s*:\s*'border-brand-main bg-brand-main\/10'/, "'border-amber-500 bg-amber-500/10'");

content = content.replace(/\{isEarthMoving && \(\s*(<p className="mt-3 text-amber-500 text-xs font-bold flex items-center gap-2">[\s\S]*?Earth-moving equipment uses quote-based pricing \(no daily rates\)\s*<\/p>)\s*\)\}/, '$1');
content = content.replace('Earth-moving equipment uses quote-based pricing (no daily rates)', 'Heavy machinery uses quote-based pricing');

content = content.replace(/\{!isEarthMoving && \(\s*<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">[\s\S]*?<\/div>\s*\)\}/, '');

fs.writeFileSync('src/features/agent/pages/ListingForm.tsx', content, 'utf8');
console.log('Done!');
