"use client";

import { Badge } from "./badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

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
  const categories = Array.from(new Set(items.map(item => item.category)));

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "compliance":
        return "default";
      case "security":
        return "destructive";
      case "documentation":
        return "secondary";
      case "data management":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <section className="mb-8 sm:mb-12">
      <div className="text-center mb-6 sm:mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Frequently Asked Questions</h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Find answers to common questions about our security and compliance practices
        </p>
      </div>
      
      {categories.map((category) => {
        const categoryItems = items.filter(item => item.category === category);
        
        return (
          <Card key={category} className="mb-6 sm:mb-8">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <CardTitle className="text-lg">{category}</CardTitle>
                <Badge variant={getCategoryColor(category)} size="sm">
                  {categoryItems.length} {categoryItems.length === 1 ? 'question' : 'questions'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {categoryItems.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-medium text-sm sm:text-base pr-2">{item.question}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        );
      })}
      
      {items.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No FAQ items available at this time.</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}