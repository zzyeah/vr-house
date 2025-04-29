
## 项目开发思路

### 1. 依赖库

- **gsap**：用于实现平滑动画效果。
- **dat.gui**：创建图形化控制界面，方便调试和调整参数。
- **three.js**：核心3D渲染库，用于构建场景、物体和相机。
- **OrbitControls**：提供轨道控制器功能，允许用户通过鼠标拖动旋转场景。

### 2. 定义模板结构
**HTML模板**

作为3D场景的容器，渲染器将绘制到该元素中。
```HTML
<div ref="container" class="container"></div>
```

用于显示信息点的 Tooltip，动态绑定位置和内容。从设计上仅只有一个信息点元素节点作为内容展示。

```HTML
<!-- 信息点弹出层 -->
<div class="tooltip-box" :style="tooltipPosition" ref="tooltipBox">
  <div class="wrapper">
    <div class="names">标题: {{ tooltipContent.name }}</div>
    <div class="explain">说明: {{ tooltipContent.description }}</div>
  </div>
</div>
```

### 3. 逻辑实现

#### 1. 基础设置

- 初始化场景与相机
  - 创建 `scene` 对象，作为3D场景的容器。
    ```ts
    // 初始化场景
    const scene = new THREE.Scene();
    ```
  - 使用 `PerspectiveCamera` 创建透视相机，并设置视场角、宽高比、近裁剪面和远裁剪面。
    ```ts
    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    ```
  - 设置相机初始位置（可选）。
    ```ts
    // 设置相机位置
    // camera.position.z = 30;

    const useInsertCamera = () => {
      // 将相机放入场景去
      // 0.01是因为使用了轨道
      camera.position.set(0, 0, 0.01);
    };
    ```
  -  在使用 `OrbitControls` 时，通常将相机位置设置为 `(0, 0, 0.01)`，因为 `OrbitControls` 需要一个非零的相机位置才能工作。
    ```ts
    // 添加轨道控制器
    onMounted(() => {
      // ...
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.update();
    })
    ```
    后续会将轨道控制器的相关逻辑删除，改为`直接使用HTML节点的事件监听进行相机角度的控制`
- 创建渲染器
  - 使用 `THREE.WebGLRenderer` 创建渲染器。
    ```ts
    const renderer = new THREE.WebGLRenderer();
    ```
  - 设置渲染器的尺寸，并绑定到容器元素上。
    ```ts
    // 设置渲染器大小
    renderer.setSize(window.innerWidth, window.innerHeight);
    onMounted(() => {
      // ...
      container.value.appendChild(renderer.domElement);
    })
    ```
  - 渲染器渲染。
    性能优化：
    使用 `requestAnimationFrame` 循环渲染，以实现平滑动画。
    优点：
    1. 性能优化
    2. 流畅的动画效果
    3. 简化开发
    4. 提高响应性
    ```ts
    const render = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(render); // 
    };
    onMounted(() => {
      // ...
      render();
    })
    ``` 
- 添加坐标辅助器
  - 使用 `AxesHelper` 添加坐标轴辅助器，便于调试场景。
    ```ts
    const axesHelper = new THREE.AxesHelper(20);
    scene.add(axesHelper);
    ```
#### 2. 功能模块
- 立方体与材质加载
  - 创建需要的立方体
    - 使用 `THREE.BoxGeometry` 创建一个边长为**10**的立方体。
    - 使用 `geometry.scale(1, 1, -1)` 返转立方体的贴纸方向。
  ```ts
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  geometry.scale(1, 1, -1); // 反转贴图
  ```
  - 加载纹理并创建材质
    - 定义一个数组 arr，包含房间的六个面的纹理文件名（前、后、上、下、左、右）。
    - 遍历数组，加载每个纹理文件并创建相应的 THREE.MeshBasicMaterial。
  ```ts
  const arr = [
    `${roomPrefix}_r`,
    `${roomPrefix}_l`,
    `${roomPrefix}_u`,
    `${roomPrefix}_d`,
    `${roomPrefix}_f`,
    `${roomPrefix}_b`,
  ];
  const boxMaterials: THREE.MeshBasicMaterial[] = [];

  arr.forEach((item) => {
    const texture = new THREE.TextureLoader().load(
      `${textureUrl}${item}.jpg`
    );
    boxMaterials.push(new THREE.MeshBasicMaterial({ map: texture }));
  });
  ```
  - 创建立方体网格模型
    - 使用 `THREE.Mesh` 创建立方体网格模型，传入几何体和材质数组。
    - 设置立方体的位置 `THREE.Vector3` 和旋转角度 `THREE.Euler`。
  ```ts
  const box = new THREE.Mesh(geometry, boxMaterials); // 创建网格模型
  box.position.copy(position); // 设置模型位置
  box.rotation.copy(euler); // 设置模型旋转角度
  ```
  - 将立方体网格模型添加到场景中。
  ```ts
  scene.add(box);
  ```
