
Declare_Any_Class( "ChickGame",  
  { 'construct'( context ) 
  	  { this.globals    = context.globals; 
  	  	context.globals.animate = true;
       this.define_data_members( 
       	{ 
       	frame_rate: 0, 
		time: 0,
		delta_time: 0,

		carOrigin: [vec2(18,-2), vec2(22,42), vec2(26,42), vec2(30,-2),
					vec2(42,42), vec2(50,-2), vec2(54,42), vec2(66,-2) ],
		carCoord:  [vec2(18,6), vec2(22,30), vec2(26,42), vec2(30,15),
						vec2(42,25), vec2(50,40), vec2(54,4), vec2(66,-15)],
		carZ_dir:  [1,  -5, -6,  3,    -4, 5, -5, 8],
	
		chickDir: 'u',
		chick_position: mult(identity(), translation(11, 0,20) ),
		chick_point: vec3(11,0,20),

		gameClear: false,
		clearCoord: identity(),
		isDead: false,
		endCoord: identity(),

		timeRestart: null
	} ); 

      var shapes = { 
                       'strip'           : new Square(),                               
                       'Cbody'			 : new ChickBody,
                       'box'			 : new Cube,
                       "ball"			 : new Grid_Sphere( 20, 20 ),
                       'tube'			 : new Capped_Cylinder (10, 10),
                       'cone'			 : new Closed_Cone (10,10),
                       'speech'		  	 : new Text_Line(30, "HI")
                   };

      var audio = new Audio('assets/Music.mp3');
      audio.loop = true;
      audio.play();
      this.submit_shapes( context, shapes );

        // *** Materials: *** 1st parameter:  Color (4 floats in RGBA format),
        // 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 
        // 5th: Smoothness exponent, 6th: Optional texture object, leave off for un-textured.
      this.define_data_members( {
            yellow    	: context.shaders_in_use["Phong_Model" ].material( Color( 1,.94, .21, 1 ), .4, .8, .8, 20 ),
            white    	: context.shaders_in_use["Phong_Model" ].material( Color( 1, 1, 1, 1 ), .4, .8, .1, 20 ),
            black    	: context.shaders_in_use["Phong_Model" ].material( Color( .01, .01,.01, 1 ), .4, .8, .8, 20 ),
            orange    	: context.shaders_in_use["Phong_Model" ].material( Color( .95, .46,.01, 1 ), .4, .8, .8, 20 ),
            brown 		: context.shaders_in_use["Phong_Model"].material( Color( .5, .2, .1, 1 ), .2, 1,  1, 40 ),
            green 		: context.shaders_in_use["Phong_Model"].material( Color(  .1 , 1, .1 , 1 ), .2, 1,  .4, 40 ),
            matte_black : context.shaders_in_use["Phong_Model" ].material( Color( .05,.05,.05, 1 ), 1, 1, .1, 20 ),  
			feather : context.shaders_in_use["Phong_Model"  ].material( Color( .1, .1, .05 ,1 ), .8, .5, .5, 40 ,context.textures_in_use["assets/feather.png"]),
			feather2 : context.shaders_in_use["Phong_Model"  ].material( Color( .2, .2, .05 ,1 ), .7, .5, .5, 40 ,context.textures_in_use["assets/fluffFeather.png"]),
			road : context.shaders_in_use["Phong_Model"  ].material( Color( 0, 0, 0 ,1 ), .7, .5, .5, 40 ,context.textures_in_use["assets/road.png"]),
			lined_road : context.shaders_in_use["Phong_Model"  ].material( Color( 0, 0, 0 ,1 ), .2, .7, .3, 2 ,context.textures_in_use["assets/linedRoad.png"]),
			text: context.shaders_in_use["Phong_Model"  ].material( Color( 0, 0, 0 ,1 ), .5, .7, .3, 2 ,context.textures_in_use["assets/text.png"]),
			grass : context.shaders_in_use["Phong_Model"  ].material( Color( 0, 0, 0 ,1 ), .7, .5, .5, 40 ,context.textures_in_use["assets/grass.png"]), 
                                } ); 
      },

      // Initialization after player has died
      'reset' () {
      	this.chickDir = 'u';
      	this.chick_position = mult(identity(), translation(11, 0,20));
      	this.chick_point = vec3(11,0,20);
      	this.gameClear = false;
      	this.clearCoord = identity();
      	this.isDead = false;
      	this.endCoord = identity();
      	this.timeRestart = null;
      },

	// Strings that this Scene_Component contributes to the UI:
      'update_strings'( user_interface_string_manager)   
      { 
      	user_interface_string_manager.string_map["frame"]    = "Frame rate: " + this.frame_rate + "fps" ;
      },

    // key bindings for player movement
    /*
	up - forward
	right / left - right left
	down - backwards
    */
    'init_keys' (controls) {
    	controls.add( "left", this, function() {
    		if (this.gameClear == false && this.isDead == false){
	    		if (this.chickDir == 'l' && this.chick_point[2] > 1 ) {
	    			this.chick_position = mult( this.chick_position, translation(2*this.delta_time, 0, 0));
	    		}
	    		else {
	    			var degRotate = 0;
	    			switch (this.chickDir) {
	    				case 'r': degRotate = 180; break;
	    				case 'u': degRotate = 90; 	break;
	    				case 'd': degRotate = -90;	break;
	    			}
	    			this.chickDir = 'l';    			
	    			this.chick_position = mult(this.chick_position, rotation(degRotate, 0,1,0));
	    		}
	    		this.chick_point = vec3(this.chick_position[0][3], this.chick_position[1][3],this.chick_position[2][3]);
	    	}
    	});
    	controls.add( "right", this, function() {
    		if (this.gameClear == false && this.isDead == false){
	    		if (this.chickDir == 'r' && this.chick_point[2] < 39)
	    			this.chick_position = mult( this.chick_position, translation(2*this.delta_time, 0, 0));
	    		else {
	    			var degRotate = 0;
	    			switch (this.chickDir) {
	    				case 'l': degRotate = -180; break;
	    				case 'u': degRotate = -90; 	break;
	    				case 'd': degRotate = 90;	break;
	    			}
	    			this.chickDir = 'r';    			
	    			this.chick_position = mult(this.chick_position, rotation(degRotate, 0,1,0));    			
	    		}
	    		this.chick_point = vec3(this.chick_position[0][3], this.chick_position[1][3],this.chick_position[2][3]);
	    	}
    	});
    	controls.add( "up", this, function() {
    		if (this.gameClear == false && this.isDead == false){
	    		if (this.chickDir == 'u' && this.chick_point[0] < 79){
	    			this.chick_position = mult( this.chick_position, translation(2*this.delta_time, 0, 0));
	    		}
	    		else{
	    			var degRotate =0;
	    			switch (this.chickDir) {
	    				case 'r': degRotate = 90; break;
	    				case 'l': degRotate = -90; 	break;
	    				case 'd': degRotate = 180;	break;
	    			}
	    			this.chickDir = 'u';    			
	    			this.chick_position = mult(this.chick_position, rotation(degRotate, 0,1,0));
	    		}
	    		this.chick_point = vec3(this.chick_position[0][3], this.chick_position[1][3],this.chick_position[2][3]);
	    	}
    	});
    	controls.add( "down", this, function() {
    		if (this.gameClear == false && this.isDead == false){
	    		if (this.chickDir == 'd' && this.chick_point[0] > 1)
	    			this.chick_position = mult( this.chick_position, translation(2*this.delta_time, 0, 0));
	    		else{
	    			var degRotate =0;
	    			switch (this.chickDir) {
	    				case 'r': degRotate = -90; break;
	    				case 'l': degRotate = 90; 	break;
	    				case 'u': degRotate = 180;	break;
	    			}
	    			this.chickDir = 'd';    			
	    			this.chick_position = mult(this.chick_position, rotation(degRotate, 0,1,0));
	    		}
	    		this.chick_point = vec3(this.chick_position[0][3], this.chick_position[1][3],this.chick_position[2][3]);
	    	}
    	});
    },


    // This function is called every frame
    // Calculate position and draw objects
    'display'( graphics_state )
      { var model_transform = identity();             
        // Lights
        graphics_state.lights = [ new Light( vec4(  30,  30,  34, 1 ), Color( 1, 1, 1, 1 ), 100000 ),      
                                  new Light( vec4( -10, -20, -14, 0 ), Color( 1, 1, .3, 1 ), 100    ) ];   

        //TIME VARS
        this.frame_rate = Math.round(1/(graphics_state.animation_delta_time/1000));
        this.delta_time = graphics_state.animation_delta_time/1000;
        this.time = graphics_state.animation_time / 1000;

        //CAMERA
        var eye = add(vec3(-15, 4, 13), this.chick_point);
        var v1 = subtract( this.chick_point, eye);
        var at2 = vec3(this.chick_point[0], this.chick_point[1], this.chick_point[2] + 1);
        var v2 = subtract(at2, eye);
        var norm = cross(v2, v1);
        graphics_state.camera_transform = lookAt( eye, this.chick_point, norm );

        //DRAW CHICK
        this.drawChick(graphics_state, this.chick_position, this.feather2);

		//DRAW CARS
		for (var i = 0; i < 8; i++) {
			this.drawCar(graphics_state, model_transform, this.carCoord[i][0], this.carCoord[i][1]);
			//update car positions
			this.carCoord[i][1] = this.carCoord[i][1] + this.carZ_dir[i]*this.delta_time;
			if(this.carCoord[i][1] > 42 || this.carCoord[i][1] < -2){
				this.carCoord[i][1] = this.carOrigin[i][1];
			}
		}

		//GROUND
        model_transform = identity();
  		model_transform = mult( model_transform, translation(2, -1, 2));
  		this.drawGround(graphics_state, model_transform);

  		//BIRD
  		model_transform = identity();  		
  		model_transform = mult( model_transform, translation(40, 0, 20));
		this.drawBird(graphics_state, model_transform, this.time, this.matte_black);

		//A RANDOM TREE
		model_transform = identity();
		model_transform = mult( model_transform, translation(10, 0, 6));
		this.drawTree(graphics_state, model_transform);

  		//COLLISION test if x and z coordinates of chick and cars are close enough to collide
  		if (this.isDead == false) {
	  		for (var i =0; i<8 ; i++) {
	  			var xdiff = this.chick_point[0] - this.carCoord[i][0];
	  			var zdiff = this.chick_point[2] - this.carCoord[i][1];
	  			var xLimit = 0;
	  			var zLimit = 0;
	  			if (this.chickDir == 'u' || this.chickDir == 'd'){
	  				xLimit = 2;
	  				zLimit = 2.4;
	  			}
	  			else{
	  				xLimit = 1.4;
	  				zLimit = 3;
	  			}
	  			if (Math.abs(xdiff) < xLimit && Math.abs(zdiff) < zLimit ) {
	  				this.isDead = true;
	  				var textCoord = mult(identity(), translation(this.chick_point[0], 0, this.chick_point[2]));
	  				textCoord = mult(textCoord, translation(0,3,-2));
	  				textCoord = mult(textCoord, rotation(-90, 0,1,0));
	  				textCoord =  mult(textCoord, scale(.5, .5, .5));
	  				this.endCoord = textCoord;
	  				//squish chick
	  				this.chick_position = mult(this.chick_position, translation(0, -1, 0));
	  				this.chick_position = mult(this.chick_position, scale(2, .2, 2));
	  				//set Restart Time
	  				this.timeRestart = this.time + 5;
	  			}	
	  		}
	  	}

  		//IF DEAD -> GAME OVER
  		if(this.isDead == true){
  			this.shapes.speech.set_string("GAME OVER");
	  		this.shapes.speech.draw(graphics_state, this.endCoord, this.text);
  		}

  		//RESET after 5 sec
  		if (this.timeRestart != null){
  			if(this.time > this.timeRestart){
  				this.reset();
  			}
  		}

  		//GAME CLEAR
		if(this.chick_point[0] >= 69){
			if (this.gameClear == false){
				this.gameClear = true;
				var textCoord =  mult(this.chick_position, translation(0,3,-5));
				textCoord =  mult(textCoord, rotation(-90, 0,1,0));
				textCoord =  mult(textCoord, scale(.35, .35, .35));
				this.clearCoord = textCoord;
				//set Restart Time
	  			this.timeRestart = this.time + 5;
			}
		}
		if (this.gameClear == true) {
			this.shapes.speech.set_string("Welcome to the other side!");
	  		this.shapes.speech.draw(graphics_state, this.clearCoord, this.text);
		}

      },


     // *** FUNCTIONS DEFININING  OBJECT SHAPES

    'drawCar' (graphics_state, model_transform, x , z) {
    	model_transform = mult(model_transform, translation(x,0,z));
        model_transform = mult(model_transform, translation(0,.7,0));
        model_transform = mult(model_transform, scale(1,1,2));
        this.shapes.box.draw(graphics_state, model_transform, this.orange);
        model_transform = mult(model_transform, scale(1,1,.5));
		model_transform = mult(model_transform, translation(-1,-1.2,1));
		this.drawWheel(graphics_state, model_transform);
		model_transform = mult(model_transform, translation(0,0,-2));
		this.drawWheel(graphics_state, model_transform);
		model_transform = mult(model_transform, translation(2,0,0));
		this.drawWheel(graphics_state, model_transform);
		model_transform = mult(model_transform, translation(0,0,2));
		this.drawWheel(graphics_state, model_transform);

    },

    'drawWheel'(graphics_state, model_transform){
		model_transform = mult(model_transform, scale(.3,.5,.5));
		model_transform = mult(model_transform,  rotation(90, 0, 1, 0));
        this.shapes.tube.draw(graphics_state, model_transform, this.black);
    },

    'drawBird'(graphics_state, model_transform, time, color){
    	
    	model_transform = mult( model_transform, translation(0, 5, 0));
    	var midpt = model_transform;
    	//text
   		model_transform = mult( model_transform, translation(-4, 2 + Math.sin(time*5), 0));
   		model_transform = mult( model_transform, scale(.3,.3, .3 ));
   		model_transform = mult( model_transform, rotation(-90, 0,1,0));
   		this.shapes.speech.set_string("Flight is sure nice!");
  		this.shapes.speech.draw(graphics_state, model_transform, this.text);
  		//rotation
  		model_transform = midpt;
  		model_transform = mult(model_transform, rotation( time*20, 0, 1, 0));
  		model_transform = mult( model_transform, translation(0, Math.sin(time*5) , 7));

    	var bird = model_transform;
  		model_transform = mult( model_transform, scale(2, .75, .75 ));
  		this.shapes.ball.draw(graphics_state, model_transform, color);  //body
  		model_transform = mult( model_transform, scale(1/2, 1/.75, 1/.75 ));

  		model_transform = mult( model_transform, translation(2.5, 0, 0));
  		model_transform = mult( model_transform, scale(.75, .75, .75 ));
  		this.shapes.ball.draw(graphics_state, model_transform, color);   //head
  		model_transform = mult( model_transform, scale(1/.75, 1/.75, 1/.75 ));

  		model_transform = mult( model_transform, translation(.75, 0, 0));
  		model_transform = mult( model_transform, rotation( 90, 0,1, 0));
  		model_transform = mult( model_transform, scale(.25,.25, .5 ));
  		this.shapes.cone.draw(graphics_state, model_transform, this.orange);

  		model_transform = bird;
    	this.draw_Wing(graphics_state, model_transform, time, color);
  		model_transform = mult(model_transform, rotation( 180, 0,1, 0));
  		model_transform = mult( model_transform, scale(-1, 1,1));
   		this.draw_Wing(graphics_state, model_transform, time,color);
    },

    'draw_Wing'(graphics_state, model_transform, time, color){
    	model_transform = mult( model_transform, translation(0, 0, .75));
  		model_transform = mult(model_transform, rotation( 30*Math.sin(time*5) -25, 1, 0, 0));
  		model_transform = mult( model_transform, translation(0, 0, .375));
  		model_transform = mult( model_transform, scale(1.5, .1,.375 ));
  		this.shapes.box.draw(graphics_state, model_transform,color);
  		model_transform = mult( model_transform, scale(1/1.5, 1/.1,1/.375 ));

		model_transform = mult( model_transform, translation(0, 0, .375));
		model_transform = mult(model_transform, rotation( 20*Math.sin(time*5) -20, 1, 0, 0));
  		model_transform = mult( model_transform, translation(.25,0,.375));
  		model_transform = mult( model_transform, scale(1.25, .1, .375 ));
  		this.shapes.box.draw(graphics_state, model_transform,color);
  		model_transform = mult( model_transform, scale(1, 1/.1, 1/.375 ));

		model_transform = mult( model_transform, translation(0, 0, .375));
		model_transform = mult(model_transform, rotation( 20*Math.sin(time*5) +15, 1, 0, 0));
  		model_transform = mult( model_transform, translation(.5,0,.375));
  		model_transform = mult( model_transform, scale(.5, .1, .375 ));
  		this.shapes.box.draw(graphics_state, model_transform,color);
  		model_transform = mult( model_transform, scale(1/.5, 1/.1, 1/.375 ));

    },

    'drawChick' (graphics_state, model_transform, texture)
    	{
    	model_transform = mult( model_transform, scale(1, 1, .4 ));
        var chickCoord = model_transform;
        this.shapes.Cbody.draw(graphics_state, model_transform, texture);
        model_transform = mult( model_transform, translation(.625, .625, 0));
        //eyes
        model_transform = mult( model_transform, translation(.125, .125, 1));
        model_transform = mult( model_transform, scale(.1, .1, .05 ));
        this.shapes.box.draw(graphics_state, model_transform, this.black);
        model_transform = mult( model_transform, scale(1/.1, 1/.1, 1/.05 ));
        model_transform = mult( model_transform, translation(0, 0, -2));
        model_transform = mult( model_transform, scale(.1, .1, .05 ));
        this.shapes.box.draw(graphics_state, model_transform, this.black);
        //beak
        model_transform = chickCoord;
        model_transform = mult( model_transform, translation(1, .5, 0));
        model_transform = mult( model_transform, scale(.25, .1, .75 ));
        this.shapes.box.draw(graphics_state, model_transform, this.orange);
        //legs
        model_transform = chickCoord;
        model_transform = mult( model_transform, translation(-.25, -.75, 0));
        model_transform = mult( model_transform, scale(.1, .25, .75 ));
        this.shapes.box.draw(graphics_state, model_transform, this.orange);
        model_transform = mult( model_transform, scale(1/.1, 1/.25, 1/.75 ));
        model_transform = mult( model_transform, translation(.2, -.15, 0));
        model_transform = mult( model_transform, scale(.2, .1, .75 ));
        this.shapes.box.draw(graphics_state, model_transform, this.orange);
    },

    'drawGround' (graphics_state, model_transform)
    {
    	model_transform = mult(model_transform, rotation(90, 1,0,0));
    	//model_transfrom = mult(model_transform, translation(10, 10, 10) );
		model_transform = mult( model_transform, scale(2, 2,  1));
		var length = 20;
		var width = 10;
  		for (var x=0 ; x<length ; x++) {
  			//grass
  			if (( x >=0 && x <=3) || (x>=17 && x <20)  || (x>=8 && x<=9) || (x==11)|| (x>=14 && x<=15) ) {
	  			for (var z=0; z < width; z++){
	  				this.shapes.strip.draw(graphics_state, model_transform, this.grass);
	  				model_transform = mult( model_transform, translation(0, 2, 0));
	  			}
	  		}
	  		else{ //road
	  			for (var z=0; z < width; z++) {
	  				this.shapes.strip.draw(graphics_state, model_transform, this.road);
	  				model_transform = mult( model_transform, translation(0, 2, 0));
	  			}
	  		}
  			model_transform = mult( model_transform, translation(2, -width*2, 0));
  		}
    },
    'drawTree' (graphics_state, model_transform){
  		model_transform = mult( model_transform, translation(0, 1, 0));
  		model_transform = mult(model_transform, rotation(90, 1,0,0));
  		model_transform = mult( model_transform, scale(.25, .25, 4));  		
  		this.shapes.tube.draw(graphics_state, model_transform, this.brown);
  		model_transform = mult( model_transform, scale(1/.25, 1/.25, 1/4)); 
  		model_transform = mult(model_transform, rotation(-90, 1,0,0));
  		model_transform = mult( model_transform, translation(0, 2, 0));
  		this.shapes.ball.draw(graphics_state, model_transform, this.green);
    }

  }, Scene_Component );  // End of class definition










  
  // *************************************************************************************************************************************
  // UCLA's Graphics Example Code (Javascript and C++ translations available), by Garett for CS174a.


