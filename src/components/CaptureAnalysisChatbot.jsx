import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, ListPlus } from "lucide-react";
import { queryCapture, getSuggestedQuestions } from "../utils/queryEngine";

export default function CaptureAnalysisChatbot({ capture, analysis }) {
    const [messages, setMessages] = useState([
        { role: "bot", text: "Hello Officer. I am the Field Intelligence Chatbot." },
        { role: "bot", text: "Ask me anything about this capture data. For example: 'What is their exact location?', 'Are they using a VPN?', or 'What device are they on?'" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);

    const suggestions = getSuggestedQuestions();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        submitQuery(inputValue);
    };

    const submitQuery = (text) => {
        // Add user message
        setMessages((prev) => [...prev, { role: "user", text }]);
        setInputValue("");

        // Simulate slight instant delay for UX
        setTimeout(() => {
            const response = queryCapture(text, capture);
            setMessages((prev) => [...prev, { role: "bot", text: response }]);
        }, 150);
    };

    return (
        <div className="flex flex-col h-[500px] bg-surface rounded-xl border border-accent/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 p-3 bg-surface-elevated border-b border-surface-border shrink-0">
                <Bot className="w-5 h-5 text-accent" />
                <h4 className="font-display text-sm tracking-widest text-accent uppercase">Field Intel Chatbot</h4>
                <span className="ml-auto font-mono text-[10px] text-accent/70 px-2 py-0.5 rounded border border-accent/20 bg-accent/5">
                    LOCAL ENGINE ACTIVE
                </span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                            }`}>
                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2 font-body text-sm leading-relaxed ${msg.role === "user"
                            ? "bg-primary/10 border border-primary/20 text-text-primary rounded-tr-sm"
                            : "bg-surface-elevated border border-surface-border text-text-secondary rounded-tl-sm"
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            <div className="px-4 py-2 bg-surface flex flex-wrap gap-2 border-t border-surface-border shrink-0 shrink-0">
                <div className="w-full flex items-center gap-1.5 mb-1 text-text-muted">
                    <ListPlus className="w-3.5 h-3.5" />
                    <span className="font-body text-[10px] uppercase tracking-wider">Suggested Queries</span>
                </div>
                {suggestions.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => submitQuery(q)}
                        className="px-3 py-1 bg-surface-elevated border border-surface-border hover:border-accent/40 rounded-full font-body text-xs text-text-secondary transition-colors text-left"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-surface-elevated border-t border-surface-border flex items-center gap-2 shrink-0">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a question about this capture..."
                    className="flex-1 bg-surface border border-surface-border rounded-lg px-4 py-2 font-body text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="p-2 bg-accent text-surface rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}
