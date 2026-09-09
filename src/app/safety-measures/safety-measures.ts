import { Component } from '@angular/core';

@Component({
  selector: 'app-safety-measures',
  templateUrl: './safety-measures.html',
  styleUrl: './safety-measures.css',
})
export class SafetyMeasures {
  safetyGuides = [
    {
      title: 'Before the Event',
      items: [
        'Ensure that all playing areas are clean, safe, and free from obstructions.',
        'Check sports equipment and facilities before use.',
        'Participants should wear appropriate sports attire and protective equipment.',
        'Conduct proper warm-up and stretching exercises before participating.',
        'Ensure that emergency exits and access routes remain clear.',
        'Identify the nearest medical assistance location before the activity starts.',
      ],
    },
    {
      title: 'During the Event',
      items: [
        'Follow the instructions of coaches, officials, organizers, and safety personnel.',
        'Avoid unnecessary physical contact outside the rules of the game.',
        'Immediately report injuries, accidents, or unsafe conditions.',
        'Stop playing when experiencing severe pain, dizziness, difficulty breathing, or other unusual symptoms.',
        'Maintain proper hydration, especially during outdoor activities.',
        'Spectators should remain in designated viewing areas.',
        'Keep walkways, entrances, and emergency routes clear.',
      ],
    },
    {
      title: 'After the Event',
      items: [
        'Report any injuries or incidents that occurred during the activity.',
        'Return equipment properly and ensure that playing areas are left clean.',
        'Report damaged facilities or equipment to the organizers.',
      ],
    },
  ];

  emergencyProcedures = [
    {
      title: 'In Case of Injury',
      steps: [
        'Stop the activity immediately.',
        'Notify the coach, game official, or event organizer.',
        'Do not move a seriously injured person unless there is an immediate danger.',
        'Seek assistance from the nearest medical assistance location.',
        'Contact the appropriate emergency personnel when necessary.',
      ],
    },
    {
      title: 'In Case of Fire or Other Emergency',
      steps: [
        'Remain calm and avoid panic.',
        'Follow the instructions of event officials and emergency personnel.',
        'Proceed to the designated safe area.',
        'Do not run, push, or create unnecessary congestion.',
        'Do not return to the affected area until authorized.',
      ],
    },
  ];

  medicalAssistance = [
    { location: 'Library', purpose: 'Nearest medical assistance point' },
    { location: 'Gymplex', purpose: 'Medical/emergency assistance during sports activities' },
  ];

  emergencyContacts = [
    { label: 'Campus Emergency/Medical', value: '0917 193 8472' },
    { label: 'MDRROM', value: '0956-654-2894 / 0961-971-2006 or 0997-240-4984' },
    { label: 'PNP', value: '0917-203-2003' },
    { label: 'BFP', value: '0916-491-0946 / 0956-260-7818' },
    { label: 'MHO', value: '0953-190-8364' },
  ];
}
