/**
 * roomResizing.js
 * Room Resizing & Furniture Auto-Placement and Collision Resolution logic
 */

import { FURNITURE_DIMENSIONS } from '../schema/buildingTypes'

export const MIN_ROOM_DIMENSIONS = {
  living: { minW: 3.5, minH: 3.0 },
  hall: { minW: 3.5, minH: 3.0 },
  bedroom: { minW: 3.0, minH: 3.0 },
  kitchen: { minW: 2.5, minH: 2.2 },
  dining: { minW: 2.8, minH: 2.6 },
  bathroom: { minW: 2.0, minH: 1.8 },
  study: { minW: 2.5, minH: 2.0 },
  office: { minW: 2.5, minH: 2.0 },
  garage: { minW: 4.5, minH: 3.0 },
  open_parking: { minW: 4.5, minH: 3.0 },
  balcony: { minW: 2.0, minH: 1.2 },
  storeroom: { minW: 1.8, minH: 1.5 },
  laundry: { minW: 1.8, minH: 1.5 },
}

export const getMinRoomDimensions = (roomType) => {
  return MIN_ROOM_DIMENSIONS[roomType] || { minW: 2.0, minH: 2.0 }
}

export const getRoomBounds = (polygon) => {
  if (!polygon || polygon.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 }
  }
  const minX = Math.min(...polygon.map((p) => p[0]))
  const maxX = Math.max(...polygon.map((p) => p[0]))
  const minY = Math.min(...polygon.map((p) => p[1]))
  const maxY = Math.max(...polygon.map((p) => p[1]))
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: Math.max(0.1, maxX - minX),
    height: Math.max(0.1, maxY - minY),
  }
}

export const calculateProportionalScale = (oldWidth, oldHeight, newWidth, newHeight) => {
  const scaleX = newWidth / Math.max(0.1, oldWidth)
  const scaleY = newHeight / Math.max(0.1, oldHeight)
  const geometricMean = Math.sqrt(scaleX * scaleY)
  return Math.max(0.45, Math.min(2.2, geometricMean))
}

export const resolveScaledFurnitureOverlaps = (items, bounds, wallOffset = 0.08) => {
  const result = []
  for (const item of items) {
    const curW = item.boundingBox?.w ?? 1.0
    const curD = item.boundingBox?.d ?? 1.0
    const rotY = item.rotation?.[1] ?? 0
    const isRot90 = Math.abs(rotY - 90) < 15 || Math.abs(rotY - 270) < 15
    const effW = isRot90 ? curD : curW
    const effD = isRot90 ? curW : curD

    const minAllowX = bounds.minX + effW / 2 + wallOffset
    const maxAllowX = bounds.maxX - effW / 2 - wallOffset
    const minAllowZ = bounds.minY + effD / 2 + wallOffset
    const maxAllowZ = bounds.maxY - effD / 2 - wallOffset

    let curX = Math.max(minAllowX, Math.min(maxAllowX, item.position[0]))
    let curZ = Math.max(minAllowZ, Math.min(maxAllowZ, item.position[2] ?? item.position[1]))

    let hasOverlap = true
    let attempts = 0
    while (hasOverlap && attempts < 20) {
      hasOverlap = false
      for (const placed of result) {
        const pW = placed.boundingBox?.w ?? 1.0
        const pD = placed.boundingBox?.d ?? 1.0
        const pRotY = placed.rotation?.[1] ?? 0
        const pIsRot90 = Math.abs(pRotY - 90) < 15 || Math.abs(pRotY - 270) < 15
        const pEffW = pIsRot90 ? pD : pW
        const pEffD = pIsRot90 ? pW : pD

        const pX = placed.position[0]
        const pZ = placed.position[2] ?? placed.position[1]

        const reqDistX = (effW + pEffW) / 2 + 0.08
        const reqDistZ = (effD + pEffD) / 2 + 0.08

        const overlapX = reqDistX - Math.abs(curX - pX)
        const overlapZ = reqDistZ - Math.abs(curZ - pZ)

        if (overlapX > 0 && overlapZ > 0) {
          hasOverlap = true
          if (overlapX < overlapZ) {
            if (curX >= pX && curX + overlapX <= maxAllowX) {
              curX += overlapX
            } else if (curX - overlapX >= minAllowX) {
              curX -= overlapX
            } else {
              curZ = curZ >= pZ ? Math.min(maxAllowZ, curZ + overlapZ) : Math.max(minAllowZ, curZ - overlapZ)
            }
          } else {
            if (curZ >= pZ && curZ + overlapZ <= maxAllowZ) {
              curZ += overlapZ
            } else if (curZ - overlapZ >= minAllowZ) {
              curZ -= overlapZ
            } else {
              curX = curX >= pX ? Math.min(maxAllowX, curX + overlapX) : Math.max(minAllowX, curX - overlapX)
            }
          }
          break
        }
      }
      attempts++
    }

    result.push({
      ...item,
      position: [Number(curX.toFixed(2)), item.position[1] ?? 0, Number(curZ.toFixed(2))],
    })
  }

  return result
}

