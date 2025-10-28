import { useAuth } from '@/context/AuthContext';
import blankPfp from '../assets/images/blank-pfp.png';
import MySeminarsSection from '../Sections/MySeminarsSection';
import UpcomingSeminarCard from '@/components/cards/UpcomingSeminarCard';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMySeminarList } from '@/stores/SeminarStore';
import Calendar from '@/components/calendar/Calendar';
import { useState } from 'react';
import SettingsModal from '@/components/overlay/SettingsModal';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { user } = useAuth();

  const { seminars } = useMySeminarList()

  const [openSettings, setOpenSettings] = useState(false);

  const nextSeminar = seminars ? [...seminars].filter(s => new Date(s.seminar.date_start) > new Date()).sort((a, b) =>
    new Date(a.seminar.date_start).getTime() - new Date(b.seminar.date_start).getTime())[0] : null

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
        <Card className="mb-8 border-0 shadow-sm bg-gradient-to-br from-primary/10 via-background to-foreground/5">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-2 ring-primary/10">
                  <AvatarImage src={blankPfp} alt={user?.username} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                    {getInitials(user?.username || "User")}
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

              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:text-primary transition"
                onClick={() => setOpenSettings(true)}
              >
                <Settings className="h-6 w-6" />
              </Button>
              <SettingsModal
                open={openSettings}
                onOpenChange={setOpenSettings}
              />
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

            {/* Responsive layout: two columns on md and above (left: upcoming card, right: calendar) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              {/* Upcoming Seminar Card (takes 2 columns on large screens) */}
              <div className="lg:col-span-2">
                <UpcomingSeminarCard seminar={nextSeminar} />
              </div>

              {/* Calendar Section */}
              <div className="flex justify-center lg:justify-end w-full">
                <div className="w-full max-w-sm">
                  <Calendar seminars={seminars?.map((s) => s.seminar) ?? []} />
                </div>
              </div>
            </div>
          </section>

          {/* My Seminars Section */}
          <MySeminarsSection />
        </div>
      </div>
    </div>
  );
}