
import React, { useState, useRef, useEffect } from 'react'
import { Button } from '../ui/button'
import { FloatingInput } from '../ui/floating-input'
import { ScrollArea } from '../ui/scroll-area'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { 
  Plus,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  Building,
  Star,
  MoreHorizontal,
  Edit3,
  MessageCircle,
  Calendar,
  GripVertical
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { trpc } from '../../lib/trpc'

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  position?: string
  location?: string
  tags: string[]
  isFavorite: boolean
  avatar?: string
  lastContact: string
  notes?: string
}

interface ContactsProps {
  workspaceId?: string
  className?: string
}

export default function Contacts({ workspaceId, className }: ContactsProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [leftPaneWidth, setLeftPaneWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)

  const mockContacts: Contact[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@techcorp.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Solutions',
      position: 'Senior Product Manager',
      location: 'San Francisco, CA',
      tags: ['client', 'product'],
      isFavorite: true,
      avatar: 'AJ',
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Key stakeholder for Q2 product launch. Prefers morning meetings.'
    },
    {
      id: '2',
      name: 'Bob Chen',
      email: 'b.chen@designstudio.co',
      phone: '+1 (555) 987-6543',
      company: 'Design Studio Co',
      position: 'Creative Director',
      location: 'New York, NY',
      tags: ['partner', 'design'],
      isFavorite: false,
      avatar: 'BC',
      lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Excellent collaboration on branding projects. Very detail-oriented.'
    },
    {
      id: '3',
      name: 'Carol Smith',
      email: 'carol@startup.io',
      phone: '+1 (555) 456-7890',
      company: 'Startup.io',
      position: 'Co-Founder & CEO',
      location: 'Austin, TX',
      tags: ['investor', 'startup'],
      isFavorite: true,
      avatar: 'CS',
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Interested in strategic partnership. Follow up on Q3 roadmap.'
    },
    {
      id: '4',
      name: 'David Rodriguez',
      email: 'david.r@consultancy.com',
      phone: '+1 (555) 321-0987',
      company: 'Business Consultancy',
      position: 'Senior Consultant',
      location: 'Chicago, IL',
      tags: ['consultant', 'strategy'],
      isFavorite: false,
      avatar: 'DR',
      lastContact: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Provided excellent market analysis. Available for future projects.'
    }
  ]

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const selectedContactData = mockContacts.find(contact => contact.id === selectedContact)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = e.clientX - containerRect.left
      const minWidth = 240
      const maxWidth = containerRect.width * 0.7
      
      setLeftPaneWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)))
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  useEffect(() => {
    if (filteredContacts.length > 0 && !selectedContact) {
      setSelectedContact(filteredContacts[0].id)
    }
  }, [filteredContacts, selectedContact])

  return (
    <div ref={containerRef} className={cn("flex h-full bg-krushr-gray-50", className)}>
      {/* Left Pane - Contacts List */}
      <div style={{ width: leftPaneWidth }} className="flex-shrink-0">
        <div className="flex flex-col h-full bg-white">
        {/* Header */}
        <div className="p-4 border-b border-krushr-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm text-krushr-gray-900">Contacts</h3>
            <button 
              className="bg-krushr-primary text-white px-3 h-8 rounded-button text-sm font-medium hover:bg-krushr-coral-red transition-all duration-200 shadow-elevation-sm hover:shadow-elevation-md flex items-center justify-center flex-shrink-0"
              title="Create new contact"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative flex-1 mr-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-krushr-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 h-8 text-base font-manrope border border-krushr-gray-300 rounded-lg bg-white focus:border-krushr-primary focus:ring-2 focus:ring-krushr-primary-100 focus:shadow-elevation-sm transition-all duration-200 outline-none relative z-20 placeholder:text-krushr-gray-400 placeholder:font-manrope"
            />
          </div>
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1">
          <div className="p-1">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className={cn(
                  "border rounded-lg p-3 cursor-pointer transition-all duration-200 mb-1",
                  selectedContact === contact.id 
                    ? "border-2 border-krushr-primary shadow-lg bg-gradient-to-r from-krushr-primary-50 to-white ring-2 ring-krushr-primary/20 transform scale-[1.02]" 
                    : "border border-krushr-gray-200 hover:border-krushr-primary hover:shadow-md hover:bg-krushr-gray-50/50"
                )}
                onClick={() => setSelectedContact(contact.id)}
              >
                <div className="flex items-start gap-2">
                  <Avatar className="w-8 h-8 mt-0.5">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                      {contact.avatar || contact.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium truncate flex-1 font-manrope",
                        selectedContact === contact.id
                          ? "text-krushr-primary font-semibold"
                          : "text-krushr-gray-900"
                      )}>
                        {contact.name}
                      </h3>
                      {contact.isFavorite && (
                        <Star className="w-3 h-3 text-krushr-warning fill-current flex-shrink-0" />
                      )}
                    </div>
                    
                    <div 
                      className="text-sm font-brand text-krushr-gray-600 line-clamp-2 mb-2 leading-relaxed"
                    >
                      {contact.position && contact.company 
                        ? `${contact.position} at ${contact.company}`
                        : contact.company || contact.email
                      }
                    </div>

                    <div className="flex items-center justify-between text-xs font-brand text-krushr-gray-400">
                      <span>{formatDate(contact.lastContact)}</span>
                      <div className="flex items-center space-x-2">
                        {contact.tags.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span>{contact.tags.length} tags</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {contact.tags.slice(0, 2).map((tag) => (
                    <div key={tag} className="inline-flex items-center rounded-full border py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs h-4 px-1">
                      {tag}
                    </div>
                  ))}
                  {contact.tags.length > 2 && (
                    <span className="text-xs text-krushr-gray-400">+{contact.tags.length - 2}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        </div>
      </div>

      {/* Resizer */}
      <div
        ref={resizerRef}
        className={cn(
          "w-1 bg-krushr-gray-200 hover:bg-krushr-primary transition-colors cursor-col-resize relative group",
          isResizing && "bg-krushr-primary"
        )}
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
          <GripVertical className="w-3 h-3 text-krushr-gray-400 group-hover:text-krushr-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Right Pane - Contact Details */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedContactData ? (
          <>
            {/* Contact Header */}
            <div className="border-b border-krushr-gray-200 p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1 mr-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                      {selectedContactData.avatar || selectedContactData.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-base font-brand font-semibold text-krushr-gray-800 flex-1 mr-4">
                        {selectedContactData.name}
                      </h1>
                      {selectedContactData.isFavorite && <Star className="w-4 h-4 text-krushr-warning fill-current" />}
                    </div>
                    
                    {selectedContactData.position && selectedContactData.company && (
                      <p className="text-sm text-krushr-gray-600 mb-1">
                        {selectedContactData.position} at {selectedContactData.company}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-krushr-gray-500">
                      <span>Last contact: {formatDate(selectedContactData.lastContact)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button className="bg-krushr-primary text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-krushr-primary-700 transition-colors shadow-elevation-sm hover:shadow-elevation-md flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4">
                <div className="space-y-4">
                  {/* Contact Details */}
                  <div>
                    <h3 className="text-sm font-medium text-krushr-gray-900 mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-krushr-gray-400" />
                        <span className="text-krushr-gray-900">{selectedContactData.email}</span>
                      </div>
                      
                      {selectedContactData.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-krushr-gray-400" />
                          <span className="text-krushr-gray-900">{selectedContactData.phone}</span>
                        </div>
                      )}
                      
                      {selectedContactData.company && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4 text-krushr-gray-400" />
                          <span className="text-krushr-gray-900">{selectedContactData.company}</span>
                        </div>
                      )}
                      
                      {selectedContactData.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-krushr-gray-400" />
                          <span className="text-krushr-gray-900">{selectedContactData.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedContactData.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-krushr-gray-900 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-1">
                        {selectedContactData.tags.map((tag) => (
                          <div key={tag} className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedContactData.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-krushr-gray-900 mb-2">Notes</h3>
                      <div 
                        className="text-sm text-krushr-gray-700 font-brand leading-relaxed max-w-none prose prose-sm prose-headings:text-krushr-gray-800 prose-p:text-sm prose-p:text-krushr-gray-700 prose-p:font-brand prose-li:text-sm prose-li:text-krushr-gray-700 cursor-pointer hover:bg-krushr-gray-50 rounded-lg p-3 transition-colors border border-transparent hover:border-krushr-gray-200" 
                        title="Click to edit notes"
                      >
                        {selectedContactData.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-krushr-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-krushr-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-krushr-gray-400" />
              </div>
              <p className="text-base font-brand font-medium text-krushr-gray-700 mb-2">Select a contact to view</p>
              <p className="text-sm font-brand text-krushr-gray-500">Choose a contact from the list to start viewing details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}