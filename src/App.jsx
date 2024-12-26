import React, { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import './App.css';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import jostModel from '/src/assets/josta.glb';
import barcode from "./assets/barcode.avif"

const App = () => {
  const modelRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
  
    // Sync Lenis with GSAP ticker for smooth scrolling updates
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
  
    // Disable smoothing for ticker
    gsap.ticker.lagSmoothing(0);
  
    // Create a new Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfefdfd);
  
    // Create a camera with perspective
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 5);
  
    // Add lights to illuminate the model
    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Add ambient light for better overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
  
    // Create the renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0xffffff, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
  
    // Append the renderer to the DOM
    if (modelRef.current) {
      modelRef.current.appendChild(renderer.domElement);
    }
  
    // Animation loop for Three.js
    const basicAnimate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(basicAnimate);
    };
    basicAnimate();
  
    // Load the GLTF model using imported path
    const loader = new GLTFLoader();
    let model;
    loader.load(
      jostModel, // Using imported model path
      (gltf) => {
        console.log('Model loaded successfully:', gltf);
        model = gltf.scene;
    
        // Traverse the model and modify materials
        model.traverse((node) => {
          if (node.isMesh && node.material) {
            node.material.metalness = 0.3;
            node.material.roughness = 0.4;
            node.material.envMapIntensity = 1.5;
          }
          node.castShadow = true;
          node.receiveShadow = true;
        });
    
        // Center the model in the scene
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        scene.add(model);
    
        // Adjust camera based on the model's size
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.z = maxDim * 1.5;
    
        // Scale the model and play initial animation
        model.scale.set(1, 1, 1);
    
        // Animation for scaling up the model
        gsap.from(model.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 2,
          ease: 'power3.out',
        });
    
        // Add rotation animation
        gsap.to(model.rotation, {
          y: Math.PI * 2,
          duration: 8,
          ease: 'none',
          repeat: -1,
        });
    
        // Cleanup animation frame and start animation
        cancelAnimationFrame(basicAnimate);
        basicAnimate();
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
  
    // Clean up when the component unmounts
    return () => {
      lenis.destroy();
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  

  return (
    <div className="lenis">
      <div className="model" ref={modelRef}></div>

      <div className="hero">
        <h1>Digital <br />
          Products</h1>
        <h2>Transform your brand identity</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo quidem soluta, molestias iure sapiente consequuntur assumenda, ipsum ullam doloribus dolorem possimus sequi nulla. Porro quos expedita eligendi omnis voluptatem ut!</p>
      </div>

      <div className="info">
        <div className="tags">
          <p>Brand Strategy</p>
          <p>User Experience</p>
          <p>Digital Products</p>
          <p>Innovation Lab</p>
        </div>
        <h2>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Commodi impedit modi asperiores rem pariatur natus, nesciunt inventore, sequi harum nobis, fugiat temporibus culpa facilis aspernatur.</h2>
        <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nostrum, totam doloribus? Voluptates exercitationem qui asperiores, fugit laborum officia nisi pariatur, similique corrupti assumenda odio molestias itaque, necessitatibus tempora veritatis sequi!</p>
      </div>

      <div className="scanner">
        <div className="scan-info">
          <div className="product-id"><h2>#6969</h2></div>
          <div className="product-description">
            <p>Transform your digital Identity</p>
          </div>
        </div>

        <div className="scan-container"></div>

        <div className="barcode">
          <img src={barcode} alt="" /> 
        </div>

        <div className="purchased"><p>Innovation Verified</p></div>
      </div>

      <div className="outro">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus aspernatur velit at eveniet odio similique quia cumque distinctio repellendus odit ratione, placeat accusamus, asperiores nobis.
      </div>
    </div>
  );
};

export default App;