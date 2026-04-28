'use client'

import { useState, useCallback, useRef } from 'react'
import { GripVertical } from 'lucide-react'

interface DraggableGridProps {
  items: any[]
  onReorder: (newOrder: any[]) => void
  renderItem: (item: any, dragHandle: React.ReactNode, isDragging: boolean) => React.ReactNode
  keyExtractor: (item: any) => string
  className?: string
}

export default function DraggableGrid({ items, onReorder, renderItem, keyExtractor, className = '' }: DraggableGridProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const dragItem = useRef<any>(null)

  const handleDragStart = useCallback((e: React.DragEvent, item: any) => {
    dragItem.current = item
    setDraggingId(keyExtractor(item))
    e.dataTransfer.effectAllowed = 'move'
    const ghost = document.createElement('div')
    ghost.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;'
    document.body.appendChild(ghost)
    e.dataTransfer.setDragImage(ghost, 0, 0)
    requestAnimationFrame(() => document.body.removeChild(ghost))
  }, [keyExtractor])

  const handleDragOver = useCallback((e: React.DragEvent, item: any) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const k = keyExtractor(item)
    if (k !== overId) setOverId(k)
  }, [keyExtractor, overId])

  const handleDrop = useCallback((e: React.DragEvent, targetItem: any) => {
    e.preventDefault()
    if (!dragItem.current) return
    const fromKey = keyExtractor(dragItem.current)
    const toKey = keyExtractor(targetItem)
    if (fromKey === toKey) { setDraggingId(null); setOverId(null); return }
    const arr = [...items]
    const fromIdx = arr.findIndex(i => keyExtractor(i) === fromKey)
    const toIdx = arr.findIndex(i => keyExtractor(i) === toKey)
    const [removed] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, removed)
    onReorder(arr)
    setDraggingId(null); setOverId(null); dragItem.current = null
  }, [items, onReorder, keyExtractor])

  const handleDragEnd = useCallback(() => {
    setDraggingId(null); setOverId(null); dragItem.current = null
  }, [])

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ${className}`}>
      {items.map(item => {
        const key = keyExtractor(item)
        const isDragging = draggingId === key
        const isOver = overId === key && draggingId !== key

        // Compact drag handle — sits inline with the type pill, not its own wide block
        const dragHandle = (
          <div
            className="drag-handle inline-flex items-center justify-center w-5 h-5 rounded-lg cursor-grab active:cursor-grabbing opacity-100 lg:opacity-0 lg:group-hover:opacity-60 hover:!opacity-100 transition-opacity shrink-0"
            style={{ color: 'var(--text-faint)' }}
            title="Drag to reorder"
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <GripVertical size={11} />
          </div>
        )

        return (
          <div
            key={key}
            draggable
            onDragStart={e => handleDragStart(e, item)}
            onDragOver={e => handleDragOver(e, item)}
            onDrop={e => handleDrop(e, item)}
            onDragEnd={handleDragEnd}
            style={{
              opacity: isDragging ? 0.35 : 1,
              transition: 'opacity 0.15s ease, transform 0.15s ease',
              transform: isOver ? 'scale(1.015)' : 'scale(1)',
              outline: isOver ? '2px solid rgba(124,108,242,0.45)' : 'none',
              outlineOffset: '2px',
              borderRadius: isOver ? '16px' : '0',
            }}
          >
            {renderItem(item, dragHandle, isDragging)}
          </div>
        )
      })}
    </div>
  )
}
