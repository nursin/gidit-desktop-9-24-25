import { useCallback, useEffect, useRef, useState } from 'react'

type VoiceRecognitionOptions = {
  onTranscriptChange?: (transcript: string) => void
}

type SpeechRecognitionInstance = SpeechRecognition & {
  lang?: string
  interimResults?: boolean
  continuous?: boolean
}

type SupportedSpeechRecognition =
  | ((new () => SpeechRecognitionInstance) & typeof SpeechRecognition)
  | undefined

export function useVoiceRecognition({ onTranscriptChange }: VoiceRecognitionOptions = {}) {
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const RecognitionCtor =
      (window as unknown as { SpeechRecognition?: SupportedSpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: SupportedSpeechRecognition }).webkitSpeechRecognition

    if (!RecognitionCtor) return

    const recognition = new RecognitionCtor()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        }
      }

      if (finalTranscript.trim()) {
        const cleaned = finalTranscript.trim()
        setTranscript((prev) => (prev ? `${prev} ${cleaned}` : cleaned))
        onTranscriptChange?.(cleaned)
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.onerror = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    setIsSupported(true)

    return () => {
      recognition.stop()
      recognitionRef.current = null
    }
  }, [onTranscriptChange])

  const start = useCallback(() => {
    if (!recognitionRef.current || isRecording) return
    try {
      recognitionRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.warn('Voice recognition failed to start', error)
    }
  }, [isRecording])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setIsRecording(false)
  }, [])

  return {
    isSupported,
    isRecording,
    transcript,
    start,
    stop,
  }
}