export const scaleAndRepositionFurniture = ({ items, oldBounds, newBounds, wallOffset = 0.08 }) => {
  if (!items || items.length === 0) return []
  const oldW = Math.max(0.1, oldBounds.width)
  const oldH = Math.max(0.1, oldBounds.height)
  const newW = Math.max(0.1, newBounds.width)
  const newH = Math.max(0.1, newBounds.height)

  const scaleRatio = calculateProportionalScale(oldW, oldH, newW, newH)

  const scaledItems = items.map((item) => {
    const oldX = item.position[0]
    const oldZ = item.position[2] ?? item.position[1]

    const relU = Math.max(0.04, Math.min(0.96, (oldX - oldBounds.minX) / oldW))
    const relV = Math.max(0.04, Math.min(0.96, (oldZ - oldBounds.minY) / oldH))

    const targetX = newBounds.minX + relU * newW
    const targetZ = newBounds.minY + relV * newH

    const baseDims = FURNITURE_DIMENSIONS[item.type] || { w: 1.0, d: 1.0, h: 0.8 }
    const prevScale = item.scale?.[0] ?? 1.0
    const finalScaleFactor = Number(Math.max(0.45, Math.min(2.2, prevScale * scaleRatio)).toFixed(3))

    const scaledW = Number((baseDims.w * finalScaleFactor).toFixed(2))
    const scaledD = Number((baseDims.d * finalScaleFactor).toFixed(2))
    const scaledH = Number((baseDims.h * finalScaleFactor).toFixed(2))

    const rotY = item.rotation?.[1] ?? 0
    const isRot90 = Math.abs(rotY - 90) < 15 || Math.abs(rotY - 270) < 15
    const effW = isRot90 ? scaledD : scaledW
    const effD = isRot90 ? scaledW : scaledD

    const minAllowX = newBounds.minX + effW / 2 + wallOffset
    const maxAllowX = newBounds.maxX - effW / 2 - wallOffset
    const minAllowZ = newBounds.minY + effD / 2 + wallOffset
    const maxAllowZ = newBounds.maxY - effD / 2 - wallOffset

    let finalX = targetX
    let finalZ = targetZ

    if (maxAllowX >= minAllowX) {
      finalX = Math.max(minAllowX, Math.min(maxAllowX, targetX))
    } else {
      finalX = (newBounds.minX + newBounds.maxX) / 2
    }

    if (maxAllowZ >= minAllowZ) {
      finalZ = Math.max(minAllowZ, Math.min(maxAllowZ, targetZ))
    } else {
      finalZ = (newBounds.minY + newBounds.maxY) / 2
    }

    return {
      ...item,
      position: [Number(finalX.toFixed(2)), item.position[1] ?? 0, Number(finalZ.toFixed(2))],
      scale: [finalScaleFactor, finalScaleFactor, finalScaleFactor],
      dimensions: [scaledW, scaledH, scaledD],
      boundingBox: { w: scaledW, d: scaledD, h: scaledH },
    }
  })

  return resolveScaledFurnitureOverlaps(scaledItems, newBounds, wallOffset)
}

