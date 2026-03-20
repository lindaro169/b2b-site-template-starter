import TestimonialCard from '@/components/TestimonialCard';

export default function WhyChooseUs({ testimonials }) {
  const stats = [
    { value: '8', label: 'Mock Products Included' },
    { value: '4', label: 'Demo Category Routes' },
    { value: '100%', label: 'Sanitized Placeholder Assets' },
  ];

  const defaultTestimonials = [
    {
      clientName: 'Template Client 01',
      clientCompany: 'Template Review Team A',
      clientLocation: 'Template Region A',
      role: 'Template Reviewer',
      quote: 'The demo catalog made it easy to review layout, card density, and CTA placement before any production assets were introduced.',
    },
    {
      clientName: 'Template Client 02',
      clientCompany: 'Template Review Team B',
      clientLocation: 'Template Region B',
      role: 'Template Reviewer',
      quote: 'Using mock data first helped our team validate copy structure without leaking real materials into staging.',
    },
    {
      clientName: 'Template Client 03',
      clientCompany: 'Template Approval Group',
      clientLocation: 'Template Region C',
      role: 'Template Approver',
      quote: 'The placeholder visuals were clean enough for presentation, and swapping in approved launch assets later was straightforward.',
    },
    {
      clientName: 'Template Client 04',
      clientCompany: 'Template QA Sandbox',
      clientLocation: 'Template Region D',
      role: 'Template QA',
      quote: 'This sanitized version gave us a safe baseline for demos, QA, and internal review without exposing real commercial data.',
    },
  ];

  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  return (
    <section className="py-20 bg-gradient-to-b from-stone-50 to-white relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-6">
            Why This Demo Is Useful
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg leading-relaxed">
            A consistent placeholder layer keeps the interface reviewable while ensuring every visible promise remains safe to replace before publishing.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group p-6 rounded-2xl transition-colors hover:bg-white hover:shadow-lg hover:shadow-stone-200/50">
              <div className="text-5xl sm:text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-primary-700 mb-4 transition-transform group-hover:scale-105">
                {stat.value}
              </div>
              <div className="text-stone-900 font-medium tracking-wide uppercase text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayTestimonials.slice(0, 4).map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
