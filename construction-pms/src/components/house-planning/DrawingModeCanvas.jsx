/**
 * DrawingModeCanvas.jsx
 * Interactive 2D CAD Floor-Plan Drawing & Editing Surface styled for PMS
 */

import { useState, useRef, useMemo, useEffect } from 'react'
import {
  MousePointer,
  Square,
  Maximize2,
  DoorOpen,
  AppWindow,
  Sofa,
  Move,
  RotateCw,
  Plus,
  ZoomIn,
  ZoomOut,
  Maximize,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react'
import { useHousePlanning } from '../../context/HousePlanningContext'
import { ROOM_COLORS, FURNITURE_DIMENSIONS } from '../../schema/buildingTypes'
import { isStaircaseInsideHouse, generateUUID } from '../../utils/houseGeometry'
import {
  scaleAndRepositionFurniture,
  getRoomBounds,
  getMinRoomDimensions,
  generateCompleteRoomFurniture,
  resolveFurnitureCollisions,
} from '../../utils/roomResizing'
import { useToast } from '../ToastContext'

const ROOM_PRESETS = [
  { type: 'living', label: 'Living Room', w: 6, h: 5, icon: '🛋️' },
  { type: 'bedroom', label: 'Master Bedroom', w: 5, h: 4.5, icon: '🛏️', isMaster: true },
  { type: 'bedroom', label: 'Bedroom 2', w: 4, h: 4, icon: '🛏️' },
  { type: 'kitchen', label: 'Kitchen', w: 4, h: 3.5, icon: '🍳' },
  { type: 'dining', label: 'Dining Room', w: 4, h: 4, icon: '🍽️' },
  { type: 'bathroom', label: 'Bathroom', w: 3, h: 2.5, icon: '🚿' },
  { type: 'study', label: 'Study Room', w: 4, h: 3, icon: '📚' },
  { type: 'garage', label: 'Parking Garage', w: 6, h: 4, icon: '🚗' },
  { type: 'open_parking', label: 'Open Parking', w: 5, h: 3.5, icon: '🅿️' },
  { type: 'balcony', label: 'Balcony', w: 4, h: 2, icon: '🪴' },
  { type: 'office', label: 'Office', w: 4, h: 3, icon: '💼' },
  { type: 'storeroom', label: 'Storeroom', w: 2.5, h: 2, icon: '📦' },
  { type: 'hall', label: 'Hall', w: 5, h: 5, icon: '🏛️' },
]

export default function DrawingModeCanvas({ onSwitchTo3D }) {
  const {
    building,
    activeFloorIndex,
    selectedObjectId,
    selectedObjectType,
    selectObject,
    updateBuilding,
  } = useHousePlanning()

  const showToast = useToast()

  const [activeTool, setActiveTool] = useState('select') // 'select' | 'wall' | 'room' | 'door' | 'window' | 'furniture'
  const [selectedRoomPreset, setSelectedRoomPreset] = useState(ROOM_PRESETS[0])
  const [selectedFurnitureType, setSelectedFurnitureType] = useState('sofa')

  const [drawingStart, setDrawingStart] = useState(null)
  const [hoverPos, setHoverPos] = useState(null)

  const [draggingRoomId, setDraggingRoomId] = useState(null)
  const [dragOffset, setDragOffset] = useState([0, 0])
  const [initialRoomState, setInitialRoomState] = useState(null)

  const [draggingFurnitureId, setDraggingFurnitureId] = useState(null)
  const [furnitureDragOffset, setFurnitureDragOffset] = useState([0, 0])

  const [draggingStaircaseId, setDraggingStaircaseId] = useState(null)
  const [staircaseDragOffset, setStaircaseDragOffset] = useState([0, 0])

  const [resizingRoomId, setResizingRoomId] = useState(null)
  const [resizingCornerIndex, setResizingCornerIndex] = useState(null)
  const [initialResizeRoomState, setInitialResizeRoomState] = useState(null)

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1.0)
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef(null)
  const hasMovedRef = useRef(false)
  const containerRef = useRef(null)

  if (!building) return null

  const currentFloor = building.floors.find((f) => f.index === activeFloorIndex) || building.floors[0]
  const groundFloor = building.floors.find((f) => f.index === 0) || building.floors[0]
  const isUpperFloor = activeFloorIndex > 0

  const groundFloorBounds = useMemo(() => {
    if (!isUpperFloor) return null
    const allPts = groundFloor.rooms.flatMap((r) => r.polygon || [])
    if (allPts.length < 3) return null
    const minX = Math.min(...allPts.map((p) => p[0]))
    const maxX = Math.max(...allPts.map((p) => p[0]))
    const minY = Math.min(...allPts.map((p) => p[1]))
    const maxY = Math.max(...allPts.map((p) => p[1]))
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
  }, [groundFloor, isUpperFloor])

  const [centerOffset, setCenterOffset] = useState({ x: 300, y: 220 })

  useEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.clientWidth || 700
      const h = containerRef.current.clientHeight || 500
      setCenterOffset({
        x: Math.max(180, Math.round(w / 2 - 120)),
        y: Math.max(140, Math.round(h / 2 - 100)),
      })
    }
  }, [containerRef.current?.clientWidth, containerRef.current?.clientHeight])

  const GRID_SIZE = 24
  const snapToGrid = (val) => Math.round(val / 0.5) * 0.5

  const getCanvasCoords = (arg1, arg2) => {
    if (!containerRef.current) return [0, 0]
    const rect = containerRef.current.getBoundingClientRect()
    let clientX, clientY
    if (typeof arg1 === 'number') {
      clientX = arg1
      clientY = arg2 ?? 0
    } else {
      clientX = arg1.clientX
      clientY = arg1.clientY
    }
    const rawX = (clientX - rect.left - centerOffset.x - panOffset.x) / zoom
    const rawY = (clientY - rect.top - centerOffset.y - panOffset.y) / zoom
    return [snapToGrid(rawX / GRID_SIZE), snapToGrid(rawY / GRID_SIZE)]
  }

  const createRoomWithWalls = (preset, rawPosX, rawPosY) => {
    const rId = `room-${generateUUID()}`
    let w = preset.w
    let h = preset.h
    let posX = rawPosX
    let posY = rawPosY

    if (isUpperFloor && groundFloorBounds) {
      w = Math.min(w, groundFloorBounds.width)
      h = Math.min(h, groundFloorBounds.height)
      posX = Math.max(groundFloorBounds.minX, Math.min(groundFloorBounds.maxX - w, posX))
      posY = Math.max(groundFloorBounds.minY, Math.min(groundFloorBounds.maxY - h, posY))
    }

    const poly = [
      [posX, posY],
      [posX + w, posY],
      [posX + w, posY + h],
      [posX, posY + h],
    ]

    const newWalls = []
    const newDoors = []
    const wallIds = []

    if (preset.type !== 'open_parking') {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i]
        const p2 = poly[(i + 1) % poly.length]
        const wallId = `wall-${generateUUID()}`
        newWalls.push({
          id: wallId,
          startPoint: p1,
          endPoint: p2,
          thickness: 0.2,
          height: currentFloor.floorToFloorHeight || 3.0,
          isExterior: true,
        })
        wallIds.push(wallId)
      }
    }

    const autoFurniture = generateCompleteRoomFurniture(preset.type, posX, posY, w, h, preset.isMaster)
    const newRoom = {
      id: rId,
      name: preset.label,
      type: preset.type,
      wallIds,
      polygon: poly,
      area: w * h,
      areaSqFt: w * h * 10.7639,
      furniture: autoFurniture,
      connections: [],
    }

    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) =>
        f.index === activeFloorIndex
          ? {
              ...f,
              rooms: [...f.rooms, newRoom],
              walls: [...f.walls, ...newWalls],
              doors: [...f.doors, ...newDoors],
            }
          : f
      ),
    }))

    selectObject(rId, 'room')
    showToast(`${preset.label} placed with default furniture & walls`)
  }

  const handleAddStaircase = () => {
    const targetRoom = currentFloor.rooms.find((r) => r.type === 'living' || r.type === 'hall') || currentFloor.rooms[0]
    let initX = 4
    let initY = 4
    if (targetRoom && targetRoom.polygon && targetRoom.polygon.length >= 3) {
      const xs = targetRoom.polygon.map((p) => p[0])
      const ys = targetRoom.polygon.map((p) => p[1])
      initX = (Math.min(...xs) + Math.max(...xs)) / 2
      initY = (Math.min(...ys) + Math.max(...ys)) / 2
    }

    const newStair = {
      id: `stair-${generateUUID()}`,
      location: 'internal',
      startFloorIndex: activeFloorIndex,
      endFloorIndex: activeFloorIndex + 1,
      position: [snapToGrid(initX), snapToGrid(initY)],
      width: 1.2,
      length: 2.8,
      rotation: 0,
      type: 'straight',
      hasLanding: true,
      landingLength: 0.8,
      visible: true,
    }

    updateBuilding((b) => ({
      ...b,
      floors: b.floors.map((f) =>
        f.index === activeFloorIndex
          ? {
              ...f,
              staircases: [...(f.staircases || []).filter((s) => s.location !== 'external'), newStair],
            }
          : f
      ),
    }))

    selectObject(newStair.id, 'staircase')
    showToast('Added Indoor Staircase. Position it inside room boundaries.')
  }

  const handleCanvasClick = (e) => {
    if (draggingRoomId || resizingRoomId) return
    const [mx, my] = getCanvasCoords(e)

    if (activeTool === 'room') {
      createRoomWithWalls(selectedRoomPreset, mx, my)
    } else if (activeTool === 'wall') {
      let ptX = mx
      let ptY = my
      if (isUpperFloor && groundFloorBounds) {
        ptX = Math.max(groundFloorBounds.minX, Math.min(groundFloorBounds.maxX, ptX))
        ptY = Math.max(groundFloorBounds.minY, Math.min(groundFloorBounds.maxY, ptY))
      }
      if (!drawingStart) {
        setDrawingStart([ptX, ptY])
        showToast('Click end point to complete wall segment', 'info')
      } else {
        if (drawingStart[0] === ptX && drawingStart[1] === ptY) {
          setDrawingStart(null)
          return
        }
        const newWall = {
          id: `wall-${generateUUID()}`,
          startPoint: drawingStart,
          endPoint: [ptX, ptY],
          thickness: 0.2,
          height: currentFloor.floorToFloorHeight || 3.0,
          isExterior: false,
        }
        updateBuilding((b) => ({
          ...b,
          floors: b.floors.map((f) => (f.index === activeFloorIndex ? { ...f, walls: [...f.walls, newWall] } : f)),
        }))
        setDrawingStart([ptX, ptY])
        showToast('Wall segment created')
      }
    }
  }

  const handleHandleMouseDown = (r, handleIdx, e) => {
    e.stopPropagation()
    selectObject(r.id, 'room')
    setResizingRoomId(r.id)
    setResizingCornerIndex(handleIdx)

    const bounds = getRoomBounds(r.polygon)
    const baseFurn = r.furniture && r.furniture.length > 0
      ? structuredClone(r.furniture)
      : generateCompleteRoomFurniture(r.type, bounds.minX, bounds.minY, bounds.width, bounds.height)

    const assocWalls = currentFloor.walls.filter((w) => (r.wallIds || []).includes(w.id))
    const assocDoors = currentFloor.doors.filter((d) => (r.wallIds || []).includes(d.wallId))
    const assocWindows = currentFloor.windows.filter((win) => (r.wallIds || []).includes(win.wallId))

    setInitialResizeRoomState({
      room: structuredClone(r),
      initialBounds: bounds,
      initialFurniture: baseFurn,
      initialWalls: structuredClone(assocWalls),
      initialDoors: structuredClone(assocDoors),
      initialWindows: structuredClone(assocWindows),
    })
  }

  const toSvgX = (mX) => mX * GRID_SIZE
  const toSvgY = (mY) => mY * GRID_SIZE

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', background: 'var(--cream-050)', position: 'relative' }}>
      {/* Left Sidebar: Room Presets Palette */}
      <div
        className="card"
        style={{
          width: 220,
          borderRadius: 0,
          borderRight: '1px solid var(--line-200)',
          background: 'var(--paper)',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
          zIndex: 10,
        }}
      >
        <div>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
            Room Palette
          </h4>
          <p style={{ fontSize: '0.74rem', color: 'var(--ink-500)', margin: '4px 0 0' }}>
            Click or drag a room preset directly onto the CAD surface.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {ROOM_PRESETS.map((preset, i) => (
            <div
              key={i}
              onClick={() => {
                setSelectedRoomPreset(preset)
                setActiveTool('room')
                showToast(`Selected ${preset.label}. Click on grid to place.`)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: selectedRoomPreset.type === preset.type && activeTool === 'room' ? 'var(--gold-050)' : 'var(--paper)',
                border: `1px solid ${selectedRoomPreset.type === preset.type && activeTool === 'room' ? 'var(--forest-900)' : 'var(--line-100)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{preset.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink-900)' }}>{preset.label}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--ink-500)' }}>
                  {preset.w}m × {preset.h}m ({preset.w * preset.h}m²)
                </span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                onClick={(e) => {
                  e.stopPropagation()
                  createRoomWithWalls(preset, 2, 2)
                }}
              >
                <Plus size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main CAD Surface Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Top Tool Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: 'var(--paper)',
            borderBottom: '1px solid var(--line-200)',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              type="button"
              className={`btn btn-sm ${activeTool === 'select' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setActiveTool('select')
                setDrawingStart(null)
              }}
            >
              <MousePointer size={14} /> Select / Move
            </button>

            <button
              type="button"
              className={`btn btn-sm ${activeTool === 'wall' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTool('wall')}
            >
              <Square size={14} /> Draw Wall
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleAddStaircase}
              title="Add Indoor Staircase"
            >
              <Move size={14} /> Indoor Staircase
            </button>
          </div>

          {isUpperFloor && (
            <div style={{ fontSize: '0.78rem', color: 'var(--forest-900)', fontWeight: 600, background: 'var(--gold-050)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--line-200)' }}>
              Floor {activeFloorIndex} • Contained within Ground Slab Boundaries
            </div>
          )}
        </div>

        {/* SVG CAD Surface */}
        <div
          ref={containerRef}
          style={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}
        >
          <svg
            width="100%"
            height="100%"
            onClick={handleCanvasClick}
            onMouseMove={(e) => setHoverPos(getCanvasCoords(e))}
            style={{
              background: 'var(--cream-050, #fcfaf6)',
              cursor: isPanning ? 'grabbing' : activeTool === 'wall' ? 'crosshair' : 'default',
            }}
          >
            <defs>
              <pattern
                id="grid-pms"
                width={GRID_SIZE * zoom}
                height={GRID_SIZE * zoom}
                patternUnits="userSpaceOnUse"
                patternTransform={`translate(${centerOffset.x + panOffset.x}, ${centerOffset.y + panOffset.y})`}
              >
                <path d={`M ${GRID_SIZE * zoom} 0 L 0 0 0 ${GRID_SIZE * zoom}`} fill="none" stroke="var(--line-100, #e8e1d0)" strokeWidth="1" />
              </pattern>
              <pattern
                id="grid-major-pms"
                width={GRID_SIZE * 5 * zoom}
                height={GRID_SIZE * 5 * zoom}
                patternUnits="userSpaceOnUse"
                patternTransform={`translate(${centerOffset.x + panOffset.x}, ${centerOffset.y + panOffset.y})`}
              >
                <rect width={GRID_SIZE * 5 * zoom} height={GRID_SIZE * 5 * zoom} fill="url(#grid-pms)" />
                <path d={`M ${GRID_SIZE * 5 * zoom} 0 L 0 0 0 ${GRID_SIZE * 5 * zoom}`} fill="none" stroke="var(--line-200, #d5caa8)" strokeWidth="1.5" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid-major-pms)" />

            <g transform={`translate(${centerOffset.x + panOffset.x}, ${centerOffset.y + panOffset.y}) scale(${zoom})`}>
              {/* Ground Floor Slab Outline on Upper Floors */}
              {isUpperFloor && groundFloorBounds && (
                <g pointerEvents="none">
                  <rect
                    x={toSvgX(groundFloorBounds.minX)}
                    y={toSvgY(groundFloorBounds.minY)}
                    width={groundFloorBounds.width * GRID_SIZE}
                    height={groundFloorBounds.height * GRID_SIZE}
                    fill="rgba(47, 93, 80, 0.06)"
                    stroke="var(--forest-800)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    rx={4}
                  />
                </g>
              )}

              {/* Render Rooms */}
              {currentFloor.rooms
                .filter((r) => r.visible !== false)
                .map((room) => {
                  const isSel = selectedObjectId === room.id
                  const pointsStr = room.polygon.map((p) => `${toSvgX(p[0])},${toSvgY(p[1])}`).join(' ')
                  const minX = Math.min(...room.polygon.map((p) => p[0]))
                  const maxX = Math.max(...room.polygon.map((p) => p[0]))
                  const minY = Math.min(...room.polygon.map((p) => p[1]))
                  const maxY = Math.max(...room.polygon.map((p) => p[1]))
                  const wM = Math.abs(maxX - minX)
                  const hM = Math.abs(maxY - minY)

                  return (
                    <g key={room.id}>
                      <polygon
                        points={pointsStr}
                        fill={room.color || ROOM_COLORS[room.type] || '#deede9'}
                        fillOpacity="0.65"
                        stroke={isSel ? 'var(--forest-900)' : '#a9a294'}
                        strokeWidth={isSel ? 3 : 1.5}
                        onClick={(e) => {
                          e.stopPropagation()
                          selectObject(room.id, 'room')
                        }}
                        style={{ cursor: 'pointer' }}
                      />

                      {/* Room Labels & Dimensions */}
                      <text
                        x={toSvgX(minX) + 10}
                        y={toSvgY(minY) + 22}
                        fill="var(--ink-900)"
                        fontSize="13"
                        fontWeight="700"
                        fontFamily="sans-serif"
                        pointerEvents="none"
                      >
                        {room.name}
                      </text>
                      <text
                        x={toSvgX(minX) + 10}
                        y={toSvgY(minY) + 38}
                        fill="var(--ink-700)"
                        fontSize="11"
                        fontFamily="monospace"
                        pointerEvents="none"
                      >
                        {wM.toFixed(1)}m × {hM.toFixed(1)}m ({(room.areaSqFt || wM * hM * 10.76).toFixed(0)} sq ft)
                      </text>

                      {/* 8-Point Resize Handles for Selected Room */}
                      {isSel &&
                        [
                          { idx: 0, x: minX, y: minY, cursor: 'nwse-resize' },
                          { idx: 1, x: maxX, y: minY, cursor: 'nesw-resize' },
                          { idx: 2, x: maxX, y: maxY, cursor: 'nwse-resize' },
                          { idx: 3, x: minX, y: maxY, cursor: 'nesw-resize' },
                          { idx: 4, x: (minX + maxX) / 2, y: minY, cursor: 'ns-resize' },
                          { idx: 5, x: maxX, y: (minY + maxY) / 2, cursor: 'ew-resize' },
                          { idx: 6, x: (minX + maxX) / 2, y: maxY, cursor: 'ns-resize' },
                          { idx: 7, x: minX, y: (minY + maxY) / 2, cursor: 'ew-resize' },
                        ].map((h) => (
                          <circle
                            key={`handle-${h.idx}`}
                            cx={toSvgX(h.x)}
                            cy={toSvgY(h.y)}
                            r={h.idx >= 4 ? 6 : 7}
                            fill={h.idx >= 4 ? 'var(--gold-600)' : 'var(--forest-900)'}
                            stroke="#ffffff"
                            strokeWidth="2"
                            style={{ cursor: h.cursor }}
                            onMouseDown={(e) => handleHandleMouseDown(room, h.idx, e)}
                          />
                        ))}
                    </g>
                  )
                })}

              {/* Render Walls */}
              {currentFloor.walls
                .filter((w) => w.visible !== false)
                .map((wall) => {
                  const isSel = selectedObjectId === wall.id
                  return (
                    <line
                      key={wall.id}
                      x1={toSvgX(wall.startPoint[0])}
                      y1={toSvgY(wall.startPoint[1])}
                      x2={toSvgX(wall.endPoint[0])}
                      y2={toSvgY(wall.endPoint[1])}
                      stroke={isSel ? 'var(--gold-600)' : wall.isExterior ? 'var(--forest-950)' : 'var(--ink-700)'}
                      strokeWidth={Math.max(4, wall.thickness * 20)}
                      strokeLinecap="round"
                      onClick={(e) => {
                        e.stopPropagation()
                        selectObject(wall.id, 'wall')
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  )
                })}

              {/* Render Doors */}
              {currentFloor.doors
                .filter((d) => d.visible !== false)
                .map((d) => {
                  const pos = Array.isArray(d.position) ? d.position : [0, 0]
                  const isSel = selectedObjectId === d.id
                  return (
                    <circle
                      key={d.id}
                      cx={toSvgX(pos[0])}
                      cy={toSvgY(pos[1])}
                      r={isSel ? 9 : 7}
                      fill={isSel ? 'var(--gold-600)' : 'var(--amber-600)'}
                      stroke="#fff"
                      strokeWidth={2}
                      onClick={(e) => {
                        e.stopPropagation()
                        selectObject(d.id, 'door')
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  )
                })}

              {/* Active Drawing Line Preview */}
              {drawingStart && hoverPos && (
                <line
                  x1={toSvgX(drawingStart[0])}
                  y1={toSvgY(drawingStart[1])}
                  x2={toSvgX(hoverPos[0])}
                  y2={toSvgY(hoverPos[1])}
                  stroke="var(--forest-900)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
              )}
            </g>
          </svg>

          {/* Floating Zoom Controls */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--paper)',
              border: '1px solid var(--line-200)',
              borderRadius: 'var(--radius-md)',
              padding: '6px 10px',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setZoom((z) => Number(Math.min(3.0, z + 0.15).toFixed(2)))}
            >
              <ZoomIn size={15} />
            </button>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace', minWidth: 42, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setZoom((z) => Number(Math.max(0.3, z - 0.15).toFixed(2)))}
            >
              <ZoomOut size={15} />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setZoom(1.0)
                setPanOffset({ x: 0, y: 0 })
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
