import { useAuth } from '@/context/AuthContext';
import blankPfp from '../assets/images/blank-pfp.png';
import MySeminarsSection from '../Sections/MySeminarsSection';
import UpcomingSeminarCard from '@/components/cards/UpcomingSeminarCard';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function HomePage() {
  const { user } = useAuth();

  // Mock data - Get the nearest upcoming seminar
  const nextSeminar = {
    id: 1,
    title: "Introduction to React and Modern Web Development",
    description:
      "Learn the fundamentals of React, including components, hooks, and state management. This seminar covers best practices for building scalable web applications.",
    speaker: "Dr. Jane Smith",
    venue: "University Hall, Room 301",
    date_start: "2025-10-20T14:00:00Z",
    date_end: "2025-10-20T16:30:00Z",
    duration_minutes: 150,
    is_done: false,
  };

  // Get user initials for avatar fallback
  const getInitials = (username: string) => {
    return username
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <div className="min-h-screen  bg-background min-w-[350px]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 max-w-7xl">
        {/* Header Section */}
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-br from-primary/5 via-background to-background">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-2 ring-primary/10">
                <AvatarImage src={blankPfp} alt={user?.username} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {getInitials(user?.username || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  Here's what's coming up for you
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="space-y-8">
          {/* Next Seminar Feature Card */}
          <section>
            <div className="mb-4">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Coming Up Next
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Your nearest scheduled seminar
              </p>
            </div>
            <UpcomingSeminarCard seminar={nextSeminar} />
          </section>

          {/* My Seminars Section */}
          <MySeminarsSection />
        </div>
      </div>
    </div>
  );
}