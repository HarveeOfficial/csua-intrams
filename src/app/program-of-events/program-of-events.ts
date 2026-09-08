import { Component } from '@angular/core';

interface ProgramActivity {
  name: string;
  venue: string;
  time: string;
}

interface ProgramSession {
  period: string;
  activities: ProgramActivity[];
  subSessions?: ProgramSubSession[];
}

interface ProgramDay {
  label: string;
  date: string;
  sessions: ProgramSession[];
}

interface ProgramSubSession {
  subname: string;
  desc: string;
}

interface ProgramTableRow {
  activity: string;
  location: string;
  manager: string;
}

interface FacultyGroup {
  title: string;
  members: string[];
}

@Component({
  selector: 'app-program-of-events',
  templateUrl: './program-of-events.html',
  styleUrl: './program-of-events.css',
})
export class ProgramOfEvents {
  sportsActivities = [
    'Volleyball', 'Beach Volleyball', 'Basketball 5x5', 'Basketball 3x3',
    'Baseball', 'Softball', 'Football', 'Futsal', 'Sepak', 'Lawn Tennis',
    'Badminton', 'Table Tennis', 'Chess', 'Taekwondo', 'Arnis', 'Karate-do',
    'Pencak Silat',
  ];

  athleticsActivities = [
    'Running: 100m, 200m, 400m, 800m, 1,500m',
    'Hurdles: 100m/110m Relay, 4x100m, 4x400m',
    'Jumping: Long Jump, High Jump, Triple Jump',
    'Throwing: Shot Put, Discus, Javelin',
  ];

  eSportsActivities = ['Mobile Legends', 'Call of Duty Mobile'];

  sportsAssignments: ProgramTableRow[] = [
    { activity: 'Volleyball (M/W)', location: 'Volleyball Court', manager: 'Ordioso, J.' },
    { activity: 'Beach Volleyball (M/W)', location: 'DNST', manager: 'Tugad, R.' },
    { activity: 'Basketball 5x5 (M/W)', location: 'Basketball Court', manager: 'Guinoba, F. / Billariña, J.' },
    { activity: 'Basketball 3x3 (M/W)', location: 'Basketball Court', manager: 'Tamanu, J. / Talamayan Jr.' },
    { activity: 'Baseball', location: 'CHM Ground', manager: 'Mape, L.' },
    { activity: 'Softball', location: 'Football Field', manager: 'Agoto, J.' },
    { activity: 'Football', location: 'Football Field', manager: 'Alilam, R.' },
    { activity: 'Futsal', location: 'Gymplex Court', manager: 'Agpalza, J.' },
    { activity: 'Sepak (M)', location: 'Back of Admin Building', manager: 'Mabbun, J.' },
    { activity: 'Lawn Tennis (M/W)', location: 'Aparri Park', manager: 'Mabbagu, P.' },
    { activity: 'Badminton (M/W)', location: 'Gymplex', manager: 'Baylon, C.' },
    { activity: 'Table Tennis (M/W)', location: 'CICS Building, room 18', manager: 'Battung, E.' },
    { activity: 'Chess', location: 'Library', manager: 'Cariño, K.' },
    { activity: 'Taekwondo (M/W)', location: 'Gatchalian', manager: 'Sait, C.' },
    { activity: 'Arnis (M/W)', location: 'Gatchalian', manager: 'Silvestre, I.' },
    { activity: 'Karate-do (M/W)', location: 'Gatchalian', manager: 'Cobales, J.' },
    { activity: 'Pencak Silat (M/W)', location: 'Gatchalian', manager: 'Cobales, J.' },
    { activity: 'Mobile Legends (M/W)', location: 'CICS (online)', manager: 'Soriano, F.' },
    { activity: 'Call of Duty Mobile (M/W)', location: 'CICS (online)', manager: 'Cabus, S.' },
  ];

