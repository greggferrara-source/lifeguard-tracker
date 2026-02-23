import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Search, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

const blogPosts = [
  {
    id: "post-1",
    title: "Summer Lifeguard Scheduling: Best Practices & Tips",
    excerpt: "Master seasonal lifeguard scheduling with proven strategies for managing peak summer staffing, preventing burnout, and maintaining excellent customer service.",
    slug: "BlogPost1",
    date: "Jan 15, 2026",
    readTime: 6,
    category: "Scheduling",
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=500&fit=crop"
  },
  {
    id: "post-2",
    title: "Lifeguard Certification Guide: CPR, First Aid, and More",
    excerpt: "Complete overview of lifeguard certifications required for compliance, including CPR, First Aid, Lifeguard, and Pool Operator certifications with renewal timelines.",
    slug: "BlogPost2",
    date: "Jan 18, 2026",
    readTime: 8,
    category: "Certification",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=500&fit=crop"
  },
  {
    id: "post-3",
    title: "OSHA Compliance for Aquatic Facilities: Complete Checklist",
    excerpt: "Detailed OSHA compliance requirements for pools and aquatic facilities, including staffing, water quality, safety equipment, and documentation standards.",
    slug: "BlogPost3",
    date: "Jan 22, 2026",
    readTime: 10,
    category: "Compliance",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop"
  },
  {
    id: "post-4",
    title: "GPS Tracking for Lifeguards: Benefits, Privacy & Implementation",
    excerpt: "Explore how GPS tracking improves lifeguard accountability, ensures proper zone coverage, and maintains facility safety while respecting privacy concerns.",
    slug: "BlogPost4",
    date: "Jan 25, 2026",
    readTime: 7,
    category: "Technology",
    image: "https://images.unsplash.com/photo-1526374965328-7f5ae4e8e90f?w=800&h=500&fit=crop"
  },
  {
    id: "post-5",
    title: "Pool Chemical Testing: MAHC Standards and Documentation",
    excerpt: "Master pool chemical testing with MAHC standards, required parameters, testing frequency, and proper logging procedures for compliance and safety.",
    slug: "BlogPost5",
    date: "Jan 28, 2026",
    readTime: 8,
    category: "Compliance",
    image: "https://images.unsplash.com/photo-1576157192033-3541bc2af55f?w=800&h=500&fit=crop"
  },
  {
    id: "post-6",
    title: "Water Park Operations: Staffing, Safety & Guest Management",
    excerpt: "Comprehensive guide to water park operations including optimal staffing ratios, safety protocols, guest communication, and incident response procedures.",
    slug: "BlogPost6",
    date: "Feb 1, 2026",
    readTime: 9,
    category: "Operations",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=500&fit=crop"
  },
  {
    id: "post-7",
    title: "Lifeguard Staffing Solutions: Preventing Shortages & Burnout",
    excerpt: "Strategic approaches to lifeguard recruitment, retention, scheduling optimization, and preventing burnout to maintain consistent facility staffing.",
    slug: "BlogPost7",
    date: "Feb 4, 2026",
    readTime: 7,
    category: "Staffing",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop"
  },
  {
    id: "post-8",
    title: "Aquatic Facility Compliance: MAHC vs OSHA Requirements",
    excerpt: "Understand the differences between MAHC and OSHA compliance requirements for aquatic facilities, and how to maintain both standards simultaneously.",
    slug: "BlogPost8",
    date: "Feb 7, 2026",
    readTime: 9,
    category: "Compliance",
    image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&h=500&fit=crop"
  },
  {
    id: "post-9",
    title: "Digital Transformation for Pool Managers: Technology ROI",
    excerpt: "How pool and aquatic facility managers are leveraging digital tools to reduce administrative burden, improve safety, and increase operational efficiency.",
    slug: "BlogPost9",
    date: "Feb 10, 2026",
    readTime: 8,
    category: "Technology",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=500&fit=crop"
  },
  {
    id: "post-10",
    title: "Incident Reporting Best Practices for Aquatic Facilities",
    excerpt: "Essential incident reporting procedures for pools and beaches, including documentation requirements, follow-up protocols, and legal considerations.",
    slug: "BlogPost10",
    date: "Feb 13, 2026",
    readTime: 7,
    category: "Safety",
    image: "https://images.unsplash.com/photo-1576091160683-112943ae9537?w=800&h=500&fit=crop"
  },
  {
    id: "post-11",
    title: "Employee Training Programs for Aquatic Staff: Building Excellence",
    excerpt: "Design and implement comprehensive training programs for lifeguards and aquatic staff, including competency assessments and continuing education.",
    slug: "BlogPost11",
    date: "Feb 16, 2026",
    readTime: 8,
    category: "Training",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop"
  },
  {
    id: "post-12",
    title: "Recreation Center Management: Multi-Facility Best Practices",
    excerpt: "Strategies for managing multiple recreation centers and aquatic facilities, including centralized scheduling, compliance tracking, and performance metrics.",
    slug: "BlogPost12",
    date: "Feb 19, 2026",
    readTime: 9,
    category: "Management",
    image: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=800&h=500&fit=crop"
  }
];

export default function Blog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  
  const categories = ["all", ...new Set(blogPosts.map(p => p.category))];
  
  const filtered = useMemo(() => {
    return blogPosts.filter(post => {
      const matchSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === "all" || post.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category]);
  
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
            LifeGuard Tracker Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Industry insights, best practices, and expert tips for lifeguard scheduling, pool management, and aquatic facility operations.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="space-y-4 mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search blog posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? "bg-[#1a9c5b] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <p className="text-sm text-gray-500 mb-8">
          Showing {filtered.length} of {blogPosts.length} articles
        </p>

        {/* Blog Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(post => (
              <Link
                key={post.id}
                to={createPageUrl(post.slug)}
                className="group rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-block bg-[#1a9c5b] text-white text-xs font-bold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-[#1a9c5b] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {post.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime} min
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 flex items-center gap-2 text-[#1a9c5b] font-semibold text-sm group-hover:gap-3 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}