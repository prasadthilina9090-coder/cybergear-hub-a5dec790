import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Smartphone, Box, Headphones, Wrench, Zap, Shield, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/products/ProductCard';
import { useProducts } from '@/hooks/useProducts';

const categories = [
  {
    href: '/pc',
    label: 'Gaming PCs',
    description: 'Pre-built high-performance gaming rigs',
    icon: Cpu,
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    href: '/pc-parts',
    label: 'PC Parts',
    description: 'Components for custom builds',
    icon: Box,
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    href: '/mobile',
    label: 'Smartphones',
    description: 'Latest flagship devices',
    icon: Smartphone,
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    href: '/accessories',
    label: 'Accessories',
    description: 'Peripherals and add-ons',
    icon: Headphones,
    gradient: 'from-orange-500 to-red-600',
  },
];

export default function Index() {
  const { products: featuredProducts, isLoading } = useProducts({ featured: true, limit: 8 });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 animate-fade-up">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Tech Store</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
              The Future of
              <span className="block text-gradient-cyber">Gaming Tech</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Discover cutting-edge gaming PCs, premium components, and mobile devices. 
              Build your dream setup with our PC Builder tool.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/pc">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
                  Shop Gaming PCs
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pc-builder">
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 font-semibold px-8">
                  <Wrench className="mr-2 h-5 w-5" />
                  PC Builder
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Free Shipping
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                DOA Warranty
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Fast Delivery
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Find exactly what you need</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.href} to={category.href}>
                  <Card className="group h-full bg-card border-border/50 hover:border-primary/50 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6 relative">
                      {/* Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      
                      <div className="relative">
                        <div className="p-4 rounded-xl bg-secondary/50 w-fit mb-4 group-hover:bg-primary/10 transition-colors">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {category.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                        <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Browse <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked by our tech experts</p>
            </div>
            <Link to="/pc">
              <Button variant="outline" className="hidden sm:flex">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-secondary rounded-lg mb-4" />
                  <div className="h-4 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center bg-card/50 border-dashed">
              <p className="text-muted-foreground mb-4">No featured products yet</p>
              <Link to="/pc">
                <Button variant="outline">Browse All Products</Button>
              </Link>
            </Card>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/pc">
              <Button variant="outline">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* PC Builder CTA */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <CardContent className="relative p-8 md:p-12 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-sm text-primary mb-4">
                  <Wrench className="h-4 w-4" />
                  Build Tool
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Custom PC Builder
                </h2>
                <p className="text-muted-foreground max-w-xl mb-6">
                  Build your dream PC step by step. Our wizard guides you through selecting compatible components, 
                  ensuring your build is optimized for performance and value.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/pc-builder">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                      Start Building
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/pc-parts">
                    <Button size="lg" variant="outline">
                      Browse Parts
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center animate-float">
                  <Wrench className="h-24 w-24 md:h-32 md:w-32 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
