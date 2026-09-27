"use client";

interface TopBarProps {
  onFileSelect?: (file: File) => void;
}

export default function TopBar({ onFileSelect }: TopBarProps) {
  const menus = ["File", "Edit", "Image", "Layer", "Filter"];

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <header className="h-9 px-3 flex items-center justify-between border-b border-[#3a3d44] bg-[#141519] text-xs font-mono text-[#e8e8e2] shrink-0">
      <div className="flex items-center gap-6">
        {/* App Title */}
        <span className="font-bold tracking-wider uppercase text-white">
          STUDIONORTH
        </span>

        {/* Menu Bar Items */}
        <nav className="flex items-center gap-4 text-[#8f938f]">
          {menus.map((menu) => (
            <div key={menu} className="relative group">
              {menu === "File" ? (
                <label className="hover:text-[#e8e8e2] cursor-pointer transition-colors duration-100">
                  {menu}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              ) : (
                <button className="hover:text-[#e8e8e2] cursor-pointer transition-colors duration-100">
                  {menu}
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="text-[10px] text-[#8f938f] uppercase tracking-widest">
        v0.1.0 // SKELETON
      </div>
    </header>
  );
}
