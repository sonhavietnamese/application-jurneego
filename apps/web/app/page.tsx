import Interactive from '@/components/interactive/interactive'
import Sidebar from '@/components/sidebar/sidebar'

export default function Page() {
  return (
    <main className="relative w-screen overflow-hidden grid grid-cols-[360px_1fr] gap-4 bg-background p-4 h-screen text-[#373737] background-dot bg-size-[20px_20px] font-sans">
      <Sidebar />

      <Interactive />
    </main>
  )
}
