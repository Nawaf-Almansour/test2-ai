import React from 'react';
import { 
  FileText, 
  Search, 
  Phone, 
  ClipboardCheck, 
  CheckCircle, 
  Award
} from 'lucide-react';

interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const AdmissionProcess: React.FC = () => {
  const steps: Step[] = [
    {
      number: 1,
      icon: <FileText className="h-6 w-6" />,
      title: "Submit Registration Request",
      description: "Complete the online registration form with student and guardian information."
    },
    {
      number: 2,
      icon: <Search className="h-6 w-6" />,
      title: "School Reviews Request",
      description: "Our admissions team reviews your application and verifies the provided information."
    },
    {
      number: 3,
      icon: <Phone className="h-6 w-6" />,
      title: "Parent Contact",
      description: "We'll contact you to discuss the application and answer any questions you may have."
    },
    {
      number: 4,
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Student Assessment",
      description: "Schedule and complete an assessment to ensure proper grade placement."
    },
    {
      number: 5,
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Admission Decision",
      description: "Receive notification of the admission decision within 5-7 business days."
    },
    {
      number: 6,
      icon: <Award className="h-6 w-6" />,
      title: "Enrollment",
      description: "Complete enrollment paperwork, pay fees, and prepare for the first day of school."
    }
  ];

  return (
    <section id="admissions" className="py-16 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Admission Process
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our straightforward admission process ensures a smooth journey from application to enrollment.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex items-start mb-4">
                <div className="flex-shrink-0 mr-4">
                  <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="text-blue-600 mr-2">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-blue-300"></div>
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-300 rotate-45"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a
            href="/apply"
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Start Your Application
          </a>
        </div>
      </div>
    </section>
  );
};

export default AdmissionProcess;