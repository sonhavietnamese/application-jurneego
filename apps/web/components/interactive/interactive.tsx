import ZoneChat from './zone-chat'
import ZoneDraw from './zone-draw'

export default function Interactive() {
  return (
    <section className="w-full h-full grid grid-cols-5 gap-4 overflow-hidden">
      <ZoneChat />
      <ZoneDraw />
    </section>
  )
}
