import React, { useEffect } from 'react';
import { forEach, indexOf, toLower } from 'ramda';
import * as THREE from 'three';
import STLLoaderFunc from 'three-stl-loader';
import { TrackballControls } from '../../assets/TrackballControls.js';

const STLLoader = STLLoaderFunc(THREE);

function Mesh({ meshItems }) {
  let container;
  let camera, controls, cameraTarget, scene, renderer;
  let raycaster = new THREE.Raycaster();
  let mouse = new THREE.Vector2(), INTERSECTED;
  let visibleObjects = [], invisibleObjects = [];

  function loadMeshSTL( geometry, color ) {
    var material = new THREE.MeshStandardMaterial({
      color: color
    });

    var mesh = new THREE.Mesh( geometry, material );

    // fit into frame
    mesh.scale.multiplyScalar( 0.2 );
    mesh.rotation.x = - Math.PI / 2;

    // wireframe
    var geo = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
    var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
    var wireframe = new THREE.LineSegments(geo, mat);
    mesh.add(wireframe);

    scene.add(mesh);
    visibleObjects.push(mesh);
  }

  function init() {
    container = document.createElement( 'div' );
    document.querySelector('#mesh-container').appendChild( container );
    // Camera
            
    camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 15 );
    camera.position.set( -3, 7, 2 );

    cameraTarget = new THREE.Vector3( 0, - 0.1, 0 );
    camera.lookAt( cameraTarget );

    // Background  
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );


    // STL files 0xb23636 0x505050 0xffff00
    var loader = new STLLoader();
    const missingColor = 0xb23636;
    const okColor = 0x505050;
    const outOfToleranceColor = 0xffff00;

    // Render STL files
    forEach(item => {
      const { Guid, Name, State } = item;
      if(!Guid) return;
      else {
        const isMissing = indexOf('missing', toLower(State)) !== -1;
        const isOutOfTolerance = indexOf('out-of-tolerance', toLower(State)) !== -1;
        
        loader.load(`/assets/mesh/${Guid}.stl`, function (geometry) {
          geometry.name = `<b>Name:</b>${Name} <b>State:</b>${State} <b>Guid:</b>${Guid}`;
          if(isMissing) {
            loadMeshSTL(geometry, missingColor); 
          }
          else if(isOutOfTolerance) {
            loadMeshSTL(geometry, outOfToleranceColor);
          }
          else {
            loadMeshSTL(geometry, okColor);
          }
        });
      }
    }, meshItems);
            // loader.load('/assets/mesh/2LkJP0CkyHwOxWfD6CNlrO.stl', function (geometry) {
            //     geometry.name = '<b>Name:</b>Floor:Generic 300mm:349636:0 <b>State:</b>ok <b>Guid:</b>2LkJP0CkyHwOxWfD6CNlrO';
            //     loadMeshSTL(geometry, 0x505050) })
            // loader.load('/assets/mesh/3z3SPdqOPEFez$DbC8YatB.stl', function (geometry) {
            //     geometry.name = '<b>Name:</b>Basic Wall:250 mm skilevæg:321189 <b>State:</b>out-of-tolerance <b>Guid:</b>3z3SPdqOPEFez$DbC8YatB';
            //     loadMeshSTL(geometry, 0xb2b236) } )
    
    // Lights

            scene.add( new THREE.AmbientLight( 0x808080 ) );

    addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );

    // renderer

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    renderer.shadowMap.enabled = true;

    container.appendChild( renderer.domElement );
    
    controls = new TrackballControls( camera, renderer.domElement );

    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 0.3;
    controls.panSpeed = 0.2;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.minDistance = 0.3;
    controls.maxDistance = 0.3 * 100;

            // mouse
    
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );

    // resize

    window.addEventListener( 'resize', onWindowResize, false );
    
    // keypress
    
    window.parent.addEventListener( 'keypress', keyboard );

  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();
  }

  function keyboard( ev ) {
    switch ( ev.key || String.fromCharCode( ev.keyCode || ev.charCode ) ) {
      case 'h':
        if ( INTERSECTED ) {
          INTERSECTED.material.visible = false;
          INTERSECTED.material.needsUpdate = true;
          // remove from visible objects
          var idx = visibleObjects.indexOf(INTERSECTED);
          if (idx >= 0) {
            visibleObjects.splice(idx, 1);
              // add to invisible objects
            invisibleObjects.push(INTERSECTED);
          }
        }    
        break;
        case 'r':
          invisibleObjects.forEach(function (item, idx) {
              item.material.visible = true;
              item.material.needsUpdate = true;
          })
          
          visibleObjects = visibleObjects.concat(invisibleObjects);
          invisibleObjects = [];
          break;
    }
  }

  function addShadowedLight(x, y, z, color, intensity) {
    var directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set( x, y, z );
    scene.add( directionalLight );

    directionalLight.castShadow = true;

    var d = 1;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;

    directionalLight.shadow.bias = - 0.001;
  }

  function onDocumentMouseMove( event ) {
    event.preventDefault();
  
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
  
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  }

  function animate() {
    requestAnimationFrame( animate );
    controls.update();
            
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray  
    var intersects = raycaster.intersectObjects( visibleObjects );
            
    if ( intersects.length > 0 ) {
      if ( INTERSECTED != intersects[0].object ) {
        if ( INTERSECTED ) {
          INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        }
        INTERSECTED = intersects[ 0 ].object;
        INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        INTERSECTED.material.emissive.setHex( 0x808080 );
        
        var infoElement = document.getElementById('info');
        infoElement.innerHTML = INTERSECTED.geometry.name;
      }
    } else {
      if (INTERSECTED) {
        INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
        
        var infoElement = document.getElementById('info');
        infoElement.innerHTML = "";
      }
    }
            
    renderer.render( scene, camera );
  }

  useEffect(() => {
    init();
    animate();
  }, []);

  return (
    <div>
      <div id="info" />
      <div id="mesh-container" />
    </div>
  );
}

export default Mesh;
