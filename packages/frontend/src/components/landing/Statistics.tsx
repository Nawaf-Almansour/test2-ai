import React from 'react';
import { Users, GraduationCap, Building, Award } from 'lucide-react';

interface StatItem {
  icon: React.ReactNode;
  number: string;
  label: string;
}

const Statistics: React.FC = () => {
  // Configurable statistics - these could be fetched from API or environment variables
  const stats: StatItem[] = [
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      number: "500+",
      label: "Students"
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-green-600" />,
      number: "50+",
      label: "Teachers"
    },
    {
      icon: <Building className="h-8 w-8 text-purple-600" />,
      number: "20+",
      label: "Classrooms"
    },
    {
      icon: <Award className="h-8 w-8 text-orange-600" />,
      number: "10+",
      label: "Years Experience"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Impact in Numbers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're proud of our growing community and the positive impact we make on our students' lives every day.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;