/**
 * houseValidator.js
 * Client-side preflight building validation helper
 */

export const validateBuildingLocal = (building) => {
  const issues = []

  if (!building || !building.floors || building.floors.length === 0) {
    issues.push('Building must have at least one floor.')
    return {
      status: 'failed',
      totalIssues: issues.length,
      issues,
    }
  }

  building.floors.forEach((floor) => {
    if (!floor.rooms || floor.rooms.length === 0) {
      issues.push(`Floor ${floor.name || floor.index} has no rooms.`)
    }

    floor.rooms.forEach((room) => {
      if (!room.polygon || room.polygon.length < 3) {
        issues.push(`Room ${room.name || room.id} has invalid polygon geometry.`)
      }
      if ((room.area ?? 0) < 1) {
        issues.push(`Room ${room.name || room.id} has unusually small area (${room.area}m²).`)
      }
    })

    floor.walls.forEach((wall) => {
      if (!wall.startPoint || !wall.endPoint || wall.startPoint.length < 2 || wall.endPoint.length < 2) {
        issues.push(`Wall ${wall.id} has invalid coordinates.`)
      }
    })

    const doorCount = floor.doors?.length || 0
    const openingCount = floor.rooms.reduce(
      (acc, r) => acc + (r.connections?.filter((c) => c.via === 'opening').length || 0),
      0
    )
    if (doorCount === 0 && openingCount === 0 && floor.rooms.length > 1) {
      issues.push(`Floor ${floor.name || floor.index} has multiple rooms but no doors or openings.`)
    }

    if (floor.index === building.floors.length - 1 && !floor.roof) {
      issues.push(`Top floor ${floor.name || floor.index} is missing a roof structure.`)
    }

    const stairs = floor.staircases || []
    const doors = floor.doors || []
    doors.forEach((door) => {
      let dx = 0, dy = 0
      if (Array.isArray(door.position)) {
        dx = door.position[0]
        dy = door.position[1]
      } else if (door.wallId) {
        const w = floor.walls.find((wl) => wl.id === door.wallId)
        if (w) {
          const t = typeof door.position === 'number' ? (door.position > 1.0 ? 0.5 : door.position) : 0.5
          dx = w.startPoint[0] + t * (w.endPoint[0] - w.startPoint[0])
          dy = w.startPoint[1] + t * (w.endPoint[1] - w.startPoint[1])
        }
      }

      stairs.forEach((stair) => {
        const startF = stair.startFloorIndex ?? floor.index
        if (startF !== floor.index) return
        const spos = stair.position || [0, 0]
        const dist = Math.hypot(dx - spos[0], dy - spos[1])
        if (dist < 0.65) {
          issues.push(`Door ${door.id} is blocked by or located directly underneath staircase ${stair.id}.`)
        }
      })
    })
  })

  return {
    status: issues.length > 0 ? 'failed' : 'passed',
    totalIssues: issues.length,
    issues,
  }
}
