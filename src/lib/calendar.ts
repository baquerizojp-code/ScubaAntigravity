/**
 * Calendar export utilities for dive trips
 */

interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM or HH:MM:SS
  durationHours?: number;
}

function formatICSDate(date: string, time: string): string {
  const d = new Date(`${date}T${time.slice(0, 5)}:00`);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

export function generateICSFile(event: CalendarEvent): string {
  const start = formatICSDate(event.startDate, event.startTime);
  const endDate = new Date(`${event.startDate}T${event.startTime.slice(0, 5)}:00`);
  endDate.setHours(endDate.getHours() + (event.durationHours || 3));
  const end = formatICSDate(
    endDate.toISOString().slice(0, 10),
    `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
  );

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ScubaPlanner//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function downloadICSFile(event: CalendarEvent) {
  const ics = generateICSFile(event);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarUrl(event: CalendarEvent): string {
  const start = formatICSDate(event.startDate, event.startTime);
  const endDate = new Date(`${event.startDate}T${event.startTime.slice(0, 5)}:00`);
  endDate.setHours(endDate.getHours() + (event.durationHours || 3));
  const end = formatICSDate(
    endDate.toISOString().slice(0, 10),
    `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
  );

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
