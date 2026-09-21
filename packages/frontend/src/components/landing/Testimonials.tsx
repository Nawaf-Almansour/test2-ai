import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  grade: string;
  comment: string;
  rating: number;
}

const Testimonials: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      grade: "Grade 5 Parent",
      comment: "The school has exceeded our expectations. The teachers are dedicated, and the curriculum is challenging yet engaging. My daughter has grown so much academically and personally.",
      rating: 5
    },
    {
      name: "Mohammed Al-Rashid",
      grade: "Grade 8 Parent",
      comment: "We moved our son to this school last year, and it was the best decision we made. The facilities are excellent, and the focus on technology-based learning has prepared him well for the future.",
      rating: 5
    },
    {
      name: "Emily Chen",
      grade: "Kindergarten Parent",
      comment: "The kindergarten program is outstanding! The teachers create a nurturing environment that made my child's first school experience wonderful. She loves going to school every day.",
      rating: 5
    },
    {
      name: "Ahmed Hassan",
      grade: "Grade 11 Parent",
      comment: "The high school program has prepared my daughter exceptionally well for university. The rigorous academics combined with extracurricular activities have helped her develop into a well-rounded individual.",
      rating: 5
    },
    {
      name: "Fatima Al-Mansour",
      grade: "Grade 3 Parent",
      comment: "I appreciate the small class sizes and individual attention my son receives. The teachers truly care about each student's progress and well-being.",
      rating: 5
    },
    {
      name: "David Wilson",
      grade: "Grade 7 Parent",
      comment: "The school's emphasis on both academic excellence and character development is impressive. My children are not just learning subjects, they're learning life skills.",
      rating: 5
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${
              index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Parents Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from our community of parents and students about their experiences at our school.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <div className="relative mb-4">
                <Quote className="h-8 w-8 text-blue-200 absolute -top-2 -left-2" />
                <p className="text-gray-700 leading-relaxed relative z-10">
                  {testimonial.comment}
                </p>
              </div>
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonial.grade}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;