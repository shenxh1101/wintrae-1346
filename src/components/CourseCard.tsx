import { Link } from 'react-router-dom';
import { Clock, Flame, Star } from 'lucide-react';
import { Course } from '@/types';
import { cn, getDifficultyName, getDifficultyColor, getCategoryName } from '@/lib/utils';
import { useMemberStore } from '@/stores/useMemberStore';

interface CourseCardProps {
  course: Course;
  className?: string;
}

export default function CourseCard({ course, className }: CourseCardProps) {
  const { isFavorite } = useMemberStore();
  const favorite = isFavorite(course.id);

  return (
    <Link
      to={`/course/${course.id}`}
      className={cn(
        'focusable group relative overflow-hidden rounded-2xl bg-navy-light transition-all duration-300',
        'hover:shadow-glow hover:-translate-y-1',
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.cover}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/90 via-transparent to-transparent" />

        {favorite && (
          <div className="absolute top-4 right-4">
            <Star className="w-6 h-6 text-soft-yellow fill-soft-yellow" />
          </div>
        )}

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 bg-vibrant-orange/90 text-white text-sm font-medium rounded-full">
            {getCategoryName(course.category)}
          </span>
          <span className={cn('px-3 py-1 text-sm font-medium rounded-full', getDifficultyColor(course.difficulty))}>
            {getDifficultyName(course.difficulty)}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
          <div className="flex items-center gap-4 text-text-secondary text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration} 分钟
            </span>
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-vibrant-orange" />
              {course.calories} 千卡
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
