/**
 * Global Search Component
 * Search across workspaces, projects, tasks, and more
 */

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { 
  Search, 
  X, 
  Loader2,
  FileText,
  CheckSquare,
  Users,
  Folder,
  Calendar,
  MessageSquare,
  Hash
} from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from '../ui/dialog'
import { FloatingInput } from '../ui/floating-input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'
import { Command } from 'cmdk'

interface GlobalSearchProps {
  open: boolean
  onClose: () => void
}

export default function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Search queries
  const { data: searchResults, isLoading } = trpc.search.global.useQuery(
    { query },
    { 
      enabled: query.length > 2,
      debounceMs: 300 
    }
  )

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  // Focus input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckSquare className="w-4 h-4" />
      case 'project': return <Folder className="w-4 h-4" />
      case 'team': return <Users className="w-4 h-4" />
      case 'workspace': return <Hash className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'event': return <Calendar className="w-4 h-4" />
      case 'message': return <MessageSquare className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-700'
      case 'project': return 'bg-purple-100 text-purple-700'
      case 'team': return 'bg-green-100 text-green-700'
      case 'workspace': return 'bg-gray-100 text-gray-700'
      case 'document': return 'bg-orange-100 text-orange-700'
      case 'event': return 'bg-red-100 text-red-700'
      case 'message': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleSelect = (result: any) => {
    // Navigate based on result type
    switch (result.type) {
      case 'task':
        navigate(`/board?task=${result.id}`)
        break
      case 'project':
        navigate(`/projects/${result.id}`)
        break
      case 'team':
        navigate(`/teams/${result.id}`)
        break
      case 'workspace':
        navigate(`/workspaces/${result.id}`)
        break
      default:
        break
    }
    onClose()
  }

  const allResults = [
    ...(searchResults?.tasks || []).map(t => ({ ...t, type: 'task' })),
    ...(searchResults?.projects || []).map(p => ({ ...p, type: 'project' })),
    ...(searchResults?.teams || []).map(t => ({ ...t, type: 'team' })),
    ...(searchResults?.workspaces || []).map(w => ({ ...w, type: 'workspace' })),
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <Command className="rounded-lg shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <FloatingInput
              ref={inputRef}
              label="Search everything"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 border-0 focus:ring-0"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}

            {!isLoading && query.length > 2 && allResults.length === 0 && (
              <div className="py-6 text-center text-sm text-gray-500">
                No results found for "{query}"
              </div>
            )}

            {!isLoading && query.length <= 2 && (
              <div className="py-6 text-center text-sm text-gray-500">
                Type at least 3 characters to search
              </div>
            )}

            {!isLoading && allResults.length > 0 && (
              <>
                {/* Tasks */}
                {searchResults?.tasks && searchResults.tasks.length > 0 && (
                  <Command.Group heading="Tasks">
                    {searchResults.tasks.map((task, index) => (
                      <Command.Item
                        key={task.id}
                        value={task.id}
                        onSelect={() => handleSelect({ ...task, type: 'task' })}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer",
                          "hover:bg-gray-100",
                          selectedIndex === index && "bg-gray-100"
                        )}
                      >
                        <div className={cn("p-1 rounded", getTypeColor('task'))}>
                          {getIcon('task')}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{task.title}</p>
                          {task.project && (
                            <p className="text-xs text-gray-500">
                              in {task.project.name}
                            </p>
                          )}
                        </div>
                        {task.status && (
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Projects */}
                {searchResults?.projects && searchResults.projects.length > 0 && (
                  <Command.Group heading="Projects">
                    {searchResults.projects.map((project) => (
                      <Command.Item
                        key={project.id}
                        value={project.id}
                        onSelect={() => handleSelect({ ...project, type: 'project' })}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer",
                          "hover:bg-gray-100"
                        )}
                      >
                        <div className={cn("p-1 rounded", getTypeColor('project'))}>
                          {getIcon('project')}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{project.name}</p>
                          {project.description && (
                            <p className="text-xs text-gray-500">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Teams */}
                {searchResults?.teams && searchResults.teams.length > 0 && (
                  <Command.Group heading="Teams">
                    {searchResults.teams.map((team) => (
                      <Command.Item
                        key={team.id}
                        value={team.id}
                        onSelect={() => handleSelect({ ...team, type: 'team' })}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm cursor-pointer",
                          "hover:bg-gray-100"
                        )}
                      >
                        <div className={cn("p-1 rounded", getTypeColor('team'))}>
                          {getIcon('team')}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{team.name}</p>
                          {team._count?.members && (
                            <p className="text-xs text-gray-500">
                              {team._count.members} members
                            </p>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </>
            )}
          </Command.List>

          <div className="border-t px-3 py-2">
            <p className="text-xs text-gray-500">
              Press <kbd className="rounded bg-gray-100 px-1">↑</kbd>{' '}
              <kbd className="rounded bg-gray-100 px-1">↓</kbd> to navigate,{' '}
              <kbd className="rounded bg-gray-100 px-1">Enter</kbd> to select,{' '}
              <kbd className="rounded bg-gray-100 px-1">Esc</kbd> to close
            </p>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}