
MapVis = function(_parentElement, _mapData, _reviewData, _businessData, _userData, _eventHandler) {

	this.parentElement = _parentElement;
    this.businessData = _businessData;
    this.reviewData = _reviewData;
    this.mapData = _mapData
    this.eventHandler = _eventHandler;

	this.margin = {top:50, right:100, bottom:25, left:50};
	this.width = 700 - this.margin.left - this.margin.right;
	this.height = 400 - this.margin.top - this.margin.bottom;

	this.xScale = d3.scale.linear().range([this.width, 0]);
	this.yScale = d3.scale.linear().range([0, this.height]);
	this.colorScale = d3.scale.quantize()
    	.domain([1,5])
    	.range(d3.range(5)
    	.map(function(d) { return "q" + d + "-5"; }));

	this.initVis();
	this.updateVis();
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
        .style("border", "1px solid black")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        
    this.svg.append("text")
    	.attr("class","title")
    	.text("Harvard and MIT Yelp Businesses")

	//Add brushed element
	this.brushX = d3.scale.linear().range([0, this.width]).domain(d3.extent(this.businessData, function(d){ return d.longitude; }))
    this.brushY = d3.scale.linear().range([0, this.width]).domain(d3.extent(this.businessData, function(d){ return d.latitude; }))
    
    this.brush = d3.svg.brush()
    	.x(this.brushX)
    	.y(this.brushY)
        .on("brush", function() {
            that.brushed();
            })

    this.svg.append("g")
        .attr("class","brush")
        .call(this.brush)

    //Draw Map
	var projection = d3.geo.mercator()
	    .center([0, 10])
	    .scale(10)
	    .rotate([-180,0]);

	var path = d3.geo.path()
	    .projection(projection);


	// Translate topjson to feature elements
	var borders = [];
	(topojson.feature(this.mapData, this.mapData.objects.BOUNDARY_CDDNeighborhoods).features).forEach(function(d){
		borders.push(d)
	})

	// Draw path elements
    // this.svg.append("g")
    //   .attr("classs", "borders")
    //   .selectAll("path")
    //   .data(borders)
    //   .enter()
    //   .append("path")
    //   .attr("d", path);
    //   .attr("transform", "translate(0, 0)")



/*	var filteredData = [];

	this.businessData.forEach(function(d){
		filteredData.push({'longitude' : d.longitude,
							'latitude' : d.latitude});
	});*/

	//Filter, aggregate, modify data
	this.updateVis();

}

MapVis.prototype.brushed = function() {

	that = this
	this.extent = []
	this.selectedBusinesses = [];

	if (this.brush.empty()) {
		this.extent = [[this.xMin,this.yMin],[this.xMax,this.yMax]]
		}
	else {
		this.extent = this.brush.extent()
	}


	for(i=0; i<this.businessData.length; i++) {

		if (this.businessData[i].latitude >= this.extent[0][1] &&
			this.businessData[i].latitude <= this.extent[1][1] &&
			this.businessData[i].longitude >= this.extent[0][0] &&
			this.businessData[i].longitude <= this.extent[1][0]) {

				this.selectedBusinesses.push(this.businessData[i].business_id)
		}
	}

	console.log(this.selectedBusinesses)
	console.log(this.selectedBusinesses.length)

	$(this.eventHandler).trigger("selectionChanged", [this.selectedBusinesses])

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

	//Add businesses to maps
	var node = this.svg.selectAll(".node")
				.data(this.businessData)
				.enter()
				.append("g")
				.attr("class", "node")

	node.append("circle")
		.attr("r", 4)
		.attr("cx", function(d){
			return that.xScale(d.longitude);
		})
		.attr("cy", function(d){
			return that.yScale(d.latitude);
		})
		.attr("class", function(d) {
			return that.colorScale(d.stars)
		})

	//Update path elements

	//Update brushing



}



