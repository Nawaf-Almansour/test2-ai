import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "What grades does the school accept?",
      answer: "We accept students from Kindergarten (KG1) through Grade 12. Our kindergarten program includes KG1, KG2, and KG3 for children aged 3-5 years. For elementary, we offer Grades 1-5, middle school includes Grades 6-8, and high school covers Grades 9-12."
    },
    {
      question: "What documents are required for registration?",
      answer: "You'll need to provide: student's birth certificate, previous school transcripts (if applicable), vaccination records, parents' national ID or passport, recent passport-sized photographs of the student, and proof of residence. International students may require additional documentation."
    },
    {
      question: "Is there an admission assessment?",
      answer: "Yes, all applicants undergo an age-appropriate assessment to ensure proper grade placement. For kindergarten, this includes observational activities and basic readiness skills. Elementary and middle school assessments cover core subjects, while high school includes subject-specific evaluations and an interview."
    },
    {
      question: "How will the school contact me after submission?",
      answer: "We'll contact you primarily through the email and phone number provided in your application. You can expect an initial acknowledgment within 24 hours, followed by a detailed response from our admissions team within 3-5 business days. All communication will also be documented in your application portal."
    },
    {
      question: "Can I submit an application without creating an account?",
      answer: "Yes! Our registration process is designed to be simple and accessible. You can submit a complete registration request without creating an account. However, creating an optional account allows you to track your application status and upload additional documents easily."
    },
    {
      question: "What is the student-to-teacher ratio?",
      answer: "We maintain small class sizes to ensure personalized attention. Our student-to-teacher ratio is approximately 20:1 in elementary grades, 18:1 in middle school, and 15:1 in high school. Kindergarten classes have a ratio of 15:1 with teaching assistants."
    },
    {
      question: "Does the school provide transportation?",
      answer: "Yes, we offer bus transportation services covering major residential areas. Our fleet is modern, air-conditioned, and equipped with GPS tracking. Each bus has a dedicated attendant to ensure student safety. Transportation fees are separate from tuition."
    },
    {
      question: "What extracurricular activities are available?",
      answer: "We offer a wide range of activities including sports (basketball, soccer, swimming), arts (music, drama, visual arts), academic clubs (STEM, debate, languages), and community service programs. Activities vary by grade level and are scheduled after school hours."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our school and admission process.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <span className="font-medium text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>
                
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <div className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Still have questions?
            </p>
            <a
              href="#contact"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;