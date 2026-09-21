import React from 'react';
import { Grade } from '../../types/registration';

const Programs: React.FC = () => {
  const programs = [
    {
      name: 'Kindergarten',
      grades: [Grade.KG1, Grade.KG2, Grade.KG3],
      ageRange: '3-5 years',
      description: 'Play-based learning that builds foundational skills in literacy, numeracy, and social development.',
      features: ['Literacy Development', 'Numeracy Skills', 'Social Skills', 'Creative Arts', 'Physical Education']
    },
    {
      name: 'Primary School',
      grades: [Grade.GRADE_1, Grade.GRADE_2, Grade.GRADE_3],
      ageRange: '6-8 years',
      description: 'Comprehensive curriculum focusing on core academic subjects and character development.',
      features: ['Core Subjects', 'STEM Education', 'Language Arts', 'Character Education', 'Digital Literacy']
    },
    {
      name: 'Middle School',
      grades: [Grade.GRADE_4, Grade.GRADE_5, Grade.GRADE_6],
      ageRange: '9-11 years',
      description: 'Advanced academics with increased independence and critical thinking development.',
      features: ['Advanced Academics', 'Project-Based Learning', 'Leadership Skills', 'Research Skills', 'Global Awareness']
    },
    {
      name: 'High School',
      grades: [Grade.GRADE_7, Grade.GRADE_8, Grade.GRADE_9, Grade.GRADE_10, Grade.GRADE_11, Grade.GRADE_12],
      ageRange: '12-18 years',
      description: 'College preparatory curriculum with advanced placement options and career guidance.',
      features: ['College Prep', 'AP Courses', 'Career Guidance', 'Research Projects', 'Community Service']
    }
  ];

  return (
    <section id="programs" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Educational Programs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From kindergarten through high school, we provide a comprehensive 
            educational journey that prepares students for future success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program) => (
            <div
              key={program.name}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {program.name}
                  </h3>
                  <p className="text-blue-600 font-semibold">
                    {program.ageRange}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <div className="text-blue-600 font-bold text-sm">
                    {program.grades.length} Grades
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {program.description}
              </p>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {program.features.map((feature) => (
                    <li key={feature} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Available Grades:</p>
                <div className="flex flex-wrap gap-2">
                  {program.grades.map((grade) => (
                    <span
                      key={grade}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {grade.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;