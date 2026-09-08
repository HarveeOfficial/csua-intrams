import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type EventInfoTab = 'campus' | 'sports' | 'socio' | 'ceo';

export interface IEventInfoRow {
  event: string;
  participants: string;
  equivalentGold: string;
}

export interface IEventInfoGroup {
  title: string;
  rows: IEventInfoRow[];
}

@Component({
  selector: 'app-event-info',
  imports: [CommonModule],
  templateUrl: './event-info.html',
  styleUrl: './event-info.css',
})
export class EventInfo {
  activeTab = signal<EventInfoTab>('campus');

  // Placeholder copy - update with the office's actual details.
  campusSportsOffice = {
    name: 'Campus Sports Office',
    mission:
      'The Campus Sports Office oversees the planning, coordination, and conduct of the CSUA Intramurals, promoting sportsmanship, wellness, and school spirit among all colleges.',
    responsibilities: [
      'Organizing and supervising intramural sports and socio-cultural events',
      'Setting and enforcing competition rules and scoring guidelines',
      'Coordinating schedules, venues, and officials for each event',
      'Maintaining official standings and records for all participating colleges',
    ],
    contact: {
      office: 'CSU Aparri Sports Office',
      email: 'csuasport@gmail.com',
      phone: '+63 994-7900-651',
      hours: 'Wednesday, 1:00 PM - 5:00 PM',
    },
  };

  selectTab(tab: EventInfoTab): void {
    this.activeTab.set(tab);
  }

  // Placeholder copy - update with the CEO's actual message and photo.
  ceoMessage = {
    name: 'Prof. Policarpio L. Mabborang Jr., ASEAN Engr.',
    title: 'Campus Executive Officer',
    photoUrl: '/mabborang.jpg',
    message:
      'It is with great pride and enthusiasm that I extend my full support to the Campus Intramurals 2026. This yearly celebration of sportsmanship, talent, and camaraderie reflects the very best of our student community, and I am confident that every college will compete with honor and unity. Let us make this year\'s intramurals a memorable and successful event for everyone involved.',
  };

