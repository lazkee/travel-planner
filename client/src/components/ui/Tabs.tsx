export type TabItem = {
  id: string
  label: string
}

type TabsProps = {
  activeTab: string
  tabs: TabItem[]
  onChange: (tabId: string) => void
}

function Tabs({ activeTab, onChange, tabs }: TabsProps) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab

          return (
            <button
              className={[
                'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-extrabold transition',
                isActive
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900',
              ]
                .filter(Boolean)
                .join(' ')}
              key={tab.id}
              onClick={() => onChange(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default Tabs
