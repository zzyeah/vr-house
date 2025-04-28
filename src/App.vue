<template>
  <div class="container" ref="container"></div>
  <!-- 信息点弹出层 -->
  <div class="tooltip-box" :style="tooltipPosition" ref="tooltipBox">
    <div class="wrapper">
      <div class="names">标题: {{ tooltipContent.name }}</div>
      <div class="explain">说明: {{ tooltipContent.description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { onMounted, ref } from "vue";
import { Room } from "./utils/Room";
import { PositionSprite } from "./utils/PositionSprite";
import gsap from "gsap";
import { TooltipSprite } from "./utils/TooltipSprite";

// 初始化场景
const scene = new THREE.Scene();

// 创建相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const useInsertCamera = () => {
  // 将相机放入场景去
  // 0.01是因为使用了轨道
  camera.position.set(0, 0, 0.01);
};
// 创建渲染器
const container = ref<HTMLElement | null>(null);
const renderer = new THREE.WebGLRenderer();
// show tooltip
const tooltipBox = ref<HTMLElement | null>(null);
const tooltipPosition = ref({
  top: "-100%",
  left: "-100%",
});
const tooltipContent = ref<{ [key: string]: any }>({});

const render = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};
function tooltipShow(e: MouseEvent, spriteList: THREE.Sprite[]) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  // 将鼠标位置归一化为设备坐标，x 和 y 方向的取值范围是 [-1, 1]
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  // 通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(pointer, camera);
  // 计算物体和射线的交点
  const intersects = raycaster.intersectObjects(spriteList);
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

const spriteList: THREE.Sprite[] = [];

// 设置渲染器大小
renderer.setSize(window.innerWidth, window.innerHeight);

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
    new Room("客厅", "living", "./images/livingRoom/", scene);

    const balconyPosition = new THREE.Vector3(0, 0, -10);

    new Room("阳台", "balcony", "./images/balcony/", scene, balconyPosition);

    // 阳台位置标识
    const balconySprite = new PositionSprite(
      "阳台",
      new THREE.Vector3(0, 0, -4),
      scene,
      camera
    );
    balconySprite.onClick(() => {
      gsap.to(camera.position, {
        duration: 1,
        x: 0,
        y: 0,
        z: -10,
      });
    });

    // 回到客厅位置标识
    // 阳台位置标识
    const balconyBackSprite = new PositionSprite(
      "客厅",
      new THREE.Vector3(1, 0, -6),
      scene,
      camera
    );
    balconyBackSprite.onClick(() => {
      gsap.to(camera.position, {
        duration: 1,
        x: 0,
        y: 0,
        z: 0,
      });
    });

    const kitchenPosition = new THREE.Vector3(2, 0, 10);
    const kitchenEuler = new THREE.Euler(0, -Math.PI / 2, 0);
    new Room(
      "厨房",
      "kitchen",
      "./images/kitchen/",
      scene,
      kitchenPosition,
      kitchenEuler
    );
    const kitchenSprite = new PositionSprite(
      "厨房",
      new THREE.Vector3(1.5, 0, 4),
      scene,
      camera
    );
    const { x: kx, y: ky, z: kz } = kitchenPosition;
    kitchenSprite.onClick(() => {
      gsap.to(camera.position, {
        duration: 1,
        x: kx,
        y: ky,
        z: kz,
      });
    });
    const kitchenBackSprite = new PositionSprite(
      "客厅",
      new THREE.Vector3(1, 0, 6),
      scene,
      camera
    );
    kitchenBackSprite.onClick(() => {
      gsap.to(camera.position, {
        duration: 1,
        x: 0,
        y: 0,
        z: 0,
      });
    });

    const tooltipSprite1 = new TooltipSprite(
      "./images/dot.png",
      new THREE.Vector3(1.5, -0.1, -3),
      scene,
      camera,
      {
        name: "工艺画",
        description: "抽象工艺画",
        type: "information",
      }
    );

    const tooltipSprite2 = new TooltipSprite(
      "./images/dot.png",
      new THREE.Vector3(-2.5, -0.1, -3),
      scene,
      camera,
      {
        name: "木雕艺术品",
        description: "木雕艺术品",
        type: "information",
      }
    );
    const tooltipSprite3 = new TooltipSprite(
      "./images/dot.png",
      new THREE.Vector3(3, 1, 2),
      scene,
      camera,
      {
        name: "艺术画",
        description: "11 艺术画",
        type: "information",
      }
    );

    spriteList.push(tooltipSprite1.sprite);
    spriteList.push(tooltipSprite2.sprite);
    spriteList.push(tooltipSprite3.sprite);

    renderer.domElement.addEventListener("mousemove", (e) => {
      tooltipShow(e, spriteList);
    });
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
  width: 100vw;
  height: 100vh;
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
