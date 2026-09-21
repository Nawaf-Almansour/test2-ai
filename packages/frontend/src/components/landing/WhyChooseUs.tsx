import React from 'react';
import { Users, Building, Shield, Laptop, GraduationCap, Users2 } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: Users,
      title: 'Qualified Teachers',
      description: 'Experienced educators with advanced degrees and passion for teaching excellence.',
    },
    {
      icon: Building,
      title: 'Modern Classrooms',
      description: 'State-of-the-art facilities designed for optimal learning and collaboration.',
    },
    {
      icon: Shield,
      title: 'Safe Environment',
      description: 'Comprehensive safety measures and nurturing atmosphere for student wellbeing.',
    },
    {
      icon: Laptop,
      title: 'Technology-Based Learning',
      description: 'Integrated digital tools and modern teaching methodologies for 21st-century skills.',
    },
    {
      icon: GraduationCap,
      title: 'Student Development',
      description: 'Holistic approach focusing on academic, social, and emotional growth.',
    },
    {
      icon: Users2,
      title: 'Small Class Sizes',
      description: 'Personalized attention with optimal student-to-teacher ratios.',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our School
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide exceptional educational experiences that prepare students 
            for success in academics and life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center group"
            >
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;