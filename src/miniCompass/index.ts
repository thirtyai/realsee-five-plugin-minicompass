import { Five, FivePlugin, Pose } from '@realsee/five';
import * as THREE from 'three';
import { Color } from 'three';
import compass from './compass';

const styles = `
.resblockPanel-compass {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .resblockPanel-compass-north {
    position: absolute;
    width: 12px;
    height: 12px;
  }
  
  .resblockPanel-compass-txt {
    position: absolute;
    width: 12px;
    height: 12px;
    font-size: 10px;
    text-align: center;
    vertical-align: middle;
    font-family: PingFangSC-Semibold, PingFang SC;
    font-weight: 600;
    color: #ffffff;
    line-height: 12px;
    text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3);
  }
  `;

export interface InitColorArgs {
  northColor: Color | string | number;
  southColor: Color | string | number;
  lightColor: Color | string | number;
}

const defaultInitColorArgs: InitColorArgs = {
  northColor: 0xff4d4d,
  southColor: 0xffffff,
  lightColor: 0xdde3ff,
};

export interface MiniCompassPluginExportType {
  appendTo: (elementParent: HTMLElement, northRad: number, size?: { width: number; height: number }, colorArgs?: InitColorArgs) => void;
}

const MiniCompassPlugin: FivePlugin<void, MiniCompassPluginExportType> = (five: Five) => {
  let scene: THREE.Scene | undefined = undefined;
  let camera: THREE.PerspectiveCamera | undefined = undefined;
  let ambientLight: THREE.AmbientLight | undefined = undefined;
  let directionalLight: THREE.DirectionalLight | undefined = undefined;
  let campassMesh: THREE.Object3D | undefined = undefined;

  let { width, height } = { width: 0, height: 0 };
  let renderer: THREE.WebGLRenderer | undefined = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  const wrapper = document.createElement('div');
  wrapper.setAttribute('class', 'resblockPanel-compass');
  const element = document.createElement('div');
  const labelNorth = document.createElement('div');
  labelNorth.setAttribute('class', 'resblockPanel-compass-north');
  const labelSpanNorth = document.createElement('span');
  labelSpanNorth.setAttribute('class', 'resblockPanel-compass-txt');
  labelSpanNorth.innerText = '北';
  labelNorth.appendChild(labelSpanNorth);
  wrapper.appendChild(element);
  wrapper.appendChild(labelNorth);

  const initStyles = () => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);
  };

  const initRendererIfNeeds = () => {
    if (!five.renderer) return;
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(five.renderer.getPixelRatio());
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.setClearColor(0x181a1c, 0);
      renderer.autoClear = true;
    }
    return renderer;
  };

  const initSceneAndCamera = (colorArgs: InitColorArgs) => {
    if (scene) return;
    if (!directionalLight) directionalLight = new THREE.DirectionalLight(colorArgs.lightColor, 1);
    if (!scene) scene = new THREE.Scene();
    if (!ambientLight) ambientLight = new THREE.AmbientLight(colorArgs.lightColor, 1);
    if (!camera) camera = new THREE.PerspectiveCamera(20, 1, 0.1, 1000);
    if (!campassMesh) campassMesh = compass(colorArgs);
    directionalLight.position.copy(new THREE.Vector3(-1, 1, -1));
    scene.add(ambientLight);
    scene.add(directionalLight);
    scene.add(campassMesh);
    camera.position.y = 6.1;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  };

  const appendTo = (elementParent: HTMLElement, northRad: number, size?: { width: number; height: number }, colorArgs?: InitColorArgs) => {
    initSceneAndCamera(colorArgs ? colorArgs : defaultInitColorArgs);
    renderer = initRendererIfNeeds();
    if (!renderer) return;
    elementParent.append(wrapper);
    element.append(renderer.domElement);
    const _size = size ? size : elementParent.getBoundingClientRect();
    width = _size.width;
    height = _size.height;
    renderer.setSize(width, height);
    renderer.domElement.style.cssText = 'width:' + width / 2 + 'px; height:' + height / 2 + 'px';
    labelSpanNorth.setAttribute('sytle', `padding-left: ${width / 2 + 12}px;`);
    five.on('cameraUpdate', (pose: Pose, userAction: boolean) => cameraDirectionUpdate({ longitude: pose.longitude, northRad: northRad }));
  };

  const cameraDirectionUpdate = (obj: { longitude: number; northRad: number }) => {
    renderer = initRendererIfNeeds();
    if (!renderer) return;
    if (!campassMesh) return;
    if (!scene) return;
    if (!camera) return;

    const rotateY = -obj.longitude + obj.northRad;
    campassMesh.rotation.y = rotateY;
    campassMesh.rotation.x = 0;

    const rad2Deg = (rad: number) => (rad / Math.PI) * 180;
    const labelNorthRotation = rad2Deg(rotateY);
    labelNorth.setAttribute('style', `transform: rotate(${-labelNorthRotation}deg);padding-left: ${width / 2 + 12}px;`);
    labelSpanNorth.setAttribute('style', `transform: rotate(${labelNorthRotation}deg)`);
    renderer.render(scene, camera);
  };

  initStyles();
  return {
    appendTo,
  };
};

export default MiniCompassPlugin;
