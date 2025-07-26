const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCalendarEvents() {
  try {
    // Get the first workspace
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      console.error('No workspace found');
      return;
    }

    // Get the first user
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error('No user found');
      return;
    }

    const today = new Date();
    const events = [
      {
        title: 'Team Standup Meeting',
        description: 'Daily sync with the development team',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
        allDay: false,
        location: 'Conference Room A',
        color: 'blue',
        type: 'MEETING',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Sprint Planning',
        description: 'Plan tasks for the next sprint',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 12, 0),
        allDay: false,
        location: 'Main Conference Room',
        color: 'purple',
        type: 'MEETING',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Product Launch',
        description: 'Launch of new features',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        allDay: true,
        color: 'green',
        type: 'EVENT',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Client Review Meeting',
        description: 'Review project progress with client',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 14, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 15, 30),
        allDay: false,
        location: 'Zoom',
        color: 'red',
        type: 'MEETING',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Team Building Event',
        description: 'Lunch and activities with the team',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 12, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 16, 0),
        allDay: false,
        location: 'Downtown Restaurant',
        color: 'yellow',
        type: 'EVENT',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Code Review Session',
        description: 'Review pull requests and discuss code quality',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 15, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 16, 0),
        allDay: false,
        location: 'Dev Room',
        color: 'blue',
        type: 'TASK',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Q4 Planning',
        description: 'Quarterly planning and goal setting',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 10, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 17, 0),
        allDay: false,
        location: 'Board Room',
        color: 'purple',
        type: 'MEETING',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Design Review',
        description: 'Review new UI/UX designs',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 11, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 12, 0),
        allDay: false,
        location: 'Design Studio',
        color: 'pink',
        type: 'MEETING',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Deploy to Production',
        description: 'Deploy latest features to production environment',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 20, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 22, 0),
        allDay: false,
        color: 'red',
        type: 'TASK',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Weekly Retrospective',
        description: 'Discuss what went well and what can be improved',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8, 16, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8, 17, 0),
        allDay: false,
        location: 'Team Room',
        color: 'green',
        type: 'MEETING',
        workspaceId: workspace.id,
        createdById: user.id
      },
      // Add some past events
      {
        title: 'Project Kickoff',
        description: 'Initial project planning meeting',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 10, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 11, 30),
        allDay: false,
        location: 'Conference Room B',
        color: 'blue',
        type: 'MEETING',
        workspaceId: workspace.id,
        createdById: user.id
      },
      {
        title: 'Training Session',
        description: 'New tool training for the team',
        startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 14, 0),
        endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 16, 0),
        allDay: false,
        location: 'Training Room',
        color: 'yellow',
        type: 'EVENT',
        workspaceId: workspace.id,
        createdById: user.id
      }
    ];

    console.log(`Creating ${events.length} calendar events...`);

    for (const event of events) {
      const created = await prisma.calendarEvent.create({
        data: event
      });
      console.log(`Created event: ${created.title} on ${created.startTime.toLocaleDateString()}`);
    }

    console.log('✅ All calendar events created successfully!');
  } catch (error) {
    console.error('Error creating calendar events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCalendarEvents();