<template>
  <div ref="container" class="container"></div>
  <!-- 信息点弹出层 -->
  <div class="tooltip-box" :style="tooltipPosition" ref="tooltipBox">
    <div class="wrapper">
      <div class="names">标题: {{ tooltipContent.name }}</div>
      <div class="explain">说明: {{ tooltipContent.description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import gsap from "gsap";
import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { onMounted, ref } from "vue";

const container = ref<HTMLElement | null>(null);
const tooltipBox = ref<HTMLElement | null>(null);
const tooltipPosition = ref({
  top: "-100%",
  left: "-100%",
});
const tooltipContent = ref<{ [key: string]: any }>({});

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

  // 定义阳台导航的canvas
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
  ctx.fillText("阳台", canvas.width / 2, canvas.height / 2);

  const balconySpriteTexture = new THREE.CanvasTexture(canvas);

  // 创建阳台导航
  const balconySpriteMaterial = new THREE.SpriteMaterial({
    map: balconySpriteTexture,
    transparent: true,
  });
  const balconySprite = new THREE.Sprite(balconySpriteMaterial);
  const balconySpritePosition = new THREE.Vector3(0, 0, -4);
  balconySprite.position.copy(balconySpritePosition);
  scene.add(balconySprite);

  const poiObjs: THREE.Sprite[] = [];
  poiObjs.push(balconySprite);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  window.addEventListener("click", (e: MouseEvent) => {
    e.preventDefault();
    // 将鼠标位置归一化为设备坐标，x 和 y 方向的取值范围是 [-1, 1]
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(pointer, camera);
    // 计算物体和射线的交点
    const intersects = raycaster.intersectObjects(poiObjs);
    if (intersects.length > 0) {
      // 有交叉点
      gsap.to(camera.position, {
        duration: 1,
        x: 0,
        y: 0,
        z: -10,
      });
    }
  });

  // 创建信息点
  const informationTexture = new THREE.TextureLoader().load("./images/dot.png");
  const infomationSpriteMaterial = new THREE.SpriteMaterial({
    map: informationTexture,
    transparent: true,
  });
  const infomationSprite = new THREE.Sprite(infomationSpriteMaterial);
  const infomationSpritePosition = new THREE.Vector3(1.5, -0.1, -3);
  infomationSprite.position.copy(infomationSpritePosition);
  infomationSprite.scale.set(0.2, 0.2, 0.2);
  infomationSprite.userData = {
    type: "information",
    name: "信息点",
    description: "这是一个信息点",
  };
  poiObjs.push(infomationSprite);
  scene.add(infomationSprite);

  return { cube, poiObjs };
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
const { cube, poiObjs } = useBox();
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

// 图形化控制界面
const gui = new dat.GUI();
const boxFolder = gui.addFolder("立方体属性");
boxFolder.add(cube.position, "x", 0, 10).name("x坐标").min(-5).max(5).step(0.1);
boxFolder.add(cube.position, "y", 0, 10).name("y坐标").min(-5).max(5).step(0.1);
boxFolder.add(cube.position, "z", 0, 10).name("z坐标").min(-5).max(5).step(0.1);
boxFolder.add(cube.rotation, "x", 0, 10).name("x旋转").min(-5).max(5).step(0.1);
boxFolder.add(cube.rotation, "y", 0, 10).name("y旋转").min(-5).max(5).step(0.1);
boxFolder.add(cube.rotation, "z", 0, 10).name("z旋转").min(-5).max(5).step(0.1);
// boxFolder
//   .addColor({ color: 0x00ff00 }, "color")
//   .name("修改颜色")
//   .onChange((e) => {
//     cube.material.color = new THREE.Color(e);
//   });

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
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

function tooltipShow(e: MouseEvent) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  // 将鼠标位置归一化为设备坐标，x 和 y 方向的取值范围是 [-1, 1]
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  // 通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(pointer, camera);
  // 计算物体和射线的交点
  const intersects = raycaster.intersectObjects(poiObjs);
  if (intersects.length > 0) {
    if (intersects[0].object.userData.type === "information") {
      // 需要设置弹出层的 left 和 top
      // 所以需要获取鼠标位置
      // 需要将三维空间中的坐标转换为二维屏幕坐标
      // Vector3 对象的 project 方法可以将三维坐标转换为 NDC 坐标
      // NDC 坐标是 [-1, 1] 范围内的坐标系
      // 所以需要将 NDC 坐标信息转换为屏幕坐标
      // 示例
      // const vector = new THREE.Vector3(10, 20, 30);
      // vector.project(camera);
      // 通过下方公式将 NDC 坐标转换为屏幕坐标
      // const x = (vector.x + 1) * (width(默认全屏canvas) / 2);
      // const y = -(vector.y - 1) * (height / 2);

      const element = e.target as HTMLElement;
      const elementWidth = element.clientWidth / 2;
      const elementHeight = element.clientHeight / 2;
      const worldVector = new THREE.Vector3(
        intersects[0].object.position.x,
        intersects[0].object.position.y,
        intersects[0].object.position.z
      );
      const position = worldVector.project(camera);
      let left = Math.round(
        elementWidth * position.x +
          elementWidth -
          tooltipBox.value!.clientWidth / 2
      );
      let top = Math.round(
        elementHeight * -position.y +
          elementHeight -
          tooltipBox.value!.clientHeight / 2
      );
      tooltipPosition.value = {
        left: `${left}px`,
        top: `${top}px`,
      };

      tooltipContent.value = intersects[0].object.userData;
    }
  } else {
    handleTooltipHide(e);
  }
}

function handleTooltipHide(e: MouseEvent) {
  e.preventDefault();
  tooltipPosition.value = {
    left: "-100%",
    top: "-100%",
  };
  tooltipContent.value = {
    name: "",
    description: "",
  };
}

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

    renderer.domElement.addEventListener("mousemove", tooltipShow);
    tooltipBox.value!.addEventListener("mouseleave", handleTooltipHide);
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

.tooltip-box {
  position: absolute;
  padding: 0px 0 40px 0;
  line-height: 30px;
  border-radius: 4px;
  color: #fff;
  z-index: 100;
  cursor: pointer;
  .wrapper {
    position: relative;
    width: 240px;
    max-height: 200px;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.6);
    .name {
      width: 100%;
      padding: 6px 0;
    }
    .description {
      width: 100%;
      max-height: 100px;
      font-size: 14px;
      overflow-y: auto;
    }
  }
}
</style>
