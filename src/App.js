import React , {Component} from 'react';
import './App.css';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/SignIn/Signin';
import Register from './components/Register/Register';
import FaceRecognization from './components/FaceRecognization/FaceRecognization';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';

const app = new Clarifai.App({
 apiKey: '05ee37cd88214df4963f118d57c19585'
});

const particlesOption = {
    particles: {
        number:{
        	value: 200,
        	density:{
        		enable: true,
        		value_area: 800
        	}
        }
    }
}

class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'Signin',
      isSignin: false,
      user:{
         id:'',
        name:'',
        email:'',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user: {
        id:data.id,
        name:data.name,
        email:data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  // componentDidMount(){
  //   fetch('http://localhost:3000/')
  //   .then(response => response.json())
  //   .then(console.log)
  // }

calculateFaceLocation = (data) => {
   const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
   const image = document.getElementById('inputimage');
   const width = Number(image.width);
   const height = Number(image.height);
   return{
     leftCol: clarifaiFace.left_col * width,
     topRow: clarifaiFace.top_row * height,
     rightCol: width - (clarifaiFace.right_col * width),
     bottomRow: height - (clarifaiFace.bottom_row * height)
   }
}

displayFaceBox = (box) => {
	this.setState({box: box});
}

onInputChange = (event) => {
    this.setState({input: event.target.value});
}

onButtonSubmit = async (event) => {
	await  this.setState({imageUrl: this.state.input});
	console.log(this.state.imageUrl,"reached")
	await app.models.predict("a403429f2ddf4b49b307e318f00e528b",this.state.input)
	.then(response => {
    if(response){
      fetch('http://localhost:3000/image',{
           method: 'put',
           headers: {'Content-Type': 'application/json'},
           body: JSON.stringify({
           id: this.state.user.id
        })
      })
      .then(response => response.json())
      .then(count => {
        console.log(count)
        this.setState(Object.assign(this.state.user, { entries: count }))
      })
    }
    this.displayFaceBox(this.calculateFaceLocation(response))
  })
    .catch(err => console.log("err",err));
}

onRouteChange = (route) => {
	if(route === 'signout')
	{
		this.setState({isSignin: false});
	}
	else if(route === 'home')
	{
		this.setState({isSignin: true});
	}
	this.setState({route: route});
}

 render(){
 	const {isSignin,route,imageUrl,box} = this.state;
  return (
    <div className="App">
          <Particles className='particles'
              params={particlesOption}/>
       <Navigation isSignin={isSignin} onRouteChange={this.onRouteChange}/>
       {route === 'home'?
         <div>
          <Logo/>
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm onInputChange={ this.onInputChange } onButtonSubmit={ this.onButtonSubmit }/>
          <FaceRecognization box={box} imageUrl={imageUrl}/>
         </div>
       :(
          route === 'Signin'
          ? <Signin  loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
       	)
       }
    </div>
  );
 }
}
export default App;