Declare_Any_Class( "Debug_Screen",  // Debug_Screen - An example of a Scene_Component that our Canvas_Manager can manage.  Displays a text user interface.
  { 'construct'( context )
      { this.define_data_members( { string_map:    context.globals.string_map, start_index: 0, tick: 0, visible: false, graphics_state: new Graphics_State(),
                                    text_material: context.shaders_in_use["Phong_Model"].material( 
                                                                                Color(  0, 0, 0, 1 ), 1, 0, 0, 40, context.textures_in_use["text.png"] ) } );
        var shapes = { 'debug_text': new Text_Line( 35 ),
                       'cube':   new Cube() };
        this.submit_shapes( context, shapes );
      },
    'init_keys'( controls )
      { 
      	controls.add( "t",    this, function() { this.visible ^= 1;  } );
        this.controls = controls;
      },
      // Strings that this Scene_Component contributes to the UI:
    'update_strings'( debug_screen_object )   
      {
      	debug_screen_object.string_map["tick"]              = "Frame: " + this.tick++;
      },
    'display'( global_graphics_state )    // Leave these 3D global matrices unused, because this class is instead making a 2D user interface.
      { if( !this.visible ) return;
        var font_scale = scale( .02, .04, 1 ),
            model_transform = mult( translation( -.95, -.9, 0 ), font_scale ),
            strings = Object.keys( this.string_map );
  
        for( var i = 0, idx = this.start_index; i < 4 && i < strings.length; i++, idx = (idx + 1) % strings.length )
        { this.shapes.debug_text.set_string( this.string_map[ strings[idx] ] );
          this.shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material );  // Draw some UI text (each live-updated 
          model_transform = mult( translation( 0, .08, 0 ), model_transform );                      // logged value in each Scene_Component)
        }
        model_transform   = mult( translation( .7, .9, 0 ), font_scale );
        this.  shapes.debug_text.set_string( "Controls:" );
        this.  shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material );  // Draw some UI text

        for( let k of Object.keys( this.controls.all_shortcuts ) )
        { model_transform = mult( translation( 0, -0.08, 0 ), model_transform );
          this.shapes.debug_text.set_string( k );
          this.shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material );  // Draw some UI text (the canvas's key controls)
        }
      }
  }, Scene_Component );

