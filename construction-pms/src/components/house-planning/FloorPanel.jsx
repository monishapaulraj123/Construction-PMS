/**
 * FloorPanel.jsx
 * Multi-floor selection and layout duplication controls styled for PMS
 */

import { Plus, Trash2, Copy, Layers } from 'lucide-react'
import { useHousePlanning } from '../../context/HousePlanningContext'
import { generateUUID } from '../../utils/houseGeometry'
import { useToast } from '../ToastContext'

export default function FloorPanel() {
  const { building, activeFloorIndex, setActiveFloor, updateBuilding } = useHousePlanning()
  const showToast = useToast()

  if (!building) return null

  const handleAddFloor = () => {
    const currentMax = building.floors.reduce((m, f) => Math.max(m, f.index), -1)
    const newIndex = currentMax + 1
    updateBuilding((b) => ({
      ...b,
      floors: [
        ...b.floors,
        {
          index: newIndex,
          name: `Floor ${newIndex}`,
          height: newIndex * 3,
          elevation: newIndex * 3,
          floorToFloorHeight: 3.0,
          rooms: [],
          walls: [],
          doors: [],
          windows: [],
          staircases: [],
        },
      ],
    }))
    setActiveFloor(newIndex)
    showToast(`Floor ${newIndex} added and selected`)
  }

  const handleDuplicateGroundFloor = (targetFloorIndex) => {
    const groundFloor = building.floors.find((f) => f.index === 0)
    if (!groundFloor || groundFloor.rooms.length === 0) {
      showToast('Ground floor has no rooms to copy!', 'warning')
      return
    }

    const idMap = new Map()
    const clonedWalls = groundFloor.walls.map((w) => {
      const newId = `wall-${generateUUID()}`
      idMap.set(w.id, newId)
      return { ...w, id: newId }
    })

    const clonedRooms = groundFloor.rooms.map((r) => {
      const newId = `room-${generateUUID()}`
      const newWallIds = (r.wallIds || []).map((wId) => idMap.get(wId) || wId)
      const newFurn = r.type === 'open_parking' || r.type === 'garage'
        ? []
        : (r.furniture || []).map((f) => ({ ...f, id: `furn-${generateUUID()}` }))
      return {
        ...r,
        id: newId,
        wallIds: newWallIds,
        furniture: newFurn,
      }
    })

    const clonedDoors = groundFloor.doors.map((d) => ({
      ...d,
      id: `door-${generateUUID()}`,
      wallId: idMap.get(d.wallId) || d.wallId,
    }))

    const clonedWindows = groundFloor.windows.map((w) => ({
      ...w,
      id: `win-${generateUUID()}`,
      wallId: idMap.get(w.wallId) || w.wallId,
    }))

    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) =>
        f.index === targetFloorIndex
          ? {
              ...f,
              rooms: clonedRooms,
              walls: clonedWalls,
              doors: clonedDoors,
              windows: clonedWindows,
            }
          : f
      ),
    }))

    setActiveFloor(targetFloorIndex)
    showToast(`Aligned & copied Ground Floor structure to Floor ${targetFloorIndex}`)
  }

  const handleDeleteFloor = (floorIndex) => {
    if (building.floors.length <= 1) return
    updateBuilding((b) => ({
      ...b,
      floors: b.floors.filter((f) => f.index !== floorIndex),
    }))
    if (activeFloorIndex >= floorIndex && activeFloorIndex > 0) {
      setActiveFloor(activeFloorIndex - 1)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest-900)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Layers size={16} /> Building Floors
        </h4>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddFloor}
          style={{ padding: '3px 8px', fontSize: '0.78rem' }}
        >
          <Plus size={14} /> Add Floor
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {building.floors.length > 1 && (
          <div
            onClick={() => setActiveFloor(-1)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${activeFloorIndex === -1 ? 'var(--forest-900)' : 'var(--line-200)'}`,
              background: activeFloorIndex === -1 ? 'var(--gold-050)' : 'var(--paper)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                🏢 All Floors View
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>Full building structure</div>
            </div>
          </div>
        )}

        {[...building.floors]
          .sort((a, b) => b.index - a.index)
          .map((floor) => {
            const isActive = activeFloorIndex === floor.index
            return (
              <div
                key={`floor-${floor.index}`}
                onClick={() => setActiveFloor(floor.index)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isActive ? 'var(--forest-900)' : 'var(--line-200)'}`,
                  background: isActive ? 'var(--gold-050)' : 'var(--paper)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                    {floor.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-500)' }}>
                    {floor.rooms.length} rooms · {floor.walls.length} walls
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {floor.index > 0 && floor.rooms.length === 0 && (
                    <button
                      type="button"
                      title="Copy ground floor footprint and walls"
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 6px', fontSize: '0.72rem', borderColor: 'var(--forest-600)', color: 'var(--forest-900)' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateGroundFloor(floor.index)
                      }}
                    >
                      <Copy size={12} /> Copy Ground
                    </button>
                  )}
                  {building.floors.length > 1 && (
                    <button
                      type="button"
                      title="Delete floor"
                      style={{ background: 'none', border: 'none', color: 'var(--red-600)', cursor: 'pointer', padding: 2 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFloor(floor.index)
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