export const generateCompleteRoomFurniture = (roomType, posX, posY, w, h, isMaster) => {
  const rawItems = []
  if (roomType === 'bedroom') {
    if (isMaster) {
      const bedW = 1.8, bedD = 2.0
      const bedX = posX + w * 0.42
      const bedZ = posY + bedD / 2 + 0.12
      rawItems.push({ type: 'bed_king', x: bedX, z: bedZ })
      rawItems.push({ type: 'side_table', x: bedX - bedW / 2 - 0.35, z: posY + 0.35 })
      rawItems.push({ type: 'side_table', x: bedX + bedW / 2 + 0.35, z: posY + 0.35 })
      rawItems.push({ type: 'wardrobe', x: posX + w - 0.7, z: posY + 0.45 })
      if (w >= 3.8 && h >= 3.5) {
        rawItems.push({ type: 'cot', x: posX + w - 0.6, z: posY + h - 1.15 })
      }
      rawItems.push({ type: 'shelf', x: posX + w * 0.42, z: posY + h - 0.28 })
      rawItems.push({ type: 'dresser', x: posX + 0.7, z: posY + h - 0.6 })
    } else {
      const bedW = 1.35, bedD = 1.9
      const bedX = posX + w * 0.38
      const bedZ = posY + bedD / 2 + 0.12
      rawItems.push({ type: 'bed_double', x: bedX, z: bedZ })
      rawItems.push({ type: 'side_table', x: bedX - bedW / 2 - 0.32, z: posY + 0.35 })
      rawItems.push({ type: 'wardrobe', x: posX + w - 0.7, z: posY + 0.45 })
      if (w >= 3.5 && h >= 3.2) {
        rawItems.push({ type: 'cot', x: posX + w - 0.55, z: posY + h - 1.1 })
      }
      rawItems.push({ type: 'shelf', x: posX + w * 0.38, z: posY + h - 0.25 })
      rawItems.push({ type: 'dresser', x: posX + 0.7, z: posY + h - 0.6 })
    }
  } else if (roomType === 'living' || roomType === 'hall') {
    rawItems.push({ type: 'tv_unit', x: posX + w * 0.5, z: posY + 0.35 })
    rawItems.push({ type: 'tv', x: posX + w * 0.5, z: posY + 0.35 })
    rawItems.push({ type: 'coffee_table', x: posX + w * 0.5, z: posY + h * 0.48 })
    rawItems.push({ type: 'sofa', x: posX + w * 0.5, z: posY + Math.min(h - 0.7, h * 0.78) })
    rawItems.push({ type: 'armchair', x: posX + Math.max(0.6, w * 0.18), z: posY + h * 0.48 })
    rawItems.push({ type: 'side_table', x: posX + Math.min(w - 0.5, w * 0.82), z: posY + Math.min(h - 0.7, h * 0.78) })
  } else if (roomType === 'kitchen') {
    const counterW = Math.min(2.4, w - 1.2)
    rawItems.push({ type: 'kitchen_counter', x: posX + counterW / 2 + 0.2, z: posY + 0.45 })
    rawItems.push({ type: 'stove', x: posX + 0.6, z: posY + 0.45 })
    rawItems.push({ type: 'mixer_grinder', x: posX + 1.4, z: posY + 0.45 })
    rawItems.push({ type: 'sink', x: posX + Math.min(counterW, 2.1), z: posY + 0.45 })
    rawItems.push({ type: 'refrigerator', x: posX + w - 0.55, z: posY + h - 0.6 })
  } else if (roomType === 'bathroom') {
    rawItems.push({ type: 'toilet', x: posX + 0.45, z: posY + 0.5 })
    rawItems.push({ type: 'shower', x: posX + w - 0.6, z: posY + 0.6 })
    rawItems.push({ type: 'sink', x: posX + 0.45, z: posY + h - 0.45 })
    rawItems.push({ type: 'washing_machine', x: posX + w - 0.5, z: posY + h - 0.55 })
  } else if (roomType === 'study' || roomType === 'office') {
    rawItems.push({ type: 'desk', x: posX + w * 0.4, z: posY + 0.45 })
    rawItems.push({ type: 'office_chair', x: posX + w * 0.4, z: posY + 1.15 })
    rawItems.push({ type: 'bookshelf', x: posX + w - 0.55, z: posY + 0.5 })
  } else if (roomType === 'dining') {
    const cx = posX + w * 0.5
    const cz = posY + h * 0.5
    rawItems.push({ type: 'dining_table', x: cx, z: cz })
    rawItems.push({ type: 'dining_chair', x: cx, z: cz - 0.75 })
    rawItems.push({ type: 'dining_chair', x: cx, z: cz + 0.75 })
    rawItems.push({ type: 'dining_chair', x: cx - 0.95, z: cz })
    rawItems.push({ type: 'dining_chair', x: cx + 0.95, z: cz })
  } else if (roomType === 'garage' || roomType === 'open_parking') {
    rawItems.push({ type: 'car', x: posX + w * 0.5, z: posY + h * 0.5 })
  }

  const initialItems = rawItems.map((item, idx) => {
    const dims = FURNITURE_DIMENSIONS[item.type] || { w: 1, d: 1, h: 0.8 }
    const uid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `f_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`
    return {
      id: `furn-${uid}`,
      type: item.type,
      position: [item.x, 0, item.z],
      rotation: [0, item.rotY ?? 0, 0],
      dimensions: [dims.w, dims.h, dims.d],
      boundingBox: { w: dims.w, d: dims.d, h: dims.h },
      scale: [1, 1, 1],
      visible: true,
    }
  })

  const bounds = { minX: posX, maxX: posX + w, minY: posY, maxY: posY + h, width: w, height: h }
  return resolveScaledFurnitureOverlaps(initialItems, bounds, 0.08)
}

