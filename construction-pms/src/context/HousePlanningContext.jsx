/**
 * HousePlanningContext.jsx
 * State management for the House Planning module following the PMS architecture
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { normalizeBuilding, denormalizeBuilding } from '../schema/normalizeBuilding'
import { computeSlabGeometries, isStaircaseInsideHouse } from '../utils/houseGeometry'
import { validateBuildingLocal } from '../utils/houseValidator'
import { TEMPLATES } from '../data/housePlanTemplates'
import { housePlanAPI } from '../services/api'

const HousePlanningContext = createContext()

const MAX_UNDO_STACK = 50

export function HousePlanningProvider({ projectId, initialPlan, children }) {
  const [building, setBuildingState] = useState(null)
  const [activeFloorIndex, setActiveFloorIndex] = useState(0)
  const [selectedObjectId, setSelectedObjectId] = useState(null)
  const [selectedObjectType, setSelectedObjectType] = useState(null)

  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])

  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationResult, setValidationResult] = useState(null)

  const [viewMode, setViewMode] = useState('2d') // '2d' | '3d'
  const [cameraMode, setCameraMode] = useState('orbit') // 'orbit' | 'topdown' | 'walkthrough'

  const [layerVisibility, setLayerVisibility] = useState({
    walls: true,
    furniture: true,
    roof: true,
    windows: true,
    doors: true,
  })

  // Initialize building from initialPlan, API, or default template
  useEffect(() => {
    let raw = initialPlan
    if (!raw && TEMPLATES.house_2bhk) {
      raw = TEMPLATES.house_2bhk
    }

    if (raw) {
      try {
        const norm = normalizeBuilding(raw)
        const slabbed = computeSlabGeometries(norm)
        setBuildingState(slabbed)
      } catch (e) {
        console.warn('[HousePlanningContext] Slab calculation fallback:', e)
        setBuildingState(normalizeBuilding(raw))
      }
    }
  }, [initialPlan])

  const setBuilding = useCallback((newB) => {
    const norm = normalizeBuilding(newB)
    setBuildingState(norm)
    setUndoStack([])
    setRedoStack([])
    setIsDirty(false)
  }, [])

  const updateBuilding = useCallback((updater) => {
    setBuildingState((prev) => {
      if (!prev) return prev
      const updated = typeof updater === 'function' ? updater(prev) : updater
      const norm = normalizeBuilding(updated)

      setUndoStack((stack) => [...stack, prev].slice(-MAX_UNDO_STACK))
      setRedoStack([])
      setIsDirty(true)
      return norm
    })
  }, [])

  const selectObject = useCallback((id, type) => {
    setSelectedObjectId(id)
    setSelectedObjectType(type)
  }, [])

  const setActiveFloor = useCallback((index) => {
    setActiveFloorIndex(index)
  }, [])

  const undo = useCallback(() => {
    if (undoStack.length === 0 || !building) return
    const prevBuilding = undoStack[undoStack.length - 1]
    setUndoStack((stack) => stack.slice(0, -1))
    setRedoStack((stack) => [...stack, building])
    setBuildingState(prevBuilding)
    setIsDirty(true)
  }, [undoStack, building])

  const redo = useCallback(() => {
    if (redoStack.length === 0 || !building) return
    const nextBuilding = redoStack[redoStack.length - 1]
    setRedoStack((stack) => stack.slice(0, -1))
    setUndoStack((stack) => [...stack, building].slice(-MAX_UNDO_STACK))
    setBuildingState(nextBuilding)
    setIsDirty(true)
  }, [redoStack, building])

  const toggleLayer = useCallback((layerId) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }))
  }, [])

  const toggleObjectVisibility = useCallback((objectId, objectType) => {
    if (!building) return
    updateBuilding((b) => {
      const toggleVis = (obj) => {
        if (obj.id === objectId) {
          return { ...obj, visible: obj.visible !== undefined ? !obj.visible : false }
        }
        return obj
      }
      return {
        ...b,
        floors: b.floors.map((floor) => ({
          ...floor,
          rooms: floor.rooms.map((room) => {
            if (objectType === 'room') return toggleVis(room)
            return {
              ...room,
              furniture: room.furniture.map((f) => (objectType === 'furniture' ? toggleVis(f) : f)),
            }
          }),
          walls: floor.walls.map((wall) => (objectType === 'wall' ? toggleVis(wall) : wall)),
          doors: floor.doors.map((door) => (objectType === 'door' ? toggleVis(door) : door)),
          windows: floor.windows.map((win) => (objectType === 'window' ? toggleVis(win) : win)),
          staircases: floor.staircases.map((s) => (objectType === 'staircase' ? toggleVis(s) : s)),
          roof: floor.roof && (objectType === 'roof' || floor.roof.id === objectId) ? toggleVis(floor.roof) : floor.roof,
        })),
      }
    })
  }, [building, updateBuilding])

  const deleteSelectedObject = useCallback(() => {
    if (!building || !selectedObjectId || !selectedObjectType) return

    updateBuilding((b) => {
      const newFloors = b.floors.map((floor) => {
        if (selectedObjectType === 'room') {
          const deletedRoom = floor.rooms.find((r) => r.id === selectedObjectId)
          const remainingRooms = floor.rooms
            .filter((r) => r.id !== selectedObjectId)
            .map((r) => ({
              ...r,
              connections: (r.connections || []).filter((c) => c.targetRoomId !== selectedObjectId),
            }))
          const usedWallIds = new Set(remainingRooms.flatMap((r) => r.wallIds || []))
          const remainingWalls = deletedRoom
            ? floor.walls.filter((w) => !deletedRoom.wallIds.includes(w.id) || usedWallIds.has(w.id))
            : floor.walls
          const remainingWallIds = new Set(remainingWalls.map((w) => w.id))
          const remainingDoors = floor.doors.filter((d) => remainingWallIds.has(d.wallId))
          const remainingWindows = floor.windows.filter((w) => remainingWallIds.has(w.wallId))
          return {
            ...floor,
            rooms: remainingRooms,
            walls: remainingWalls,
            doors: remainingDoors,
            windows: remainingWindows,
          }
        } else if (selectedObjectType === 'wall') {
          const remainingWalls = floor.walls.filter((w) => w.id !== selectedObjectId)
          const remainingDoors = floor.doors.filter((d) => d.wallId !== selectedObjectId)
          const remainingWindows = floor.windows.filter((w) => w.wallId !== selectedObjectId)
          const updatedRooms = floor.rooms.map((r) => ({
            ...r,
            wallIds: (r.wallIds || []).filter((wId) => wId !== selectedObjectId),
          }))
          return {
            ...floor,
            rooms: updatedRooms,
            walls: remainingWalls,
            doors: remainingDoors,
            windows: remainingWindows,
          }
        } else if (selectedObjectType === 'door') {
          return { ...floor, doors: floor.doors.filter((d) => d.id !== selectedObjectId) }
        } else if (selectedObjectType === 'window') {
          return { ...floor, windows: floor.windows.filter((w) => w.id !== selectedObjectId) }
        } else if (selectedObjectType === 'furniture') {
          return {
            ...floor,
            rooms: floor.rooms.map((r) => ({
              ...r,
              furniture: r.furniture.filter((f) => f.id !== selectedObjectId),
            })),
          }
        } else if (selectedObjectType === 'staircase') {
          return { ...floor, staircases: floor.staircases.filter((s) => s.id !== selectedObjectId) }
        } else if (selectedObjectType === 'roof') {
          return { ...floor, roof: floor.roof?.id === selectedObjectId ? undefined : floor.roof }
        }
        return floor
      })

      return {
        ...b,
        floors: newFloors,
      }
    })

    setSelectedObjectId(null)
    setSelectedObjectType(null)
  }, [building, selectedObjectId, selectedObjectType, updateBuilding])

  const runValidation = useCallback(async () => {
    if (!building) return { status: 'passed', totalIssues: 0, issues: [] }
    const localRes = validateBuildingLocal(building)
    if (projectId) {
      try {
        const backendRes = await housePlanAPI.validate(projectId, denormalizeBuilding(building))
        if (backendRes) {
          setValidationResult(backendRes)
          return backendRes
        }
      } catch (e) {
        console.warn('[HousePlanningContext] Backend validation fallback to local:', e)
      }
    }
    setValidationResult(localRes)
    return localRes
  }, [building, projectId])

  const saveHousePlan = useCallback(async () => {
    if (!building) return null
    setIsSaving(true)
    try {
      const denorm = denormalizeBuilding(building)
      if (projectId) {
        await housePlanAPI.save(projectId, denorm)
      }
      setIsDirty(false)
      setIsSaving(false)
      return building
    } catch (e) {
      console.error('[Save House Plan Error]', e)
      setIsSaving(false)
      throw e
    }
  }, [building, projectId])

  const loadTemplate = useCallback((templateKey) => {
    const raw = TEMPLATES[templateKey] || TEMPLATES.house_2bhk
    if (raw) {
      const norm = normalizeBuilding(raw)
      const slabbed = computeSlabGeometries(norm)
      setBuildingState(slabbed)
      setUndoStack([])
      setRedoStack([])
      setIsDirty(true)
      setSelectedObjectId(null)
      setSelectedObjectType(null)
    }
  }, [])

  const handleViewModeChange = useCallback((newMode) => {
    if (newMode === '3d' && building) {
      const cleanedFloors = building.floors.map((floor) => ({
        ...floor,
        staircases: (floor.staircases || []).filter((stair) => isStaircaseInsideHouse(stair, floor.rooms)),
      }))
      const cleanedBuilding = {
        ...building,
        floors: cleanedFloors,
      }
      try {
        const canonicalBuilding = normalizeBuilding(cleanedBuilding)
        const slabbedBuilding = computeSlabGeometries(canonicalBuilding)
        setBuildingState(slabbedBuilding)
      } catch (e) {
        console.warn('[HousePlanningContext] 3D slab computation fallback:', e)
        setBuildingState(normalizeBuilding(cleanedBuilding))
      }
    }
    setViewMode(newMode)
  }, [building])

  return (
    <HousePlanningContext.Provider
      value={{
        building,
        setBuilding,
        updateBuilding,
        activeFloorIndex,
        setActiveFloor,
        selectedObjectId,
        selectedObjectType,
        selectObject,
        undoStack,
        redoStack,
        undo,
        redo,
        isDirty,
        isSaving,
        validationResult,
        setValidationResult,
        runValidation,
        saveHousePlan,
        loadTemplate,
        layerVisibility,
        toggleLayer,
        toggleObjectVisibility,
        deleteSelectedObject,
        viewMode,
        setViewMode: handleViewModeChange,
        cameraMode,
        setCameraMode,
      }}
    >
      {children}
    </HousePlanningContext.Provider>
  )
}

export function useHousePlanning() {
  const ctx = useContext(HousePlanningContext)
  if (!ctx) {
    throw new Error('useHousePlanning must be used within HousePlanningProvider')
  }
  return ctx
}
