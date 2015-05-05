
MapVis = function(_parentElement, _mapData, _reviewData, _businessData, colorby, _eventHandler) {

	this.parentElement = _parentElement;
    this.businessData = _businessData;
    this.reviewData = _reviewData;
    this.mapData = _mapData;
    this.eventHandler = _eventHandler;
    this.colorby = colorby
    this.graphData = this.businessData

	this.margin = {top:100, right:25, bottom:25, left:50};
	this.width = 580 - this.margin.left - this.margin.right;
	this.height = 400 - this.margin.top - this.margin.bottom;

	this.xScale = d3.scale.linear().range([this.width, 0]);
	this.yScale = d3.scale.linear().range([0, this.height]);
	this.colorScale = d3.scale.quantize()
    	.domain([1,5])
    	.range(d3.range(5)
    	.map(function(d) { return "q" + d + "-5"; }));

    this.reviewScale = d3.scale.linear().rangeRound([1,5])

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
/*        .attr("fill", "url(#img1)")*/
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

    //Add legend
    this.legend = this.svg.append("g")
        .attr('transform', 'translate(50,250)') 

    var stars = [1,2,3,4,5]
    var maxReviews = d3.max(this.businessData, function(d) {
    	return d.review_count
    })
    var newReviews = []

    for (i=1; i<6; i++) {
    	newReviews.push(Math.round(maxReviews/5*i))
    }

    this.legend.selectAll("rect")
        .data(stars)
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 12)
        .attr("x", function(d,i) {
            return i*20 - 12
        })
        .attr("y", 0)
        .attr("class", function(d){
            return that.colorScale(d)
            })

    this.legend.selectAll("text")
        .data(stars)
        .enter()
        .append("text")
        .attr("class", "legendtext")
        .attr("x", function(d,i) {
            return i*20 - 6
        })
        .attr("y", 25)
        .text(function(d) {
            return d
        })

    this.legend.selectAll("text2")
        .data(newReviews)
        .enter()
        .append("text")
        .attr("class", "legendtext")
        .attr("x", function(d,i) {
            return i*20-10
        })
        .attr("y", -5)
        .text(function(d) {
            return d
        })

    this.svg.append("text")
    	.attr("class", "legendtext")
    	.attr("x", -15)
    	.attr("y", 275)
    	.text("Rating")

	this.svg.append("text")
    	.attr("class", "legendtext")
    	.attr("x", -20)
    	.attr("y", 245)
    	.text("# Reviews <")

    //Draw Map
	var projection = d3.geo.mercator()
	    .center([0, 10])
	    .scale(10)
	    .rotate([-180,0]);

	var mapPath = d3.geo.path()
	    .projection(projection);

	// Translate topjson to feature elements
	var borders = topojson.feature(this.mapData, this.mapData.objects.BOUNDARY_CDDNeighborhoods).features

	// Draw path elements
    var path = this.svg.selectAll(".area")
      .data(borders)

    path.enter()
      .append("path")
      .attr("d", mapPath)
      .attr("class", "area")

	//Filter, aggregate, modify data
	this.updateVis(this.graphData);

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

	this.graphData.forEach(function(d) {
		if ((d.latitude) >= (that.extent[0][1]) &&
		 (d.latitude) <= (that.extent[1][1]) &&
		 (d.longitude) >= (that.extent[0][0]) &&
		 (d.longitude) <= (that.extent[1][0])) {

	 			that.selectedBusinesses.push(d.business_id)
	 	}
	 })

	$(this.eventHandler).trigger("selectionChanged", [this.selectedBusinesses])

}

MapVis.prototype.onDropDownChange = function(colorby, mapby) {

	this.colorby = colorby
	this.mapby = mapby

	d3.selectAll(".nodes").remove();

	this.wrangleData()
}

MapVis.prototype.wrangleData = function() {
	var that = this

	//Implement data filtering
	function businessCategory(d) {
		return d.category === that.mapby
	}

	var filtered = []
	if (this.mapby == "all") {
		filtered = this.businessData
	}
	else filtered = this.businessData.filter(businessCategory)

	//Implement data filters
	this.updateVis(filtered);
}

MapVis.prototype.onSelectionChange = function (business_id){


	this.node.classed("node--picked", function(d){
		if (d.business_id == business_id)
			return true;

	})
}

MapVis.prototype.updateVis = function(data) {

	var that = this;
/*	this.graphData = data*/
	//Update scale domains
	this.xScale.domain(d3.extent(this.businessData, function(d){
		return d.longitude}));
	this.yScale.domain(d3.extent(this.businessData, function(d){
		return d.latitude}));
	this.reviewScale.domain([0,d3.max(this.businessData, function(d) {
			return d.review_count
		})])

	// console.log(this.colorby)

	//Add businesses to maps
	this.node = this.svg.selectAll(".nodes")
				.data(data)

	//add nodes
	this.node
		.enter()
		.append("g")


	//remove extra nodes
	this.node
		.exit()
		.remove()

	//append circles to nodes

	this.node
		.append("circle")		
		.attr("class", "nodes")

	/*.selectAll("circle")*/
		.attr("r", 4)
		.attr("cx", function(d){
			return that.xScale(d.longitude);
		})
		.attr("cy", function(d){
			return that.yScale(d.latitude);
		})
		.on("mouseover", this.tip.show)
		.on("mouseout", this.tip.hide)

	//update node attributes
	this.node
		// .transition()
		.attr("class", function(d) {
			if (that.colorby == "rating")
				return that.colorScale(d.stars)
			//works when number is selected but not when it is changed to number
			if (that.colorby == "number") {
				return that.colorScale(that.reviewScale(d.review_count))
			}
		})
		



	//Update path elements

	//Update brushing



}