export const resolveFurnitureCollisions = (items, roomMinX, roomMinY, roomMaxX, roomMaxY) => {
  const result = []
  for (const item of items) {
    const dims = FURNITURE_DIMENSIONS[item.type] || { w: 1, d: 1, h: 0.8 }
    let curX = item.position[0]
    let curZ = item.position[2] ?? item.position[1]

    const minAllowX = roomMinX + dims.w / 2 + 0.08
    const maxAllowX = roomMaxX - dims.w / 2 - 0.08
    const minAllowZ = roomMinY + dims.d / 2 + 0.08
    const maxAllowZ = roomMaxY - dims.d / 2 - 0.08

    curX = Math.max(minAllowX, Math.min(maxAllowX, curX))
    curZ = Math.max(minAllowZ, Math.min(maxAllowZ, curZ))

    let hasOverlap = true
    let attempts = 0
    while (hasOverlap && attempts < 25) {
      hasOverlap = false
      for (const placed of result) {
        const pDims = FURNITURE_DIMENSIONS[placed.type] || { w: 1, d: 1, h: 0.8 }
        const pX = placed.position[0]
        const pZ = placed.position[2] ?? placed.position[1]

        const reqDistX = (dims.w + pDims.w) / 2 + 0.12
        const reqDistZ = (dims.d + pDims.d) / 2 + 0.12

        const overlapX = reqDistX - Math.abs(curX - pX)
        const overlapZ = reqDistZ - Math.abs(curZ - pZ)

        if (overlapX > 0 && overlapZ > 0) {
          hasOverlap = true
          if (overlapX < overlapZ) {
            if (curX >= pX && curX + overlapX <= maxAllowX) {
              curX += overlapX
            } else if (curX - overlapX >= minAllowX) {
              curX -= overlapX
            } else {
              curZ = curZ >= pZ ? Math.min(maxAllowZ, curZ + overlapZ) : Math.max(minAllowZ, curZ - overlapZ)
            }
          } else {
            if (curZ >= pZ && curZ + overlapZ <= maxAllowZ) {
              curZ += overlapZ
            } else if (curZ - overlapZ >= minAllowZ) {
              curZ -= overlapZ
            } else {
              curX = curX >= pX ? Math.min(maxAllowX, curX + overlapX) : Math.max(minAllowX, curX - overlapX)
            }
          }
          break
        }
      }
      attempts++
    }

    result.push({
      ...item,
      position: [curX, item.position[1] ?? 0, curZ],
    })
  }

  return result
}
