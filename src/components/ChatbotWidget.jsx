import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader } from "lucide-react";

const FAQ_KNOWLEDGE_BASE = `
LifeGuard Tracker FAQs and Documentation:

SCHEDULING:
- Q: How do I create a recurring shift? A: Go to Schedule, click "Add Recurring Shift", select the base shift and repeat frequency
- Q: Can I swap shifts with other staff? A: Yes, use Shift Swaps to request exchanges. Manager approval required
- Q: How do I prevent scheduling conflicts? A: System auto-detects overlaps. Check conflict warnings before publishing

COMPLIANCE:
- Q: How long are certifications valid? A: CPR/First Aid: 2 years. Lifeguard: varies by state (typically 2-3 years). NLS: 3 years
- Q: What does the compliance dashboard show? A: Real-time cert status, expiry alerts, OSHA/MAHC compliance scores, audit readiness
- Q: How do I track staff certifications? A: Employee profile > Certifications. Auto-alerts 30 and 7 days before expiry

REPORTING:
- Q: What reports are available? A: Staff Performance, Incident Trends, Compliance Status, Pool Tests, Chemical Logs, Payroll
- Q: Can I export reports? A: Yes, PDF and CSV formats. Go to Reports > Generate Report > choose format
- Q: How often should I run compliance reports? A: Weekly recommended for monitoring, monthly for archival

GPS & MOBILE:
- Q: How does GPS clock-in work? A: Lifeguards clock in with mobile app. Location must be within facility geofence (default 100m)
- Q: Is GPS tracking mandatory? A: Opt-in per employee. Helps verify proper zone coverage and accountability
- Q: Can lifeguards clock in offline? A: Yes, syncs when connection restored

INTEGRATIONS:
- Q: Does it integrate with payroll systems? A: Yes, Gusto, ADP, Paychex. Sync hours automatically to reduce errors
- Q: Can I connect Google Calendar? A: Yes, for multi-location viewing. Settings > Integrations > Google Calendar

SUPPORT:
- Q: What's included in my plan? A: Starter: Scheduling basics. Pro: +Compliance, payroll integrations. Enterprise: +Multi-location, AI advisor
- Q: How do I get help? A: In-app chat, email support@lifeguardtracker.app, documentation at lifeguardtracker.com/docs
- Q: Is there a free trial? A: Yes, 14 days free. Full features, no credit card required
`;

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! 👋 I'm the LifeGuard Tracker assistant. Ask me about scheduling, compliance, reporting, or anything else. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const queryMutation = useMutation({
    mutationFn: async (query) => {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful LifeGuard Tracker support assistant. Answer the user's question based on this knowledge base:\n\n${FAQ_KNOWLEDGE_BASE}\n\nUser question: "${query}"\n\nProvide a helpful, concise answer. If the question is not related to LifeGuard Tracker, politely redirect them.`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" },
            helpful: { type: "boolean" }
          }
        }
      });
      return response;
    }
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);

    queryMutation.mutate(userMessage, {
      onSuccess: (data) => {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.answer || "I'm not sure how to help with that. Please contact our support team at support@lifeguardtracker.app"
        }]);
      },
      onError: () => {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Sorry, I encountered an error. Please try again or contact support." 
        }]);
      }
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#1a9c5b] hover:bg-[#158a4e] text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-96 h-[600px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-gray-200">
      {/* Header */}
      <div className="bg-[#1a9c5b] text-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold">LifeGuard Support</h3>
          <p className="text-xs text-green-100">Usually responds instantly</p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 hover:bg-green-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                msg.role === "user"
                  ? "bg-[#1a9c5b] text-white rounded-br-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {queryMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm text-gray-600 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]"
            disabled={queryMutation.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={queryMutation.isPending || !input.trim()}
            className="bg-[#1a9c5b] hover:bg-[#158a4e] text-white p-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 text-center">Powered by AI • Always learning</p>
      </div>
    </Card>
  );
}