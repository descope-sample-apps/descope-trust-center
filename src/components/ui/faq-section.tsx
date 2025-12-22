import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQSectionProps {
  items: FAQItem[];
}

export function FAQSection({ items }: FAQSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const categories = Array.from(new Set(items.map(item => item.category)));

  return (
    <section className="mb-8 sm:mb-12">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Frequently Asked Questions</h3>
      
      {categories.map((category) => {
        const categoryItems = items.filter(item => item.category === category);
        
        return (
          <div key={category} className="mb-6 sm:mb-8">
            <h4 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4">{category}</h4>
            <div className="space-y-3 sm:space-y-4">
              {categoryItems.map((item) => (
                <div 
                  key={item.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                    aria-expanded={expandedItems.has(item.id)}
                    aria-controls={`faq-answer-${item.id}`}
                  >
                    <span className="font-medium text-gray-900 text-sm sm:text-base pr-2">{item.question}</span>
                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">
                        {expandedItems.has(item.id) ? 'Show less' : 'Show more'}
                      </span>
                      {expandedItems.has(item.id) ? (
                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  <div
                    id={`faq-answer-${item.id}`}
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      expandedItems.has(item.id) ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-gray-600 leading-relaxed text-sm sm:text-base">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No FAQ items available at this time.</p>
        </div>
      )}
    </section>
  );
}