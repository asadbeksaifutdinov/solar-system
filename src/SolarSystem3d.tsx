import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Moon = {
  mesh: THREE.Group;
  distance: number;
  angle: number;
};

type PlanetInstance = {
  orbitGroup: THREE.Group;
  rotationGroup: THREE.Group;
  planet: THREE.Mesh;
  data: any;
  angle: number;
  moons: Moon[];
};

const SolarSystem: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetsRef = useRef<PlanetInstance[]>([]);
  const sunRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number | null>(null); 
  const controlsRef = useRef<{ 
    isDragging: boolean; 
    previousX: number; 
    previousY: number; 
    rotationX: number; 
    rotationY: number;
    dragStartX: number;
    dragStartY: number;
  }>({
    isDragging: false,
    previousX: 0,
    previousY: 0,
    rotationX: 0,
    rotationY: 0,
    dragStartX: 0,
    dragStartY: 0,
  });
  const selectedPlanetRef = useRef<number | null>(null);
  const speedRef = useRef<number>(1);

  const planetData = [
    { 
      name: 'Меркурий', 
      size: 0.4, 
      distance: 8, 
      color: 0x8c7853, 
      speed: 4.74, 
      rotSpeed: 0.004, 
      moons: [],
      info: {
        diameter: '4,879 км',
        distance_from_sun: '57.9 млн км',
        day: '58.6 земных суток',
        year: '88 земных суток',
        temperature: 'От -173°C до 427°C',
        description: 'Самая близкая к Солнцу планета. Поверхность покрыта кратерами, похожими на Луну. Не имеет атмосферы и спутников.'
      }
    },
    { 
      name: 'Венера', 
      size: 0.9, 
      distance: 11, 
      color: 0xffc649, 
      speed: 3.50, 
      rotSpeed: 0.002, 
      moons: [],
      info: {
        diameter: '12,104 км',
        distance_from_sun: '108.2 млн км',
        day: '243 земных суток',
        year: '225 земных суток',
        temperature: '462°C',
        description: 'Самая горячая планета с плотной атмосферой из CO₂. Атмосферное давление в 92 раза больше земного. Вращается в обратную сторону.'
      }
    },
    { 
      name: 'Земля', 
      size: 1, 
      distance: 15, 
      color: 0x2233ff, 
      speed: 2.98, 
      rotSpeed: 0.02, 
      moons: [{ size: 0.27, distance: 2 }],
      info: {
        diameter: '12,742 км',
        distance_from_sun: '149.6 млн км',
        day: '24 часа',
        year: '365.25 дней',
        temperature: 'От -89°C до 58°C',
        description: 'Наш дом. Единственная известная планета с жизнью. 71% поверхности покрыто водой. Имеет один естественный спутник - Луну.'
      }
    },
    { 
      name: 'Марс', 
      size: 0.5, 
      distance: 19, 
      color: 0xff6347, 
      speed: 2.41, 
      rotSpeed: 0.018, 
      moons: [{ size: 0.15, distance: 1.5 }, { size: 0.1, distance: 2 }],
      info: {
        diameter: '6,779 км',
        distance_from_sun: '227.9 млн км',
        day: '24.6 часов',
        year: '687 земных суток',
        temperature: 'От -153°C до 20°C',
        description: 'Красная планета из-за оксида железа на поверхности. Имеет самый большой вулкан - Олимп (27 км высотой). Два спутника: Фобос и Деймос.'
      }
    },
    { 
      name: 'Юпитер', 
      size: 2.5, 
      distance: 28, 
      color: 0xffa500, 
      speed: 1.31, 
      rotSpeed: 0.04, 
      moons: [{ size: 0.3, distance: 4 }, { size: 0.25, distance: 5 }, { size: 0.28, distance: 6 }, { size: 0.32, distance: 7 }],
      info: {
        diameter: '139,820 км',
        distance_from_sun: '778.5 млн км',
        day: '9.9 часов',
        year: '11.86 земных лет',
        temperature: '-108°C',
        description: 'Крупнейшая планета Солнечной системы. Газовый гигант с Большим Красным Пятном - штормом размером больше Земли. Имеет 95 спутников, включая Ганимед - крупнейший в системе.'
      }
    },
    { 
      name: 'Сатурн', 
      size: 2.2, 
      distance: 38, 
      color: 0xf4a460, 
      speed: 0.97, 
      rotSpeed: 0.038, 
      hasRings: true, 
      moons: [{ size: 0.35, distance: 5 }],
      info: {
        diameter: '116,460 км',
        distance_from_sun: '1.43 млрд км',
        day: '10.7 часов',
        year: '29.46 земных лет',
        temperature: '-139°C',
        description: 'Известен величественными кольцами из льда и камней шириной 282,000 км. Плотность меньше воды - мог бы плавать в океане. Имеет 146 спутников.'
      }
    },
    { 
      name: 'Уран', 
      size: 1.5, 
      distance: 48, 
      color: 0x4fd0e0, 
      speed: 0.68, 
      rotSpeed: 0.03, 
      moons: [{ size: 0.2, distance: 3 }],
      info: {
        diameter: '50,724 км',
        distance_from_sun: '2.87 млрд км',
        day: '17.2 часов',
        year: '84 земных года',
        temperature: '-197°C',
        description: 'Ледяной гигант с уникальным наклоном оси 98°. Вращается практически «лёжа на боку». Имеет тонкие кольца и 27 спутников.'
      }
    },
    { 
      name: 'Нептун', 
      size: 1.4, 
      distance: 58, 
      color: 0x4169e1, 
      speed: 0.54, 
      rotSpeed: 0.032, 
      moons: [{ size: 0.22, distance: 3.5 }],
      info: {
        diameter: '49,244 км',
        distance_from_sun: '4.5 млрд км',
        day: '16.1 часов',
        year: '164.8 земных лет',
        temperature: '-201°C',
        description: 'Самая дальняя планета системы. Самые сильные ветра до 2,100 км/ч. Синий цвет от метана в атмосфере. Имеет 16 спутников, крупнейший - Тритон.'
      }
    }
  ];

  useEffect(() => {
    selectedPlanetRef.current = selectedPlanet;
  }, [selectedPlanet]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 40);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Звездный фон
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // Солнце с свечением
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunTexture = createSunTexture();
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    sunRef.current = sun;

    // Свечение солнца
    const glowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0xffaa00) }, coefficient: { value: 0.5 } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float coefficient;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(coefficient - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(sunGlow);

    // Освещение
    const sunLight = new THREE.PointLight(0xffffff, 2, 200);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    // Создание планет
    const planets: PlanetInstance[] = [];
    const planetTextures: { [key: string]: THREE.CanvasTexture } = {};
    
    // Предварительное создание текстур
    planetData.forEach((data) => {
      planetTextures[data.name] = createPlanetTexture(data.color, data.name);
    });

    planetData.forEach((data) => {
      // Орбита
      const orbitGeometry = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      // Группа планеты (для позиционирования на орбите)
      const planetOrbitGroup = new THREE.Group();
      scene.add(planetOrbitGroup);

      // Группа вращения планеты (для собственного вращения и спутников)
      const planetRotationGroup = new THREE.Group();
      planetOrbitGroup.add(planetRotationGroup);

      const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
      const planetMaterial = new THREE.MeshPhongMaterial({ map: planetTextures[data.name], shininess: 5 });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      
      planetRotationGroup.add(planet);

      // Кольца для Сатурна
      if (data.hasRings) {
        const ringGeometry = new THREE.RingGeometry(data.size * 1.5, data.size * 2.5, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xc9a66b, 
          side: THREE.DoubleSide, 
          transparent: true, 
          opacity: 0.7 
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planetRotationGroup.add(ring);
      }

      // Спутники
      const moons: Moon[] = [];
      data.moons.forEach(moonData => {
        const moonGeometry = new THREE.SphereGeometry(moonData.size, 16, 16);
        const moonMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const moon = new THREE.Mesh(moonGeometry, moonMaterial);
        moon.position.x = moonData.distance;
        const moonGroup = new THREE.Group();
        moonGroup.add(moon);
        moonGroup.visible = false;
        planetRotationGroup.add(moonGroup);
        moons.push({ mesh: moonGroup, distance: moonData.distance, angle: Math.random() * Math.PI * 2 });
      });

      // Текст с названием
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = 512;
        canvas.height = 128;
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.font = 'Bold 48px Arial';
        context.textAlign = 'center';
        context.fillText(data.name, 256, 80);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.y = data.size + 1;
        sprite.scale.set(4, 1, 1);
        planetRotationGroup.add(sprite);
      }

      // Начальная позиция на орбите
      const initialAngle = Math.random() * Math.PI * 2;
      planetOrbitGroup.position.x = Math.cos(initialAngle) * data.distance;
      planetOrbitGroup.position.z = Math.sin(initialAngle) * data.distance;
      
      planets.push({
        orbitGroup: planetOrbitGroup,
        rotationGroup: planetRotationGroup,
        planet: planet,
        data: data,
        angle: initialAngle,
        moons: moons
      });
    });

    planetsRef.current = planets;

    // Управление камерой
    const controls = controlsRef.current;
    let targetCameraPos = new THREE.Vector3(0, 30, 40);
    let targetLookAt = new THREE.Vector3(0, 0, 0);
    let currentCameraPos = new THREE.Vector3(0, 30, 40);
    let currentLookAt = new THREE.Vector3(0, 0, 0);

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in event ? event.touches[0]?.clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0]?.clientY : event.clientY;
      
      controls.isDragging = true;
      controls.previousX = clientX || 0;
      controls.previousY = clientY || 0;
      controls.dragStartX = clientX || 0;
      controls.dragStartY = clientY || 0;
    };

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      if (!controls.isDragging) return;
      
      const clientX = 'touches' in event ? event.touches[0]?.clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0]?.clientY : event.clientY;
      
      if (clientX === undefined || clientY === undefined) return;
      
      const deltaX = clientX - controls.previousX;
      const deltaY = clientY - controls.previousY;
      
      controls.rotationY -= deltaX * 0.005;
      controls.rotationX -= deltaY * 0.005;
      
      controls.rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, controls.rotationX));
      
      controls.previousX = clientX;
      controls.previousY = clientY;
    };

    const onPointerUp = () => {
      controls.isDragging = false;
    };

    const onClick = (event: MouseEvent | TouchEvent) => {
      // Проверка что это был клик, а не перетаскивание
      const clientX = 'changedTouches' in event ? event.changedTouches[0]?.clientX : 'clientX' in event ? event.clientX : 0;
      const clientY = 'changedTouches' in event ? event.changedTouches[0]?.clientY : 'clientY' in event ? event.clientY : 0;
      
      const dragDistance = Math.sqrt(
        Math.pow(clientX - controls.dragStartX, 2) + 
        Math.pow(clientY - controls.dragStartY, 2)
      );
      
      if (dragDistance > 5) return; // Это было перетаскивание, не клик

      const mouse = new THREE.Vector2(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Проверка клика по солнцу
      if (sunRef.current) {
        const sunIntersects = raycaster.intersectObject(sunRef.current);
        if (sunIntersects.length > 0) {
          setSelectedPlanet(-1);
          controls.rotationX = 0;
          controls.rotationY = 0;
          return;
        }
      }

      const intersects = raycaster.intersectObjects(planets.map(p => p.planet));
      if (intersects.length > 0) {
        const selectedIndex = planets.findIndex(p => p.planet === intersects[0].object);
        if (selectedIndex !== -1) {
          setSelectedPlanet(selectedIndex);
          controls.rotationX = 0;
          controls.rotationY = 0;
        }
      }
    };

    renderer.domElement.addEventListener('mousedown', onPointerDown as any);
    renderer.domElement.addEventListener('mousemove', onPointerMove as any);
    renderer.domElement.addEventListener('mouseup', onPointerUp);
    renderer.domElement.addEventListener('touchstart', onPointerDown as any);
    renderer.domElement.addEventListener('touchmove', onPointerMove as any);
    renderer.domElement.addEventListener('touchend', onPointerUp);
    renderer.domElement.addEventListener('click', onClick as any);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (sunRef.current) {
        sunRef.current.rotation.y += 0.001;
      }

      const currentSelectedPlanet = selectedPlanetRef.current;
      const currentSpeed = speedRef.current;

      planets.forEach((p, index) => {
        // Собственное вращение планеты
        p.planet.rotation.y += p.data.rotSpeed;
        
        if (currentSelectedPlanet === null) {
          // Движение по орбите
          p.angle += (0.001 * p.data.speed * currentSpeed);
          p.orbitGroup.position.x = Math.cos(p.angle) * p.data.distance;
          p.orbitGroup.position.z = Math.sin(p.angle) * p.data.distance;
        } else if (currentSelectedPlanet === index) {
          // Спутники
          p.moons.forEach(moon => {
            moon.angle += 0.02;
            const moonMesh = moon.mesh.children[0];
            if (moonMesh) {
              moonMesh.position.x = Math.cos(moon.angle) * moon.distance;
              moonMesh.position.z = Math.sin(moon.angle) * moon.distance;
            }
          });
        }
      });

      // Плавное движение камеры
      if (currentSelectedPlanet === -1) {
        // Солнце выбрано
        const distance = 10;
        
        targetCameraPos.set(
          Math.sin(controls.rotationY) * distance * Math.cos(controls.rotationX),
          Math.sin(controls.rotationX) * distance,
          Math.cos(controls.rotationY) * distance * Math.cos(controls.rotationX)
        );
        
        targetLookAt.set(0, 0, 0);
      } else if (currentSelectedPlanet !== null) {
        const p = planets[currentSelectedPlanet];
        const distance = p.data.size * 3.5;
        
        // Камера вращается вокруг планеты
        const radius = distance;
        targetCameraPos.set(
          p.orbitGroup.position.x + Math.sin(controls.rotationY) * radius * Math.cos(controls.rotationX),
          p.orbitGroup.position.y + Math.sin(controls.rotationX) * radius,
          p.orbitGroup.position.z + Math.cos(controls.rotationY) * radius * Math.cos(controls.rotationX)
        );
        
        targetLookAt.copy(p.orbitGroup.position);
      } else {
        // Вращение камеры в общем виде
        const radius = 50;
        targetCameraPos.set(
          Math.sin(controls.rotationY) * radius * Math.cos(controls.rotationX),
          30 + Math.sin(controls.rotationX) * 20,
          Math.cos(controls.rotationY) * radius * Math.cos(controls.rotationX)
        );
        targetLookAt.set(0, 0, 0);
      }

      currentCameraPos.lerp(targetCameraPos, 0.08);
      currentLookAt.lerp(targetLookAt, 0.08);
      
      camera.position.copy(currentCameraPos);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onPointerDown as any);
      renderer.domElement.removeEventListener('mousemove', onPointerMove as any);
      renderer.domElement.removeEventListener('mouseup', onPointerUp);
      renderer.domElement.removeEventListener('touchstart', onPointerDown as any);
      renderer.domElement.removeEventListener('touchmove', onPointerMove as any);
      renderer.domElement.removeEventListener('touchend', onPointerUp);
      renderer.domElement.removeEventListener('click', onClick as any);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (planetsRef.current.length > 0) {
      planetsRef.current.forEach((p, index) => {
        if (selectedPlanet === index) {
          p.moons.forEach(moon => moon.mesh.visible = true);
        } else {
          p.moons.forEach(moon => moon.mesh.visible = false);
        }
      });
    }
  }, [selectedPlanet]);

  const createSunTexture = () => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    if (!context) return new THREE.CanvasTexture(canvas);
    
    const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, '#ffff00');
    gradient.addColorStop(0.5, '#ffaa00');
    gradient.addColorStop(1, '#ff6600');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    
    for (let i = 0; i < 50; i++) {
      context.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${Math.random() * 0.3})`;
      context.fillRect(Math.random() * size, Math.random() * size, Math.random() * 50, Math.random() * 50);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  const createPlanetTexture = (color: number, name: string) => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    if (!context) return new THREE.CanvasTexture(canvas);
    
    const c = new THREE.Color(color);
    const baseColor = `rgb(${c.r * 255}, ${c.g * 255}, ${c.b * 255})`;
    const darkColor = `rgb(${c.r * 180}, ${c.g * 180}, ${c.b * 180})`;
    
    // Базовый градиент с повтором для бесшовности
    for (let y = 0; y < size; y++) {
      const gradient = context.createLinearGradient(0, y, size, y);
      const brightness = 0.7 + Math.sin(y / size * Math.PI) * 0.3;
      gradient.addColorStop(0, `rgb(${c.r * 255 * brightness}, ${c.g * 255 * brightness}, ${c.b * 255 * brightness})`);
      gradient.addColorStop(0.5, baseColor);
      gradient.addColorStop(1, `rgb(${c.r * 255 * brightness}, ${c.g * 255 * brightness}, ${c.b * 255 * brightness})`);
      context.fillStyle = gradient;
      context.fillRect(0, y, size, 1);
    }
    
    // Добавление деталей в зависимости от планеты
    if (name === 'Земля') {
      context.fillStyle = '#2a5f1f';
      for (let i = 0; i < 30; i++) {
        context.beginPath();
        context.arc(Math.random() * size, Math.random() * size, Math.random() * 100, 0, Math.PI * 2);
        context.fill();
      }
      context.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 15; i++) {
        context.beginPath();
        context.arc(Math.random() * size, Math.random() * size, Math.random() * 40, 0, Math.PI * 2);
        context.fill();
      }
    } else if (name === 'Юпитер') {
      for (let i = 0; i < size; i += 30) {
        context.fillStyle = i % 60 === 0 ? 'rgba(200, 150, 100, 0.3)' : 'rgba(255, 180, 120, 0.3)';
        context.fillRect(0, i, size, 30);
      }
      context.fillStyle = 'rgba(255, 100, 100, 0.6)';
      context.beginPath();
      context.ellipse(size * 0.6, size * 0.4, 80, 50, 0, 0, Math.PI * 2);
      context.fill();
    } else if (name === 'Сатурн') {
      for (let i = 0; i < size; i += 25) {
        context.fillStyle = i % 50 === 0 ? 'rgba(220, 180, 140, 0.3)' : 'rgba(255, 200, 150, 0.3)';
        context.fillRect(0, i, size, 25);
      }
    }
    
    // Кратеры для каменистых планет
    if (['Меркурий', 'Марс', 'Венера'].includes(name)) {
      context.fillStyle = darkColor;
      for (let i = 0; i < 40; i++) {
        context.beginPath();
        context.arc(Math.random() * size, Math.random() * size, Math.random() * 30, 0, Math.PI * 2);
        context.fill();
      }
    }
    
    // Полярные шапки для Марса
    if (name === 'Марс') {
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.beginPath();
      context.arc(size / 2, 50, 60, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(size / 2, size - 50, 70, 0, Math.PI * 2);
      context.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div ref={mountRef} className="w-full h-full absolute top-0 left-0" style={{ zIndex: 0 }} />
      
      {/* Бургер меню */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="absolute top-4 right-4 w-12 h-12 flex flex-col items-center justify-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors pointer-events-auto"
        style={{ zIndex: 50 }}
      >
        <div className="w-6 h-0.5 bg-white transition-transform" style={{ transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
        <div className="w-6 h-0.5 bg-white transition-opacity" style={{ opacity: menuOpen ? 0 : 1 }} />
        <div className="w-6 h-0.5 bg-white transition-transform" style={{ transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
      </button>

      {/* Меню */}
      {menuOpen && (
        <div className="absolute top-20 right-4 bg-black/90 backdrop-blur-md rounded-lg p-6 text-white min-w-[250px] shadow-2xl pointer-events-auto" style={{ zIndex: 40 }}>
          <h3 className="text-xl font-bold mb-4">Настройки</h3>
          <div className="mb-6">
            <label className="block mb-2">Скорость: {speed.toFixed(1)}x</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="border-t border-white/20 pt-4">
            <h4 className="font-bold mb-2">Кредиты</h4>
            <p className="text-sm opacity-80">Разработано Тимохиной Боженой и Сайфутдиновым Асадбеком</p>
            <p className="text-sm opacity-80 mt-1">3D визуализация Солнечной системы</p>
          </div>
        </div>
      )}

      {/* Информация о планете */}
      {selectedPlanet === -1 && (
        <>
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-md rounded-lg p-6 max-w-md text-white max-h-[80vh] overflow-y-auto shadow-2xl pointer-events-auto" style={{ zIndex: 30 }}>
            <h2 className="text-3xl font-bold mb-4">Солнце</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="opacity-60">Диаметр</p>
                  <p className="font-semibold">1,392,700 км</p>
                </div>
                <div>
                  <p className="opacity-60">Тип</p>
                  <p className="font-semibold">Желтый карлик</p>
                </div>
                <div>
                  <p className="opacity-60">Возраст</p>
                  <p className="font-semibold">4.6 млрд лет</p>
                </div>
                <div>
                  <p className="opacity-60">Масса</p>
                  <p className="font-semibold">1.989 × 10³⁰ кг</p>
                </div>
                <div className="col-span-2">
                  <p className="opacity-60">Температура поверхности</p>
                  <p className="font-semibold">5,500°C</p>
                </div>
                <div className="col-span-2">
                  <p className="opacity-60">Температура ядра</p>
                  <p className="font-semibold">15,000,000°C</p>
                </div>
              </div>
              <p className="text-base leading-relaxed opacity-90 mt-4">
                Солнце - звезда в центре Солнечной системы, содержащая 99.86% всей массы системы. 
                Состоит на 73% из водорода и на 25% из гелия. Каждую секунду превращает 600 миллионов 
                тонн водорода в гелий, генерируя огромное количество энергии. Свет от Солнца достигает 
                Земли за 8 минут 20 секунд.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setSelectedPlanet(null)}
            className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg text-white hover:bg-black/90 transition-colors shadow-lg pointer-events-auto"
            style={{ zIndex: 30 }}
          >
            ← Назад к системе
          </button>
        </>
      )}
      
      {selectedPlanet !== null && selectedPlanet >= 0 && (
        <>
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-black/90 backdrop-blur-md rounded-lg p-6 max-w-md text-white max-h-[80vh] overflow-y-auto shadow-2xl pointer-events-auto" style={{ zIndex: 30 }}>
            <h2 className="text-3xl font-bold mb-4">{planetData[selectedPlanet].name}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="opacity-60">Диаметр</p>
                  <p className="font-semibold">{planetData[selectedPlanet].info.diameter}</p>
                </div>
                <div>
                  <p className="opacity-60">Удаленность</p>
                  <p className="font-semibold">{planetData[selectedPlanet].info.distance_from_sun}</p>
                </div>
                <div>
                  <p className="opacity-60">Сутки</p>
                  <p className="font-semibold">{planetData[selectedPlanet].info.day}</p>
                </div>
                <div>
                  <p className="opacity-60">Год</p>
                  <p className="font-semibold">{planetData[selectedPlanet].info.year}</p>
                </div>
                <div className="col-span-2">
                  <p className="opacity-60">Температура</p>
                  <p className="font-semibold">{planetData[selectedPlanet].info.temperature}</p>
                </div>
              </div>
              <p className="text-base leading-relaxed opacity-90 mt-4">{planetData[selectedPlanet].info.description}</p>
              {planetData[selectedPlanet].moons.length > 0 && (
                <p className="mt-4 text-sm opacity-70">
                  Спутников: {planetData[selectedPlanet].moons.length}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setSelectedPlanet(null)}
            className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg text-white hover:bg-black/90 transition-colors shadow-lg pointer-events-auto"
            style={{ zIndex: 30 }}
          >
            ← Назад к системе
          </button>
        </>
      )}

      {/* Инструкция */}
      {selectedPlanet === null && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg text-white text-center shadow-lg pointer-events-none" style={{ zIndex: 30 }}>
          Нажмите на планету для подробной информации • Зажмите и тяните для вращения камеры
        </div>
      )}
    </div>
  );
};

export default SolarSystem;