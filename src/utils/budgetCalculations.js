// Budget calculation utilities & scope templates for Construction PMS

export const SCOPE_CATEGORIES = [
  { id: 'structural', name: 'Structural Construction', icon: '🏗️', description: 'Foundation, RCC column, beam, slab framework & footing' },
  { id: 'masonry', name: 'Masonry / Wall Work', icon: '🧱', description: 'Brickwork, block masonry, wall plastering & parapet walls' },
  { id: 'roofing', name: 'Roofing', icon: '🏠', description: 'Roof slab waterproofing, sheet roofing, tiles & weather proofing' },
  { id: 'electrical', name: 'Electrical', icon: '⚡', description: 'Conduit piping, DB box, wiring, switches, sockets & earthing' },
  { id: 'plumbing', name: 'Plumbing', icon: '🚰', description: 'Water supply lines, drainage, CPVC pipes, sanitary & fixtures' },
  { id: 'painting', name: 'Painting', icon: '🎨', description: 'Wall primer, wall putty, interior/exterior emulsion & enamel' },
  { id: 'flooring', name: 'Flooring / Tiles', icon: '📐', description: 'Floor screeding, vitrified tiles, granite, marble & skirting' },
  { id: 'interior', name: 'Interior', icon: '🪑', description: 'False ceiling, modular kitchen, wardrobes, wood paneling' },
  { id: 'exterior', name: 'Exterior Works', icon: '🌳', description: 'Compound wall, elevation cladding, paving tiles & landscaping' },
  { id: 'finishing', name: 'Final Finishing', icon: '✨', description: 'Deep cleaning, door/window hardware, glass fittings & handrails' },
  { id: 'other', name: 'Other Works', icon: '📦', description: 'Debris removal, temporary site shed, water tank & miscellany' },
]

export const SCOPE_TEMPLATES = {
  basic: {
    name: 'Basic Construction',
    badge: 'Essential Shell',
    categoryIds: ['structural', 'masonry', 'roofing'],
    description: 'Basic civil structure, brick masonry, and roof slab foundation.',
  },
  standard: {
    name: 'Standard Construction',
    badge: 'Move-in Ready Shell',
    categoryIds: ['structural', 'masonry', 'roofing', 'electrical', 'plumbing', 'painting', 'flooring'],
    description: 'Complete civil structure with electrical, plumbing, painting & flooring.',
  },
  premium: {
    name: 'Premium / Full Construction',
    badge: 'Turnkey Luxury',
    categoryIds: ['structural', 'masonry', 'roofing', 'electrical', 'plumbing', 'painting', 'flooring', 'interior', 'exterior', 'finishing', 'other'],
    description: 'Complete end-to-end luxury turnkey construction with premium interiors & landscaping.',
  },
}

