import React from 'react';
import { 
  Building2, 
  Microscope, 
  Computer, 
  BookOpen, 
  Trophy, 
  Trees,
  Palette,
  Music
} from 'lucide-react';

interface Facility {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const Facilities: React.FC = () => {
  const facilities: Facility[] = [
    {
      icon: <Building2 className="h-8 w-8 text-blue-600" />,
      title: "Modern Classrooms",
      description: "Spacious, well-lit classrooms equipped with interactive whiteboards and comfortable seating for optimal learning."
    },
    {
      icon: <Microscope className="h-8 w-8 text-green-600" />,
      title: "Science Labs",
      description: "Fully equipped laboratories for physics, chemistry, and biology with modern equipment and safety features."
    },
    {
      icon: <Computer className="h-8 w-8 text-purple-600" />,
      title: "Computer Labs",
      description: "State-of-the-art computer labs with high-speed internet and the latest software for digital learning."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-orange-600" />,
      title: "Library",
      description: "A vast collection of books, digital resources, and quiet study spaces to support academic excellence."
    },
    {
      icon: <Trophy className="h-8 w-8 text-red-600" />,
      title: "Sports Facilities",
      description: "Indoor and outdoor sports facilities including basketball courts, soccer fields, and swimming pool."
    },
    {
      icon: <Trees className="h-8 w-8 text-green-500" />,
      title: "Playground",
      description: "Safe and fun playground areas with age-appropriate equipment for physical development and recreation."
    },
    {
      icon: <Palette className="h-8 w-8 text-pink-600" />,
      title: "Art Studios",
      description: "Creative spaces for visual arts, crafts, and design with proper lighting and art supplies."
    },
    {
      icon: <Music className="h-8 w-8 text-indigo-600" />,
      title: "Music Rooms",
      description: "Sound-proofed music rooms with instruments for vocal and instrumental training."
    }
  ];

  return (
    <section id="facilities" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            School Facilities
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our modern facilities provide the perfect environment for learning, growth, and development.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {facilities.map((facility, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  {facility.icon}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {facility.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {facility.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Facilities;