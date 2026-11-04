// All combat values use seconds and world coordinates. Add units here and to stage.unlocks.
export const UNITS = {
  blade: { name: '火花の猫', role: '近距離アタッカー', cost: 65, hp: 120, attack: 24, range: 30, speed: 45, interval: 0.8, cooldown: 1.8, color: '#ffcf79', mark: '猫' },
  guard: { name: 'まんぷく猫', role: '高HPの太った猫', cost: 110, hp: 390, attack: 13, range: 32, speed: 26, interval: 1.2, cooldown: 4, color: '#91d1c0', mark: '太猫' },
  archer: { name: '星灯りの魔法猫', role: '遠距離の魔法使い', cost: 140, hp: 75, attack: 33, range: 180, speed: 34, interval: 1.5, cooldown: 4.5, color: '#b3b0ff', mark: '魔猫' },
};
export const STAGE = {
  name: '薄明の草原', width: 1500, castleHP: 1100, initialMoney: 180,
  maxMoney: 999, income: 22, enemyFirstSpawn: 4, enemySpawnInterval: 4.8,
  enemyMinInterval: 2.6, enemyAcceleration: 0.009, enemyPower: 0.85,
  enemySequence: ['blade', 'blade', 'guard', 'blade', 'archer'],
  unlocks: ['blade', 'guard', 'archer'],
};
