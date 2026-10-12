import Nanocomponent from 'nanocomponent';
import html from 'nanohtml';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class SquidDiorama extends Nanocomponent {
    constructor() {
        super();
        this.animId = null;
        this.resizeHandler = null;
        this.themeObserver = null;
    }

    createElement() {
        return html`
            <div class="diorama-container" style="width: 100%; height: 420px; position: relative; border-radius: 12px; overflow: hidden; transition: background-color 0.25s;">
                <div class="diorama-canvas-host" style="width: 100%; height: 100%; cursor: default;"></div>
            </div>
        `;
    }

    update() {
        return false;
    }

    load(element) {
        const host = element.querySelector('.diorama-canvas-host') || element;
        this.initThree(host, element);
    }

    unload() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        if (this.themeObserver) {
            this.themeObserver.disconnect();
            this.themeObserver = null;
        }
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
        if (this.renderTarget) {
            this.renderTarget.dispose();
        }
    }

    initThree(host, containerEl) {
        const width = host.clientWidth || 500;
        const height = host.clientHeight || 500;

        const TANK_SIZE = { x: 30, y: 28, z: 30 };
        const WATER_SURFACE_Y = 10.8;
        const SEABED_Y = -TANK_SIZE.y / 2 + 0.1; // -13.9

        const SAFE_BOUNDS = {
            minX: -8.5, maxX: 8.5,
            minY: -10.5, maxY: 7.2,
            minZ: -8.5, maxZ: 8.5
        };

        const scene = new THREE.Scene();

        // 1. Dynamic background tracking light / dark mode
        const updateThemeBackground = () => {
            const isNight = document.body.classList.contains('night');
            const bgHexStr = isNight ? '#0e0e0f' : '#ffffff';
            if (containerEl) {
                containerEl.style.backgroundColor = bgHexStr;
            }
        };
        updateThemeBackground();

        this.themeObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
                if (m.attributeName === 'class') {
                    updateThemeBackground();
                    break;
                }
            }
        });
        this.themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // 2 & 3. Camera framing: zoomed in ~25% (frustumSize 42), fixed true isometric angle
        const aspect = width / height;
        const frustumSize = 42.0;
        const camera = new THREE.OrthographicCamera(
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            1,
            300
        );
        // Low-angle three-quarter axonometric view matching screenshot
        // Front-facing cube with slight right rotation (azimuth ~18°), low eye level (elevation ~20°)
        camera.position.set(21.5, 23.0, 62.0);
        camera.lookAt(0, -1.0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // Softer, balanced exposure to avoid harsh blown-out highlights
        renderer.toneMappingExposure = 0.88;
        this.renderer = renderer;

        host.appendChild(renderer.domElement);

        // Fixed camera angle - rotation and zoom disabled
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableRotate = false; // Fixed angle per request
        controls.enableZoom = false;   // Fixed zoom
        controls.enablePan = false;    // Fixed position
        controls.target.set(0, -1.0, 0);
        controls.update();

        // Crisp, high-key clean luminous lighting matching screenshot
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
        scene.add(ambientLight);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x94a3b8, 0.85);
        hemiLight.position.set(0, 36, 0);
        scene.add(hemiLight);

        // Clean overhead key light - pure white studio illumination
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.95);
        sunLight.position.set(20, 38, 16);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        sunLight.shadow.camera.left = -22;
        sunLight.shadow.camera.right = 22;
        sunLight.shadow.camera.top = 22;
        sunLight.shadow.camera.bottom = -22;
        sunLight.shadow.bias = -0.0005;
        scene.add(sunLight);

        // Soft cool fill light from back-left
        const coolFillLight = new THREE.DirectionalLight(0xe2e8f0, 0.55);
        coolFillLight.position.set(-24, 20, -22);
        scene.add(coolFillLight);

        const tankGroup = new THREE.Group();
        scene.add(tankGroup);

        // Delicate silver-cyan wireframe tank cage
        const wireGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(TANK_SIZE.x, TANK_SIZE.y, TANK_SIZE.z));
        const wireMat = new THREE.LineBasicMaterial({
            color: 0x93c5fd,
            transparent: true,
            opacity: 0.25
        });
        const tankWireframe = new THREE.LineSegments(wireGeo, wireMat);
        tankGroup.add(tankWireframe);

        // Seabed: Crisp luminous porcelain white with gentle undulating ripples
        const sandGeo = new THREE.PlaneGeometry(TANK_SIZE.x, TANK_SIZE.z, 36, 36);
        sandGeo.rotateX(-Math.PI / 2);
        const sandPos = sandGeo.attributes.position;
        for (let i = 0; i < sandPos.count; i++) {
            const vx = sandPos.getX(i);
            const vz = sandPos.getZ(i);
            const wave = Math.sin(vx * 0.35) * Math.cos(vz * 0.35) * 0.6 + Math.sin(vx * 0.7) * 0.25;
            sandPos.setY(i, wave);
        }
        sandGeo.computeVertexNormals();

        const sandMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.65 });
        const seabed = new THREE.Mesh(sandGeo, sandMat);
        seabed.position.y = SEABED_Y;
        seabed.receiveShadow = true;
        tankGroup.add(seabed);

        // Boulders: Pale lavender-slate / glacial silver stones
        const rockMat = new THREE.MeshStandardMaterial({ color: 0xc7d2fe, roughness: 0.6, flatShading: true });
        [
            [-9, SEABED_Y + 1.2, -8, 2.8],
            [-11, SEABED_Y + 0.9, -6, 2.0],
            [10, SEABED_Y + 1.0, 9, 2.5],
            [8, SEABED_Y + 0.7, 11, 1.8],
            [-10, SEABED_Y + 0.8, 9, 2.2]
        ].forEach(([x, y, z, r]) => {
            const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 1), rockMat);
            mesh.position.set(x, y, z);
            mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            tankGroup.add(mesh);
        });

        // Kelp: Slender mint-celadon stalks
        const kelpBlades = [];
        const createKelp = (x, z, count = 5) => {
            const kelpMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.5, side: THREE.DoubleSide });
            for (let k = 0; k < count; k++) {
                const h = 10 + Math.random() * 6;
                const geo = new THREE.PlaneGeometry(0.45, h, 1, 10);
                geo.translate(0, h / 2, 0);
                const mesh = new THREE.Mesh(geo, kelpMat);
                mesh.position.set(x + (Math.random() - 0.5) * 2.5, SEABED_Y + 0.2, z + (Math.random() - 0.5) * 2.5);
                mesh.rotation.y = Math.random() * Math.PI;
                tankGroup.add(mesh);
                kelpBlades.push({ mesh, speed: 1.1 + Math.random() * 0.7, offset: Math.random() * 5 });
            }
        };
        createKelp(-9, -9, 7);
        createKelp(9, 10, 6);

        // Seabed caustics texture generator
        const causticCanvas = document.createElement('canvas');
        causticCanvas.width = 256;
        causticCanvas.height = 256;
        const causticCtx = causticCanvas.getContext('2d');
        const causticTexture = new THREE.CanvasTexture(causticCanvas);
        causticTexture.wrapS = THREE.RepeatWrapping;
        causticTexture.wrapT = THREE.RepeatWrapping;
        causticTexture.repeat.set(3, 3);

        const causticGeo = new THREE.PlaneGeometry(TANK_SIZE.x - 0.4, TANK_SIZE.z - 0.4);
        causticGeo.rotateX(-Math.PI / 2);
        const causticMat = new THREE.MeshBasicMaterial({
            map: causticTexture,
            transparent: true,
            opacity: 0.16,
            blending: THREE.NormalBlending,
            depthWrite: false
        });
        const causticMesh = new THREE.Mesh(causticGeo, causticMat);
        causticMesh.position.y = SEABED_Y + 0.25;
        tankGroup.add(causticMesh);

        function updateCaustics(time) {
            causticCtx.fillStyle = '#000000';
            causticCtx.fillRect(0, 0, 256, 256);
            causticCtx.strokeStyle = 'rgba(203, 213, 225, 0.40)';
            causticCtx.lineWidth = 2.5;
            for (let i = 0; i < 9; i++) {
                causticCtx.beginPath();
                for (let x = 0; x < 256; x += 16) {
                    const y = (i * 32) + Math.sin(x * 0.05 + time * 2.5 + i) * 12 + Math.cos(x * 0.08 - time * 2.0) * 8;
                    if (x === 0) causticCtx.moveTo(x, y);
                    else causticCtx.lineTo(x, y);
                }
                causticCtx.stroke();
            }
            causticTexture.needsUpdate = true;
        }

        const WATER_W = TANK_SIZE.x;
        const WATER_D = TANK_SIZE.z;
        const waterSegments = 48;
        const waterGeo = new THREE.PlaneGeometry(WATER_W, WATER_D, waterSegments, waterSegments);
        waterGeo.rotateX(-Math.PI / 2);

        const vertexCount = waterGeo.attributes.position.count;
        const waterColors = new Float32Array(vertexCount * 3);
        waterGeo.setAttribute('color', new THREE.BufferAttribute(waterColors, 3));

        // Luminous silver-grey water surface with rolling waves and soft seafoam
        const waterSurfaceMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.45,
            metalness: 0.08,
            transparent: true,
            opacity: 0.88,
            vertexColors: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const waterSurfaceMesh = new THREE.Mesh(waterGeo, waterSurfaceMat);
        waterSurfaceMesh.position.y = WATER_SURFACE_Y;
        tankGroup.add(waterSurfaceMesh);

        function updateWaterSurface(time) {
            const posAttr = waterGeo.attributes.position;
            const colAttr = waterGeo.attributes.color;
            const halfW = WATER_W / 2;
            const halfD = WATER_D / 2;

            // Luminous silver-slate palette matching screenshot
            // Deep valley tones (cool slate silver-grey)
            const deepR = 0.38, deepG = 0.46, deepB = 0.52;
            // Wave crest tones (bright silvery white)
            const crestR = 0.88, crestG = 0.94, crestB = 0.98;
            // Seafoam tips (crisp clean white)
            const foamR = 0.98, foamG = 0.99, foamB = 1.0;

            for (let i = 0; i < vertexCount; i++) {
                const x = posAttr.getX(i);
                const z = posAttr.getZ(i);

                // Multi-layered rolling waves (swell + cross chop + small foam ripples)
                const swell = Math.sin(x * 0.22 + time * 1.4) * 0.22;
                const crossWave = Math.cos(z * 0.26 + time * 1.1 + x * 0.1) * 0.16;
                const chop = Math.sin((x * 0.5 + z * 0.4) + time * 2.1) * 0.08;
                const microRipples = Math.sin(x * 1.1 - time * 2.8) * Math.cos(z * 1.1 + time * 2.4) * 0.04;

                const waveHeight = swell + crossWave + chop + microRipples;
                posAttr.setY(i, waveHeight);

                // Detect wave crests for seafoam tips
                const crestFactor = THREE.MathUtils.clamp((waveHeight - 0.10) / 0.24, 0.0, 1.0);

                // Perimeter seafoam where water meets the diorama glass walls
                const distFromWallX = halfW - Math.abs(x);
                const distFromWallZ = halfD - Math.abs(z);
                const wallDistance = Math.min(distFromWallX, distFromWallZ);
                const wallFoam = THREE.MathUtils.clamp(1.0 - (wallDistance / 1.4), 0.0, 1.0);
                const wallLap = Math.sin(time * 3.0 + (x + z) * 0.6) * 0.15;
                const perimeterFoam = THREE.MathUtils.clamp(wallFoam * 0.8 + wallLap * 0.2, 0.0, 1.0);

                // Combined seafoam mask
                const seaFoam = Math.max(crestFactor * 0.70, perimeterFoam * 0.60);

                // Interpolate from deep silver-slate -> crest silver -> crisp white seafoam
                const midR = THREE.MathUtils.lerp(deepR, crestR, THREE.MathUtils.clamp((waveHeight + 0.2) / 0.4, 0.0, 1.0));
                const midG = THREE.MathUtils.lerp(deepG, crestG, THREE.MathUtils.clamp((waveHeight + 0.2) / 0.4, 0.0, 1.0));
                const midB = THREE.MathUtils.lerp(deepB, crestB, THREE.MathUtils.clamp((waveHeight + 0.2) / 0.4, 0.0, 1.0));

                const finalR = THREE.MathUtils.lerp(midR, foamR, seaFoam);
                const finalG = THREE.MathUtils.lerp(midG, foamG, seaFoam);
                const finalB = THREE.MathUtils.lerp(midB, foamB, seaFoam);

                colAttr.setXYZ(i, finalR, finalG, finalB);
            }

            posAttr.needsUpdate = true;
            colAttr.needsUpdate = true;
            waterGeo.computeVertexNormals();
        }

        // Coral-rose cephalopod palette matching screenshot
        const squidSkin = 0xf87171;    // Luminous coral salmon-pink
        const squidUnder = 0xfca5a5;   // Soft pale peach/pink ventral
        const squidFin = 0xfb7185;     // Vibrant coral rose fin

        const squidBodyRoot = new THREE.Group();
        squidBodyRoot.scale.set(0.70, 0.70, 0.70);
        scene.add(squidBodyRoot);

        const squidModelContainer = new THREE.Group();
        squidBodyRoot.add(squidModelContainer);

        const skinMat = new THREE.MeshStandardMaterial({
            color: squidSkin,
            roughness: 0.45,
            metalness: 0.05
        });
        const underMat = new THREE.MeshStandardMaterial({
            color: squidUnder,
            roughness: 0.48,
            metalness: 0.04
        });
        const finMat = new THREE.MeshStandardMaterial({
            color: squidFin,
            roughness: 0.42,
            metalness: 0.05,
            side: THREE.DoubleSide
        });

        // Mantle
        const mantlePts = [
            new THREE.Vector2(0.01, 3.8),
            new THREE.Vector2(0.35, 3.4),
            new THREE.Vector2(0.72, 2.6),
            new THREE.Vector2(0.96, 1.4),
            new THREE.Vector2(0.92, 0.4),
            new THREE.Vector2(0.78, -0.4),
            new THREE.Vector2(0.65, -0.5)
        ];
        const mantleGeo = new THREE.LatheGeometry(mantlePts, 32);
        mantleGeo.rotateX(Math.PI / 2);
        const mantleMesh = new THREE.Mesh(mantleGeo, skinMat);
        mantleMesh.castShadow = true;
        squidModelContainer.add(mantleMesh);

        // Stabilizer Fins
        const finShape = new THREE.Shape();
        finShape.moveTo(0, 0);
        finShape.bezierCurveTo(2.4, 0.4, 2.0, 2.0, 0, 2.6);
        finShape.bezierCurveTo(-2.0, 2.0, -2.4, 0.4, 0, 0);
        const finGeo = new THREE.ShapeGeometry(finShape, 16);
        finGeo.rotateX(Math.PI / 2);
        finGeo.translate(0, 0.1, 1.6);
        const finsMesh = new THREE.Mesh(finGeo, finMat);
        finsMesh.castShadow = true;
        squidModelContainer.add(finsMesh);

        // Siphon
        const siphonGeo = new THREE.CylinderGeometry(0.18, 0.28, 0.9, 16);
        siphonGeo.rotateX(Math.PI / 2 - 0.25);
        const siphonMesh = new THREE.Mesh(siphonGeo, underMat);
        siphonMesh.position.set(0, -0.55, -0.3);
        squidModelContainer.add(siphonMesh);

        // Head
        const headGeo = new THREE.CylinderGeometry(0.62, 0.74, 0.8, 20);
        headGeo.rotateX(Math.PI / 2);
        const headMesh = new THREE.Mesh(headGeo, skinMat);
        headMesh.position.set(0, -0.05, -0.7);
        squidModelContainer.add(headMesh);

        const collarAnchorObj = new THREE.Object3D();
        collarAnchorObj.position.set(0, -0.05, -1.1);
        squidModelContainer.add(collarAnchorObj);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(0.32, 16, 16);
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0x08131e, roughness: 0.2 });
        const irisMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

        [-1, 1].forEach(side => {
            const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
            eyeMesh.position.set(side * 0.65, 0.05, -0.7);
            eyeMesh.scale.set(0.65, 1, 1);
            squidModelContainer.add(eyeMesh);

            const iris = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.22, 16), irisMat);
            iris.position.set(side * 0.86, 0.05, -0.7);
            iris.rotation.y = side * Math.PI / 2;
            squidModelContainer.add(iris);
        });

        // Tentacles & Arms
        const tentacleWorldGroup = new THREE.Group();
        scene.add(tentacleWorldGroup);

        const armChains = [];
        const ARM_COUNT = 8;
        for (let i = 0; i < ARM_COUNT; i++) {
            const angle = (i / ARM_COUNT) * Math.PI * 2;
            const radius = 0.38;
            const segments = 10;
            const nodes = [];
            const meshes = [];

            for (let s = 0; s < segments; s++) {
                const segRad = 0.12 * (1.0 - s / segments) + 0.035;
                const segGeo = new THREE.CylinderGeometry(segRad * 0.85, segRad, 0.55, 8);
                segGeo.rotateX(Math.PI / 2);
                const segMesh = new THREE.Mesh(segGeo, s % 2 === 0 ? skinMat : underMat);
                segMesh.castShadow = true;
                tentacleWorldGroup.add(segMesh);
                meshes.push(segMesh);

                nodes.push({
                    pos: new THREE.Vector3(0, 0, -s * 0.55),
                    vel: new THREE.Vector3()
                });
            }

            armChains.push({
                isTentacle: false,
                angle,
                radius,
                segments,
                nodes,
                meshes,
                curlPhase: i * 0.78
            });
        }

        const tentacleAngles = [-Math.PI * 0.35, Math.PI * 0.35];
        for (let t = 0; t < 2; t++) {
            const angle = tentacleAngles[t];
            const radius = 0.28;
            const segments = 16;
            const nodes = [];
            const meshes = [];

            for (let s = 0; s < segments; s++) {
                const isClub = s >= segments - 4;
                const segRad = isClub ? 0.16 : (0.07 * (1.0 - s / segments) + 0.025);
                const segLen = isClub ? 0.55 : 0.65;
                const segGeo = new THREE.CylinderGeometry(segRad * 0.8, segRad, segLen, 8);
                segGeo.rotateX(Math.PI / 2);
                const segMesh = new THREE.Mesh(segGeo, isClub ? underMat : skinMat);
                segMesh.castShadow = true;
                tentacleWorldGroup.add(segMesh);
                meshes.push(segMesh);

                nodes.push({
                    pos: new THREE.Vector3(0, 0, -s * 0.65),
                    vel: new THREE.Vector3()
                });
            }

            armChains.push({
                isTentacle: true,
                angle,
                radius,
                segments,
                nodes,
                meshes,
                curlPhase: t * Math.PI + 1.5
            });
        }

        // Bubbles
        const BUBBLE_COUNT = 40;
        const bubbleGeo = new THREE.DodecahedronGeometry(0.12, 1);
        const bubbleMat = new THREE.MeshStandardMaterial({
            color: 0xbae6fd,
            roughness: 0.15,
            metalness: 0.5,
            transparent: true,
            opacity: 0.6
        });
        const bubbleInst = new THREE.InstancedMesh(bubbleGeo, bubbleMat, BUBBLE_COUNT);
        scene.add(bubbleInst);

        const bubbleData = Array.from({ length: BUBBLE_COUNT }, () => ({
            pos: new THREE.Vector3(0, -999, 0),
            vel: new THREE.Vector3(),
            life: 0,
            maxLife: 1
        }));
        const dummyObj = new THREE.Object3D();

        function emitBubbles(origin, dir, count = 2) {
            let emitted = 0;
            for (let i = 0; i < BUBBLE_COUNT && emitted < count; i++) {
                const b = bubbleData[i];
                if (b.life <= 0) {
                    b.pos.copy(origin).add(new THREE.Vector3((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.25));
                    b.vel.copy(dir).multiplyScalar(2.2 + Math.random() * 2.5);
                    b.vel.y += 0.4;
                    b.maxLife = 0.8 + Math.random() * 0.5;
                    b.life = b.maxLife;
                    emitted++;
                }
            }
        }

        // Schooling fish
        const FISH_COUNT = 24;
        const fishGeo = new THREE.ConeGeometry(0.14, 0.6, 5);
        fishGeo.rotateX(Math.PI / 2);
        const fishMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.5 });
        const fishInst = new THREE.InstancedMesh(fishGeo, fishMat, FISH_COUNT);
        fishInst.castShadow = true;
        scene.add(fishInst);

        const fishData = Array.from({ length: FISH_COUNT }, () => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                THREE.MathUtils.lerp(-10, 8, Math.random()),
                (Math.random() - 0.5) * 20
            ),
            vel: new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 1, (Math.random() - 0.5) * 2)
        }));

        // Render target for retro Bayer dithering with alpha support
        let renderTarget;
        const initRenderTarget = (w, h) => {
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
            const factor = 2.0;
            const targetW = Math.max(64, Math.floor((w * pixelRatio) / factor));
            const targetH = Math.max(64, Math.floor((h * pixelRatio) / factor));

            if (renderTarget) renderTarget.dispose();
            renderTarget = new THREE.WebGLRenderTarget(targetW, targetH, {
                minFilter: THREE.NearestFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat
            });
            this.renderTarget = renderTarget;
        };
        initRenderTarget(width, height);

        const postScene = new THREE.Scene();
        const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const pixelShaderMaterial = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                tDiffuse: { value: null },
                uDitherActive: { value: 1.0 },
                uDitherStrength: { value: .075 },
                uColorLevels: { value: 20.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform sampler2D tDiffuse;
                uniform float uDitherActive;
                uniform float uDitherStrength;
                uniform float uColorLevels;
                varying vec2 vUv;

                float getBayer4(vec2 p) {
                    vec2 coord = mod(floor(p), 4.0);
                    float val = 0.0;
                    if (coord.y < 1.0) {
                        if (coord.x < 1.0) val = 0.0;
                        else if (coord.x < 2.0) val = 8.0;
                        else if (coord.x < 3.0) val = 2.0;
                        else val = 10.0;
                    } else if (coord.y < 2.0) {
                        if (coord.x < 1.0) val = 12.0;
                        else if (coord.x < 2.0) val = 4.0;
                        else if (coord.x < 3.0) val = 14.0;
                        else val = 6.0;
                    } else if (coord.y < 3.0) {
                        if (coord.x < 1.0) val = 3.0;
                        else if (coord.x < 2.0) val = 11.0;
                        else if (coord.x < 3.0) val = 1.0;
                        else val = 9.0;
                    } else {
                        if (coord.x < 1.0) val = 15.0;
                        else if (coord.x < 2.0) val = 7.0;
                        else if (coord.x < 3.0) val = 13.0;
                        else val = 5.0;
                    }
                    return (val / 16.0) - 0.5;
                }

                void main() {
                    vec4 sampleTex = texture2D(tDiffuse, vUv);
                    if (sampleTex.a < 0.01) {
                        discard;
                    }
                    vec3 col = sampleTex.rgb;
                    if (uDitherActive > 0.5) {
                        float dither = getBayer4(gl_FragCoord.xy) * uDitherStrength;
                        col += dither;
                    }
                    if (uColorLevels > 0.0) {
                        col = floor(col * uColorLevels + 0.5) / uColorLevels;
                    }
                    gl_FragColor = vec4(col, sampleTex.a);
                }
            `
        });

        postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), pixelShaderMaterial));

        const squid = {
            pos: new THREE.Vector3(0, -2, 0),
            vel: new THREE.Vector3(0, 0, 1.6),
            target: new THREE.Vector3(3, 1, 3),
            headingQuat: new THREE.Quaternion(),
            currentBankAngle: 0,
            baseSpeed: 2.2,
            maxThrustSpeed: 6.8,
            jetTimer: 0,
            jetCycle: 3.2,
            mantleCompression: 1.0,
            clampFactor: 0.0,
            waveEnergy: 0.2
        };

        function pickNewTarget() {
            squid.target.set(
                (Math.random() - 0.5) * (SAFE_BOUNDS.maxX * 1.7),
                THREE.MathUtils.lerp(SAFE_BOUNDS.minY + 1.5, SAFE_BOUNDS.maxY - 1.5, Math.random()),
                (Math.random() - 0.5) * (SAFE_BOUNDS.maxZ * 1.7)
            );
        }
        pickNewTarget();

        const clock = new THREE.Clock();

        function updateSquidPhysics(dt) {
            squid.jetTimer += dt;
            const cycle = squid.jetTimer % squid.jetCycle;
            let currentThrust = 0;

            if (cycle < 0.5) {
                const t = cycle / 0.5;
                squid.mantleCompression = 1.0 + Math.sin(t * Math.PI) * 0.18;
                squid.clampFactor = THREE.MathUtils.lerp(0.35, 0.0, t);
                squid.waveEnergy = 0.28;
                currentThrust = squid.baseSpeed * 0.65;
            } else if (cycle < 1.2) {
                const t = (cycle - 0.5) / 0.7;
                squid.mantleCompression = 1.18 - Math.sin(t * Math.PI * 0.5) * 0.38;
                squid.clampFactor = Math.sin(t * Math.PI * 0.5);
                squid.waveEnergy = THREE.MathUtils.lerp(0.04, 0.14, t);
                currentThrust = THREE.MathUtils.lerp(squid.maxThrustSpeed, squid.baseSpeed * 1.6, t);

                if (Math.random() < 0.5) {
                    const siphonWorld = new THREE.Vector3();
                    siphonMesh.getWorldPosition(siphonWorld);
                    const backwardDir = squid.vel.clone().normalize().negate();
                    emitBubbles(siphonWorld, backwardDir, 2);
                }
            } else {
                const t = (cycle - 1.2) / 2.0;
                squid.mantleCompression = THREE.MathUtils.lerp(0.80, 1.0, t);
                squid.clampFactor = THREE.MathUtils.lerp(1.0, 0.25, t);
                squid.waveEnergy = THREE.MathUtils.lerp(0.14, 0.45, t);
                currentThrust = THREE.MathUtils.lerp(squid.baseSpeed * 1.6, squid.baseSpeed * 0.85, t);
            }

            const toTarget = new THREE.Vector3().subVectors(squid.target, squid.pos);
            if (toTarget.length() < 3.2) pickNewTarget();
            toTarget.normalize().multiplyScalar(1.6);

            const repulse = new THREE.Vector3();
            const lookahead = squid.vel.clone().multiplyScalar(1.2);
            const futurePos = squid.pos.clone().add(lookahead);

            if (futurePos.x > SAFE_BOUNDS.maxX) repulse.x -= 5.5;
            else if (futurePos.x < SAFE_BOUNDS.minX) repulse.x += 5.5;

            if (futurePos.y > SAFE_BOUNDS.maxY) repulse.y -= 6.5;
            else if (futurePos.y < SAFE_BOUNDS.minY) repulse.y += 6.5;

            if (futurePos.z > SAFE_BOUNDS.maxZ) repulse.z -= 5.5;
            else if (futurePos.z < SAFE_BOUNDS.minZ) repulse.z += 5.5;

            const desiredVel = squid.vel.clone().add(toTarget.multiplyScalar(dt)).add(repulse.multiplyScalar(dt));
            desiredVel.normalize().multiplyScalar(currentThrust);
            squid.vel.lerp(desiredVel, dt * 2.4);

            squid.pos.addScaledVector(squid.vel, dt);

            if (squid.pos.x > SAFE_BOUNDS.maxX) { squid.pos.x = SAFE_BOUNDS.maxX; squid.vel.x *= -0.5; pickNewTarget(); }
            else if (squid.pos.x < SAFE_BOUNDS.minX) { squid.pos.x = SAFE_BOUNDS.minX; squid.vel.x *= -0.5; pickNewTarget(); }

            if (squid.pos.y > SAFE_BOUNDS.maxY) { squid.pos.y = SAFE_BOUNDS.maxY; squid.vel.y *= -0.5; pickNewTarget(); }
            else if (squid.pos.y < SAFE_BOUNDS.minY) { squid.pos.y = SAFE_BOUNDS.minY; squid.vel.y *= -0.5; pickNewTarget(); }

            if (squid.pos.z > SAFE_BOUNDS.maxZ) { squid.pos.z = SAFE_BOUNDS.maxZ; squid.vel.z *= -0.5; pickNewTarget(); }
            else if (squid.pos.z < SAFE_BOUNDS.minZ) { squid.pos.z = SAFE_BOUNDS.minZ; squid.vel.z *= -0.5; pickNewTarget(); }

            squidBodyRoot.position.copy(squid.pos);

            if (squid.vel.lengthSq() > 0.01) {
                const moveDir = squid.vel.clone().normalize();
                const curForward = new THREE.Vector3(0, 0, 1).applyQuaternion(squid.headingQuat);
                const turnCross = new THREE.Vector3().crossVectors(curForward, moveDir);
                const yawTurnSpeed = turnCross.y;

                const targetBank = THREE.MathUtils.clamp(-yawTurnSpeed * 2.2, -0.5, 0.5);
                squid.currentBankAngle = THREE.MathUtils.lerp(squid.currentBankAngle, targetBank, dt * 4.5);

                let up = new THREE.Vector3(0, 1, 0);
                if (Math.abs(moveDir.dot(up)) > 0.96) up = new THREE.Vector3(0, 0, 1);

                const right = new THREE.Vector3().crossVectors(up, moveDir).normalize();
                const realUp = new THREE.Vector3().crossVectors(moveDir, right).normalize();

                const rotMat = new THREE.Matrix4().makeBasis(right, realUp, moveDir);
                const targetQuat = new THREE.Quaternion().setFromRotationMatrix(rotMat);
                const rollQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), squid.currentBankAngle);
                targetQuat.multiply(rollQuat);

                squid.headingQuat.slerp(targetQuat, dt * 3.4);
                squidBodyRoot.quaternion.copy(squid.headingQuat);
            }

            mantleMesh.scale.set(squid.mantleCompression, squid.mantleCompression, 1.0);
            finsMesh.rotation.z = Math.sin(clock.getElapsedTime() * 5.5) * 0.16;

            squidModelContainer.updateWorldMatrix(true, false);
            collarAnchorObj.updateWorldMatrix(true, false);
            const collarMatrix = collarAnchorObj.matrixWorld;

            const time = clock.getElapsedTime();
            const wakeDir = squid.vel.clone().normalize().negate();

            armChains.forEach(chain => {
                const localAnchor = new THREE.Vector3(
                    Math.cos(chain.angle) * chain.radius,
                    Math.sin(chain.angle) * chain.radius * 0.8,
                    0.0
                );
                localAnchor.applyMatrix4(collarMatrix);

                chain.nodes[0].pos.copy(localAnchor);
                chain.meshes[0].position.copy(localAnchor);

                for (let s = 1; s < chain.segments; s++) {
                    const curr = chain.nodes[s];
                    const prev = chain.nodes[s - 1];
                    const segT = s / chain.segments;

                    let toCurr = new THREE.Vector3().subVectors(curr.pos, prev.pos);
                    let dist = toCurr.length();
                    if (dist < 0.001) {
                        toCurr.set(0, 0, -1);
                        dist = 0.001;
                    }

                    const baseSegLen = (chain.isTentacle ? 0.65 : 0.52) * 0.70;
                    const segLen = baseSegLen * (1.0 + squid.clampFactor * 0.12);

                    const blendToWake = THREE.MathUtils.clamp(squid.clampFactor * 0.55 + squid.vel.length() * 0.07, 0.12, 0.8);
                    const idealDir = toCurr.clone().normalize().lerp(wakeDir, blendToWake).normalize();

                    const defaultRadiusOffset = (1.0 - segT * 0.5) * THREE.MathUtils.lerp(0.18, 0.02, squid.clampFactor);
                    const outwardRad = new THREE.Vector3(Math.cos(chain.angle), Math.sin(chain.angle), 0)
                        .applyQuaternion(squidBodyRoot.quaternion)
                        .multiplyScalar(defaultRadiusOffset);

                    const wavePhase = (time * (chain.isTentacle ? 4.2 : 5.0)) - (s * 0.48) + chain.curlPhase;
                    const waveAmp = squid.waveEnergy * (0.04 + segT * 0.18) * (1.0 - squid.clampFactor * 0.7);

                    let lateralUp = new THREE.Vector3(0, 1, 0);
                    if (Math.abs(idealDir.dot(lateralUp)) > 0.95) lateralUp = new THREE.Vector3(1, 0, 0);
                    const perpRight = new THREE.Vector3().crossVectors(idealDir, lateralUp).normalize();
                    const perpUp = new THREE.Vector3().crossVectors(perpRight, idealDir).normalize();

                    const ripple = perpRight.multiplyScalar(Math.sin(wavePhase) * waveAmp)
                        .add(perpUp.multiplyScalar(Math.cos(wavePhase * 0.85) * waveAmp * 0.6));

                    const targetWorldPos = prev.pos.clone()
                        .add(idealDir.multiplyScalar(segLen))
                        .add(outwardRad)
                        .add(ripple);

                    const stiffness = THREE.MathUtils.lerp(18.0, 10.0, segT);
                    curr.pos.lerp(targetWorldPos, Math.min(dt * stiffness, 0.8));

                    const actualDir = new THREE.Vector3().subVectors(curr.pos, prev.pos).normalize();
                    curr.pos.copy(prev.pos).add(actualDir.multiplyScalar(segLen));

                    chain.meshes[s].position.copy(curr.pos);
                    chain.meshes[s].lookAt(prev.pos);
                }
            });
        }

        function updateBubbles(dt) {
            for (let i = 0; i < BUBBLE_COUNT; i++) {
                const b = bubbleData[i];
                if (b.life > 0) {
                    b.life -= dt;
                    b.pos.addScaledVector(b.vel, dt);
                    b.vel.multiplyScalar(0.96);
                    b.vel.y += dt * 0.6;

                    const scale = (b.life / b.maxLife);
                    dummyObj.position.copy(b.pos);
                    dummyObj.scale.set(scale, scale, scale);
                    dummyObj.updateMatrix();
                    bubbleInst.setMatrixAt(i, dummyObj.matrix);
                } else {
                    dummyObj.position.set(0, -999, 0);
                    dummyObj.updateMatrix();
                    bubbleInst.setMatrixAt(i, dummyObj.matrix);
                }
            }
            bubbleInst.instanceMatrix.needsUpdate = true;
        }

        function updateFish(dt) {
            const squidPos = squid.pos;
            for (let i = 0; i < FISH_COUNT; i++) {
                const f = fishData[i];
                const dist = f.pos.distanceTo(squidPos);
                if (dist < 6.5) {
                    const flee = new THREE.Vector3().subVectors(f.pos, squidPos).normalize().multiplyScalar(8.0 / Math.max(1.0, dist));
                    f.vel.addScaledVector(flee, dt * 8.0);
                }

                const bx = TANK_SIZE.x / 2 - 2;
                const bz = TANK_SIZE.z / 2 - 2;
                const byMin = SEABED_Y + 1.5;
                const byMax = WATER_SURFACE_Y - 1.2;

                if (Math.abs(f.pos.x) > bx) f.vel.x -= Math.sign(f.pos.x) * dt * 4;
                if (Math.abs(f.pos.z) > bz) f.vel.z -= Math.sign(f.pos.z) * dt * 4;
                if (f.pos.y > byMax) f.vel.y -= dt * 5.0;
                else if (f.pos.y < byMin) f.vel.y += dt * 5.0;

                f.vel.clampLength(1.0, 5.0);
                f.pos.addScaledVector(f.vel, dt);

                dummyObj.position.copy(f.pos);
                dummyObj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), f.vel.clone().normalize());
                dummyObj.scale.set(1, 1, 1);
                dummyObj.updateMatrix();
                fishInst.setMatrixAt(i, dummyObj.matrix);
            }
            fishInst.instanceMatrix.needsUpdate = true;
        }

        const animate = () => {
            this.animId = requestAnimationFrame(animate);

            const dt = Math.min(clock.getDelta(), 0.1);
            const time = clock.getElapsedTime();

            controls.update();
            updateCaustics(time);
            updateWaterSurface(time);
            updateSquidPhysics(dt);
            updateBubbles(dt);
            updateFish(dt);

            kelpBlades.forEach(k => {
                k.mesh.rotation.z = Math.sin(time * k.speed + k.offset) * 0.12;
            });

            // Pass 1: Render 3D Diorama to pixel render target
            renderer.setRenderTarget(renderTarget);
            renderer.render(scene, camera);

            // Pass 2: Screen-space Bayer Dither & Pixel Quantization
            renderer.setRenderTarget(null);
            pixelShaderMaterial.uniforms.tDiffuse.value = renderTarget.texture;
            renderer.render(postScene, postCamera);
        };
        animate();

        this.resizeHandler = () => {
            if (!host) return;
            const w = host.clientWidth;
            const h = host.clientHeight;
            if (w === 0 || h === 0) return;
            const asp = w / h;
            camera.left = (-frustumSize * asp) / 2;
            camera.right = (frustumSize * asp) / 2;
            camera.top = frustumSize / 2;
            camera.bottom = -frustumSize / 2;
            camera.updateProjectionMatrix();

            renderer.setSize(w, h);
            initRenderTarget(w, h);
        };
        window.addEventListener('resize', this.resizeHandler);
    }
}

export default SquidDiorama;
