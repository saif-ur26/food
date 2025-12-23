import { Link } from "react-router-dom";
import { UtensilsCrossed, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">HomeMeals</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Delicious homemade meals delivered fresh to your doorstep every day.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/order" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Order Now
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/70 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Meal Plans */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Meal Plans</h4>
            <ul className="space-y-2 text-primary-foreground/70">
              <li>Daily Meal - ₹149</li>
              <li>Weekly Plan - ₹899</li>
              <li>15-Day Plan - ₹1919</li>
              <li>Monthly Plan - ₹3839</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Phone className="w-4 h-4 text-primary" />
                <span>9550043174</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70">
                <Mail className="w-4 h-4 text-primary" />
                <span>hello@homemeals.in</span>
              </li>
              <li className="flex items-start gap-2 text-primary-foreground/70">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span>Your City, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center text-primary-foreground/50 text-sm">
          <p>© {new Date().getFullYear()} HomeMeals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
