import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full mt-24 bg-surface-container-low border-t border-transparent relative overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-gutter px-margin-mobile md:px-margin-desktop py-12 md:py-16 max-w-container-max mx-auto stagger-children">
        <div className="space-y-4 md:space-y-6">
          <div className="font-display-lg text-headline-lg text-primary">
            Sous-Chef <span className="text-secondary italic">AI</span>
          </div>
          <p className="text-on-surface-variant opacity-80 font-body-md">
            Culinary intelligence elevated. Generative AI recipes backed by
            USDA-grade nutritional science.
          </p>
        </div>
        <div>
          <h5 className="font-label-sm text-secondary font-bold mb-4 md:mb-6">
            Navigate
          </h5>
          <ul className="space-y-3 font-body-md text-on-surface-variant">
            <li>
              <Link to="/" className="hover:text-secondary transition-colors duration-300">
                Home
              </Link>
            </li>
            <li>
              <Link to="/generate" className="hover:text-secondary transition-colors duration-300">
                Generate Recipe
              </Link>
            </li>
            <li>
              <Link to="/recipe-book" className="hover:text-secondary transition-colors duration-300">
                Recipe Book
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h5 className="font-label-sm text-secondary font-bold mb-4 md:mb-6">
            Powered By
          </h5>
          <ul className="space-y-3 font-body-md text-on-surface-variant">
            <li>T5 Transformer Model</li>
            <li>RecipeNLG Dataset</li>
            <li>USDA FoodData Central</li>
          </ul>
        </div>
      </div>
      <div className="px-margin-mobile md:px-margin-desktop py-6 md:py-8 border-t border-outline-variant/10 text-center md:text-left">
        <p className="font-label-sm text-on-surface-variant opacity-60">
          © 2026 Sous-Chef AI. Culinary Intelligence Elevated.
        </p>
      </div>
    </footer>
  );
};
