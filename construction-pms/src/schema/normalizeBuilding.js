/**
 * normalizeBuilding.js
 * Building Normalization & Denormalization logic
 */

import { FURNITURE_DIMENSIONS } from './buildingTypes'

export function calculatePolygonArea(polygon) {
  if (!polygon || polygon.length < 3) return 0
  let area = 0
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += polygon[i][0] * polygon[j][1]
    area -= polygon[j][0] * polygon[i][1]
  }
  return Math.abs(area) / 2.0
}

export function normalizeFurniture(raw, idx) {
  const id = raw.furnitureId ?? raw.id ?? `furn-${idx}`
  const rot = raw.rotation
  let rotation
  if (Array.isArray(rot)) {
    rotation = [rot[0] ?? 0, rot[1] ?? 0, rot[2] ?? 0]
  } else if (typeof rot === 'number') {
    rotation = [0, rot, 0]
  } else {
    rotation = [0, 0, 0]
  }

  const dims = raw.boundingBox ?? raw.dimensions ?? FURNITURE_DIMENSIONS[raw.type] ?? { w: 1.0, d: 1.0, h: 1.0 }
  const pos = raw.position ?? [0, 0, 0]
  const posX = Number(pos[0] ?? 0)
  let posY = 0
  let posZ = 0
  if (Array.isArray(pos)) {
    if (pos.length === 2) {
      posY = 0
      posZ = Number(pos[1] ?? 0)
    } else if (pos.length >= 3) {
      if (Number(pos[2]) === 0 && Number(pos[1]) !== 0) {
        posY = 0
        posZ = Number(pos[1])
      } else {
        posY = Number(pos[1] ?? 0)
        posZ = Number(pos[2] ?? 0)
      }
    }
  }

  const dimObj = typeof dims === 'object' && 'w' in dims
    ? dims
    : Array.isArray(dims)
    ? { w: Number(dims[0] ?? 1), d: Number(dims[2] ?? 1), h: Number(dims[1] ?? 1) }
    : { w: 1, d: 1, h: 1 }

  return {
    id,
    type: raw.type ?? 'sofa',
    position: [posX, posY, posZ],
    rotation,
    scale: raw.scale ?? [1, 1, 1],
    dimensions: [dimObj.w, dimObj.h, dimObj.d],
    boundingBox: dimObj,
    color: raw.color,
    visible: raw.visible !== false,
  }
}

export function normalizeConnection(raw) {
  return {
    targetRoomId: raw.targetRoomId ?? raw.toRoomId ?? '',
    via: raw.via ?? 'door',
    doorId: raw.doorId,
    description: raw.description ?? raw.doorId,
  }
}

export function normalizeRoom(raw, idx) {
  const polygon = (raw.polygon ?? []).map((p) => [Number(p[0]), Number(p[1])])
  const calcArea = calculatePolygonArea(polygon)
  const areaM2 = calcArea > 0 ? calcArea : Number(raw.area ?? (raw.areaSqFt ? raw.areaSqFt / 10.7639 : 0))
  const areaSqFt = Number((areaM2 * 10.7639).toFixed(1))

  return {
    id: raw.id ?? raw.roomId ?? `room-${idx}`,
    name: raw.name ?? raw.label ?? raw.type ?? `Room ${idx}`,
    type: raw.type ?? 'living',
    wallIds: raw.wallIds ?? [],
    polygon,
    area: Number(areaM2.toFixed(1)),
    areaSqFt,
    color: raw.color,
    rotation: raw.rotation,
    furniture: (raw.furniture ?? []).map((f, i) => normalizeFurniture(f, i)),
    connections: (raw.connections ?? []).map((c) => normalizeConnection(c)),
    visible: raw.visible !== false,
  }
}

