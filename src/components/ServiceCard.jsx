export default function ServiceCard({ icon: Icon, title, description }) {
  return (
    <div className="service-card bg-white rounded-xl p-8 border border-gray-300 hover:border-primary-300 hover:shadow-lg transition-all duration-300 text-center group">
      {/* Icon */}
      <div className="service-icon mb-6 flex justify-center">
        <div className="w-16 h-16 text-primary-600 group-hover:text-primary-700 group-hover:scale-110 transition-all duration-300">
          {Icon && <Icon className="w-full h-full" />}
        </div>
      </div>

      {/* Title */}
      <h3 className="service-title text-xl font-semibold text-gray-800 mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="service-desc text-gray-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
