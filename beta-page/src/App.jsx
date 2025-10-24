import { useState } from 'react'
import mainlogo from './assets/mainlogo.png'
import heroimage from './assets/heroimage.png'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success', 'error', or null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const { data, error } = await supabase
        .from('beta_signups')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        console.error('Error:', error)
        setSubmitStatus('error')
      } else {
        console.log('Success:', data)
        setSubmitStatus('success')
        setFormData({ name: '', email: '' }) // Clear form
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <img 
            src={mainlogo} 
            alt="Skelementor" 
            className="h-6 sm:h-8 w-auto transition-transform duration-300 hover:scale-105"
          />
          <a 
            href="https://skelementor.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-gray-600 hover:text-[#1b3ff0] transition-all duration-300 font-medium relative group"
          >
            <span className="relative z-10">Home</span>
            <span className="absolute inset-0 bg-[#1b3ff0]/5 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"></span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen flex items-center justify-center pt-16 sm:pt-20">
        <div className="w-full relative">
          {/* Content Container with Padding */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
              
              {/* Left Side - Content */}
              <div className="order-2 lg:order-1 animate-fade-in-up">
                <div className="max-w-lg mx-auto lg:mx-0">
                  {/* Headline */}
                  <div className="mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-normal text-black leading-tight mb-3 sm:mb-4">
                      <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Something extraordinary is{' '}
                      </span>
                      <span className="font-medium text-[#1b3ff0] inline-block animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
                        brewing
                      </span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                      Join our exclusive beta program and be among the first to experience 
                      Skelementor's revolutionary new tools and products.
                    </p>
                  </div>

                  {/* Signup Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="group">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-300 group-focus-within:text-[#1b3ff0]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b3ff0] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 text-sm sm:text-base hover:border-gray-300 focus:shadow-lg focus:shadow-[#1b3ff0]/10"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="group">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 transition-colors duration-300 group-focus-within:text-[#1b3ff0]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b3ff0] focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 text-sm sm:text-base hover:border-gray-300 focus:shadow-lg focus:shadow-[#1b3ff0]/10"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#1b3ff0] text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-[#1a3ae0] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#1b3ff0] focus:ring-offset-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#1b3ff0]/25 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                  >
                    <span className="relative z-10 transition-all duration-300">
                      {isSubmitting ? 'Reserving...' : 'Reserve My Spot'}
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-[#1b3ff0] to-[#1a3ae0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  </button>

                  {/* Success/Error Messages */}
                  {submitStatus === 'success' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in-up animate-bounce-in">
                      <p className="text-sm text-green-800">
                        🎉 Thanks! You're on the beta list. We'll be in touch soon!
                      </p>
                    </div>
                  )}
                  
                  {submitStatus === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in-up animate-shake">
                      <p className="text-sm text-red-800">
                        ❌ Something went wrong. Please try again or contact us directly.
                      </p>
                    </div>
                  )}
                  </form>

                  {/* Additional Info */}
                  <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    By joining our beta program, you'll get early access to new features, 
                    exclusive updates, and the opportunity to shape the future of Skelementor.
                  </p>
                </div>
              </div>

              {/* Right Side - Mobile Image Only */}
              <div className="order-1 lg:hidden relative h-64 sm:h-80 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 overflow-hidden rounded-lg group">
                  <img
                    src={heroimage}
                    alt="Skelementor Hero"
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent transition-opacity duration-300 group-hover:opacity-80"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Image Overlay for Desktop */}
          <div className="hidden lg:block absolute top-1/2 right-0 w-1/2 h-3/4 -translate-y-1/2 pointer-events-none animate-fade-in-right" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 overflow-hidden group">
              <img
                src={heroimage}
                alt="Skelementor Hero"
                className="w-full h-full object-cover object-left transition-transform duration-1000 group-hover:scale-105"
                style={{
                  objectPosition: 'left center',
                  transform: 'scale(1.0)'
                }}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20 transition-opacity duration-500 group-hover:opacity-60"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App