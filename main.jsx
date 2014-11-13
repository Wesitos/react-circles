"use strict";
var Workplace = React.createClass({
  getInitialState: function(){
    return{
      nodo: {
        clickable: true,
        selectedCallback: this.defaultCallback,
      },
      clickMode: "move", // 0: move, 1: create, 2: link
      links: [],
    };
  },
  onKeyPressHandler: function(event){
    var mode = "";
    switch(event.key){
      case 'c':
        mode = "create";
        break;
      case 'm':
        mode = "move";
        break;
      case 'l':
        mode = "link";
    };
    if (mode){
      this.menuCallback({target: {value: mode}});
    };
  },
  creaNodo: function(props_nodo){
    var new_nodo = <Nodo {... props_nodo}
                         key={this.state.children.length}/>;
    var newChildrenState = this.state.children.concat(new_nodo);
    this.setState({children: newChildrenState});
    return new_nodo;
  },
  createOnClick: function(event){
    this.creaNodo({
      position: {
        x: event.clientX - this.clientOrigin.x,
        y: event.clientY - this.clientOrigin.y,
      }
    });
  },
  createLink: function(nodo1, nodo2){
    this.setState({links: this.state.links.concat([[nodo1,nodo2]])});
  },
  linkCallback: function(element){
    var selectedList = this.selectedList;
    selectedList.push(element);
    if (selectedList.length == 3){
      selectedList.shift();
    };
    if (selectedList.length == 2 &&
        (selectedList[0] !== undefined && selectedList[1]!== undefined)){
          this.createLink(selectedList[0], selectedList[1]);
          this.selectedList = [];

          if (this.state.selected){
            this.state.selected.setState({selected:false});
          };
    }
    else{
      this.defaultCallback(element);
    };
  },
  defaultCallback: function(element){
    this.setState({
      selected: element,
      mouseDown: true,
    });
    if (this.state.selected){
      this.state.selected.setState({selected:false});
    };
    element.setState({selected: true});
  },
  componentWillMount: function(){
    var i = 0;
    var childrenState;
    if (Array.isArray(this.props.children)){
      childrenState = this.props.children.map( function(child){
        return React.addons.clonewithProps(child,{key: i++});
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
  onMouseMoveHandler: function(event){
    if (this.state.mouseDown && this.state.clickMode==="move" && this.state.selected){
      var element = this.state.selected;
      element.setState({
        position: {
          x: event.clientX - this.clientOrigin.x,
          y: event.clientY - this.clientOrigin.y,
        },
      });
      this.forceUpdate();
    }
  },
  onMouseDownHandler: function(event){
    if (this.state.selected){
      this.state.selected.setState({selected:false});
    };
    this.setState({
      selected: undefined,
      mouseDown: true
    });
  },
  onMouseUpHandler: function(event){
    this.setState({mouseDown: false});
  },
  moveOnClick: function(event){
    // No seleccionamos ningun elemento
    this.setState({selected:undefined});
  },
  // Define la diferencia entre el origin de coordenadas en el "cliente"
  // y el SVG
  setClientOrigin: function(){
    var svg = this.refs.svg_element.getDOMNode();
    var clientRect = svg.getBoundingClientRect();
    this.clientOrigin = {x:clientRect.left, y: clientRect.top};
  },
  // Hay que actualizar el origin de coordenadas al scrollear
  onScrollHandler: function(){
    this.setClientOrigin();
  },
  menuCallback: function(event){
    this.setState({clickMode: event.target.value});
      if (event.target.value === "link"){
        this.selectedList = [];
        this.setState({nodo: {selectedCallback: this. linkCallback}});
      }
    else{
      this.setState({nodo:{selectedCallback: this. defaultCallback}});
    };
  },
  render: function(){
    var nodo_props = this.state.nodo;
    var children = this.state.children.map(function(child){
      return React.addons.cloneWithProps(child, nodo_props);
    });
    var onClick;
    switch(this.state.clickMode){
        case "move":
        onClick = this.moveOnClick;
        break;
        case "create":
        onClick = this.createOnClick;
        break;
        case "link":
        onClick = undefined;
    };
    var links = this.state.links;
    var linksElements = links.map(function(item){
      return <Link pos1={item[0].state.position}  pos2={item[1].state.position}/>;
    });

    return(
      <div>
        <select value={this.state.clickMode} onChange={this.menuCallback}>
          <option value="move">Mover nodo</option>
          <option value="create">Crear nodo</option>
          <option value="link">Vincular nodos</option>
        </select>
        <svg width="100%" height="100%"
             ref="svg_element"
             tabIndex={1}
             onKeyPress={this.onKeyPressHandler}
             onMouseDown={this.onMouseDownHandler}
             onMouseUp={this.onMouseUpHandler}
             onMouseMove={this.onMouseMoveHandler}
             onClick={onClick}>
          {linksElements}
          {children}
        </svg>
      </div>
    );
  },
  componentDidMount: function(){
    this.setClientOrigin();
    window.addEventListener("scroll", this.onScrollHandler);
  },
  componentWillUnmount: function(){
    window.removeEventListener("scroll", this.onScrollHandler);
  },
});

var Nodo = React.createClass({
  getDefaultProps: function(){
    return{
      radio: 20,
      radioOnMouseOver: 22,
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
      mouseOver: false,
    };
  },
  onMouseDownHandler: function(event){
    event.stopPropagation();
    this.props.selectedCallback(this);
    this.moveToFront();
  },
  moveToFront: function(){
    var DOMNode = this.refs.svgGroup.getDOMNode();
    DOMNode.ownerSVGElement.appendChild(DOMNode);
  },
  onClickHandler: function(event){
    //Evitamos que el evento se propague al WorkPlace
    event.stopPropagation();
  },
  onMouseEnterHandler: function(){
    this.setState({mouseOver: true});
  },
  onMouseLeaveHandler: function(){
    this.setState({mouseOver: false});
  },
  render: function(){
    var selected = this.state.selected;
    var mouseOver = this.state.mouseOver;
    return(
      <g
        ref="svgGroup"
        className="nodo"
        onClick={this.onClickHandler}
        onMouseDown={this.onMouseDownHandler}
        onMouseEnter={this.onMouseEnterHandler}
        onMouseLeave={this.onMouseLeaveHandler}>
        <circle r={mouseOver?this.props.radioOnMouseOver:this.props.radio}
                fill="white"
                stroke={(selected || mouseOver)?"blue":"black"}
                strokeWidth={3}
                cx={this.state.position.x}
                cy={this.state.position.y}/>
      </g>
    );
  },
});

var Link = React.createClass({
  render: function(){
    var pos1 = this.props.pos1;
    var pos2 = this.props.pos2;
    return(
      <line x1={pos1.x} y1={pos1.y}
            x2={pos2.x} y2={pos2.y}
            ref="line"
            stroke="black"
            strokeWidth={2}/>
    );
  },
});

React.render(<Workplace ><Nodo position={{x:100, y:100}}/></Workplace>,
             document.getElementById("container"));
