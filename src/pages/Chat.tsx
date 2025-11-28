import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Mic, Volume2, VolumeX } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getTutoringResponse } from "@/services/geminiService";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useVoiceInput } from "@/hooks/useVoiceInput";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Get subject, chapter, and initial question from location state
  const subject = (location.state as { subject?: string })?.subject || "Maths";
  const chapter = (location.state as { chapter?: string })?.chapter || "General";
  const initialQuestion = (location.state as { initialQuestion?: string })?.initialQuestion;

  // Map language context to tutoring language
  const tutoringLanguage = language === "hi" ? "hindi" : language === "kn" ? "english" : "english";

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: tutoringLanguage === "hindi"
        ? `नमस्ते! मैं आपका AI साथी हूँ। में आपकी मदद कर सकता हूँ। मुझसे कुछ भी पूछें! 😊`
        : `Hello! I'm your AI Sathi. I can help you learn. Ask me anything! 😊`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialQuestion = useRef(false);

  // Text-to-Speech and Voice Input hooks
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
  }, [messages]);

  // Handle voice input transcript
  useEffect(() => {
    if (transcript && transcript.trim()) {
      setInput(transcript);
      clearTranscript();
      toast.success(tutoringLanguage === "hindi" ? "आवाज़ पहचानी गई!" : "Voice recognized!");
    }
  }, [transcript, clearTranscript, tutoringLanguage]);

  // Auto-speak the last AI message
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && !isLoading) {
        // Auto-speak AI responses
        speak(lastMessage.content);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading]);

  // Handle initial question from card context
  useEffect(() => {
    if (initialQuestion && !hasProcessedInitialQuestion.current) {
      hasProcessedInitialQuestion.current = true;
      // Add the initial question as a user message and get AI response
      const processInitialQuestion = async () => {
        const userMessage: Message = { role: "user", content: initialQuestion };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          const aiResponse = await getAIResponse(initialQuestion);
          const assistantMessage: Message = { role: "assistant", content: aiResponse };
          setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
          console.error("Error getting response:", error);
        } finally {
          setIsLoading(false);
        }
      };
      processInitialQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // 🔄 USING AI API (temporary - will replace with local SLM later)
    console.log("🤖 Using AI API for tutoring");

    // Build chat history for context
    const chatHistory = messages.slice(-4).map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Call AI tutoring service - no fallbacks, pure AI
    const response = await getTutoringResponse({
      subject,
      chapter,
      language: tutoringLanguage,
      userQuestion: userMessage,
      chatHistory,
    });

    return response;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("📤 Sending message to AI:", userMessage.content);

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const aiResponse = await getAIResponse(userMessage.content);
      console.log("📥 Received response from AI");

      const assistantMessage: Message = { role: "assistant", content: aiResponse };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("❌ Error getting response:", error);
      toast.error("Sorry, I had trouble understanding. Please try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Header */}
      <div className="bg-card shadow-[var(--shadow-soft)] border-b border-border px-4 py-3 flex items-center gap-3">
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
            AI Sathi
            {sttSupported && <Mic className="w-4 h-4 text-primary" />}
            {ttsSupported && <Volume2 className="w-4 h-4 text-primary" />}
          </h1>
          <p className="text-xs text-success flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
            🤖 AI Sathi {(sttSupported || ttsSupported) && "• Voice Enabled"}
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Info Banner */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            🤖 Powered by AI Sathi - All responses are generated by AI
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
                {tutoringLanguage === "hindi" ? "रिकॉर्डिंग चल रही है... बोलें" : "Recording... Speak now"}
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
                {tutoringLanguage === "hindi" ? "बोल रहा हूँ..." : "Speaking..."}
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage key={index} role={message.role} content={message.content} />
        ))}
        {isLoading && (
          <div className="flex gap-2 p-4 rounded-2xl bg-card shadow-[var(--shadow-soft)]">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-card border-t border-border p-4">
        {/* Voice controls */}
        <div className="flex gap-2 mb-3 justify-end">
          {ttsSupported && (
            <Button
              variant="outline"
              size="sm"
              onClick={isSpeaking ? stop : () => speak(messages[messages.length - 1]?.content || "")}
              disabled={messages.length <= 1}
              className="rounded-xl"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  {tutoringLanguage === "hindi" ? "बंद करें" : "Stop"}
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  {tutoringLanguage === "hindi" ? "फिर से सुनें" : "Read Last"}
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          {sttSupported && (
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
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
                ? (tutoringLanguage === "hindi" ? "सुन रहा हूँ..." : "Listening...")
                : (tutoringLanguage === "hindi" ? "गणित के बारे में कुछ भी पूछें..." : "Ask me anything about maths...")
            }
            className="min-h-[60px] max-h-[120px] resize-none rounded-2xl"
            disabled={isLoading || isRecording}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
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

export default Chat;