  facultyGroups: FacultyGroup[] = [
    { title: 'Mass', members: ['Ms. Diosa Marie Domingo', 'Dr. Maxima T. Sanchez', 'Ms. Jenean Luga', 'Mr. Evan Fred Battung', 'Mr. Reister Blancaflor'] },
    { title: 'Program / Invitation', members: ['Ms. Maria Victoria Santiago', 'Mr. Dee Jay N. Felix', 'Ms. Marivic Gorospe', 'Dr. Marie Khadija Xynelfida Ontiveros', 'Dr. Iolanie Silvestre', 'Ms. Cathy May Alipio'] },
    { title: 'Hall Preparation', members: ['Dr. Lito Mape', 'Dr. Cirilo Lacambra', 'Dr. Jennifer Cobales', 'Ms. Saniata Bautista', 'Mr. Jovito Buscas', 'Ms. Glenda Tangilan'] },
    { title: 'Stage Decoration', members: ['Dr. Rexcel Braceros', 'Ms. Raschill Battung', 'Mr. Melchor Martinez', 'Ms. Klaydine Mae Ragudo', 'Mr. Jansen Mary Visara'] },
    { title: 'Technical Team', members: ['Mr. Marnel Guitering', 'Mr. Rommel Dalumay', 'Mr. Jason Mabbun', 'Mr. Rowell Viggayan', 'Mr. James Agpalza'] },
    { title: 'Usherettes', members: ['Ms. Malou Fernando', 'Ms. Lizette Ann Arobel', 'Ms. Meryfaith Natividad', 'Ms. Amelia Grace Mecate', 'Ms. Rhoeliza Alejandre', 'Ms. Malou Cabacungan', 'Ms. Mariel Halili', 'Ms. Christine Cortez'] },
    { title: 'Finance', members: ['Ms. Melanie Membrot', 'Ms. Heidi Pascua', 'Mr. Reister Blancaflor', 'Mr. John Rey Tumaru', 'Mr. Ruben Ternura', 'Ms. Chaldea Apostol'] },
    { title: 'Clerk of Course', members: ['Dr. Jerome Billariña'] },
    { title: 'Documentation', members: ['Dr. Jerome Billariña', 'Mr. Evan Fred Battung', 'Mr. Marnel Guitering', 'Mr. Christian Elaurza', 'Mr. Franksel Poli Tindoc Jr.'] },
    { title: 'Transportation', members: ['Mr. Rey Alilam', 'Mr. Earl Paulo Orteza', 'Mr. Edison Bialba'] },
    { title: 'Peace & Order', members: ['Mr. Rey Alilam', 'Mr. Crisanto Sait'] },
    { title: 'Medical', members: ['Dr. Irene Ayque', 'Ms. Richelle Ann Paliuanan', 'Ms. Kriciele Montano', 'Ms. Christine Gaucusan', 'Mr. Jorlan Cabaruan', 'Ms. Ariane Dawn Barbosa', 'Ms. Ms. Lorlyn Amog', 'Ms. Gerlie Martin', 'Ms. Fatima Bassig'] },
    { title: 'Visual Arts', members: ['Dr. Cherry Baylon', 'Ms. Joanna Antonio', 'Mr. Ian Raphael Labicani', 'Mr. Christian Jay Frando', 'Ms. Vanessa Paula Ferrer', 'Mr. Renz Baniel', 'Ms. Angeline Turo', 'Mr. Renz A. Baniel', 'Mr. Jan Harvey Deseo'] },
    { title: 'Snack/Meals', members: ['Ms. Glaiza Orteza', 'Ms. Richelle A. Javier', 'Ms. Angeli Ross Pagaduan', 'Ms. Christine Anne Cortes', 'Ms. Sharmain Maggay', 'Ms. Fraida Mia Tarampi', 'Ms. Paule Allah Antoinette Peregi'] },
    { title: 'Musical Arts', members: ['Ms. Diosa Marie Domingo', 'Dr. Matilde Malana', 'Mr. Marnel Guitering', 'Mr. Jerico Tomas', 'Dr. Leo Paliuanan', 'Mr. Jemuel Fernandez', 'Mr. Mark Joseph Tintero', 'Ms. Hyacinthe Marcos'] },
    { title: 'Dance Arts', members: ['Mr. Jaylord Sentista', 'Ms. Glaiza Orteza', 'Ms. Delilah Amit', 'Mr. Cedric Sales', 'Mr. Reister Blancaflor', 'Mr. Ralph Leocharles Domingo', 'Mr. Ralph Lefrancis Domingo', 'Ms. Jenean Luga', 'Mr. Aldon Gerico Orel', 'Mr. John S. Pascua', 'Ms. Isabela Pabalan', 'Ms. Shahana Jacinto'] },
    { title: 'Literary Arts', members: ['Dr. Mark John Tamanu', 'Prof. Arlene Talosa', 'Dr. Venus Luz Colosaga', 'Dr. Delilah Amit', 'Mr. Dee Jay Felix', 'Ms. Hyacinth Joy Onate', 'Mr. Mark Jexrel A. Cristobal', 'Mr. Emil Paa', 'Mr. Krisha Arellano', 'Mr. Evan Fred Battung'] },
    { title: 'Dramatic Arts', members: ['Dr. Jasmin Sumer', 'Ms. Loraine Marcos', 'Ms. Katr(e)ena Sabado', 'Mr. Jann Patrick Sanchez', 'Ms. Liezl R. Pascua'] },
    { title: 'Special Category (Mr. & Ms. CSUA)', members: ['Mr. Kerwin John Malabag', 'Mr. Jaylord Sentista', 'Mr. Christian Alzaga', 'Ms. Kimberly Talosig', 'Ms. Hyacinth Joy Onate', 'Mr. Ralph Leocharles Domingo', 'Mr. Ralph Lefrancis Domingo', 'Mr. Reynaldo Marcos', 'Mr. Dee Jay Felix'] },
    { title: 'Search Paraphernalia', members: ['Dr. Shalainia Rivera', 'Ms. Marivic Gorospe', 'Ms. Kristin Alejo', 'Ms. Laila Lirazan', 'Ms. Louise Cristine Raneses'] },
  ];