Declare_Any_Class( "Example_Camera",                  // An example of a Scene_Component that our Canvas_Manager can manage.  Adds both first-person and
  { 'construct'( context, canvas = context.canvas )   // third-person style camera matrix controls to the canvas.
      { // 1st parameter below is our starting camera matrix.  2nd is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
        context.globals.graphics_state.set( translation(0, 0,-25), perspective(45, context.width/context.height, .1, 1000), 0 );
        this.define_data_members( { graphics_state: context.globals.graphics_state, thrust: vec3(), origin: vec3( 0, 5, 0 ), looking: false } );

        // *** Mouse controls: ***
        this.mouse = { "from_center": vec2() };                           // Measure mouse steering, for rotating the flyaround camera:
        var mouse_position = function( e ) { return vec2( e.clientX - context.width/2, e.clientY - context.height/2 ); };   
        canvas.addEventListener( "mouseup",   ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.anchor = undefined;              } } ) (this), false );
        canvas.addEventListener( "mousedown", ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.anchor = mouse_position(e);      } } ) (this), false );
        canvas.addEventListener( "mousemove", ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.from_center = mouse_position(e); } } ) (this), false );
        canvas.addEventListener( "mouseout",  ( function(self) { return function(e) { self.mouse.from_center = vec2(); }; } ) (this), false );  // Stop steering if the 
      },                                                                                                                                        // mouse leaves the canvas.
    'init_keys'( controls )   // init_keys():  Define any extra keyboard shortcuts here
      { controls.add( "Space", this, function() { this.thrust[1] = -1; } );     controls.add( "Space", this, function() { this.thrust[1] =  0; }, {'type':'keyup'} );
        controls.add( "z",     this, function() { this.thrust[1] =  1; } );     controls.add( "z",     this, function() { this.thrust[1] =  0; }, {'type':'keyup'} );
        controls.add( "w",     this, function() { this.thrust[2] =  1; } );     controls.add( "w",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'} );
        controls.add( "a",     this, function() { this.thrust[0] =  1; } );     controls.add( "a",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'} );
        controls.add( "s",     this, function() { this.thrust[2] = -1; } );     controls.add( "s",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'} );
        controls.add( "d",     this, function() { this.thrust[0] = -1; } );     controls.add( "d",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'} );
        controls.add( ",",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0,  1 ), this.graphics_state.camera_transform ); } );
        controls.add( ".",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0, -1 ), this.graphics_state.camera_transform ); } );
        controls.add( "o",     this, function() { this.origin = mult_vec( inverse( this.graphics_state.camera_transform ), vec4(0,0,0,1) ).slice(0,3)         ; } );
        controls.add( "r",     this, function() { this.graphics_state.camera_transform = identity()                                                           ; } );
        controls.add( "f",     this, function() { this.looking  ^=  1; } );
      },
    'update_strings'( user_interface_string_manager )   // Strings that this Scene_Component contributes to the UI:
      { var C_inv = inverse( this.graphics_state.camera_transform ), pos = mult_vec( C_inv, vec4( 0, 0, 0, 1 ) ),
                                                                  z_axis = mult_vec( C_inv, vec4( 0, 0, 1, 0 ) );
      },
    'display'( graphics_state )
      { var leeway = 70,  degrees_per_frame = .0004 * graphics_state.animation_delta_time,
                          meters_per_frame  =   .01 * graphics_state.animation_delta_time;
        if( this.mouse.anchor )                                                         // Third-person "arcball" camera mode: Is a mouse drag occurring?
        { var dragging_vector = subtract( this.mouse.from_center, this.mouse.anchor );  // Spin the scene around the world origin on a user-determined axis.
          if( length( dragging_vector ) > 0 )
            graphics_state.camera_transform = mult( graphics_state.camera_transform,    // Post-multiply so we rotate the scene instead of the camera.
                mult( translation( this.origin ),
                mult( rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ),
                      translation(scale_vec( -1, this.origin ) ) ) ) );
        }
        // First-person flyaround mode:  Determine camera rotation movement when the mouse is past a minimum distance (leeway) from the canvas's center.
        var offsets = { plus:  [ this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway ],
                        minus: [ this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway ] };
        if( this.looking ) 
          for( var i = 0; i < 2; i++ )      // Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
          { var velocity = ( ( offsets.minus[i] > 0 && offsets.minus[i] ) || ( offsets.plus[i] < 0 && offsets.plus[i] ) ) * degrees_per_frame;  // &&'s might zero these out.
            graphics_state.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), graphics_state.camera_transform );   // On X step, rotate around Y axis, and vice versa.
          }     // Now apply translation movement of the camera, in the newest local coordinate frame
        graphics_state.camera_transform = mult( translation( scale_vec( meters_per_frame, this.thrust ) ), graphics_state.camera_transform );
      }
  }, Scene_Component );

Declare_Any_Class( "Flag_Toggler",  // A class that just interacts with the keyboard and reports strings
  { 'construct'( context ) { this.globals    = context.globals; },
    'init_keys'( controls )   //  Desired keyboard shortcuts
      { controls.add( "ALT+g", this, function() { this.globals.graphics_state.gouraud       ^= 1; } );   // Make the keyboard toggle some
        controls.add( "ALT+n", this, function() { this.globals.graphics_state.color_normals ^= 1; } );   // GPU flags on and off.
        controls.add( "ALT+a", this, function() { this.globals.animate                      ^= 1; } );
      },
    'update_strings'( user_interface_string_manager )   // Strings that this Scene_Component contributes to the UI:
      { user_interface_string_manager.string_map["time"]    = "Animation Time: " + Math.round( this.globals.graphics_state.animation_time )/1000 + "s";
        user_interface_string_manager.string_map["animate"] = "Animation " + (this.globals.animate ? "on" : "off") ;
      },
  }, Scene_Component );

