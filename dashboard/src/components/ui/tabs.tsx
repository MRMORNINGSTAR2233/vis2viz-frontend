import * as React from "react"
import { cva } from "class-variance-authority"

const tabsRootClasses = "flex flex-col gap-2 w-full"
const tabsListClasses = "flex border-b border-white/10"
const tabsTriggerVariants = cva(
  "px-4 py-2 text-sm font-medium transition-colors -mb-px",
  {
    variants: {
      state: {
        active: "text-primary-400 border-b-2 border-primary-400",
        inactive: "text-white/60 hover:text-white border-b-2 border-transparent"
      }
    },
    defaultVariants: {
      state: "inactive"
    }
  }
)
const tabsContentClasses = "pt-4"

export interface TabsProps {
  defaultValue: string
  tabs: {
    value: string
    label: string
    content: React.ReactNode
  }[]
  className?: string
}

export function Tabs({ defaultValue, tabs, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  return (
    <div className={`${tabsRootClasses} ${className}`}>
      <div className={tabsListClasses}>
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={tabsTriggerVariants({
              state: activeTab === tab.value ? "active" : "inactive"
            })}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={tabsContentClasses}>
        {tabs.find(tab => tab.value === activeTab)?.content}
      </div>
    </div>
  )
} 