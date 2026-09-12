import HorizontalTimeline from './HorizontalTimeline'

export default function Timeline({ stages, onSelect, selected }) {
  return <HorizontalTimeline stages={stages} onSelect={onSelect} selected={selected} />
}
