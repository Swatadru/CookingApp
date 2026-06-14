export const Footer = () => {
  return (
    <footer className="w-full mt-24 bg-surface-container-low border-t border-transparent relative overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent"></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-16 max-w-container-max mx-auto stagger-children">
        <div className="space-y-6">
          <div className="font-display-lg text-headline-lg text-primary">Omniscient Sous-Chef</div>
          <p className="text-on-surface-variant opacity-80 font-body-md">
            Culinary intelligence elevated for the modern home kitchen.
          </p>
        </div>
        <div>
          <h5 className="font-label-sm text-secondary font-bold mb-6">Tools</h5>
          <ul className="space-y-3 font-body-md text-on-surface-variant">
            <li><a href="/lab" className="hover:text-secondary transition-colors duration-300">Culinary Physics</a></li>
            <li><a href="/lab" className="hover:text-secondary transition-colors duration-300">Vision AI</a></li>
            <li><a href="/library" className="hover:text-secondary transition-colors duration-300">Allergen Swapper</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-sm text-secondary font-bold mb-6">Community</h5>
          <ul className="space-y-3 font-body-md text-on-surface-variant">
            <li><a href="/kitchen" className="hover:text-secondary transition-colors duration-300">Global Kitchen</a></li>
            <li><a href="/library" className="hover:text-secondary transition-colors duration-300">Shared Library</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-sm text-secondary font-bold mb-6">Legal</h5>
          <ul className="space-y-3 font-body-md text-on-surface-variant">
            <li><a href="#" className="hover:text-secondary transition-colors duration-300">Terms of Service</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors duration-300">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="px-margin-mobile md:px-margin-desktop py-8 border-t border-outline-variant/10 text-center md:text-left">
        <p className="font-label-sm text-on-surface-variant opacity-60">
          © 2026 The Omniscient Sous-Chef. Culinary Intelligence Elevated.
        </p>
      </div>
    </footer>
  );
};
