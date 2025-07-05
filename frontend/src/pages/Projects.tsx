import { useState } from 'react'
import Layout from '../components/project/Layout'
import { useAuthStore } from '../stores/auth-store'
import { trpc } from '../lib/trpc'
import { FloatingInput } from '../components/ui/floating-input'
import { Plus, Search, Calendar, Users, Activity, MoreVertical, Loader2 } from 'lucide-react'

/**
 * Projects page component for managing multiple projects
 * Displays project overview, progress, and team assignments
 */
export default function Projects() {
  const { isAuthenticated } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const { data: projects = [], isLoading } = trpc.project.getAll.useQuery()
  const { data: teams = [] } = trpc.team.getAll.useQuery()
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null
  }
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading projects...</p>
          </div>
        </div>
      </Layout>
    )
  }
  
  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'planning':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }
  
  const getProjectColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
    return colors[index % colors.length]
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-1">Manage and track all your projects</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 z-20" />
              <FloatingInput
                id="search"
                type="text"
                label="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {/* Project Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredProjects.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Projects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status.toLowerCase() === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.status.toLowerCase() === 'completed').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Team Members</p>
                  <p className="text-2xl font-bold text-gray-900">{teams.reduce((total, team) => total + (team.members?.length || 0), 0)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No projects found matching your criteria.</p>
              </div>
            ) : (
              filteredProjects.map((project, index) => (
              <div key={project.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${getProjectColor(index)} flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">
                        {project.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4">{project.description}</p>

                {/* Tasks and Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {project.endDate ? formatDate(project.endDate) : 'No due date'}
                    </div>
                  </div>
                  <div className="flex -space-x-1">
                    {project.team?.members?.slice(0, 3).map((member, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center"
                      >
                        <span className="text-white text-xs font-medium">
                          {member.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                        </span>
                      </div>
                    )) || (
                      <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                        <span className="text-gray-600 text-xs">No team</span>
                      </div>
                    )}
                    {(project.team?.members?.length || 0) > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center">
                        <span className="text-gray-600 text-xs">+{(project.team?.members?.length || 0) - 3}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}