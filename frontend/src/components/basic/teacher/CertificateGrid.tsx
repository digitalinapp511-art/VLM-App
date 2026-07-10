import React, { useRef } from "react";
import { FileUp, Plus, FileText, Loader2 } from "lucide-react";

export interface Certificate {
  _id?: string;
  name: string;
  url: string;
  type: string;
  status?: string;
}

interface CertificateGridProps {
  certificates: Certificate[];
  onUpload: (file: File) => void;
  isUploading?: boolean;
}

const CertificateGrid: React.FC<CertificateGridProps> = ({ certificates, onUpload, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const getFileExtension = (name: string) => {
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "file";
  };

  return (
    <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-zinc-900/30 space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleFileChange}
      />

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
        {certificates.map((file, idx) => {
          const ext = getFileExtension(file.name);
          return (
            <div key={file._id || idx} className="flex flex-col items-center gap-2">
              <a 
                href={file.url} 
                target="_blank" 
                rel="noreferrer"
                className="w-full aspect-square bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative group hover:bg-white/10 transition-colors"
              >
                <FileText className="text-yellow-500/60 w-8 h-8" />
                <div className="absolute top-1 right-1 bg-yellow-500 text-[8px] font-bold px-1 rounded text-black uppercase">
                  {ext}
                </div>
              </a>
              <span className="text-[9px] text-zinc-400 truncate w-full text-center px-1">
                {file.name}
              </span>
            </div>
          );
        })}

        {/* Uploading Placeholder */}
        {isUploading && (
          <div className="w-full aspect-square bg-white/5 border border-dashed border-white/20 rounded-xl flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-500 w-6 h-6" />
          </div>
        )}

        {/* Add Button */}
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-square bg-white/10 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all shadow-xl group"
        >
          <Plus className="text-yellow-500 group-active:scale-90 transition-transform" size={24} />
        </button>
      </div>
    </div>
  );
};

export default CertificateGrid;