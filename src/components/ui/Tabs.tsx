export interface TabItem<T extends string> {
  id: T
  label: string
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: TabItem<T>[]
  activeTab: T
  onChange: (tab: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          className={`border-b-2 px-3 py-3 text-sm font-bold transition ${
            activeTab === tab.id
              ? 'border-[#1f6f5f] text-[#1f6f5f]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
          key={tab.id}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
