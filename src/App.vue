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
camera.position.z = 30;

// 创建渲染器
const renderer = new THREE.WebGLRenderer();

// 设置渲染器大小
renderer.setSize(window.innerWidth, window.innerHeight);

// 创建几何体
const geometry = new THREE.BoxGeometry(10, 10, 10);

// 几何体材质
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// 创建网格模型
const cube = new THREE.Mesh(geometry, material);

// 将网格模型添加到场景中
scene.add(cube);

// 轨道控制器对象
let controls: OrbitControls;

// 添加坐标辅助器
const axesHelper = new THREE.AxesHelper(20);

// 将坐标辅助器添加到场景中
scene.add(axesHelper);

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
