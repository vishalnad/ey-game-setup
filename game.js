class Game{
    constructor(){
        if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

        this.modes = Object.freeze({
			NONE:   Symbol("none"),
			PRELOAD: Symbol("preload"),
			INITIALISING:  Symbol("initialising"),
			CREATING_LEVEL: Symbol("creating_level"),
			ACTIVE: Symbol("active"),
			GAMEOVER: Symbol("gameover")
		});
        this.mode = this.modes.NONE;
        
        // this.scene = new THREE.Scene();
		// this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

		// this.renderer = new THREE.WebGLRenderer({ antialias: true });
        // this.renderer.setSize( window.innerWidth, window.innerHeight );
        // document.body.appendChild( this.renderer.domElement );

        // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        // const light = new THREE.DirectionalLight( 0xffffff );
		// light.position.set( 0, 20, 10 );
        // const ambient = new THREE.AmbientLight( 0x707070 ); // soft white light

		// const material = new THREE.MeshPhongMaterial( { color: 0x00aaff } );
		
        // this.cube = new THREE.Mesh( geometry, material );

        // this.scene.add( this.cube );
        // this.scene.add( light );
        // this.scene.add( ambient );

        // this.camera.position.z = 3;

        this.container = document.createElement( 'div' );
		this.container.style.height = '100%';
        document.body.appendChild( this.container );
        
        const game = this;
        const options = {
            assets: [
                `./assets/room.fbx`
            ],
            oncomplete: function() {
                game.init();
                game.animate();
            }
        }
        this.mode = this.modes.PRELOAD;

        this.clock = new THREE.Clock();

        const preloader = new Preloader(options);
        // let game = this;
        // const loader = new THREE.FBXLoader();
        // loader.load(`./assets/room.fbx`, function(object) {
        //     game.scene.add(object);

        //     object.traverse( function ( child ) {
		// 		if ( child.isMesh ) {
		// 			child.castShadow = true;
		// 			child.receiveShadow = true;		
		// 		}
        //     });
            
        // });
        // this.animate();
    }

    init() {
        this.mode = this.modes.INITIALISING;

        this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 20, 10 );
        const ambient = new THREE.AmbientLight( 0x707070 ); // soft white light

		const material = new THREE.MeshPhongMaterial( { color: 0x00aaff } );
		
        this.cube = new THREE.Mesh( geometry, material );

        this.scene.add( this.cube );
        this.scene.add( light );
        this.scene.add( ambient );

        this.camera.position.z = 3;

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
		this.renderer.shadowMapDebug = true;
        this.container.appendChild( this.renderer.domElement );
        
        const loader = new THREE.FBXLoader();

        this.loadEnvironment(loader);
    }
    
    loadEnvironment(loader){
        const game = this;

        loader.load(`./assets/room.fbx`, function (object) {
            game.scene.add(object);

            object.receiveShadow = true;
			object.scale.set(0.8, 0.8, 0.8);
			object.name = "Environment";
					
			object.traverse( function ( child ) {
				if ( child.isMesh ) {
					if (child.name.includes('main')){
						child.castShadow = true;
						child.receiveShadow = true;
					}else if (child.name.includes('proxy')){
						child.material.visible = false;
					}
							
				}
			} );
        });
    }
	animate() {
        const game = this;
        requestAnimationFrame( function(){ game.animate(); } );

        this.cube.rotation.x += 0.01;
        //this.cube.rotation.y += 0.01;

        this.renderer.render( this.scene, this.camera );
    }
}

class Preloader {
    constructor(options) {
        this.assets = {};
		for(let asset of options.assets){
			this.assets[asset] = { loaded:0, complete:false };
			this.load(asset);
        }
        this.container = options.container;

        if (options.onprogress==undefined){
			this.onprogress = onprogress;
			this.domElement = document.createElement("div");
			this.domElement.style.position = 'absolute';
			this.domElement.style.top = '0';
			this.domElement.style.left = '0';
			this.domElement.style.width = '100%';
			this.domElement.style.height = '100%';
			this.domElement.style.background = '#000';
			this.domElement.style.opacity = '0.7';
			this.domElement.style.display = 'flex';
			this.domElement.style.alignItems = 'center';
			this.domElement.style.justifyContent = 'center';
			this.domElement.style.zIndex = '1111';
			const barBase = document.createElement("div");
			barBase.style.background = '#aaa';
			barBase.style.width = '50%';
			barBase.style.minWidth = '250px';
			barBase.style.borderRadius = '10px';
			barBase.style.height = '15px';
			this.domElement.appendChild(barBase);
			const bar = document.createElement("div");
			bar.style.background = '#2a2';
			bar.style.width = '50%';
			bar.style.borderRadius = '10px';
			bar.style.height = '100%';
			bar.style.width = '0';
			barBase.appendChild(bar);
			this.progressBar = bar;
			if (this.container!=undefined){
				this.container.appendChild(this.domElement);
			}else{
				document.body.appendChild(this.domElement);
			}
		}else{
			this.onprogress = options.onprogress;
		}
		
		this.oncomplete = options.oncomplete;
		
		const loader = this;
		function onprogress(delta){
			const progress = delta*100;
			loader.progressBar.style.width = `${progress}%`;
		}
    }

    load(url){
		const loader = this;
		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', url, true); 
		xobj.onreadystatechange = function () {
			  if (xobj.readyState == 4 && xobj.status == "200") {
				  loader.assets[url].complete = true;
				  if (loader.checkCompleted()){
					  if (loader.domElement!=undefined){
						  if (loader.container!=undefined){
							  loader.container.removeChild(loader.domElement);
						  }else{
							  document.body.removeChild(loader.domElement);
						  }
					  }
					  loader.oncomplete();	
				  }
			  }
		};
		xobj.onprogress = function(e){
			const asset = loader.assets[url];
			asset.loaded = e.loaded;
			asset.total = e.total;
			loader.onprogress(loader.progress);
		}
		xobj.send(null);
    }
    
    get progress(){
		let total = 0;
		let loaded = 0;
		
		for(let prop in this.assets){
			const asset = this.assets[prop];
			if (asset.total == undefined){
				loaded = 0;
				break;
			}
			loaded += asset.loaded; 
			total += asset.total;
		}
		
		return loaded/total;
    }
    
    checkCompleted(){
		for(let prop in this.assets){
			const asset = this.assets[prop];
			if (!asset.complete) return false;
		}
		return true;
	}
}