  // Individual athletics events: 1 gold per athlete fielded.
  athleticsIndividual: IEventInfoGroup = {
    title: 'Athletics — Individual Events',
    rows: [
      { event: '100m Dash', participants: '1', equivalentGold: '1 Gold' },
      { event: '200m Dash', participants: '1', equivalentGold: '1 Gold' },
      { event: '400m Dash', participants: '1', equivalentGold: '1 Gold' },
      { event: '800m Run', participants: '1', equivalentGold: '1 Gold' },
      { event: '1,500m Run', participants: '1', equivalentGold: '1 Gold' },
      { event: '3,000m Run', participants: '1', equivalentGold: '1 Gold' },
      { event: '5,000m Run', participants: '1', equivalentGold: '1 Gold' },
      { event: '110m/100m Hurdles', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Long Jump', participants: '1', equivalentGold: '1 Gold' },
      { event: 'High Jump', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Triple Jump', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Shot Put', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Discus Throw', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Javelin Throw', participants: '1', equivalentGold: '1 Gold' },
    ],
  };

  // Relay events: gold equivalent scales with the number of athletes on the team.
  athleticsRelay: IEventInfoGroup = {
    title: 'Athletics — Relay Events',
    rows: [
      { event: '4 x 100m Relay', participants: '4', equivalentGold: '4 Golds' },
      { event: '4 x 400m Relay', participants: '4', equivalentGold: '4 Golds' },
      { event: 'Mixed Relay (4 athletes)', participants: '4', equivalentGold: '4 Golds' },
    ],
  };

  // Team/court sports: values derived from the standard roster size used for scoring.
  teamSports: IEventInfoGroup = {
    title: 'Team & Court Sports',
    rows: [
      { event: 'Arnis', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Arnis (Anyo Duo)', participants: '2', equivalentGold: '2 Gold' },
      { event: 'Arnis (Anyo Solo)', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Arnis (Anyo Synchro)', participants: '3', equivalentGold: '3 Gold' },
      { event: 'Badminton Doubles', participants: '2', equivalentGold: '2 Golds' },
      { event: 'Badminton Singles', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Baseball', participants: '9', equivalentGold: '9 Golds' },
      { event: 'Basketball 3x3', participants: '3', equivalentGold: '3 Golds' },
      { event: 'Basketball 5v5', participants: '5', equivalentGold: '5 Golds' },
      { event: 'Beach Volleyball', participants: '2', equivalentGold: '2 Golds' },
      { event: 'Chess – Individual', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Darts – Individual', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Football', participants: '11', equivalentGold: '11 Golds' },
      { event: 'Futsal', participants: '5', equivalentGold: '5 Golds' },
      { event: 'Karate-do', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Karate-do (Kata Individual)', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Karate-do (Kata Team)', participants: '3', equivalentGold: '3 Gold' },
      { event: 'Lawn Tennis - Doubles', participants: '2', equivalentGold: '2 Gold' },
      { event: 'Lawn Tennis - Singles', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Pencak Silat', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Pencak Silat (Jurus Individual (Bare-Handed))', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Pencak Silat (Jurus Individual (Golok))', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Pencak Silat (Jurus Individual (Tongkat))', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Pencak Silat (Jurus Team)', participants: '3', equivalentGold: '3 Gold' },
      { event: 'Sepak Takraw', participants: '3', equivalentGold: '3 Golds' },
      { event: 'Softball', participants: '9', equivalentGold: '9 Golds' },
      { event: 'Table Tennis – Doubles', participants: '2', equivalentGold: '2 Golds' },
      { event: 'Table Tennis – Singles', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Taekwondo', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Taekwondo (Poomsae Individual)', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Taekwondo (Poomsae Duo)', participants: '2', equivalentGold: '2 Gold' },
      { event: 'Taekwondo (Poomsae Team)', participants: '3', equivalentGold: '3 Gold' },
      { event: 'Volleyball', participants: '6', equivalentGold: '6 Golds' },
    ],
  };

  // E-Sports: values based on the standard competitive squad size per title.
  eSports: IEventInfoGroup = {
    title: 'E-Sports',
    rows: [
      { event: 'Mobile Legends: Bang Bang (MLBB)', participants: '5', equivalentGold: '5 Golds' },
      { event: 'Call of Duty: Mobile (CODM)', participants: '5', equivalentGold: '5 Golds' },
    ],
  };

  

  // Socio-cultural events are judged as a single group entry per college.
  socioCultural: IEventInfoGroup = {
    title: 'Socio-Cultural Events',
    rows: [
      { event: 'Bench Cheering', participants: '50', equivalentGold: '1 Gold' },
      { event: 'Charcoal Rendering', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Contemporary Dance Duo', participants: '2', equivalentGold: '1 Gold' },
      { event: 'Dagliang Talumpati', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Declamation', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Deklamasyon', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Dramatic Monologue', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Duo Acting', participants: '2', equivalentGold: '1 Gold' },
      { event: 'Essay Writing', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Extemporaneous Speech', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Instrumental Solo (Banduria)', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Instrumental Solo (Classical Guitar)', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Instrumental Solo (Piano)', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Instrumental Solo (Violin)', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Jump Street', participants: '6-10', equivalentGold: '1 Gold' },
      { event: 'Live Band', participants: '4-7', equivalentGold: '1 Gold' },
      { event: 'On-The-Spot Poster Making Contest', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Oral Interpretation of Poetry', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Oratorio', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Pagkukuwento', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Pagsulat ng Sanaysay', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Painting', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Pandalawahang Pag-Arte (Duo Acting)', participants: '2', equivalentGold: '1 Gold' },
      { event: 'Pencil Drawing', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Persuasive Oratory', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Phillipine Folk Dance', participants: '10-16', equivalentGold: '1 Gold' },
      { event: 'Photo Contest', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Pop Solo', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Quartet (New Category)', participants: '4', equivalentGold: '1 Gold' },
      { event: 'Search for Mr. and Ms. PASUC', participants: '2 pairs', equivalentGold: '1 Gold' },
      { event: 'Short and Sweet Play (Dialogue)', participants: '3-6', equivalentGold: '1 Gold' },
      { event: 'Song Writing', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Standard Choral Singing', participants: '16-20', equivalentGold: '1 Gold' },
      { event: 'Story Telling', participants: '1', equivalentGold: '1 Gold' },
      { event: 'Street Dance', participants: '6-10', equivalentGold: '1 Gold' },
      { event: 'Vocal Duet', participants: '2', equivalentGold: '1 Gold' },
      { event: 'Vocal Solo', participants: '1', equivalentGold: '1 Gold' },
    ],
  };
}
