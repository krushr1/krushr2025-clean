import React, { useState } from 'react'
import { Link } from 'react-router'

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="navbar w-nav" data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner">
      <div className="container-default w-container">
        <div className="navbar-wrapper">
          <Link to="/" className="navbar-brand w-nav-brand">
            <img src="images/krushr-logo.svg" loading="lazy" alt="Krushr" className="navbar-logo" />
          </Link>
          <nav role="navigation" className="navbar-menu w-nav-menu">
            <div className="navbar-menu-wrapper">
              <div className="navbar-menu-left">
                <div className="navbar-dropdown w-dropdown" data-hover="true" data-delay="0">
                  <div className="navbar-dropdown-toggle w-dropdown-toggle">
                    <div className="navbar-dropdown-icon w-icon-dropdown-toggle"></div>
                    <div className="navbar-link">Platform & Tools</div>
                  </div>
                  <nav className="navbar-dropdown-list w-dropdown-list">
                    <div className="navbar-dropdown-wrapper">
                      <div className="navbar-dropdown-left">
                        <div className="navbar-dropdown-content">
                          <Link to="#" className="navbar-dropdown-link w-dropdown-link">
                            <div className="navbar-dropdown-link-content">
                              <div className="navbar-dropdown-link-icon">
                                <img src="images/icon-layout.svg" loading="lazy" alt="Layout Builder" />
                              </div>
                              <div className="navbar-dropdown-link-text">
                                <div className="navbar-dropdown-link-title">Layout Builder</div>
                                <div className="navbar-dropdown-link-description">Create custom layouts</div>
                              </div>
                            </div>
                          </Link>
                          <Link to="#" className="navbar-dropdown-link w-dropdown-link">
                            <div className="navbar-dropdown-link-content">
                              <div className="navbar-dropdown-link-icon">
                                <img src="images/icon-kanban.svg" loading="lazy" alt="Kanban" />
                              </div>
                              <div className="navbar-dropdown-link-text">
                                <div className="navbar-dropdown-link-title">Kanban Boards</div>
                                <div className="navbar-dropdown-link-description">Organize your tasks</div>
                              </div>
                            </div>
                          </Link>
                          <Link to="#" className="navbar-dropdown-link w-dropdown-link">
                            <div className="navbar-dropdown-link-content">
                              <div className="navbar-dropdown-link-icon">
                                <img src="images/icon-calendar.svg" loading="lazy" alt="Calendar" />
                              </div>
                              <div className="navbar-dropdown-link-text">
                                <div className="navbar-dropdown-link-title">Calendar</div>
                                <div className="navbar-dropdown-link-description">Schedule and manage</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </nav>
                </div>
                <div className="navbar-dropdown w-dropdown" data-hover="true" data-delay="0">
                  <div className="navbar-dropdown-toggle w-dropdown-toggle">
                    <div className="navbar-dropdown-icon w-icon-dropdown-toggle"></div>
                    <div className="navbar-link">ChatGPT & Integrations</div>
                  </div>
                  <nav className="navbar-dropdown-list w-dropdown-list">
                    <div className="navbar-dropdown-wrapper">
                      <div className="navbar-dropdown-left">
                        <div className="navbar-dropdown-content">
                          <Link to="#" className="navbar-dropdown-link w-dropdown-link">
                            <div className="navbar-dropdown-link-content">
                              <div className="navbar-dropdown-link-icon">
                                <img src="images/icon-ai.svg" loading="lazy" alt="AI Assistant" />
                              </div>
                              <div className="navbar-dropdown-link-text">
                                <div className="navbar-dropdown-link-title">AI Assistant</div>
                                <div className="navbar-dropdown-link-description">ChatGPT o1 integration</div>
                              </div>
                            </div>
                          </Link>
                          <Link to="#" className="navbar-dropdown-link w-dropdown-link">
                            <div className="navbar-dropdown-link-content">
                              <div className="navbar-dropdown-link-icon">
                                <img src="images/icon-integrations.svg" loading="lazy" alt="Integrations" />
                              </div>
                              <div className="navbar-dropdown-link-text">
                                <div className="navbar-dropdown-link-title">Integrations</div>
                                <div className="navbar-dropdown-link-description">Connect your tools</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </nav>
                </div>
                <div className="navbar-dropdown w-dropdown" data-hover="true" data-delay="0">
                  <div className="navbar-dropdown-toggle w-dropdown-toggle">
                    <div className="navbar-dropdown-icon w-icon-dropdown-toggle"></div>
                    <div className="navbar-link">Resources</div>
                  </div>
                  <nav className="navbar-dropdown-list w-dropdown-list">
                    <div className="navbar-dropdown-wrapper">
                      <div className="navbar-dropdown-left">
                        <div className="navbar-dropdown-content">
                          <Link to="#" className="navbar-dropdown-link w-dropdown-link">
                            <div className="navbar-dropdown-link-content">
                              <div className="navbar-dropdown-link-icon">
                                <img src="images/icon-docs.svg" loading="lazy" alt="Documentation" />
                              </div>
                              <div className="navbar-dropdown-link-text">
                                <div className="navbar-dropdown-link-title">Documentation</div>
                                <div className="navbar-dropdown-link-description">Learn how to use Krushr</div>
                              </div>
                            </div>
                          </Link>
                          <Link to="#" className="navbar-dropdown-link w-dropdown-link">
                            <div className="navbar-dropdown-link-content">
                              <div className="navbar-dropdown-link-icon">
                                <img src="images/icon-support.svg" loading="lazy" alt="Support" />
                              </div>
                              <div className="navbar-dropdown-link-text">
                                <div className="navbar-dropdown-link-title">Support</div>
                                <div className="navbar-dropdown-link-description">Get help when you need it</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
              <div className="navbar-menu-right">
                <Link to="/login" className="navbar-link">Log In</Link>
                <Link to="/pricing" className="btn-primary navbar-btn w-button">Get Started</Link>
              </div>
            </div>
          </nav>
          <div className="navbar-button w-nav-button">
            <div className="navbar-icon w-icon-nav-menu"></div>
          </div>
        </div>
      </div>
    </div>
  )
}