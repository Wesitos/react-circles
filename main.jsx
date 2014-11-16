"use strict";

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
      selectedId: undefined,
      links: [],
      mode: "move",
      translate: [0,0]
    };
  },
  nodoNum: 0,
  idName: "nodo-",
  originCoords: {x:0,y:0},
  modeList: [
    {value: "move", name: "Mover Nodos"},
    {value: "add", name: "Agregar Nodos"},
    {value: "delete", name: "Eliminar Nodos"},
    {value: "link", name: "Vincular Nodos"}
  ],
  mouseDownClient: {x:0, y:0},
  lastTranslate: [0,0],
  //-----
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
    switch(this.state.mode){
      case "move":
        if( this.state.mouseDown){
          if (selectedId === undefined){
            var clientX = event.clientX;
            var clientY = event.clientY;

            var deltaX = this.mouseDownClient.x - clientX;
            var deltaY = this.mouseDownClient.y - clientY;
            var x = this.lastTranslate[0] - deltaX;
            var y = this.lastTranslate[1] - deltaY;
            this.setState({
              translate: [x,y]
            });
          }
          else {
            var translate = this.state.translate;
            var newX = event.clientX - this.originCoords.x - translate[0];
            var newY = event.clientY - this.originCoords.y - translate[1];
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
              };});
            this.setState({data: newData});
          }};
        break;
    };
  },
  
  nodoMouseDownCallback: function(id){
    var self = this;
    var prevSelectedId = this.state.selectedId;
    // Deseleccionamos el nodo anterior
    var newData = this.state.data.map(function(child){
      if( child.id === prevSelectedId){
        return React.addons.update(child, {selected: {$set: false}});}
      else{
        return child;}});
    var newLinks = this.state.links;
      switch(this.state.mode){
        case "move":
          // Seleccionamos el nuevo nodo
          newData = newData.map( function(child){
            if (child.id === id ){
              return  React.addons.update(child, {selected: {$set: true}});}
            else{
              return child;};});
          break;
        case "add":
          var newX = this.mouseDownClient.x - this.originCoords.x - this.state.translate[0];
          var newY = this.mouseDownClient.y - this.originCoords.y - this.state.translate[1];
          var newId = this.idName + this.nodoNum++;
          newData = newData.concat(
            {position: {x: newX,
                        y: newY},
             selected: true,
             id: newId
            }
          );
          // Seleccionamos el nuevo nodo
          id = newId;
          break;
        case "link":
          if (prevSelectedId && id && (id !== prevSelectedId))
          {
            var id1 = prevSelectedId;
            var id2 = id;
            if (id2 < id1){
              // Los intercambiamos
              id2 = [id1, id1 = id2][0];
            };
            links = this.state.links.filter(function(link){
              return  !((link[0]===id1) && (link[1] === id2));
            });
            newLinks = links.concat({id1: id1, id2: id2});
            id = undefined;
          };
          break;
        case "delete":
          // eliminamos el nodo
          newData = this.state.data.filter(function(child){
            if (child.id === id){
              return false;}
            else{
              return true;}
          });
          // Eliminamos sus links
          newLinks = newLinks.filter(function(link){
            return !((link.id1 === id) || (link.id2 === id));
          });
          // el nuevo id es undefined
          id = undefined;
          break;
      };
      this.setState({
        selectedId: id,
        mouseDown: true,
        data: newData,
        links: newLinks
      });
    },
  
  onMouseUpHandler: function(event){
    this.setState({mouseDown: false});
  },
  onMouseDownHandler: function(){
    // Almacenamos la posicion del mouse
    this.mouseDownClient = {x:event.clientX, y: event.clientY};
    this.lastTranslate = this.state.translate;
    this.nodoMouseDownCallback(undefined);
  },

  menuOnChangeHandler: function(event){
    var newMode = event.target.value;
    this.setState({mode: newMode});
    switch(newMode){
      case "move":
        break;
      case "link":
        this.setState({selectedId: undefined});
        break;
    };
  },

  render: function(){
    var self = this;
    var translate = this.state.translate;
    var transform = "translate(" + translate[0] + ',' + translate[1] + ")";
    var nodosProps = this.state.data;
    // Esto es para mandar el nodo seleccionado al frente
    var nodosSelected = nodosProps.filter(function(child){
      return (child.selected === true);
    });
    var nodosUnselected = nodosProps.filter(function(child){
      return (child.selected !== true);
    });
    // -----
    nodosProps = nodosUnselected.concat( nodosSelected);
    var nodos = nodosProps.map(function(child){
      return <Nodo {... child}
                   mouseDownCallback={self.nodoMouseDownCallback}
                   key={child.id} />;
    });
    var linkList = this.state.links;
    var links = linkList.map(function(link){
      var pos1 = nodosProps.filter(function(child){
        return child.id === link.id1;
      })[0].position;
      var pos2 = nodosProps.filter(function(child){
        return child.id === link.id2;
      })[0].position;
      return <Link pos1={pos1} pos2={pos2}/>;
    });
    return (
      <div>
        <Menu listaOptions={this.modeList} handler={this.menuOnChangeHandler}/>
        <Indicator mousePos={this.state.mousePos} />
        <svg width="100%" height="100%"
             ref="svgElement"
             onMouseDown={this.onMouseDownHandler}
             onMouseUp={this.onMouseUpHandler}
             onMouseMove={this.onMouseMoveHandler}>
          <g transform={transform}>
            { links }
            { nodos }
          </g>
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
    event.stopPropagation();
    this.props.mouseDownCallback(this.props.id);
  },

  render: function(){
    var x = this.props.position.x;
    var y = this.props.position.y;
    var rad = this.props.radio;
    return (
      <g
        ref="svgGroup"
        onMouseDown={this.onMouseDownHandler}>
        <circle cx={x} cy={y} r={rad}
                fill="white"
                stroke={this.props.selected?"blue":"black"}
                strokeWidth={3} />
      </g>
    );
  }
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
  }
});

var Menu = React.createClass({
  propTypes: function(){
    return{
      listaOptions: React.Proptypes.arrayOf(
        React.PropTypes.shape({
          value: React.PropTypes.string,
          name: React.PropTypes.string
        })
      ).isRequired,
      handler: React.PropTypes.func.isRequired
    };
  },
  render: function(){
    var listaOptions = this.props.listaOptions;
    return(
      <select onChange={this.props.handler}>
        {listaOptions.map(function(child){
          return (
            <option value={child.value} key={child.value}>
            {child.name}
            </option>
          );
         })}
      </select>
    );
  }
});

var Indicator = React.createClass({
  render: function(){
    return(
      <div id="indicator">
        <span>{this.props.mousePos.x}</span>,
        <span>{this.props.mousePos.y}</span>
      </div>
    );
  }
});

React.render(<Workplace data={listaNodos} />, document.getElementById("container"));
