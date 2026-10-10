/**
 * houseGeometry.js
 * Geometry utilities for 2D/3D house planning using polygon-clipping
 */

import polygonClippingModule from 'polygon-clipping'

const polygonClipping = polygonClippingModule?.default || polygonClippingModule

export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch (e) {}
  }
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9)
}

export class GeometryValidationError extends Error {
  constructor(message, floorIndex, staircaseId) {
    super(message)
    this.name = 'GeometryValidationError'
    this.floorIndex = floorIndex
    this.staircaseId = staircaseId
  }
}

/**
 * Ray-casting algorithm to test if [px, py] is inside polygon
 */
export function isPointInPolygon(pt, poly) {
  if (!poly || poly.length < 3) return false
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1]
    const xj = poly[j][0], yj = poly[j][1]
    if (((yi > pt[1]) !== (yj > pt[1])) && (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  return inside
}

/**
 * Checks if staircase is positioned inside house rooms
 */
export function isStaircaseInsideHouse(stair, rooms) {
  if (stair.location === 'external' || stair.location === 'outside') {
    return false
  }
  if (!rooms || rooms.length === 0) return false
  const validRooms = rooms.filter((r) => r.polygon && r.polygon.length >= 3)
  if (validRooms.length === 0) return false

  if (stair.footprint && stair.footprint.length >= 3) {
    const fp = stair.footprint
    const cx = fp.reduce((sum, p) => sum + p[0], 0) / fp.length
    const cy = fp.reduce((sum, p) => sum + p[1], 0) / fp.length
    for (const r of validRooms) {
      if (isPointInPolygon([cx, cy], r.polygon)) return true
      for (const p of fp) {
        if (isPointInPolygon([p[0], p[1]], r.polygon)) return true
      }
    }
    return false
  }

  const sx = stair.position[0]
  const sy = stair.position[1]
  const sw = stair.width ?? 1.2
  const sl = stair.length ?? 2.6
  const rawRot = stair.rotation ?? 0
  const rot = Math.abs(rawRot) > Math.PI * 2 ? (rawRot * Math.PI) / 180 : rawRot
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)

  const localPts = [
    [0, 0],
    [0, sl * 0.5],
    [0, sl],
    [-sw * 0.4, sl * 0.5],
    [sw * 0.4, sl * 0.5],
  ]

  const testPoints = localPts.map(([lx, ly]) => [
    sx + lx * cos - ly * sin,
    sy + lx * sin + ly * cos,
  ])

  for (const r of validRooms) {
    for (const pt of testPoints) {
      if (isPointInPolygon(pt, r.polygon)) {
        return true
      }
    }
  }

  return false
}

/**
 * Helper: compute stair opening rectangle in 2D model coordinates
 */
export function getStairHole(stair) {
  if (stair.footprint && stair.footprint.length >= 3) {
    let fp = stair.footprint.map((p) => [p[0], p[1]])
    if (fp.length > 3 && fp[0][0] === fp[fp.length - 1][0] && fp[0][1] === fp[fp.length - 1][1]) {
      fp.pop()
    }
    return fp
  }

  const sx = stair.position[0]
  const sz = stair.position[1]
  const sw = stair.width ?? 1.2
  const sl = stair.length ?? 2.6
  const rawRot = stair.rotation ?? 0
  const rot = Math.abs(rawRot) > Math.PI * 2 ? (rawRot * Math.PI) / 180 : rawRot
  const cos = Math.cos(rot)
  const sin = Math.sin(rot)

  const hasLanding = stair.hasLanding !== false
  const landingL = hasLanding ? (stair.landingLength ?? 0.8) : 0
  const totalL = sl + landingL

  const corners = [
    [-sw / 2, 0],
    [sw / 2, 0],
    [sw / 2, totalL],
    [-sw / 2, totalL],
  ]

  return corners.map(([cx, cy]) => [
    sx + cx * cos + cy * sin,
    sz - cx * sin + cy * cos,
  ])
}

/**
 * Computes canonical structural slab geometry for all floors in a building model.
 */