- 创建球体模型
  与立方体逻辑基本相同
  示例：
  ```ts
  const geometry = new THREE.SphereGeometry(1, 50, 50);
  geometry.scale(1, 1, -1);
  const texture = new THREE.TextureLoader().load("./images/scene.jpeg");
  const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, sphereMaterial);
  scene.add(sphere);
  ```
- 导航信息点 `THREE.Sprite` 与交互
  - 使用 `canvas` 创建 `THREE.Sprite`
  ```ts
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
  const texture = new THREE.CanvasTexture(canvas); // 创建纹理
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  }); // 创建材质

  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position); // 设置模型位置
  this.sprite = sprite;
  scene.add(sprite); // 添加到场景中
  ```
  - 信息点与操作交互
    - 创建 `THREE.Vector2` 对象 `pointer` 和 `THREE.Raycaster` 对象 `raycaster`。
    - 监听 `window` 的 `click` 事件。
    - 将鼠标位置归一化为设备坐标。
    - 使用 `raycaster` 检测鼠标点击是否与 `Sprite` 相交。
    - 如果相交，则调用所有注册的回调函数 `callbacks`。
  ```ts
  // ...
  callbacks: any[];
  constructor(){
    // ...
    let pointer = new THREE.Vector2();
    let raycaster = new THREE.Raycaster();
    window.addEventListener("click", (e: MouseEvent) => {
      // 将鼠标位置归一化为设备坐标，x 和 y 方向的取值范围是 [-1, 1]
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera); // 设置射线位置
      const intersects = raycaster.intersectObject(sprite); // 射线与模型相交检测
      if (intersects.length > 0) {
        this.callbacks.forEach((callback) => callback());
      }
    });
    // ...
  }
  onClick(callback: () => void) {
    this.callbacks.push(callback);
  }
  ```
- 提示信息点 `THREE.Sprite` 与交互
  - 使用图片创建`THREE.Sprite`
  ```ts
   const tooltipTexture = new THREE.TextureLoader().load(url); // 创建纹理
  const tooltipMaterial = new THREE.SpriteMaterial({
    map: tooltipTexture,
    transparent: true,
  }); // 创建材质

  const tooltipSprite = new THREE.Sprite(tooltipMaterial); // 使用 THREE.Sprite 创建 Sprite 对象，并将材质应用到 Sprite 上。
  tooltipSprite.position.copy(position); // 设置 Sprite 的位置为传入的 position。
  tooltipSprite.scale.set(0.2, 0.2, 0.2); // 设置 Sprite 的缩放比例为 0.2, 0.2, 0.2。
  tooltipSprite.userData = userData; // 将传入的 userData 关联到 Sprite 的 userData 属性。
  this.sprite = tooltipSprite;
  scene.add(this.sprite); // 添加到场景中
  ```
  - 提示信息点与操作交互
  ```ts
  function tooltipShow(e: MouseEvent, spriteList: THREE.Sprite[]) {
    const raycaster = new THREE.Raycaster(); // 创建 THREE.Raycaster 对象 raycaster，用于检测射线与场景中物体的交点。
    const pointer = new THREE.Vector2(); // 创建 THREE.Vector2 对象 pointer，用于存储归一化的鼠标位置。
    // 将鼠标位置归一化为设备坐标，x 和 y 方向的取值范围是 [-1, 1]
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera(pointer, camera);
    // 使用 raycaster.intersectObjects 方法，检测射线与 spriteList 中所有 Sprite 对象的交点。
    const intersects = raycaster.intersectObjects(spriteList);
    if (intersects.length > 0) {
      if (intersects[0].object.userData.type === "information") {
        // 需要设置弹出层的 left 和 top
        // 1. 获取鼠标位置
        // 2. 将三维空间中的坐标转换为二维屏幕坐标
        // Vector3 对象的 project 方法可以将三维坐标转换为 NDC 坐标
        // NDC 坐标是 [-1, 1] 范围内的坐标系
        // 所以需要将 NDC 坐标信息转换为屏幕坐标
        // 示例
        // const vector = new THREE.Vector3(10, 20, 30);
        // vector.project(camera);
        // 通过下方公式将 NDC 坐标转换为屏幕坐标
        // const x = (vector.x + 1) * (width(默认全屏canvas) / 2);
        // const y = (-vector.y + 1) * (height(默认全屏canvas) / 2);

        // y 轴的坐标需要取反，因为 y 轴是向下的，是以canvas的左上角作为原点，而 NDC 坐标是向上的，在canvas中间点为原点，所以 y 轴坐标需要取反。

        const element = e.target as HTMLElement;
        const elementWidth = element.clientWidth / 2;
        const elementHeight = element.clientHeight / 2;
        const worldVector = new THREE.Vector3(
          intersects[0].object.position.x,
          intersects[0].object.position.y,
          intersects[0].object.position.z
        );
        const position = worldVector.project(camera); // 使用 worldVector.project(camera) 将三维坐标转换为屏幕坐标。
        // NDC 坐标是 [-1, 1] 范围内的坐标，所以需要将 NDC 坐标 + 1，将范围转换为 [0, 2]
        // 然后再乘以 element 的宽度 / 2，将范围转换为屏幕坐标。
        // 然后再减去 tooltip 的宽 / 2，将 tooltip 左移，使交叉点在 tooltip 的中心。
        let left = Math.round(
          elementWidth * position.x +
            elementWidth -
            tooltipBox.value!.clientWidth / 2
        );
        // NDC 坐标是 [-1, 1] 范围内的坐标，但是由于y轴与现实的坐标系不同，所以需要将 NDC 坐标 * -1，将范围转换为 [1, -1]，然后需要将 NDC 坐标 + 1，将范围转换为 [2, 0]
        // 然后再乘以 element 的高度 / 2，将范围转换为屏幕坐标。
        // 然后再减去 tooltip 的高，将 tooltip 上移到交叉点的上方。
        let top = Math.round(
          elementHeight * -position.y +
            elementHeight -
            tooltipBox.value!.clientHeight
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
  ```

