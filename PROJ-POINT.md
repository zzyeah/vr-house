## 面试问题

### 项目优化做了什么？

#### 1. 使用 `requestAnimationFrame`

`requestAnimationFrame` 是现代浏览器提供的一种用于在浏览器重绘之前执行动画的 API。它在性能优化和用户体验方面具有显著的优势，但也存在一些局限性。以下是 `requestAnimationFrame` 的优点和缺点：

##### **优点**
1. 性能优化
  - **自动同步刷新率**：`requestAnimationFrame` 会根据显示器的刷新率（通常是60Hz）自动调整调用频率，确保动画流畅且不会过度渲染。
  - **节省资源**：当页面不可见（如标签页切换或最小化）时，`requestAnimationFrame` 会自动暂停，避免不必要的计算和资源消耗。

2. 流畅的动画效果
  - **平滑过渡**：通过与浏览器的重绘机制同步，`requestAnimationFrame` 可以确保动画的每一帧都与屏幕刷新同步，减少视觉抖动和卡顿。
  - **一致的帧率**：即使在复杂动画中，`requestAnimationFrame` 也能保持稳定的帧率，提升用户体验。
3. 简化开发
  - **简洁的回调机制**：使用 `requestAnimationFrame` 只需要一个简单的回调函数，避免了手动管理定时器（如 setInterval 或 setTimeout）的复杂性。
  - **更好的兼容性**：现代浏览器普遍支持 `requestAnimationFrame`，且有良好的兼容性。
4. 提高响应性
  - **减少阻塞**：由于 `requestAnimationFrame` 在浏览器重绘之前执行，可以减少 JavaScript 执行对渲染线程的影响，提高页面的响应速度。
##### **缺点**
1. 依赖浏览器刷新率
  - **固定帧率**：`requestAnimationFrame` 的调用频率受限于显示器的刷新率，通常为60Hz（每秒60帧）。在低刷新率的设备上，动画效果可能不如预期流畅。
  - **无法控制帧率**：开发者无法直接设置帧率，只能依赖浏览器的刷新率，这在某些高性能需求的应用中可能不够灵活。

2. 调试困难
  - **异步执行**：`requestAnimationFrame` 的回调函数是异步执行的，这可能导致调试时难以追踪动画状态和性能瓶颈。
  - **缺少精确控制**：由于其依赖于浏览器的刷新机制，开发者无法精确控制每一帧的执行时间，这在需要高精度动画的应用中可能是一个限制。

3. 兼容性问题
  - **旧版浏览器支持**：虽然现代浏览器普遍支持 `requestAnimationFrame`，但在一些旧版浏览器中可能存在兼容性问题，需要使用 polyfill 或降级方案。
  - **移动设备限制**：在某些移动设备上，`requestAnimationFrame` 的表现可能不如桌面设备稳定，尤其是在资源紧张的情况下。

4. 无法暂停和恢复
  - **自动暂停**：虽然 `requestAnimationFrame` 在页面不可见时会自动暂停，但在某些情况下（如需要手动控制动画的暂停和恢复），开发者需要额外的逻辑来实现这些功能。
##### **总结**
  `requestAnimationFrame` 是实现高性能动画的理想选择，特别是在需要与浏览器重绘机制同步的应用中。它提供了自动优化、流畅效果和简化开发的优势，但在依赖浏览器刷新率和调试方面存在一定的局限性。开发者在使用时需要根据具体需求权衡这些优缺点，以实现最佳的动画效果和用户体验。

#### 2. 使用 GSAP
GSAP（GreenSock Animation Platform）是一个开源的 JavaScript 库，用于创建和控制动画效果。它提供了一套完整的动画库，可以轻松地创建和控制各种动画效果，如淡入淡出、缩放、旋转、移动等。
##### 主要阐述点
应为优化动画效果
1. **动画库**：GSAP 提供了一个完整的动画库，可以轻松地创建和控制各种动画效果，如淡入淡出、缩放、旋转、移动等。
2. **性能优化**：GSAP 使用了优化的算法和数据结构，以减少动画的计算量，提高动画的流畅度。
3. **兼容性**：GSAP 兼容 virtually all modern browsers，包括 IE9+。
4. **扩展性**：GSAP 提供了扩展功能，如缓动函数、事件处理和动画组等，可以满足各种动画需求。
5. **社区支持**：GSAP 有一个活跃的社区，提供了许多示例和教程，可以快速入门和了解 GSAP 的功能。

### 项目难点
#### 1. 鼠标交互事件
##### 拖动旋转相机：使用鼠标拖动相机来旋转场景。
  1. 创建页面容器的事件监听器
  2. 首先需要判断鼠标是否被按下，然后修改鼠标是否被按下的状态 `isMouseDown`
  3. 然后在监听 `mousemove` 事件，当 `isMouseDown === true`，则根据鼠标事件返回的 `movementX` 和 `movementY` 修改相机的旋转角度 `camera.rotation[.x|.y]`。
  4. 指定旋转顺序，影响最终的旋转结果。
  ```ts
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
  ```
  
