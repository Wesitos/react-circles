"use strict"
var Workplace = React.createClass({
  render: function(){

    return(
      <div>
        <svg>
          {this.props.children}
        </svg>
      </div>
    );
  },
});

var Nodo = React.createClass({
  getDefaultProps: function(){
    return{
      radio: 20,
    };
  },
  getInitialState: function(){
    return {
      position: {
        //Not Antipattern. Is initial value only
        x: this.props.x0,
        y: this.props.y0,
      },
      clicked: false,
    };
  },
  onMouseDownHandler: function(event){
    this.setState({
      clicked: true,
      screenDelta:{
        x: this.state.position.x - event.screenX,
        y: this.state.position.y - event.screenY,
      },
    });
  },
  onMouseUpHandler: function(event){
    this.setState({clicked: false});
  },
  onMouseMoveHandler: function(event){
    if (this.state.clicked){
      var newX = event.screenX + this.state.screenDelta.x;
      var newY = event.screenY + this.state.screenDelta.y;

      this.setState({
        position:{
          x: newX,
          y: newY,
        }
      });
    }
  },

  render: function(){
    return(
      <g
        className="nodo"
        onMouseDown={this.onMouseDownHandler}
        onMouseUp={this.state.clicked?this.onMouseUpHandler:undefined}
        onMouseMove={this.state.clicked?this.onMouseMoveHandler:undefined}>
        <circle r={this.props.radio}
                cx={this.state.position.x}
                cy={this.state.position.y}/>
      </g>
    );
  },

});

React.render(<Workplace ><Nodo x0={100} y0={200}/></Workplace>,
             document.getElementById("container"));
