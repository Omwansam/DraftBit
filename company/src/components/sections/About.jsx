import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Users2, Cpu, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../ui/SectionHeader";

const AboutSection = () => {
  const features = [
    { icon: Users2, text: "Powered by expert full-stack engineers" },
    { icon: Cpu, text: "Focused on innovation and reliability" },
    { icon: Rocket, text: "Scalable solutions for growth" },
  ];

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <SectionHeader
          badge="About Us"
          title="More Than Just Code."
          highlight="We Are Your Tech Partners."
          description="DraftBit is a premier technology solutions company specializing in custom software, high-performance websites, and intelligent automation."
          align="left"
          className="mb-12 lg:hidden"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Image / Visual */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop" 
                alt="Development Workspace" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-white">100% Custom Built</p>
                    <p className="text-sm text-gray-300">No generic templates</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative border */}
            <div className="absolute -top-10 -left-10 w-full h-full border-2 border-primary/20 rounded-3xl -z-10" />
          </motion.div>

          {/* Right Text / Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="hidden lg:block text-3xl md:text-5xl font-display font-bold mb-6">
              More Than Just Code. <br />
              <span className="text-gradient">We Are Your Tech Partners.</span>
            </h2>
            <p className="hidden lg:block text-lg text-muted-foreground mb-8 leading-relaxed">
              DraftBit is a premier technology solutions company specializing in custom software, 
              high-performance websites, and intelligent automation. We don't just build apps; 
              we engineer digital ecosystems that drive business efficiency and growth.
            </p>

            <div className="space-y-6">
              {features.map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <feature.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="text-lg font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Optional CTA */}
            <div className="mt-10">
              <Link
                to="/contact"
                className="inline-block px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:glow transition-all"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;


