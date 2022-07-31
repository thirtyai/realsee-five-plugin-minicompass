import { ConeGeometry, MeshLambertMaterial, Mesh, Object3D } from 'three';

const compass = () => {
  const container = new Object3D();
  const geometry = new ConeGeometry(0.4, 1, 4);
  const material1 = new MeshLambertMaterial({ color: 0xff4d4d });
  const material2 = new MeshLambertMaterial({ color: 0xffffff });
  material1.reflectivity = 1;
  material2.reflectivity = 1;
  const mesh1 = new Mesh(geometry, material1);
  const mesh2 = new Mesh(geometry, material2);

  mesh1.rotation.z = -Math.PI / 2;
  mesh1.rotation.x = -Math.PI / 2;
  mesh1.position.x += 0.5;
  mesh2.rotation.z = Math.PI / 2;
  mesh2.rotation.x = -Math.PI / 2;
  mesh2.position.x -= 0.5;

  container.add(mesh1);
  container.add(mesh2);

  return container;
};

export default compass;
