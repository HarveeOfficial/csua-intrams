import { Component } from '@angular/core';

interface ProgramActivity {
  name: string;
  venue: string;
  time: string;
}

interface ProgramSession {
  period: string;
  activities: ProgramActivity[];
}

interface ProgramDay {
  label: string;
  date: string;
  sessions: ProgramSession[];
}

@Component({
  selector: 'app-program-of-events',
  templateUrl: './program-of-events.html',
  styleUrl: './program-of-events.css',
})
export class ProgramOfEvents {
  programOfEvents: ProgramDay[] = [
    {
      label: 'Day 1',
      date: 'Sept 9, Wednesday 2026',
      sessions: [
        {
          period: 'Morning',
          activities: [
            { name: 'Mass', venue: 'Gymplex', time: '6:30 AM' },
            { name: 'Kick-Off/Opening Program', venue: 'Gymplex', time: '7:30 AM' },
          ],
        },
        {
          period: 'Afternoon',
          activities: [
            { name: 'Musical Competition', venue: 'Gymplex', time: '1:00 PM' },
            { name: 'All Sports Events', venue: 'Sports venues', time: '1:00 PM' },
          ],
        },
      ],
    },
    {
      label: 'Day 2',
      date: 'Sept 10, Thursday 2026',
      sessions: [
        {
          period: 'Morning',
          activities: [
            { name: 'Continuation of all Sports Events', venue: 'Sports venues', time: '7:00 AM' },
            { name: 'Athletics Events', venue: 'LGU CAMAL', time: '7:00 AM' },
            { name: 'Combative Events', venue: 'Gymplex and Gatchalian Building', time: '7:00 AM' },
            { name: 'Mobile Games', venue: 'CICS building', time: '7:00 AM' },
          ],
        },
        {
          period: 'Afternoon',
          activities: [
            { name: 'Continuation of all Sports Events', venue: 'Sports venues', time: '7:00 AM' },
            { name: 'Continuation of all Athletics Events', venue: 'LGU CAMAL', time: '7:00 AM' },
            { name: 'Continuation of all Combative Events', venue: 'Gymplex and Gatchalian Building', time: '7:00 AM' },
            { name: 'Continuation of all Mobile Games', venue: 'CICS building', time: '7:00 AM' },
            { name: 'Pageant', venue: 'Gymplex', time: '1:00 PM' },
          ],
        },
      ],
    },
    {
      label: 'Day 3',
      date: 'Sept 11, Friday 2026',
      sessions: [
        {
          period: 'Morning',
          activities: [
            { name: 'Basketball Exhibition (Faculty and Personnel)', venue: '', time: '7:00 AM' },
            { name: 'Continuation of all Sports Events', venue: 'Sports venues', time: '7:00 AM' },
            { name: 'Continuation of all Mobile Games', venue: 'CICS building', time: '7:00 AM' },
          ],
        },
        {
          period: 'Afternoon',
          activities: [
            { name: 'Continuation of all Sports Events', venue: 'Sports venues', time: '7:00 AM' },
            { name: 'Continuation of all Mobile Games', venue: 'CICS building', time: '7:00 AM' },
          ],
        },
      ],
    },
  ];
}
