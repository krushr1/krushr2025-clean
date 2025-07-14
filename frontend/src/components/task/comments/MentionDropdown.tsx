
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar'
import { cn } from '../../../lib/utils'

interface MentionItem {
  id: string
  label: string
  email: string
  avatar?: string
}

interface MentionDropdownProps {
  items: MentionItem[]
  command: (item: MentionItem) => void
  className?: string
}

export class MentionDropdown {
  items: MentionItem[]
  command: (item: MentionItem) => void
  element: HTMLElement
  selectedIndex: number

  constructor({ items, command }: { items: MentionItem[], command: (item: MentionItem) => void }) {
    this.items = items
    this.command = command
    this.selectedIndex = 0
    this.element = this.createElement()
  }

  createElement() {
    const element = document.createElement('div')
    element.className = 'mention-dropdown bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] max-w-[300px] z-50'
    this.render()
    return element
  }

  render() {
    if (this.items.length === 0) {
      this.element.innerHTML = `
        <div class="px-3 py-2 text-sm text-gray-500 font-manrope">
          No users found
        </div>
      `
      return
    }

    this.element.innerHTML = this.items
      .map((item, index) => {
        const isSelected = index === this.selectedIndex
        const initials = item.label.split(' ').map(n => n[0]).join('').toUpperCase()
        
        return `
          <div class="mention-item flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${
            isSelected ? 'bg-krushr-primary/10' : ''
          }" data-index="${index}">
            <div class="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-medium">
              ${item.avatar ? 
                `<img src="${item.avatar}" alt="${item.label}" class="w-full h-full object-cover" />` :
                `<span class="text-gray-600">${initials}</span>`
              }
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate font-manrope">${item.label}</div>
              <div class="text-xs text-gray-500 truncate font-manrope">${item.email}</div>
            </div>
          </div>
        `
      })
      .join('')

    this.element.querySelectorAll('.mention-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectItem(index)
      })
    })
  }

  updateProps(props: { items: MentionItem[] }) {
    this.items = props.items
    this.selectedIndex = 0
    this.render()
  }

  onKeyDown({ event }: { event: KeyboardEvent }) {
    if (event.key === 'ArrowUp') {
      this.upHandler()
      return true
    }

    if (event.key === 'ArrowDown') {
      this.downHandler()
      return true
    }

    if (event.key === 'Enter') {
      this.enterHandler()
      return true
    }

    return false
  }

  upHandler() {
    this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length
    this.render()
  }

  downHandler() {
    this.selectedIndex = (this.selectedIndex + 1) % this.items.length
    this.render()
  }

  enterHandler() {
    this.selectItem(this.selectedIndex)
  }

  selectItem(index: number) {
    const item = this.items[index]
    if (item) {
      this.command(item)
    }
  }

  destroy() {
    this.element.remove()
  }
}

export const MentionDropdownComponent = forwardRef<
  HTMLDivElement,
  MentionDropdownProps
>(({ items, command, className }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((prev) => (prev + items.length - 1) % items.length)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % items.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = items[selectedIndex]
      if (item) {
        command(item)
      }
    }
  }

  const handleItemClick = (item: MentionItem) => {
    command(item)
  }

  if (items.length === 0) {
    return (
      <div 
        ref={ref}
        className={cn(
          "bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] max-w-[300px] z-50",
          className
        )}
      >
        <div className="px-3 py-2 text-sm text-gray-500 font-manrope">
          No users found
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={ref}
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] max-w-[300px] z-50",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors",
            index === selectedIndex && "bg-krushr-primary/10"
          )}
          onClick={() => handleItemClick(item)}
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={item.avatar} alt={item.label} />
            <AvatarFallback className="text-xs font-medium">
              {item.label.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate font-manrope">
              {item.label}
            </div>
            <div className="text-xs text-gray-500 truncate font-manrope">
              {item.email}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

MentionDropdownComponent.displayName = 'MentionDropdownComponent'