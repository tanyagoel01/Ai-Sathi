import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Mic, Volume2, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useMathTutor } from "@/hooks/useMathTutor";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

const MathChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const chapter = (location.state as { chapter?: string })?.chapter || "General Math";
  const initialQuestion = (location.state as { initialQuestion?: string })?.initialQuestion;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: language === "hi"
        ? `नमस्ते! मैं आपका Math साथी हूँ। मुझसे कुछ भी पूछें! 🧮`
        : `Hello! I'm your Math Sathi. Ask me anything! 🧮`,
    },
  ]);
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialQuestion = useRef(false);

  // RAG hook
  const {
    answer,
    loading: isRAGLoading,
    error: ragError,
    metadata,
    askQuestionStream,
    isReady,
    setupProgress,
    isSettingUp
  } = useMathTutor();

  // Text-to-Speech and Voice Input
  const { isSpeaking, speak, stop, isSupported: ttsSupported } = useTextToSpeech(language);
  const {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
    isSupported: sttSupported
  } = useVoiceInput(language);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Handle voice input
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setInput(transcript);
      clearTranscript();
      toast.success(language === "hi" ? "आवाज़ पहचानी गई!" : "Voice recognized!");
    }
  }, [transcript, clearTranscript, language]);

  // Auto-speak last assistant message
  useEffect(() => {
    if (messages.length > 0 && !isRAGLoading) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && lastMessage.content) {
        speak(lastMessage.content);
      }
    }
  }, [messages, isRAGLoading, speak]);

  // Handle RAG answer
  useEffect(() => {
    if (answer && !isRAGLoading) {
      const sources = metadata?.sources?.map((s: { chapter: string }) => s.chapter) || [];
      const assistantMessage: Message = {
        role: "assistant",
        content: answer,
        sources: sources.length > 0 ? sources : undefined
      };
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent("");
    }
  }, [answer, isRAGLoading, metadata]);

  // Handle RAG error
  useEffect(() => {
    if (ragError) {
      // Check if it's a setup error
      if (ragError.includes('generate-embeddings')) {
        // This is a setup error, don't show in chat
        return;
      }
      
      toast.error(ragError);
      const errorMessage: Message = {
        role: "assistant",
        content: language === "hi"
          ? "माफ़ करें, मुझे समस्या हुई। कृपया फिर से प्रयास करें! 😊"
          : "Sorry, I had trouble. Please try again! 😊"
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreamingContent("");
    }
  }, [ragError, language]);

  // Handle initial question
  useEffect(() => {
    if (initialQuestion && !hasProcessedInitialQuestion.current && isReady) {
      hasProcessedInitialQuestion.current = true;
      handleSendMessage(initialQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion, isReady]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isRAGLoading) return;

    // Add user message
    const userMessage: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setStreamingContent("");

    // Get RAG response with streaming
    try {
      await askQuestionStream(textToSend, (chunk) => {
        setStreamingContent(prev => prev + chunk);
      });
    } catch (error) {
      console.error("Error getting RAG response:", error);
    }
  };

  const handleSend = () => {
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show loading screen during first-time setup
  if (isSettingUp) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-background to-primary/5 p-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            <Sparkles className="w-16 h-16 mx-auto text-yellow-500 animate-pulse" />
            <h2 className="text-2xl font-bold text-foreground">
              {language === "hi" ? "सेटअप हो रहा है..." : "Setting up..."}
            </h2>
            <p className="text-muted-foreground">
              {setupProgress || (language === "hi" ? "कृपया प्रतीक्षा करें" : "Please wait")}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse w-full"></div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              {language === "hi" 
                ? "पहली बार का सेटअप (1-2 मिनट)" 
                : "First-time setup (1-2 minutes)"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Header */}
      <div className="bg-card shadow-lg border-b border-border px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Math Sathi
          </h1>
          <p className="text-xs text-muted-foreground">
            {chapter}
            {isReady && " • "}
            {isReady && <span className="text-green-600">Ready</span>}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Info Banner */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            🤖 Powered by RAG AI - Curriculum-based answers
            {(sttSupported || ttsSupported) && (
              <span className="ml-2">
                {sttSupported && "🎤"} {ttsSupported && "🔊"}
              </span>
            )}
          </p>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                {language === "hi" ? "रिकॉर्डिंग चल रही है... बोलें" : "Recording... Speak now"}
              </p>
            </div>
          </div>
        )}

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-green-700 dark:text-green-300 animate-pulse" />
              <p className="text-xs text-green-700 dark:text-green-300">
                {language === "hi" ? "बोल रहा हूँ..." : "Speaking..."}
              </p>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((message, index) => (
          <div key={index}>
            <ChatMessage role={message.role} content={message.content} />
            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 ml-4 text-xs text-muted-foreground">
                📚 Source: {message.sources.join(", ")}
              </div>
            )}
          </div>
        ))}

        {/* Streaming content */}
        {streamingContent && (
          <ChatMessage role="assistant" content={streamingContent} />
        )}

        {/* Loading indicator */}
        {isRAGLoading && !streamingContent && (
          <div className="flex gap-2 p-4 rounded-2xl bg-card shadow-lg">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
            <span className="text-xs text-muted-foreground ml-2">
              {language === "hi" ? "सोच रहा हूँ..." : "Thinking..."}
            </span>
          </div>
        )}

        {/* Confidence indicator */}
        {metadata && metadata.confidence > 0 && (
          <div className="text-center">
            <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs">
              ✓ {Math.round(metadata.confidence * 100)}% confident
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex gap-2">
          {sttSupported && (
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isRAGLoading}
              className="h-[60px] w-[60px] rounded-2xl"
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              <Mic className={`w-5 h-5 ${isRecording ? 'animate-pulse' : ''}`} />
            </Button>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isRecording
                ? (language === "hi" ? "सुन रहा हूँ..." : "Listening...")
                : (language === "hi" ? "गणित के बारे में कुछ भी पूछें..." : "Ask me anything about maths...")
            }
            className="min-h-[60px] max-h-[120px] resize-none rounded-2xl"
            disabled={isRAGLoading || isRecording}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isRAGLoading}
            size="icon"
            className="h-[60px] w-[60px] rounded-2xl bg-gradient-to-br from-primary to-secondary hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MathChat;
