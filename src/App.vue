<template>
  <div ref="container" class="container"></div>
</template>

<script setup lang="ts">
import gsap from "gsap";
import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { onMounted, ref } from "vue";

const container = ref<HTMLElement | null>(null);

// 初始化场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// 设置相机位置
// camera.position.z = 30;

const useInsertCamera = () => {
  // 将相机放入场景去
  // 0.01是因为使用了轨道
  camera.position.set(0, 0, 0.01);
};

const useBox = () => {
  useInsertCamera();
  const materials: THREE.MeshBasicMaterial[] = [];

  const texture_right = new THREE.TextureLoader().load(
    "./images/livingRoom/living_r.jpg"
  );
  materials.push(new THREE.MeshBasicMaterial({ map: texture_right }));

  const texture_left = new THREE.TextureLoader().load(
    "./images/livingRoom/living_l.jpg"
  );
  materials.push(new THREE.MeshBasicMaterial({ map: texture_left }));

  const texture_up = new THREE.TextureLoader().load(
    "./images/livingRoom/living_u.jpg"
  );
  materials.push(new THREE.MeshBasicMaterial({ map: texture_up }));

  const texture_down = new THREE.TextureLoader().load(
    "./images/livingRoom/living_d.jpg"
  );
  materials.push(new THREE.MeshBasicMaterial({ map: texture_down }));

  const texture_front = new THREE.TextureLoader().load(
    "./images/livingRoom/living_f.jpg"
  );
  materials.push(new THREE.MeshBasicMaterial({ map: texture_front }));

  const texture_back = new THREE.TextureLoader().load(
    "./images/livingRoom/living_b.jpg"
  );
  materials.push(new THREE.MeshBasicMaterial({ map: texture_back }));

  // 客厅立方体
  // 创建几何体
  const geometry = new THREE.BoxGeometry(10, 10, 10);

  // 几何体材质
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  // 创建网格模型
  const cube = new THREE.Mesh(geometry, materials);

  // 返转贴纸
  cube.geometry.scale(1, 1, -1);

  // 将网格模型添加到场景中
  scene.add(cube);

  // 阳台立方体
  const roomPrefix = "balcony";
  const arr = [
    `${roomPrefix}_r`,
    `${roomPrefix}_l`,
    `${roomPrefix}_u`,
    `${roomPrefix}_d`,
    `${roomPrefix}_f`,
    `${roomPrefix}_b`,
  ];
  const balconyMaterials: THREE.MeshBasicMaterial[] = [];
  arr.forEach((item) => {
    const texture = new THREE.TextureLoader().load(
      `./images/balcony/${item}.jpg`
    );
    balconyMaterials.push(new THREE.MeshBasicMaterial({ map: texture }));
  });
  const balconyGeometry = new THREE.BoxGeometry(10, 10, 10);
  const balconyV3 = new THREE.Vector3(0, 0, -10);
  const balconyE3 = new THREE.Euler(0, 0, 0);
  const balconyCube = new THREE.Mesh(balconyGeometry, balconyMaterials);
  balconyCube.geometry.scale(1, 1, -1);
  balconyCube.position.copy(balconyV3);
  balconyCube.rotation.copy(balconyE3);
  scene.add(balconyCube);

  return cube;
};

const useSphere = () => {
  useInsertCamera();
  const geometry = new THREE.SphereGeometry(1, 50, 50);
  geometry.scale(1, 1, -1);
  const texture = new THREE.TextureLoader().load("./images/scene.jpeg");
  const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, sphereMaterial);
  scene.add(sphere);
  return sphere;
};

const useSimple = () => {
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const v3 = new THREE.Vector3(0, 0, 0);
  const e3 = new THREE.Euler(10, 0, 0);
  // 几何体材质
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // 创建网格模型
  const cube = new THREE.Mesh(geometry, material);
  cube.position.copy(v3);
  cube.rotation.copy(e3);
  // 将网格模型添加到场景中
  scene.add(cube);
  cube.geometry.scale(1, 1, -1);
  return cube;
};
// const cube = useSimple();
const cube = useBox();
// const cube = useSphere();

window.addEventListener("resize", () => {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新摄像头的投影矩阵
  camera.updateProjectionMatrix();
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置渲染器的像素比
  renderer.setPixelRatio(window.devicePixelRatio);
});

// 轨道控制器对象
let controls: OrbitControls;

// 添加坐标辅助器
const axesHelper = new THREE.AxesHelper(20);

// 将坐标辅助器添加到场景中
scene.add(axesHelper);

// 创建渲染器
const renderer = new THREE.WebGLRenderer();