#### 3. 事件监听
- 窗口调整
  - 监听 resize 事件，动态更新相机投影矩阵和渲染器大小。
  ```ts
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
  ```
- 鼠标交互
  - 拖动旋转相机
    - 监听 mousedown、mouseup 和 mousemove 事件。
    - 根据鼠标移动距离调整相机的旋转角度。
    ```ts
    onMounted(() => {
      // ...
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
    })
    ```
  - Tooltip 显示/隐藏
    - 监听 mousemove 事件，检测鼠标是否悬停在信息点上。
    - 如果悬停，则计算 Tooltip 的屏幕位置并显示内容；否则隐藏 Tooltip。
    ```ts
    renderer.domElement.addEventListener("mousemove", tooltipShow);
    tooltipBox.value!.addEventListener("mouseleave", handleTooltipHide);
    ``` 
#### 4. 图形化控制界面
- 使用 dat.GUI 创建控制面板
  - 立方体属性
    - 调整立方体的位置（x、y、z）和旋转角度（x、y、z）。
    - 添加按钮控制立方体的可见性和移动动画。
  - 相机属性
    - 调整相机的位置和旋转角度。
    - 添加按钮控制相机动画。
  ```ts
  const gui = new dat.GUI();
  const boxFolder = gui.addFolder("立方体属性");
  boxFolder.add(cube.position, "x", 0, 10).name("x坐标").min(-5).max(5).step(0.1);
  boxFolder.add(cube.position, "y", 0, 10).name("y坐标").min(-5).max(5).step(0.1);
  boxFolder.add(cube.position, "z", 0, 10).name("z坐标").min(-5).max(5).step(0.1);
  boxFolder.add(cube.rotation, "x", 0, 10).name("x旋转").min(-5).max(5).step(0.1);
  boxFolder.add(cube.rotation, "y", 0, 10).name("y旋转").min(-5).max(5).step(0.1);
  boxFolder.add(cube.rotation, "z", 0, 10).name("z旋转").min(-5).max(5).step(0.1);

  const params = {
    visible: true,
    moveAnimation: () => {
      gsap.to(cube.position, { x: 5, duration: 2 });
    },
    cameraAnimation: () => {
      gsap.to(camera.position, { z: -10, x: 0, y: 0, duration: 2 });
    },
  };
  boxFolder.add(params, "visible").name("显示/隐藏").onChange((e) => {
    cube.visible = e;
  });
  boxFolder.add(params, "moveAnimation").name("移动动画");
  boxFolder.open();

  const cameraFolder = gui.addFolder("相机属性");
  cameraFolder.add(camera.position, "x", 0, 10).name("x坐标").min(-30).max(30).step(0.1);
  cameraFolder.add(camera.position, "y", 0, 10).name("y坐标").min(-30).max(30).step(0.1);
  cameraFolder.add(camera.position, "z", 0, 10).name("z坐标").min(-30).max(30).step(0.1);
  cameraFolder.add(camera.rotation, "x").name("相机旋转x轴").min(-5).max(5).step(0.1);
  cameraFolder.add(camera.rotation, "y").name("相机旋转y轴").min(-5).max(5).step(0.1);
  cameraFolder.add(camera.rotation, "z").name("相机旋转z轴").min(-5).max(5).step(0.1);
  cameraFolder.add(params, "cameraAnimation").name("相机动画");
  cameraFolder.open();
  ``` 
#### 5. 渲染循环
- 使用 requestAnimationFrame 实现持续渲染
  - 调用 renderer.render(scene, camera) 渲染场景。
  - 确保场景实时更新。
  ```ts
  const render = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  ```

### 4. 样式定义
- 使用 `<style scoped>` 定义组件专属样式
  - 设置容器占满整个页面。
  - 定义 Tooltip 的布局、背景色和字体样式。
### 5. 生命周期钩子
- 在 onMounted 钩子中：
  - 检查容器是否已挂载。
  - 添加渲染器到容器中。
  - 初始化鼠标交互事件（拖动旋转相机、Tooltip 显示/隐藏）。
  - 启动渲染循环。