export function computeSlabGeometries(building) {
  const newBuilding = structuredClone(building)
  const stagingMap = new Map()

  newBuilding.floors.forEach((floor, idx) => {
    const validRooms = floor.rooms.filter((r) => r.polygon && r.polygon.length >= 3)
    if (validRooms.length === 0) {
      stagingMap.set(idx, [])
      return
    }

    const polys = validRooms.map((r) => [r.polygon.map((p) => [p[0], p[1]])])
    let unionPolys
    try {
      if (polys.length > 1) {
        unionPolys = polygonClipping.union(polys[0], ...polys.slice(1))
      } else {
        unionPolys = [polys[0]]
      }
    } catch {
      throw new GeometryValidationError(`Polygon union failed for floor ${floor.index}.`, floor.index)
    }

    const allStaircases = newBuilding.floors.flatMap((f) => f.staircases || [])
    const penetratingStaircases = allStaircases.filter(
      (s) =>
        s.location !== 'external' &&
        s.location !== 'outside' &&
        ((s.startFloorIndex !== undefined && s.startFloorIndex < idx && (s.endFloorIndex === undefined || s.endFloorIndex >= idx)) ||
          (s.startFloorIndex === undefined && idx > 0))
    )

    for (const stair of penetratingStaircases) {
      if (stair.location === 'external' || stair.location === 'outside') {
        continue
      }
      let stairPoly = []
      if (stair.footprint && stair.footprint.length >= 3) {
        const first = stair.footprint[0]
        const last = stair.footprint[stair.footprint.length - 1]
        let fp = stair.footprint
        if (first[0] !== last[0] || first[1] !== last[1]) {
          fp = [...fp, first]
        }
        let area = 0
        for (let i = 0; i < fp.length - 1; i++) {
          area += fp[i][0] * fp[i + 1][1] - fp[i + 1][0] * fp[i][1]
        }
        if (Math.abs(area / 2) < 0.1) {
          throw new GeometryValidationError(
            `Staircase ${stair.id || 'unknown'} has invalid footprint area on floor ${floor.index}.`,
            floor.index,
            stair.id
          )
        }
        stairPoly = fp.map((p) => [p[0], p[1]])
      } else {
        const sx = stair.position[0]
        const sz = stair.position[1]
        const sw = stair.width ?? 1.2
        const sl = stair.length ?? 2.6
        const rawRot = stair.rotation ?? 0
        const rot = Math.abs(rawRot) > Math.PI * 2 ? (rawRot * Math.PI) / 180 : rawRot
        const cos = Math.cos(rot)
        const sin = Math.sin(rot)

        const corners = [
          [-sw / 2, 0],
          [sw / 2, 0],
          [sw / 2, sl],
          [-sw / 2, sl],
        ]

        stairPoly = corners.map((c) => {
          const x = c[0] * cos + c[1] * sin
          const z = -c[0] * sin + c[1] * cos
          return [sx + x, sz + z]
        })
        stairPoly.push(stairPoly[0])
      }

      const stairRing = [stairPoly]
      try {
        const intersection = polygonClipping.intersection(stairRing, unionPolys)
        if (intersection.length === 0) {
          continue
        }
        const outsideParts = polygonClipping.difference(stairRing, unionPolys)
        if (outsideParts.length > 0) {
          let outsideArea = 0
          for (const poly of outsideParts) {
            for (const ring of poly) {
              let a = 0
              for (let i = 0; i < ring.length - 1; i++) {
                a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
              }
              outsideArea += Math.abs(a / 2)
            }
          }
          if (outsideArea > 0.1) {
            throw new GeometryValidationError(
              `Staircase ${stair.id || 'unknown'} footprint partially intersects the floor slab boundaries on floor ${floor.index}.`,
              floor.index,
              stair.id
            )
          }
        }
        unionPolys = polygonClipping.difference(unionPolys, stairRing)
      } catch (err) {
        if (err instanceof GeometryValidationError) throw err
        throw new GeometryValidationError(
          `Failed to subtract stair hole footprint on floor ${floor.index}: ${err}`,
          floor.index,
          stair.id
        )
      }
    }

    stagingMap.set(
      idx,
      unionPolys.map((poly) => {
        const outerRing = poly[0].map((p) => [p[0], p[1]])
        const innerRings = poly.slice(1).map((ring) => ring.map((p) => [p[0], p[1]]))
        return { outerRing, innerRings }
      })
    )
  })

  newBuilding.floors.forEach((floor, idx) => {
    floor.slabGeometry = stagingMap.get(idx) || []
  })

  return newBuilding
}
