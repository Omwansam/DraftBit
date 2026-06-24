import React from "react";
import { motion } from "framer-motion";
import { Code, Globe, Database, BarChart3, ShoppingCart, Workflow } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";

const services = [
  {
    icon: Code,
    title: "Custom Software",
    description:
      "Tailor-made applications designed to solve your specific business challenges with scalable architecture.",
  },
  {
    icon: Globe,
    title: "Website Development",
    description:
      "High-performance, responsive, and SEO-optimized websites that convert visitors into customers.",
  },
  {
    icon: Database,
    title: "ERP Systems",
    description:
      "Integrated management of main business processes, often in real-time and mediated by software and technology.",
  },
  {
    icon: BarChart3,
    title: "CRM Solutions",
    description:
      "Customer relationship management tools to manage interactions with current and potential customers.",
  },
  {
    icon: ShoppingCart,
    title: "POS Systems",
    description:
      "Modern Point of Sale systems that streamline transactions and inventory management.",
  },
  {
    icon: Workflow,
    title: "Automation & API",
    description:
      "Connect your favorite tools and automate repetitive workflows to save time and reduce errors.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(var(--primary)/0.05),_transparent_70%)] pointer-events-none" />
      <div className="container mx-auto px-4 md:px-6 relative">
        <SectionHeader
          badge="What We Do"
          title="Our"
          highlight="Services"
          description="Comprehensive digital solutions engineered for performance and scalability."
        />

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 group">
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold mb-2 text-foreground">{service.title}</h3>

                {/* Description */}
                <p className="text-base text-muted-foreground">{service.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
