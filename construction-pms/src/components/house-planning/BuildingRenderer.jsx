/**
 * BuildingRenderer.jsx
 * 3D Building Renderer using Three.js & React Three Fiber styled with PMS materials & colors
 */

import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useHousePlanning } from '../../context/HousePlanningContext'
import { ROOM_COLORS, FURNITURE_DIMENSIONS } from '../../schema/buildingTypes'
import { isStaircaseInsideHouse, getStairHole } from '../../utils/houseGeometry'

export function BuildingRenderer() {
  const { building, activeFloorIndex, selectedObjectId, selectObject, layerVisibility } = useHousePlanning()

  if (!building) return null

  const maxFloorIndex = building.floors.reduce((max, f) => Math.max(max, f.index), 0)

  const buildingCenter = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity
    let hasPoints = false

    building.floors.forEach((floor) => {
      floor.rooms.forEach((room) => {
        if (room.polygon && room.polygon.length > 0) {
          room.polygon.forEach(([x, z]) => {
            minX = Math.min(minX, x)
            maxX = Math.max(maxX, x)
            minZ = Math.min(minZ, z)
            maxZ = Math.max(maxZ, z)
            hasPoints = true
          })
        }
      })
    })

    if (!hasPoints) return { cx: 0, cz: 0 }
    return { cx: (minX + maxX) / 2, cz: (minZ + maxZ) / 2 }
  }, [building])

  const visibleFloors = building.floors.filter((floor) => {
    if (activeFloorIndex === -1) return true
    return floor.index <= activeFloorIndex
  })

  return (
    <group name="building-root" position={[-buildingCenter.cx, 0, -buildingCenter.cz]}>
      {visibleFloors.map((floor) => {
        const floorIdx = floor.index ?? 0
        const elevation = floor.elevation ?? floor.height ?? (floorIdx * 3.0)
        const isTopFloor = floorIdx === maxFloorIndex
        const showRoof = layerVisibility?.roof && isTopFloor && (activeFloorIndex === -1 || activeFloorIndex === floorIdx) && floor.roof?.visible !== false

        return (
          <group key={`floor-${floorIdx}`} position={[0, elevation, 0]}>
            {/* Floor Slab Mesh */}
            <FloorSlabMesh slabGeometry={floor.slabGeometry} floorIdx={floorIdx} />

            {/* Rooms Mesh */}
            {floor.rooms
              .filter((r) => r.visible !== false)
              .map((room) => (
                <RoomMesh
                  key={`room-${room.id}`}
                  room={room}
                  isSelected={selectedObjectId === room.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    selectObject(room.id, 'room')
                  }}
                />
              ))}

            {/* Wall Meshes */}
            {layerVisibility?.walls &&
              floor.walls
                .filter((w) => w.visible !== false)
                .map((wall) => (
                  <WallMesh
                    key={`wall-${wall.id}`}
                    wall={wall}
                    isSelected={selectedObjectId === wall.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectObject(wall.id, 'wall')
                    }}
                  />
                ))}

            {/* Furniture Procedural 3D Objects */}
            {layerVisibility?.furniture &&
              floor.rooms
                .filter((r) => r.visible !== false)
                .flatMap((room) =>
                  (room.furniture || [])
                    .filter((f) => f.visible !== false)
                    .map((furn) => (
                      <FurnitureProceduralMesh
                        key={`furn-${furn.id}`}
                        furniture={furn}
                        isSelected={selectedObjectId === furn.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          selectObject(furn.id, 'furniture')
                        }}
                      />
                    ))
                )}

            {/* Roof Structure */}
            {showRoof && floor.roof && (
              <RoofMesh
                roof={floor.roof}
                rooms={floor.rooms}
                wallHeight={floor.floorToFloorHeight || 3.0}
                isSelected={selectedObjectId === (floor.roof.id || 'roof')}
                onClick={(e) => {
                  e.stopPropagation()
                  selectObject(floor.roof.id || 'roof', 'roof')
                }}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

function FloorSlabMesh({ slabGeometry, floorIdx }) {
  const geometries = useMemo(() => {
    if (slabGeometry && slabGeometry.length > 0) {
      return slabGeometry.map((slab) => {
        const shape = new THREE.Shape()
        const outerCoords = [...slab.outerRing]
        if (outerCoords.length > 3 && outerCoords[0][0] === outerCoords[outerCoords.length - 1][0] && outerCoords[0][1] === outerCoords[outerCoords.length - 1][1]) {
          outerCoords.pop()
        }
        const outerPts = outerCoords.map((p) => new THREE.Vector2(p[0], -p[1]))
        shape.moveTo(outerPts[0].x, outerPts[0].y)
        for (let i = 1; i < outerPts.length; i++) {
          shape.lineTo(outerPts[i].x, outerPts[i].y)
        }
        shape.closePath()
        return new THREE.ExtrudeGeometry(shape, { depth: 0.2, bevelEnabled: false })
      })
    }
    return []
  }, [slabGeometry])

  return (
    <group position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {geometries.map((geo, idx) => (
        <mesh key={`slab-${idx}`} receiveShadow castShadow geometry={geo}>
          <meshStandardMaterial color={floorIdx > 0 ? '#427f6d' : '#2f5d50'} roughness={0.7} metalness={0.1} />
        </mesh>
      ))}
    </group>
  )
}

function RoomMesh({ room, isSelected, onClick }) {
  const geometry = useMemo(() => {
    if (!room.polygon || room.polygon.length < 3) return null
    const shape = new THREE.Shape()
    const rCoords = [...room.polygon]
    if (rCoords.length > 3 && rCoords[0][0] === rCoords[rCoords.length - 1][0] && rCoords[0][1] === rCoords[rCoords.length - 1][1]) {
      rCoords.pop()
    }
    const outerPts = rCoords.map((p) => new THREE.Vector2(p[0], -p[1]))
    shape.moveTo(outerPts[0].x, outerPts[0].y)
    for (let i = 1; i < outerPts.length; i++) {
      shape.lineTo(outerPts[i].x, outerPts[i].y)
    }
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false })
  }, [room.polygon])

  if (!geometry) return null
  const colorHex = room.color || ROOM_COLORS[room.type] || '#427f6d'

  return (
    <mesh
      geometry={geometry}
      position={[0, 0.003, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={onClick}
      receiveShadow
    >
      <meshStandardMaterial
        color={colorHex}
        roughness={0.8}
        emissive={isSelected ? new THREE.Color('#b8934f') : new THREE.Color('#000000')}
        emissiveIntensity={isSelected ? 0.45 : 0}
      />
    </mesh>
  )
}

function WallMesh({ wall, isSelected, onClick }) {
  const sp = wall.startPoint
  const ep = wall.endPoint
  const dx = ep[0] - sp[0]
  const dz = ep[1] - sp[1]
  const len = Math.sqrt(dx * dx + dz * dz)
  const angle = Math.atan2(dz, dx)
  const midX = (sp[0] + ep[0]) / 2
  const midZ = (sp[1] + ep[1]) / 2

  const wallColor = wall.color || (wall.isExterior ? '#244a3f' : '#386e5f')

  return (
    <group position={[midX, wall.height / 2, midZ]} rotation={[0, -angle, 0]} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[len, wall.height, wall.thickness || 0.2]} />
        <meshStandardMaterial
          color={wallColor}
          roughness={0.7}
          emissive={isSelected ? new THREE.Color('#b8934f') : new THREE.Color('#000000')}
          emissiveIntensity={isSelected ? 0.45 : 0}
        />
      </mesh>
    </group>
  )
}

function FurnitureProceduralMesh({ furniture, isSelected, onClick }) {
  const dims = FURNITURE_DIMENSIONS[furniture.type] || { w: 1, d: 1, h: 0.8 }
  const pos = furniture.position || [0, 0, 0]
  const rot = furniture.rotation || [0, 0, 0]
  const ry = ((rot[1] || 0) * Math.PI) / 180

  return (
    <group position={[pos[0], dims.h / 2, pos[2] ?? pos[1]]} rotation={[0, ry, 0]} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[dims.w, dims.h, dims.d]} />
        <meshStandardMaterial
          color={furniture.color || '#386e5f'}
          roughness={0.6}
          emissive={isSelected ? new THREE.Color('#b8934f') : new THREE.Color('#000000')}
          emissiveIntensity={isSelected ? 0.45 : 0}
        />
      </mesh>
    </group>
  )
}

function RoofMesh({ roof, rooms, wallHeight, isSelected, onClick }) {
  const roofData = useMemo(() => {
    const allPts = rooms.flatMap((r) => r.polygon || [])
    if (allPts.length < 3) return null
    const minX = Math.min(...allPts.map((p) => p[0]))
    const maxX = Math.max(...allPts.map((p) => p[0]))
    const minZ = Math.min(...allPts.map((p) => p[1]))
    const maxZ = Math.max(...allPts.map((p) => p[1]))
    const overhang = roof?.overhang ?? 0.6
    const w = maxX - minX + overhang * 2
    const d = maxZ - minZ + overhang * 2
    const cx = (minX + maxX) / 2
    const cz = (minZ + maxZ) / 2
    return { w, d, cx, cz }
  }, [rooms, roof])

  if (!roofData) return null

  return (
    <group position={[roofData.cx, wallHeight + 0.1, roofData.cz]} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[roofData.w, roof.height || 0.4, roofData.d]} />
        <meshStandardMaterial
          color={roof.color || '#244a3f'}
          roughness={0.6}
          emissive={isSelected ? new THREE.Color('#b8934f') : new THREE.Color('#000000')}
          emissiveIntensity={isSelected ? 0.45 : 0}
        />
      </mesh>
    </group>
  )
}
