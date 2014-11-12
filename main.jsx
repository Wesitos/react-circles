/** @jsx React.DOM */
"use strict";
var Workplace = React.createClass({
  getInitialState: function(){
    return{
      nodo: {
        clickable: true,
        selectedCallback: this.selectedCallback,
      },
      clickable: false,
      clickDown: false,
    };
  },
  creaNodo: function(props_nodo){
    var new_nodo = <Nodo {... props_nodo}
                         key={this.state.children.length}/>;
    var newChildrenState = this.state.children.concat(new_nodo);
    this.setState({children: newChildrenState});
    return new_nodo;
  },
  creaNodoOnClick: function(event){
    this.creaNodo({
      position: {
        x: event.clientX - this.clientOrigin.x,
        y: event.clientY - this.clientOrigin.y,
      }
    });
    console.log("Crea Nodo!", event.clientX, event.clientY);
  },
  selectedCallback: function(element){
    this.setState({selected: element});
    element.setState({selected: true});
  },
  componentWillMount: function(){
    var i = 0;
    var childrenState
    if (Array.isArray(this.props.children)){
      childrenState = this.props.children.map( function(child){
        return child.props.key = i++;
      });
    }
    else if(this.props.children === undefined){
      childrenState = [];
    }
    else{
      childrenState = [React.addons.cloneWithProps(this.props.children, {key: 0})];
    };

    this.setState({
      children: childrenState,
    });
  },
  toogleClick: function(){
    var oldClickable = this.state.clickable;
    var oldNodoProps = this.state.nodo;
    this.setState({
      nodo: React.addons.update(this.state.nodo, {$merge: {clickable: oldClickable}}),
      clickable: (! oldClickable),
    }
    );
  },
  onMouseMoveHandler: function(event){
    if (this.state.mouseDown && this.state.selected){
      var element = this.state.selected;
      element.setState({
        position: {
          x: event.clientX - this.clientOrigin.x,
          y: event.clientY - this.clientOrigin.y,
        },
      });
    }
  },
  onMouseDownHandler: function(){
    this.setState({mouseDown: true});
  },
  onMouseUpHandler: function(){
    this.setState({mouseDown: false});
    if (this.state.selected){
      this.state.selected.setState({selected:false});
    };
    this.setState({selected: undefined});
  },
  setClientOrigin: function(){
    var svg = this.refs.svg_element.getDOMNode();
    var rect = svg.getClientRects()[0];
    this.clientOrigin = {x:rect.left, y: rect.top};
  },
  render: function(){
    var nodo_props = this.state.nodo
    var children = this.state.children.map(function(child){
      return React.addons.cloneWithProps(child, nodo_props);
    });
    return(
      <div>
        <button onClick={this.toogleClick}>Toogle</button>
        <svg width="100%" height="100%"
             ref="svg_element"
             onMouseDown={this.onMouseDownHandler}
             onMouseUp={this.onMouseUpHandler}
             onMouseMove={this.onMouseMoveHandler}
             onClick={this.state.clickable?this.creaNodoOnClick:undefined}>
          {children}
        </svg>
      </div>
    );
  },
  componentDidMount: function(){
    this.setClientOrigin();
  },
});

var Nodo = React.createClass({
  getDefaultProps: function(){
    return{
      radio: 20,
      draggable: true,
    };
  },
  getInitialState: function(){
    return {
      position: {
        //Not Antipattern. Is initial value only
        x: this.props.position.x,
        y: this.props.position.y,
      },
      selected: false,
    };
  },
  onMouseDownHandler: function(event){
    this.props.selectedCallback(this);
  },
  render: function(){
    var selected = this.state.selected;
    return(
      <g
        className="nodo"
        onMouseDown={this.onMouseDownHandler}>
        <circle r={this.props.radio}
                fill="white"
                stroke={selected?"blue":"black"}
                strokeWidth={3}
                cx={this.state.position.x}
                cy={this.state.position.y}/>
      </g>
    );
  },

});

var Link = React.Createclass({

})

React.render(<Workplace ><Nodo position={{x:100, y:100}}/></Workplace>,
             document.getElementById("container"));
