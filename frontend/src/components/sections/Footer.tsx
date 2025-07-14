import React from 'react'
import { FOOTER_CONTENT } from '../content/footerContent'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {/* Top Section - Logo and Newsletter */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-shrink-0 lg:max-w-md">
              <a href={FOOTER_CONTENT.logo.href} className="inline-block">
                <img 
                  src={FOOTER_CONTENT.logo.src} 
                  alt={FOOTER_CONTENT.logo.alt} 
                  className="w-auto h-8" 
                />
              </a>
            </div>
            <div className="flex-grow lg:max-w-lg">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {FOOTER_CONTENT.newsletter.title}
                </h3>
              </div>
              <form className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    className="flex-1 px-4 py-2 rounded-md border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    maxLength={256} 
                    name="Email-2" 
                    placeholder={FOOTER_CONTENT.newsletter.placeholder} 
                    type="email" 
                    id="Email-2" 
                    required 
                  />
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 whitespace-nowrap"
                  >
                    {FOOTER_CONTENT.newsletter.buttonText}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Middle Section - Navigation Links */}
          <div className="border-t border-gray-800 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div>
                <h4 className="text-base font-semibold text-white mb-4">{FOOTER_CONTENT.navigation.pages.title}</h4>
                <ul className="space-y-2">
                  {FOOTER_CONTENT.navigation.pages.links.slice(0, 8).map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-200">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-base font-semibold text-white mb-4">{FOOTER_CONTENT.navigation.support.title}</h4>
                <ul className="space-y-2">
                  {FOOTER_CONTENT.navigation.support.links.slice(0, 8).map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-200">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-base font-semibold text-white mb-4">{FOOTER_CONTENT.navigation.utility.title}</h4>
                <ul className="space-y-2">
                  {FOOTER_CONTENT.navigation.utility.links.slice(0, 8).map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className="text-gray-300 hover:text-white transition-colors duration-200">
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Bottom Section - Contact Info */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
              <div className="space-y-6">
                <h4 className="text-base font-semibold text-white">Contact</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm font-medium text-white">{FOOTER_CONTENT.contact.phone.label}</div>
                    <div className="text-sm text-gray-300">{FOOTER_CONTENT.contact.phone.value}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{FOOTER_CONTENT.contact.email.label}</div>
                    <div className="text-sm text-gray-300">{FOOTER_CONTENT.contact.email.value}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{FOOTER_CONTENT.contact.location.label}</div>
                    <div className="text-sm text-gray-300">{FOOTER_CONTENT.contact.location.value}</div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-400 lg:text-right">
                {FOOTER_CONTENT.copyright}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}