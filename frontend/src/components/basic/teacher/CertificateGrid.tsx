import React from "react";
import { FileUp, Plus, FileText } from "lucide-react";
// import { cn } from "@/lib/utils";

interface Certificate {
  id: string;
  name: string;
  type: "pdf" | "jpg";
}

const CertificateGrid: React.FC = () => {
  const certificates: Certificate[] = [
    { id: "1", name: "Phd_Thesis.pdf", type: "pdf" },
    { id: "2", name: "TET_Certificate.jpg", type: "jpg" },
    { id: "3", name: "TET_Certificate.jpg", type: "jpg" },
  ];

  return (
    <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-zinc-900/30 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
          <FileUp size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h4 className="text-zinc-100 font-semibold text-[15px]">Additional Certificates</h4>
          <p className="text-zinc-500 text-xs">Upload Additional Certificates</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Existing Files */}
        {certificates.map((file) => (
          <div key={file.id} className="flex flex-col items-center gap-2">
            <div className="w-full aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative group">
              <FileText className="text-yellow-500/60 w-8 h-8" />
              <div className="absolute top-1 right-1 bg-yellow-500 text-[8px] font-bold px-1 rounded text-black uppercase">
                {file.type}
              </div>
            </div>
            <span className="text-[9px] text-zinc-500 truncate w-full text-center px-1">
              {file.name}
            </span>
          </div>
        ))}

        {/* Empty Slots */}
        {[...Array(2)].map((_, i) => (
          <div key={i} className="w-full aspect-square bg-white/5 border border-dashed border-white/10 rounded-xl" />
        ))}

        {/* Add Button */}
        <button className="w-full aspect-square bg-white/10 border border-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-xl group">
           <Plus className="text-yellow-500 group-active:scale-90 transition-transform" size={24} />
        </button>
      </div>
    </div>
  );
};

export default CertificateGrid;