export function createInitialCategoryData(categoryId) {
  const catDef = SCOPE_CATEGORIES.find((c) => c.id === categoryId) || { name: categoryId, description: '' }

  switch (categoryId) {
    case 'structural':
      return {
        id: 'structural',
        name: 'Structural Construction',
        selected: true,
        is_optional_addon: false,
        description: 'Foundation, footings, RCC columns, beams and slab work',
        materials: [
          { name: 'Ready Mix Concrete (M25)', quantity: 120, unit: 'cu.m', rate: 4500 },
          { name: 'TMT Steel Bars (Fe 550)', quantity: 12, unit: 'tons', rate: 62000 },
          { name: 'Cement (UltraTech 53 Grade)', quantity: 450, unit: 'bags', rate: 420 },
        ],
        labour: [
          { worker_type: 'Structural Mason', no_of_workers: 6, days: 45, daily_rate: 950 },
          { worker_type: 'Steel Bender & Barbender', no_of_workers: 4, days: 30, daily_rate: 900 },
        ],
        service_cost: 0,
        other_cost: 50000,
      }
    case 'masonry':
      return {
        id: 'masonry',
        name: 'Masonry / Wall Work',
        selected: true,
        is_optional_addon: false,
        description: 'AAC Blocks, Red Bricks, Mortar and Wall Plastering',
        materials: [
          { name: 'AAC Blocks (6 inch)', quantity: 3500, unit: 'pcs', rate: 65 },
          { name: 'River Sand / M-Sand', quantity: 40, unit: 'tons', rate: 1400 },
        ],
        labour: [
          { worker_type: 'Mason', no_of_workers: 4, days: 30, daily_rate: 900 },
          { worker_type: 'Helper', no_of_workers: 4, days: 30, daily_rate: 600 },
        ],
        service_cost: 0,
        other_cost: 20000,
      }
    case 'roofing':
      return {
        id: 'roofing',
        name: 'Roofing',
        selected: true,
        is_optional_addon: false,
        description: 'Roof slab casting, terrace waterproofing and weather proofing',
        materials: [
          { name: 'Waterproofing Chemical (Dr. Fixit)', quantity: 50, unit: 'liters', rate: 450 },
          { name: 'Clay Terrace Tiles', quantity: 2000, unit: 'sq.ft', rate: 45 },
        ],
        labour: [
          { worker_type: 'Waterproofing Technician', no_of_workers: 2, days: 10, daily_rate: 1100 },
        ],
        service_cost: 0,
        other_cost: 15000,
      }
    case 'electrical':
      return {
        id: 'electrical',
        name: 'Electrical',
        selected: true,
        is_optional_addon: false,
        description: 'Conduit wiring, modular switches, DB box and earthing',
        materials: [
          { name: 'Copper Wiring Cables (Havells 2.5sq.mm)', quantity: 25, unit: 'coils', rate: 2200 },
          { name: 'Modular Switches & Plates (Legrand)', quantity: 120, unit: 'sets', rate: 350 },
        ],
        labour: [
          { worker_type: 'Licensed Electrician', no_of_workers: 2, days: 20, daily_rate: 1000 },
        ],
        service_cost: 40000,
        other_cost: 10000,
      }
    case 'plumbing':
      return {
        id: 'plumbing',
        name: 'Plumbing',
        selected: true,
        is_optional_addon: false,
        description: 'CPVC concealed pipes, drainage lines & sanitary fittings',
        materials: [
          { name: 'CPVC Pipes & Fittings (Astral)', quantity: 1, unit: 'lot', rate: 75000 },
          { name: 'Sanitary Ware (Jaquar/Kohler)', quantity: 4, unit: 'sets', rate: 15000 },
        ],
        labour: [
          { worker_type: 'Plumber', no_of_workers: 2, days: 15, daily_rate: 950 },
        ],
        service_cost: 25000,
        other_cost: 5000,
      }
    case 'painting':
      return {
        id: 'painting',
        name: 'Painting',
        selected: true,
        is_optional_addon: false,
        description: 'Wall primer, 2-coat putty, interior emulsion & exterior apex',
        materials: [
          { name: 'Asian Paints Royale Emulsion', quantity: 120, unit: 'liters', rate: 650 },
          { name: 'Acrylic Wall Putty', quantity: 25, unit: 'bags', rate: 850 },
        ],
        labour: [
          { worker_type: 'Painter', no_of_workers: 4, days: 15, daily_rate: 850 },
        ],
        service_cost: 30000,
        other_cost: 10000,
      }
    case 'flooring':
      return {
        id: 'flooring',
        name: 'Flooring / Tiles',
        selected: true,
        is_optional_addon: false,
        description: 'Vitrified tile laying, skirting and epoxy grouting',
        materials: [
          { name: 'Floor Tiles (Kajaria 4x2 ft)', quantity: 1500, unit: 'sq.ft', rate: 80 },
          { name: 'Tile Adhesive & Grout', quantity: 30, unit: 'bags', rate: 650 },
        ],
        labour: [
          { worker_type: 'Flooring Tile Mason', no_of_workers: 3, days: 12, daily_rate: 950 },
        ],
        service_cost: 20000,
        other_cost: 5000,
      }
    case 'interior':
      return {
        id: 'interior',
        name: 'Interior',
        selected: false,
        is_optional_addon: true,
        description: 'Modular kitchen, wardrobes, false ceiling & wood work',
        materials: [
          { name: 'BWP Plywood (Greenply 18mm)', quantity: 40, unit: 'sheets', rate: 3200 },
          { name: 'Laminate & Hardware Fittings', quantity: 1, unit: 'lot', rate: 120000 },
        ],
        labour: [
          { worker_type: 'Master Carpenter', no_of_workers: 3, days: 25, daily_rate: 1100 },
        ],
        service_cost: 60000,
        other_cost: 20000,
      }
    case 'exterior':
      return {
        id: 'exterior',
        name: 'Exterior Works',
        selected: false,
        is_optional_addon: true,
        description: 'Compound wall, gate, driveway paver blocks & garden',
        materials: [
          { name: 'Paver Blocks (80mm)', quantity: 800, unit: 'sq.ft', rate: 55 },
          { name: 'MS Main Gate Fabrication', quantity: 1, unit: 'unit', rate: 65000 },
        ],
        labour: [
          { worker_type: 'Fabricator & Mason', no_of_workers: 2, days: 10, daily_rate: 900 },
        ],
        service_cost: 20000,
        other_cost: 10000,
      }
    case 'finishing':
      return {
        id: 'finishing',
        name: 'Final Finishing',
        selected: false,
        is_optional_addon: true,
        description: 'Toughened glass railing, brass hardware & deep cleaning',
        materials: [
          { name: 'SS 304 & Glass Railing', quantity: 60, unit: 'Rft', rate: 1800 },
          { name: 'Door Handles & Locks (Godrej)', quantity: 8, unit: 'sets', rate: 2500 },
        ],
        labour: [
          { worker_type: 'Fitter / Specialist', no_of_workers: 2, days: 5, daily_rate: 1000 },
        ],
        service_cost: 15000,
        other_cost: 10000,
      }
    case 'other':
      return {
        id: 'other',
        name: 'Other Works',
        selected: false,
        is_optional_addon: true,
        description: 'Site office setup, debris clearing & municipal water connection',
        materials: [
          { name: 'Sintex Overhead Water Tank (2000L)', quantity: 1, unit: 'nos', rate: 18000 },
        ],
        labour: [
          { worker_type: 'General Unskilled Worker', no_of_workers: 2, days: 10, daily_rate: 600 },
        ],
        service_cost: 15000,
        other_cost: 15000,
      }
    default:
      return {
        id: categoryId,
        name: catDef.name || categoryId,
        selected: false,
        is_optional_addon: false,
        description: catDef.description || '',
        materials: [],
        labour: [],
        service_cost: 0,
        other_cost: 0,
      }
  }
}

