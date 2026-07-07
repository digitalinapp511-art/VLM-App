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
      color: "text-red-600 dark:text-red-400",
      iconColor: "text-red-600 dark:text-red-400",
      borderGlow: "",
      bgColor: "bg-red-50 dark:bg-red-950/30" 
    },
    { 
      id: "chapter-notes", 
      name: "Chapter Notes", 
      icon: BookOpen, 
      color: "text-yellow-600 dark:text-yellow-450",
      iconColor: "text-yellow-600 dark:text-yellow-450",
      borderGlow: "",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30" 
    },
    { 
      id: "video-lessons", 
      name: "Video Lessons", 
      icon: PlayCircle, 
      color: "text-green-600 dark:text-green-400",
      iconColor: "text-green-600 dark:text-green-400",
      borderGlow: "",
      bgColor: "bg-green-50 dark:bg-green-950/30" 
    },
    { 
      id: "pyq", 
      name: "Previous Year Papers", 
      icon: ClipboardCheck, 
      color: "text-purple-600 dark:text-purple-400",
      iconColor: "text-purple-600 dark:text-purple-400",
      borderGlow: "",
      bgColor: "bg-purple-50 dark:bg-purple-950/30" 
    },
    { 
      id: "qbank", 
      name: "Question Bank", 
      icon: HelpCircle, 
      color: "text-orange-600 dark:text-orange-400",
      iconColor: "text-orange-600 dark:text-orange-400",
      borderGlow: "",
      bgColor: "bg-orange-50 dark:bg-orange-950/30" 
    },
    { 
      id: "textbooks", 
      name: "Textbooks", 
      icon: Book, 
      color: "text-blue-600 dark:text-blue-400",
      iconColor: "text-blue-600 dark:text-blue-400",
      borderGlow: "",
      bgColor: "bg-blue-50 dark:bg-blue-950/30" 
    },
    { 
      id: "mock-tests", 
      name: "Mock Tests", 
      icon: Clipboard, 
      color: "text-lime-600 dark:text-lime-400",
      iconColor: "text-lime-600 dark:text-lime-400",
      borderGlow: "",
      bgColor: "bg-lime-50 dark:bg-lime-950/30" 
    },
    { 
      id: "revision", 
      name: "Revision Material", 
      icon: BookOpen, 
      color: "text-pink-650 dark:text-pink-400",
      iconColor: "text-pink-650 dark:text-pink-400",
      borderGlow: "",
      bgColor: "bg-pink-50 dark:bg-pink-950/30" 
    },
    { 
      id: "imp-questions", 
      name: "Important Questions", 
      icon: Star, 
      color: "text-amber-600 dark:text-amber-400",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderGlow: "",
      bgColor: "bg-amber-50 dark:bg-amber-950/30" 
    },
    { 
      id: "formula", 
      name: "Formula Sheets", 
      icon: Percent, 
      color: "text-cyan-600 dark:text-cyan-400",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      borderGlow: "",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30" 
    },
    { 
      id: "assignments", 
      name: "Assignments", 
      icon: Briefcase, 
      color: "text-sky-650 dark:text-sky-400",
      iconColor: "text-sky-650 dark:text-sky-400",
      borderGlow: "",
      bgColor: "bg-sky-50 dark:bg-sky-950/30" 
    },
    { 
      id: "worksheets", 
      name: "Worksheets", 
      icon: LayoutList, 
      color: "text-yellow-600 dark:text-yellow-450",
      iconColor: "text-yellow-600 dark:text-yellow-450",
      borderGlow: "",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30" 
    },
    { 
      id: "ncert", 
      name: "NCERT Solutions", 
      icon: Bookmark, 
      color: "text-violet-600 dark:text-violet-400",
      iconColor: "text-violet-600 dark:text-violet-400",
      borderGlow: "",
      bgColor: "bg-violet-50 dark:bg-violet-950/30" 
    },
    { 
      id: "sample-papers", 
      name: "Sample Papers", 
      icon: FileCheck, 
      color: "text-emerald-600 dark:text-emerald-400",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderGlow: "",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30" 
    },
    { 
      id: "practice", 
      name: "Practice Papers", 
      icon: FileEdit, 
      color: "text-fuchsia-600 dark:text-fuchsia-400",
      iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
      borderGlow: "",
      bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30" 
    },
    { 
      id: "oneshot", 
      name: "One-shot Revision Notes", 
      icon: Zap, 
      color: "text-cyan-600 dark:text-cyan-400",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      borderGlow: "",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30" 
    },
    { 
      id: "summary", 
      name: "Chapter Summary Notes", 
      icon: ListTodo, 
      color: "text-teal-600 dark:text-teal-400",
      iconColor: "text-teal-600 dark:text-teal-400",
      borderGlow: "",
      bgColor: "bg-teal-50 dark:bg-teal-950/30" 
    },
    { 
      id: "foundation", 
      name: "Competitive Foundation Material", 
      icon: Award, 
      color: "text-amber-600 dark:text-amber-400",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderGlow: "",
      bgColor: "bg-amber-50 dark:bg-amber-950/30" 
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
    <div className="min-h-svh w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col px-6 pb-28 overflow-x-hidden relative transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-[5%] left-[-10%] h-64 w-64 bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-10%] h-64 w-64 bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto flex flex-col gap-6">
        
        {/* ── HEADER ── */}
        <header className="flex w-full items-center justify-between pt-8 pb-1 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white shrink-0 active:scale-95 transition-all" 
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
          
          <h1 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100">
            {readingChapter 
              ? `Reading ${readingChapter.chNumber}` 
              : selectedSubject 
                ? selectedSubject.name.toUpperCase()
                : selectedCategory 
                  ? selectedCategory.replace("-", " ").toUpperCase() 
                  : "Library"}
          </h1>
          
          <button className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white shrink-0 active:scale-95 transition-all">
            <SlidersHorizontal size={18} />
          </button>
        </header>

        {/* ── 1. MAIN MENU VIEW ── */}
        {!selectedCategory && !selectedSubject && !readingChapter && (
          <>
            <div className="space-y-0.5 mb-2 text-left">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
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
                    className="group bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-2xl transition-all p-3.5 flex flex-row items-center gap-3 active:scale-[0.97] cursor-pointer shadow-sm"
                  >
                    <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm", type.bgColor)}>
                      <IconComponent size={16} className={type.color} />
                    </div>
                    <span className="text-xs font-black tracking-wide text-slate-800 dark:text-slate-100 text-left leading-tight">
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
            <div className="flex gap-4 items-start text-left p-5 rounded-3xl border border-slate-100 dark:border-[#221c4e] bg-white dark:bg-[#161233] shadow-sm">
              <div className={cn(
                "h-12 w-12 rounded-2xl border flex items-center justify-center shrink-0",
                selectedCategory === "pdf-notes" && "bg-red-500/10 border-red-500/20 text-red-650 dark:text-red-400",
                selectedCategory === "chapter-notes" && "bg-yellow-500/10 border-yellow-500/20 text-yellow-655 dark:text-yellow-400",
                selectedCategory === "video-lessons" && "bg-green-500/10 border-green-500/20 text-green-650 dark:text-green-400",
                selectedCategory === "pyq" && "bg-purple-500/10 border-purple-500/20 text-purple-650 dark:text-purple-400"
              )}>
                {selectedCategory === "pdf-notes" && <FileText className="h-6 w-6" />}
                {selectedCategory === "chapter-notes" && <BookOpen className="h-6 w-6" />}
                {selectedCategory === "video-lessons" && <PlayCircle className="h-6 w-6" />}
                {selectedCategory === "pyq" && <ClipboardCheck className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                  {selectedCategory === "pdf-notes" && "PDF Notes"}
                  {selectedCategory === "chapter-notes" && "Chapter Notes"}
                  {selectedCategory === "video-lessons" && "Video Lessons"}
                  {selectedCategory === "pyq" && "Previous Year Papers"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {selectedCategory === "pdf-notes" && "High-quality PDF notes for all subjects and chapters."}
                  {selectedCategory === "chapter-notes" && "Detailed chapter-wise notes to understand concepts in depth."}
                  {selectedCategory === "video-lessons" && "Concept-based video lessons explained by expert teachers."}
                  {selectedCategory === "pyq" && "Access previous year question papers to understand exam pattern better."}
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Subjects..." 
                className="pl-10 h-11 bg-white dark:bg-[#161233] border-slate-200 dark:border-[#221c4e] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl text-xs focus-visible:ring-violet-500/20 shadow-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {classTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedClassTab(tab)}
                  className={cn(
                    "px-4 h-8 rounded-full text-[10px] font-black tracking-widest uppercase border shrink-0 transition-all",
                    selectedClassTab === tab 
                      ? "bg-violet-600 border-none text-white shadow-md shadow-violet-500/20"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

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
                  className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer shadow-sm"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 shrink-0">
                        <Book className="text-violet-600 dark:text-violet-400" size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{sub.name}</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{sub.count}</span>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-slate-400 rotate-180" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. INSIDE SUBJECT VIEW (CHAPTER LIST) ── */}
        {selectedSubject && !readingChapter && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="text-left bg-gradient-to-r from-violet-600 to-indigo-700 p-6 rounded-3xl space-y-2 relative overflow-hidden shadow-md text-white">
              <div className="absolute right-[-20px] top-[-20px] h-32 w-32 bg-white/10 rounded-full blur-2xl" />
              <span className="text-[9px] font-black tracking-widest text-white/80 uppercase">
                {selectedCategory?.replace("-", " ")}
              </span>
              <h2 className="text-2xl font-black text-white">{selectedSubject.name}</h2>
              <p className="text-xs text-white/90">
                Class 10th • Complete syllabus study material, formula sheets & summary guides.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Chapters..." 
                className="pl-10 h-11 bg-white dark:bg-[#161233] border-slate-200 dark:border-[#221c4e] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl text-xs focus-visible:ring-violet-500/20 shadow-sm"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {["All", "Detailed Notes", "Summary Notes", "Formula Sheets"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilterTab(tab)}
                  className={cn(
                    "px-4 h-8 rounded-full text-[10px] font-black tracking-widest uppercase border shrink-0 transition-all",
                    selectedFilterTab === tab 
                      ? "bg-violet-600 border-none text-white font-extrabold"
                      : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-550 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {getFilteredChapters(getSubjectChapters(selectedSubject.name)).map((ch) => {
                const progress = downloadProgress[ch.id] || 0;
                const isDone = downloadCompleted[ch.id] || false;
                return (
                  <Card 
                    key={ch.id}
                    className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-3xl overflow-hidden p-5 flex flex-col gap-4 text-left relative shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {ch.chNumber}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                          {ch.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                        {ch.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                      {ch.textSnippet}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider">
                        <span>{ch.pages}</span>
                        <span className="h-1.5 w-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <span>{ch.size}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => triggerDownload(ch.id)}
                          className={cn(
                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95",
                            isDone 
                              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                          className="h-9 px-4 rounded-xl bg-violet-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-violet-700 transition-all active:scale-95 border-none"
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
          <div className="fixed inset-0 z-50 bg-[#0b081e] flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <header className="flex w-full items-center justify-between px-6 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#110d2c] backdrop-blur-md">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                onClick={() => setReadingChapter(null)}
              >
                <X size={18} />
              </Button>
              <div className="text-center flex-1 px-3">
                <span className="text-[9px] font-black tracking-widest text-violet-600 dark:text-violet-400 uppercase">
                  {selectedSubject?.name} • {readingChapter.chNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                  {readingChapter.title}
                </h3>
              </div>
              <div className="flex gap-1.5">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 active:scale-95"
                  onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                >
                  <ZoomOut size={16} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 active:scale-95"
                  onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                >
                  <ZoomIn size={16} />
                </Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-start scroll-smooth bg-slate-100 dark:bg-slate-950">
              <div 
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-md bg-white dark:bg-[#161233] text-slate-900 dark:text-slate-100 rounded-3xl p-8 shadow-2xl min-h-[600px] text-left transition-transform duration-300 flex flex-col justify-between border border-slate-100 dark:border-[#221c4e]"
              >
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <span className="text-[10px] font-black tracking-wider text-violet-600 dark:text-violet-400 uppercase">VLM Academy Study Guide</span>
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Page 1 of {readingChapter.pages.split(" ")[0]}</span>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 leading-tight">
                    {readingChapter.chNumber}: {readingChapter.title}
                  </h1>

                  <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 italic">
                      Overview & Key Objectives:
                    </p>
                    <p>{readingChapter.textSnippet}</p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam elementum dolor ac leo eleifend, ut ultrices diam vulputate. Duis egestas nisl eget interdum pulvinar. Mauris at metus arcu.
                    </p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mt-4">
                      Core Formulas and Concepts:
                    </p>
                    <div className="p-4 bg-violet-50 dark:bg-violet-950/20 rounded-2xl border border-violet-100 dark:border-violet-900/30 font-mono text-xs text-violet-900 dark:text-violet-300 leading-normal">
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

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
                  <span className="text-[9px] font-black tracking-[0.2em] text-violet-600 dark:text-violet-400 uppercase">
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
