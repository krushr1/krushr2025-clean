import React from 'react'
import { Link } from 'react-router'
import { ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/button'
import KrushrLogo from '../components/common/KrushrLogo'

export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="px-6 py-4 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <KrushrLogo size="lg" />
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Project Management
            <span className="text-krushr-primary"> Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Organize tasks, collaborate with teams, and ship projects faster with Krushr's 
            intuitive workspace platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-krushr-primary hover:bg-krushr-primary/90">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/workspace">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to stay organized
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Kanban Boards",
                description: "Visual task management with drag-and-drop simplicity"
              },
              {
                title: "Real-time Collaboration", 
                description: "Work together seamlessly with live updates and chat"
              },
              {
                title: "AI Assistant",
                description: "Get smart suggestions and automate routine tasks"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-12 h-12 bg-krushr-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-krushr-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-krushr-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get organized?
          </h2>
          <p className="text-krushr-primary/80 mb-8">
            Join thousands of teams already using Krushr to ship better projects.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <KrushrLogo size="md" className="mb-4 justify-center" />
          <p className="text-gray-400">
            © 2025 Krushr. Built for teams that ship.
          </p>
        </div>
      </footer>
    </div>
  )
}