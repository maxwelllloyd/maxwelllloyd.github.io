
MapVis = function(_parentElement, _mapData, _reviewData, _businessData, colorby, _eventHandler) {

	this.parentElement = _parentElement;
    this.businessData = _businessData;
    this.reviewData = _reviewData;
    this.mapData = _mapData;
    this.eventHandler = _eventHandler;
    this.colorby = colorby

	this.margin = {top:100, right:25, bottom:25, left:50};
	this.width = 580 - this.margin.left - this.margin.right;
	this.height = 400 - this.margin.top - this.margin.bottom;

	this.xScale = d3.scale.linear().range([this.width, 0]);
	this.yScale = d3.scale.linear().range([0, this.height]);
	this.colorScale = d3.scale.quantize()
    	.domain([1,5])
    	.range(d3.range(5)
    	.map(function(d) { return "q" + d + "-5"; }));

    this.reviewScale = d3.scale.linear().rangeRound([0,4])

	this.initVis();
	// this.updateVis();
}

MapVis.prototype.initVis = function() {

	var that=this

	//Define scales
	this.xMax = d3.max(this.businessData, function(d){
		return d.longitude;
	});

	this.xMin = d3.min(this.businessData, function(d){
		return d.longitude;
	});

	this.yMax = d3.max(this.businessData, function(d){
		return d.latitude;
	});

	this.yMin = d3.min(this.businessData, function(d){
		return d.latitude
	});

	//Define SVG
	this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        // .style("border", "1px solid black")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        
    this.svg.append("text")
    	.attr("class","title")
    	.attr("x", -20)
    	.attr("y", -25)
    	.text("Cambridge, MA:")

    this.svg.append("text")
    	.attr("class", "subheading")
    	.attr("x", -20)
    	.attr("y", -10)
    	.text("(brush map for detailed information)")

	//Add brushed element
	this.brushX = d3.scale.linear().range([this.width,0]).domain(d3.extent(this.businessData, function(d){ return d.longitude; }))
    this.brushY = d3.scale.linear().range([0,this.height]).domain(d3.extent(this.businessData, function(d){ return d.latitude; }))
    
    this.brush = d3.svg.brush()
    	.x(this.brushX)
    	.y(this.brushY)
        .on("brushend", function() { that.brushed()})

    this.svg.append("g")
        .attr("class","brush")
        .call(this.brush)

    //Add tooltip
    this.tip = d3.tip()
    	.attr("class","tooltip")
    	.offset([-10,0])
    	.html(function(d) {
    		return "Latitude:" + d.latitude + "<br>" +  "Longitude:" + d.longitude + "<br>" + "Name:" + d.name
    	})

    this.svg.call(this.tip)

    //Draw Map
	var projection = d3.geo.mercator()
	    .center([0, 10])
	    .scale(10)
	    .rotate([-180,0]);

	var mapPath = d3.geo.path()
	    .projection(projection);

	console.log(this.mapData)

	// Translate topjson to feature elements
	var borders = topojson.feature(this.mapData, this.mapData.objects.BOUNDARY_CDDNeighborhoods).features
	console.log(borders)

	// Draw path elements

    var path = this.svg.selectAll(".area")
      .data(borders)

    path.enter()
      .append("path")
      .attr("d", mapPath)
      .attr("class", "area")

	//Filter, aggregate, modify data
	this.updateVis();

}

MapVis.prototype.brushed = function() {

	var that = this
	this.extent = []
	this.selectedBusinesses = [];
	this.isbrushed = [];
	this.isnotbrushed = [];

	if (this.brush.empty()) {
		this.extent = [[this.xMin,this.yMin],[this.xMax,this.yMax]]
		this.node.classed("node", function(d) {
			that.isnobrushed = d.latitude >= 50
			return that.isnotbrushed
		})
		}
	else {
		this.extent = this.brush.extent()
		this.node.classed("node--selected", function(d) {
		 	that.isbrushed = 
			 (d.latitude) >= (that.extent[0][1]) &&
			 (d.latitude) <= (that.extent[1][1]) &&
			 (d.longitude) >= (that.extent[0][0]) &&
			 (d.longitude) <= (that.extent[1][0])
			return that.isbrushed
		})
	}

	// get_button = d3.select(".clear-button")
	// if(get_button.empty() == true) {
	// 	clear_button = this.svg.append('text')
	// 	  .attr("y", 460)
	//       .attr("x", 825)
	//       .attr("class", "clear-button")
	//       .text("Clear Brush");

	// clear_button.on('click', function(){
	//     // x.domain([0, 50])
	//     this.extent = [[this.xMin,this.yMin],[this.xMax,this.yMax]]
	//     clear_button.remove();
 // });
	// }

	this.businessData.forEach(function(d) {
		if ((d.latitude) >= (that.extent[0][1]) &&
		 (d.latitude) <= (that.extent[1][1]) &&
		 (d.longitude) >= (that.extent[0][0]) &&
		 (d.longitude) <= (that.extent[1][0])) {

	 			that.selectedBusinesses.push(d.business_id)
	 	}
	 })


 


	$(this.eventHandler).trigger("selectionChanged", [this.selectedBusinesses])

}

MapVis.prototype.onDropDownChange = function(colorby) {

	this.colorby = colorby

	this.updateVis()
}

MapVis.prototype.wrangleData = function() {
	var that = this

	//Implement data filters
	this.updateVis();
}

MapVis.prototype.updateVis = function() {

	var that = this;

	//Update scale domains
	this.xScale.domain(d3.extent(this.businessData, function(d){
		return d.longitude}));
	this.yScale.domain(d3.extent(this.businessData, function(d){
		return d.latitude}));

	this.reviewScale.domain([0,d3.max(this.businessData, function(d) {
			return d.review_count
		})])

	console.log(this.colorby)

	if (this.colorby == "rating") {
		this.colorScale = d3.scale.quantize()
	    	.domain([1,5])
	    	.range(d3.range(5)
	    	.map(function(d) { return "q" + d + "-5"; }));
    }
	if (this.colorby == "number") {
		this.colorScale = d3.scale.quantize()
	    	.domain([0,4])
	    	.range(d3.range(5)
	    	.map(function(d) { return "q" + d + "-5"; }));
    }


	//Add businesses to maps
	this.node = this.svg.selectAll(".node")
				.data(this.businessData)
				.enter()
				.append("g")
				.attr("class", "node")

	this.node.append("circle")
		.attr("r", 4)
		.attr("cx", function(d){
			return that.xScale(d.longitude);
		})
		.attr("cy", function(d){
			return that.yScale(d.latitude);
		})
		.attr("class", function(d) {
			if (that.colorby = "rating")
				return that.colorScale(d.stars)
			//works when number is selected but not when it is changed to number
			if (that.colorby = "number") {
				return that.colorScale(that.reviewScale(d.review_count))
			}
		})
		.on("mouseover", this.tip.show)
		.on("mouseout", this.tip.hide)

	//Update path elements

	//Update brushing



}



