import re

with open('src/features/agent/pages/ListingForm.tsx', 'r') as f:
    content = f.read()

# 1. CATEGORIES
new_categories = '''const CATEGORIES = [
  { value: VehicleCategory.EXCAVATOR, label: 'Excavators', description: 'Tracked and wheeled excavators' },
  { value: VehicleCategory.DOZER, label: 'Dozers', description: 'Bulldozers and track tractors' },
  { value: VehicleCategory.LOADER, label: 'Loaders', description: 'Wheel loaders, track loaders' },
  { value: VehicleCategory.CRANE, label: 'Cranes', description: 'Mobile and tower cranes' },
  { value: VehicleCategory.DUMP_TRUCK, label: 'Dump Trucks', description: 'Articulated and rigid haulers' },
  { value: VehicleCategory.COMPACTOR, label: 'Compactors', description: 'Soil and asphalt compactors' },
  { value: VehicleCategory.OTHER_MACHINERY, label: 'Other', description: 'Graders, scrapers, specialized equipment' },
];'''

content = re.sub(r'const CATEGORIES = \[.*?\];', new_categories, content, flags=re.DOTALL)

# 2. Schema
content = re.sub(r'\s*dailyRate: z\.coerce\.number\(\)\.optional\(\)\.or\(z\.literal\(\'\'\)\),', '', content)
content = re.sub(r'\s*weeklyRate: z\.coerce\.number\(\)\.optional\(\)\.or\(z\.literal\(\'\'\)\),', '', content)
content = re.sub(r'\}\)\.superRefine\(\(data, ctx\) => \{.*?\}\);', '});', content, flags=re.DOTALL)

# 3. reset
content = re.sub(r'\s*dailyRate: listing\.dailyRate,', '', content)
content = re.sub(r'\s*weeklyRate: listing\.weeklyRate,', '', content)

# 4. defaultValues
content = content.replace('category: VehicleCategory.COMPACT,', 'category: VehicleCategory.EXCAVATOR,')

# 5. isEarthMoving
content = re.sub(r'\s*const isEarthMoving = category === VehicleCategory\.EARTH_MOVING;', '', content)

# 6. submitData
content = re.sub(r'\s*dailyRate: data\.dailyRate === \'\' \? undefined : Number\(data\.dailyRate\),', '', content)
content = re.sub(r'\s*weeklyRate: data\.weeklyRate === \'\' \? undefined : Number\(data\.weeklyRate\),', '', content)

# 7. Button styling
content = content.replace('? cat.value === VehicleCategory.EARTH_MOVING\\n ? \\'border-amber-500 bg-amber-500/10\\'\\n : \\'border-brand-main bg-brand-main/10\\'', '\\'border-amber-500 bg-amber-500/10\\'')
content = re.sub(r'\? cat\.value === VehicleCategory\.EARTH_MOVING\s*\?\s*\'border-amber-500 bg-amber-500/10\'\s*:\s*\'border-brand-main bg-brand-main/10\'', "'border-amber-500 bg-amber-500/10'", content)

# 8. Earth-moving text
content = re.sub(r'\{isEarthMoving && \(\s*(<p className="mt-3 text-amber-500 text-xs font-bold flex items-center gap-2">.*?Earth-moving equipment uses quote-based pricing \(no daily rates\)\s*</p>)\s*\)\}', r'\1', content, flags=re.DOTALL)
content = content.replace('Earth-moving equipment uses quote-based pricing (no daily rates)', 'Heavy machinery uses quote-based pricing (no daily rates)')

# 9. Remove dailyRate inputs
content = re.sub(r'\{!isEarthMoving && \(\s*<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">.*?</div>\s*\)\}', '', content, flags=re.DOTALL)

with open('src/features/agent/pages/ListingForm.tsx', 'w') as f:
    f.write(content)
