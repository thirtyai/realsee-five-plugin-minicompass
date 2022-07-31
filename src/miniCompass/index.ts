import { Five, FivePlugin, Pose } from '@realsee/five';
import * as THREE from 'three';
import compass from './compass';
import styles from './style.module.scss';

export interface MiniCompassPluginExportType {
  appendTo: (elementParent: HTMLElement, northRad: number, size?: { width: number; height: number }) => void;
}

const MiniCompassPlugin: FivePlugin<void, MiniCompassPluginExportType> = (five: Five) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 1000);
  let { width, height } = { width: 0, height: 0 };
  let renderer: THREE.WebGLRenderer | undefined = new THREE.WebGLRenderer({ alpha: true, antialias: true });

  const ambientLight = new THREE.AmbientLight(0xdde3ff, 1);
  const directionalLight = new THREE.DirectionalLight(0xdde3ff, 1);
  directionalLight.position.copy(new THREE.Vector3(-1, 1, -1));

  scene.add(ambientLight);
  scene.add(directionalLight);
  const campassMesh = compass();
  scene.add(campassMesh);

  const wrapper = document.createElement('div');
  wrapper.setAttribute('class', styles['resblockPanel-compass']);
  const element = document.createElement('div');
  const labelNorth = document.createElement('div');
  labelNorth.setAttribute('class', styles['resblockPanel-compass-north']);
  const labelSpanNorth = document.createElement('span');
  labelSpanNorth.setAttribute('class', styles['resblockPanel-compass-txt']);
  labelSpanNorth.innerText = '北';
  labelNorth.appendChild(labelSpanNorth);
  wrapper.appendChild(element);
  wrapper.appendChild(labelNorth);
  camera.position.y = 6.1;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

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

  const appendTo = (elementParent: HTMLElement, northRad: number, size?: { width: number; height: number }) => {
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
    const rotateY = -obj.longitude + obj.northRad;

    campassMesh.rotation.y = rotateY;
    campassMesh.rotation.x = 0;

    const rad2Deg = (rad: number) => (rad / Math.PI) * 180;
    const labelNorthRotation = rad2Deg(rotateY);
    labelNorth.setAttribute('style', `transform: rotate(${-labelNorthRotation}deg);padding-left: ${width / 2 + 12}px;`);
    labelSpanNorth.setAttribute('style', `transform: rotate(${labelNorthRotation}deg)`);
    renderer.render(scene, camera);
  };

  return {
    appendTo,
  };
};

export default MiniCompassPlugin;