  universityInfo = {
    vision: 'CSU is a university with global stature in the arts, culture, agriculture and fisheries, the sciences as well as technological and professional fields.',
    mission: 'Cagayan State University shall produce globally competent graduates through excellent instruction, innovative and creative research, responsive public service and productive industry and community engagement.',
    values: [
      { title: 'Competence', items: ['Critical thinker', 'Creative problem-solver', 'Competitive performer: nationally, regionally and globally.'] },
      { title: 'Social Responsibility', items: ['Sensitive to ethical demands', 'Steward of the environment for future generations', 'Social justice and economic equity advocate.'] },
      { title: 'Uniting Presence', items: ['Uniting theory and practice', 'Uniting strata of society', 'Unifying the nation, the ASEAN region and the world', 'Uniting the university and the community.'] },
    ],
  };

  programOfEvents: ProgramDay[] = [
    {
      label: 'Day 1',
      date: 'Sept 9, Wednesday 2026',
      sessions: [
        {
          period: 'Morning',
          activities: [
            { name: 'Eucharistic Celebration', venue: 'Gymplex', time: '7:30 AM' },
            { name: 'Opening Program', venue: 'Gymplex', time: '8:30 AM' },
          ],
          subSessions: [
            { subname: 'Entrance of Colors', desc: 'ROTCians' },
            { subname: 'Filipinism', desc: 'AVP' },
            { subname: 'CSU Hymm', desc: 'AVP' },
            { subname: 'Opening Remarks', desc: 'Leo P. Paliuanan, Ph.D., Campus Sports Coordinator' },
            { subname: 'Presentation of the Competing Teams and Banners', desc: 'Governors' },
            { subname: 'Bleacher Cheering', desc: 'All Competing Teams' },
            { subname: 'Hoisting of Banners', desc: 'All Deans and Governors' },
            { subname: 'Lighting of Torch', desc: 'Capus Executive Officer, Campus Directors, Sports and Socio-Cultural Coordinator, CSC President, Student Athletes' },
            { subname: 'Oath of Sportsmanship', desc: 'Princess Mae Ronquillo, CavRASUC Arnis Champion' },
            { subname: 'Declaration of Formal Opening', desc: 'Dr. Policarpio L. Mabborang Jr., ASEAN ENGR., Capus Executive Officer' },
            { subname: 'Presentation of Candidates and Sashing Ceremony', desc: 'Mr. and Ms. CSUA Candidates' },
            { subname: 'Kumpas Kabataan', desc: 'All Competing Teams' },
        ],
        },
        {
          period: 'Afternoon',
          activities: [
            { name: 'Musical Competition', venue: 'Gymplex', time: '1:30 PM' },
            { name: 'All Sports Events', venue: 'Sports venues', time: '1:00 PM' },
          ],
          subSessions: [
            { subname: 'Prayer', desc: 'ROTCians' },
            { subname: 'Filipinism', desc: 'AVP' },
            { subname: 'CSU Hymm', desc: 'AVP' },
            { subname: 'Opening Remarks', desc: 'Leo P. Paliuanan, Ph.D., Campus Sports Coordinator' },
            { subname: 'Presentation of the Competing Teams and Banners', desc: 'Governors' },
            { subname: 'Bleacher Cheering', desc: 'All Competing Teams' },
            { subname: 'Hoisting of Banners', desc: 'All Deans and Governors' },
            { subname: 'Lighting of Torch', desc: 'Capus Executive Officer, Campus Directors, Sports and Socio-Cultural Coordinator, CSC President, Student Athletes' },
            { subname: 'Oath of Sportsmanship', desc: 'Princess Mae Ronquillo, CavRASUC Arnis Champion' },
            { subname: 'Declaration of Formal Opening', desc: 'Dr. Policarpio L. Mabborang Jr., ASEAN ENGR., Capus Executive Officer' },
            { subname: 'Presentation of Candidates and Sashing Ceremony', desc: 'Mr. and Ms. CSUA Candidates' },
            { subname: 'Kumpas Kabataan', desc: 'All Competing Teams' },
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
