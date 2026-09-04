import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface CategoryGridProps {
  categories: Category[];
}

const BRAND_COLORS = [
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
];

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
      {categories.map((category, index) => {
        const colorClass = BRAND_COLORS[index % BRAND_COLORS.length];
        return (
          <Link 
            key={category.id} 
            href={`/categories/${category.slug}`}
            className="group flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-[var(--shadow-sm)] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3 ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
              {category.icon || "📦"}
            </div>
            <span className="text-sm font-medium text-center text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
