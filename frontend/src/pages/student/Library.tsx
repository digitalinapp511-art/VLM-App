import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes/paths";
import { 
  ChevronLeft, Search, BookOpen, 
  FileText, PlayCircle, ClipboardCheck, Book, Eye, Download, X, Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { studentApi } from "@/lib/student-api";
import { cn } from "@/lib/utils";

export default function Library() {
  const navigate = useNavigate();
  
  // Navigation states
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // 'note' | 'video' | 'pyq'
  
  const [searchQuery, setSearchQuery] = useState("");

  // 1. Fetch active subjects for student's class
  const { data: subjectsResponse, isLoading: subjectsLoading } = useQuery({
    queryKey: ["studentSubjects"],
    queryFn: () => studentApi.getStudentSubjects(),
  });

  const activeSubjects = subjectsResponse?.data || [];

  // 2. Fetch resources for selected subject
  const { data: resourcesResponse, isLoading: resourcesLoading } = useQuery({
    queryKey: ["studentResources", selectedSubject],
    queryFn: () => studentApi.getResources({ subject: selectedSubject || undefined }),
    enabled: !!selectedSubject,
  });

  const resourcesList = resourcesResponse?.data || [];

  // 3. Document/Video Reader State
  const [readingFile, setReadingFile] = useState<{ title: string; url: string; isVideo?: boolean } | null>(null);

  // Group counts for Step 2 Categories
  const notesCount = resourcesList.filter((r: any) => r.type === "note").length;
  const videosCount = resourcesList.filter((r: any) => r.type === "video").length;
  const pyqsCount = resourcesList.filter((r: any) => r.type === "pyq").length;

  const getFilteredSubjects = () => {
    if (!searchQuery) return activeSubjects;
    return activeSubjects.filter((sub: string) => 
      sub.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredResources = () => {
    let list = resourcesList.filter((r: any) => r.type === selectedCategory);
    if (searchQuery) {
      list = list.filter((r: any) => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return list;
  };

  // Step indicator
  const currentStep = () => {
    if (readingFile) return "reader";
    if (selectedCategory) return "files";
    if (selectedSubject) return "categories";
    return "subjects";
  };

  return (
    <div className="min-h-svh w-full bg-[#f4f6ff] dark:bg-[#0b081e] text-slate-800 dark:text-slate-100 flex flex-col px-6 pb-28 overflow-x-hidden relative transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-[5%] left-[-10%] h-64 w-64 bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[-10%] h-64 w-64 bg-indigo-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex w-full items-center justify-between pt-8 pb-1 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white shrink-0 active:scale-95 transition-all" 
            onClick={() => {
              const step = currentStep();
              if (step === "reader") {
                setReadingFile(null);
              } else if (step === "files") {
                setSelectedCategory(null);
                setSearchQuery("");
              } else if (step === "categories") {
                setSelectedSubject(null);
                setSearchQuery("");
              } else {
                navigate(PATHS.STUDENT_DASHBOARD);
              }
            }}
          >
            <ChevronLeft size={20} />
          </Button>
          
          <h1 className="text-sm font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
            {currentStep() === "reader" 
              ? "Reading Guide" 
              : currentStep() === "files"
                ? `${selectedSubject} > ${selectedCategory === "note" ? "Notes" : selectedCategory === "video" ? "Videos" : "PYQs"}`
                : currentStep() === "categories"
                  ? selectedSubject
                  : "Study Library"}
          </h1>
          
          <div className="w-10 h-10" /> {/* Spacer */}
        </header>

        {/* Search Bar (Hidden in Reader) */}
        {currentStep() !== "reader" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentStep() === "subjects" 
                  ? "Search subjects..." 
                  : "Search documents..."
              } 
              className="pl-10 h-11 bg-white dark:bg-[#161233] border-slate-200 dark:border-[#221c4e] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-2xl text-xs focus-visible:ring-violet-500/20 shadow-sm"
            />
          </div>
        )}

        {/* STEP 1: SUBJECTS LIST */}
        {currentStep() === "subjects" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-0.5 text-left mb-1">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                Subjects
              </h2>
            </div>

            {subjectsLoading ? (
              <p className="text-xs text-slate-500 py-8">Loading subjects...</p>
            ) : getFilteredSubjects().length === 0 ? (
              <Card className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-3xl p-8 text-center shadow-sm">
                <Book className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Study Materials Uploaded</h3>
                <p className="text-xs text-slate-400 mt-1">Please ask the administrator to upload files for your class.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {getFilteredSubjects().map((sub: string, idx: number) => (
                  <Card 
                    key={idx}
                    onClick={() => setSelectedSubject(sub)}
                    className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer shadow-sm"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-left">
                        <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-950/20 flex items-center justify-center border border-violet-150 dark:border-violet-900/30 shrink-0">
                          <Folder className="text-amber-500 dark:text-amber-400" size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{sub}</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Click to view content folders</span>
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-slate-400 rotate-180" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: CATEGORIES FOLDERS (Notes, Video Lectures, PYQs) */}
        {currentStep() === "categories" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-left bg-gradient-to-r from-violet-600 to-indigo-700 p-6 rounded-3xl space-y-2 relative overflow-hidden shadow-md text-white">
              <div className="absolute right-[-20px] top-[-20px] h-32 w-32 bg-white/10 rounded-full blur-2xl" />
              <h2 className="text-2xl font-black text-white">{selectedSubject}</h2>
              <p className="text-xs text-white/90">
                Explore structured study chapters, videos, and questions.
              </p>
            </div>

            {resourcesLoading ? (
              <p className="text-xs text-slate-500 py-8">Loading content categories...</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {/* Category 1: Notes */}
                <Card 
                  onClick={() => setSelectedCategory("note")}
                  className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer shadow-sm"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center border border-blue-150 dark:border-blue-900/30 shrink-0">
                        <FileText className="text-blue-550 dark:text-blue-400" size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Notes</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {notesCount} document{notesCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-slate-400 rotate-180" />
                  </CardContent>
                </Card>

                {/* Category 2: Video Lectures */}
                <Card 
                  onClick={() => setSelectedCategory("video")}
                  className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer shadow-sm"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center border border-purple-150 dark:border-purple-900/30 shrink-0">
                        <PlayCircle className="text-purple-550 dark:text-purple-400" size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Video Lectures</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {videosCount} video{videosCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-slate-400 rotate-180" />
                  </CardContent>
                </Card>

                {/* Category 3: Previous Year Papers */}
                <Card 
                  onClick={() => setSelectedCategory("pyq")}
                  className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all cursor-pointer shadow-sm"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center border border-emerald-150 dark:border-emerald-900/30 shrink-0">
                        <ClipboardCheck className="text-emerald-550 dark:text-emerald-400" size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Previous Year Papers</h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {pyqsCount} paper{pyqsCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <ChevronLeft size={16} className="text-slate-400 rotate-180" />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: FILES LIST */}
        {currentStep() === "files" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {getFilteredResources().length === 0 ? (
              <Card className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-3xl p-8 text-center shadow-sm">
                <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No resources found</h3>
                <p className="text-xs text-slate-400 mt-1">Try another category or check back later.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {getFilteredResources().map((r: any) => (
                  <Card 
                    key={r._id}
                    className="bg-white dark:bg-[#161233] border border-slate-100 dark:border-[#221c4e] rounded-3xl overflow-hidden p-5 flex flex-col gap-4 text-left relative shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-900/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {r.type === 'note' ? 'Notes' : r.type === 'video' ? 'Video' : 'PYQ'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">
                          {r.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                      {r.description || 'Access complete study content.'}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-550 font-semibold tracking-wider">
                        <span>{r.board || 'CBSE'}</span>
                      </div>

                      <div className="flex gap-2">
                        {r.type === 'video' ? (
                          <Button
                            size="sm"
                            onClick={() => window.open(r.videoUrl || r.fileUrl, '_blank')}
                            className="h-9 px-4 rounded-xl bg-green-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-green-700 transition-all active:scale-95 border-none"
                          >
                            <PlayCircle size={12} />
                            Watch Video
                          </Button>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => window.open(r.pdfUrl || r.fileUrl, '_blank')}
                              className="h-9 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
                            >
                              <Download size={12} />
                              Open Link
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => setReadingFile({ title: r.title, url: r.pdfUrl || r.fileUrl })}
                              className="h-9 px-4 rounded-xl bg-violet-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-violet-700 transition-all active:scale-95 border-none"
                            >
                              <Eye size={12} />
                              Read
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: FULL SCREEN EMBEDDED PDF VIEWER */}
        {readingFile && (
          <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col animate-in fade-in zoom-in-95 duration-350">
            <header className="flex w-full items-center justify-between px-6 pt-8 pb-4 border-b border-slate-800 bg-[#110d2c] backdrop-blur-md">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-9 w-9 rounded-xl border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
                onClick={() => setReadingFile(null)}
              >
                <X size={18} />
              </Button>
              <div className="text-center flex-1 px-3">
                <span className="text-[9px] font-black tracking-widest text-violet-400 uppercase">Document Reader</span>
                <h3 className="text-sm font-bold text-white truncate max-w-[200px]">{readingFile.title}</h3>
              </div>
              <div className="w-9 h-9" /> {/* Spacer */}
            </header>

            <div className="flex-1 w-full bg-slate-950 overflow-hidden relative">
              <iframe
                src={readingFile.url}
                className="w-full h-full border-none"
                title="Document View"
              />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
