import React from 'react'
import { FOOTER_CONTENT } from '../content/footerContent'

/**
 * Footer Component
 * Complete footer with newsletter signup, navigation links, and contact info
 * Pixel-perfect recreation of the original HTML structure
 */
export const Footer: React.FC = () => {
  return (
    <footer className="footer-wrapper-2">
      <div className="container-default-2">
        <div className="foot-wrap-ne">
          <div className="footer-top-2">
            <div className="inner-container _440px">
              <a href={FOOTER_CONTENT.logo.href} className="footer-logo-wrapper w-inline-block">
                <img 
                  src={FOOTER_CONTENT.logo.src} 
                  alt={FOOTER_CONTENT.logo.alt} 
                  className="width-100-2" 
                />
              </a>
            </div>
            <div className="inner-container _608px-tablet">
              <div className="mg-bottom-24px-2">
                <div className="text-300 bold color-neutral-100">
                  {FOOTER_CONTENT.newsletter.title}
                </div>
              </div>
              <div className="mg-bottom-2 w-form">
                <form 
                  id="wf-form-Footer-Subscribe" 
                  name="wf-form-Footer-Subscribe" 
                  data-name="Footer Subscribe" 
                  method="get" 
                  data-wf-page-id="645449861f69269ee69b16b1" 
                  data-wf-element-id="9f0b8505-99cb-9825-916c-c3e9dff548e8"
                >
                  <div className="w-layout-grid grid-subscribe-form-button-left-2">
                    <input 
                      className="input-2 input-subscribe-footer w-input" 
                      maxLength={256} 
                      name="Email-2" 
                      data-name="Email 2" 
                      placeholder={FOOTER_CONTENT.newsletter.placeholder} 
                      type="email" 
                      id="Email-2" 
                      required 
                    />
                    <input 
                      type="submit" 
                      data-wait="Please wait..." 
                      id="w-node-_9f0b8505-99cb-9825-916c-c3e9dff548eb-e69b16b1" 
                      className="btn-primary-3 white w-button" 
                      value={FOOTER_CONTENT.newsletter.buttonText} 
                    />
                  </div>
                </form>
                <div className="success-message w-form-done">
                  <div className="success-message-horizontal-2 footer-success-message">
                    <div className="line-rounded-icon success-message-check---left"></div>
                    <div>{FOOTER_CONTENT.newsletter.successMessage}</div>
                  </div>
                </div>
                <div className="error-message-2 w-form-fail">
                  <div>{FOOTER_CONTENT.newsletter.errorMessage}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-middle-2">
            <div id="w-node-_9f0b8505-99cb-9825-916c-c3e9dff548f6-e69b16b1" className="div-block-4">
              <div className="text-300 bold footer-title">{FOOTER_CONTENT.navigation.pages.title}</div>
              <div className="footer-pages-links-container-2">
                <ul id="w-node-_9f0b8505-99cb-9825-916c-c3e9dff548fa-e69b16b1" role="list" className="footer-list-wrapper-2">
                  {FOOTER_CONTENT.navigation.pages.links.slice(0, 8).map((link, index) => (
                    <li key={index} className={index === 7 ? "footer-list-item mg-bottom-0" : "footer-list-item"}>
                      <a href={link.href} className="footer-link-2">{link.text}</a>
                    </li>
                  ))}
                </ul>
                
                <ul id="w-node-_9f0b8505-99cb-9825-916c-c3e9dff54913-e69b16b1" role="list" className="footer-list-wrapper-2">
                  {FOOTER_CONTENT.navigation.support.links.slice(0, 13).map((link, index) => (
                    <li key={index} className={index === 12 ? "footer-list-item mg-bottom-0" : "footer-list-item"}>
                      <a href={link.href} className="footer-link-2">{link.text}</a>
                    </li>
                  ))}
                </ul>
                
                <ul id="w-node-_9f0b8505-99cb-9825-916c-c3e9dff54931-e69b16b1" role="list" className="footer-list-wrapper-2">
                  {FOOTER_CONTENT.navigation.utility.links.map((link, index) => (
                    <li key={index} className={index === 8 ? "footer-list-item mg-bottom-0" : "footer-list-item"}>
                      <a href={link.href} className="footer-link-2">{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom-2">
            <div className="inner-container _440px">
              <div className="footer-middle-bottom-2">
                <div className="text-200 bold mg-bottom-24px color-neutral-100">Contact</div>
                <div className="grid-1-column gap-row-8px mg-bottom-48px">
                  <div className="footer-contact-info-wrapper">
                    <div className="text-200 bold">{FOOTER_CONTENT.contact.phone.label}</div>
                    <div className="text-200">{FOOTER_CONTENT.contact.phone.value}</div>
                  </div>
                  <div className="footer-contact-info-wrapper">
                    <div className="text-200 bold">{FOOTER_CONTENT.contact.email.label}</div>
                    <div className="text-200">{FOOTER_CONTENT.contact.email.value}</div>
                  </div>
                  <div className="footer-contact-info-wrapper">
                    <div className="text-200 bold">{FOOTER_CONTENT.contact.location.label}</div>
                    <div className="text-200">{FOOTER_CONTENT.contact.location.value}</div>
                  </div>
                </div>
                <div className="text-100">{FOOTER_CONTENT.copyright}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}