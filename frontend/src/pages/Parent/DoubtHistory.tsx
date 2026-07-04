// src/pages/DoubtHistory.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Filter, } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DoubtCard from "@/components/basic/parent/DoubtCard";
import ParentLayout from "@/components/layout/ParentLayout";

const DOUBTS_DATA = [
  { id: 1, subject: "Physics", topic: "Thermodynamics", teacher: "Prof. Niels Bohr", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Niels", time: "10:30 AM", date: "14 Oct", doubt: "Entropy and the Second Law", status: "solved" },
  { id: 2, subject: "Maths", topic: "Vector Spaces", teacher: "Dr. Katherine Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Katherine", time: "3:15 PM", date: "15 Oct", doubt: "Linear transformations and basis", status: "pending" },
  { id: 3, subject: "Chemistry", topic: "Valence Bonds", teacher: "Prof. Linus Pauling", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linus", time: "9:45 AM", date: "13 Oct", doubt: "Hybridization and molecular geometry", status: "solved" },
  { id: 4, subject: "History", topic: "Renaissance Ideas", teacher: "Ms. Augusta Savage", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Augusta", time: "5:00 PM", date: "15 Oct", doubt: "Humanism and perspective in art", status: "pending" },
  { id: 5, subject: "Biology", topic: "DNA Replication", teacher: "Dr. Rosalind Franklin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rosalind", time: "11:15 AM", date: "12 Oct", doubt: "Enzymes involved in replication fork", status: "solved" },
];

export default function DoubtHistory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const filteredDoubts = DOUBTS_DATA.filter(doubt => 
    activeTab === "all" ? true : doubt.status === activeTab
  );

  return (
    <ParentLayout>
      <div className="w-full flex flex-col items-center">
        
        {/* --- HEADER --- */}
        <header className="w-full flex items-center justify-between pb-4">
          <div className="w-10" />
          <h1 className="text-lg font-bold tracking-tight">Doubt History</h1>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Filter size={20} />
          </Button>
        </header>

        {/* --- TABS --- */}
        <div className="w-full mb-6">
          <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent w-full justify-between h-12 border-b border-white/10 rounded-none p-0">
              {["all", "solved", "pending"].map((tab) => (
                <TabsTrigger 
                  key={tab}
                  value={tab} 
                  className="flex-1 text-white/40 data-[state=active]:text-[#D4AF37] data-[state=active]:bg-transparent relative h-full rounded-none capitalize font-bold"
                >
                  {tab === "all" ? "All Doubts" : tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" 
                    />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* --- DOUBT LIST --- */}
        <main className="w-full space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredDoubts.map((doubt, index) => (
              <motion.div
                key={doubt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <DoubtCard {...doubt} />
              </motion.div>
            ))}
          </AnimatePresence>
        </main>
      </div>
    </ParentLayout>
  );
}