import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle, BookOpen, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.integrations.Core.SendEmail({
      to: "support@lifeguardtracker.app",
      subject: `[Support] ${form.subject}`,
      body: `From: ${form.name} (${form.email})\n\n${form.message}`,
    });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
      <div>
        <Link to={createPageUrl("Dashboard")} className="text-sm text-[#1a9c5b] hover:underline">← Back to Dashboard</Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">Contact & Support</h1>
        <p className="text-gray-500 mt-2">We're here to help. Reach out anytime.</p>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <p className="font-semibold text-gray-900">Documentation</p>
            <p className="text-sm text-gray-500">Browse guides and how-tos</p>
            <Link to={createPageUrl("Docs")} className="text-sm text-[#1a9c5b] hover:underline font-medium">View Docs →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Tutorials</p>
            <p className="text-sm text-gray-500">Watch video walkthroughs</p>
            <Link to={createPageUrl("Tutorials")} className="text-sm text-[#1a9c5b] hover:underline font-medium">Watch Videos →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <p className="font-semibold text-gray-900">Email Support</p>
            <p className="text-sm text-gray-500">support@lifeguardtracker.app</p>
            <a href="mailto:support@lifeguardtracker.app" className="text-sm text-[#1a9c5b] hover:underline font-medium">Send Email →</a>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>

        {submitted ? (
          <Card>
            <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-[#1a9c5b]" />
              <p className="text-xl font-semibold text-gray-900">Message Sent!</p>
              <p className="text-gray-500">We'll get back to you within 1 business day.</p>
              <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                Send Another
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                    <Input
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
                  <Input
                    required
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
                  <Textarea
                    required
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your question or issue..."
                    rows={5}
                  />
                </div>
                <Button type="submit" className="bg-[#1a9c5b] hover:bg-[#158a4e] w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}