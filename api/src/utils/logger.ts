/**
 * Logger Utility
 * Structured logging for development and production
 */

import { config } from '../config'

export const logger = {
  info: (...args: any[]) => {
    console.log('ℹ️', new Date().toISOString(), ...args)
  },
  
  error: (...args: any[]) => {
    console.error('❌', new Date().toISOString(), ...args)
  },
  
  warn: (...args: any[]) => {
    console.warn('⚠️', new Date().toISOString(), ...args)
  },
  
  debug: (...args: any[]) => {
    if (config.NODE_ENV === 'development') {
      console.debug('🐛', new Date().toISOString(), ...args)
    }
  },
  
  success: (...args: any[]) => {
    console.log('✅', new Date().toISOString(), ...args)
  }
}