export function normalizeWall(raw, idx) {
  const startPoint = raw.startPoint ?? raw.start ?? [0, 0]
  const endPoint = raw.endPoint ?? raw.end ?? [1, 0]
  return {
    id: raw.id ?? raw.wallId ?? `wall-${idx}`,
    startPoint: [Number(startPoint[0]), Number(startPoint[1])],
    endPoint: [Number(endPoint[0]), Number(endPoint[1])],
    thickness: Number(raw.thickness ?? 0.2),
    height: Number(raw.height ?? 3.0),
    material: raw.material ?? 'concrete',
    color: raw.color,
    isExterior: Boolean(raw.isExterior ?? false),
    isLoadBearing: Boolean(raw.isLoadBearing ?? raw.is_load_bearing ?? false),
    isRailing: Boolean(raw.isRailing ?? false),
    visible: raw.visible !== false,
  }
}

export function normalizeDoor(raw, idx) {
  let pos
  if (Array.isArray(raw.position)) {
    pos = [Number(raw.position[0]), Number(raw.position[1])]
  } else if (typeof raw.position === 'number') {
    pos = raw.position
  } else {
    pos = 0.5
  }

  return {
    id: raw.id ?? raw.doorId ?? `door-${idx}`,
    wallId: raw.wallId ?? raw.wall_id ?? '',
    position: pos,
    width: Number(raw.width ?? 0.9),
    height: Number(raw.height ?? 2.1),
    swing: raw.swing ?? 'in-left',
    color: raw.color,
    isEntrance: Boolean(raw.isEntrance ?? raw.is_entrance ?? false),
    visible: raw.visible !== false,
  }
}

export function normalizeWindow(raw, idx) {
  let pos
  if (Array.isArray(raw.position)) {
    pos = [Number(raw.position[0]), Number(raw.position[1])]
  } else if (typeof raw.position === 'number') {
    pos = raw.position
  } else {
    pos = 0.5
  }
  const sill = Number(raw.sillHeight ?? raw.sill ?? 0.9)

  return {
    id: raw.id ?? raw.windowId ?? `win-${idx}`,
    wallId: raw.wallId ?? raw.wall_id ?? '',
    position: pos,
    width: Number(raw.width ?? 1.2),
    height: Number(raw.height ?? 1.2),
    sillHeight: sill,
    sill,
    color: raw.color,
    visible: raw.visible !== false,
  }
}

export function normalizeStaircase(raw, idx, floorIndex) {
  const fp = (raw.footprint ?? []).map((p) => [Number(p[0]), Number(p[1])])
  let minX = 0, minY = 0, maxX = 2, maxY = 3
  if (fp.length > 0) {
    minX = Math.min(...fp.map((p) => p[0]))
    minY = Math.min(...fp.map((p) => p[1]))
    maxX = Math.max(...fp.map((p) => p[0]))
    maxY = Math.max(...fp.map((p) => p[1]))
  }

  const pos = raw.position ? [Number(raw.position[0]), Number(raw.position[1])] : [minX, minY]
  const connects = raw.connectsFloors ?? raw.connects_floors

  return {
    id: raw.staircaseId ?? raw.id ?? `stair-${idx}`,
    startFloorIndex: connects ? Number(connects[0]) : (raw.startFloorIndex ?? raw.start_floor_index ?? floorIndex),
    endFloorIndex: connects ? Number(connects[1]) : (raw.endFloorIndex ?? raw.end_floor_index ?? (floorIndex + 1)),
    position: pos,
    width: Number(raw.width ?? Math.max(0.8, maxX - minX)),
    length: Number(raw.length ?? Math.max(1.5, maxY - minY)),
    rotation: Number(raw.rotation ?? 0),
    color: raw.color,
    footprint: fp.length > 0 ? fp : undefined,
    location: raw.location ?? 'internal',
    type: raw.type ?? raw.style ?? 'straight',
    hasLanding: raw.hasLanding !== undefined ? Boolean(raw.hasLanding) : (raw.has_landing !== undefined ? Boolean(raw.has_landing) : undefined),
    landingLength: raw.landingLength != null ? Number(raw.landingLength) : (raw.landing_length != null ? Number(raw.landing_length) : undefined),
    visible: raw.visible !== false,
  }
}