##### 信息点的鼠标交互
  ```ts
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  // 将鼠标位置归一化为设备坐标，x 和 y 方向的取值范围是 [-1, 1]
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  // 通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(pointer, camera);
  // 计算物体和射线的交点
  const intersects = raycaster.intersectObjects(spriteList);
  ```
  1. 创建 Raycaster 对象
     `const raycaster = new THREE.Raycaster();`
     - 创建一个 THREE.Raycaster 对象，用于检测从相机到鼠标位置的射线与场景中物体的交点。
     - Raycaster 是 Three.js 中用于进行射线投射检测的重要工具。
  2. 创建 Pointer 对象
     `const pointer = new THREE.Vector2();`
     - 创建一个 THREE.Vector2 对象 pointer，用于存储归一化的鼠标位置。
     - Vector2 对象包含两个分量 x 和 y，分别表示鼠标在屏幕上的水平和垂直位置。
  3. 归一化鼠标位置
     `pointer.x = (e.clientX / window.innerWidth) * 2 - 1;`
     - e.clientX：鼠标在视口中的水平位置（像素值）。
        - window.innerWidth：视口的宽度（像素值）。
        - 将 e.clientX 归一化到 [-1, 1] 范围内：
          - e.clientX / window.innerWidth：将水平位置归一化到 [0, 1] 范围。
          - `* 2`：将范围扩展到 [0, 2]。
          - `- 1`：将范围转换到 [-1, 1]。
     `pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;`：
     - e.clientY：鼠标在视口中的垂直位置（像素值）。
     - window.innerHeight：视口的高度（像素值）。
     - 将 e.clientY 归一化到 [-1, 1] 范围内：
       - e.clientY / window.innerHeight：将垂直位置归一化到 [0, 1] 范围。
       - `* 2`：将范围扩展到 [0, 2]。
       - `- 1`：将范围转换到 [-1, 1]。
       - `-`：由于屏幕坐标系的 y 轴方向与 Three.js 中的 y 轴方向相反，因此需要取反。
  4. 设置 Raycaster 的射线
     `raycaster.setFromCamera(pointer, camera);`：
     - 使用 setFromCamera 方法，根据相机和归一化的鼠标位置 pointer 设置射线。
     - setFromCamera 方法会将 pointer 从屏幕坐标系转换为三维空间中的射线方向，并设置射线的原点为相机的位置。
  5. 计算射线与物体的交点
     `const intersects = raycaster.intersectObjects(spriteList);`：
     - 使用 intersectObjects 方法，检测射线与 spriteList 中所有 Sprite 对象的交点。
     - spriteList 是一个包含所有 Tooltip Sprite 对象的数组。
     - intersects 是一个数组，包含所有与射线相交的物体信息。
     - 每个交点对象包含以下属性：
       - object：相交的物体（Sprite 对象）。
       - point：交点在三维空间中的位置。
       - distance：从相机到交点的距离。
       - face：相交的面（对于几何体）。
       - faceIndex：相交的面索引（对于几何体）。
       - uv：相交点的 UV 坐标（对于几何体）。
       - instanceId：实例 ID（对于实例化几何体）。

##### 导航信息点点击：当点击导航信息点时，切换到对应的场景。
  1. 使用`canvas`生成按钮，并生成纹理 `texture`
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
  const texture = new THREE.CanvasTexture(canvas);
  ```
  2. 生成材质 `material`
  ```ts
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  ```
  3. 创建 `Sprite` 对象，并设置其材质为 `material`、位置为 `position`，然后添加到场景 `scene` 中。
  ```ts
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  this.sprite = sprite; // 保存引用
  scene.add(sprite);
  ```
  4. 使用 `window` 的事件监听器，监听鼠标点击事件，当鼠标被按下并且位置在信息点的交叉点时，会触发存储的点击事件。
  ```ts
  window.addEventListener("click", (e: MouseEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(sprite);
    if (intersects.length > 0) {
      this.callbacks.forEach((callback) => callback());
    }
  });
  ```


##### Tooltip 显示/隐藏：当鼠标进入或离开某个物体时，显示或隐藏对应的 Tooltip。
  1. 从 `intersects` 中获取当前选中的物体存储的 `object` 里面的 `userData` 的数据进行匹配
  2. 匹配成功后，将匹配项对应的 `position` 赋值给 `THREE.Vector3`，生成世界坐标 `worldVector`
  3. 然后将世界坐标转换成 NDC 坐标，再转换成屏幕坐标
  4. 最终计算出 `Tooltip` 的位置，并设置 `Tooltip` 的位置。
  ```ts
  if (intersects[0].object.userData.type === "information") {
    // 需要设置弹出层的 left 和 top
    // 所以需要获取鼠标位置
    // 需要将三维空间中的坐标转换为二维屏幕坐标
    // Vector3 对象的 project 方法可以将三维坐标转换为 NDC 坐标
    // NDC 坐标是 [-1, 1] 范围内的坐标系
    // 通过下方公式将 NDC 坐标转换为屏幕坐标
    // const x = (vector.x + 1) * (width(默认全屏canvas) / 2);
    // const y = (-vector.y + 1) * (height(默认全屏canvas) / 2);
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
        tooltipBox.value!.clientHeight
    );
    tooltipPosition.value = {
      left: `${left}px`,
      top: `${top}px`,
    };
    tooltipContent.value = intersects[0].object.userData;
  }
  ``` 

#### 2. 渲染优化

##### 持续更新和渲染场景
- 由于需要持续更新，那么就需要设置一个定时器进行渲染场景。
  - 在 `mounted` 中设置一个定时器，每隔 16ms 渲染一次场景。并且在 `beforeUnmount` 中清除定时器。
  - 使用 `requestAnimationFrame` 进行渲染。
  - 最后使用了 `requestAnimationFrame` 进行渲染。
  ```ts
  const render = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  onMounted(() => {
    // ....
    container.value.appendChild(renderer.domElement);
    render();
  })
  ```