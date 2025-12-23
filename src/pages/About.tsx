import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Users, Leaf, Award, ArrowRight } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Made with Love",
      description:
        "Every meal we prepare is cooked with the same love and care as a home-cooked meal by your family.",
    },
    {
      icon: Leaf,
      title: "Fresh Ingredients",
      description:
        "We source the freshest vegetables, spices, and ingredients daily from local markets.",
    },
    {
      icon: Users,
      title: "Family Recipes",
      description:
        "Our recipes have been passed down through generations, bringing authentic flavors to your plate.",
    },
    {
      icon: Award,
      title: "Quality Promise",
      description:
        "We maintain the highest standards of hygiene and quality in every meal we deliver.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="py-16 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-gradient">HomeMeals</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              We believe that everyone deserves access to delicious, nutritious, and affordable
              home-cooked meals. Our mission is to bring the warmth of home cooking to your
              doorstep, every single day.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Our Story
              </span>
              <h2 className="font-display text-3xl font-bold text-foreground mb-6">
                From Our Kitchen to Your Table
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  HomeMeals started with a simple idea: to provide busy professionals, students,
                  and families with the same quality of food they would get at home, but without
                  the hassle of cooking.
                </p>
                <p>
                  We understand the struggles of balancing work, life, and maintaining a healthy
                  diet. That's why we've created a service that delivers freshly prepared,
                  nutritious meals right to your doorstep.
                </p>
                <p>
                  Our team of experienced cooks prepares each meal with traditional recipes,
                  using only the freshest ingredients. We believe that good food should be
                  accessible to everyone, which is why we keep our prices affordable without
                  compromising on quality.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden bg-muted shadow-warm">
                <div className="w-full h-full gradient-warm opacity-20"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 rounded-full gradient-warm flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-12 h-12 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      500+ Happy Customers
                    </h3>
                    <p className="text-muted-foreground">and counting...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              What We Stand For
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do, from ingredient selection to delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
                  <value.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            Ready to Experience Our Food?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Join our growing family of satisfied customers and enjoy delicious home-cooked
            meals every day.
          </p>
          <Link to="/order">
            <Button variant="hero" size="xl">
              Order Your First Meal
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
