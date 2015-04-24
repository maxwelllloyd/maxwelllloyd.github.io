
AreaVis = function(_parentElement, _reviewData, _businessData, _eventHandler) {

	this.parentElement = _parentElement;
    this.businessData = _businessData;
    this.reviewData = _reviewData;
    this.eventHandler = _eventHandler;

    this.margin = {top:25, right:25, bottom:50, left:50};
    this.width = 700 - this.margin.left - this.margin.right
    this.height = 400 - this.margin.top - this.margin.bottom

    this.funNewArray = [];

    this.reviewsByDate = [];
    this.dateFormatter = d3.time.format("%Y-%m-%d");


	this.initVis();
    this.filterAndAggregate();



}

AreaVis.prototype.initVis = function() {

	var that=this

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .style("border", "1px solid black")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    
    this.svg.append("text")
        .attr("class","title")
        .text("Number of Reviews Over Time")

    this.x = d3.time.scale()
            .range([0,this.width]);
    this.y = d3.scale.log()
            .range([this.height, 0]);

    this.xAxis = d3.svg.axis()
                .scale(this.x)
                .orient("bottom");

    this.yAxis = d3.svg.axis()
                .scale(this.y)
                .orient("left");

    //Create initial paths for area graph
    //Create brushed area
}

AreaVis.prototype.updateVis = function() {
    var that = this;

    // TODO: implement update graphs (D3: update, enter, exit)
    this.x.domain(d3.extent(this.reviewsByDate, function(d) { return d.date; }));
    this.y.domain(d3.extent(this.reviewsByDate, function(d) { return d.count; }));
    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)


    this.area = d3.svg.area()
            .x(function (d){ return that.x(d.date)})
            .y0(this.height)
            .y1(function (d){ return that.y(d.count)})
            .interpolate("monotone")


    var path = this.svg.selectAll(".area")
      .data([this.reviewsByDate])

    path.enter()
      .append("path")
      .attr("class", "area")
      .attr("d", this.area);


/*    this.brush.x(this.x);
    this.svg.select(".brush")
        .call(this.brush)
        .selectAll("rect")
        .attr("height", this.height);*/

    //Create area graph

}

AreaVis.prototype.onSelectionChange = function () {

    //call wrangle data function and pass in business from force layout click
    //update on brushed time

}


AreaVis.prototype.wrangleData = function() {

    //Implement data filters
}

AreaVis.prototype.filterAndAggregate = function() {

    that = this;


    this.reviewData.forEach(function(d){
        that.funNewArray.push((d.date));
    });

    var uniqueDate = this.funNewArray.filter(function(day, pos) {
        return that.funNewArray.indexOf(day) == pos;
        });  

    uniqueDate.forEach(function(d){
        that.reviewsByDate.push({'date': that.dateFormatter.parse(d),
                            'count': 0})
    });

    console.log(this.dateFormatter.parse(that.reviewData[1].date))
    console.log(this.reviewsByDate[1].date)

    var countArray = d3.range(this.reviewsByDate.length).map(function(){
        return 0;
    });
    
/*    this.reviewsByDate.forEach(function(d, i){
        that.reviewData.forEach(function(e){
            if(d.date == that.dateFormatter.parse(e.date))
                countArray[i]++;
        })
    });*/
    console.log(countArray)
/*    this.updateVis();*/
    //Implement filters
    //Aggregate for # of reviews and # of stars
}