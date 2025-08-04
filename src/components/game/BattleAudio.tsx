'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SoundManagerProps {
  onSoundToggle?: (enabled: boolean) => void
}

export class BattleAudio {
  private static audioCache: { [key: string]: HTMLAudioElement } = {}
  private static soundEnabled = true
  private static volume = 0.7

  static setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled
  }

  static setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  private static createAudioElement(frequency: number, duration: number, type: OscillatorType = 'sine'): HTMLAudioElement {
    // Create audio context for synthetic sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
    
    // Return a dummy audio element for consistency
    const audio = new Audio()
    audio.volume = this.volume
    return audio
  }

  static playSound(soundType: string) {
    if (!this.soundEnabled) return

    try {
      switch (soundType) {
        case 'attack':
          this.playTone(800, 0.15, 'sawtooth')
          setTimeout(() => this.playTone(600, 0.1, 'sawtooth'), 50)
          break
        case 'critical':
          this.playTone(1200, 0.2, 'square')
          setTimeout(() => this.playTone(800, 0.15, 'square'), 100)
          setTimeout(() => this.playTone(1000, 0.1, 'square'), 200)
          break
        case 'defend':
          this.playTone(400, 0.3, 'triangle')
          break
        case 'special':
          this.playTone(1000, 0.1, 'sine')
          setTimeout(() => this.playTone(1200, 0.1, 'sine'), 100)
          setTimeout(() => this.playTone(1500, 0.2, 'sine'), 200)
          break
        case 'heal':
          this.playTone(600, 0.1, 'sine')
          setTimeout(() => this.playTone(800, 0.1, 'sine'), 100)
          setTimeout(() => this.playTone(1000, 0.2, 'sine'), 200)
          break
        case 'victory':
          this.playVictorySound()
          break
        case 'defeat':
          this.playDefeatSound()
          break
        case 'countdown':
          this.playTone(800, 0.1, 'square')
          break
        case 'timeup':
          this.playTone(400, 0.5, 'sawtooth')
          break
        default:
          break
      }
    } catch (error) {
      console.log('Audio playback not supported')
    }
  }

  private static playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      // Fallback for browsers without Web Audio API
    }
  }

  private static playVictorySound() {
    const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
    notes.forEach((note, index) => {
      setTimeout(() => this.playTone(note, 0.3, 'sine'), index * 150)
    })
  }

  private static playDefeatSound() {
    const notes = [400, 350, 300, 250] // Descending sad notes
    notes.forEach((note, index) => {
      setTimeout(() => this.playTone(note, 0.4, 'triangle'), index * 200)
    })
  }
}

export function SoundManager({ onSoundToggle }: SoundManagerProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)

  const toggleSound = () => {
    const newState = !soundEnabled
    setSoundEnabled(newState)
    BattleAudio.setSoundEnabled(newState)
    onSoundToggle?.(newState)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleSound}
      className="flex items-center gap-2"
    >
      {soundEnabled ? (
        <Volume2 className="h-4 w-4" />
      ) : (
        <VolumeX className="h-4 w-4" />
      )}
      Sound
    </Button>
  )
}
