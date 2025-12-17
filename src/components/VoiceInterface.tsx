import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Square } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceInterfaceProps {
  onVoiceCommand?: (command: string) => void;
  onVoiceResponse?: (response: string) => void;
}

export function VoiceInterface({ onVoiceCommand, onVoiceResponse }: VoiceInterfaceProps) {
  const { t, currentLanguage } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechSynthesis = window.speechSynthesis;
    
    if (SpeechRecognition && SpeechSynthesis) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = getLanguageCode(currentLanguage);
    }
  }, [currentLanguage]);

  // Get language code for speech recognition
  const getLanguageCode = (language: string): string => {
    const languageMap: { [key: string]: string } = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'ta': 'ta-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'or': 'or-IN',
      'as': 'as-IN'
    };
    return languageMap[language] || 'en-IN';
  };

  // Start voice recognition
  const startListening = () => {
    if (!recognitionRef.current) return;
    
    setIsListening(true);
    setTranscript('');
    
    recognitionRef.current.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
      
      if (event.results[current].isFinal) {
        setLastCommand(transcript);
        onVoiceCommand?.(transcript);
        processVoiceCommand(transcript);
      }
    };
    
    recognitionRef.current.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognitionRef.current.start();
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Process voice commands
  const processVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Weather queries
    if (lowerCommand.includes('weather') || lowerCommand.includes('मौसम') || lowerCommand.includes('আবহাওয়া')) {
      speakResponse(t('voice.weather.response'));
    }
    // Market price queries
    else if (lowerCommand.includes('price') || lowerCommand.includes('rate') || lowerCommand.includes('मूल्य') || lowerCommand.includes('দাম')) {
      speakResponse(t('voice.price.response'));
    }
    // Crop advice
    else if (lowerCommand.includes('crop') || lowerCommand.includes('advice') || lowerCommand.includes('फसल') || lowerCommand.includes('পরামর্শ')) {
      speakResponse(t('voice.crop.response'));
    }
    // Soil health
    else if (lowerCommand.includes('soil') || lowerCommand.includes('मिट्टी') || lowerCommand.includes('মাটি')) {
      speakResponse(t('voice.soil.response'));
    }
    // Help
    else if (lowerCommand.includes('help') || lowerCommand.includes('सहायता') || lowerCommand.includes('সাহায্য')) {
      speakResponse(t('voice.help.response'));
    }
    else {
      speakResponse(t('voice.unknown.response'));
    }
  };

  // Text-to-speech
  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(currentLanguage);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    onVoiceResponse?.(text);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Common voice commands
  const commonCommands = [
    { command: t('voice.commands.weather'), icon: '🌤️' },
    { command: t('voice.commands.price'), icon: '💰' },
    { command: t('voice.commands.crop'), icon: '🌾' },
    { command: t('voice.commands.soil'), icon: '🌱' },
    { command: t('voice.commands.help'), icon: '❓' }
  ];

  if (!isSupported) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            {t('voice.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {t('voice.not.supported')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Mic className="h-5 w-5" />
          {t('voice.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"
          >
            {isListening ? <MicOff className="h-4 w-4 sm:h-6 sm:w-6" /> : <Mic className="h-4 w-4 sm:h-6 sm:w-6" />}
          </Button>
          
          {isSpeaking && (
            <Button
              onClick={stopSpeaking}
              variant="outline"
              size="lg"
              className="h-12 w-12 sm:h-16 sm:w-16 rounded-full"
            >
              <Square className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center gap-2">
          {isListening && (
            <Badge variant="destructive" className="animate-pulse">
              {t('voice.listening')}
            </Badge>
          )}
          {isSpeaking && (
            <Badge variant="default" className="animate-pulse">
              {t('voice.speaking')}
            </Badge>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm font-medium">{t('voice.heard')}:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {/* Last Command */}
        {lastCommand && (
          <div className="bg-accent/10 p-3 rounded-lg">
            <p className="text-sm font-medium">{t('voice.last.command')}:</p>
            <p className="text-sm">{lastCommand}</p>
          </div>
        )}

        {/* Common Commands */}
        <div className="space-y-2">
          <p className="text-sm font-medium">{t('voice.try.saying')}:</p>
          <div className="grid grid-cols-1 gap-2">
            {commonCommands.map((cmd, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => speakResponse(cmd.command)}
                className="justify-start"
              >
                <span className="mr-2">{cmd.icon}</span>
                {cmd.command}
              </Button>
            ))}
          </div>
        </div>

        {/* Language Info */}
        <div className="text-xs text-muted-foreground text-center">
          {t('voice.language.info')}: {currentLanguage.toUpperCase()}
        </div>
      </CardContent>
    </Card>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    speechSynthesis: SpeechSynthesis;
  }
}
