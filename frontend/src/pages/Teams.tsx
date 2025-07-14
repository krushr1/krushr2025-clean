import { useState } from 'react'
import Layout from '../components/project/Layout'
import { useAuthStore } from '../stores/auth-store'
import { trpc } from '../lib/trpc'
import { FloatingInput } from '../components/ui/floating-input'
import { Plus, Search, Mail, MapPin, MoreVertical, Loader2 } from 'lucide-react'

export default function Teams() {
  const { isAuthenticated, user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  
  const { data: teams = [], isLoading: teamsLoading } = trpc.team.getAll.useQuery()
  const { data: workspaces = [] } = trpc.workspace.getAll.useQuery()
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null
  }
  
  if (teamsLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading teams...</p>
          </div>
        </div>
      </Layout>
    )
  }
  
  const allMembers = teams.flatMap(team => 
    team.members?.map(member => ({
      ...member,
      teamName: team.name,
      teamId: team.id
    })) || []
  )
  
  const filteredMembers = allMembers.filter(member => {
    const matchesSearch = member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTeam = teamFilter === 'all' || member.teamId === teamFilter
    return matchesSearch && matchesTeam
  })
  
  const getTeamColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
    return colors[index % colors.length]
  }
  
  const getMemberColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500']
    return colors[index % colors.length]
  }

  return (
    <Layout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
              <p className="text-gray-600 mt-1">Manage your team members and collaboration</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </button>
          </div>

          {/* Search and Filter */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 z-20" />
              <FloatingInput
                id="search"
                type="text"
                label="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select 
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {/* Team Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {teams.map((team, index) => (
              <div key={team.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${getTeamColor(index)} flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">
                      {team.name.split(' ').map(word => word[0]).join('')}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{team.description || 'No description available'}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{team.members?.length || 0} Members</span>
                  <span className="text-gray-500">{team.projects?.length || 0} Projects</span>
                </div>
              </div>
            ))}
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No team members found matching your criteria.
                </div>
              ) : (
                filteredMembers.map((member, index) => (
                  <div key={`${member.teamId}-${member.user?.id}`} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full ${getMemberColor(index)} flex items-center justify-center relative`}>
                          {member.user?.avatar ? (
                            <img 
                              src={member.user.avatar} 
                              alt={member.user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium">
                              {member.user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                            </span>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.user?.name || 'Unknown User'}</h3>
                          <p className="text-gray-600 text-sm">{member.role?.charAt(0).toUpperCase() + member.role?.slice(1) || 'Member'}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-gray-500 text-sm">
                              <Mail className="w-3 h-3 mr-1" />
                              {member.user?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                          {member.teamName}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}