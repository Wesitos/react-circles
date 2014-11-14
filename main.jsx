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
      translate: [0,0],
    };
  },
  // Variables locales que no intervienen directamente en el renderizado
  clientOrigin: {x:0, y:0},
  mouseDownClient: {x:0, y:0},
  lastTranslate: [0,0],
  nodoId: "nodo-",
  // -----
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
                         id={this.nodoId + this.state.children.length}/>;
    var newChildrenState = this.state.children.concat(new_nodo);
    this.setState({children: newChildrenState});
    return new_nodo;
  },
  createOnClick: function(event){
    var translate = this.state.translate;
    this.creaNodo({
      position: {
        x: event.clientX - this.clientOrigin.x - translate[0],
        y: event.clientY - this.clientOrigin.y - translate[1],
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
        return React.addons.clonewithProps(child,{id: this.nodoId + i++});
      });
    }
    else if(this.props.children === undefined){
      childrenState = [];
    }
    else{
      childrenState = [React.addons.cloneWithProps(this.props.children, {id: this.nodoId + 0})];
    };

    this.setState({
      children: childrenState,
    });
  },
  onMouseMoveHandler: function(event){
    if (this.state.mouseDown ){
      switch(this.state.clickMode){
        case "move":
        case "link":
          if ( this.state.selected !== undefined){
            var element = this.state.selected;
            var translate = this.state.translate;
            element.setState({
              position: {
                x: event.clientX - this.clientOrigin.x - translate[0],
                y: event.clientY - this.clientOrigin.y - translate[1],
              },
            });
            this.forceUpdate();
          }
          else{
            var clientX = event.clientX;
            var clientY = event.clientY;

            var deltaX = this.mouseDownClient.x - clientX;
            var deltaY = this.mouseDownClient.y - clientY;
            var x = this.lastTranslate[0] - deltaX;
            var y = this.lastTranslate[1] - deltaY;
            this.setState({
              translate: [x,y],
            });
          };
          break;
        case "create":
        case "link":
      };
    };
  },
  onMouseDownHandler: function(event){
    // Almacenamos la posicion del mouse
    this.mouseDownClient = {x:event.clientX, y: event.clientY};
    this.lastTranslate = this.state.translate;
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
    var translate = this.state.translate;
    var transform = "translate(" + translate[0] + ',' + translate[1] + ")";
    var children = this.state.children.map(function(child){
      return React.addons.cloneWithProps(child, nodo_props);
    });
    // Onclick callback
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
    var i = 0;
    var linksElements = links.map(function(item){
      return <Link key={"link-"+ i++} pos1={item[0].state.position}  pos2={item[1].state.position}/>;
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
          <g id="objetos"
             transform={transform}>
            {linksElements}
            {children.map(function(child){
              return React.addons.cloneWithProps(child, {key:child.props.id})
             })}
          </g>
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
    DOMNode.parentNode.appendChild(DOMNode);
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
        id={this.props.id}
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
