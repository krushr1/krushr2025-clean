import Layout from '../components/project/Layout'
import { Edit3, Mail, MapPin, Calendar, Activity } from 'lucide-react'

export default function Profile() {
  const userStats = [
    { label: 'Tasks Completed', value: '147', color: 'bg-green-100 text-green-800' },
    { label: 'Projects Active', value: '8', color: 'bg-blue-100 text-blue-800' },
    { label: 'Team Members', value: '12', color: 'bg-purple-100 text-purple-800' },
    { label: 'Hours Logged', value: '284', color: 'bg-orange-100 text-orange-800' }
  ]

  const recentActivity = [
    {
      id: 1,
      action: 'Completed task',
      target: 'Birthday Cake Planning',
      time: '2 hours ago',
      color: 'bg-green-500'
    },
    {
      id: 2,
      action: 'Added comment to',
      target: 'New MVP Build',
      time: '4 hours ago',
      color: 'bg-blue-500'
    },
    {
      id: 3,
      action: 'Created new project',
      target: 'Website Redesign',
      time: '1 day ago',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      action: 'Assigned task to',
      target: 'Blaine Cottrell',
      time: '2 days ago',
      color: 'bg-orange-500'
    }
  ]

  return (
    <Layout>
      <div className="h-full overflow-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">LJ</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Lisa Jackson</h1>
                  <p className="text-gray-600 text-lg">Team Lead & Project Manager</p>
                  <div className="flex items-center space-x-4 mt-2 text-gray-500">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      <span className="text-sm">lisa.jackson@company.com</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">San Francisco, CA</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">Joined March 2021</span>
                    </div>
                  </div>
                </div>
              </div>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {userStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`mx-auto w-16 h-16 rounded-full ${stat.color} flex items-center justify-center mb-2`}>
                        <span className="text-xl font-bold">{stat.value}</span>
                      </div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full ${activity.color} flex items-center justify-center`}>
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          {activity.action} <span className="font-medium">{activity.target}</span>
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Project Management', level: 95 },
                    { name: 'Team Leadership', level: 90 },
                    { name: 'Strategic Planning', level: 85 },
                    { name: 'Communication', level: 92 }
                  ].map((skill, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                        <span className="text-sm text-gray-500">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Projects */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Projects</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Birthday Event Planning', progress: 75, color: 'bg-blue-500' },
                    { name: 'New MVP Development', progress: 45, color: 'bg-green-500' },
                    { name: 'Website Redesign', progress: 20, color: 'bg-purple-500' }
                  ].map((project, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${project.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${project.color}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{project.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}