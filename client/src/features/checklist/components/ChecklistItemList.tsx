import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import type { ChecklistItemDto } from '../types/checklist.types'

type ChecklistItemListProps = {
  items: ChecklistItemDto[]
  readonly?: boolean
  togglingItemId?: number | null
  onDelete?: (item: ChecklistItemDto) => void
  onEdit?: (item: ChecklistItemDto) => void
  onToggle?: (item: ChecklistItemDto) => void
}

function ChecklistItemList({
  items,
  onDelete,
  onEdit,
  onToggle,
  readonly = false,
  togglingItemId = null,
}: ChecklistItemListProps) {
  return (
    <Card className="overflow-hidden">
      <ul className="m-0 divide-y divide-slate-100 p-0">
        {items.map((item) => {
          const inputId = `checklist-item-${item.id}`
          const isToggling = togglingItemId === item.id

          return (
            <li
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={item.id}
            >
              <label
                className={[
                  'flex min-w-0 flex-1 items-start gap-3',
                  readonly ? 'cursor-default' : 'cursor-pointer',
                ]
                  .filter(Boolean)
                  .join(' ')}
                htmlFor={inputId}
              >
                <input
                  checked={item.isCompleted}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 disabled:cursor-not-allowed"
                  disabled={readonly || isToggling}
                  id={inputId}
                  onChange={() => onToggle?.(item)}
                  type="checkbox"
                />
                <span
                  className={[
                    'text-sm font-semibold text-slate-900',
                    item.isCompleted ? 'text-slate-400 line-through' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {item.text}
                </span>
              </label>

              {!readonly ? (
                <div className="flex justify-end gap-2 sm:pl-4">
                  <Button onClick={() => onEdit?.(item)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => onDelete?.(item)} variant="ghost">
                    Delete
                  </Button>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

export default ChecklistItemList
