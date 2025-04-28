import * as THREE from "three";
export class PositionSprite {
  sprite: THREE.Sprite;
  callbacks: any[];
  constructor(
    text: string,
    position: THREE.Vector3,
    scene: THREE.Scene,
    camera: THREE.Camera
  ) {
    this.callbacks = [];
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "rgba(100, 100, 100, 0.7)";
    ctx.fillRect(0, 256, canvas.width, canvas.height / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 200px Arial";
    ctx.fillStyle = "white";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    this.sprite = sprite;
    scene.add(sprite);

    let pointer = new THREE.Vector2();
    let raycaster = new THREE.Raycaster();
    window.addEventListener("click", (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(sprite);
      if (intersects.length > 0) {
        this.callbacks.forEach((callback) => callback());
      }
    });
  }

  onClick(callback: () => void) {
    this.callbacks.push(callback);
  }
}