export function getDefaultProjectEstimation(preset = 'standard') {
  const categoryIds = SCOPE_CATEGORIES.map((c) => c.id)
  const templateConfig = SCOPE_TEMPLATES[preset] || SCOPE_TEMPLATES.standard

  const categories = categoryIds.map((id) => {
    const cat = createInitialCategoryData(id)
    cat.selected = templateConfig.categoryIds.includes(id)
    // Mark interior, exterior, finishing, other as optional add-ons by default
    if (['interior', 'exterior', 'finishing', 'other'].includes(id)) {
      cat.is_optional_addon = true
    } else {
      cat.is_optional_addon = false
    }
    return cat
  })

  return calculateProjectBudget(categories, 'percentage', 5)
}

export function calculateCategoryTotals(cat) {
  const materialTotal = (cat.materials || []).reduce(
    (sum, m) => sum + (Number(m.quantity) || 0) * (Number(m.rate) || 0),
    0
  )
  const effectiveMaterialCost =
    cat.materials && cat.materials.length > 0 ? materialTotal : Number(cat.material_cost) || 0

  const labourTotal = (cat.labour || []).reduce(
    (sum, l) => sum + (Number(l.no_of_workers) || 0) * (Number(l.days) || 0) * (Number(l.daily_rate) || 0),
    0
  )
  const effectiveLabourCost =
    cat.labour && cat.labour.length > 0 ? labourTotal : Number(cat.labour_cost) || 0

  const serviceCost = Number(cat.service_cost) || 0
  const otherCost = Number(cat.other_cost) || 0

  const total = effectiveMaterialCost + effectiveLabourCost + serviceCost + otherCost

  return {
    ...cat,
    material_cost: effectiveMaterialCost,
    labour_cost: effectiveLabourCost,
    service_cost: serviceCost,
    other_cost: otherCost,
    category_total: total,
  }
}

export function calculateProjectBudget(categories = [], contingencyType = 'percentage', contingencyValue = 5) {
  let totalMaterial = 0
  let totalLabour = 0
  let totalService = 0
  let totalOther = 0
  let baseScopeTotal = 0
  let optionalAddonsTotal = 0

  const processedCategories = categories.map((cat) => {
    const computed = calculateCategoryTotals(cat)
    if (cat.selected) {
      totalMaterial += computed.material_cost
      totalLabour += computed.labour_cost
      totalService += computed.service_cost
      totalOther += computed.other_cost
      if (cat.is_optional_addon) {
        optionalAddonsTotal += computed.category_total
      } else {
        baseScopeTotal += computed.category_total
      }
    }
    return computed
  })

  const subtotal = totalMaterial + totalLabour + totalService + totalOther

  let contingencyAmount = 0
  const val = Number(contingencyValue) || 0
  if (contingencyType === 'percentage') {
    contingencyAmount = Math.round(subtotal * (val / 100))
  } else {
    contingencyAmount = val
  }

  const totalEstimatedBudget = subtotal + contingencyAmount

  return {
    categories: processedCategories,
    totalMaterial,
    totalLabour,
    totalService,
    totalOther,
    baseScopeTotal,
    optionalAddonsTotal,
    subtotal,
    contingencyType: contingencyType || 'percentage',
    contingencyValue: val,
    contingencyAmount,
    totalEstimatedBudget,
  }
}
