import Link from 'next/link'
import { ArrowRight, Zap, Brain, Rocket, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Pipeline</span>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/login" className="text-gray-600 hover-text-gray-900">
              Login
            </Link>
            <Link
              href="/login"
              className="btn btn-primary"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Train & Deploy AI Models
            <br />
            <span className="text-blue-600">In Minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            World's first fully automated ML platform. Build, train, and deploy custom AI models without writing a single line of code.
          </p>
          <Link
            href="/login"
            className="btn btn-primary text-lg px-8 py-4"
          >
            Create Your Own AI
            <ArrowRight className="w-5 h-5" style={{ marginLeft: '0.5rem' }} />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md-grid-cols-2 lg-grid-cols-4 gap-8 mt-20">
          <div className="card">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Train models in minutes with optimized PyTorch infrastructure</p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600">Automated code generation and model optimization</p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">One-Click Deploy</h3>
            <p className="text-gray-600">Deploy directly to HuggingFace with a single click</p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Ready</h3>
            <p className="text-gray-600">Secure, scalable, and production-ready infrastructure</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to build your first AI model?
          </h2>
          <p className="text-white mb-8 text-lg" style={{ opacity: 0.9 }}>
            Join thousands of developers already using Pipeline
          </p>
          <Link
            href="/login"
            className="btn bg-white text-blue-600 px-8 py-4 text-lg font-semibold hover:bg-gray-100"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" style={{ marginLeft: '0.5rem' }} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 Pipeline. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
