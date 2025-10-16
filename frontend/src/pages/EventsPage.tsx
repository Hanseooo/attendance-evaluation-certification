import FeaturedSeminarsSection from "@/Sections/FeaturedSeminarsSection";
import SeminarListSection from "@/Sections/SeminarListSection";
import { type Seminar } from "@/utils/types"



export default function EventsPage() {

    
 const mockSeminars: Seminar[] = [
    {
        id: 101,
        title: "Introduction to React and Modern Web Development",
        description: "Learn the fundamentals of React including components, hooks, state and basic performance patterns for scalable web apps.",
        speaker: "Dr. Jane Smith",
        venue: "University Hall, Room 301",
        date_start: "2025-10-20T14:00:00.000Z",
        date_end: "2025-10-20T16:30:00.000Z",
        duration_minutes: 150,
        is_done: false,
    },
    {
        id: 102,
        title: "UI/UX Design Principles for Product Teams",
        description: "Practical patterns for designing interfaces that scale across devices and deliver clear, delightful user experiences.",
        speaker: "Sarah Johnson",
        venue: "Design Lab, Building C",
        date_start: "2025-11-01T13:00:00.000Z",
        date_end: "2025-11-01T15:00:00.000Z",
        duration_minutes: 120,
        is_done: false,
    },
    {
        id: 103,
        title: "Cybersecurity Fundamentals: Practical Defense",
        description: "Core security concepts and hands-on practices to harden applications, infrastructure, and developer workflows.",
        speaker: "Dr. Emily Rodriguez",
        venue: "Security Center, Room 101",
        date_start: "2025-11-10T14:00:00.000Z",
        date_end: "2025-11-10T17:00:00.000Z",
        duration_minutes: 180,
        is_done: false,
    },
    {
        id: 104,
        title: "Data Science with Python: From Exploration to Production",
        description: "End-to-end data workflows: cleaning, visualization, modeling, and deploying reproducible data pipelines.",
        speaker: "Prof. Michael Wong",
        venue: "Data Lab, Floor 3",
        date_start: "2025-11-15T10:00:00.000Z",
        date_end: "2025-11-15T13:00:00.000Z",
        duration_minutes: 180,
        is_done: false,
    },
    {
        id: 105,
        title: "Practical TypeScript: Types, Patterns, and Maintainability",
        description: "Level-up TypeScript usage in real projects: typing patterns, migration strategies, and tooling tips.",
        speaker: "Aisha Patel",
        venue: "Tech Hub Auditorium",
        date_start: "2025-09-12T09:30:00.000Z",
        date_end: "2025-09-12T11:30:00.000Z",
        duration_minutes: 120,
        is_done: true,
    },
    {
        id: 106,
        title: "Design Systems in Practice",
        description: "How to build and operate a design system that stays useful for designers and engineers over time.",
        speaker: "Carlos Mendes",
        venue: "Studio 7, Building B",
        date_start: "2025-12-02T15:00:00.000Z",
        date_end: "2025-12-02T17:00:00.000Z",
        duration_minutes: 120,
        is_done: false,
    },
    {
        id: 107,
        title: "Scaling APIs: Patterns for High Throughput",
        description: "Architectural patterns, caching strategies, and observability practices that keep APIs resilient under load.",
        speaker: "Maya Chen",
        venue: "Conference Room A",
        date_start: "2025-12-10T08:30:00.000Z",
        date_end: "2025-12-10T11:00:00.000Z",
        duration_minutes: 150,
        is_done: false,
    },
    {
        id: 108,
        title: "Effective Remote Collaboration and Communication",
        description: "Tools and rituals to keep distributed teams aligned, productive, and psychologically safe.",
        speaker: "Liam O'Connor",
        venue: "Online (Zoom)",
        date_start: "2025-10-05T02:00:00.000Z",
        date_end: "2025-10-05T03:30:00.000Z",
        duration_minutes: 90,
        is_done: true,
    }
    ];

    
    return(
        <>
            <div className="container p-4 sm:p-8 mx-auto">
                <FeaturedSeminarsSection seminars={mockSeminars} />
                <br/>
                <SeminarListSection seminars={mockSeminars} />
            </div>
        </>
    )
}