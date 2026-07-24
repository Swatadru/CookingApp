interface FabProps {
  toggleSidebar: () => void;
  isOpen?: boolean;
}

export const Fab = ({ toggleSidebar, isOpen }: FabProps) => {
  return (
    <button 
      onClick={toggleSidebar}
      className={`fixed bottom-8 right-8 w-16 h-16 bg-primary text-surface rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 group overflow-hidden ${
        isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'hover:scale-110 active:scale-95 pop-in breathe-glow'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <span className="material-symbols-outlined text-3xl relative z-10">smart_toy</span>
    </button>
  );
};
