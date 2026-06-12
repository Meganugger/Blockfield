import { PHYSICS, MAX_HEALTH, RESPAWN_DELAY_MS } from './config';
import { ANIM } from './protocol';
import { createScene } from './renderer/createScene';
import { createBaseplate } from './world/Baseplate';
import { createAvatar } from './character/Avatar';
import { AnimationController } from './character/AnimationController';
import { createNameplate } from './character/Nameplate';
import { CharacterController } from './character/CharacterController';
import { ThirdPersonCamera } from './camera/ThirdPersonCamera';
import { InputManager } from './input/InputManager';
import { NetworkClient } from './net/NetworkClient';
import { RemotePlayers } from './net/RemotePlayers';
import { scripts } from './scripting/GameScripts';

// Engine orchestrator: fixed-timestep simulation (60Hz) decoupled from the
// render loop, wiring input -> physics -> animation -> camera -> replication.
export class Engine {
  constructor(container, world, identity, events) {
    this.container = container;
    this.world = world;
    this.identity = identity; // { username, color }
    this.events = events; // { onHealth, onDeath, onRespawn, onPlayers, onChat, onStatus }
    this.dead = false;
    this.deaths = 0;
    this.health = MAX_HEALTH;
    this.disposed = false;
  }

  async start() {
    const { renderer, scene, dispose } = createScene(this.container, this.world);
    this.renderer = renderer;
    this.scene = scene;
    this._disposeScene = dispose;

    createBaseplate(scene, this.world.baseplate_size);

    const avatar = createAvatar(this.identity.color);
    avatar.group.add(createNameplate(this.identity.username));
    scene.add(avatar.group);
    this.avatar = avatar;
    this.anim = new AnimationController(avatar.parts);

    this.controller = new CharacterController(this.world);
    this.controller.respawn();

    this.input = new InputManager();
    this.input.attach();

    this.camera = new ThirdPersonCamera(renderer.domElement);
    this.camera.attach();

    this._resize();
    this.resizeObs = new ResizeObserver(() => this._resize());
    this.resizeObs.observe(this.container);

    this.remotes = new RemotePlayers(scene);
    this.network = new NetworkClient({
      onPlayers: (remotes) => {
        if (this.disposed) return;
        this.remotes.sync(remotes);
        this._emitPlayers(remotes);
      },
      onChat: (m) => {
        this.events.onChat?.(m);
        scripts.emit('onChatMessage', m);
      },
      onStatus: (s) => this.events.onStatus?.(s),
    });
    await this.network.connect(this.identity.username, this.identity.color, this.controller.pos);
    scripts.emit('onPlayerJoin', { username: this.identity.username });

    this._loop();
  }

  _resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h);
    this.camera.setAspect(w / h);
  }

  _emitPlayers(remotes) {
    this.events.onPlayers?.([
      {
        id: 'self',
        username: this.identity.username,
        deaths: this.deaths,
        health: this.health,
        last_seen: Date.now(),
        isSelf: true,
      },
      ...remotes,
    ]);
  }

  setChatOpen(open) {
    this.input.setEnabled(!open);
    if (open) document.exitPointerLock?.();
  }

  sendChat(text) {
    return this.network.sendChat(text);
  }

  _loop() {
    const step = 1 / 60;
    let last = performance.now();
    let acc = 0;
    const frame = (now) => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(frame);
      acc += Math.min((now - last) / 1000, 0.25);
      last = now;
      while (acc >= step) {
        this._update(step);
        acc -= step;
      }
      this.renderer.render(this.scene, this.camera.camera);
    };
    this.raf = requestAnimationFrame(frame);
  }

  _update(dt) {
    const c = this.controller;
    c.enabled = !this.dead;
    c.update(dt, this.input, this.camera.yaw);

    if (!this.dead && c.pos.y < PHYSICS.voidY) this._die();

    this.avatar.group.position.copy(c.pos);
    this.avatar.group.rotation.y = c.yaw;
    const tip = this.dead ? Math.PI / 2 : 0;
    this.avatar.group.rotation.x += (tip - this.avatar.group.rotation.x) * Math.min(1, 8 * dt);

    const animState = this.dead ? ANIM.DEAD : c.anim;
    this.anim.setState(animState);
    this.anim.update(dt);

    this.camera.update(dt, c.pos);
    this.remotes.update(dt);

    this.network.sendState({
      x: c.pos.x, y: c.pos.y, z: c.pos.z, yaw: c.yaw,
      anim: animState, health: this.health, deaths: this.deaths,
    });

    scripts.emit('onTick', dt);
  }

  _die() {
    this.dead = true;
    this.health = 0;
    this.deaths += 1;
    this.events.onHealth?.(0, this.deaths);
    this.events.onDeath?.();
    this._emitPlayers(this.network.getRemotes());
    scripts.emit('onPlayerDeath', { username: this.identity.username });
    this.respawnTimer = setTimeout(() => this._respawn(), RESPAWN_DELAY_MS);
  }

  _respawn() {
    if (this.disposed) return;
    this.controller.respawn();
    this.avatar.group.rotation.x = 0;
    this.dead = false;
    this.health = MAX_HEALTH;
    this.events.onHealth?.(this.health, this.deaths);
    this.events.onRespawn?.();
    this._emitPlayers(this.network.getRemotes());
    scripts.emit('onPlayerRespawn', { username: this.identity.username });
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    clearTimeout(this.respawnTimer);
    this.resizeObs?.disconnect();
    this.input?.detach();
    this.camera?.detach();
    this.remotes?.dispose();
    this.network?.disconnect();
    scripts.emit('onPlayerLeave', { username: this.identity.username });
    this._disposeScene?.();
  }
}