export function normalizeFloor(raw, idx) {
  const index = Number(raw.index ?? raw.floorIndex ?? idx)
  const elevation = Number(raw.elevation ?? raw.height ?? (index * 3.0))
  const floorHeight = Number(raw.floorHeight ?? raw.floorToFloorHeight ?? 3.0)

  const rawStairs = []
  if (raw.staircases && Array.isArray(raw.staircases)) {
    rawStairs.push(...raw.staircases)
  } else if (raw.staircase && typeof raw.staircase === 'object') {
    rawStairs.push(raw.staircase)
  }
  const staircases = rawStairs.map((s, i) => normalizeStaircase(s, i, index))

  const roof = raw.roof ? {
    id: raw.roof.id ?? `roof-${index}`,
    type: raw.roof.type ?? 'pitched_hip',
    height: Number(raw.roof.height ?? 2.2),
    overhang: Number(raw.roof.overhang ?? 0.6),
    color: raw.roof.color ?? '#b91c1c',
    visible: raw.roof.visible !== false,
  } : undefined

  return {
    index,
    name: raw.name ?? raw.label ?? `Floor ${index}`,
    height: elevation,
    elevation,
    floorToFloorHeight: floorHeight,
    rooms: (raw.rooms ?? []).map((r, i) => normalizeRoom(r, i)),
    walls: (raw.walls ?? []).map((w, i) => normalizeWall(w, i)),
    doors: (raw.doors ?? []).map((d, i) => normalizeDoor(d, i)),
    windows: (raw.windows ?? []).map((w, i) => normalizeWindow(w, i)),
    staircases,
    roof,
  }
}

export function normalizeBuilding(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid building raw input')
  }

  const floors = (raw.floors ?? []).map((f, i) => normalizeFloor(f, i))
  const entrances = []
  if (raw.entrances && Array.isArray(raw.entrances)) {
    raw.entrances.forEach((ent, i) => {
      entrances.push({
        id: ent.id ?? `entrance-${i}`,
        floorIndex: Number(ent.floorIndex ?? 0),
        position: Array.isArray(ent.position) ? [Number(ent.position[0]), Number(ent.position[1])] : [0, 0],
        wallId: ent.wallId,
        doorId: ent.doorId,
        type: ent.type ?? 'main',
      })
    })
  } else if (raw.entrance && typeof raw.entrance === 'object') {
    const rawEnt = raw.entrance
    entrances.push({
      id: rawEnt.id ?? 'entrance-0',
      floorIndex: Number(rawEnt.floorIndex ?? 0),
      position: Array.isArray(rawEnt.position) ? [Number(rawEnt.position[0]), Number(rawEnt.position[1])] : [0, 0],
      wallId: rawEnt.wallId,
      doorId: rawEnt.doorId,
      type: rawEnt.type ?? 'main',
    })
  }

  const bId = raw.id ?? raw.buildingId ?? `building-${Date.now()}`
  const metadata = raw.metadata ?? {}

  return {
    schemaVersion: raw.schemaVersion ?? '1.0',
    id: bId,
    metadata: {
      name: raw.name ?? raw.buildingName ?? metadata.name ?? 'Untitled Building',
      description: metadata.description ?? raw.description,
      type: raw.buildingType ?? raw.type ?? metadata.type ?? 'house',
      units: raw.units ?? metadata.units ?? 'metric',
      createdVia: metadata.createdVia ?? raw.createdVia ?? 'template',
      createdAt: metadata.createdAt ?? new Date().toISOString(),
      updatedAt: metadata.updatedAt ?? new Date().toISOString(),
      style: metadata.style ?? raw.style,
      tags: metadata.tags,
      location: metadata.location,
      createdBy: metadata.createdBy ?? raw.createdBy,
    },
    floors,
    entrances,
    boundingBox: raw.boundingBox,
  }
}

