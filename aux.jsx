"use-strict";

var listaNodos = [
  {
    position: {x: 100, y: 200}
  },
  {
    position: {x: 300, y:400}
  },
  {
    position: {x: 200, y:200}
  },
  {
    position: {x: 50, y:240}
  }
];

var Workplace = React.createClass({
  getDefaultProps: function(){
    return {
      data: []
    };
  },
  propTypes: function(){
    return {
      data: React.PropTypes.array
    };
  },
  getInitialState: function(){
    return{
      mousePos: {x:0, y:0},
      selectedId: undefined
    };
  },
  nodoNum: 0,
  idName: "nodo-",
  originCoords: {x:0,y:0},

  setOriginCoords: function(){
    var svgNode = this.refs.svgElement.getDOMNode();
    var clientRect = svgNode.getBoundingClientRect();
    this.originCoords = {x: clientRect.left, y: clientRect.top};
  },

  componentDidMount: function(){
    this.setOriginCoords();
  },

  componentWillMount: function(){
    var self = this;
    var newData = this.props.data.map(function(child){
      var id = self.idName + (self.nodoNum++);
      return React.addons.update(child, {id: {$set: id}});
    });
    this.setState({data: newData});
  },
  onMouseMoveHandler: function(event){
    // Set MousePosition
    var originX = this.originCoords.x;
    var originY = this.originCoords.y;
    this.setState({mousePos: {x:event.clientX - originX,
                              y:event.clientY - originY}});
    //
    var selectedId = this.state.selectedId;
    if (this.state.mouseDown && selectedId){
      var newX = event.clientX - this.originCoords.x;
      var newY = event.clientY - this.originCoords.y;
      var newData = this.state.data.map( function(child){
        if (child.id === selectedId){
          return React.addons.update(child, {position: {
            $set: {
              x: newX,
              y: newY
            }}});
        }
        else{
          return child;
        };
      });
      this.setState({data: newData});
    }},
  
  nodoMouseDownCallback: function(id){
    var self = this;
    var newData = this.state.data.map( function(child){
      var selectedId = self.state.selectedId;
      if ((id != selectedId) &&(child.id === selectedId)){
        return React.addons.update(child, {selected: {$set: false}});
      }
      if (child.id === id ){
        return  React.addons.update(child, {selected: {$set: true}});
      }
      else{
        return child;
      };
    });
    this.setState({
      selectedId: id,
      mouseDown: true,
      data: newData
    });
  },
  
  onMouseUpHandler: function(event){
    this.setState({mouseDown: false});
  },

  render: function(){
    var self = this;
    var nodos = this.state.data.map(function(child){
      return <Nodo {... child}
                   mouseDownCallback={self.nodoMouseDownCallback}
                   key={child.id} />;
    });

    return (
      <div>
        <Indicator mousePos={this.state.mousePos} />
        <svg width="100%" height="100%"
             ref="svgElement"
             onMouseUp={this.onMouseUpHandler}
             onMouseMove={this.onMouseMoveHandler}>
          { nodos }
        </svg>
      </div>
    );
  }
});

var Nodo = React.createClass({
  propTypes: function(){
    return {
      radio: React.PropTypes.number,
      position: React.PropTypes.shape({
        x: React.PropTypes.number,
        y: React.PropTypes.number
      }).isRequired,
      id: React.PropTypes.string.isRequired,
      selected: React.PropTypes.bool
    };
  },

  getDefaultProps: function(){
    return {
      radio: 20,
      selected: false
    };
  },
  onMouseDownHandler: function(event){
    this.props.mouseDownCallback(this.props.id);
  },

  render: function(){
    var x = this.props.position.x;
    var y = this.props.position.y;
    var rad = this.props.radio;
    return (
      <g
        onMouseDown={this.onMouseDownHandler}>
        <circle cx={x} cy={y} r={rad}
                fill="white"
                stroke={this.props.selected?"blue":"black"}
                strokeWidth={3} />
      </g>
    );
  }
});

var Indicator = React.createClass({
  render: function(){
    return(
      <div>
        <span>{this.props.mousePos.x}</span>,
        <span>{this.props.mousePos.y}</span>
      </div>
    );
  }
});

React.render(<Workplace data={listaNodos} />, document.getElementById("container"));
