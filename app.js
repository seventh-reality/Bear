<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WebAR SLAM - Surface Tracking</title>
  <script src="https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.155.0/examples/js/loaders/GLTFLoader.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.155.0/examples/js/vr/WebXRButton.js"></script>
</head>
<body style="margin: 0; overflow: hidden;">

<script>
  // WebGL Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true; // Enable WebXR
  document.body.appendChild(renderer.domElement);

  // Scene and Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

  // Add light to the scene
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // Add WebXR Button
  document.body.appendChild(THREE.WebXRButton.createButton(renderer));

  // GLTF Model Loader
  const gltfLoader = new THREE.GLTFLoader();
  let model = null;

  // Load the 3D model
  gltfLoader.load(
    'bear.glb', // Replace with the path to your GLTF model
    (gltf) => {
      model = gltf.scene;
      model.visible = false; // Initially hide the model
      model.scale.set(0.5, 0.5, 0.5); // Adjust scale as needed
      scene.add(model);
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
    }
  );

  // Set up WebXR hit testing
  let hitTestSource = null;
  let hitTestSourceRequested = false;

  function onSelect(event) {
    if (model) {
      const xrSession = renderer.xr.getSession();
      const frame = event.frame;
      const referenceSpace = renderer.xr.getReferenceSpace();

      // Get the hit test results
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);

        // Place the model at the hit position
        model.position.set(pose.transform.position.x, pose.transform.position.y, pose.transform.position.z);
        model.visible = true; // Make the model visible
      }
    }
  }

  // Add event listener for XRSession
  renderer.xr.addEventListener('sessionstart', async () => {
    const session = renderer.xr.getSession();

    // Request hit test source
    const referenceSpace = renderer.xr.getReferenceSpace();
    hitTestSource = await session.requestHitTestSource({ space: referenceSpace });
    session.addEventListener('select', onSelect);
  });

  renderer.xr.addEventListener('sessionend', () => {
    hitTestSource = null;
    hitTestSourceRequested = false;
  });

  // Render loop
  function animate() {
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  }
  animate();
</script>

</body>
</html>
