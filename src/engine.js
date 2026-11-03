import { UNITS, STAGE } from './config.js';
export class Battle {
  constructor(stage = STAGE) { this.stage = stage; this.reset(); }
  reset() {
    this.time = 0; this.money = this.stage.initialMoney; this.units = []; this.effects = [];
    this.castles = { ally: this.stage.castleHP, enemy: this.stage.castleHP };
    this.cooldowns = {}; this.spawnTimer = this.stage.enemyFirstSpawn; this.wave = 0; this.result = null; this.nextId = 0;
  }
  spawn(type, side = 'ally') {
    const spec = UNITS[type];
    if (!spec || this.result) return false;
    if (side === 'ally') {
      if (!this.stage.unlocks.includes(type) || this.money < spec.cost || this.cooldowns[type] > 0) return false;
      this.money -= spec.cost; this.cooldowns[type] = spec.cooldown;
    }
    const power = side === 'enemy' ? this.stage.enemyPower : 1;
    this.units.push({ ...spec, type, id: this.nextId++, side, x: side === 'ally' ? 115 : this.stage.width - 115,
      hp: spec.hp * power, maxHP: spec.hp * power, attack: spec.attack * power, timer: 0.25, age: 0, flash: 0 });
    return true;
  }
  effect(kind, x, side, value = '') { this.effects.push({ kind, x, side, value, life: 0.65, maxLife: 0.65 }); }
  update(dt) {
    if (this.result) return;
    dt = Math.min(dt, 0.05); this.time += dt;
    this.money = Math.min(this.stage.maxMoney, this.money + this.stage.income * dt);
    for (const key in this.cooldowns) this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawn(this.stage.enemySequence[this.wave++ % this.stage.enemySequence.length], 'enemy');
      this.spawnTimer = Math.max(this.stage.enemyMinInterval, this.stage.enemySpawnInterval - this.time * this.stage.enemyAcceleration);
    }
    for (const unit of this.units) {
      if (unit.hp <= 0) continue;
      unit.age += dt; unit.flash = Math.max(0, unit.flash - dt); unit.timer -= dt;
      const direction = unit.side === 'ally' ? 1 : -1;
      const opponents = this.units.filter(v => v.side !== unit.side && v.hp > 0 && (v.x - unit.x) * direction >= -12);
      const target = opponents.sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))[0];
      const enemySide = unit.side === 'ally' ? 'enemy' : 'ally';
      const castleX = enemySide === 'enemy' ? this.stage.width - 75 : 75;
      const distance = target ? Math.abs(target.x - unit.x) : Math.abs(castleX - unit.x);
      if (distance <= unit.range + 18) {
        if (unit.timer <= 0) {
          unit.timer = unit.interval; unit.flash = 0.18;
          const x = target ? target.x : castleX;
          if (target) target.hp -= unit.attack; else this.castles[enemySide] = Math.max(0, this.castles[enemySide] - unit.attack);
          this.effect('hit', x, unit.side, Math.round(unit.attack));
          if (unit.type === 'archer') this.effects.push({ kind: 'arrow', x: unit.x, to: x, side: unit.side, life: 0.22, maxLife: 0.22 });
        }
      } else unit.x += direction * Math.min(unit.speed * dt, distance - unit.range - 18);
    }
    for (const unit of this.units.filter(v => v.hp <= 0)) this.effect('death', unit.x, unit.side);
    this.units = this.units.filter(v => v.hp > 0);
    this.effects = this.effects.filter(e => (e.life -= dt) > 0);
    if (this.castles.enemy <= 0) this.result = 'victory';
    else if (this.castles.ally <= 0) this.result = 'defeat';
  }
}
