export const USERS = [
  {
    id: 'om',
    name: 'Om',
    email: 'om@securemail.local',
    avatar: 'O',
    color: 'bg-blue-500',
    colorHex: '#3b82f6',
  },
  {
    id: 'lavesh',
    name: 'Lavesh',
    email: 'lavesh@securemail.local',
    avatar: 'L',
    color: 'bg-emerald-500',
    colorHex: '#10b981',
  },
  {
    id: 'kumbe',
    name: 'Kumbe',
    email: 'kumbe@securemail.local',
    avatar: 'K',
    color: 'bg-purple-500',
    colorHex: '#a855f7',
  },
  {
    id: 'tanishq',
    name: 'Tanishq',
    email: 'tanishq@securemail.local',
    avatar: 'T',
    color: 'bg-orange-500',
    colorHex: '#f97316',
  },
];

export function getUserById(id) {
  return USERS.find((u) => u.id === id) || null;
}

export function getUserName(id) {
  const user = getUserById(id);
  return user ? user.name : id;
}
