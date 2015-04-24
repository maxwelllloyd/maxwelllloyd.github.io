
ForceVis = function(_parentElement, _mapData, _reviewData, _businessData, _userData, _eventHandler) {

	this.parentElement = _parentElement;
    this.businessData = _businessData;
    this.reviewData = _reviewData;
    this.eventHandler = _eventHandler;

    this.margin = {top:50, right:50, bottom:25, left:100};
    this.width = 700 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

	this.initVis();

    this.starScale = d3.scale.quantize()
        .domain([1,5])
        .range(d3.range(5)
        .map(function(d) { return "q" + d + "-5"; }));

    this.colorScale = d3.scale.category20();
}

ForceVis.prototype.initVis = function() {

	var that=this

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .style("border", "1px solid black")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    this.svg.append("text")
        .attr("class","title")
        .text("Brushed Businesses")


    this.updateVis(this.businessData)

}

ForceVis.prototype.updateVis = function(data) {

    this.nodeData = data

    var that = this

    //Define nodes
    var node = this.svg.selectAll(".node")
      .data(that.nodeData)

    //Add nodes
    node
        .enter()
        .append("g")
        .attr("class", "node");

    //Remove nodes
    node.exit()
        .remove();

    node
        .append("circle")
        .attr("r", 5)
        // .style("fill", function(d){
        //     return that.colorScale(d.categories)
        //     })

    // Start force layout
    function forceLayout(d){
        force
            .nodes(that.nodeData)
            .start()
    }

    //Define force
    var force = d3.layout.force()
        .size([that.width, that.height])
        .linkStrength(0.1)
        .friction(0.9)
        .linkDistance(20)
        .charge(-30)
        .gravity(0.1)
        .theta(0.8)
        .alpha(0.1)
        .on("tick", tick)
        .on("start", function(d) {})
        .on("end", function(d) {});

    //Define tick function
    function tick (d){
        var k = 0.1 * d.alpha

        forceUpdate(10)
    }

    //Update function called from tick function 
    function forceUpdate(dur) {
        node
            .transition()
            .duration(dur)
            .attr("transform", function(d) { 
                return "translate("+d.x+","+d.y+")";});        
    }

    forceLayout();


    //Create event handler for force grouping
    //Create event handler for force coloring
    //Create event handler for force clicking


}

ForceVis.prototype.onSelectionChange = function (selectedBusinesses) {

    //call wrangle data function and pass in filters from brushed

    this.selectedBusinesses=selectedBusinesses
    var that = this

    this.wrangleData()
}


ForceVis.prototype.wrangleData = function() {

    this.filterBusinesses = []

    var that = this

    //Implement data filters
    this.businessData.forEach(function(d) {
      that.selectedBusinesses.forEach(function(e) {
        if(d.business_id == e) {
            that.filterBusinesses.push(d)
        }
      })
    })

    this.updateVis(this.filterBusinesses)

}

ForceVis.prototype.filterAndAggregate = function() {

    //Implement filters
}

