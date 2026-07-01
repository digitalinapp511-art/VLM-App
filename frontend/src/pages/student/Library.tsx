import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Search, SlidersHorizontal, BookOpen, 
  FileText, PlayCircle, ClipboardCheck, HelpCircle, 
  Book, Clipboard, Star, Percent, Briefcase, 
  LayoutList, Bookmark, FileCheck, FileEdit, Zap, 
  ListTodo, Award, Library as LibraryIcon, Bell, Download, Eye, X, ZoomIn, ZoomOut, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { bgCss } from "@/helper/CssHelper";
import { cn } from "@/lib/utils";

type MaterialType = {
  id: string;
  name: string;
  desc?: string;
  icon: any;
  color: string;
  borderGlow: string;
  bgColor: string;
  iconColor: string;
};

type SubjectItem = {
  name: string;
  count: string;
  color: string;
  icon?: any;
};

type ChapterItem = {
  id: string;
  chNumber: string;
  title: string;
  pages: string;
  size: string;
  type: string;
  textSnippet: string;
};

export default function Library() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassTab, setSelectedClassTab] = useState("All");
  const [selectedFilterTab, setSelectedFilterTab] = useState("All");

  // Simulated Downloader States
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [downloadCompleted, setDownloadCompleted] = useState<Record<string, boolean>>({});

  // Simulated PDF Reader States
  const [readingChapter, setReadingChapter] = useState<ChapterItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  const materialTypes: MaterialType[] = [
    { 
      id: "pdf-notes", 
      name: "PDF Notes", 
      icon: FileText, 
      color: "text-red-400",
      iconColor: "text-red-400",
      borderGlow: "border-red-500/20 hover:border-red-500/40",
      bgColor: "bg-red-950/10" 
    },
    { 
      id: "chapter-notes", 
      name: "Chapter Notes", 
      icon: BookOpen, 
      color: "text-yellow-400",
      iconColor: "text-yellow-400",
      borderGlow: "border-yellow-500/20 hover:border-yellow-500/40",
      bgColor: "bg-yellow-950/10" 
    },
    { 
      id: "video-lessons", 
      name: "Video Lessons", 
      icon: PlayCircle, 
      color: "text-green-400",
      iconColor: "text-green-400",
      borderGlow: "border-green-500/20 hover:border-green-500/40",
      bgColor: "bg-green-950/10" 
    },
    { 
      id: "pyq", 
      name: "Previous Year Papers", 
      icon: ClipboardCheck, 
      color: "text-purple-400",
      iconColor: "text-purple-400",
      borderGlow: "border-purple-500/20 hover:border-purple-500/40",
      bgColor: "bg-purple-950/10" 
    },
    { 
      id: "qbank", 
      name: "Question Bank", 
      icon: HelpCircle, 
      color: "text-orange-400",
      iconColor: "text-orange-400",
      borderGlow: "border-orange-500/20 hover:border-orange-500/40",
      bgColor: "bg-orange-950/10" 
    },
    { 
      id: "textbooks", 
      name: "Textbooks", 
      icon: Book, 
      color: "text-blue-400",
      iconColor: "text-blue-400",
      borderGlow: "border-blue-500/20 hover:border-blue-500/40",
      bgColor: "bg-blue-950/10" 
    },
    { 
      id: "mock-tests", 
      name: "Mock Tests", 
      icon: Clipboard, 
      color: "text-lime-400",
      iconColor: "text-lime-400",
      borderGlow: "border-lime-500/20 hover:border-lime-500/40",
      bgColor: "bg-lime-950/10" 
    },
    { 
      id: "revision", 
      name: "Revision Material", 
      icon: BookOpen, 
      color: "text-pink-400",
      iconColor: "text-pink-400",
      borderGlow: "border-pink-500/20 hover:border-pink-500/40",
      bgColor: "bg-pink-950/10" 
    },
    { 
      id: "imp-questions", 
      name: "Important Questions", 
      icon: Star, 
      color: "text-amber-400",
      iconColor: "text-amber-400",
      borderGlow: "border-amber-500/20 hover:border-amber-500/40",
      bgColor: "bg-amber-950/10" 
    },
    { 
      id: "formula", 
      name: "Formula Sheets", 
      icon: Percent, 
      color: "text-cyan-400",
      iconColor: "text-cyan-400",
      borderGlow: "border-cyan-500/20 hover:border-cyan-500/40",
      bgColor: "bg-cyan-950/10" 
    },
    { 
      id: "assignments", 
      name: "Assignments", 
      icon: Briefcase, 
      color: "text-sky-400",
      iconColor: "text-sky-400",
      borderGlow: "border-sky-500/20 hover:border-sky-500/40",
      bgColor: "bg-sky-950/10" 
    },
    { 
      id: "worksheets", 
      name: "Worksheets", 
      icon: LayoutList, 
      color: "text-amber-500",
      iconColor: "text-amber-500",
      borderGlow: "border-amber-500/20 hover:border-amber-500/40",
      bgColor: "bg-amber-950/10" 
    },
    { 
      id: "ncert", 
      name: "NCERT Solutions", 
      icon: Bookmark, 
      color: "text-violet-400",
      iconColor: "text-violet-400",
      borderGlow: "border-violet-500/20 hover:border-violet-500/40",
      bgColor: "bg-violet-950/10" 
    },
    { 
      id: "sample-papers", 
      name: "Sample Papers", 
      icon: FileCheck, 
      color: "text-emerald-400",
      iconColor: "text-emerald-400",
      borderGlow: "border-emerald-500/20 hover:border-emerald-500/40",
      bgColor: "bg-emerald-950/10" 
    },
    { 
      id: "practice", 
      name: "Practice Papers", 
      icon: FileEdit, 
      color: "text-fuchsia-400",
      iconColor: "text-fuchsia-400",
      borderGlow: "border-fuchsia-500/20 hover:border-fuchsia-500/40",
      bgColor: "bg-fuchsia-950/10" 
    },
    { 
      id: "oneshot", 
      name: "One-shot Revision Notes", 
      icon: Zap, 
      color: "text-cyan-400",
      iconColor: "text-cyan-400",
      borderGlow: "border-cyan-500/20 hover:border-cyan-500/40",
      bgColor: "bg-cyan-950/10" 
    },
    { 
      id: "summary", 
      name: "Chapter Summary Notes", 
      icon: ListTodo, 
      color: "text-teal-400",
      iconColor: "text-teal-400",
      borderGlow: "border-teal-500/20 hover:border-teal-500/40",
      bgColor: "bg-teal-950/10" 
    },
    { 
      id: "foundation", 
      name: "Competitive Foundation Material", 
      icon: Award, 
      color: "text-amber-400",
      iconColor: "text-amber-400",
      borderGlow: "border-amber-500/20 hover:border-amber-500/40",
      bgColor: "bg-amber-950/10" 
    }
  ];

  const classTabs = ["All", "Class 6-8", "Class 9-10", "Class 11-12", "Competitive"];

  const subjectsMockData = {
    pdf: [
      { name: "Mathematics", count: "245 PDF Notes", color: "text-blue-400" },
      { name: "Science", count: "198 PDF Notes", color: "text-green-400" },
      { name: "English", count: "156 PDF Notes", color: "text-yellow-400" },
      { name: "Social Science", count: "183 PDF Notes", color: "text-purple-400" },
      { name: "Computer Science", count: "89 PDF Notes", color: "text-red-400" },
      { name: "Hindi", count: "112 PDF Notes", color: "text-cyan-400" },
      { name: "Economics", count: "76 PDF Notes", color: "text-orange-400" },
      { name: "Biology", count: "134 PDF Notes", color: "text-pink-400" },
      { name: "Chemistry", count: "121 PDF Notes", color: "text-lime-400" },
      { name: "Physics", count: "118 PDF Notes", color: "text-sky-400" }
    ],
    chapters: [
      { name: "Mathematics", count: "248 Chapters", color: "text-blue-400" },
      { name: "Science", count: "215 Chapters", color: "text-green-400" },
      { name: "English", count: "186 Chapters", color: "text-yellow-400" },
      { name: "Social Science", count: "210 Chapters", color: "text-purple-400" },
      { name: "Computer Science", count: "132 Chapters", color: "text-red-400" },
      { name: "Hindi", count: "124 Chapters", color: "text-cyan-400" },
      { name: "Economics", count: "98 Chapters", color: "text-orange-400" },
      { name: "Biology", count: "156 Chapters", color: "text-pink-400" },
      { name: "Chemistry", count: "142 Chapters", color: "text-lime-400" },
      { name: "Physics", count: "138 Chapters", color: "text-sky-400" }
    ],
    videos: [
      { name: "Mathematics", count: "428 Videos", color: "text-blue-400" },
      { name: "Science", count: "362 Videos", color: "text-green-400" },
      { name: "English", count: "274 Videos", color: "text-yellow-400" },
      { name: "Social Science", count: "315 Videos", color: "text-purple-400" },
      { name: "Computer Science", count: "198 Videos", color: "text-red-400" },
      { name: "Hindi", count: "186 Videos", color: "text-cyan-400" },
      { name: "Economics", count: "154 Videos", color: "text-orange-400" },
      { name: "Biology", count: "220 Videos", color: "text-pink-400" },
      { name: "Chemistry", count: "198 Videos", color: "text-lime-400" },
      { name: "Physics", count: "185 Videos", color: "text-sky-400" }
    ],
    papers: [
      { name: "Mathematics", count: "245 Papers", color: "text-blue-400" },
      { name: "Science", count: "198 Papers", color: "text-green-400" },
      { name: "English", count: "156 Papers", color: "text-yellow-400" },
      { name: "Social Science", count: "183 Papers", color: "text-purple-400" },
      { name: "Computer Science", count: "89 Papers", color: "text-red-400" },
      { name: "Hindi", count: "112 Papers", color: "text-cyan-400" },
      { name: "Economics", count: "76 Papers", color: "text-orange-400" },
      { name: "Biology", count: "134 Papers", color: "text-pink-400" },
      { name: "Chemistry", count: "121 Papers", color: "text-lime-400" },
      { name: "Physics", count: "118 Papers", color: "text-sky-400" }
    ]
  };

  // Mock chapters list depending on the clicked subject
  const getSubjectChapters = (subjectName: string): ChapterItem[] => {
    if (subjectName === "Mathematics") {
      return [
        { id: "m-ch-1", chNumber: "CH 01", title: "Real Numbers", pages: "14 Pages", size: "2.4 MB", type: "Detailed Notes", textSnippet: "Chapter 1 covers Euclid's Division Lemma, Fundamental Theorem of Arithmetic, revisiting irrational numbers, and rational numbers and their decimal expansions." },
        { id: "m-ch-2", chNumber: "CH 02", title: "Polynomials", pages: "10 Pages", size: "1.8 MB", type: "Summary Notes", textSnippet: "Chapter 2 defines geometrical meaning of zeroes of a polynomial, relationship between zeroes and coefficients of quadratic and cubic polynomials." },
        { id: "m-ch-3", chNumber: "CH 03", title: "Pair of Linear Equations", pages: "18 Pages", size: "3.1 MB", type: "Detailed Notes", textSnippet: "Chapter 3 teaches graphical method of solution of a pair of linear equations, algebraic methods of solving linear equations: substitution and elimination." },
        { id: "m-ch-4", chNumber: "CH 04", title: "Quadratic Equations", pages: "12 Pages", size: "2.2 MB", type: "Formula Sheets", textSnippet: "Chapter 4 includes quadratic formulas, factorization, nature of roots, discriminant equations, and real-life problems of quadratic models." },
        { id: "m-ch-5", chNumber: "CH 05", title: "Arithmetic Progressions", pages: "15 Pages", size: "2.7 MB", type: "Detailed Notes", textSnippet: "Chapter 5 defines the general form of an Arithmetic Progression, finding the nth term, and the sum of first n terms of an AP." },
        { id: "m-ch-6", chNumber: "CH 06", title: "Triangles", pages: "22 Pages", size: "3.8 MB", type: "Detailed Notes", textSnippet: "Chapter 6 studies similar figures, similarity of triangles, criteria for similarity, areas of similar triangles, and Pythagoras theorem proofs." },
        { id: "m-ch-7", chNumber: "CH 07", title: "Coordinate Geometry", pages: "11 Pages", size: "1.9 MB", type: "Formula Sheets", textSnippet: "Chapter 7 provides coordinate models, Distance Formula, Section Formula, midpoint formula, and Area of Triangles on coordinate axes." }
      ];
    } else {
      // science or other subjects
      return [
        { id: "s-ch-1", chNumber: "CH 01", title: "Chemical Reactions & Equations", pages: "16 Pages", size: "2.8 MB", type: "Detailed Notes", textSnippet: "This chapter covers writing chemical equations, balanced chemical equations, types of chemical reactions, combination, decomposition, displacement, and oxidation." },
        { id: "s-ch-2", chNumber: "CH 02", title: "Acids, Bases & Salts", pages: "14 Pages", size: "2.5 MB", type: "Detailed Notes", textSnippet: "Understanding chemical properties of acids and bases, reaction of acids with metals, pH scale, importance of pH in everyday life, and common salt derivatives." },
        { id: "s-ch-3", chNumber: "CH 03", title: "Metals & Non-Metals", pages: "12 Pages", size: "2.1 MB", type: "Summary Notes", textSnippet: "Physical and chemical properties of metals and non-metals, reactivity series, occurrence of metals, extraction, refining, and corrosion prevention." },
        { id: "s-ch-4", chNumber: "CH 04", title: "Life Processes", pages: "24 Pages", size: "4.2 MB", type: "Detailed Notes", textSnippet: "Maintenance functions in living organisms: nutrition (autotrophic & heterotrophic), respiration, transportation in humans and plants, and excretion." }
      ];
    }
  };

  const getFilteredItems = (items: any[]) => {
    if (!searchQuery) return items;
    return items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const getFilteredChapters = (chapters: ChapterItem[]) => {
    let list = chapters;
    if (searchQuery) {
      list = list.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.chNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedFilterTab !== "All") {
      list = list.filter(c => c.type === selectedFilterTab);
    }
    return list;
  };

  const triggerDownload = (chId: string) => {
    if (downloadCompleted[chId]) return;
    
    // Simulate loading progress
    setDownloadProgress(prev => ({ ...prev, [chId]: 5 }));
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        const current = prev[chId] || 0;
        if (current >= 100) {
          clearInterval(interval);
          setDownloadCompleted(c => ({ ...c, [chId]: true }));
          return prev;
        }
        return { ...prev, [chId]: current + 20 };
      });
    }, 200);
  };

  return (
    <div className={cn("min-h-svh w-full text-white flex flex-col px-6 pb-28 overflow-x-hidden relative", bgCss)}>
      
      {/* Background Decor */}
      <div className="absolute top-[5%] left-[-10%] h-64 w-64 bg-cyan-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-10%] h-64 w-64 bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto flex flex-col gap-6">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center justify-between pt-8 pb-1 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-xl border-white/10 bg-white/5 text-white shrink-0 active:scale-95 transition-all" 
            onClick={() => {
              if (readingChapter) {
                setReadingChapter(null);
              } else if (selectedSubject) {
                setSelectedSubject(null);
                setSearchQuery("");
              } else if (selectedCategory) {
                setSelectedCategory(null);
                setSearchQuery("");
              } else {
                navigate(PATHS.STUDENT_DASHBOARD);
              }
            }}
          >
            <ChevronLeft size={20} />
          </Button>
          
          <h1 className="text-sm font-black tracking-widest text-white/90 uppercase drop-shadow-sm">
            {readingChapter 
              ? `Reading ${readingChapter.chNumber}` 
              : selectedSubject 
                ? selectedSubject.name.toUpperCase()
                : selectedCategory 
                  ? selectedCategory.replace("-", " ").toUpperCase() 
                  : "Library"}
          </h1>
          
          <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 active:scale-95 transition-all hover:bg-white/10">
            <SlidersHorizontal size={18} />
          </button>
        </header>

        {/* ── 1. MAIN MENU VIEW ── */}
        {!selectedCategory && !selectedSubject && !readingChapter && (
          <>
            <div className="space-y-0.5 mb-2 text-left">
              <h2 className="text-2xl font-extrabold tracking-wider uppercase text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                Study Material Types
              </h2>
            </div>

            <main className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {materialTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card 
                    key={type.id}
                    onClick={() => {
                      if (["pdf-notes", "chapter-notes", "video-lessons", "pyq"].includes(type.id)) {
                        setSelectedCategory(type.id);
                      }
                    }}
                    className={cn(
                      "group border bg-[#1a1a1a]/30 backdrop-blur-xl rounded-[1rem] transition-all p-3 flex flex-row items-center gap-3 active:scale-[0.97] cursor-pointer",
                      type.borderGlow
                    )}
                  >
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center border border-white/5 shrink-0", type.bgColor)}>
                      <IconComponent size={16} className={type.iconColor} />
                    </div>
                    <span className="text-xs font-black tracking-wide text-white/95 text-left leading-tight">
                      {type.name}
                    </span>
                  </Card>
                );
              })}
            </main>
          </>
        )}

        {/* ── 2. SUBJECT LIST VIEW ── */}
        {selectedCategory && !selectedSubject && !readingChapter && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={cn(
              "flex gap-4 items-start text-left p-5 rounded-[2rem] border border-white/5",
              selectedCategory === "pdf-notes" && "bg-red-950/10 border-red-500/10",
              selectedCategory === "chapter-notes" && "bg-yellow-950/10 border-yellow-500/10",
              selectedCategory === "video-lessons" && "bg-green-950/10 border-green-500/10",
              selectedCategory === "pyq" && "bg-purple-950/10 border-purple-500/10"
            )}>
              <div className={cn(
                "h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0",
                selectedCategory === "pdf-notes" && "bg-red-500/10 border-red-500/20 text-red-400",
                selectedCategory === "chapter-notes" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
                selectedCategory === "video-lessons" && "bg-green-500/10 border-green-500/20 text-green-400",
                selectedCategory === "pyq" && "bg-purple-500/10 border-purple-500/20 text-purple-400"
              )}>
                {selectedCategory === "pdf-notes" && <FileText className="h-6 w-6" />}
                {selectedCategory === "chapter-notes" && <BookOpen className="h-6 w-6" />}
                {selectedCategory === "video-lessons" && <PlayCircle className="h-6 w-6" />}
                {selectedCategory === "pyq" && <ClipboardCheck className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white leading-tight">
                  {selectedCategory === "pdf-notes" && "PDF Notes"}
                  {selectedCategory === "chapter-notes" && "Chapter Notes"}
                  {selectedCategory === "video-lessons" && "Video Lessons"}
                  {selectedCategory === "pyq" && "Previous Year Papers"}
                </h3>
                <p className="text-xs text-white/45 leading-snug">
                  {selectedCategory === "pdf-notes" && "High-quality PDF notes for all subjects and chapters."}
                  {selectedCategory === "chapter-notes" && "Detailed chapter-wise notes to understand concepts in depth."}
                  {selectedCategory === "video-lessons" && "Concept-based video lessons explained by expert teachers."}
                  {selectedCategory === "pyq" && "Access previous year question papers to understand exam pattern better."}
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Subjects..." 
                className="pl-10 h-12 bg-white/[0.03] border-white/5 rounded-full text-sm focus-visible:ring-cyan-500/20"
              />
            </div>

            {/* Class filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {classTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedClassTab(tab)}
                  className={cn(
                    "px-4 h-8 rounded-full text-[10px] font-black tracking-widest uppercase border shrink-0 transition-all",
                    selectedClassTab === tab 
                      ? "bg-cyan-500 border-none text-black shadow-md shadow-cyan-500/20"
                      : "bg-white/5 border-white/5 text-white/60 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Subjects List */}
            <div className="flex flex-col gap-3">
              {getFilteredItems(
                selectedCategory === "pdf-notes" 
                  ? subjectsMockData.pdf 
                  : selectedCategory === "chapter-notes"
                    ? subjectsMockData.chapters
                    : selectedCategory === "video-lessons"
                      ? subjectsMockData.videos
                      : subjectsMockData.papers
              ).map((sub, idx) => (
                <Card 
                  key={idx}
                  onClick={() => setSelectedSubject(sub)}
                  className="bg-white/[0.02] border border-white/5 rounded-[1.5rem] hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        <Book className={sub.color} size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                        <span className="text-[10px] text-white/40 block mt-0.5">{sub.count}</span>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-white/20 rotate-180" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. INSIDE SUBJECT VIEW (CHAPTER LIST) ── */}
        {selectedSubject && !readingChapter && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Subject Banner card */}
            <div className="text-left bg-gradient-to-r from-cyan-950/20 to-purple-950/10 border border-cyan-500/10 p-6 rounded-[2rem] space-y-2 relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] h-32 w-32 bg-cyan-500/5 rounded-full blur-2xl" />
              <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">
                {selectedCategory?.replace("-", " ")}
              </span>
              <h2 className="text-2xl font-black text-white">{selectedSubject.name}</h2>
              <p className="text-xs text-white/50">
                Class 10th • Complete syllabus study material, formula sheets & summary guides.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Chapters..." 
                className="pl-10 h-12 bg-white/[0.03] border-white/5 rounded-full text-sm focus-visible:ring-cyan-500/20"
              />
            </div>

            {/* Sub-Filters Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {["All", "Detailed Notes", "Summary Notes", "Formula Sheets"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilterTab(tab)}
                  className={cn(
                    "px-4 h-8 rounded-full text-[10px] font-black tracking-widest uppercase border shrink-0 transition-all",
                    selectedFilterTab === tab 
                      ? "bg-cyan-400 border-none text-black font-extrabold"
                      : "bg-white/5 border-white/5 text-white/60 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Chapter Items List */}
            <div className="flex flex-col gap-4">
              {getFilteredChapters(getSubjectChapters(selectedSubject.name)).map((ch) => {
                const progress = downloadProgress[ch.id] || 0;
                const isDone = downloadCompleted[ch.id] || false;
                return (
                  <Card 
                    key={ch.id}
                    className="bg-[#1a1a1a]/30 border border-white/5 rounded-[1.8rem] overflow-hidden p-5 flex flex-col gap-4 text-left relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {ch.chNumber}
                        </span>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {ch.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                        {ch.type}
                      </span>
                    </div>

                    <p className="text-xs text-white/45 leading-relaxed">
                      {ch.textSnippet}
                    </p>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                      <div className="flex items-center gap-3 text-[10px] text-white/40 font-semibold tracking-wider">
                        <span>{ch.pages}</span>
                        <span className="h-1.5 w-1.5 bg-white/10 rounded-full" />
                        <span>{ch.size}</span>
                      </div>

                      {/* PDF Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => triggerDownload(ch.id)}
                          className={cn(
                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95",
                            isDone 
                              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-white/5 border border-white/10 hover:bg-white/10 text-white/90"
                          )}
                        >
                          {progress > 0 && progress < 100 ? (
                            <span className="animate-pulse">Loading {progress}%</span>
                          ) : isDone ? (
                            <>
                              <Check size={12} strokeWidth={3} />
                              Open
                            </>
                          ) : (
                            <>
                              <Download size={12} />
                              Download
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setReadingChapter(ch)}
                          className="h-9 px-4 rounded-xl bg-cyan-400 text-black font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-cyan-300 transition-all active:scale-95 border-none"
                        >
                          <Eye size={12} />
                          Read
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 4. FULL-SCREEN SIMULATED PDF READER ── */}
        {readingChapter && (
          <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col animate-in fade-in zoom-in-95 duration-300">
            {/* Reader Header */}
            <header className="flex w-full items-center justify-between px-6 pt-8 pb-4 border-b border-white/5 bg-black/40 backdrop-blur-md">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 rounded-xl border-white/10 bg-white/5 text-white"
                onClick={() => setReadingChapter(null)}
              >
                <X size={18} />
              </Button>
              <div className="text-center flex-1 px-3">
                <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">
                  {selectedSubject?.name} • {readingChapter.chNumber}
                </span>
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">
                  {readingChapter.title}
                </h3>
              </div>
              <div className="flex gap-1.5">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl border-white/10 bg-white/5 text-white active:scale-95"
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                >
                  <ZoomOut size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl border-white/10 bg-white/5 text-white active:scale-95"
                  onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                >
                  <ZoomIn size={16} />
                </Button>
              </div>
            </header>

            {/* Reader Simulated Document Content */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start scroll-smooth">
              <div 
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-md bg-white text-slate-900 rounded-[2rem] p-8 shadow-2xl min-h-[600px] text-left transition-transform duration-300 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Decorative Header */}
                  <div className="border-b-2 border-cyan-500 pb-3 flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-cyan-600 uppercase">VLM Academy Study Guide</span>
                    <span className="text-[10px] font-semibold text-slate-400">Page 1 of {readingChapter.pages.split(" ")[0]}</span>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-slate-800 leading-tight">
                    {readingChapter.chNumber}: {readingChapter.title}
                  </h1>

                  <div className="space-y-4 text-sm leading-relaxed text-slate-600 font-medium">
                    <p className="font-semibold text-slate-800 italic">
                      Overview & Key Objectives:
                    </p>
                    <p>{readingChapter.textSnippet}</p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam elementum dolor ac leo eleifend, ut ultrices diam vulputate. Duis egestas nisl eget interdum pulvinar. Mauris at metus arcu.
                    </p>
                    <p className="font-semibold text-slate-800 mt-4">
                      Core Formulas and Concepts:
                    </p>
                    <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 font-mono text-xs text-cyan-900 leading-normal">
                      {selectedSubject?.name === "Mathematics" ? (
                        <>
                          • Discriminant: D = b² - 4ac<br />
                          • Quadratic Formula: x = (-b ± √D) / 2a<br />
                          • Arithmetic Series Sum: Sn = n/2 [2a + (n-1)d]
                        </>
                      ) : (
                        <>
                          • Photosynthesis: 6CO2 + 6H2O → C6H12O6 + 6O2<br />
                          • Ohm's Law: V = I × R<br />
                          • Balance Equation: Fe + CuSO4 → FeSO4 + Cu
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer brand */}
                <div className="border-t border-slate-100 pt-4 text-center">
                  <span className="text-[9px] font-black tracking-[0.2em] text-cyan-600 uppercase">
                    Unlocked via VLM Reward Points
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