// 设置渲染器大小
renderer.setSize(window.innerWidth, window.innerHeight);

// gsap.to(cube.position, {
//   x: 5,
//   duration: 2,
// });
// gsap.to(cube.position, {
//   y: 5,
//   duration: 1,
// });
// gsap.to(cube.rotation, {
//   z: 5,
//   duration: 2,
// });

// 图形化控制界面
const gui = new dat.GUI();
// gui.add(cube.position, "x", 0, 10).name("x坐标").min(-5).max(5).step(0.1);
// gui.add(cube.position, "y", 0, 10).name("y坐标").min(-5).max(5).step(0.1);
// gui.add(cube.position, "z", 0, 10).name("z坐标").min(-5).max(5).step(0.1);
// gui
//   .addColor({ color: 0x00ff00 }, "color")
//   .name("修改颜色")
//   .onChange((e) => {
//     cube.material.color = new THREE.Color(e);
//   });
const boxFolder = gui.addFolder("立方体属性");
boxFolder.add(cube.position, "x", 0, 10).name("x坐标").min(-5).max(5).step(0.1);
boxFolder.add(cube.position, "y", 0, 10).name("y坐标").min(-5).max(5).step(0.1);
boxFolder.add(cube.position, "z", 0, 10).name("z坐标").min(-5).max(5).step(0.1);
boxFolder.add(cube.rotation, "x", 0, 10).name("x旋转").min(-5).max(5).step(0.1);
boxFolder.add(cube.rotation, "y", 0, 10).name("y旋转").min(-5).max(5).step(0.1);
boxFolder.add(cube.rotation, "z", 0, 10).name("z旋转").min(-5).max(5).step(0.1);
boxFolder
  .addColor({ color: 0x00ff00 }, "color")
  .name("修改颜色")
  .onChange((e) => {
    cube.material.color = new THREE.Color(e);
  });

const params = {
  visible: true,
  moveAnimation: () => {
    gsap.to(cube.position, { x: 5, duration: 2 });
  },
  cameraAnimation: () => {
    gsap.to(camera.position, { z: -10, x: 0, y: 0, duration: 2 });
  },
};
boxFolder
  .add(params, "visible")
  .name("显示/隐藏")
  .onChange((e) => {
    cube.visible = e;
  });
boxFolder.add(params, "moveAnimation").name("移动动画");
boxFolder.open();

const cameraFolder = gui.addFolder("相机属性");
cameraFolder
  .add(camera.position, "x", 0, 10)
  .name("x坐标")
  .min(-30)
  .max(30)
  .step(0.1);
cameraFolder
  .add(camera.position, "y", 0, 10)
  .name("y坐标")
  .min(-30)
  .max(30)
  .step(0.1);
cameraFolder
  .add(camera.position, "z", 0, 10)
  .name("z坐标")
  .min(-30)
  .max(30)
  .step(0.1);
cameraFolder
  .add(camera.rotation, "x")
  .name("相机旋转x轴")
  .min(-5)
  .max(5)
  .step(0.1);
cameraFolder
  .add(camera.rotation, "y")
  .name("相机旋转y轴")
  .min(-5)
  .max(5)
  .step(0.1);
cameraFolder
  .add(camera.rotation, "z")
  .name("相机旋转z轴")
  .min(-5)
  .max(5)
  .step(0.1);
cameraFolder.add(params, "cameraAnimation").name("相机动画");
cameraFolder.open();

const render = () => {
  // cube.position.x += 0.01;
  // cube.rotation.x += 0.01;
  // if (cube.position.x > 5) {
  //   cube.position.x = 0;
  //   cube.rotation.x = 0;
  // }
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

onMounted(() => {
  if (container.value) {
    // 添加轨道控制器
    // controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.update();

    container.value.appendChild(renderer.domElement);
    render();

    let isMouseDown = false;
    container.value.addEventListener(
      "mousedown",
      () => {
        isMouseDown = true;
      },
      false
    );
    container.value.addEventListener(
      "mouseup",
      () => {
        isMouseDown = false;
      },
      false
    );
    container.value.addEventListener(
      "mouseout",
      () => {
        isMouseDown = false;
      },
      false
    );

    container.value.addEventListener(
      "mousemove",
      (e) => {
        if (!isMouseDown) return;
        camera.rotation.x += e.movementY * 0.01;
        camera.rotation.y += e.movementX * 0.01;
        camera.rotation.order = "YXZ";
      },
      false
    );
  }
});
</script>

<style scoped lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  width: 100%;
  height: 100%;
}
</style>