export function denormalizeBuilding(building) {
  if (!building) return {}
  const primaryEntrance = building.entrances && building.entrances.length > 0
    ? {
        id: building.entrances[0].id,
        floorIndex: building.entrances[0].floorIndex ?? 0,
        wallId: building.entrances[0].wallId ?? '',
        doorId: building.entrances[0].doorId,
        position: building.entrances[0].position,
        type: building.entrances[0].type ?? 'main',
      }
    : undefined

  return {
    schemaVersion: building.schemaVersion ?? '1.0',
    buildingId: building.id,
    id: building.id,
    buildingType: building.metadata?.type || 'house',
    name: building.metadata?.name || 'Untitled Building',
    units: building.metadata?.units || 'metric',
    metadata: {
      createdBy: building.metadata?.createdBy,
      createdVia: building.metadata?.createdVia,
      createdAt: building.metadata?.createdAt,
      updatedAt: building.metadata?.updatedAt,
      style: building.metadata?.style,
      description: building.metadata?.description,
      tags: building.metadata?.tags,
    },
    entrance: primaryEntrance,
    entrances: building.entrances || [],
    floors: (building.floors || []).map((floor) => {
      const staircases = (floor.staircases || []).map((stair) => ({
        staircaseId: stair.id,
        id: stair.id,
        startFloorIndex: stair.startFloorIndex,
        endFloorIndex: stair.endFloorIndex,
        location: stair.location || 'internal',
        connectsFloors: [stair.startFloorIndex, stair.endFloorIndex],
        position: stair.position,
        width: stair.width,
        length: stair.length,
        rotation: stair.rotation ?? 0,
        footprint: stair.footprint,
        style: stair.type || 'straight',
        type: stair.type || 'straight',
      }))
      const primaryStaircase = staircases.length > 0 ? staircases[0] : undefined

      return {
        floorIndex: floor.index,
        index: floor.index,
        label: floor.name,
        name: floor.name,
        elevation: floor.elevation ?? floor.height,
        height: floor.elevation ?? floor.height,
        floorHeight: floor.floorToFloorHeight ?? 3.0,
        staircase: primaryStaircase,
        staircases,
        roof: floor.roof ? {
          id: floor.roof.id,
          type: floor.roof.type,
          height: floor.roof.height,
          overhang: floor.roof.overhang,
          color: floor.roof.color,
          visible: floor.roof.visible ?? true,
        } : undefined,
        rooms: (floor.rooms || []).map((room) => ({
          roomId: room.id,
          id: room.id,
          type: room.type,
          label: room.name,
          name: room.name,
          polygon: room.polygon,
          area: room.area,
          areaSqFt: room.areaSqFt ?? (room.area ? room.area * 10.7639 : 0),
          wallIds: room.wallIds,
          connections: (room.connections || []).map((conn) => ({
            toRoomId: conn.targetRoomId,
            targetRoomId: conn.targetRoomId,
            via: conn.via,
            doorId: conn.doorId ?? conn.description,
            description: conn.description,
          })),
          furniture: (room.furniture || []).map((f) => ({
            furnitureId: f.id,
            id: f.id,
            type: f.type,
            position: f.position,
            rotation: f.rotation,
            scale: f.scale ?? [1, 1, 1],
            boundingBox: f.boundingBox,
            visible: f.visible ?? true,
          })),
          visible: room.visible ?? true,
        })),
        walls: (floor.walls || []).map((wall) => ({
          wallId: wall.id,
          id: wall.id,
          start: wall.startPoint,
          startPoint: wall.startPoint,
          end: wall.endPoint,
          endPoint: wall.endPoint,
          thickness: wall.thickness,
          height: wall.height,
          material: wall.material ?? 'concrete',
          is_load_bearing: wall.isLoadBearing ?? false,
          isLoadBearing: wall.isLoadBearing ?? false,
          isExterior: wall.isExterior,
          visible: wall.visible ?? true,
        })),
        doors: (floor.doors || []).map((door) => ({
          doorId: door.id,
          id: door.id,
          wallId: door.wallId,
          position: door.position,
          width: door.width,
          height: door.height,
          swing: door.swing,
          is_entrance: door.isEntrance ?? false,
          isEntrance: door.isEntrance ?? false,
          visible: door.visible ?? true,
        })),
        windows: (floor.windows || []).map((win) => ({
          windowId: win.id,
          id: win.id,
          wallId: win.wallId,
          position: win.position,
          width: win.width,
          height: win.height,
          sill: win.sillHeight ?? win.sill,
          sillHeight: win.sillHeight ?? win.sill,
          visible: win.visible ?? true,
        })),
      }
    }),
  }
}
