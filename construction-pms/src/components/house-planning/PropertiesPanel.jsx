/**
 * PropertiesPanel.jsx
 * CAD Object Inspector & Property Form Panel styled with PMS components and design tokens
 */

import { useState, useEffect } from 'react'
import {
  Trash2,
  Eye,
  EyeOff,
  RotateCw,
  Maximize2,
  Box,
  Palette,
  Compass,
} from 'lucide-react'
import { useHousePlanning } from '../../context/HousePlanningContext'
import { ROOM_LABELS, FURNITURE_DIMENSIONS, ROOM_COLORS } from '../../schema/buildingTypes'
import {
  scaleAndRepositionFurniture,
  getRoomBounds,
  getMinRoomDimensions,
  generateCompleteRoomFurniture,
} from '../../utils/roomResizing'

export default function PropertiesPanel() {
  const {
    building,
    selectedObjectId,
    selectedObjectType,
    updateBuilding,
    deleteSelectedObject,
    toggleObjectVisibility,
  } = useHousePlanning()

  if (!selectedObjectId || !selectedObjectType || !building) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-500)' }}>
        <Box size={36} color="var(--ink-300)" style={{ margin: '0 auto 12px', display: 'block' }} />
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--ink-900)', marginBottom: 4 }}>
          No Object Selected
        </h4>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-500)', margin: 0 }}>
          Click any room, wall, door, window, furniture, or staircase in 2D or 3D view to inspect and edit its properties.
        </p>
      </div>
    )
  }

  let wall = null
  let room = null
  let furniture = null
  let door = null
  let windowObj = null
  let staircase = null
  let roof = null

  let resolvedType = selectedObjectType

  for (const floor of building.floors) {
    if (resolvedType === 'wall') {
      wall = floor.walls.find((w) => w.id === selectedObjectId) ?? null
      if (wall) break
    } else if (resolvedType === 'room') {
      room = floor.rooms.find((r) => r.id === selectedObjectId) ?? null
      if (room) break
    } else if (resolvedType === 'furniture') {
      for (const r of floor.rooms) {
        furniture = r.furniture.find((f) => f.id === selectedObjectId) ?? null
        if (furniture) break
      }
      if (furniture) break
    } else if (resolvedType === 'door') {
      door = floor.doors.find((d) => d.id === selectedObjectId) ?? null
      if (door) break
    } else if (resolvedType === 'window') {
      windowObj = floor.windows.find((w) => w.id === selectedObjectId) ?? null
      if (windowObj) break
    } else if (resolvedType === 'staircase') {
      staircase = floor.staircases.find((s) => s.id === selectedObjectId) ?? null
      if (staircase) break
    } else if (resolvedType === 'roof') {
      if (floor.roof && (floor.roof.id === selectedObjectId || selectedObjectId.startsWith('roof-'))) {
        roof = floor.roof
        break
      }
    }
  }

  const activeObj = room || wall || door || windowObj || furniture || staircase || roof

  if (!activeObj) {
    return (
      <div style={{ padding: 16, fontSize: '0.82rem', color: 'var(--ink-500)' }}>
        Selection updated
      </div>
    )
  }

  const isHidden = activeObj.visible === false

  const updateRoomField = (fields) => {
    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) => ({
        ...f,
        rooms: f.rooms.map((r) => (r.id === selectedObjectId ? { ...r, ...fields } : r)),
      })),
    }))
  }

  const updateRoomDimensions = (reqW, reqH) => {
    if (!room || !room.polygon || room.polygon.length < 3) return
    const oldBounds = getRoomBounds(room.polygon)
    const minDims = getMinRoomDimensions(room.type)
    const newW = Math.max(minDims.minW, reqW)
    const newH = Math.max(minDims.minH, reqH)

    const newBounds = {
      minX: oldBounds.minX,
      maxX: Number((oldBounds.minX + newW).toFixed(2)),
      minY: oldBounds.minY,
      maxY: Number((oldBounds.minY + newH).toFixed(2)),
      width: newW,
      height: newH,
    }

    const newPoly = [
      [newBounds.minX, newBounds.minY],
      [newBounds.maxX, newBounds.minY],
      [newBounds.maxX, newBounds.maxY],
      [newBounds.minX, newBounds.maxY],
    ]

    const baseFurniture = room.furniture && room.furniture.length > 0
      ? room.furniture
      : generateCompleteRoomFurniture(room.type, oldBounds.minX, oldBounds.minY, oldBounds.width, oldBounds.height)

    const newFurniture = scaleAndRepositionFurniture({
      items: baseFurniture,
      oldBounds,
      newBounds,
    })

    const areaM2 = Number((newW * newH).toFixed(2))
    const areaSqFt = Number((newW * newH * 10.7639).toFixed(1))

    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) => ({
        ...f,
        rooms: f.rooms.map((r) =>
          r.id === selectedObjectId
            ? {
                ...r,
                polygon: newPoly,
                area: areaM2,
                areaSqFt,
                furniture: newFurniture,
              }
            : r
        ),
      })),
    }))
  }

  const updateWallField = (fields) => {
    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) => ({
        ...f,
        walls: f.walls.map((w) => (w.id === selectedObjectId ? { ...w, ...fields } : w)),
      })),
    }))
  }

  const updateFurnitureField = (fields) => {
    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) => ({
        ...f,
        rooms: f.rooms.map((r) => ({
          ...r,
          furniture: r.furniture.map((item) => (item.id === selectedObjectId ? { ...item, ...fields } : item)),
        })),
      })),
    }))
  }

  const updateDoorField = (fields) => {
    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) => ({
        ...f,
        doors: f.doors.map((d) => (d.id === selectedObjectId ? { ...d, ...fields } : d)),
      })),
    }))
  }

  const updateWindowField = (fields) => {
    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) => ({
        ...f,
        windows: f.windows.map((w) => (w.id === selectedObjectId ? { ...w, ...fields } : w)),
      })),
    }))
  }

  const updateStaircaseField = (fields) => {
    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) => ({
        ...f,
        staircases: f.staircases.map((s) => (s.id === selectedObjectId ? { ...s, ...fields } : s)),
      })),
    }))
  }

  const updateRoofField = (fields) => {
    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) => {
        if (f.roof && (f.roof.id === selectedObjectId || selectedObjectId.startsWith('roof-'))) {
          return { ...f, roof: { ...f.roof, ...fields } }
        }
        return f
      }),
    }))
  }

  const rotateRoom = (clockwise = true) => {
    if (!room || !room.polygon || room.polygon.length < 3) return
    const minX = Math.min(...room.polygon.map((p) => p[0]))
    const maxX = Math.max(...room.polygon.map((p) => p[0]))
    const minY = Math.min(...room.polygon.map((p) => p[1]))
    const maxY = Math.max(...room.polygon.map((p) => p[1]))
    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2

    const rotPt = (x, y) => {
      const dx = x - cx
      const dy = y - cy
      const rx = clockwise ? cx - dy : cx + dy
      const ry = clockwise ? cy + dx : cy - dx
      return [Number(rx.toFixed(2)), Number(ry.toFixed(2))]
    }

    const newPoly = room.polygon.map(([x, y]) => rotPt(x, y))

    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) => ({
        ...f,
        rooms: f.rooms.map((r) => {
          if (r.id !== selectedObjectId) return r
          const newFurn = (r.furniture || []).map((furn) => {
            const fX = furn.position[0]
            const fZ = furn.position[2] ?? furn.position[1]
            const [newFX, newFZ] = rotPt(fX, fZ)
            const oldRotY = furn.rotation?.[1] ?? 0
            const newRotY = ((oldRotY + (clockwise ? 90 : -90)) % 360 + 360) % 360
            return {
              ...furn,
              position: [newFX, furn.position[1], newFZ],
              rotation: [0, newRotY, 0],
            }
          })
          return {
            ...r,
            polygon: newPoly,
            furniture: newFurn,
          }
        }),
      })),
    }))
  }

  const roomBounds = room ? getRoomBounds(room.polygon) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Property Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--line-200)' }}>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--forest-950)', textTransform: 'capitalize', margin: 0 }}>
            Edit {resolvedType}
          </h4>
          <span style={{ fontSize: '0.72rem', color: 'var(--ink-500)', fontFamily: 'monospace' }}>
            {selectedObjectId}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px', fontSize: '0.74rem' }}
            onClick={() => toggleObjectVisibility(selectedObjectId, selectedObjectType)}
            title={isHidden ? 'Show component' : 'Hide component'}
          >
            {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ padding: '4px 8px', fontSize: '0.74rem', borderColor: 'var(--red-500)', color: 'var(--red-600)' }}
            onClick={deleteSelectedObject}
            title="Delete component"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Room Inspector */}
      {room && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Section: Room Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--gold-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Room Information
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Room Name</label>
              <input
                type="text"
                className="form-control"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={room.name || ''}
                onChange={(e) => updateRoomField({ name: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Room Category</label>
              <select
                className="form-control"
                style={{ width: '100%', boxSizing: 'border-box' }}
                value={room.type}
                onChange={(e) =>
                  updateRoomField({
                    type: e.target.value,
                    name: ROOM_LABELS[e.target.value] || room.name,
                  })
                }
              >
                {Object.entries(ROOM_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Dimensions & Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10, borderTop: '1px solid var(--line-100)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--gold-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Dimensions &amp; Area
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Width (m)</label>
                <input
                  type="number"
                  step="0.5"
                  min={getMinRoomDimensions(room.type).minW}
                  className="form-control"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={roomBounds ? roomBounds.width : 4}
                  onChange={(e) => updateRoomDimensions(parseFloat(e.target.value) || 3, roomBounds?.height || 3)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Depth (m)</label>
                <input
                  type="number"
                  step="0.5"
                  min={getMinRoomDimensions(room.type).minH}
                  className="form-control"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  value={roomBounds ? roomBounds.height : 4}
                  onChange={(e) => updateRoomDimensions(roomBounds?.width || 3, parseFloat(e.target.value) || 3)}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 600 }}>Total Area</label>
              <input
                type="text"
                className="form-control"
                readOnly
                style={{ background: 'var(--cream-100)', fontWeight: 700, color: 'var(--forest-950)', width: '100%', boxSizing: 'border-box' }}
                value={room.areaSqFt ? `${room.areaSqFt} sq ft (${room.area} m²)` : `${(roomBounds?.width * roomBounds?.height * 10.76).toFixed(1)} sq ft`}
              />
            </div>
          </div>

          {/* Section: Orientation & Rotation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 10, borderTop: '1px solid var(--line-100)' }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--gold-600)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Orientation &amp; Rotation
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, minWidth: 100, fontSize: '0.78rem', justifyContent: 'center' }}
                onClick={() => rotateRoom(true)}
              >
                <RotateCw size={14} /> 90° CW
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, minWidth: 100, fontSize: '0.78rem', justifyContent: 'center' }}
                onClick={() => rotateRoom(false)}
              >
                <RotateCw size={14} style={{ transform: 'scaleX(-1)' }} /> 90° CCW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wall Inspector */}
      {wall && (
        <div className="form-grid" style={{ gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Wall Thickness (m)</label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="1.0"
              className="form-control"
              value={wall.thickness || 0.2}
              onChange={(e) => updateWallField({ thickness: parseFloat(e.target.value) || 0.2 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Wall Height (m)</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="10.0"
              className="form-control"
              value={wall.height || 3.0}
              onChange={(e) =>
                updateWallField({
                  height: parseFloat(e.target.value) || 3.0,
                  isRailing: parseFloat(e.target.value) <= 1.3,
                })
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preset Style</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className={`btn btn-sm ${wall.height <= 1.3 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: '0.78rem' }}
                onClick={() => updateWallField({ height: 1.05, isRailing: true, thickness: 0.2 })}
              >
                Balcony Railing
              </button>
              <button
                type="button"
                className={`btn btn-sm ${wall.height > 1.3 ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, fontSize: '0.78rem' }}
                onClick={() => updateWallField({ height: 3.0, isRailing: false })}
              >
                Full Wall
              </button>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={Boolean(wall.isExterior)}
                onChange={(e) => updateWallField({ isExterior: e.target.checked })}
              />
              Exterior / Load-Bearing Wall
            </label>
          </div>
        </div>
      )}

      {/* Furniture Inspector */}
      {furniture && (
        <div className="form-grid" style={{ gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Furniture Item Type</label>
            <select
              className="form-control"
              value={furniture.type}
              onChange={(e) => updateFurnitureField({ type: e.target.value })}
            >
              {Object.keys(FURNITURE_DIMENSIONS).map((k) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="form-group">
              <label className="form-label">Position X (m)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={furniture.position?.[0] ?? 0}
                onChange={(e) =>
                  updateFurnitureField({
                    position: [parseFloat(e.target.value) || 0, furniture.position?.[1] ?? 0, furniture.position?.[2] ?? 0],
                  })
                }
              />
            </div>
            <div className="form-group">
              <label className="form-label">Position Z (m)</label>
              <input
                type="number"
                step="0.1"
                className="form-control"
                value={furniture.position?.[2] ?? furniture.position?.[1] ?? 0}
                onChange={(e) =>
                  updateFurnitureField({
                    position: [furniture.position?.[0] ?? 0, furniture.position?.[1] ?? 0, parseFloat(e.target.value) || 0],
                  })
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Rotation Y (°)</label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.78rem' }}
                onClick={() => {
                  const cur = furniture.rotation?.[1] ?? 0
                  const next = ((cur + 90) % 360 + 360) % 360
                  updateFurnitureField({ rotation: [0, next, 0] })
                }}
              >
                +90°
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: '0.78rem' }}
                onClick={() => {
                  const cur = furniture.rotation?.[1] ?? 0
                  const next = ((cur - 90) % 360 + 360) % 360
                  updateFurnitureField({ rotation: [0, next, 0] })
                }}
              >
                -90°
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Door Inspector */}
      {door && (
        <div className="form-grid" style={{ gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Door Width (m)</label>
            <input
              type="number"
              step="0.1"
              min="0.5"
              max="4.0"
              className="form-control"
              value={door.width || 0.9}
              onChange={(e) => updateDoorField({ width: parseFloat(e.target.value) || 0.9 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Door Swing</label>
            <select
              className="form-control"
              value={door.swing || 'in-left'}
              onChange={(e) => updateDoorField({ swing: e.target.value })}
            >
              <option value="in-left">Inward Left</option>
              <option value="in-right">Inward Right</option>
              <option value="out-left">Outward Left</option>
              <option value="out-right">Outward Right</option>
              <option value="double">Double Door</option>
              <option value="sliding">Sliding Door</option>
            </select>
          </div>
        </div>
      )}

      {/* Window Inspector */}
      {windowObj && (
        <div className="form-grid" style={{ gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="form-group">
              <label className="form-label">Width (m)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                className="form-control"
                value={windowObj.width || 1.2}
                onChange={(e) => updateWindowField({ width: parseFloat(e.target.value) || 1.2 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (m)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                className="form-control"
                value={windowObj.height || 1.2}
                onChange={(e) => updateWindowField({ height: parseFloat(e.target.value) || 1.2 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sill Height (m)</label>
            <input
              type="number"
              step="0.1"
              min="0.0"
              max="2.5"
              className="form-control"
              value={windowObj.sillHeight ?? windowObj.sill ?? 0.9}
              onChange={(e) => updateWindowField({ sillHeight: parseFloat(e.target.value) || 0.9, sill: parseFloat(e.target.value) || 0.9 })}
            />
          </div>
        </div>
      )}

      {/* Staircase Inspector */}
      {staircase && (
        <div className="form-grid" style={{ gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div className="form-group">
              <label className="form-label">Width (m)</label>
              <input
                type="number"
                step="0.1"
                min="0.6"
                max="3.0"
                className="form-control"
                value={staircase.width ?? 1.2}
                onChange={(e) => updateStaircaseField({ width: parseFloat(e.target.value) || 1.2 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Length (m)</label>
              <input
                type="number"
                step="0.1"
                min="1.5"
                max="6.0"
                className="form-control"
                value={staircase.length ?? 2.6}
                onChange={(e) => updateStaircaseField({ length: parseFloat(e.target.value) || 2.6 })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Staircase Style</label>
            <select
              className="form-control"
              value={staircase.type || 'straight'}
              onChange={(e) => updateStaircaseField({ type: e.target.value })}
            >
              <option value="straight">Straight Run</option>
              <option value="l-shaped">L-Shaped</option>
              <option value="u-shaped">U-Shaped</option>
              <option value="spiral">Spiral</option>
            </select>
          </div>
        </div>
      )}

      {/* Roof Inspector */}
      {roof && (
        <div className="form-grid" style={{ gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Roof Architecture Style</label>
            <select
              className="form-control"
              value={roof.type || 'pitched_hip'}
              onChange={(e) => updateRoofField({ type: e.target.value })}
            >
              <option value="flat">Flat Modern Terrace (Parapet)</option>
              <option value="pitched_gable">Pitched Gable Roof (Triangular)</option>
              <option value="pitched_hip">Pitched Hip Roof (4-Slope Classic)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Roof Peak Pitch Height (m)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="5.0"
              className="form-control"
              value={roof.height ?? 2.2}
              onChange={(e) => updateRoofField({ height: parseFloat(e.target.value) || 2.2 })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Eave Overhang (m)</label>
            <input
              type="number"
              step="0.05"
              min="0.0"
              max="2.0"
              className="form-control"
              value={roof.overhang ?? 0.6}
              onChange={(e) => updateRoofField({ overhang: parseFloat(e.target.value) || 0.6 })}
            />
          </div>
        </div>
      )}
    </div>
  )
}
