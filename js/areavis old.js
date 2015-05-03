
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
    this.dateFormat = d3.time.format("%d-%m-%Y").parse;


	this.initVis();
    




}

AreaVis.prototype.initVis = function() {

	var that=this

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        // .style("border", "1px solid black")
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    
    this.svg.append("text")
        .attr("class","title")
        .attr("x", -20)
        .attr("y", -5)
        .text("Selected Businesses - Review Over Time:")


    //Set up x scale
    this.x = d3.time.scale()
            .range([0,this.width]);

    //Set up y scale
    this.y = d3.scale.linear()
            .range([this.height, 0]);

    //Set up x axis
    this.xAxis = d3.svg.axis()
                .scale(this.x)
                .orient("bottom");

    //Set up y axis
    this.yAxis = d3.svg.axis()
                .scale(this.y)
                .orient("left");

    //Define area graph
    this.area = d3.svg.area()
            .x(function (d){ return that.x(d.date)})
            .y0(this.height)
            .y1(function (d){ return that.y(d.count)})
            .interpolate("monotone")

    //Append x axis
    this.svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + this.height + ")")

    //Append y axis
    this.svg.append("g")
        .attr("class", "axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Daily Review Count");

    //Create initial paths for area graph
    //Create brushed area


    this.filterAndAggregate(this.reviewData);
}

AreaVis.prototype.updateVis = function(_data) {
    var that = this;

    // TODO: implement update graphs (D3: update, enter, exit)

    //Set up x and y scale domains
    console.log(d3.max(this.reviewsByDate, function(d){ return d.count}))
    this.x.domain(d3.extent(this.reviewsByDate, function(d) { return new Date(d.date); }));
    this.y.domain(d3.extent(this.reviewsByDate, function(d) { return d.count; }));
    
    //Call axis
    this.svg.select(".x.axis")
        .call(this.xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")

    this.svg.select(".y.axis")
        .call(this.yAxis)

    //Updates path
    var path = this.svg.selectAll(".area")
      .data([_data])

    path.enter()
      .append("path")
      .attr("class", "area")

    path
      .transition()
      .attr("d", this.area);

    path.exit()
      .remove();


/*    this.brush.x(this.x);
    this.svg.select(".brush")
        .call(this.brush)
        .selectAll("rect")
        .attr("height", this.height);*/

    //Create area graph

}

AreaVis.prototype.onSelectionChange = function (selectedBusinesses) {

    //Create array of brushed businesses
    this.selectedBusinesses = selectedBusinesses

    //Call wrangle data
    this.wrangleData()
        
}


AreaVis.prototype.wrangleData = function() {

    //Create an array for filtered reviews
    this.filterReviews = []

    //Find reviews that match selected businesses
    this.reviewData.forEach(function(d) {
        that.selectedBusinesses.forEach(function(e) {
            if (d.business_id == e) {
                that.filterReviews.push(d)
            }
        })
    })

    //Call filter and aggregate
    this.filterAndAggregate(this.filterReviews)

}

AreaVis.prototype.filterAndAggregate = function(data) {

    that = this;

    //Create a data variable
    this.data = data
    //Push all of the dates of data to an array
    this.data.forEach(function(d){
        d.countInfo.forEach(function(e){
        that.funNewArray.push(new Date(e.date));            
        })
    });

    //Create an array of unique dates
    var uniqueDate = this.funNewArray.filter(function(day, pos) {
        return that.funNewArray.indexOf(day) == pos;
        }); 
    uniqueDate.sort(function(a, b){
        return a.date - b.date;
    }); 

    //Create an empty array which will be filled with the count of reviews for dates
    uniqueDate.forEach(function(d){
        that.reviewsByDate.push({'date': /*new Date*/(d),
                            'count': 0})
    });
    console.log(this.reviewsByDate[1])
    console.log(/*new Date*/ (this.funNewArray[1]))
    //Add up all the reviews on each unique date
    this.reviewsByDate.forEach(function(d, i){
        that.funNewArray.forEach(function(e){
            if(d.date == new Date(e))
                d.count++;
        })
    });

    //Sort reviews by date array
/*    this.reviewsByDate.sort(function(a, b){
        return (new Date(a.date) - new Date(b.date));
    })
  

    this.reviewsByDate.forEach(function(d){
        d.date = new Date(d.date);
    });*/

    //Call update vis
    this.updateVis(this.reviewsByDate);

}