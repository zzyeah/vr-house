<template>
  <div ref="container" class="container"></div>
</template>

<script setup lang="ts">
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

// 将相机放入场景去
// 0.01是因为使用了轨道
camera.position.set(0, 0, 0.01);
const useBox = () => {
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
};

const useSphere = () => {
  const geometry = new THREE.SphereGeometry(1, 50, 50);
  geometry.scale(1, 1, -1);
  const texture = new THREE.TextureLoader().load("./images/scene.jpeg");
  const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, sphereMaterial);
  scene.add(sphere);
};

// useBox();
useSphere();

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
const render = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

onMounted(() => {
  if (container.value) {
    // 添加轨道控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.update();

    container.value.appendChild(renderer.domElement);
    render();
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
