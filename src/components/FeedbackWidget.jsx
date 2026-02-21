import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("general");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please enter your feedback.");
      return;
    }
    setLoading(true);
    try {
      const page = window.location.pathname.split("/").pop() || "unknown";
      await base44.entities.Feedback.create({
        type,
        content,
        page,
        email: null,
        name: null,
      });
      toast.success("Thank you for your feedback!");
      setContent("");
      setType("general");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-[#1a9c5b] hover:bg-[#158a4e] text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
          title="Send feedback"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {/* Feedback Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom">
          <div className="bg-[#1a9c5b] text-white p-4 flex items-center justify-between">
            <h3 className="font-semibold">Send Feedback</h3>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30"
              >
                <option value="general">General Feedback</option>
                <option value="bug">Bug Report</option>
                <option value="feature_request">Feature Request</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tell us what you think..."
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a9c5b]/30 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{content.length}/500</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !content.trim()}
                className="flex-1 bg-[#1a9c5b] hover:bg-[#158a4e] gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}